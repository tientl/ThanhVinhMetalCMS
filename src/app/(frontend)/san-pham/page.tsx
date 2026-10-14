import type { Metadata } from 'next'
import React from 'react'

import { ProductListing } from '@/components/product/ProductListing'
import { buildMetadata } from '@/lib/metadata'

type Props = { searchParams: Promise<{ page?: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Sản phẩm',
    description: 'Vách hoa văn, tấm đục lỗ, chữ và biển hiệu, vỏ tủ điện, mặt bích, bánh răng cắt laser và gia công theo bản vẽ tại Bình Dương.',
    path: '/san-pham',
  })
}
export default async function ProductsPage({ searchParams }: Props) {
  const { page } = await searchParams
  return <ProductListing page={Math.max(1, Number(page) || 1)} />
}
