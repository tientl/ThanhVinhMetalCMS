import Link from 'next/link'
import React from 'react'

import { PageHero } from '@/components/ui/PageHero'
import { Pagination } from '@/components/ui/Pagination'
import { PostCard } from '@/components/ui/PostCard'
import { getPostCategories, getPosts } from '@/lib/data'
import type { PostCategory } from '@/payload-types'

type Props = { category?: PostCategory | null; page: number }

export const PostListing = async ({ category, page }: Props) => {
  const [categories, result] = await Promise.all([getPostCategories(), getPosts({ category: category?.id, page })])
  const basePath = category ? `/bai-viet/danh-muc/${category.slug}` : '/bai-viet'
  const chip = 'inline-flex h-10 items-center rounded-btn border px-4 text-[12px] font-medium uppercase no-underline transition-colors'

  return (
    <>
      <PageHero
        title={category?.name || 'Kiến thức và tin tức'}
        intro={category?.description || 'Kinh nghiệm chọn vật liệu, chuẩn bị bản vẽ và tin mới từ xưởng.'}
        crumbs={category ? [{ label: 'Bài viết', href: '/bai-viet' }, { label: category.name }] : [{ label: 'Bài viết' }]}
      />
      <section className="section flex flex-col gap-10 bg-bg-alt">
        <nav aria-label="Danh mục bài viết" className="flex flex-wrap gap-2.5" style={{ letterSpacing: 1.6 }}>
          <Link href="/bai-viet" className={`${chip} ${!category ? 'border-accent bg-accent text-bg' : 'border-line-2 text-ink hover:border-accent'}`}>
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/bai-viet/danh-muc/${c.slug}`}
              className={`${chip} ${category?.id === c.id ? 'border-accent bg-accent text-bg' : 'border-line-2 text-ink hover:border-accent'}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        {result.docs.length === 0 ? (
          <p className="lead">Chưa có bài viết.</p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {result.docs.map((p) => (
              <PostCard key={p.id} post={p} imageHeight={260} />
            ))}
          </div>
        )}
        <Pagination page={result.page ?? 1} totalPages={result.totalPages} basePath={basePath} />
      </section>
    </>
  )
}
