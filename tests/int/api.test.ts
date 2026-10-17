import { beforeAll, describe, expect, it } from 'vitest'

import type { Payload } from 'payload'

import { POST as quotePost } from '@/app/(frontend)/api/quote/route'
import { GET as searchGet } from '@/app/(frontend)/api/search/route'
import { POST as subscribePost } from '@/app/(frontend)/api/subscribe/route'
import { QUOTE_FILE_MAX_BYTES } from '@/lib/quoteFiles'

import { minimalDxf, minimalPdf } from './fixtures'
import { asRoot, getTestPayload } from './helpers'

let payload: Payload

// Rate limit tính theo IP và lưu trong bộ nhớ tiến trình,
// nên mỗi test dùng một IP riêng để không ảnh hưởng nhau.
let ipCounter = 0
const nextIp = () => `203.0.113.${(ipCounter++ % 250) + 1}`

const quoteRequest = (fields: Record<string, string | File>, ip = nextIp()) => {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  return new Request('http://localhost:3000/api/quote', {
    method: 'POST',
    body: form,
    headers: { 'x-forwarded-for': ip },
  })
}

const subscribeRequest = (body: unknown, ip = nextIp()) =>
  new Request('http://localhost:3000/api/subscribe', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  })

const countQuotes = async (name: string) => {
  const res = await payload.find({ collection: 'quote-requests', where: { name: { equals: name } }, ...asRoot })
  return res.totalDocs
}

beforeAll(async () => {
  payload = await getTestPayload()
  // Dọn dấu vết của lần chạy trước để test lặp lại được trên cùng database.
  await payload.delete({ collection: 'quote-requests', where: { name: { like: 'Zz%' } }, ...asRoot })
  await payload.delete({ collection: 'subscribers', where: { email: { like: 'zz-%' } }, ...asRoot })
})

