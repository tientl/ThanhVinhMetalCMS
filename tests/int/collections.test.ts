import { beforeAll, describe, expect, it } from 'vitest'

import type { Payload } from 'payload'

import { richText } from '@/seed/lexical'

import { asGuest, asRoot, cleanup, getTestPayload, noRevalidate } from './helpers'

const PREFIX = 'Zz Test Collection'

let payload: Payload
let categoryId: number
let mediaId: number

const makeProduct = async (name: string, extra: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'products',
    data: {
      name,
      category: categoryId,
      images: [{ image: mediaId }],
      _status: 'published',
      ...extra,
    } as never,
    ...asRoot,
    ...noRevalidate,
  })

beforeAll(async () => {
  payload = await getTestPayload()

  const categories = await payload.find({ collection: 'product-categories', limit: 1, ...asRoot })
  categoryId = categories.docs[0]!.id
  const media = await payload.find({ collection: 'media', limit: 1, ...asRoot })
  mediaId = media.docs[0]!.id

  await cleanup('products', 'name', `${PREFIX}%`)
})

describe('dữ liệu mẫu từ pnpm seed', () => {
  it('có đủ danh mục, sản phẩm, bài viết, trang và ảnh', async () => {
    const [categories, products, posts, pages, media] = await Promise.all([
      payload.count({ collection: 'product-categories' }),
      payload.count({ collection: 'products' }),
      payload.count({ collection: 'posts' }),
      payload.count({ collection: 'pages' }),
      payload.count({ collection: 'media' }),
    ])
    expect(categories.totalDocs).toBeGreaterThan(0)
    expect(products.totalDocs).toBeGreaterThan(0)
    expect(posts.totalDocs).toBeGreaterThan(0)
    expect(pages.totalDocs).toBeGreaterThan(0)
    expect(media.totalDocs).toBeGreaterThan(0)
  })

  it('tạo sẵn tài khoản quản trị', async () => {
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@thanhvinhmetal.vn' } },
      ...asRoot,
    })
    expect(users.totalDocs).toBe(1)
    expect(users.docs[0]!.role).toBe('admin')
  })

  it('ba global đều đã có nội dung', async () => {
    const [home, nav, settings] = await Promise.all([
      payload.findGlobal({ slug: 'home', depth: 0 }),
      payload.findGlobal({ slug: 'navigation', depth: 0 }),
      payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    ])
    expect(home).toBeTruthy()
    expect(nav).toBeTruthy()
    expect(settings.brandName).toBeTruthy()
  })
})

describe('slug tự sinh', () => {
  it('sinh slug không dấu từ tên sản phẩm khi để trống', async () => {
    const doc = await makeProduct(`${PREFIX} Vách Hoa Văn Đục Lỗ`)
    expect(doc.slug).toBe('zz-test-collection-vach-hoa-van-duc-lo')
  })

  it('chuẩn hóa slug người dùng tự nhập', async () => {
    const doc = await makeProduct(`${PREFIX} Tự Nhập`, { slug: 'Mặt Bích Đường Ống Zz!!!' })
    expect(doc.slug).toBe('mat-bich-duong-ong-zz')
  })

  it('không cho hai sản phẩm trùng slug', async () => {
    await makeProduct(`${PREFIX} Trùng Slug`, { slug: 'zz-test-trung-slug' })
    await expect(makeProduct(`${PREFIX} Trùng Slug 2`, { slug: 'zz-test-trung-slug' })).rejects.toThrow()
  })

  it('bài viết cũng tự sinh slug không dấu', async () => {
    const postCategories = await payload.find({ collection: 'post-categories', limit: 1, ...asRoot })
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: `${PREFIX} Xưởng Đầu Tư Máy Mới`,
        category: postCategories.docs[0]!.id,
        cover: mediaId,
        content: richText(['Nội dung thử.']),
        _status: 'published',
      } as never,
      ...asRoot,
      ...noRevalidate,
    })
    expect(post.slug).toBe('zz-test-collection-xuong-dau-tu-may-moi')
    await payload.delete({ collection: 'posts', id: post.id, ...asRoot, ...noRevalidate })
  })
})

describe('searchText không dấu', () => {
  it('gộp tên, tóm tắt và vật liệu vào bản không dấu', async () => {
    const doc = await makeProduct(`${PREFIX} Vỏ Tủ Điện`, {
      summary: 'Gia công theo bản vẽ',
      material: 'Thép tấm CT3',
    })
    const raw = (await payload.findByID({ collection: 'products', id: doc.id, depth: 0, ...asRoot })) as {
      searchText?: string
    }
    expect(raw.searchText).toContain('vo tu dien')
    expect(raw.searchText).toContain('gia cong theo ban ve')
    expect(raw.searchText).toContain('thep tam ct3')
  })

  it('gộp cả tên danh mục để tìm theo danh mục cũng ra', async () => {
    const category = await payload.findByID({ collection: 'product-categories', id: categoryId, depth: 0, ...asRoot })
    const doc = await makeProduct(`${PREFIX} Theo Danh Mục`)
    const raw = (await payload.findByID({ collection: 'products', id: doc.id, depth: 0, ...asRoot })) as {
      searchText?: string
    }
    const categoryWords = category.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .toLowerCase()
    expect(raw.searchText).toContain(categoryWords)
  })

  it('cập nhật lại searchText khi đổi tên', async () => {
    const doc = await makeProduct(`${PREFIX} Tên Cũ`)
    await payload.update({
      collection: 'products',
      id: doc.id,
      data: { name: `${PREFIX} Tên Mới Đã Sửa` } as never,
      ...asRoot,
      ...noRevalidate,
    })
    const raw = (await payload.findByID({ collection: 'products', id: doc.id, depth: 0, ...asRoot })) as {
      searchText?: string
    }
    expect(raw.searchText).toContain('ten moi da sua')
    expect(raw.searchText).not.toContain('ten cu')
  })
})

describe('bản nháp và bản đã đăng', () => {
  it('khách chỉ thấy sản phẩm đã đăng', async () => {
    const draft = await makeProduct(`${PREFIX} Bản Nháp`, { _status: 'draft' })
    const published = await makeProduct(`${PREFIX} Đã Đăng`)

    const seen = await payload.find({
      collection: 'products',
      where: { id: { in: [draft.id, published.id] } },
      ...asGuest,
    })
    const ids = seen.docs.map((d) => d.id)
    expect(ids).toContain(published.id)
    expect(ids).not.toContain(draft.id)
  })

  it('trang tĩnh cũng ẩn bản nháp với khách', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: { title: `${PREFIX} Trang Nháp`, content: richText(['Nội dung thử.']), _status: 'draft' } as never,
      ...asRoot,
      ...noRevalidate,
    })
    const seen = await payload.find({ collection: 'pages', where: { id: { equals: page.id } }, ...asGuest })
    expect(seen.totalDocs).toBe(0)
    await payload.delete({ collection: 'pages', id: page.id, ...asRoot, ...noRevalidate })
  })
})
