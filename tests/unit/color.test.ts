import { describe, expect, it } from 'vitest'

import { DEFAULT_ACCENT, accentVars, darken, isHexColor, lighten, luminance } from '@/lib/color'

describe('isHexColor', () => {
  it('nhận mã hex 3 và 6 ký tự, có hoặc không có khoảng trắng thừa', () => {
    expect(isHexColor('#E8411A')).toBe(true)
    expect(isHexColor('#e8411a')).toBe(true)
    expect(isHexColor('#abc')).toBe(true)
    expect(isHexColor('  #ABC  ')).toBe(true)
  })

  it('từ chối giá trị không phải mã hex', () => {
    expect(isHexColor('E8411A')).toBe(false)
    expect(isHexColor('#12345')).toBe(false)
    expect(isHexColor('rgb(1,2,3)')).toBe(false)
    expect(isHexColor(null)).toBe(false)
    expect(isHexColor(123)).toBe(false)
  })
})

describe('lighten / darken', () => {
  it('amount 0 giữ nguyên màu', () => {
    expect(lighten('#E8411A', 0)).toBe('#e8411a')
    expect(darken('#E8411A', 0)).toBe('#e8411a')
  })

  it('amount 1 cho trắng và đen', () => {
    expect(lighten('#E8411A', 1)).toBe('#ffffff')
    expect(darken('#E8411A', 1)).toBe('#000000')
  })

  it('pha đúng tỉ lệ giữa quãng', () => {
    // #000000 pha 50% với trắng ra #808080 (128 sau khi làm tròn)
    expect(lighten('#000000', 0.5)).toBe('#808080')
    expect(darken('#ffffff', 0.5)).toBe('#808080')
  })

  it('hiểu mã hex rút gọn 3 ký tự', () => {
    expect(lighten('#f00', 0)).toBe('#ff0000')
    expect(darken('#fff', 1)).toBe('#000000')
  })

  it('làm nhạt luôn sáng hơn, làm đậm luôn tối hơn màu gốc', () => {
    expect(luminance(lighten('#E8411A', 0.3))).toBeGreaterThan(luminance('#E8411A'))
    expect(luminance(darken('#E8411A', 0.3))).toBeLessThan(luminance('#E8411A'))
  })
})

describe('luminance', () => {
  it('trắng là 1, đen là 0', () => {
    expect(luminance('#ffffff')).toBeCloseTo(1, 5)
    expect(luminance('#000000')).toBeCloseTo(0, 5)
  })

  it('xanh lá sáng hơn xanh dương theo cảm nhận mắt người', () => {
    expect(luminance('#00ff00')).toBeGreaterThan(luminance('#0000ff'))
  })
})

describe('accentVars', () => {
  it('trả đủ bộ biến CSS cho nền tối và nền sáng', () => {
    const vars = accentVars('#E8411A')
    expect(Object.keys(vars).sort()).toEqual(
      [
        '--accent-ghost-on-dark',
        '--accent-ghost-on-light',
        '--accent-text-on-dark',
        '--accent-text-on-light',
        '--color-accent',
      ].sort(),
    )
    expect(vars['--color-accent']).toBe('#E8411A')
  })

  it('lùi về màu mặc định khi khách chưa chọn hoặc chọn sai', () => {
    expect(accentVars(null)['--color-accent']).toBe(DEFAULT_ACCENT)
    expect(accentVars(undefined)['--color-accent']).toBe(DEFAULT_ACCENT)
    expect(accentVars('không phải màu')['--color-accent']).toBe(DEFAULT_ACCENT)
  })

  it('tông trên nền tối sáng hơn, tông trên nền sáng tối hơn màu chủ đạo', () => {
    const vars = accentVars('#E8411A')
    const base = luminance('#E8411A')
    expect(luminance(vars['--accent-text-on-dark'])).toBeGreaterThan(base)
    expect(luminance(vars['--accent-ghost-on-dark'])).toBeGreaterThan(luminance(vars['--accent-text-on-dark']))
    expect(luminance(vars['--accent-text-on-light'])).toBeLessThan(base)
    expect(luminance(vars['--accent-ghost-on-light'])).toBeLessThan(luminance(vars['--accent-text-on-light']))
  })
})
