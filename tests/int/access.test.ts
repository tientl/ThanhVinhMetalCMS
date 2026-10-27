import { beforeAll, describe, expect, it } from 'vitest'

import type { Payload } from 'payload'

import { as, asGuest, asRoot, cleanup, getTestPayload, getUser, noRevalidate } from './helpers'

const PREFIX = 'Zz Test Access'

let payload: Payload
let categoryId: number
let mediaId: number
let productId: number

beforeAll(async () => {
  payload = await getTestPayload()

  const categories = await payload.find({ collection: 'product-categories', limit: 1, ...asRoot })
  categoryId = categories.docs[0]!.id
  const media = await payload.find({ collection: 'media', limit: 1, ...asRoot })
  mediaId = media.docs[0]!.id

  await cleanup('products', 'name', `${PREFIX}%`)

  const product = await payload.create({
    collection: 'products',
    data: {
      name: `${PREFIX} Sản Phẩm`,
      category: categoryId,
      images: [{ image: mediaId }],
      _status: 'published',
    } as never,
    ...asRoot,
    ...noRevalidate,
  })
  productId = product.id
})

describe('sản phẩm', () => {
  it('khách đọc được sản phẩm đã đăng', async () => {
    const res = await payload.find({ collection: 'products', where: { id: { equals: productId } }, ...asGuest })
    expect(res.totalDocs).toBe(1)
  })

  it('khách không tạo được sản phẩm', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: { name: `${PREFIX} Khách Tạo`, category: categoryId, images: [{ image: mediaId }] } as never,
        ...asGuest,
        ...noRevalidate,
      }),
    ).rejects.toThrow()
  })

  it('nhân viên tạo và sửa được sản phẩm (dưới dạng nháp)', async () => {
    const editor = await as('editor')
    const created = await payload.create({
      collection: 'products',
      data: {
        name: `${PREFIX} Nhân Viên Tạo`,
        category: categoryId,
        images: [{ image: mediaId }],
      } as never,
      ...editor,
      ...noRevalidate,
    })
    expect(created.id).toBeTruthy()

    const updated = await payload.update({
      collection: 'products',
      id: created.id,
      data: { summary: 'Nhân viên sửa được' } as never,
      ...editor,
      ...noRevalidate,
    })
    expect(updated.summary).toBe('Nhân viên sửa được')
  })

  it('nhân viên không xóa được sản phẩm, quản trị thì được', async () => {
    const editor = await as('editor')
    const admin = await as('admin')
    const doc = await payload.create({
      collection: 'products',
      data: {
        name: `${PREFIX} Chờ Xóa`,
        category: categoryId,
        images: [{ image: mediaId }],
        _status: 'published',
      } as never,
      ...asRoot,
      ...noRevalidate,
    })

    await expect(
      payload.delete({ collection: 'products', id: doc.id, ...editor, ...noRevalidate }),
    ).rejects.toThrow()

    await expect(
      payload.delete({ collection: 'products', id: doc.id, ...admin, ...noRevalidate }),
    ).resolves.toBeTruthy()
  })
})

describe('yêu cầu báo giá', () => {
  it('khách không tạo trực tiếp được yêu cầu báo giá', async () => {
    await expect(
      payload.create({
        collection: 'quote-requests',
        data: { name: 'Khách', phone: '0900000000', status: 'new' } as never,
        ...asGuest,
      }),
    ).rejects.toThrow()
  })

  it('khách không đọc được yêu cầu báo giá', async () => {
    await expect(payload.find({ collection: 'quote-requests', ...asGuest })).rejects.toThrow()
  })

  it('nhân viên đọc được yêu cầu báo giá', async () => {
    const editor = await as('editor')
    await expect(payload.find({ collection: 'quote-requests', ...editor })).resolves.toBeTruthy()
  })
})

describe('tệp bản vẽ khách gửi', () => {
  it('khách không đọc được, nhân viên đọc được', async () => {
    const editor = await as('editor')
    await expect(payload.find({ collection: 'quote-files', ...asGuest })).rejects.toThrow()
    await expect(payload.find({ collection: 'quote-files', ...editor })).resolves.toBeTruthy()
  })

  it('không ai tạo trực tiếp được qua API công khai', async () => {
    const admin = await as('admin')
    await expect(
      payload.create({ collection: 'quote-files', data: {} as never, ...admin }),
    ).rejects.toThrow()
  })
})

describe('tài khoản', () => {
  it('khách không đọc được danh sách tài khoản', async () => {
    await expect(payload.find({ collection: 'users', ...asGuest })).rejects.toThrow()
  })

  it('nhân viên chỉ thấy chính mình', async () => {
    const editor = await as('editor')
    const res = await payload.find({ collection: 'users', ...editor })
    expect(res.docs.map((d) => d.id)).toEqual([(await getUser('editor')).id])
  })

  it('nhân viên không tự nâng mình lên quản trị', async () => {
    const editor = await as('editor')
    const self = await getUser('editor')
    await payload.update({
      collection: 'users',
      id: self.id,
      data: { role: 'admin' } as never,
      ...editor,
    })
    const after = await payload.findByID({ collection: 'users', id: self.id, ...asRoot })
    expect(after.role).toBe('editor')
  })

  it('nhân viên không tạo được tài khoản mới', async () => {
    const editor = await as('editor')
    await expect(
      payload.create({
        collection: 'users',
        data: { name: 'Mới', email: 'moi@example.com', password: 'Test@2026', role: 'editor' } as never,
        ...editor,
      }),
    ).rejects.toThrow()
  })
})

describe('cài đặt chung', () => {
  it('ai cũng đọc được cài đặt chung', async () => {
    await expect(payload.findGlobal({ slug: 'site-settings', ...asGuest })).resolves.toBeTruthy()
  })

  it('chỉ quản trị sửa được cài đặt chung', async () => {
    const editor = await as('editor')
    await expect(
      payload.updateGlobal({ slug: 'site-settings', data: { brandName: 'Sai' } as never, ...editor, ...noRevalidate }),
    ).rejects.toThrow()

    const admin = await as('admin')
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, ...asRoot })
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { brandName: settings.brandName } as never,
        ...admin,
        ...noRevalidate,
      }),
    ).resolves.toBeTruthy()
  })
})
