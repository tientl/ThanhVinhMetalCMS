import { ValidationError, type FieldHook, type TextareaField, type TextField } from 'payload'

const COUNTER = '@/components/admin/CharCountDescription#CharCountDescription'

/**
 * `maxLength` chỉ được Payload kiểm khi xuất bản: lưu nháp bỏ qua mọi `validate` (để nháp được thiếu ô bắt buộc),
 * nên nháp vẫn lưu được tiêu đề dài bao nhiêu cũng được. Hook của ô thì chạy cả khi lưu nháp: chặn ở đây, cùng câu báo.
 */
const enforceMaxLength =
  (maxLength: number): FieldHook =>
  ({ collection, field, global, path, req, value }) => {
    if (typeof value === 'string' && value.length > maxLength) {
      // Có nhãn thì thông báo của Payload ghi "không hợp lệ: Tên sản phẩm" thay vì "name"
      const label = 'label' in field && typeof field.label === 'string' ? field.label : path.join('.')
      throw new ValidationError(
        {
          collection: collection?.slug,
          global: global?.slug,
          errors: [{ label, path: path.join('.'), message: `Giá trị phải ngắn hơn hoặc bằng ${maxLength} ký tự (đang có ${value.length}).` }],
          req,
        },
        req.t,
      )
    }
    return value
  }

/**
 * Giới hạn độ dài cho ô chữ khách nhập + bộ đếm ký tự dưới ô (`CharCountDescription`).
 * Trước 26/10/2026 tiêu đề, tên, nhãn không giới hạn: một tiêu đề bài viết 20.700 ký tự phủ kín trang.
 * Payload kiểm `maxLength` khi xuất bản, hook `enforceMaxLength` kiểm cả khi lưu nháp; không đổi schema database.
 * Mức đặt theo chỗ hiện trên web (cỡ chữ, khung), đã đo dữ liệu thật đều nằm trong mức (CHANGELOG 26/10, đợt 4).
 */
export const limit = <T extends TextField | TextareaField>(field: T, maxLength: number): T =>
  ({
    ...field,
    maxLength,
    admin: { ...field.admin, components: { ...field.admin?.components, Description: COUNTER } },
    hooks: { ...field.hooks, beforeChange: [...(field.hooks?.beforeChange ?? []), enforceMaxLength(maxLength)] },
  }) as T

/** Mức dùng chung, đổi ở đây là đổi mọi chỗ. */
export const MAX = {
  /** Tên sản phẩm: h1 36px trang chi tiết, thẻ 19px */
  productName: 80,
  /** Tiêu đề bài viết: h1 44px trên ảnh bìa, thẻ 20px */
  postTitle: 100,
  /** Tiêu đề trang tĩnh: h1 48px */
  pageTitle: 80,
  /** Tên danh mục: chip, nhãn in hoa, mega menu */
  categoryName: 50,
  /** Tiêu đề khối ở trang chủ (40px) */
  heading: 70,
  /** Tiêu đề ô ảnh lớn (bộ sưu tập 46px, ô giải pháp) */
  tile: 50,
  /** Chữ trên nút, tên tab, nhãn nhỏ */
  short: 30,
  /** Nhãn mục menu chính (chữ in hoa, xếp ngang trên header) */
  menuLabel: 30,
  /** Nhãn liên kết phụ (gợi ý tìm kiếm, chân trang, cột mega menu) */
  linkLabel: 50,
  /** Câu mô tả một dòng */
  line: 120,
  /** Tóm tắt (thẻ, đầu trang chi tiết) */
  summary: 300,
} as const
