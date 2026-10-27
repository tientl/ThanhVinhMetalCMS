'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { mediaDims, type MediaRef } from '@/lib/media'

import { IconClose, IconNext, IconPrev } from './Icons'
import { Img } from './Img'

type Props = {
  images: MediaRef[]
  start: number
  label: string
  /** Trả về ảnh đang xem lúc đóng để bộ ảnh chọn theo. */
  onClose: (index: number) => void
}

const SWIPE_PX = 50

/**
 * Xem ảnh phóng to toàn màn hình.
 * Mũi tên trái, phải (bàn phím hoặc nút) hay vuốt để chuyển ảnh; Esc, nút Đóng hoặc bấm ra ngoài ảnh để đóng.
 */
export const Lightbox = ({ images, start, label, onClose }: Props) => {
  const [index, setIndex] = useState(start)
  const count = images.length
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)

  const go = (step: number) => setIndex((i) => (i + step + count) % count)
  // Ảnh gốc, không cắt: các cỡ hero, card… đều cắt theo khung (hero cắt 2:1 cho slider từ 13/10)
  const dims = mediaDims(images[index], 'original')
  const ratio = dims.width / dims.height

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(index)
      else if (e.key === 'ArrowLeft' && count > 1) setIndex((i) => (i - 1 + count) % count)
      else if (e.key === 'ArrowRight' && count > 1) setIndex((i) => (i + 1) % count)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [count, index, onClose])

  // Khóa cuộn trang phía sau, đưa focus vào nút Đóng, trả focus về chỗ cũ khi đóng
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      prevFocus?.focus()
    }
  }, [])

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()
  const navBtn =
    'absolute top-1/2 z-[1] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-[1.5px] border-white/60 bg-[rgba(8,10,13,0.6)] text-white hover:border-accent md:h-14 md:w-14'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh phóng to: ${label}`}
      className="dark-zone fade-in fixed inset-0 z-50 bg-[rgba(5,6,8,0.97)] text-white"
      onClick={() => onClose(index)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
        <span className="text-sm font-medium text-accent-text" style={{ letterSpacing: 3 }}>
          {count > 1 && `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={(e) => {
            stop(e)
            onClose(index)
          }}
          className="flex h-11 cursor-pointer items-center gap-2 border border-white/40 bg-transparent px-4 text-[13px] font-semibold text-white hover:border-accent"
        >
          <IconClose size={18} /> Đóng
        </button>
      </div>

      {/* Khung đo bằng container query: ảnh phóng vừa khung theo đúng tỉ lệ, kể cả ảnh gốc nhỏ hơn màn hình */}
      <div className="absolute inset-x-3 bottom-14 top-16 @container-size md:inset-x-24 md:bottom-16 md:top-20">
        <div key={index} className="tab-fade flex h-full w-full items-center justify-center">
          <span onClick={stop} className="contents">
            <Img
              media={images[index]}
              size="original"
              fill={false}
              sizes="100vw"
              className="h-auto"
              style={{ width: `min(100cqw, 100cqh * ${ratio})` }}
            />
          </span>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={(e) => {
              stop(e)
              go(-1)
            }}
            className={`${navBtn} left-3 md:left-6`}
          >
            <IconPrev />
          </button>
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={(e) => {
              stop(e)
              go(1)
            }}
            className={`${navBtn} right-3 md:right-6`}
          >
            <IconNext />
          </button>
        </>
      )}

      <p className="absolute inset-x-4 bottom-0 m-0 flex h-14 items-center justify-center truncate text-center text-sm text-soft md:h-16">{label}</p>
    </div>,
    document.body,
  )
}
