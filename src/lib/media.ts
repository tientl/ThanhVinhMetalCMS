import type { Media } from '@/payload-types'

export type MediaRef = Media | number | string | null | undefined
/**
 * Cỡ ảnh Payload tạo sẵn (src/collections/Media.ts): thumb 300×300, card 800×600, hero 2400×1200, og 1200×630 là
 * cắt sẵn theo khung; wide (rộng 1600) giữ tỉ lệ. 'original': ảnh gốc, không cắt (vd. xem ảnh phóng to).
 */
export type MediaSize = 'thumb' | 'card' | 'wide' | 'hero' | 'og' | 'original'

/** Cỡ ảnh đã tạo sẵn; 'original' (hoặc không truyền) thì không có, dùng ảnh gốc. */
export const sizedOf = (m: Media, size?: MediaSize) => (size && size !== 'original' ? m.sizes?.[size] : undefined)

export const isMedia = (m: MediaRef): m is Media => Boolean(m && typeof m === 'object')

/**
 * Đường dẫn tĩnh của ảnh (ưu tiên cỡ yêu cầu, lùi về ảnh gốc), kèm `?v=` theo lần sửa ảnh.
 * Thay tệp hay chọn lại vùng, điểm lấy nét thì Payload ghi đè các cỡ ảnh nhưng giữ nguyên tên tệp
 * (`screen-800x600.webp`). Bộ tối ưu ảnh của Next (mặc định giữ 4 giờ) và trình duyệt lưu theo đường dẫn, nên
 * không có `?v=` thì chỗ đã từng tải ảnh (thẻ sản phẩm…) vẫn hiện ảnh cũ. Ảnh không đổi thì đường dẫn giữ nguyên.
 */
export const mediaUrl = (m: MediaRef, size?: MediaSize): string => {
  if (!isMedia(m)) return ''
  const sized = sizedOf(m, size)
  const url = (sized?.url || m.url || '').replace('/api/media/file/', '/media/')
  const version = m.updatedAt ? Date.parse(m.updatedAt) : NaN
  if (!url || !Number.isFinite(version)) return url
  return `${url}${url.includes('?') ? '&' : '?'}v=${version.toString(36)}`
}

export const mediaAlt = (m: MediaRef, fallback = ''): string => (isMedia(m) ? m.alt || fallback : fallback)

export const mediaDims = (m: MediaRef, size?: MediaSize) => {
  if (!isMedia(m)) return { width: 1600, height: 1000 }
  const sized = sizedOf(m, size)
  return {
    width: sized?.width || m.width || 1600,
    height: sized?.height || m.height || 1000,
  }
}
