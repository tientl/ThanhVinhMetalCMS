import Link from 'next/link'
import React from 'react'

import type { ProductCategory } from '@/payload-types'

export const CategoryChips = ({ categories, active }: { categories: ProductCategory[]; active?: string }) => {
  const base = 'inline-flex h-10 items-center border px-4 text-[12px] font-medium uppercase no-underline transition-colors'
  return (
    <nav aria-label="Danh mục sản phẩm" className="flex flex-wrap gap-2.5" style={{ letterSpacing: 1.6 }}>
      <Link href="/san-pham" className={`${base} ${!active ? 'border-accent bg-accent text-bg' : 'border-line-2 text-ink hover:border-accent'}`}>
        Tất cả
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/san-pham/danh-muc/${c.slug}`}
          className={`${base} ${active === c.slug ? 'border-accent bg-accent text-bg' : 'border-line-2 text-ink hover:border-accent'}`}
          aria-current={active === c.slug ? 'page' : undefined}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  )
}
