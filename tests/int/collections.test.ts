import { beforeAll, describe, expect, it } from 'vitest'

import type { Payload } from 'payload'

import { MAX } from '@/fields/limits'
import { getRelatedPosts, getRelatedProducts } from '@/lib/data'
import { richText } from '@/seed/lexical'

import { as, asGuest, asRoot, cleanup, getTestPayload, noRevalidate } from './helpers'

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

  it('tự thêm hậu tố khi nhiều sản phẩm cùng tên để trống slug', async () => {
    const name = `${PREFIX} Cùng Tên`
    const first = await makeProduct(name, { slug: '' })
    const second = await makeProduct(name, { slug: '' })
    const third = await makeProduct(name, { slug: '' })

    expect([first.slug, second.slug, third.slug]).toEqual([
      'zz-test-collection-cung-ten',
      'zz-test-collection-cung-ten-2',
      'zz-test-collection-cung-ten-3',
    ])
  })

  it('tính cả sản phẩm đang lưu nháp khi chọn slug tự động', async () => {
    const name = `${PREFIX} Nháp Trùng Tên`
    const draft = await makeProduct(name, { slug: '', _status: 'draft' })
    const published = await makeProduct(name, { slug: '' })

    expect(draft.slug).toBe('zz-test-collection-nhap-trung-ten')
    expect(published.slug).toBe('zz-test-collection-nhap-trung-ten-2')
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

describe('ô quan hệ chỉ chọn được bản đã xuất bản (src/fields/publishedOnly.ts)', () => {
  const ids = (list: unknown[] | null | undefined) => (list ?? []).map((r) => (typeof r === 'object' && r ? (r as { id: number }).id : r))

  /** Lưu phải hỏng vì ô liên quan; trả về câu báo lỗi của ô đó (Payload gom vào ValidationError.data.errors). */
  const fieldError = async (save: Promise<unknown>) => {
    const error = await save.then(
      () => null,
      (e: unknown) => e as { data?: { errors?: { path: string; message: string }[] } },
    )
    expect(error, 'lưu phải bị từ chối').not.toBeNull()
    const field = error?.data?.errors?.find((e) => e.path === 'related')
    expect(field, 'lỗi phải nằm ở ô related').toBeTruthy()
    return field!.message
  }

  it('Sản phẩm liên quan: bản đã xuất bản lưu được; bản nháp, chính nó bị từ chối khi lưu', async () => {
    const admin = await as('admin')
    const draft = await payload.create({
      collection: 'products',
      data: { name: `${PREFIX} Liên Quan Nháp`, category: categoryId, images: [{ image: mediaId }], _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...noRevalidate,
    })
    const other = await makeProduct(`${PREFIX} Liên Quan Đã Đăng`)
    const host = await makeProduct(`${PREFIX} Liên Quan Chủ`)

    const saved = await payload.update({ collection: 'products', id: host.id, data: { related: [other.id] } as never, ...admin, ...noRevalidate })
    expect(ids(saved.related)).toEqual([other.id])

    // Lỗi nằm ở ô "Sản phẩm liên quan" và nêu đúng tên mục sai, không phải câu chung chung
    expect(
      await fieldError(payload.update({ collection: 'products', id: host.id, data: { related: [other.id, draft.id] } as never, ...admin, ...noRevalidate })),
    ).toMatch(new RegExp(`"${PREFIX} Liên Quan Nháp" chưa xuất bản`))
    expect(
      await fieldError(payload.update({ collection: 'products', id: host.id, data: { related: [host.id] } as never, ...admin, ...noRevalidate })),
    ).toMatch(/chính tài liệu này/)
  })

  it('mục đã chọn rồi bị "Ẩn tài liệu" vẫn được giữ: thêm mục khác vẫn lưu được, web chỉ hiện mục đang xuất bản', async () => {
    const admin = await as('admin')
    const hidden = await makeProduct(`${PREFIX} Liên Quan Sẽ Ẩn`)
    const added = await makeProduct(`${PREFIX} Liên Quan Thêm Sau`)
    const host = await makeProduct(`${PREFIX} Liên Quan Chủ 2`, { related: [hidden.id] })

    // "Ẩn tài liệu" trong admin = chuyển về bản nháp
    await payload.update({ collection: 'products', id: hidden.id, data: { _status: 'draft' } as never, ...asRoot, ...noRevalidate })

    const saved = await payload.update({
      collection: 'products',
      id: host.id,
      data: { related: [hidden.id, added.id], _status: 'published' } as never,
      ...admin,
      ...noRevalidate,
    })
    expect(ids(saved.related)).toEqual([hidden.id, added.id])

    const shown = await getRelatedProducts(saved)
    expect(shown.map((p) => p.id)).toEqual([added.id])
  })

  it('Bài viết liên quan: bản nháp bị từ chối khi lưu', async () => {
    const admin = await as('admin')
    const postCategory = (await payload.find({ collection: 'post-categories', limit: 1, ...asRoot })).docs[0]!.id
    const base = { category: postCategory, cover: mediaId, content: richText(['Nội dung thử.']) }
    const draft = await payload.create({
      collection: 'posts',
      data: { ...base, title: `${PREFIX} Bài Liên Quan Nháp`, _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...noRevalidate,
    })
    const host = await payload.create({
      collection: 'posts',
      data: { ...base, title: `${PREFIX} Bài Liên Quan Chủ`, _status: 'published' } as never,
      ...asRoot,
      ...noRevalidate,
    })
    try {
      expect(
        await fieldError(payload.update({ collection: 'posts', id: host.id, data: { related: [draft.id] } as never, ...admin, ...noRevalidate })),
      ).toMatch(new RegExp(`"${PREFIX} Bài Liên Quan Nháp" chưa xuất bản`))
    } finally {
      for (const id of [draft.id, host.id]) await payload.delete({ collection: 'posts', id, ...asRoot, ...noRevalidate })
    }
  })
})

describe('xóa danh mục (src/hooks/categories.ts)', () => {
  it('danh mục sản phẩm còn sản phẩm (kể cả bản nháp) thì không xóa được, báo rõ; trống thì xóa được', async () => {
    const admin = await as('admin')
    const used = await payload.create({ collection: 'product-categories', data: { name: `${PREFIX} DM Còn Hàng` }, ...asRoot, ...noRevalidate })
    const empty = await payload.create({ collection: 'product-categories', data: { name: `${PREFIX} DM Trống` }, ...asRoot, ...noRevalidate })
    const draft = await payload.create({
      collection: 'products',
      data: { name: `${PREFIX} SP Trong DM`, category: used.id, images: [{ image: mediaId }], _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...noRevalidate,
    })
    try {
      await expect(payload.delete({ collection: 'product-categories', id: used.id, ...admin, ...noRevalidate })).rejects.toThrow(
        // Chuỗi con: tên danh mục, số lượng, tên sản phẩm đang dùng
        `"${PREFIX} DM Còn Hàng": còn 1 sản phẩm đang dùng ("${PREFIX} SP Trong DM")`,
      )
      expect((await payload.findByID({ collection: 'product-categories', id: used.id, ...asRoot })).id).toBe(used.id)
      await payload.delete({ collection: 'product-categories', id: empty.id, ...admin, ...noRevalidate })
    } finally {
      await payload.delete({ collection: 'products', id: draft.id, ...asRoot, ...noRevalidate })
      await payload.delete({ collection: 'product-categories', id: used.id, ...asRoot, ...noRevalidate })
    }
  })

  it('danh mục bài viết còn bài viết thì không xóa được', async () => {
    const used = await payload.create({ collection: 'post-categories', data: { name: `${PREFIX} DM Bài` }, ...asRoot, ...noRevalidate })
    const post = await payload.create({
      collection: 'posts',
      data: { title: `${PREFIX} Bài Trong DM`, category: used.id, cover: mediaId, content: richText(['Nội dung thử.']), _status: 'published' } as never,
      ...asRoot,
      ...noRevalidate,
    })
    try {
      await expect(payload.delete({ collection: 'post-categories', id: used.id, ...(await as('admin')), ...noRevalidate })).rejects.toThrow(
        /còn 1 bài viết đang dùng/,
      )
    } finally {
      await payload.delete({ collection: 'posts', id: post.id, ...asRoot, ...noRevalidate })
      await payload.delete({ collection: 'post-categories', id: used.id, ...asRoot, ...noRevalidate })
    }
  })

  it('dữ liệu cũ đã mất danh mục (category = null) không làm hỏng mục liên quan', async () => {
    // Trước 26/10 xóa được danh mục đang dùng; sản phẩm, bài viết khi đó còn category null (typeof null === 'object')
    const product = (await payload.find({ collection: 'products', limit: 1, depth: 1, ...asRoot })).docs[0]!
    expect(await getRelatedProducts({ ...product, category: null as never, related: null })).toEqual([])
    const post = (await payload.find({ collection: 'posts', limit: 1, depth: 1, ...asRoot })).docs[0]!
    expect(await getRelatedPosts({ ...post, category: null as never, related: [null as never] })).toEqual([])
  })
})

describe('giới hạn độ dài tiêu đề, tên (src/fields/limits.ts)', () => {
  /** Lưu phải hỏng vì đúng ô `path` (Payload gom lỗi vào ValidationError.data.errors). */
  const rejectedAt = async (save: Promise<unknown>, path: string) => {
    const error = await save.then(
      () => null,
      (e: unknown) => e as { data?: { errors?: { path: string; message: string }[] } },
    )
    expect(error, 'lưu phải bị từ chối').not.toBeNull()
    expect(error?.data?.errors?.map((e) => e.path)).toContain(path)
  }
  const text = (length: number) => 'a'.repeat(length - 3) + 'end'

  it('tên sản phẩm: đúng mức lưu được, dài hơn bị từ chối', async () => {
    const ok = await makeProduct(`${PREFIX} ${text(MAX.productName - PREFIX.length - 1)}`)
    expect(ok.name.length).toBe(MAX.productName)
    await payload.delete({ collection: 'products', id: ok.id, ...asRoot, ...noRevalidate })
    await rejectedAt(makeProduct(`${PREFIX} ${text(MAX.productName - PREFIX.length)}`), 'name')
  })

  it('lưu nháp cũng bị chặn (Payload bỏ qua validate khi lưu nháp, hook enforceMaxLength thì không)', async () => {
    await rejectedAt(
      payload.create({
        collection: 'products',
        data: { name: `${PREFIX} ${text(MAX.productName - PREFIX.length)}`, _status: 'draft' } as never,
        draft: true,
        ...asRoot,
        ...noRevalidate,
      }),
      'name',
    )
  })

  it('tiêu đề bài viết, tên danh mục, tên thương hiệu dài hơn mức bị từ chối', async () => {
    const postCategory = (await payload.find({ collection: 'post-categories', limit: 1, ...asRoot })).docs[0]!.id
    await rejectedAt(
      payload.create({
        collection: 'posts',
        data: { title: text(MAX.postTitle + 1), category: postCategory, cover: mediaId, content: richText(['x']), _status: 'published' } as never,
        ...asRoot,
        ...noRevalidate,
      }),
      'title',
    )
    await rejectedAt(payload.create({ collection: 'product-categories', data: { name: text(MAX.categoryName + 1) }, ...asRoot, ...noRevalidate }), 'name')
    await rejectedAt(payload.updateGlobal({ slug: 'site-settings', data: { brandName: text(61) } as never, ...asRoot, ...noRevalidate }), 'brandName')
  })

  it('dữ liệu mẫu đều nằm trong mức', async () => {
    const longest = async (collection: 'products' | 'posts' | 'pages' | 'product-categories' | 'post-categories', field: string) => {
      const { docs } = await payload.find({ collection, limit: 1000, depth: 0, ...asRoot })
      return Math.max(0, ...docs.map((d) => String((d as unknown as Record<string, unknown>)[field] ?? '').length))
    }
    expect(await longest('products', 'name')).toBeLessThanOrEqual(MAX.productName)
    expect(await longest('posts', 'title')).toBeLessThanOrEqual(MAX.postTitle)
    expect(await longest('pages', 'title')).toBeLessThanOrEqual(MAX.pageTitle)
    expect(await longest('product-categories', 'name')).toBeLessThanOrEqual(MAX.categoryName)
    expect(await longest('post-categories', 'name')).toBeLessThanOrEqual(MAX.categoryName)
  })
})

describe('không lưu đè bản cũ khi mở cùng trang ở hai tab (src/hooks/staleSave.ts)', () => {
  it('form gửi updatedAt cũ hơn bản trong DB thì bị chặn 409, thay đổi của tab kia giữ nguyên', async () => {
    const opened = await payload.findGlobal({ slug: 'home', depth: 0, ...asRoot })
    const heading = opened.newsHeading ?? 'Tin tức'

    // Tab 2 mở cùng lúc, sửa rồi lưu trước
    await payload.updateGlobal({ slug: 'home', data: { newsHeading: `${heading} tab 2`, updatedAt: opened.updatedAt } as never, ...asRoot, ...noRevalidate })

    // Tab 1 lưu sau, form vẫn mang updatedAt lúc mở
    await expect(
      payload.updateGlobal({ slug: 'home', data: { newsHeading: heading, updatedAt: opened.updatedAt } as never, ...asRoot, ...noRevalidate }),
    ).rejects.toMatchObject({ status: 409, message: expect.stringMatching(/^Trang chủ đã được lưu ở tab hoặc máy khác lúc \d{2}:\d{2}:\d{2}/) })
    const now = await payload.findGlobal({ slug: 'home', depth: 0, ...asRoot })
    expect(now.newsHeading).toBe(`${heading} tab 2`)

    // Form mang updatedAt mới nhất (vừa lưu xong, hoặc đã tải lại) thì lưu được; gọi API không kèm updatedAt cũng vậy
    await payload.updateGlobal({ slug: 'home', data: { newsHeading: `${heading} lại`, updatedAt: now.updatedAt } as never, ...asRoot, ...noRevalidate })
    await payload.updateGlobal({ slug: 'home', data: { newsHeading: heading } as never, ...asRoot, ...noRevalidate })
    expect((await payload.findGlobal({ slug: 'home', depth: 0, ...asRoot })).newsHeading).toBe(heading)
  })

  it('áp cho cả Menu và Thông tin công ty', async () => {
    for (const slug of ['navigation', 'site-settings'] as const) {
      const opened = await payload.findGlobal({ slug, depth: 0, ...asRoot })
      await payload.updateGlobal({ slug, data: { updatedAt: opened.updatedAt } as never, ...asRoot, ...noRevalidate })
      await expect(payload.updateGlobal({ slug, data: { updatedAt: opened.updatedAt } as never, ...asRoot, ...noRevalidate })).rejects.toMatchObject({ status: 409 })
    }
  })
})
