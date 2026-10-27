/**
 * Số mục ở khối "liên quan" cuối trang chi tiết, dùng chung cho ô `related` trong admin (maxRows, mô tả) và hàm lấy
 * dữ liệu (src/lib/data.ts), để admin cho chọn bao nhiêu thì web hiện đúng bấy nhiêu.
 * - picked: chọn tay thì hiện tối đa bấy nhiêu (2 hàng của lưới: bài viết 3 cột, sản phẩm 4 cột).
 * - auto: để trống thì tự lấy bấy nhiêu mục cùng danh mục (1 hàng).
 * Trước 26/10/2026: bài viết chọn 6 chỉ hiện 3, mô tả lại ghi "tối đa 4", ô không chặn số lượng.
 */
export const RELATED = {
  posts: { picked: 6, auto: 3 },
  products: { picked: 8, auto: 4 },
} as const
