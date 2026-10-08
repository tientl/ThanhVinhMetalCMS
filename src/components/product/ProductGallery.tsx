'use client'

import React, { useState } from 'react'

import { Img } from '@/components/ui/Img'
import type { Product } from '@/payload-types'

export const ProductGallery = ({ images, name }: { images: NonNullable<Product['images']>; name: string }) => {
  const [active, setActive] = useState(0)
  const list = images.filter((i) => i.image)
  if (!list.length) return <div className="aspect-[4/3] bg-surface" />
  const current = list[Math.min(active, list.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div key={current.id ?? active} className="frame tab-fade relative aspect-[4/3] overflow-hidden bg-surface">
        <Img media={current.image} size="wide" alt={name} sizes="(min-width: 1024px) 55vw, 100vw" priority />
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
          {list.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              aria-label={`Ảnh ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className="relative aspect-square cursor-pointer overflow-hidden border bg-surface p-0"
              style={{ borderColor: i === active ? 'var(--color-accent)' : 'var(--color-line)' }}
            >
              <Img media={img.image} size="thumb" alt="" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
