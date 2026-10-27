import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { REST_POST } from '@payloadcms/next/routes'
import type { Payload } from 'payload'

import config from '@/payload.config'
import { richText } from '@/seed/lexical'

import { minimalPdf } from './fixtures'
import { as, asGuest, asRoot, getTestPayload, getUser, noRevalidate } from './helpers'

// Gọi qua REST thì không truyền được context disableRevalidate; revalidatePath chỉ chạy trong server Next thật
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * Phân quyền vai trò Nhân viên (editor), kiểm ở tầng API: thao tác bị cấm phải bị từ chối thật, không chỉ ẩn nút.
 * Nhân viên được lưu nháp hoặc xuất bản nội dung, sửa chi tiết yêu cầu báo giá,
 * thêm, sửa danh mục và trang chủ; không xóa hoặc sửa các mục chỉ dành cho Quản trị.
 */
const PREFIX = 'Edtest'
let payload: Payload
let categoryId: number
let mediaId: number

const productData = (name: string) => ({ name: `${PREFIX} ${name}`, category: categoryId, images: [{ image: mediaId }] })

beforeAll(async () => {
  payload = await getTestPayload()
  for (const collection of ['products', 'posts', 'pages'] as const) {
    const field = collection === 'products' ? 'name' : 'title'
    await payload.delete({ collection, where: { [field]: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  }
  for (const collection of ['product-categories', 'post-categories'] as const) {
    await payload.delete({ collection, where: { name: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  }
  await payload.delete({ collection: 'quote-requests', where: { name: { like: `${PREFIX}%` } }, ...asRoot })
  categoryId = (await payload.find({ collection: 'product-categories', limit: 1, ...asRoot })).docs[0]!.id
  mediaId = (await payload.find({ collection: 'media', limit: 1, ...asRoot })).docs[0]!.id
})

afterAll(async () => {
  for (const collection of ['products', 'posts', 'pages'] as const) {
    const field = collection === 'products' ? 'name' : 'title'
    await payload.delete({ collection, where: { [field]: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  }
  for (const collection of ['product-categories', 'post-categories'] as const) {
    await payload.delete({ collection, where: { name: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  }
  await payload.delete({ collection: 'quote-requests', where: { name: { like: `${PREFIX}%` } }, ...asRoot })
})

describe('Nhân viên lưu nháp và xuất bản nội dung', () => {
  it('không xuất bản sản phẩm thiếu ảnh và báo lỗi ở Bộ ảnh', async () => {
    const name = `${PREFIX} Thiếu Ảnh`
    let error: { data?: { errors?: Array<{ path: string; message: string }> } } | undefined
    try {
      await payload.create({
        collection: 'products',
        data: { name, category: categoryId, images: [], _status: 'published' } as never,
        ...(await as('editor')),
        ...noRevalidate,
      })
    } catch (caught) {
      error = caught as typeof error
    }
    expect(error?.data?.errors).toContainEqual({
      path: 'images',
      label: 'Bộ ảnh',
      message: 'Cần chọn ít nhất một ảnh hợp lệ trước khi xuất bản sản phẩm.',
    })
    const guest = await payload.find({ collection: 'products', where: { name: { equals: name } }, ...asGuest })
    expect(guest.totalDocs).toBe(0)
  })

  it('cho lưu nháp thiếu ảnh nhưng chặn xuất bản bản nháp đó', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: { name: `${PREFIX} Nháp Thiếu Ảnh`, category: categoryId, images: [], _status: 'draft' } as never,
      draft: true,
      ...(await as('editor')),
      ...noRevalidate,
    })
    await expect(payload.update({
      collection: 'products', id: doc.id, data: { _status: 'published' } as never,
      ...(await as('editor')), ...noRevalidate,
    })).rejects.toThrow()
    const guest = await payload.find({ collection: 'products', where: { id: { equals: doc.id } }, ...asGuest })
    expect(guest.totalDocs).toBe(0)
  })

  it('không cho gỡ ảnh khỏi sản phẩm đã xuất bản', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: { ...productData('Không Được Gỡ Ảnh'), _status: 'published' } as never,
      ...(await as('editor')),
      ...noRevalidate,
    })
    await expect(payload.update({
      collection: 'products', id: doc.id, data: { images: [], _status: 'published' } as never,
      ...(await as('editor')), ...noRevalidate,
    })).rejects.toThrow()
    const guest = await payload.findByID({ collection: 'products', id: doc.id, depth: 0, ...asGuest })
    expect(guest.images?.[0]?.image).toBeTruthy()
  })

  it('không cho dùng tệp PDF làm ảnh sản phẩm', async () => {
    const data = minimalPdf()
    const pdf = await payload.create({
      collection: 'media',
      data: { alt: `${PREFIX} PDF` },
      file: { data, name: `${PREFIX}-khong-phai-anh.pdf`, mimetype: 'application/pdf', size: data.length },
      ...asRoot,
      ...noRevalidate,
    })
    try {
      await expect(payload.create({
        collection: 'products',
        data: { name: `${PREFIX} Ảnh PDF`, category: categoryId, images: [{ image: pdf.id }], _status: 'published' } as never,
        ...(await as('editor')),
        ...noRevalidate,
      })).rejects.toThrow()
    } finally {
      await payload.delete({ collection: 'media', id: pdf.id, ...asRoot, ...noRevalidate })
    }
  })

  it('tạo và xuất bản sản phẩm để khách xem được', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: { ...productData('Xuất Bản'), _status: 'published' } as never,
      ...(await as('editor')),
      ...noRevalidate,
    })
    expect(doc._status).toBe('published')
    const guest = await payload.find({ collection: 'products', where: { id: { equals: doc.id } }, ...asGuest })
    expect(guest.totalDocs).toBe(1)
  })

  it('sửa sản phẩm đã đăng rồi xuất bản thay đổi', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: { ...productData('Cập Nhật'), summary: 'Nội dung cũ', _status: 'published' } as never,
      ...asRoot,
      ...noRevalidate,
    })
    await payload.update({
      collection: 'products',
      id: doc.id,
      data: { summary: 'Nội dung mới', _status: 'published' } as never,
      ...(await as('editor')),
      ...noRevalidate,
    })
    const guest = await payload.findByID({ collection: 'products', id: doc.id, ...asGuest })
    expect(guest.summary).toBe('Nội dung mới')
  })

  it('vẫn có thể lưu nháp khi chưa muốn xuất bản', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: { ...productData('Lưu Nháp'), _status: 'draft' } as never,
      draft: true,
      ...(await as('editor')),
      ...noRevalidate,
    })
    expect(doc._status).toBe('draft')
    const guest = await payload.find({ collection: 'products', where: { id: { equals: doc.id } }, ...asGuest })
    expect(guest.totalDocs).toBe(0)
  })

  it('xuất bản được bài viết và trang tĩnh', async () => {
    const category = await payload.create({
      collection: 'post-categories',
      data: { name: `${PREFIX} Danh Mục Đăng Bài` },
      ...asRoot,
      ...noRevalidate,
    })
    const editor = await as('editor')
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: `${PREFIX} Bài Xuất Bản`,
        category: category.id,
        cover: mediaId,
        content: richText(['Nội dung thử.']),
        _status: 'published',
      } as never,
      ...editor,
      ...noRevalidate,
    })
    const page = await payload.create({
      collection: 'pages',
      data: { title: `${PREFIX} Trang Xuất Bản`, content: richText(['Nội dung thử.']), _status: 'published' } as never,
      ...editor,
      ...noRevalidate,
    })
    expect(post._status).toBe('published')
    expect(page._status).toBe('published')
    expect((await payload.find({ collection: 'posts', where: { id: { equals: post.id } }, ...asGuest })).totalDocs).toBe(1)
    expect((await payload.find({ collection: 'pages', where: { id: { equals: page.id } }, ...asGuest })).totalDocs).toBe(1)
  })

  it('khôi phục được phiên bản đã xuất bản từ trang quản trị', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: { ...productData('Khôi Phục'), summary: 'Bản đầu', _status: 'published' } as never,
      ...asRoot,
      ...noRevalidate,
    })
    await payload.update({
      collection: 'products',
      id: doc.id,
      data: { summary: 'Bản mới', _status: 'published' } as never,
      ...asRoot,
      ...noRevalidate,
    })
    const versions = await payload.findVersions({ collection: 'products', where: { parent: { equals: doc.id } }, sort: 'updatedAt', ...asRoot })
    const first = versions.docs.find((v) => (v.version as { summary?: string }).summary === 'Bản đầu')!
    const user = await getUser('editor')
    const { token } = await payload.login({ collection: 'users', data: { email: user.email, password: 'Test@2026' } })
    const res = await REST_POST(config)(
      new Request(`http://localhost:3000/api/products/versions/${first.id}?draft=false`, {
        method: 'POST',
        headers: { Authorization: `JWT ${token}` },
      }),
      { params: Promise.resolve({ slug: ['products', 'versions', String(first.id)] }) },
    )
    expect(res.status).toBe(200)
    const live = await payload.findByID({ collection: 'products', id: doc.id, depth: 0, ...asRoot })
    expect(live.summary).toBe('Bản đầu')
  })
})