describe('POST /api/quote', () => {
  it('lưu yêu cầu hợp lệ', async () => {
    const name = 'Zz Khách Hợp Lệ'
    const res = await quotePost(
      quoteRequest({ name, phone: '0946 272 467', email: 'khach@example.com', company: 'Cty ABC', message: 'Cần cắt 50 tấm', source: '/san-pham' }),
    )
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })

    const found = await payload.find({ collection: 'quote-requests', where: { name: { equals: name } }, ...asRoot })
    expect(found.totalDocs).toBe(1)
    const doc = found.docs[0]!
    expect(doc.phone).toBe('0946 272 467')
    expect(doc.email).toBe('khach@example.com')
    expect(doc.message).toBe('Cần cắt 50 tấm')
    expect(doc.source).toBe('/san-pham')
    expect(doc.status).toBe('new')
    expect(doc.ip).toBeTruthy()
  })

  it('lưu được khi chỉ có họ tên và điện thoại', async () => {
    const name = 'Zz Khách Tối Giản'
    const res = await quotePost(quoteRequest({ name, phone: '0900000001' }))
    expect(res.status).toBe(200)
    expect(await countQuotes(name)).toBe(1)
  })

  it('bẫy bot: có field website thì báo thành công nhưng không lưu', async () => {
    const name = 'Zz Bot'
    const res = await quotePost(quoteRequest({ name, phone: '0900000002', website: 'http://spam.example' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(await countQuotes(name)).toBe(0)
  })

  it('từ chối khi thiếu họ tên', async () => {
    const res = await quotePost(quoteRequest({ name: 'A', phone: '0900000003' }))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: expect.stringContaining('họ tên') })
  })

  it('từ chối số điện thoại không hợp lệ', async () => {
    for (const phone of ['123', 'khong-phai-so', '']) {
      const res = await quotePost(quoteRequest({ name: 'Zz Khách Sai SĐT', phone }))
      expect(res.status).toBe(400)
    }
    expect(await countQuotes('Zz Khách Sai SĐT')).toBe(0)
  })

  it('từ chối email sai định dạng', async () => {
    const res = await quotePost(quoteRequest({ name: 'Zz Khách Sai Email', phone: '0900000004', email: 'sai-email' }))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: expect.stringContaining('Email') })
    expect(await countQuotes('Zz Khách Sai Email')).toBe(0)
  })

  it('cắt bớt nội dung vượt độ dài cho phép', async () => {
    const name = 'Zz Khách Dài Dòng'
    const res = await quotePost(quoteRequest({ name, phone: '0900000005', message: 'x'.repeat(5000) }))
    expect(res.status).toBe(200)
    const found = await payload.find({ collection: 'quote-requests', where: { name: { equals: name } }, ...asRoot })
    expect(found.docs[0]!.message).toHaveLength(3000)
  })

  it('từ chối dữ liệu không phải form', async () => {
    const res = await quotePost(
      new Request('http://localhost:3000/api/quote', {
        method: 'POST',
        body: 'khong-phai-form',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': nextIp() },
      }),
    )
    expect(res.status).toBe(400)
  })

  describe('tệp bản vẽ đính kèm', () => {
    it('nhận tệp đúng định dạng và gắn vào yêu cầu', async () => {
      const name = 'Zz Khách Gửi Bản Vẽ'
      const file = new File([minimalDxf()], 'ban-ve.dxf', { type: 'image/vnd.dxf' })
      const res = await quotePost(quoteRequest({ name, phone: '0900000006', attachment: file }))
      expect(res.status).toBe(200)

      const found = await payload.find({
        collection: 'quote-requests',
        where: { name: { equals: name } },
        depth: 1,
        ...asRoot,
      })
      const attachment = found.docs[0]!.attachment
      expect(attachment).toBeTruthy()
      expect(typeof attachment === 'object' && attachment?.filename).toContain('ban-ve')
    })

    it('từ chối phần mở rộng không nằm trong danh sách', async () => {
      const name = 'Zz Khách Gửi Exe'
      const file = new File([Buffer.from('MZ')], 'virus.exe', { type: 'application/octet-stream' })
      const res = await quotePost(quoteRequest({ name, phone: '0900000007', attachment: file }))
      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toMatchObject({ error: expect.stringContaining('DXF') })
      expect(await countQuotes(name)).toBe(0)
    })

    it('từ chối tệp lớn hơn 10 MB', async () => {
      const name = 'Zz Khách Gửi Tệp Nặng'
      const file = new File([Buffer.alloc(QUOTE_FILE_MAX_BYTES + 1)], 'nang.pdf', { type: 'application/pdf' })
      const res = await quotePost(quoteRequest({ name, phone: '0900000008', attachment: file }))
      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toMatchObject({ error: expect.stringContaining('10 MB') })
      expect(await countQuotes(name)).toBe(0)
    })

    it('làm sạch tên tệp có dấu và khoảng trắng', async () => {
      const name = 'Zz Khách Tên Tệp Lạ'
      const file = new File([minimalPdf()], 'bản vẽ của khách.pdf', { type: 'application/pdf' })
      const res = await quotePost(quoteRequest({ name, phone: '0900000009', attachment: file }))
      expect(res.status).toBe(200)

      const found = await payload.find({
        collection: 'quote-requests',
        where: { name: { equals: name } },
        depth: 1,
        ...asRoot,
      })
      const attachment = found.docs[0]!.attachment
      const filename = typeof attachment === 'object' ? (attachment?.filename ?? '') : ''
      expect(filename).toMatch(/^[a-zA-Z0-9._-]+$/)
    })
  })

  it('chặn sau 5 lần gửi trong một giờ từ cùng IP', async () => {
    const ip = nextIp()
    for (let i = 0; i < 5; i++) {
      const res = await quotePost(quoteRequest({ name: `Zz Khách Spam ${i}`, phone: '0900000010' }, ip))
      expect(res.status).toBe(200)
    }
    const blocked = await quotePost(quoteRequest({ name: 'Zz Khách Spam 5', phone: '0900000010' }, ip))
    expect(blocked.status).toBe(429)
    expect(await countQuotes('Zz Khách Spam 5')).toBe(0)
  })
})

