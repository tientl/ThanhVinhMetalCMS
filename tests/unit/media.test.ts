import { describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'
import { isMedia, mediaAlt, mediaDims, mediaUrl } from '@/lib/media'

const media = (overrides: Partial<Media>): Media =>
  ({
    id: 1,
    alt: 'Ảnh mẫu',
    url: '/api/media/file/anh-goc.jpg',
    width: 2000,
    height: 1200,
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as Media

describe('isMedia', () => {
  it('phân biệt được object ảnh với ID và giá trị rỗng', () => {
    expect(isMedia(media({}))).toBe(true)
    expect(isMedia(12)).toBe(false)
    expect(isMedia('12')).toBe(false)
    expect(isMedia(null)).toBe(false)
    expect(isMedia(undefined)).toBe(false)
  })
})

describe('mediaUrl', () => {
  // updatedAt của ảnh mẫu (2026-01-01) viết gọn theo cơ số 36
  const v = `?v=${Date.parse('2026-01-01T00:00:00.000Z').toString(36)}`

  it('đổi đường dẫn API thành đường dẫn tĩnh /media', () => {
    expect(mediaUrl(media({}))).toBe(`/media/anh-goc.jpg${v}`)
  })

  it('đường dẫn đổi theo lần sửa ảnh (thay tệp, chọn lại vùng) để bộ đệm lấy ảnh mới; không sửa thì giữ nguyên', () => {
    const before = mediaUrl(media({}), 'card')
    expect(mediaUrl(media({}), 'card')).toBe(before)
    expect(mediaUrl(media({ updatedAt: '2026-10-25T17:15:55.472Z' }), 'card')).not.toBe(before)
  })

  it('thiếu updatedAt thì trả đường dẫn trơn', () => {
    expect(mediaUrl(media({ updatedAt: undefined as never }))).toBe('/media/anh-goc.jpg')
  })

  it('ưu tiên ảnh đúng cỡ được yêu cầu', () => {
    const m = media({ sizes: { card: { url: '/api/media/file/anh-card.webp', width: 800, height: 600 } } })
    expect(mediaUrl(m, 'card')).toBe(`/media/anh-card.webp${v}`)
  })

  it("'original' luôn là ảnh gốc không cắt, kể cả khi đã có các cỡ cắt sẵn", () => {
    const m = media({ sizes: { hero: { url: '/api/media/file/anh-2400x1200.webp', width: 2400, height: 1200 } } })
    expect(mediaUrl(m, 'original')).toBe(`/media/anh-goc.jpg${v}`)
    expect(mediaDims(m, 'original')).toEqual({ width: 2000, height: 1200 })
  })

  it('lùi về ảnh gốc khi chưa có cỡ đó', () => {
    const m = media({ sizes: { card: { url: '/api/media/file/anh-card.webp', width: 800, height: 600 } } })
    expect(mediaUrl(m, 'hero')).toBe(`/media/anh-goc.jpg${v}`)
  })

  it('trả chuỗi rỗng khi chưa populate ảnh', () => {
    expect(mediaUrl(7)).toBe('')
    expect(mediaUrl(null)).toBe('')
    expect(mediaUrl(undefined, 'thumb')).toBe('')
  })
})

describe('mediaAlt', () => {
  it('lấy alt của ảnh', () => {
    expect(mediaAlt(media({ alt: 'Vách hoa văn' }))).toBe('Vách hoa văn')
  })

  it('dùng giá trị dự phòng khi thiếu alt hoặc chưa populate', () => {
    expect(mediaAlt(media({ alt: '' }), 'Thành Vinh Metal')).toBe('Thành Vinh Metal')
    expect(mediaAlt(5, 'Thành Vinh Metal')).toBe('Thành Vinh Metal')
    expect(mediaAlt(null)).toBe('')
  })
})

describe('mediaDims', () => {
  it('lấy kích thước theo cỡ ảnh yêu cầu', () => {
    const m = media({ sizes: { thumb: { url: '/x.webp', width: 300, height: 300 } } })
    expect(mediaDims(m, 'thumb')).toEqual({ width: 300, height: 300 })
  })

  it('lùi về kích thước ảnh gốc', () => {
    expect(mediaDims(media({}))).toEqual({ width: 2000, height: 1200 })
  })

  it('dùng kích thước mặc định khi chưa populate ảnh', () => {
    expect(mediaDims(null)).toEqual({ width: 1600, height: 1000 })
  })
})