describe('Nhân viên thêm, sửa được danh mục nhưng không xóa', () => {
  it('thêm, sửa được danh mục sản phẩm và danh mục bài viết', async () => {
    const editor = await as('editor')
    const category = await payload.create({
      collection: 'product-categories',
      data: { name: `${PREFIX} Danh Mục` },
      ...editor,
      ...noRevalidate,
    })
    const edited = await payload.update({
      collection: 'product-categories',
      id: category.id,
      data: { description: 'Nhân viên sửa' },
      ...editor,
      ...noRevalidate,
    })
    expect(edited.description).toBe('Nhân viên sửa')

    const postCategory = await payload.create({
      collection: 'post-categories',
      data: { name: `${PREFIX} Danh Mục Bài` },
      ...editor,
      ...noRevalidate,
    })
    const renamed = await payload.update({
      collection: 'post-categories',
      id: postCategory.id,
      data: { name: `${PREFIX} Danh Mục Bài Sửa` },
      ...editor,
      ...noRevalidate,
    })
    expect(renamed.name).toBe(`${PREFIX} Danh Mục Bài Sửa`)
  })

  it('không xóa được danh mục, Quản trị thì xóa được', async () => {
    const editor = await as('editor')
    const admin = await as('admin')
    const category = await payload.create({
      collection: 'product-categories',
      data: { name: `${PREFIX} Danh Mục Xóa` },
      ...admin,
      ...noRevalidate,
    })
    const postCategory = await payload.create({
      collection: 'post-categories',
      data: { name: `${PREFIX} Danh Mục Bài Xóa` },
      ...admin,
      ...noRevalidate,
    })

    await expect(payload.delete({ collection: 'product-categories', id: category.id, ...editor, ...noRevalidate })).rejects.toThrow()
    await expect(payload.delete({ collection: 'post-categories', id: postCategory.id, ...editor, ...noRevalidate })).rejects.toThrow()

    await payload.delete({ collection: 'product-categories', id: category.id, ...admin, ...noRevalidate })
    await payload.delete({ collection: 'post-categories', id: postCategory.id, ...admin, ...noRevalidate })
  })
})

