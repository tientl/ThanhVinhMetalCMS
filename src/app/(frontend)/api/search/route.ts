import { NextResponse } from 'next/server'

import { search } from '@/lib/data'
import { mediaUrl } from '@/lib/media'

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') || ''
  const { products, posts } = await search(q.slice(0, 100))
  return NextResponse.json({
    products: products.map((p) => ({ name: p.name, href: `/san-pham/${p.slug}`, image: mediaUrl(p.images?.[0]?.image, 'thumb') })),
    posts: posts.map((p) => ({ title: p.title, href: `/bai-viet/${p.slug}`, image: mediaUrl(p.cover, 'thumb') })),
  })
}
