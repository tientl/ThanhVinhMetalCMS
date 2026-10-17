import { APIError, type CollectionBeforeOperationHook } from 'payload'

import { isEditorUser } from '@/access'

export const EDITOR_PUBLISH_MESSAGE = 'Nhân viên chỉ lưu được bản nháp. Quản trị sẽ duyệt và xuất bản.'

/**
 * Nhân viên chỉ lưu nháp (sản phẩm, bài viết, trang tĩnh). Gắn vào `hooks.beforeOperation`.
 * - Tạo, sửa: ép mọi lần ghi thành lưu nháp (`draft: true`, `_status: 'draft'`). Không ép thì gọi API sửa không kèm
 *   _status sẽ ghi thẳng vào bản đang hiện trên web, và gửi _status 'draft' không kèm cờ nháp là gỡ bài khỏi web.
 *   Cố ý gửi 'published' thì báo lỗi rõ ràng thay vì lặng lẽ đổi.
 * - Khôi phục phiên bản: chỉ được dưới dạng nháp (restoreVersionEndpoint đã tự ép cho Nhân viên; đường khác thì chặn).
 * Payload đọc cờ draft sau beforeOperation ở create/update, nên sửa args ở đây có hiệu lực.
 */
// Dùng chung cho nhiều collection nên để kiểu slug rộng
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editorDraftsOnly: CollectionBeforeOperationHook<any> = ({ args, operation, req }) => {
  if (!isEditorUser(req.user)) return args

  if (operation === 'create' || operation === 'update') {
    const data = (args as { data?: Record<string, unknown> }).data
    if (data?._status === 'published') throw new APIError(EDITOR_PUBLISH_MESSAGE, 403, undefined, true)
    return { ...args, draft: true, data: data ? { ...data, _status: 'draft' } : data }
  }

  if (operation === 'restoreVersion' && !(args as { draft?: boolean }).draft) {
    throw new APIError(EDITOR_PUBLISH_MESSAGE, 403, undefined, true)
  }
  return args
}