describe('Nhân viên sửa chi tiết yêu cầu báo giá', () => {
  it('sửa được các ô thông tin khách và trạng thái; ô hệ thống vẫn không đổi', async () => {
    const quote = await payload.create({
      collection: 'quote-requests',
      data: { name: `${PREFIX} Khách`, phone: '0946272467', message: 'Cần cắt 10 tấm', ip: '203.0.113.9' },
      ...asRoot,
    })
    const updated = await payload.update({
      collection: 'quote-requests',
      id: quote.id,
      data: {
        status: 'contacted', name: `${PREFIX} Khách Đã Sửa`, phone: '0946272468',
        email: 'khach@example.com', company: 'Công ty mới', message: 'Cần cắt 20 tấm',
        ip: '1.1.1.1', source: '/trang-khac',
      },
      ...(await as('editor')),
    })
    expect(updated.status).toBe('contacted')
    expect(updated.name).toBe(`${PREFIX} Khách Đã Sửa`)
    expect(updated.phone).toBe('0946272468')
    expect(updated.email).toBe('khach@example.com')
    expect(updated.company).toBe('Công ty mới')
    expect(updated.message).toBe('Cần cắt 20 tấm')
    expect(updated.ip).toBe('203.0.113.9')
    expect(updated.source).toBeFalsy()
  })

  it('thay được tệp đính kèm, nhưng không sửa nội dung tệp đã tải lên', async () => {
    const data = minimalPdf()
    const file = await payload.create({
      collection: 'quote-files',
      data: {},
      file: { data, name: `${PREFIX}-ban-ve.pdf`, mimetype: 'application/pdf', size: data.length },
      ...(await as('editor')),
    })
    expect(file.originalName).toBe(`${PREFIX}-ban-ve.pdf`)
    const quote = await payload.create({
      collection: 'quote-requests',
      data: { name: `${PREFIX} Có Tệp`, phone: '0946272467' },
      ...asRoot,
    })
    const updated = await payload.update({
      collection: 'quote-requests', id: quote.id, data: { attachment: file.id }, ...(await as('editor')),
    })
    expect(updated.attachment).toMatchObject({ id: file.id })
    await expect(payload.update({
      collection: 'quote-files', id: file.id, data: { originalName: 'Đổi tên' }, ...(await as('editor')),
    })).rejects.toThrow()
    await payload.delete({ collection: 'quote-requests', id: quote.id, ...asRoot })
    await payload.delete({ collection: 'quote-files', id: file.id, ...asRoot })
  })

  it('Quản trị cũng sửa được thông tin khách, nhưng IP thì không ai sửa', async () => {
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
