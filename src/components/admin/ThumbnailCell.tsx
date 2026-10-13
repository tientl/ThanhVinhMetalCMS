import type { DefaultServerCellComponentProps } from 'payload'

import React from 'react'

import { mediaUrl } from '@/lib/media'
import type { Media } from '@/payload-types'

type Props = DefaultServerCellComponentProps & {
  /** Đường dẫn tới field ảnh trong document, ví dụ 'image' hoặc 'images.0.image' (ảnh đầu của bộ ảnh). */
  imagePath: string
}

const valueAt = (doc: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((cur, key) => (cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[key] : undefined), doc)

/**
 * Cột "Ảnh" trong danh sách quản trị (sản phẩm, danh mục): ảnh đại diện nhỏ đứng trước tên.
 * Danh sách tải document ở depth 0 nên ảnh chỉ là id, ô này tự lấy ảnh cỡ thumb ở server.
 * Bấm ảnh mở ảnh gốc phóng to; muốn mở trang sửa thì bấm tên (DocLinkCell).
 */
export const ThumbnailCell = async ({ imagePath, payload, rowData }: Props) => {
  const ref = valueAt(rowData, imagePath)
  let media: Media | null = null
  if (ref && typeof ref === 'object') media = ref as Media
  else if (ref) media = await payload.findByID({ collection: 'media', id: ref as number, depth: 0 }).catch(() => null)

  const src = mediaUrl(media, 'thumb')
  const thumb = src ? (
    // Bấm ảnh mở ảnh gốc phóng to (AdminImageViewer đọc data-image-viewer); bấm tên vẫn mở trang sửa
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={media?.alt || ''}
      className="thumb-cell is-viewable"
      loading="lazy"
      data-image-viewer={mediaUrl(media)}
      data-image-name={media?.filename || media?.alt || ''}
    />
  ) : (
    <span className="thumb-cell thumb-cell--empty" aria-label="Chưa có ảnh" />
  )

  return thumb
}

export default ThumbnailCell
