import { beforeAll, describe, expect, it } from 'vitest'

import type { Payload } from 'payload'

import {
  PRODUCTS_PER_PAGE,
  getCategories,
  getCategory,
  getFeaturedProducts,
  getHome,
  getNavigation,
  getPage,
  getPost,
  getPostCategories,
  getPosts,
  getProduct,
  getProducts,
  getRelatedPosts,
  getRelatedProducts,
  getSiteSettings,
  search,
} from '@/lib/data'

import { RELATED } from '@/lib/related'
import type { Post, Product } from '@/payload-types'
import { richText } from '@/seed/lexical'

import { asRoot, getTestPayload, getUser } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await getTestPayload()
})

describe('global', () => {
  it('getSiteSettings trả thông tin thương hiệu', async () => {
    const settings = await getSiteSettings()
    expect(settings.brandName).toBeTruthy()
    expect(settings.hotline).toBeTruthy()
  })

  it('getNavigation trả menu', async () => {
    const nav = await getNavigation()
    expect(nav).toBeTruthy()
  })

  it('getHome trả nội dung trang chủ', async () => {
    const home = await getHome()
    expect(home).toBeTruthy()
    expect(home.metaTitle).toBeTruthy()
  })
})

describe('danh mục sản phẩm', () => {
  it('getCategories trả danh sách đã sắp xếp', async () => {
    const categories = await getCategories()
    expect(categories.length).toBeGreaterThan(0)
    expect(categories[0]!.slug).toBeTruthy()
  })

  it('getCategory tìm đúng theo slug', async () => {
    const [first] = await getCategories()
    const found = await getCategory(first!.slug!)
    expect(found?.id).toBe(first!.id)
  })

  it('getCategory trả null khi slug không có', async () => {
    expect(await getCategory('khong-ton-tai-gi-ca')).toBeNull()
  })
})

describe('sản phẩm', () => {
  it('getProducts phân trang theo PRODUCTS_PER_PAGE', async () => {
    const res = await getProducts({ page: 1 })
    expect(res.docs.length).toBeLessThanOrEqual(PRODUCTS_PER_PAGE)
    expect(res.page).toBe(1)
    expect(res.totalDocs).toBeGreaterThan(0)
  })

  it('getProducts xếp sản phẩm nổi bật lên trước', async () => {
    const res = await getProducts({ page: 1, limit: 50 })
    const flags = res.docs.map((d) => Boolean(d.featured))
    const firstNonFeatured = flags.indexOf(false)
    if (firstNonFeatured !== -1) {
      expect(flags.slice(firstNonFeatured)).not.toContain(true)
    }
  })

  it('getProducts lọc đúng theo danh mục', async () => {
    const [category] = await getCategories()
    const res = await getProducts({ category: category!.id, limit: 50 })
    expect(res.docs.length).toBeGreaterThan(0)
    for (const doc of res.docs) {
      const id = typeof doc.category === 'object' ? doc.category.id : doc.category
      expect(id).toBe(category!.id)
    }
  })

  it('getFeaturedProducts chỉ trả sản phẩm nổi bật', async () => {
    const docs = await getFeaturedProducts(6)
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.length).toBeLessThanOrEqual(6)
    for (const doc of docs) expect(doc.featured).toBe(true)
  })

  it('getProduct tìm theo slug và trả null khi không có', async () => {
    const { docs } = await getProducts({ limit: 1 })
    const slug = docs[0]!.slug!
    const found = await getProduct(slug)
    expect(found?.slug).toBe(slug)
    expect(await getProduct('khong-ton-tai-gi-ca')).toBeNull()
  })

  it('getRelatedProducts lấy sản phẩm cùng danh mục khi chưa chọn tay', async () => {
    const { docs } = await getProducts({ limit: 100 })
    const byCategory = new Map<number, typeof docs>()
    for (const doc of docs) {
      const id = typeof doc.category === 'object' ? doc.category.id : doc.category
      byCategory.set(id, [...(byCategory.get(id) ?? []), doc])
    }
    // Cần một danh mục có từ 2 sản phẩm thì mới có cái để gợi ý.
    const group = [...byCategory.values()].find((g) => g.length > 1)
    expect(group, 'cần ít nhất một danh mục có 2 sản phẩm').toBeTruthy()
    const product = group!.find((d) => !d.related || d.related.length === 0) ?? group![0]

    const related = await getRelatedProducts(product!, 4)
    expect(related.length).toBeGreaterThan(0)
    expect(related.length).toBeLessThanOrEqual(4)
    expect(related.map((r) => r.id)).not.toContain(product!.id)

    if (!product!.related || product!.related.length === 0) {
      const categoryId = typeof product!.category === 'object' ? product!.category.id : product!.category
      for (const r of related) {
        const id = typeof r.category === 'object' ? r.category.id : r.category
        expect(id).toBe(categoryId)
      }
    }
  })

  it('getRelatedProducts ưu tiên danh sách biên tập viên chọn tay', async () => {
    const { docs } = await getProducts({ limit: 100 })
    const [a, b] = docs
    const created = await payload.create({
      collection: 'products',
      data: {
        name: 'Zz Test Data Có Liên Quan Chọn Tay',
        category: typeof a!.category === 'object' ? a!.category.id : a!.category,
        images: (a!.images ?? []).map((row) => ({
          image: typeof row.image === 'object' ? row.image.id : row.image,
        })),
        _status: 'published',
      } as never,
      ...asRoot,
      context: { disableRevalidate: true },
    })

    // Gán sản phẩm liên quan sau khi đã có id, đúng như thao tác trong admin.
    await payload.update({
      collection: 'products',
      id: created.id,
      data: { related: [b!.id] } as never,
      ...asRoot,
      context: { disableRevalidate: true },
    })

    const full = await payload.findByID({ collection: 'products', id: created.id, depth: 1, ...asRoot })
    const related = await getRelatedProducts(full, 4)
    expect(related[0]!.id).toBe(b!.id)

    await payload.delete({
      collection: 'products',
      id: created.id,
      ...asRoot,
      context: { disableRevalidate: true },
    })
  })
})

