export const formatDate = (value: string | null | undefined): string => {
  if (!value) return ''
  const d = new Date(value)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

export const telHref = (phone: string | null | undefined): string => `tel:${(phone || '').replace(/[^0-9+]/g, '')}`

export const zaloHref = (zalo: string | null | undefined): string => `https://zalo.me/${(zalo || '').replace(/[^0-9]/g, '')}`

/** Lấy ID video từ link YouTube. */
export const youtubeId = (url: string): string | null => {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/)
  return m ? m[1] : null
}
