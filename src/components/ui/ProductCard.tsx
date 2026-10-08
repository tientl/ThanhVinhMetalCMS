import Link from 'next/link'
import React from 'react'

import type { Product } from '@/payload-types'

import { Img } from './Img'

export const ProductCard = ({ product }: { product: Product }) => {
  const cover = product.images?.[0]?.image
  const category = typeof product.category === 'object' ? product.category : null
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="zoom group flex flex-col gap-4 text-ink no-underline"
      data-reveal
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-surface">
        <Img media={cover} size="card" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      </span>
      <span className="flex flex-col gap-1.5">
        {category && <span className="label-sm">{category.name}</span>}
        <span className="h-serif text-[18px] md:text-[19px]" style={{ letterSpacing: 1.2 }}>
          {product.name}
        </span>
        {product.summary && <span className="line-clamp-2 text-[14px] font-light leading-relaxed text-muted">{product.summary}</span>}
        <span className="mt-1 text-[11px] font-semibold uppercase text-accent-text group-hover:text-accent-ghost" style={{ letterSpacing: 2 }}>
          {product.price && product.price !== 'Liên hệ' ? product.price : 'Xem sản phẩm'}
        </span>
      </span>
    </Link>
  )
}