describe('bài viết', () => {
  it('getPostCategories trả danh sách', async () => {
    const categories = await getPostCategories()
    expect(categories.length).toBeGreaterThan(0)
  })

  it('getPosts sắp xếp mới nhất lên trước', async () => {
    const res = await getPosts({ limit: 50 })
    expect(res.docs.length).toBeGreaterThan(0)
    const dates = res.docs.map((d) => new Date(d.publishedAt ?? d.createdAt).getTime())
    const sorted = [...dates].sort((a, b) => b - a)
    expect(dates).toEqual(sorted)
  })

  it('getPost tìm theo slug và trả null khi không có', async () => {
    const res = await getPosts({ limit: 1 })
    const slug = res.docs[0]!.slug!
    expect((await getPost(slug))?.slug).toBe(slug)
    expect(await getPost('khong-ton-tai-gi-ca')).toBeNull()
  })

  it('getRelatedPosts không trả về chính bài đang xem', async () => {
    const res = await getPosts({ limit: 1 })
    const post = res.docs[0]!
    const related = await getRelatedPosts(post, 3)
    expect(related.length).toBeLessThanOrEqual(3)
    expect(related.map((r) => r.id)).not.toContain(post.id)
  })

  it('bài viết liên quan chọn tay: hiện đủ 6; chọn 7 thì admin chặn; để trống tự lấy 3', async () => {
    // Trước 26/10/2026 chọn 6 chỉ hiện 3 (src/lib/related.ts)
    const { docs } = await payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, limit: 8, depth: 0, ...asRoot })
    const [host, ...others] = docs
    expect(others.length).toBeGreaterThanOrEqual(RELATED.posts.picked + 1)
    const ctx = { context: { disableRevalidate: true } }
    try {
      const six = others.slice(0, RELATED.posts.picked).map((p) => p.id)
      await payload.update({ collection: 'posts', id: host!.id, data: { related: six }, ...asRoot, ...ctx })
      const full = await payload.findByID({ collection: 'posts', id: host!.id, depth: 1, overrideAccess: false })
      expect((await getRelatedPosts(full)).map((p) => p.id)).toEqual(six)

      const seven = others.slice(0, RELATED.posts.picked + 1).map((p) => p.id)
      await expect(payload.update({ collection: 'posts', id: host!.id, data: { related: seven }, ...asRoot, ...ctx })).rejects.toThrow()

      await payload.update({ collection: 'posts', id: host!.id, data: { related: [] }, ...asRoot, ...ctx })
      const empty = await payload.findByID({ collection: 'posts', id: host!.id, depth: 1, overrideAccess: false })
      expect((await getRelatedPosts(empty)).length).toBeLessThanOrEqual(RELATED.posts.auto)
    } finally {
      await payload.update({ collection: 'posts', id: host!.id, data: { related: [] }, ...asRoot, ...ctx })
    }
  })
})

