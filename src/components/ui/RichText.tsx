import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'
import React from 'react'

import { Img } from '@/components/ui/Img'
import { youtubeId } from '@/lib/format'
import { isMedia, type MediaRef } from '@/lib/media'
import type { Page, Post, PostCategory, Product, ProductCategory } from '@/payload-types'

type YouTubeFields = { blockType: 'youtube'; url: string; caption?: string | null }
type YouTubeGridFields = { blockType: 'youtubeGrid'; items: YouTubeFields[] }

/** Nút "Mối quan hệ" trong trình soạn thảo: liên kết tới một bản ghi, đã được nạp sẵn khi depth >= 1. */
type RelationshipNode =
  | { type: 'relationship'; relationTo: 'products'; value: number | Product }
  | { type: 'relationship'; relationTo: 'posts'; value: number | Post }
  | { type: 'relationship'; relationTo: 'pages'; value: number | Page }
  | { type: 'relationship'; relationTo: 'product-categories'; value: number | ProductCategory }
  | { type: 'relationship'; relationTo: 'post-categories'; value: number | PostCategory }
  | { type: 'relationship'; relationTo: string; value: unknown }

/** Thẻ liên kết cho từng loại bản ghi: đường dẫn, nhãn, tiêu đề, ảnh. */
const relationshipCard = (node: RelationshipNode): { href: string; kind: string; title: string; image?: MediaRef } | null => {
  const v = node.value
  if (!v || typeof v !== 'object') return null
  switch (node.relationTo) {
    case 'products': {
      const p = v as Product
      return { href: `/san-pham/${p.slug}`, kind: 'Sản phẩm', title: p.name, image: p.images?.[0]?.image }
    }
    case 'posts': {
      const p = v as Post
      return { href: `/bai-viet/${p.slug}`, kind: 'Bài viết', title: p.title, image: p.cover }
    }
    case 'pages': {
      const p = v as Page
      return { href: `/${p.slug}`, kind: 'Trang', title: p.title, image: p.cover }
    }
    case 'product-categories': {
      const c = v as ProductCategory
      return { href: `/san-pham/danh-muc/${c.slug}`, kind: 'Danh mục sản phẩm', title: c.name, image: c.image }
    }
    case 'post-categories': {
      const c = v as PostCategory
      return { href: `/bai-viet/danh-muc/${c.slug}`, kind: 'Danh mục bài viết', title: c.name }
    }
    default:
      return null
  }
}

const converters: JSXConvertersFunction<SerializedBlockNode<YouTubeFields> | SerializedBlockNode<YouTubeGridFields>> = ({ defaultConverters }) => ({
  ...defaultConverters,
  relationship: ({ node }) => {
    const card = relationshipCard(node as unknown as RelationshipNode)
    if (!card) return null
    return (
      <Link href={card.href} className="not-prose my-6 flex items-center gap-4 border border-line bg-surface p-3 no-underline transition-colors hover:border-accent">
        {isMedia(card.image) && (
          <span className="relative block h-16 w-24 shrink-0 overflow-hidden bg-deep">
            <Img media={card.image} size="thumb" sizes="96px" />
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wider text-muted-2">{card.kind}</span>
          <span className="font-semibold text-ink">{card.title}</span>
        </span>
      </Link>
    )
  },
  blocks: {
    youtube: ({ node }) => <YouTubeEmbed fields={node.fields as YouTubeFields} className="my-8" />,
    // Nhiều video liền nhau: xếp 2 cột (do groupYouTube() gom lại trước khi render)
    youtubeGrid: ({ node }) => {
      const items = (node.fields as unknown as YouTubeGridFields).items
      return (
        <div className="not-prose my-8 grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          {items.map((f, i) => (
            <YouTubeEmbed key={i} fields={f} />
          ))}
        </div>
      )
    },
  },
})

const YouTubeEmbed = ({ fields, className = '' }: { fields: YouTubeFields; className?: string }) => {
  const id = youtubeId(fields.url)
  if (!id) return null
  return (
    <figure className={className}>
      <div className="relative aspect-video w-full overflow-hidden bg-deep">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={fields.caption || 'Video YouTube'}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {fields.caption && <figcaption className="mt-2 text-sm text-muted-2">{fields.caption}</figcaption>}
    </figure>
  )
}

type AnyNode = { type: string; fields?: { blockType?: string }; children?: AnyNode[] }

/**
 * Gom các khối "Video YouTube" đứng liền nhau (không có đoạn chữ xen giữa, kể cả đoạn trống)
 * thành một khối lưới để hiện 2 cột. Một video đứng riêng vẫn hiện toàn chiều rộng.
 */
const groupYouTube = (data: SerializedEditorState): SerializedEditorState => {
  const root = data.root as unknown as AnyNode
  if (!root?.children) return data
  const isYT = (n: AnyNode) => n.type === 'block' && n.fields?.blockType === 'youtube'
  const isEmptyParagraph = (n: AnyNode) => n.type === 'paragraph' && !(n.children && n.children.length)
  const out: AnyNode[] = []
  let run: AnyNode[] = []
  const flush = () => {
    if (run.length >= 2) {
      out.push({ type: 'block', version: 2, format: '', fields: { blockType: 'youtubeGrid', items: run.map((n) => n.fields) } } as unknown as AnyNode)
    } else out.push(...run)
    run = []
  }
  for (const n of root.children) {
    if (isYT(n)) run.push(n)
    else if (run.length && isEmptyParagraph(n)) continue
    else {
      flush()
      out.push(n)
    }
  }
  flush()
  return { ...data, root: { ...data.root, children: out as never } }
}

export const RichText = ({ data, className }: { data: SerializedEditorState | null | undefined; className?: string }) => {
  if (!data) return null
  return <LexicalRichText data={groupYouTube(data)} converters={converters} className={`prose-lux ${className ?? ''}`} />
}
