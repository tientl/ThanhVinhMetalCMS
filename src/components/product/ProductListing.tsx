import React from 'react'

import { PageHero } from '@/components/ui/PageHero'
import { Pagination } from '@/components/ui/Pagination'
import { ProductCard } from '@/components/ui/ProductCard'
import { getCategories, getProducts } from '@/lib/data'
import type { ProductCategory } from '@/payload-types'

import { CategoryChips } from './CategoryChips'

type Props = { category?: ProductCategory | null; page: number }

export const ProductListing = async ({ category, page }: Props) => {
  const [categories, result] = await Promise.all([getCategories(), getProducts({ category: category?.id, page })])
  const basePath = category ? `/san-pham/danh-muc/${category.slug}` : '/san-pham'

  return (
    <>
      <PageHero
        title={category?.name || 'Sản phẩm'}
        intro={category?.description || 'Vách hoa văn, tấm đục lỗ, chữ và biển hiệu, vỏ tủ điện, mặt bích, bánh răng cắt laser và gia công theo bản vẽ.'}
        label={category ? 'Danh mục' : null}
        image={category?.image}
        crumbs={category ? [{ label: 'Sản phẩm', href: '/san-pham' }, { label: category.name }] : [{ label: 'Sản phẩm' }]}
      />
      <section className="section flex flex-col gap-10 bg-bg-alt">
        <CategoryChips categories={categories} active={category?.slug ?? undefined} />
        {result.docs.length === 0 ? (
          <p className="lead">Chưa có sản phẩm trong danh mục này.</p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {result.docs.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <Pagination page={result.page ?? 1} totalPages={result.totalPages} basePath={basePath} />
      </section>
    </>
  )
}
