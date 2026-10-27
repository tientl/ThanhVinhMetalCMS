import type { FilterOptions, RelationshipFieldValidation, Where } from 'payload'
import { relationship } from 'payload/shared'

/** Chỉ chọn được bản đã xuất bản. Dùng cho ô quan hệ trong global (Trang chủ), nơi không có "chính nó" để loại. */
export const publishedOnly: Where = { _status: { equals: 'published' } }

/**
 * Danh sách chọn của ô quan hệ tới sản phẩm, bài viết: chỉ bản đã xuất bản (bản nháp, kể cả bản nháp chưa đặt tên,
 * không hiện) và không có chính tài liệu đang sửa.
 */
export const publishedOthers: FilterOptions = ({ id }): Where =>
  id ? { and: [publishedOnly, { id: { not_equals: id } }] } : publishedOnly

const toIds = (value: unknown): string[] =>
  (Array.isArray(value) ? value : value == null ? [] : [value])
    .map((v) => (v && typeof v === 'object' ? (v as { id?: unknown; value?: unknown }).id ?? (v as { value?: unknown }).value : v))
    .filter((v) => v != null)
    .map(String)

/**
 * Kiểm tra khi lưu cho ô quan hệ có `filterOptions` ở trên. Thay bước kiểm mặc định của Payload, vốn áp `filterOptions`
 * lên cả danh sách: mục chọn từ trước mà sau đó bị "Ẩn tài liệu" làm cả tài liệu không lưu được, kèm câu báo chung chung
 * "Field này có những lựa chọn không hợp lệ" (25/10/2026).
 * - Mục đã có trong danh sách từ lần lưu trước: giữ, kể cả khi nay đang ẩn. Web tự không hiện (truy vấn dưới quyền khách),
 *   xuất bản lại thì hiện lại.
 * - Mục mới thêm phải là bản đã xuất bản (danh sách chọn đã lọc; chặn thêm đường API), báo rõ tên.
 * - Không chọn chính nó (`excludeSelf`, tắt cho global vì `id` khi đó là id của global, không phải của mục được chọn).
 */
export const validatePublishedRelation =
  (collection: 'products' | 'posts', titleField: 'name' | 'title', { excludeSelf = true } = {}): RelationshipFieldValidation =>
  async (value, options) => {
    const base = await relationship(value, { ...options, filterOptions: undefined })
    if (base !== true || options.event === 'onChange') return base

    const selected = toIds(value)
    if (excludeSelf && options.id != null && selected.includes(String(options.id))) return 'Không chọn được chính tài liệu này.'

    const before = new Set(toIds(options.previousValue))
    const added = selected.filter((id) => !before.has(id))
    if (added.length === 0) return true

    const { docs } = await options.req.payload.find({
      collection,
      where: { and: [{ id: { in: added } }, { _status: { not_equals: 'published' } }] },
      depth: 0,
      limit: added.length,
      overrideAccess: true,
      req: options.req,
    })
    if (docs.length === 0) return true
    const names = docs.map((d) => `"${(d as unknown as Record<string, unknown>)[titleField] || `ID ${d.id}`}"`).join(', ')
    return `${names} chưa xuất bản (bản nháp hoặc đang ẩn) nên không chọn được. Xuất bản trước rồi chọn lại.`
  }
