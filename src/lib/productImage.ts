import type { Product } from '@/payload-types'

import { isMedia, mediaUrl } from './media'

/** Chặn bản ghi cũ đã xuất bản nhưng thiếu ảnh hoặc trỏ tới tệp không phải ảnh. */
export const hasUsableProductCover = (product: Product): boolean => {
  const cover = product.images?.[0]?.image
  return isMedia(cover) && Boolean(cover.mimeType?.startsWith('image/')) && Boolean(mediaUrl(cover, 'card'))
}
