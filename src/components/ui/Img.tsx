import Image from 'next/image'
import React from 'react'

import { isMedia, mediaAlt, mediaDims, mediaUrl, type MediaRef, type MediaSize } from '@/lib/media'

type Props = {
  media: MediaRef
  size?: MediaSize
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  style?: React.CSSProperties
  quality?: number
}

/** Ảnh từ Payload media qua next/image. Khi không có ảnh, hiện ô nền tối. */
export const Img = ({ media, size = 'card', alt, className, sizes, priority, fill = true, style, quality = 85 }: Props) => {
  if (!isMedia(media)) {
    return <div className={`bg-surface ${fill ? 'absolute inset-0' : ''} ${className ?? ''}`} aria-hidden="true" />
  }
  const src = mediaUrl(media, size)
  const dims = mediaDims(media, size)
  const altText = alt ?? mediaAlt(media)
  const common = {
    src,
    className,
    sizes,
    priority,
    quality,
    style,
  }
  if (fill) {
    return <Image {...common} alt={altText} fill style={{ objectFit: 'cover', ...style }} />
  }
  return <Image {...common} alt={altText} width={dims.width} height={dims.height} />
}
