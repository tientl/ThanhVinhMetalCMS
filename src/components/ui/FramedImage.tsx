import React from 'react'

import { FRAME_CONTAINER, frameBoxStyle, parseFrame, scaleSizes } from '@/lib/frame'
import { isMedia, type MediaRef } from '@/lib/media'

import { Img } from './Img'

type Props = {
  media: MediaRef
  /** Giá trị ô `imageFrame` của khối trên trang chủ */
  frame?: unknown
  sizes: string
  priority?: boolean
}

/**
 * Ảnh phủ kín khung cha (khung cha cần position và kích thước, như Img fill).
 * Có "Vùng ảnh muốn giữ" chọn trong admin thì phóng theo vùng đó (src/lib/frame.ts), dùng ảnh gốc cho đủ nét;
 * chưa chọn thì như cũ: cỡ wide, căn theo điểm lấy nét.
 */
export const FramedImage = ({ media, frame, sizes, priority }: Props) => {
  const picked = isMedia(media) ? parseFrame(frame, media.id) : null
  if (!picked || !isMedia(media) || !media.width || !media.height) {
    return <Img media={media} size="wide" sizes={sizes} priority={priority} />
  }
  return (
    <div style={FRAME_CONTAINER}>
      <div style={frameBoxStyle({ width: media.width, height: media.height }, picked)}>
        <Img media={media} size="original" sizes={scaleSizes(sizes, picked)} priority={priority} />
      </div>
    </div>
  )
}
