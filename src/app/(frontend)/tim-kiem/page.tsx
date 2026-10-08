import type { Metadata } from 'next'
import React from 'react'

import { PageHero } from '@/components/ui/PageHero'
import { PostCard } from '@/components/ui/PostCard'
import { ProductCard } from '@/components/ui/ProductCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { search } from '@/lib/data'

type Props = { searchParams: Promise<{ q?: string }> }

export const metadata: Metadata = { title: 'Tìm kiếm', robots: { index: false } }

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const term = q.trim().slice(0, 100)
  const { products, posts } = await search(term)
  const total = products.length + posts.length

  return (
    <>
      <PageHero
        title={term ? `Kết quả cho “${term}”` : 'Tìm kiếm'}
        intro={term ? `${total} kết quả. Gõ không dấu vẫn tìm được.` : 'Nhập từ khóa vào ô tìm kiếm ở góc trên bên phải.'}
        crumbs={[{ label: 'Tìm kiếm' }]}
      />
      <section className="section flex flex-col gap-10 bg-bg-alt">
        <form action="/tim-kiem" role="search" className="flex max-w-[640px]">
          <label htmlFor="search-q" className="sr-only">
            Từ khóa
          </label>
          <input id="search-q" name="q" type="search" defaultValue={term} placeholder="Tìm sản phẩm, bài viết..." className="field h-[52px] min-w-0 flex-grow border-r-0" />
          <button type="submit" className="btn-solid h-[52px] shrink-0">
            Tìm
          </button>
        </form>

        {term && total === 0 && <p className="lead">Không tìm thấy kết quả. Thử từ khóa khác hoặc gọi 0946.272.467 để được tư vấn.</p>}

        {products.length > 0 && (
          <div className="flex flex-col gap-8">
            <SectionHeading title={`Sản phẩm (${products.length})`} />
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
        {posts.length > 0 && (
          <div className="flex flex-col gap-8">
            <SectionHeading title={`Bài viết (${posts.length})`} />
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} imageHeight={260} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
