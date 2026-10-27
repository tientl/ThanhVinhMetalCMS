import Link from 'next/link'
import React from 'react'

import type { MediaRef } from '@/lib/media'

import { FramedImage } from './FramedImage'

type Props = {
  href: string
  image: MediaRef
  /** "Vùng ảnh muốn giữ" (ô imageFrame của trang chủ) */
  frame?: unknown
  title: string
  subtitle?: string | null
  tag?: string | null
  height?: number | 'full'
  titleSize?: number
  strong?: boolean
  cta?: string | null
  sizes?: string
  priority?: boolean
}

/** Ô ảnh có viền mảnh accent, overlay tối từ dưới và chữ góc dưới trái. */
export const ImageCard = ({ href, image, frame, title, subtitle, tag, height = 'full', titleSize = 30, strong, cta, sizes = '50vw', priority }: Props) => (
  <Link
    href={href}
    className={`dark-zone zoom frame group relative block w-full overflow-hidden bg-deep text-white no-underline ${height === 'full' ? 'h-full' : ''}`}
    style={height === 'full' ? undefined : { height }}
    data-reveal
  >
    <FramedImage media={image} frame={frame} sizes={sizes} priority={priority} />
    <span className={`absolute inset-0 ${strong ? 'overlay-up-strong' : 'overlay-up'}`} />
    <span className={`absolute flex flex-col gap-2 ${strong ? 'left-8 right-8 bottom-10 gap-3.5 md:left-12 md:right-12 md:bottom-12' : 'left-8 right-8 bottom-[30px]'}`}>
      {tag && <span className="label-sm">{tag}</span>}
      <span className="h-serif" style={{ fontSize: titleSize, letterSpacing: 1.2 }}>
        {title}
      </span>
      {subtitle && <span className="max-w-[480px] text-[15px] font-light leading-[1.65] text-soft wrap-anywhere md:text-base">{subtitle}</span>}
      {cta && <span className="link-ghost mt-1">{cta}</span>}
    </span>
  </Link>
)
