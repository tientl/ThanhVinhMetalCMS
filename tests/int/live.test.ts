import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import type { Payload } from 'payload'

import { GET as liveCountsGet } from '@/app/(frontend)/api/live-counts/route'
import { NOOP_RESTORE_MESSAGE } from '@/hooks/versions'
import { getLiveCounts, liveEvents, NOTIFY_DELAY_MS } from '@/lib/liveEvents'

import { as, asGuest, asRoot, getTestPayload, getUser } from './helpers'

let payload: Payload
// Tiền tố không chứa "zz": api.test.ts dọn bằng like 'Zz%' / 'zz-%' (Payload so khớp kiểu chứa, không phân biệt hoa thường).
const PREFIX = 'Livetest'

/** Đếm số lần kênh realtime phát trong lúc chạy `fn` (tin báo đi trễ NOTIFY_DELAY_MS để chờ commit). */
const countEvents = async (fn: () => Promise<unknown>) => {
  let hits = 0
  const onChange = () => hits++
  liveEvents.on('change', onChange)
  try {
    await fn()
    await new Promise((r) => setTimeout(r, NOTIFY_DELAY_MS + 200))
  } finally {
    liveEvents.off('change', onChange)
  }
  return hits
}

const authHeaders = async () => {
  const user = await getUser('editor')
  const { token } = await payload.login({ collection: 'users', data: { email: user.email, password: 'Test@2026' } })
  return { Authorization: `JWT ${token}` }
}

beforeAll(async () => {
  payload = await getTestPayload()
  await payload.delete({ collection: 'quote-requests', where: { name: { like: `${PREFIX}%` } }, ...asRoot })
})

describe('kênh realtime cho trang quản trị', () => {
  it('yêu cầu báo giá mới vẫn phát sự kiện và làm tăng số Mới', async () => {
    const before = await getLiveCounts(payload)
    const hits = await countEvents(() =>
      payload.create({ collection: 'quote-requests', data: { name: `${PREFIX} Khách`, phone: '0946272467' }, ...asRoot }),
    )
    expect(hits).toBe(1)
    expect((await getLiveCounts(payload)).newQuotes).toBe(before.newQuotes + 1)
  })
})

describe('trạng thái "Cần liên hệ lại"', () => {
  it('lưu được và được đếm riêng trong số realtime', async () => {
    const before = await getLiveCounts(payload)
    const doc = await payload.create({
      collection: 'quote-requests',
      data: { name: `${PREFIX} Gọi Lại`, phone: '0946272467', status: 'callback' },
      ...asRoot,
    })
    expect(doc.status).toBe('callback')
    const after = await getLiveCounts(payload)
    expect(after.callbackQuotes).toBe(before.callbackQuotes + 1)
    expect(after.newQuotes).toBe(before.newQuotes)
  })

  it('getLiveCounts trả đủ số của cả 4 trạng thái', async () => {
    const counts = await getLiveCounts(payload)
    for (const key of ['newQuotes', 'callbackQuotes', 'contactedQuotes', 'doneQuotes'] as const) {
      expect(typeof counts[key]).toBe('number')
    }
  })
})

