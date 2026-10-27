import { APIError, type GlobalBeforeValidateHook } from 'payload'

import { timeVN } from '@/lib/format'

/**
 * Chặn lưu đè bản cũ. Form admin gửi cả trang kèm `updatedAt` của lúc mở trang (lưu xong thì form nhận `updatedAt` mới).
 * Mở cùng trang ở hai tab: tab 2 sửa một mục rồi lưu, tab 1 lưu sau sẽ đè mục đó về bản cũ. Payload chỉ khóa khi người
 * khác đang mở, cùng tài khoản thì không. Hook này thấy `updatedAt` gửi lên cũ hơn bản trong DB thì từ chối (409).
 * Gọi API không kèm `updatedAt` (seed, script, test) thì bỏ qua. Phía admin `StaleDocWatcher` báo sớm khi quay lại tab cũ.
 */
export const rejectStaleSave: GlobalBeforeValidateHook = ({ data, global, originalDoc }) => {
  const label = typeof global.label === 'string' ? global.label : 'Trang này'
  const sent = Date.parse(String(data?.updatedAt ?? ''))
  const current = Date.parse(String(originalDoc?.updatedAt ?? ''))
  if (Number.isFinite(sent) && Number.isFinite(current) && sent < current) {
    throw new APIError(
      `${label} đã được lưu ở tab hoặc máy khác lúc ${timeVN(originalDoc.updatedAt)}, sau khi bạn mở trang này. ` +
        'Đã dừng lưu để không đè mất thay đổi đó. Chép lại phần vừa sửa, tải lại trang (F5) rồi sửa và lưu lại.',
      409,
      undefined,
      true,
    )
  }
  return data
}
