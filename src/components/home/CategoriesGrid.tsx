import Link from 'next/link'
import React from 'react'

import { Img } from '@/components/ui/Img'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ProductCategory } from '@/payload-types'

export const CategoriesGrid = ({ heading, items }: { heading?: string | null; items: ProductCategory[] }) => {
  if (!items.length) return null
  return (
    <section id="danh-muc" className="section flex flex-col gap-10 bg-bg-alt lg:gap-11">
      <SectionHeading title={heading || 'Tìm hiểu sản phẩm theo danh mục'} align="center" />
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Link key={c.id} href={`/san-pham/danh-muc/${c.slug}`} className="zoom flex flex-col gap-4 text-ink no-underline" data-reveal>
            <span className="relative block aspect-[4/3] overflow-hidden rounded-card bg-surface">
              <Img media={c.image} size="card" alt={c.name} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
            </span>
            <span className="flex items-center justify-between gap-3">
              <span className="h-display text-[18px] md:text-[19px]" style={{ letterSpacing: 1.2 }}>
                {c.name}
              </span>
              <span className="shrink-0 text-[11px] font-semibold uppercase text-accent-text" style={{ letterSpacing: 2 }}>
                Xem sản phẩm
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
