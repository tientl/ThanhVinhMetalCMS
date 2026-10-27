import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Img } from '@/components/ui/Img'
import { PostCard } from '@/components/ui/PostCard'
import { RichText } from '@/components/ui/RichText'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ShareBar } from '@/components/ui/ShareBar'
import { getPayloadClient } from '@/lib/payload'
import { AS_GUEST, getPost, getRelatedPosts } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { buildMetadata } from '@/lib/metadata'
import { getServerSideURL } from '@/utilities/getURL'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'posts', limit: 500, select: { slug: true }, ...AS_GUEST })
  return res.docs.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return buildMetadata({ title: post.title, description: post.excerpt, path: `/bai-viet/${post.slug}`, meta: post.meta, image: post.cover, type: 'article' })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const related = await getRelatedPosts(post)
  const category = typeof post.category === 'object' ? post.category : null

  return (
    <article>
      <section className="dark-zone relative overflow-hidden bg-deep pt-[var(--header-h)]">
        <Img media={post.cover} size="wide" className="opacity-35" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/70 to-deep/20" />
        {/* Đầu bài và nội dung rộng hết khung như trang tĩnh, mô tả sản phẩm (khách chọn ngày 26/10/2026) */}
        <div className="section-x relative">
          <div className="flex flex-col gap-5 py-16 md:py-24">
            <Breadcrumb items={[{ label: 'Bài viết', href: '/bai-viet' }, ...(category ? [{ label: category.name, href: `/bai-viet/danh-muc/${category.slug}` }] : []), { label: post.title }]} />
            {category && <span className="label-sm">{category.name}</span>}
            <h1 className="text-[30px] font-semibold leading-[1.2] wrap-anywhere md:text-[44px]">{post.title}</h1>
            {/* Chỉ ngày đăng, không hiện tên tài khoản người viết (tên nội bộ trong admin) */}
            {post.publishedAt && (
              <p className="m-0 text-sm text-muted-2">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section-x py-12 md:py-20">
        <div className="article-column prose-wide">
          {post.excerpt && <p className="lead mb-8 border-l-[3px] border-accent pl-5 text-ink">{post.excerpt}</p>}
          <RichText data={post.content} />
          <div className="mt-10 border-t border-line pt-6">
            <ShareBar url={`${getServerSideURL()}/bai-viet/${post.slug}`} title={post.title} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section flex flex-col gap-10 bg-bg-alt">
          <SectionHeading title="Bài viết liên quan" />
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} imageHeight={260} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
