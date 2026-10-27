import { describe, expect, it } from 'vitest'

import { frameBoxStyle, parseFrame, scaleSizes, type ImageFrame } from '@/lib/frame'

/** Tính biểu thức CSS của frameBoxStyle cho một ô cỡ tw × th (đổi cqw, cqh, max, min, clamp sang JS). */
const evalCss = (expr: string, tw: number, th: number): number => {
  const js = expr
    .replace(/(\d+(?:\.\d+)?)cqw/g, (_, v: string) => `(${v}*${tw / 100})`)
    .replace(/(\d+(?:\.\d+)?)cqh/g, (_, v: string) => `(${v}*${th / 100})`)
    .replace(/(\d+(?:\.\d+)?)px/g, '$1')
    .replace(/\bcalc\(/g, '(')
    .replace(/\bmax\(/g, 'Math.max(')
    .replace(/\bmin\(/g, 'Math.min(')
  return new Function('clamp', `return ${js}`)((lo: number, v: number, hi: number) => Math.max(lo, Math.min(v, hi))) as number
}

/** Ảnh và vùng chọn hiện ra sao trong ô tw × th (px) */
const layout = (size: { width: number; height: number }, frame: ImageFrame, tw: number, th: number) => {
  const s = frameBoxStyle(size, frame)
  const img = { left: evalCss(String(s.left), tw, th), top: evalCss(String(s.top), tw, th), width: evalCss(String(s.width), tw, th), height: evalCss(String(s.height), tw, th) }
  const region = {
    left: img.left + (frame.x / 100) * img.width,
    top: img.top + (frame.y / 100) * img.height,
    width: (frame.width / 100) * img.width,
    height: (frame.height / 100) * img.height,
  }
  return { img, region }
}

const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(0.5)

describe('frameBoxStyle', () => {
  // Ảnh ngang 3:1, vùng vuông 480×480 px ở giữa ảnh
  const wide = { width: 2400, height: 800 }
  const square: ImageFrame = { x: 40, y: 20, width: 20, height: 60, media: 1 }

  it('ô dọc: vùng phóng vừa khít bề ngang, nằm giữa theo chiều dọc, ảnh giữ tỉ lệ', () => {
    const { img, region } = layout(wide, square, 600, 700)
    near(img.width / img.height, 3)
    near(region.width, 600)
    near(region.left, 0)
    near(region.top + region.height / 2, 350)
  })

  it('ô ngang: vùng vừa khít bề dọc, nằm giữa theo chiều ngang', () => {
    const { region } = layout(wide, square, 1000, 300)
    near(region.height, 300)
    near(region.top, 0)
    near(region.left + region.width / 2, 500)
  })

  it('vùng sát mép ảnh: ảnh dừng ở mép, không lộ nền, vùng vẫn hiện trọn', () => {
    const edge: ImageFrame = { x: 0, y: 0, width: 20, height: 60, media: 1 }
    const { img, region } = layout(wide, edge, 1000, 600)
    near(img.left, 0)
    near(img.top, 0)
    expect(region.left).toBeGreaterThanOrEqual(-0.5)
    expect(region.top + region.height).toBeLessThanOrEqual(600.5)
  })

  it('ảnh luôn phủ kín ô, kể cả vùng chọn to', () => {
    const big: ImageFrame = { x: 0, y: 0, width: 100, height: 100, media: 1 }
    for (const [tw, th] of [
      [400, 900],
      [1200, 300],
      [700, 700],
    ] as const) {
      const { img } = layout(wide, big, tw, th)
      expect(img.left).toBeLessThanOrEqual(0.5)
      expect(img.top).toBeLessThanOrEqual(0.5)
      expect(img.left + img.width).toBeGreaterThanOrEqual(tw - 0.5)
      expect(img.top + img.height).toBeGreaterThanOrEqual(th - 0.5)
    }
  })
})

describe('parseFrame', () => {
  it('đọc vùng hợp lệ của đúng ảnh', () => {
    expect(parseFrame({ x: 10, y: 5, width: 30, height: 40, media: 7 }, 7)).toEqual({ x: 10, y: 5, width: 30, height: 40, media: 7 })
    expect(parseFrame({ x: 10, y: 5, width: 30, height: 40, media: 7 }, '7')).not.toBeNull()
  })

  it('vùng chọn cho ảnh khác, sai dạng hay quá nhỏ thì bỏ qua', () => {
    expect(parseFrame({ x: 10, y: 5, width: 30, height: 40, media: 7 }, 8)).toBeNull()
    expect(parseFrame(null, 7)).toBeNull()
    expect(parseFrame('x', 7)).toBeNull()
    expect(parseFrame({ x: '10', y: 5, width: 30, height: 40, media: 7 }, 7)).toBeNull()
    expect(parseFrame({ x: 10, y: 5, width: 0.5, height: 40, media: 7 }, 7)).toBeNull()
  })

  it('kéo vùng lọt ra ngoài ảnh về trong mép', () => {
    expect(parseFrame({ x: 90, y: -5, width: 30, height: 40, media: 7 }, 7)).toMatchObject({ x: 70, y: 0, width: 30, height: 40 })
  })
})

describe('scaleSizes', () => {
  it('nhân cỡ ảnh theo mức phóng, không đụng điều kiện màn hình', () => {
    const frame: ImageFrame = { x: 0, y: 0, width: 50, height: 50, media: 1 }
    expect(scaleSizes('(min-width: 768px) 50vw, 100vw', frame)).toBe('(min-width: 768px) 100vw, 200vw')
    expect(scaleSizes('72px', frame)).toBe('144px')
  })

  it('không phóng quá 4 lần, vùng to thì giữ nguyên', () => {
    expect(scaleSizes('50vw', { x: 0, y: 0, width: 10, height: 10, media: 1 })).toBe('200vw')
    expect(scaleSizes('50vw', { x: 0, y: 0, width: 100, height: 100, media: 1 })).toBe('50vw')
  })
})