describe('GET /api/live-counts', () => {
  const controllers: AbortController[] = []
  afterEach(() => controllers.splice(0).forEach((c) => c.abort()))

  it('chặn người chưa đăng nhập', async () => {
    const res = await liveCountsGet(new Request('http://localhost:3000/api/live-counts'))
    expect(res.status).toBe(401)
  })

  it('trả JSON số liệu cho nhân viên đã đăng nhập', async () => {
    const res = await liveCountsGet(new Request('http://localhost:3000/api/live-counts', { headers: await authHeaders() }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual(await getLiveCounts(payload))
  })

  it('?stream=1 mở SSE và gửi ngay số hiện tại', async () => {
    const controller = new AbortController()
    controllers.push(controller)
    const res = await liveCountsGet(
      new Request('http://localhost:3000/api/live-counts?stream=1', { headers: await authHeaders(), signal: controller.signal }),
    )
    expect(res.headers.get('content-type')).toBe('text/event-stream')

    const reader = res.body!.getReader()
    const { value } = await reader.read()
    const text = new TextDecoder().decode(value)
    expect(text).toMatch(/^data: /)
    expect(JSON.parse(text.replace(/^data: /, '').trim())).toHaveProperty('newQuotes')
    await reader.cancel()
  })
})

describe('lịch sử chỉnh sửa yêu cầu báo giá', () => {
  let quoteId: number

  beforeAll(async () => {
    const doc = await payload.create({ collection: 'quote-requests', data: { name: `${PREFIX} Lịch Sử`, phone: '0946272467' }, ...asRoot })
    quoteId = doc.id
    await payload.update({ collection: 'quote-requests', id: quoteId, data: { status: 'contacted' }, ...asRoot })
  })

  it('mỗi lần lưu tạo một phiên bản, giữ được trạng thái cũ', async () => {
    const versions = await payload.findVersions({
      collection: 'quote-requests',
      where: { parent: { equals: quoteId } },
      sort: 'createdAt',
      ...asRoot,
    })
    expect(versions.totalDocs).toBe(2)
    expect(versions.docs.map((v) => v.version.status)).toEqual(['new', 'contacted'])
  })

  it('nhân viên xem được lịch sử', async () => {
    const versions = await payload.findVersions({ collection: 'quote-requests', where: { parent: { equals: quoteId } }, ...(await as('editor')) })
    expect(versions.totalDocs).toBeGreaterThan(0)
  })

  it('khách không xem được lịch sử', async () => {
    await expect(payload.findVersions({ collection: 'quote-requests', where: { parent: { equals: quoteId } }, ...asGuest })).rejects.toThrow()
  })

  it('yêu cầu cũ chưa có lịch sử: lần sửa đầu lưu cả bản gốc để so sánh được', async () => {
    const doc = await payload.create({ collection: 'quote-requests', data: { name: `${PREFIX} Cũ`, phone: '0989541246' }, ...asRoot })
    // Giả lập yêu cầu gửi trước khi bật lịch sử: chưa có phiên bản nào
    await payload.db.deleteVersions({ collection: 'quote-requests', where: { parent: { equals: doc.id } } })

    await payload.update({ collection: 'quote-requests', id: doc.id, data: { phone: '0989541249' }, ...asRoot })
    const list = async () =>
      (await payload.findVersions({ collection: 'quote-requests', where: { parent: { equals: doc.id } }, sort: 'createdAt', ...asRoot })).docs.map(
        (v) => v.version.phone,
      )
    expect(await list()).toEqual(['0989541246', '0989541249'])

    // Lần sửa sau không tạo thêm bản gốc
    await payload.update({ collection: 'quote-requests', id: doc.id, data: { phone: '0989541250' }, ...asRoot })
    expect(await list()).toEqual(['0989541246', '0989541249', '0989541250'])
  })

  it('không cho lưu yêu cầu với trạng thái trống', async () => {
    await expect(
      payload.update({ collection: 'quote-requests', id: quoteId, data: { status: null }, ...asRoot }),
    ).rejects.toThrow()
  })

  it('khôi phục phiên bản cũ đưa trạng thái về như trước', async () => {
    const versions = await payload.findVersions({
      collection: 'quote-requests',
      where: { parent: { equals: quoteId } },
      sort: 'createdAt',
      ...asRoot,
    })
    await payload.restoreVersion({ collection: 'quote-requests', id: String(versions.docs[0]!.id), ...asRoot })
    const doc = await payload.findByID({ collection: 'quote-requests', id: quoteId, ...asRoot })
    expect(doc.status).toBe('new')
  })

  it('không cho khôi phục phiên bản giống hệt nội dung hiện tại, không đẻ thêm phiên bản trùng', async () => {
    const versions = await payload.findVersions({
      collection: 'quote-requests',
      where: { parent: { equals: quoteId } },
      // Theo updatedAt như trang danh sách phiên bản: khôi phục giữ createdAt của bản được khôi phục
      sort: '-updatedAt',
      ...asRoot,
    })
    // Phiên bản mới nhất chính là nội dung hiện tại
    await expect(
      payload.restoreVersion({ collection: 'quote-requests', id: String(versions.docs[0]!.id), ...asRoot }),
    ).rejects.toThrow(NOOP_RESTORE_MESSAGE)
    const after = await payload.countVersions({ collection: 'quote-requests', where: { parent: { equals: quoteId } } })
    expect(after.totalDocs).toBe(versions.totalDocs)
  })
})

describe('chặn khôi phục vô ích ở collection có nháp (sản phẩm)', () => {
  it('phiên bản giống bản mới nhất thì không khôi phục được, bản khác thì được', async () => {
    const base = (await payload.find({ collection: 'products', limit: 1, depth: 0, ...asRoot })).docs[0]!
    await payload.delete({ collection: 'products', where: { name: { like: `${PREFIX} SP%` } }, ...asRoot, context: { disableRevalidate: true } })
    const product = await payload.create({
      collection: 'products',
      // Bỏ id của từng dòng ảnh, nếu không sẽ trùng khóa với dòng của sản phẩm mẫu
      data: { name: `${PREFIX} SP Gốc`, category: base.category, images: (base.images ?? []).map((r) => ({ image: r.image })), _status: 'published' } as never,
      ...asRoot,
      context: { disableRevalidate: true },
    })
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { name: `${PREFIX} SP Đã Sửa`, _status: 'published' } as never,
      ...asRoot,
      context: { disableRevalidate: true },
    })
    const versions = await payload.findVersions({
      collection: 'products',
      where: { parent: { equals: product.id } },
      sort: '-updatedAt',
      ...asRoot,
    })
    const [latest, original] = versions.docs
    await expect(payload.restoreVersion({ collection: 'products', id: String(latest!.id), ...asRoot })).rejects.toThrow(NOOP_RESTORE_MESSAGE)
    await payload.restoreVersion({ collection: 'products', id: String(original!.id), ...asRoot, context: { disableRevalidate: true } })
    const doc = await payload.findByID({ collection: 'products', id: product.id, ...asRoot })
    expect(doc.name).toBe(`${PREFIX} SP Gốc`)
    await payload.delete({ collection: 'products', id: product.id, ...asRoot, context: { disableRevalidate: true } })
  })
})
