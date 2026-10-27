import { normalizeSearch } from '@/utilities/unaccent'

/** Chữ hiện ở trang chi tiết khi sản phẩm chưa có giá. */
export const CONTACT_PRICE = 'Liên hệ'

/** Gom mọi loại khoảng trắng (cả dấu cách không ngắt, ký tự rộng 0 khi dán từ Word, Zalo) thành một dấu cách, bỏ ở hai đầu. */
export const tidyPrice = (price: string): string => price.replace(/[\s​-‍﻿]+/g, ' ').trim()

/**
 * Giá nhập tự do ("1.200.000đ", "Từ 350.000đ/m²", "45.000đ/kg"…). Trả về chữ đã gọn khoảng trắng, hoặc `null`
 * khi coi như chưa có giá: để trống, chỉ có dấu cách, hay "Liên hệ" viết kiểu nào (liên hệ, LIÊN HỆ, Lien he).
 * Trang chi tiết thay `null` bằng "Liên hệ", thẻ sản phẩm thay bằng "Xem sản phẩm".
 */
export const priceText = (price: string | null | undefined): string | null => {
  const text = tidyPrice(price ?? '')
  if (!text) return null
  if (normalizeSearch(text).replace(/[^a-z0-9]/g, '') === 'lienhe') return null
  return text
}
