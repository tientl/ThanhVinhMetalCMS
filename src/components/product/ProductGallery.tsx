'use client'

import React, { useState } from 'react'

import { IconExpand } from '@/components/ui/Icons'
import { Img } from '@/components/ui/Img'
import { Lightbox } from '@/components/ui/Lightbox'
import type { Product } from '@/payload-types'

export const ProductGallery = ({ images, name }: { images: NonNullable<Product['images']>; name: string }) => {
  const [active, setActive] = useState(0)
  const [viewing, setViewing] = useState<number | null>(null)
  const list = images.filter((i) => i.image)
  if (!list.length) return <div className="aspect-[4/3] rounded-card bg-surface" />
  const activeIndex = Math.min(active, list.length - 1)
  const current = list[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      <button
        key={current.id ?? active}
        type="button"
        aria-label={`Xem ảnh lớn: ${name}`}
        onClick={() => setViewing(activeIndex)}
        className="frame tab-fade group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-card border-0 bg-surface p-0"
      >
        <Img media={current.image} size="wide" alt={name} sizes="(min-width: 1024px) 55vw, 100vw" priority />
        <span
          aria-hidden="true"
          className="absolute bottom-7 right-7 flex h-10 w-10 items-center justify-center rounded-btn bg-[rgba(8,10,13,0.7)] text-white opacity-80 transition-opacity group-hover:opacity-100"
        >
          <IconExpand size={18} />
        </span>
      </button>
      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {list.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              aria-label={`Xem ảnh lớn ${i + 1}`}
              aria-current={i === active}
              // Bấm ảnh thu nhỏ mở thẳng ảnh đó phóng to; đóng lại thì ảnh chính đổi theo ảnh vừa xem
              onClick={() => {
                setActive(i)
                setViewing(i)
              }}
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-btn border bg-surface p-0"
              style={{ borderColor: i === active ? 'var(--color-accent)' : 'var(--color-line)' }}
            >
              <Img media={img.image} size="thumb" alt="" sizes="160px" />
            </button>
          ))}
        </div>
      )}
      {viewing !== null && (
        <Lightbox
          images={list.map((i) => i.image)}
          start={viewing}
          label={name}
          onClose={(i) => {
            setActive(i)
            setViewing(null)
          }}
        />
      )}
    </div>
  )
}