describe('trang tĩnh', () => {
  it('getPage tìm theo slug', async () => {
    const pages = await payload.find({ collection: 'pages', limit: 1, ...asRoot })
    const slug = pages.docs[0]!.slug!
    expect((await getPage(slug))?.slug).toBe(slug)
  })

  it('getPage trả null khi slug không có', async () => {
    expect(await getPage('khong-ton-tai-gi-ca')).toBeNull()
  })
})

describe('tìm kiếm', () => {
  it('tìm được sản phẩm khi gõ có dấu', async () => {
    const { docs } = await getProducts({ limit: 1 })
    const name = docs[0]!.name
    const res = await search(name)
    expect(res.products.map((p) => p.id)).toContain(docs[0]!.id)
  })

  it('tìm được đúng sản phẩm đó khi gõ không dấu', async () => {
    const { docs } = await getProducts({ limit: 1 })
    const noAccent = docs[0]!.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
    const res = await search(noAccent)
    expect(res.products.map((p) => p.id)).toContain(docs[0]!.id)
  })

  it('không phân biệt chữ hoa chữ thường', async () => {
    const { docs } = await getProducts({ limit: 1 })
    const res = await search(docs[0]!.name.toUpperCase())
    expect(res.products.map((p) => p.id)).toContain(docs[0]!.id)
  })

  it('trả rỗng khi từ khóa rỗng hoặc chỉ có khoảng trắng', async () => {
    expect(await search('')).toEqual({ products: [], posts: [] })
    expect(await search('   ')).toEqual({ products: [], posts: [] })
  })

  it('trả rỗng khi không khớp gì', async () => {
    const res = await search('zzz khong co gi khop zzz')
    expect(res.products).toHaveLength(0)
    expect(res.posts).toHaveLength(0)
  })

  it('tìm được cả bài viết', async () => {
    const res = await getPosts({ limit: 1 })
    const found = await search(res.docs[0]!.title)
    expect(found.posts.map((p) => p.id)).toContain(res.docs[0]!.id)
  })
})

