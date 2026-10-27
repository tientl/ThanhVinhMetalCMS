export const formatDate = (value: string | null | undefined): string => {
  if (!value) return ''
  const d = new Date(value)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

const VN_OFFSET_MS = 7 * 60 * 60 * 1000

/** Thời điểm 0 giờ hôm nay theo giờ Việt Nam (UTC+7, không đổi giờ theo mùa), không phụ thuộc múi giờ máy chủ. */
/** Giờ theo múi giờ Việt Nam, ví dụ 14:05:32 */
export const timeVN = (value: string | Date): string =>
  new Date(value).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const startOfDayVN = (now: Date = new Date()): Date => {
  const local = new Date(now.getTime() + VN_OFFSET_MS)
  local.setUTCHours(0, 0, 0, 0)
  return new Date(local.getTime() - VN_OFFSET_MS)
}

export const telHref =(phone: string | null | undefined): string => `tel:${(phone || '').replace(/[^0-9+]/g, '')}`

export const zaloHref = (zalo: string | null | undefined): string => `https://zalo.me/${(zalo || '').replace(/[^0-9]/g, '')}`

/** Lấy ID video từ link YouTube. */
export const youtubeId = (url: string): string | null => {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/)
  return m ? m[1] : null
}
