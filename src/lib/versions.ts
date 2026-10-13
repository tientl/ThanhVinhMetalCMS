/** So sánh nội dung giữa các phiên bản (dùng chung cho server và trang quản trị). Không import gì của server. */

/** Trường hệ thống, không tính là nội dung. */
const IGNORED = new Set(['id', 'createdAt', 'updatedAt', '_status'])

const isEmpty = (v: unknown) => v === null || v === undefined || v === ''

const idOf = (v: unknown): unknown => (v && typeof v === 'object' && 'id' in v ? (v as { id: unknown }).id : undefined)

const equal = (a: unknown, b: unknown): boolean => {
  if (isEmpty(a) && isEmpty(b)) return true
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => equal(v, b[i]))
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Hai object (dòng của mảng, nhóm field...): so toàn bộ nội dung. Không dừng ở id vì dòng của mảng
    // giữ nguyên id khi sửa giá trị bên trong.
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...keys].every((k) => equal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  }
  // Quan hệ đã populate ({ id, ... }) so với id trần: so theo id
  if (a && typeof a === 'object') return idOf(a) === b
  if (b && typeof b === 'object') return idOf(b) === a
  return false
}

/** Hai bản có cùng nội dung không, bỏ qua id, ngày tạo, ngày cập nhật, trạng thái nháp. Trống, null, undefined coi như nhau. */
export const sameContent = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => !IGNORED.has(k)))
  return [...keys].every((k) => equal(a[k], b[k]))
}

/** Các field cấp ngoài cùng khác nhau giữa hai bản (bỏ qua trường hệ thống), theo thứ tự xuất hiện. */
export const changedKeys = (prev: Record<string, unknown>, next: Record<string, unknown>): string[] => {
  const keys = [...new Set([...Object.keys(prev), ...Object.keys(next)])].filter((k) => !IGNORED.has(k))
  return keys.filter((k) => !equal(prev[k], next[k]))
}

type FieldLike = {
  type?: string
  name?: string
  label?: unknown
  fields?: FieldLike[]
  tabs?: FieldLike[]
  admin?: { hidden?: boolean }
}

const labelText = (label: unknown, fallback: string): string => {
  if (typeof label === 'string' && label) return label
  if (label && typeof label === 'object') {
    const byLocale = label as Record<string, unknown>
    const text = byLocale.vi ?? Object.values(byLocale)[0]
    if (typeof text === 'string' && text) return text
  }
  return fallback
}

/**
 * Nhãn hiển thị của các field cấp ngoài cùng, theo tên field, đi xuyên qua row, collapsible và tab không tên.
 * Tab có tên (ví dụ tab SEO `meta`) là một field, lấy nhãn của tab. Field ẩn (searchText) và field ui bỏ qua.
 */
export const fieldLabels = (fields: FieldLike[]): Record<string, string> => {
  const out: Record<string, string> = {}
  const walk = (list: FieldLike[]) => {
    for (const f of list) {
      if (f.type === 'tabs') {
        for (const tab of f.tabs ?? []) {
          if (tab.name) out[tab.name] = labelText(tab.label, tab.name)
          else walk(tab.fields ?? [])
        }
      } else if (!f.name && f.fields) {
        walk(f.fields)
      } else if (f.name && f.type !== 'ui' && !f.admin?.hidden) {
        out[f.name] = labelText(f.label, f.name)
      }
    }
  }
  walk(fields)
  return out
}
