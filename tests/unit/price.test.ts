import { describe, expect, it } from 'vitest'

import { priceText, tidyPrice } from '@/lib/price'

describe('priceText', () => {
  it('giữ nguyên giá nhập tự do, chỉ gọn khoảng trắng', () => {
    expect(priceText('1.250.000đ/m²')).toBe('1.250.000đ/m²')
    expect(priceText('  Từ   350.000đ / m² ')).toBe('Từ 350.000đ / m²')
    expect(priceText('45.000đ/kg')).toBe('45.000đ/kg')
  })

  it('trống hoặc chỉ có khoảng trắng (kể cả dấu cách không ngắt, ký tự rộng 0) là chưa có giá', () => {
    expect(priceText('')).toBeNull()
    expect(priceText(null)).toBeNull()
    expect(priceText(undefined)).toBeNull()
    expect(priceText('     ')).toBeNull()
    expect(priceText('  \t​ ')).toBeNull()
  })

  it('"Liên hệ" viết kiểu nào cũng là chưa có giá', () => {
    for (const value of ['Liên hệ', 'liên hệ', 'LIÊN HỆ', 'Lien he', ' liên  hệ ', 'Liên hệ.']) {
      expect(priceText(value), value).toBeNull()
    }
  })

  it('chữ có "liên hệ" kèm thông tin khác vẫn hiện nguyên', () => {
    expect(priceText('Liên hệ để có giá sỉ')).toBe('Liên hệ để có giá sỉ')
  })
})

describe('tidyPrice', () => {
  it('gom khoảng trắng, bỏ hai đầu', () => {
    expect(tidyPrice('  1.200.000đ  ')).toBe('1.200.000đ')
    expect(tidyPrice('   ')).toBe('')
  })
})
