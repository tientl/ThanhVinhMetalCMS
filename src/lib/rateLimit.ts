/**
 * Giới hạn số lần gửi theo IP, lưu trong bộ nhớ tiến trình.
 * Đủ dùng cho một server PM2; đổi sang Redis nếu chạy nhiều tiến trình.
 */
const buckets = new Map<string, number[]>()

export const rateLimit = (key: string, max: number, windowMs: number): boolean => {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k)
  }
  return true
}

export const clientIp = (req: Request): string => {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
