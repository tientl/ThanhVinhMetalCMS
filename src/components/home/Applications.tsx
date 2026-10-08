'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { Img } from '@/components/ui/Img'
import type { Home, Product } from '@/payload-types'

type App = NonNullable<Home['applications']>[number]

export const Applications = ({ heading, intro, items }: { heading?: string | null; intro?: string | null; items: App[] }) => {
  const [active, setActive] = useState(0)
  if (!items.length) return null
  const tab = items[Math.min(active, items.length - 1)]
  const products = (tab.products ?? []).filter((p): p is Product => typeof p === 'object')

  return (
    <section id="ung-dung" className="section flex flex-col gap-8 bg-deep text-white lg:gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12" data-reveal>
        <h2 className="h-serif text-[30px] text-white md:text-[40px]">{heading || 'Khám phá ứng dụng cho công trình'}</h2>
        {intro && <p className="m-0 max-w-[440px] text-[17px] font-light leading-[1.75] text-muted">{intro}</p>}
      </div>

      <div role="tablist" aria-label="Loại công trình" className="flex gap-2 overflow-x-auto border-b border-line" data-reveal>
        {items.map((it, i) => (
          <button
            key={it.id ?? i}
            type="button"
            role="tab"
            id={`app-tab-${i}`}
            aria-selected={i === active}
            aria-controls="app-panel"
            onClick={() => setActive(i)}
            className="h-[52px] shrink-0 cursor-pointer border-0 border-b-[3px] bg-transparent px-4 text-[13px] font-medium text-white md:px-[22px]"
            style={{ borderBottomColor: i === active ? 'var(--color-accent)' : 'transparent', letterSpacing: 1.2 }}
          >
            {it.tabLabel}
          </button>
        ))}
      </div>

      <div id="app-panel" role="tabpanel" aria-labelledby={`app-tab-${active}`} className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14" data-reveal>
        <div key={`img-${active}`} className="relative h-[320px] overflow-hidden bg-surface sm:h-[420px] lg:h-[540px]">
          <div className="tab-fade absolute inset-0">
            <Img media={tab.image} size="wide" sizes="(min-width: 1024px) 60vw, 100vw" />
          </div>
          <div className="tab-fade absolute inset-0">
            {(tab.hotspots ?? []).map((h, i) => (
              <span
                key={h.id ?? i}
                className="absolute flex items-center gap-2.5"
                style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-11px, -11px)' }}
              >
                <span className="dot-pulse h-[22px] w-[22px] shrink-0 rounded-full border-[3px] border-white bg-accent" />
                <span className="whitespace-nowrap bg-[rgba(15,19,23,0.92)] px-3 py-1.5 text-[13px] font-semibold text-ink">{h.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div key={`txt-${active}`} className="flex flex-col justify-center gap-5">
          <h3 className="tab-fade h-serif text-[24px] md:text-[28px]" style={{ letterSpacing: 1.2 }}>
            {tab.title}
          </h3>
          {tab.description && <p className="tab-fade m-0 text-base font-light leading-[1.75] text-muted">{tab.description}</p>}
          {products.length > 0 && (
            <div className="tab-fade grid grid-cols-2 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/san-pham/${p.slug}`} className="flex items-center gap-3.5 text-white no-underline hover:text-accent-text">
                  <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-surface">
                    <Img media={p.images?.[0]?.image} size="thumb" sizes="72px" />
                  </span>
                  <span className="text-sm font-medium leading-[1.4]">{p.name}</span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/san-pham" className="btn-ghost self-start">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  )
}
