import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { ProductListing } from '@/components/product/ProductListing'
import { getCategories, getCategory } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return {}
  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/san-pham/danh-muc/${category.slug}`,
    image: category.image,
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams])
  const category = await getCategory(slug)
  if (!category) notFound()
  return <ProductListing category={category} page={Math.max(1, Number(page) || 1)} />
}
