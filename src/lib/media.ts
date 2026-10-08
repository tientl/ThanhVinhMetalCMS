import type { Media } from '@/payload-types'

export type MediaRef = Media | number | string | null | undefined
export type MediaSize = 'thumb' | 'card' | 'wide' | 'hero' | 'og'

export const isMedia = (m: MediaRef): m is Media => Boolean(m && typeof m === 'object')

/** Đường dẫn tĩnh của ảnh (ưu tiên cỡ yêu cầu, lùi về ảnh gốc). */
export const mediaUrl = (m: MediaRef, size?: MediaSize): string => {
  if (!isMedia(m)) return ''
  const sized = size ? m.sizes?.[size] : undefined
  const url = sized?.url || m.url || ''
  return url.replace('/api/media/file/', '/media/')
}

export const mediaAlt = (m: MediaRef, fallback = ''): string => (isMedia(m) ? m.alt || fallback : fallback)

export const mediaDims = (m: MediaRef, size?: MediaSize) => {
  if (!isMedia(m)) return { width: 1600, height: 1000 }
  const sized = size ? m.sizes?.[size] : undefined
  return {
    width: sized?.width || m.width || 1600,
    height: sized?.height || m.height || 1000,
  }
}
