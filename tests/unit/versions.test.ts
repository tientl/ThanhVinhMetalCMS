import { describe, expect, it } from 'vitest'

import { changedKeys, fieldLabels, sameContent } from '@/lib/versions'

describe('sameContent', () => {
  it('bỏ qua id, ngày tạo, ngày cập nhật', () => {
    expect(
      sameContent(
        { id: 1, name: 'A', phone: '1', createdAt: '2026-01-01', updatedAt: '2026-01-02' },
        { id: 2, name: 'A', phone: '1', createdAt: '2026-02-01', updatedAt: '2026-02-02' },
      ),
    ).toBe(true)
  })

  it('khác một trường là khác', () => {
    expect(sameContent({ name: 'A', phone: '0989541246' }, { name: 'A', phone: '0989541249' })).toBe(false)
  })

  it('trống, null và thiếu trường coi như nhau', () => {
    expect(sameContent({ name: 'A', email: null, company: '' }, { name: 'A' })).toBe(true)
  })

  it('quan hệ đã populate so với id trần theo id', () => {
    expect(sameContent({ attachment: { id: 5, filename: 'a.pdf' } }, { attachment: 5 })).toBe(true)
    expect(sameContent({ attachment: { id: 5 } }, { attachment: 6 })).toBe(false)
  })

  it('so sâu cả mảng và object lồng nhau', () => {
    expect(sameContent({ spec: [{ label: 'Độ dày', value: '2 mm' }] }, { spec: [{ label: 'Độ dày', value: '2 mm' }] })).toBe(true)
    expect(sameContent({ spec: [{ label: 'Độ dày', value: '2 mm' }] }, { spec: [{ label: 'Độ dày', value: '3 mm' }] })).toBe(false)
  })
})

describe('sameContent với dòng của mảng', () => {
  it('sửa giá trị trong một dòng (giữ nguyên id dòng) là khác', () => {
    const before = { spec: [{ id: 'r1', label: 'Độ dày', value: '2 mm' }] }
    const after = { spec: [{ id: 'r1', label: 'Độ dày', value: '3 mm' }] }
    expect(sameContent(before, after)).toBe(false)
  })
})

describe('changedKeys', () => {
  it('trả các ô đã đổi, bỏ qua id và ngày tháng', () => {
    const prev = { id: 1, name: 'A', phone: '0989541246', status: 'new', updatedAt: '2026-01-01' }
    const next = { id: 2, name: 'A', phone: '0989541249', status: 'callback', updatedAt: '2026-01-02' }
    expect(changedKeys(prev, next)).toEqual(['phone', 'status'])
  })

  it('không đổi gì thì rỗng', () => {
    expect(changedKeys({ name: 'A', email: null }, { name: 'A' })).toEqual([])
  })
})

describe('fieldLabels', () => {
  it('lấy nhãn xuyên qua row, tab không tên; tab có tên lấy nhãn tab; bỏ field ẩn và ui', () => {
    const labels = fieldLabels([
      { type: 'row', fields: [{ name: 'name', type: 'text', label: 'Họ tên' }, { name: 'phone', type: 'text', label: 'Điện thoại' }] },
      {
        type: 'tabs',
        tabs: [
          { label: 'Nội dung', fields: [{ name: 'summary', type: 'textarea', label: { vi: 'Tóm tắt', en: 'Summary' } }] },
          { name: 'meta', label: 'SEO', fields: [{ name: 'title', type: 'text' }] },
        ],
      },
      { name: 'searchText', type: 'text', admin: { hidden: true } },
      { name: 'thumbnail', type: 'ui', label: 'Ảnh' },
      { name: 'slug', type: 'text' },
    ])
    expect(labels).toEqual({ name: 'Họ tên', phone: 'Điện thoại', summary: 'Tóm tắt', meta: 'SEO', slug: 'slug' })
  })
})
