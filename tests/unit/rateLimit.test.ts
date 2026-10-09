import { afterEach, describe, expect, it, vi } from 'vitest'

import { clientIp, rateLimit } from '@/lib/rateLimit'

// Mỗi test dùng key riêng vì bộ đếm nằm chung trong bộ nhớ tiến trình.
let n = 0
const key = () => `test-${Date.now()}-${n++}`

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimit', () => {
  it('cho qua đúng số lần tối đa rồi chặn', () => {
    const k = key()
    expect(rateLimit(k, 3, 60_000)).toBe(true)
    expect(rateLimit(k, 3, 60_000)).toBe(true)
    expect(rateLimit(k, 3, 60_000)).toBe(true)
    expect(rateLimit(k, 3, 60_000)).toBe(false)
    expect(rateLimit(k, 3, 60_000)).toBe(false)
  })

  it('đếm riêng cho từng key', () => {
    const a = key()
    const b = key()
    expect(rateLimit(a, 1, 60_000)).toBe(true)
    expect(rateLimit(a, 1, 60_000)).toBe(false)
    expect(rateLimit(b, 1, 60_000)).toBe(true)
  })

  it('cho gửi lại sau khi hết cửa sổ thời gian', () => {
    vi.useFakeTimers()
    const k = key()
    expect(rateLimit(k, 2, 60_000)).toBe(true)
    expect(rateLimit(k, 2, 60_000)).toBe(true)
    expect(rateLimit(k, 2, 60_000)).toBe(false)

    vi.advanceTimersByTime(60_001)
    expect(rateLimit(k, 2, 60_000)).toBe(true)
  })

  it('giữ chặn khi chưa hết cửa sổ thời gian', () => {
    vi.useFakeTimers()
    const k = key()
    expect(rateLimit(k, 1, 60_000)).toBe(true)
    vi.advanceTimersByTime(59_000)
    expect(rateLimit(k, 1, 60_000)).toBe(false)
  })
})

describe('clientIp', () => {
  const req = (headers: Record<string, string>) => new Request('http://localhost/api/quote', { headers })

  it('lấy IP đầu tiên trong x-forwarded-for', () => {
    expect(clientIp(req({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9')
  })

  it('bỏ khoảng trắng thừa', () => {
    expect(clientIp(req({ 'x-forwarded-for': '  203.0.113.9  ' }))).toBe('203.0.113.9')
  })

  it('lùi về x-real-ip khi không có x-forwarded-for', () => {
    expect(clientIp(req({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('trả unknown khi không có header nào', () => {
    expect(clientIp(req({}))).toBe('unknown')
  })
})
