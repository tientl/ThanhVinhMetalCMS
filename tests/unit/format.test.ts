import { describe, expect, it } from 'vitest'

import { formatDate, telHref, youtubeId, zaloHref } from '@/lib/format'

describe('formatDate', () => {
  it('định dạng ngày theo kiểu Việt Nam dd/MM/yyyy', () => {
    expect(formatDate('2026-03-09T10:20:30.000Z')).toBe('09/03/2026')
  })

  it('trả chuỗi rỗng khi không có giá trị', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })
})

describe('telHref', () => {
  it('bỏ mọi ký tự không phải số, giữ dấu cộng', () => {
    expect(telHref('0946.272.467')).toBe('tel:0946272467')
    expect(telHref('+84 946 272 467')).toBe('tel:+84946272467')
    expect(telHref('(0274) 123-456')).toBe('tel:0274123456')
  })

  it('không vỡ khi thiếu số điện thoại', () => {
    expect(telHref(null)).toBe('tel:')
    expect(telHref(undefined)).toBe('tel:')
  })
})

describe('zaloHref', () => {
  it('chỉ giữ chữ số trong link Zalo', () => {
    expect(zaloHref('0946.272.467')).toBe('https://zalo.me/0946272467')
    expect(zaloHref('+84 946272467')).toBe('https://zalo.me/84946272467')
  })

  it('không vỡ khi thiếu số Zalo', () => {
    expect(zaloHref(null)).toBe('https://zalo.me/')
  })
})

describe('youtubeId', () => {
  it('lấy được ID từ các dạng link YouTube', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('trả null khi không phải link YouTube', () => {
    expect(youtubeId('https://example.com/video')).toBeNull()
    expect(youtubeId('')).toBeNull()
  })
})
