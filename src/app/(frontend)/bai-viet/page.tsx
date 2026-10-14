import type { Metadata } from 'next'
import React from 'react'

import { PostListing } from '@/components/post/PostListing'
import { buildMetadata } from '@/lib/metadata'

type Props = { searchParams: Promise<{ page?: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Kiến thức và tin tức',
    description: 'Kinh nghiệm chọn vật liệu, chuẩn bị bản vẽ cắt laser và tin mới từ xưởng Thành Vinh Metal.',
    path: '/bai-viet',
  })
}
export default async function PostsPage({ searchParams }: Props) {
  const { page } = await searchParams
  return <PostListing page={Math.max(1, Number(page) || 1)} />
}
