import Link from 'next/link'
import React from 'react'

import { formatDate } from '@/lib/format'
import type { Post } from '@/payload-types'

import { Img } from './Img'

export const PostCard = ({ post, imageHeight = 230 }: { post: Post; imageHeight?: number }) => {
  const category = typeof post.category === 'object' ? post.category : null
  return (
    <Link href={`/bai-viet/${post.slug}`} className="zoom flex flex-col gap-3.5 text-ink no-underline" data-reveal>
      <span className="relative block w-full overflow-hidden rounded-card bg-surface" style={{ height: imageHeight }}>
        <Img media={post.cover} size="card" sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" />
      </span>
      {category && <span className="label-sm">{category.name}</span>}
      <span className="line-clamp-3 text-[20px] font-semibold leading-[1.4] wrap-anywhere">{post.title}</span>
      <span className="text-xs font-medium text-accent-ghost underline decoration-accent underline-offset-[6px]" style={{ letterSpacing: 1.5 }}>
        {post.publishedAt ? formatDate(post.publishedAt) : 'Đọc thêm'}
      </span>
    </Link>
  )
}