describe('POST /api/subscribe', () => {
  it('lưu email đăng ký mới', async () => {
    const email = 'zz-moi@example.com'
    const res = await subscribePost(subscribeRequest({ email, source: '/' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true })

    const found = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, ...asRoot })
    expect(found.totalDocs).toBe(1)
    expect(found.docs[0]!.source).toBe('/')
  })

  it('chuẩn hóa email về chữ thường và bỏ khoảng trắng', async () => {
    const res = await subscribePost(subscribeRequest({ email: '  Zz-HOA@Example.COM  ' }))
    expect(res.status).toBe(200)
    const found = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: 'zz-hoa@example.com' } },
      ...asRoot,
    })
    expect(found.totalDocs).toBe(1)
  })

  it('đăng ký lại cùng email không tạo bản ghi thứ hai', async () => {
    const email = 'zz-trung@example.com'
    await subscribePost(subscribeRequest({ email }))
    const res = await subscribePost(subscribeRequest({ email }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, message: expect.stringContaining('đã đăng ký') })

    const found = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, ...asRoot })
    expect(found.totalDocs).toBe(1)
  })

  it('từ chối email sai định dạng', async () => {
    for (const email of ['sai', 'a@b', '', 'a@@b.com']) {
      const res = await subscribePost(subscribeRequest({ email }))
      expect(res.status).toBe(400)
    }
  })

  it('bẫy bot: có field website thì báo thành công nhưng không lưu', async () => {
    const email = 'zz-bot@example.com'
    const res = await subscribePost(subscribeRequest({ email, website: 'spam' }))
    expect(res.status).toBe(200)
    const found = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, ...asRoot })
    expect(found.totalDocs).toBe(0)
  })

  it('từ chối body không phải JSON', async () => {
    const res = await subscribePost(subscribeRequest('{khong-phai-json'))
    expect(res.status).toBe(400)
  })

  it('chặn sau 5 lần gửi trong một giờ từ cùng IP', async () => {
    const ip = nextIp()
    for (let i = 0; i < 5; i++) {
      const res = await subscribePost(subscribeRequest({ email: `zz-spam-${i}@example.com` }, ip))
      expect(res.status).toBe(200)
    }
    const blocked = await subscribePost(subscribeRequest({ email: 'zz-spam-5@example.com' }, ip))
    expect(blocked.status).toBe(429)
  })
})

describe('GET /api/search', () => {
  const call = async (q: string) => {
    const res = await searchGet(new Request(`http://localhost:3000/api/search?q=${encodeURIComponent(q)}`))
    expect(res.status).toBe(200)
    return res.json() as Promise<{
      products: Array<{ name: string; href: string; image: string }>
      posts: Array<{ title: string; href: string; image: string }>
    }>
  }

  it('trả sản phẩm kèm đường dẫn và ảnh', async () => {
    const products = await payload.find({ collection: 'products', where: { _status: { equals: 'published' } }, limit: 1, ...asRoot })
    const product = products.docs[0]!
    const data = await call(product.name)

    const hit = data.products.find((p) => p.name === product.name)
    expect(hit).toBeTruthy()
    expect(hit!.href).toBe(`/san-pham/${product.slug}`)
    expect(hit!.image.startsWith('/media/')).toBe(true)
  })

  it('tìm được khi gõ không dấu', async () => {
    const products = await payload.find({ collection: 'products', where: { _status: { equals: 'published' } }, limit: 1, ...asRoot })
    const product = products.docs[0]!
    const noAccent = product.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
    const data = await call(noAccent)
    expect(data.products.map((p) => p.name)).toContain(product.name)
  })

  it('trả bài viết kèm đường dẫn', async () => {
    // Chỉ lấy bài đã xuất bản: file test khác có thể để lại bản nháp, tìm kiếm của khách không trả bản nháp
    const posts = await payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, limit: 1, ...asRoot })
    const post = posts.docs[0]!
    const data = await call(post.title)
    const hit = data.posts.find((p) => p.title === post.title)
    expect(hit).toBeTruthy()
    expect(hit!.href).toBe(`/bai-viet/${post.slug}`)
  })

  it('trả danh sách rỗng khi không có từ khóa', async () => {
    expect(await call('')).toEqual({ products: [], posts: [] })
  })

  it('trả danh sách rỗng khi không khớp gì', async () => {
    expect(await call('zzz khong co gi khop zzz')).toEqual({ products: [], posts: [] })
  })
})
