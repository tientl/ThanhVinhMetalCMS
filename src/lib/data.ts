import { cache } from 'react'

import type { Post, Product, User } from '@/payload-types'
import { normalizeSearch } from '@/utilities/unaccent'

import { getPayloadClient } from './payload'

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
    depth: 1,
  })
  return res.docs
})

export const getCategory = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'product-categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
})

export const getProducts = cache(
  async ({ category, page = 1, limit = PRODUCTS_PER_PAGE }: { category?: number; page?: number; limit?: number }) => {
    const payload = await getPayloadClient()
    return payload.find({
      collection: 'products',
      where: category ? { category: { equals: category } } : undefined,
      sort: ['-featured', '-updatedAt'],
      page,
      limit,
      depth: 1,
      ...AS_GUEST,
    })
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
  return res.docs
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
  return res.docs[0] ?? null
})

export const getRelatedProducts = cache(async (product: Product, limit = 4): Promise<Product[]> => {
  const picked = (product.related ?? []).filter((p): p is Product => typeof p === 'object')
  if (picked.length >= limit) return picked.slice(0, limit)

  const payload = await getPayloadClient()
  const categoryId = typeof product.category === 'object' ? product.category.id : product.category
  const res = await payload.find({
    collection: 'products',
    where: {
      and: [
        { category: { equals: categoryId } },
        { id: { not_in: [product.id, ...picked.map((p) => p.id)] } },
      ],
    },
    sort: '-updatedAt',
    limit: limit - picked.length,
    depth: 1,
    ...AS_GUEST,
  })
  return [...picked, ...res.docs]
})

export const getPostCategories = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'post-categories', limit: 20, sort: 'createdAt' })
  return res.docs
})

export const getPostCategory = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'post-categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
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
  const post = res.docs[0]
  if (!post) return null
  // Tài khoản không công khai với khách nên người viết chỉ còn là id: lấy riêng tên để hiện dưới tiêu đề
  if (post.author && typeof post.author !== 'object') {
    const author = await payload
      .findByID({ collection: 'users', id: post.author, depth: 0, select: { name: true } })
      .catch(() => null)
    if (author) return { ...post, author: { id: author.id, name: author.name } as User }
  }
  return post
})

export const getRelatedPosts = cache(async (post: Post, limit = 3): Promise<Post[]> => {
  const picked = (post.related ?? []).filter((p): p is Post => typeof p === 'object')
  if (picked.length >= limit) return picked.slice(0, limit)

  const payload = await getPayloadClient()
  const categoryId = typeof post.category === 'object' ? post.category.id : post.category
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
    depth: 1,
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
  return { products: products.docs, posts: posts.docs }
})
