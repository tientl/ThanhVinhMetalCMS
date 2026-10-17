import { beforeAll, describe, expect, it, vi } from 'vitest'

import { REST_POST } from '@payloadcms/next/routes'
import type { Payload } from 'payload'

import { EDITOR_PUBLISH_MESSAGE } from '@/hooks/drafts'
import config from '@/payload.config'

import { as, asGuest, asRoot, getTestPayload, getUser, noRevalidate } from './helpers'

// Gọi qua REST thì không truyền được context disableRevalidate; revalidatePath chỉ chạy trong server Next thật
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * Phân quyền vai trò Nhân viên (editor), kiểm ở tầng API: thao tác bị cấm phải bị từ chối thật, không chỉ ẩn nút.
 * Chính sách (17/10/2026): chỉ lưu nháp, Quản trị duyệt và xuất bản; được sửa trang chủ; không thêm, sửa danh mục;
 * yêu cầu báo giá chỉ đổi trạng thái; không xóa gì; không sửa menu, thông tin công ty, thống kê truy cập, tài khoản khác.
 */
const PREFIX = 'Edtest'
let payload: Payload
let categoryId: number
let mediaId: number

const productData = (name: string) => ({ name: `${PREFIX} ${name}`, category: categoryId, images: [{ image: mediaId }] })

beforeAll(async () => {
  payload = await getTestPayload()
  for (const collection of ['products', 'posts'] as const) {
    const field = collection === 'products' ? 'name' : 'title'
    await payload.delete({ collection, where: { [field]: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  }
  await payload.delete({ collection: 'product-categories', where: { name: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  await payload.delete({ collection: 'quote-requests', where: { name: { like: `${PREFIX}%` } }, ...asRoot })
  categoryId = (await payload.find({ collection: 'product-categories', limit: 1, ...asRoot })).docs[0]!.id
  mediaId = (await payload.find({ collection: 'media', limit: 1, ...asRoot })).docs[0]!.id
})

describe('Nhân viên chỉ lưu nháp sản phẩm, bài viết, trang tĩnh', () => {
  it('không xuất bản được khi tạo mới', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: { ...productData('Tạo Xuất Bản'), _status: 'published' } as never,
        ...(await as('editor')),
        ...noRevalidate,
      }),
    ).rejects.toThrow(EDITOR_PUBLISH_MESSAGE)
  })

  it('tạo mới thì thành bản nháp, khách không thấy trên web', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: productData('Tạo Nháp') as never,
      ...(await as('editor')),
      ...noRevalidate,
    })
    const main = await payload.findByID({ collection: 'products', id: doc.id, depth: 0, ...asRoot })
    expect(main._status).toBe('draft')
    const guest = await payload.find({ collection: 'products', where: { id: { equals: doc.id } }, ...asGuest })
    expect(guest.totalDocs).toBe(0)
  })

  describe('với sản phẩm đang hiện trên web', () => {
    let id: number

    beforeAll(async () => {
      const doc = await payload.create({
        collection: 'products',
        data: { ...productData('Đang Bán'), summary: 'Tóm tắt đã duyệt', _status: 'published' } as never,
        ...(await as('admin')),
        ...noRevalidate,
      })
      id = doc.id
    })

    it('sửa thì chỉ thành bản nháp, nội dung trên web giữ nguyên', async () => {
      await payload.update({
        collection: 'products',
        id,
        data: { summary: 'Nhân viên sửa' } as never,
        ...(await as('editor')),
        ...noRevalidate,
      })
      const live = await payload.findByID({ collection: 'products', id, depth: 0, ...asRoot })
      expect(live._status).toBe('published')
      expect(live.summary).toBe('Tóm tắt đã duyệt')
      const draft = await payload.findByID({ collection: 'products', id, depth: 0, draft: true, ...asRoot })
      expect(draft.summary).toBe('Nhân viên sửa')
    })

    it('không gỡ được khỏi web (ghi _status nháp không kèm cờ nháp)', async () => {
      await payload.update({
        collection: 'products',
        id,
        data: { _status: 'draft' } as never,
        ...(await as('editor')),
        ...noRevalidate,
      })
      const live = await payload.findByID({ collection: 'products', id, depth: 0, ...asRoot })
      expect(live._status).toBe('published')
    })

    it('không xuất bản được khi sửa', async () => {
      await expect(
        payload.update({
          collection: 'products',
          id,
          data: { summary: 'Tự xuất bản', _status: 'published' } as never,
          ...(await as('editor')),
          ...noRevalidate,
        }),
      ).rejects.toThrow(EDITOR_PUBLISH_MESSAGE)
    })

    it('khôi phục phiên bản thì luôn dưới dạng nháp, web giữ nguyên', async () => {
      // Local API không truyền được cờ nháp nên bị chặn
      const versions = await payload.findVersions({ collection: 'products', where: { parent: { equals: id } }, sort: 'updatedAt', ...asRoot })
      const published = versions.docs.find((v) => (v.version as { _status?: string })._status === 'published')!
      await expect(
        payload.restoreVersion({ collection: 'products', id: String(published.id), ...(await as('editor')), ...noRevalidate }),
      ).rejects.toThrow()

      // Nút trong admin (route REST) thì được, dưới dạng nháp
      const user = await getUser('editor')
      const { token } = await payload.login({ collection: 'users', data: { email: user.email, password: 'Test@2026' } })
      const res = await REST_POST(config)(
        new Request(`http://localhost:3000/api/products/versions/${published.id}?draft=false`, {
          method: 'POST',
          headers: { Authorization: `JWT ${token}` },
        }),
        { params: Promise.resolve({ slug: ['products', 'versions', String(published.id)] }) },
      )
      expect(res.status).toBe(200)
      const live = await payload.findByID({ collection: 'products', id, depth: 0, ...asRoot })
      expect(live._status).toBe('published')
    })

    it('quản trị vẫn xuất bản được', async () => {
      await payload.update({
        collection: 'products',
        id,
        data: { summary: 'Quản trị duyệt', _status: 'published' } as never,
        ...(await as('admin')),
        ...noRevalidate,
      })
      const live = await payload.findByID({ collection: 'products', id, depth: 0, ...asRoot })
      expect(live.summary).toBe('Quản trị duyệt')
    })
  })

  it('bài viết cũng không xuất bản được', async () => {
    await expect(
      payload.create({
        collection: 'posts',
        data: { title: `${PREFIX} Bài`, _status: 'published' } as never,
        ...(await as('editor')),
        ...noRevalidate,
      }),
    ).rejects.toThrow(EDITOR_PUBLISH_MESSAGE)
  })
})

