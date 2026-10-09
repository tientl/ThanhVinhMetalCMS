import { describe, expect, it } from 'vitest'

import { normalizeSearch, toSlug, unaccent } from '@/utilities/unaccent'

describe('unaccent', () => {
  it('bỏ dấu tiếng Việt, giữ nguyên chữ hoa thường', () => {
    expect(unaccent('Vách Hoa Văn')).toBe('Vach Hoa Van')
    expect(unaccent('tấm đục lỗ')).toBe('tam duc lo')
    expect(unaccent('Cắt laser CNC')).toBe('Cat laser CNC')
  })

  it('đổi đ và Đ thành d và D', () => {
    expect(unaccent('Đồng Nai')).toBe('Dong Nai')
    expect(unaccent('đục lỗ')).toBe('duc lo')
  })

  it('giữ nguyên chuỗi vốn không dấu', () => {
    expect(unaccent('inox 304')).toBe('inox 304')
  })

  it('xử lý đủ bộ nguyên âm có dấu', () => {
    expect(unaccent('aàáảãạăằắẳẵặâầấẩẫậ')).toBe('aaaaaaaaaaaaaaaaaa')
    expect(unaccent('eèéẻẽẹêềếểễệ')).toBe('eeeeeeeeeeee')
    expect(unaccent('uùúủũụưừứửữự')).toBe('uuuuuuuuuuuu')
    expect(unaccent('yỳýỷỹỵ')).toBe('yyyyyy')
  })
})

describe('normalizeSearch', () => {
  it('bỏ dấu, chuyển chữ thường và gộp khoảng trắng', () => {
    expect(normalizeSearch('  Vách   HOA Văn  ')).toBe('vach hoa van')
  })

  it('trả chuỗi rỗng khi đầu vào rỗng hoặc không có', () => {
    expect(normalizeSearch('')).toBe('')
    expect(normalizeSearch(null)).toBe('')
    expect(normalizeSearch(undefined)).toBe('')
  })

  it('cho cùng kết quả dù gõ có dấu hay không dấu', () => {
    expect(normalizeSearch('vỏ tủ điện')).toBe(normalizeSearch('vo tu dien'))
  })
})

describe('toSlug', () => {
  it('sinh slug không dấu, nối bằng dấu gạch ngang', () => {
    expect(toSlug('Vách Hoa Văn Trang Trí')).toBe('vach-hoa-van-trang-tri')
    expect(toSlug('Mặt bích đường ống')).toBe('mat-bich-duong-ong')
  })

  it('bỏ ký tự đặc biệt và dấu gạch thừa ở hai đầu', () => {
    expect(toSlug('--- Thép tấm CT3 (3mm) ---')).toBe('thep-tam-ct3-3mm')
    expect(toSlug('Inox 304 / 201')).toBe('inox-304-201')
  })

  it('trả chuỗi rỗng khi không còn ký tự hợp lệ', () => {
    expect(toSlug('!!!')).toBe('')
    expect(toSlug('')).toBe('')
  })
})
