import type { CollectionBeforeValidateHook } from 'payload'

const isBlank = (v: unknown) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

/**
 * Bỏ các dòng mảng trống trước khi kiểm tra và lưu. `rows`: tên mảng → các field mà trống hết thì coi là dòng trống.
 *
 * Vì sao: Payload cho lưu bản nháp mà không kiểm tra ô bắt buộc, nên nhân viên bấm "Thêm: Ảnh" rồi để trống vẫn lưu được.
 * Dòng trống nằm trong phiên bản nháp làm thao tác khôi phục hỏng (khôi phục kiểm tra ô bắt buộc như khi xuất bản).
 * Hook này chạy cả khi lưu nháp, xuất bản và khôi phục phiên bản (restoreVersion cũng chạy beforeValidate).
 */
export const dropEmptyRows =
  (rows: Record<string, string[]>): CollectionBeforeValidateHook =>
  ({ data }) => {
    if (!data) return data
    for (const [name, fields] of Object.entries(rows)) {
      const list = data[name]
      if (!Array.isArray(list)) continue
      data[name] = list.filter((row) => row && typeof row === 'object' && !fields.every((f) => isBlank((row as Record<string, unknown>)[f])))
    }
    return data
  }