describe('Nhân viên không thêm, sửa danh mục', () => {
  it('danh mục sản phẩm và danh mục bài viết chỉ Quản trị', async () => {
    const editor = await as('editor')
    await expect(
      payload.create({ collection: 'product-categories', data: { name: `${PREFIX} Danh Mục` }, ...editor, ...noRevalidate }),
    ).rejects.toThrow()
    await expect(
      payload.update({ collection: 'product-categories', id: categoryId, data: { description: 'Sửa' }, ...editor, ...noRevalidate }),
    ).rejects.toThrow()
    await expect(
      payload.create({ collection: 'post-categories', data: { name: `${PREFIX} Danh Mục Bài` }, ...editor, ...noRevalidate }),
    ).rejects.toThrow()

    const doc = await payload.create({
      collection: 'product-categories',
      data: { name: `${PREFIX} Danh Mục Quản Trị` },
      ...(await as('admin')),
      ...noRevalidate,
    })
    expect(doc.id).toBeTruthy()
  })
})

describe('Nhân viên với yêu cầu báo giá: chỉ đổi trạng thái', () => {
  it('đổi được trạng thái, không sửa được thông tin khách gửi', async () => {
    const quote = await payload.create({
      collection: 'quote-requests',
      data: { name: `${PREFIX} Khách`, phone: '0946272467', message: 'Cần cắt 10 tấm', ip: '203.0.113.9' },
      ...asRoot,
    })
    const updated = await payload.update({
      collection: 'quote-requests',
      id: quote.id,
      data: { status: 'contacted', name: 'Tên bị sửa', phone: '0000000000', message: 'Nội dung bị sửa', ip: '1.1.1.1' },
      ...(await as('editor')),
    })
    expect(updated.status).toBe('contacted')
    expect(updated.name).toBe(`${PREFIX} Khách`)
    expect(updated.phone).toBe('0946272467')
    expect(updated.message).toBe('Cần cắt 10 tấm')
    expect(updated.ip).toBe('203.0.113.9')
  })

  it('Quản trị sửa được thông tin khách, nhưng IP thì không ai sửa', async () => {
    const quote = await payload.create({
      collection: 'quote-requests',
      data: { name: `${PREFIX} Khách Hai`, phone: '0946272467', ip: '203.0.113.10' },
      ...asRoot,
    })
    const updated = await payload.update({
      collection: 'quote-requests',
      id: quote.id,
      data: { phone: '0946272468', ip: '1.1.1.1' },
      ...(await as('admin')),
    })
    expect(updated.phone).toBe('0946272468')
    expect(updated.ip).toBe('203.0.113.10')
  })

  it('không xóa được yêu cầu', async () => {
    const quote = await payload.create({ collection: 'quote-requests', data: { name: `${PREFIX} Khách Ba`, phone: '0946272467' }, ...asRoot })
    await expect(payload.delete({ collection: 'quote-requests', id: quote.id, ...(await as('editor')) })).rejects.toThrow()
  })
})

describe('Nhân viên với trang chủ và cài đặt', () => {
  it('sửa được trang chủ', async () => {
    const home = await payload.findGlobal({ slug: 'home', depth: 0, ...asRoot })
    await expect(
      payload.updateGlobal({ slug: 'home', data: { newsHeading: home.newsHeading } as never, ...(await as('editor')), ...noRevalidate }),
    ).resolves.toBeTruthy()
  })

  it('không sửa được menu và thống kê truy cập', async () => {
    const editor = await as('editor')
    await expect(payload.updateGlobal({ slug: 'navigation', data: {} as never, ...editor, ...noRevalidate })).rejects.toThrow()
    await expect(payload.updateGlobal({ slug: 'visitor-stats', data: {} as never, ...editor, ...noRevalidate })).rejects.toThrow()
  })

  it('không xóa được ảnh', async () => {
    await expect(payload.delete({ collection: 'media', id: mediaId, ...(await as('editor')) })).rejects.toThrow()
  })
})
