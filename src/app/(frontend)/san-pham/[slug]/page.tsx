import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { ProductJsonLd } from '@/components/layout/JsonLd'
import { ProductGallery } from '@/components/product/ProductGallery'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { IconChat, IconFile, IconPhone } from '@/components/ui/Icons'
import { ProductCard } from '@/components/ui/ProductCard'
import { RichText } from '@/components/ui/RichText'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getPayloadClient } from '@/lib/payload'
import { AS_GUEST, getProduct, getRelatedProducts, getSiteSettings } from '@/lib/data'
import { telHref, zaloHref } from '@/lib/format'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'products', limit: 500, select: { slug: true }, ...AS_GUEST })
  return res.docs.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return buildMetadata({
    title: product.name,
    description: product.summary,
    path: `/san-pham/${product.slug}`,
    meta: product.meta,
    image: product.images?.[0]?.image,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const [settings, related] = await Promise.all([getSiteSettings(), getRelatedProducts(product)])
  const category = typeof product.category === 'object' ? product.category : null

  return (
    <>
      <ProductJsonLd product={product} />
      <section className="section-x pt-[calc(var(--header-h)+32px)] md:pt-[calc(var(--header-h)+48px)]">
        <Breadcrumb
          items={[
            { label: 'Sản phẩm', href: '/san-pham' },
            ...(category ? [{ label: category.name, href: `/san-pham/danh-muc/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
      </section>

      <section className="section grid gap-10 !pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16 md:!pt-10">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="flex flex-col gap-6">
          {category && <span className="label-sm">{category.name}</span>}
          <h1 className="h-serif text-[28px] md:text-[36px]">{product.name}</h1>
          {product.summary && <p className="lead m-0">{product.summary}</p>}

          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-line pt-5 text-[15px]">
            <dt className="text-muted-2">Giá</dt>
            <dd className="m-0 font-semibold text-accent-text">{product.price || 'Liên hệ'}</dd>
            {product.material && (
              <>
                <dt className="text-muted-2">Vật liệu</dt>
                <dd className="m-0">{product.material}</dd>
              </>
            )}
            {(product.spec ?? []).map((s) => (
              <React.Fragment key={s.id}>
                <dt className="text-muted-2">{s.label}</dt>
                <dd className="m-0">{s.value}</dd>
              </React.Fragment>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            <a href={telHref(settings.hotline)} className="btn-solid gap-2.5">
              <IconPhone size={18} /> Gọi {settings.hotline}
            </a>
            {settings.zalo && (
              <a href={zaloHref(settings.zalo)} target="_blank" rel="noopener" className="btn-ghost gap-2.5">
                <IconChat size={18} /> Zalo
              </a>
            )}
            <Link href={`/lien-he?sp=${encodeURIComponent(product.name)}#bao-gia`} className="btn-ghost gap-2.5">
              <IconFile size={18} /> Yêu cầu báo giá
            </Link>
          </div>
          <p className="m-0 text-[13.5px] text-muted-2">Gửi bản vẽ DXF, DWG, PDF để nhận báo giá trong 24 giờ.</p>
        </div>
      </section>

      {product.description && (
        <section className="section-x pb-16 md:pb-24">
          <div className="max-w-[860px]">
            <h2 className="h-serif mb-6 text-[24px] md:text-[28px]">Mô tả chi tiết</h2>
            <RichText data={product.description} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section flex flex-col gap-10 bg-bg-alt">
          <SectionHeading title="Sản phẩm liên quan" />
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