describe('bản nháp không lên website', () => {
  const PREFIX = 'Zz Test Nháp'
  const ctx = { context: { disableRevalidate: true } }
  let draftProduct: Product
  let publishedProduct: Product
  let hiddenProduct: Product
  let draftPost: Post
  let authoredPost: Post

  beforeAll(async () => {
    for (const collection of ['products', 'posts', 'pages'] as const) {
      const field = collection === 'products' ? 'name' : 'title'
      await payload.delete({ collection, where: { [field]: { like: `${PREFIX}%` } }, ...asRoot, ...ctx })
    }
    const { docs } = await getProducts({ limit: 1 })
    const base = docs[0]!
    const category = typeof base.category === 'object' ? base.category.id : base.category
    const images = (base.images ?? []).map((row) => ({ image: typeof row.image === 'object' ? row.image.id : row.image }))

    // Sản phẩm chỉ lưu nháp, chưa xuất bản lần nào (như "phong cảnh" khách gặp ngày 12/10/2026)
    draftProduct = await payload.create({
      collection: 'products',
      data: { name: `${PREFIX} Sản Phẩm`, category, images, featured: true, _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...ctx,
    })
    publishedProduct = await payload.create({
      collection: 'products',
      data: { name: `${PREFIX} Sản Phẩm Đã Đăng`, category, images, _status: 'published' } as never,
      ...asRoot,
      ...ctx,
    })
    // Sản phẩm được chọn vào "Sản phẩm liên quan" lúc đang xuất bản, sau đó bị "Ẩn tài liệu" (thành bản nháp).
    // Từ 25/10/2026 không chọn mới được bản nháp (src/fields/publishedOnly.ts), nên đây là đường duy nhất còn lại.
    hiddenProduct = await payload.create({
      collection: 'products',
      data: { name: `${PREFIX} Sản Phẩm Sẽ Ẩn`, category, images, _status: 'published' } as never,
      ...asRoot,
      ...ctx,
    })
    await payload.update({ collection: 'products', id: publishedProduct.id, data: { related: [hiddenProduct.id] } as never, ...asRoot, ...ctx })
    await payload.update({ collection: 'products', id: hiddenProduct.id, data: { _status: 'draft' } as never, ...asRoot, ...ctx })

    const posts = await getPosts({ limit: 1 })
    const basePost = posts.docs[0]!
    const postData = {
      category: typeof basePost.category === 'object' ? basePost.category.id : basePost.category,
      cover: typeof basePost.cover === 'object' ? basePost.cover.id : basePost.cover,
      content: richText(['Nội dung thử.']),
    }
    draftPost = await payload.create({
      collection: 'posts',
      data: { ...postData, title: `${PREFIX} Bài Viết`, _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...ctx,
    })
    const admin = await getUser('admin')
    authoredPost = await payload.create({
      collection: 'posts',
      data: { ...postData, title: `${PREFIX} Bài Có Tác Giả`, author: admin.id, _status: 'published' } as never,
      ...asRoot,
      ...ctx,
    })
    await payload.create({
      collection: 'pages',
      data: { title: `${PREFIX} Trang`, slug: 'zz-test-nhap-trang', content: richText(['Nội dung thử.']), _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...ctx,
    })
  })

  it('sản phẩm nháp không có trong danh sách, nổi bật, chi tiết, tìm kiếm', async () => {
    const category = typeof draftProduct.category === 'object' ? draftProduct.category.id : draftProduct.category
    const list = await getProducts({ category, limit: 100 })
    expect(list.docs.map((p) => p.id)).not.toContain(draftProduct.id)
    expect((await getFeaturedProducts(100)).map((p) => p.id)).not.toContain(draftProduct.id)
    expect(await getProduct(draftProduct.slug!)).toBeNull()
    expect((await search(PREFIX)).products.map((p) => p.id)).not.toContain(draftProduct.id)
  })

  it('sản phẩm đã chọn rồi bị ẩn không hiện trong "Sản phẩm liên quan" của sản phẩm đã đăng', async () => {
    const product = await getProduct(publishedProduct.slug!)
    expect(product).not.toBeNull()
    const related = await getRelatedProducts(product!, 4)
    expect(related.map((p) => p.id)).not.toContain(hiddenProduct.id)
  })

  it('bài viết nháp không có trong danh sách, chi tiết, tìm kiếm', async () => {
    expect((await getPosts({ limit: 100 })).docs.map((p) => p.id)).not.toContain(draftPost.id)
    expect(await getPost(draftPost.slug!)).toBeNull()
    expect((await search(PREFIX)).posts.map((p) => p.id)).not.toContain(draftPost.id)
  })

  it('"Mối quan hệ" trong nội dung: bản đã xuất bản được nạp đủ cho thẻ, bản nháp không lộ ra (chỉ còn id)', async () => {
    // Ô soạn thảo vẫn cho chọn bản nháp; web đọc dưới quyền khách nên bản nháp không được nạp, thẻ liên kết tự ẩn
    const content = richText(['Xem thêm:'])
    const relation = (id: number) => ({ type: 'relationship', version: 2, format: '', relationTo: 'products', value: id })
    content.root.children.push(relation(publishedProduct.id) as never, relation(draftProduct.id) as never)
    const page = await payload.create({
      collection: 'pages',
      data: { title: `${PREFIX} Trang Quan Hệ`, slug: 'zz-test-quan-he', content, _status: 'published' } as never,
      ...asRoot,
      ...ctx,
    })
    try {
      const seen = await getPage('zz-test-quan-he')
      const nodes = (seen!.content!.root.children as unknown as { type: string; value: unknown }[]).filter((n) => n.type === 'relationship')
      const [published, draft] = nodes.map((n) => n.value)
      // Thẻ cần tên, slug, ảnh: bản đã xuất bản được nạp thành object
      expect(published && typeof published === 'object' ? (published as Product).name : null).toBe(publishedProduct.name)
      expect(published && typeof published === 'object' ? (published as Product).slug : null).toBe(publishedProduct.slug)
      // Bản nháp: không phải object (không có tên, nội dung), RichText bỏ qua không vẽ thẻ
      expect(draft === null || typeof draft !== 'object').toBe(true)
    } finally {
      await payload.delete({ collection: 'pages', id: page.id, ...asRoot, ...ctx })
    }
  })

  it('trang tĩnh nháp không mở được', async () => {
    expect(await getPage('zz-test-nhap-trang')).toBeNull()
  })

  it('bài đã đăng không lộ tài khoản người viết ra web (tên nội bộ như "Quản trị", email)', async () => {
    // Từ 26/10/2026 trang bài viết chỉ hiện ngày đăng; khách không đọc được tài khoản nên author chỉ còn là id
    const post = await getPost(authoredPost.slug!)
    expect(post).not.toBeNull()
    expect(post!.author === null || typeof post!.author !== 'object').toBe(true)
  })
})
