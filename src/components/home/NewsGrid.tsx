import Link from 'next/link'
import React from 'react'

import { PostCard } from '@/components/ui/PostCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Post } from '@/payload-types'

export const NewsGrid = ({ heading, intro, posts }: { heading?: string | null; intro?: string | null; posts: Post[] }) => {
  if (!posts.length) return null
  return (
    <section id="tin-tuc" className="section flex flex-col gap-10 bg-bg-alt lg:gap-11">
      <SectionHeading
        title={heading || 'Kiến thức và tin tức'}
        intro={intro}
        action={
          <Link href="/bai-viet" className="link-ghost shrink-0 no-underline hover:underline">
            Xem tất cả
          </Link>
        }
      />
      <div id="kien-thuc" className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  )
}
