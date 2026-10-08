import { cache } from 'react'

import type { Post, Product } from '@/payload-types'
import { normalizeSearch } from '@/utilities/unaccent'

import { getPayloadClient } from './payload'

export const PRODUCTS_PER_PAGE = 12
export const POSTS_PER_PAGE = 12

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
  return payload.findGlobal({ slug: 'home', depth: 2 })
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
  })
  return res.docs[0] ?? null
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
    }),
    payload.find({
      collection: 'posts',
      where: { searchText: { like: term } },
      sort: '-publishedAt',
      limit: 24,
      depth: 1,
    }),
  ])
  return { products: products.docs, posts: posts.docs }
})
