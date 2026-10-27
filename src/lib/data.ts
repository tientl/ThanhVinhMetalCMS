import { cache } from 'react'

import type { Post, Product } from '@/payload-types'
import { normalizeSearch } from '@/utilities/unaccent'
import { hasUsableProductCover } from './productImage'

import { getPayloadClient } from './payload'
import { RELATED } from './related'
import { readStats } from './visitors'

export const PRODUCTS_PER_PAGE = 12
export const POSTS_PER_PAGE = 12

/**
 * Truy vấn cho website chạy dưới quyền khách: Local API mặc định bỏ qua phân quyền,
 * nên phải tắt để quy tắc "khách chỉ thấy bản đã xuất bản" (publishedOrLoggedIn) được áp dụng.
 * Quan hệ được populate (sản phẩm liên quan, sản phẩm trong tab Ứng dụng...) cũng qua phân quyền,
 * bản nháp chỉ còn là id và bị các hàm bên dưới bỏ qua.
 */
export const AS_GUEST = { overrideAccess: false } as const

export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})

export const getNavigation = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'navigation', depth: 1 })
})

export const getHome = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home', depth: 2, ...AS_GUEST })
})

export const getCategories = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'product-categories',
    sort: 'order',
    limit: 50,
    depth: 1, ...AS_GUEST,})
  return res.docs
})

export const getCategory = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'product-categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1, ...AS_GUEST,})
  return res.docs[0] ?? null
})

export const getProducts = cache(
  async ({ category, page = 1, limit = PRODUCTS_PER_PAGE }: { category?: number; page?: number; limit?: number }) => {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products',
      where: category ? { category: { equals: category } } : undefined,
      sort: ['-featured', '-updatedAt'],
      page,
      limit,
      depth: 1,
      ...AS_GUEST,
    })
    return { ...result, docs: result.docs.filter(hasUsableProductCover) }
  },
)

export const getFeaturedProducts = cache(async (limit = 6) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { featured: { equals: true } },
    sort: '-updatedAt',
    limit,
    depth: 1,
    ...AS_GUEST,
  })
  return res.docs.filter(hasUsableProductCover)
})

export const getProduct = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    ...AS_GUEST,
  })
  const product = res.docs[0]
  return product && hasUsableProductCover(product) ? product : null
})

/**
 * Id của một ô quan hệ (đã nạp thành object hay chỉ là id), `null` khi trống.
 * Không viết `typeof x === 'object' ? x.id : x`: `typeof null` cũng là 'object', đọc `.id` của null là trang lỗi 500
 * (gặp ngày 26/10/2026 khi sản phẩm còn trỏ tới danh mục đã bị xóa).
 */
const relationId = (value: unknown): number | string | null => {
  if (value && typeof value === 'object') return (value as { id: number | string }).id ?? null
  return typeof value === 'number' || typeof value === 'string' ? value : null
}

export const getRelatedProducts = cache(async (product: Product, limit: number = RELATED.products.auto, pickedLimit: number = RELATED.products.picked): Promise<Product[]> => {
  const payload = await getPayloadClient()
  const pickedIds = (product.related ?? [])
    .map(relationId)
    .filter((id): id is number | string => id !== null)
    .slice(0, pickedLimit)
  // Quan hệ được nạp ở độ sâu thấp có thể thiếu thông tin ảnh; đọc lại từng sản phẩm dưới quyền khách.
  if (pickedIds.length > 0) {
    const picked = await Promise.all(pickedIds.map((id) =>
      payload.findByID({ collection: 'products', id, depth: 1, ...AS_GUEST }).catch(() => null),
    ))
    return picked.filter((p): p is Product => Boolean(p && hasUsableProductCover(p)))
  }

  // Chưa có danh mục (danh mục cũ đã bị xóa) thì không có "cùng danh mục" để lấy
  const categoryId = relationId(product.category)
  if (categoryId === null) return []
  const res = await payload.find({
    collection: 'products',
    where: {
      and: [
        { category: { equals: categoryId } },
        { id: { not_in: [product.id] } },
      ],
    },
    sort: '-updatedAt',
    limit,
    depth: 1,
    ...AS_GUEST,
  })
  return res.docs.filter(hasUsableProductCover)
})

export const getPostCategories = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'post-categories', limit: 20, sort: 'createdAt', ...AS_GUEST,})
  return res.docs
})

export const getPostCategory = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'post-categories',
    where: { slug: { equals: slug } },
    limit: 1, ...AS_GUEST,})
  return res.docs[0] ?? null
})

export const getPosts = cache(
  async ({ category, page = 1, limit = POSTS_PER_PAGE }: { category?: number; page?: number; limit?: number }) => {
    const payload = await getPayloadClient()
    return payload.find({
      collection: 'posts',
      where: category ? { category: { equals: category } } : undefined,
      sort: '-publishedAt',
      page,
      limit,
      depth: 1,
      ...AS_GUEST,
    })
  },
)

export const getPost = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    ...AS_GUEST,
  })
  // Không hiện người viết ngoài web (26/10/2026): tên tài khoản là tên nội bộ ("Nhân viên", "Quản trị"), không phải
  // tác giả thật. Khách không đọc được tài khoản nên `author` ở đây chỉ là id; không tra thêm tên.
  return res.docs[0] ?? null
})

export const getRelatedPosts = cache(async (post: Post, limit: number = RELATED.posts.auto, pickedLimit: number = RELATED.posts.picked): Promise<Post[]> => {
  const picked = (post.related ?? []).filter((p): p is Post => Boolean(p) && typeof p === 'object')
  // Đã chọn thì hiện đúng những gì đã chọn; để trống mới tự lấy cùng danh mục
  if (picked.length > 0) return picked.slice(0, pickedLimit)

  const payload = await getPayloadClient()
  const categoryId = relationId(post.category)
  if (categoryId === null) return []
  const res = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { category: { equals: categoryId } },
        { id: { not_in: [post.id, ...picked.map((p) => p.id)] } },
      ],
    },
    sort: '-publishedAt',
    limit: limit - picked.length,
    depth: 1,
    ...AS_GUEST,
  })
  return [...picked, ...res.docs]
})

export const getPage = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2, // nạp cả ảnh của bản ghi được chèn qua "Mối quan hệ" trong nội dung
    ...AS_GUEST,
  })
  return res.docs[0] ?? null
})

/** Tìm sản phẩm và bài viết, so khớp trên bản không dấu. */
export const search = cache(async (q: string) => {
  const term = normalizeSearch(q)
  if (!term) return { products: [] as Product[], posts: [] as Post[] }

  const payload = await getPayloadClient()
  const [products, posts] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { searchText: { like: term } },
      limit: 24,
      depth: 1,
      ...AS_GUEST,
    }),
    payload.find({
      collection: 'posts',
      where: { searchText: { like: term } },
      sort: '-publishedAt',
      limit: 24,
      depth: 1,
      ...AS_GUEST,
    }),
  ])
  return { products: products.docs.filter(hasUsableProductCover), posts: posts.docs }
})

/** Số liệu bộ đếm truy cập cho footer. */
export const getVisitorStats = cache(async () => readStats(await getPayloadClient()))
