import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { PageHero } from '@/components/ui/PageHero'
import { RichText } from '@/components/ui/RichText'
import { getPayloadClient } from '@/lib/payload'
import { getPage } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'pages', limit: 100, select: { slug: true } })
  return res.docs.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return buildMetadata({ title: page.title, description: page.intro, path: `/${page.slug}`, meta: page.meta, image: page.cover })
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <>
      <PageHero title={page.title} intro={page.intro} image={page.cover} crumbs={[{ label: page.title }]} />
      <section className="section-x py-12 md:py-20">
        <div className="max-w-[860px]">
          <RichText data={page.content} />
        </div>
      </section>
    </>
  )
}
