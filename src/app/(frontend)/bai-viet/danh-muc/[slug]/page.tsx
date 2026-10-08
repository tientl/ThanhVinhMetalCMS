import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { PostListing } from '@/components/post/PostListing'
import { getPostCategories, getPostCategory } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateStaticParams() {
  const categories = await getPostCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getPostCategory(slug)
  if (!category) return {}
  return buildMetadata({ title: category.name, description: category.description, path: `/bai-viet/danh-muc/${category.slug}` })
}

export default async function PostCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams])
  const category = await getPostCategory(slug)
  if (!category) notFound()
  return <PostListing category={category} page={Math.max(1, Number(page) || 1)} />
}
