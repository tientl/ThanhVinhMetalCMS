import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerSideURL()
  const payload = await getPayloadClient()

  const [products, categories, posts, postCategories, pages] = await Promise.all([
    payload.find({ collection: 'products', limit: 1000, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'product-categories', limit: 100, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'posts', limit: 1000, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'post-categories', limit: 50, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'pages', limit: 100, select: { slug: true, updatedAt: true } }),
  ])

  const entry = (path: string, updatedAt?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date(),
    priority,
  })

  return [
    entry('/', undefined, 1),
    entry('/san-pham', undefined, 0.9),
    entry('/bai-viet', undefined, 0.7),
    entry('/lien-he', undefined, 0.8),
    ...categories.docs.map((c) => entry(`/san-pham/danh-muc/${c.slug}`, c.updatedAt, 0.8)),
    ...products.docs.map((p) => entry(`/san-pham/${p.slug}`, p.updatedAt, 0.7)),
    ...postCategories.docs.map((c) => entry(`/bai-viet/danh-muc/${c.slug}`, c.updatedAt, 0.5)),
    ...posts.docs.map((p) => entry(`/bai-viet/${p.slug}`, p.updatedAt, 0.6)),
    ...pages.docs.map((p) => entry(`/${p.slug}`, p.updatedAt, 0.5)),
  ]
}
