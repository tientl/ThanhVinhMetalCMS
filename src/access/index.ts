import type { Access, FieldAccess, PayloadRequest } from 'payload'

type Role = 'admin' | 'editor'

const roleOf = (user: unknown): Role | undefined =>
  user && typeof user === 'object' && 'role' in user ? (user.role as Role) : undefined

export const anyone: Access = () => true

export const loggedIn = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)

export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === 'admin'

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  const role = roleOf(user)
  return role === 'admin' || role === 'editor'
}

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (roleOf(user) === 'admin') return true
  return { id: { equals: user.id } }
}

/** Người đã đăng nhập thấy tất cả, khách chỉ thấy bản đã đăng. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const isAdminUser = (user: unknown): boolean => roleOf(user) === 'admin'
export const isEditorUser = (user: unknown): boolean => roleOf(user) === 'editor'

/**
 * Tạo, sửa sản phẩm, bài viết, trang tĩnh: Quản trị được mọi thứ; Nhân viên chỉ ghi bản nháp, không xuất bản.
 * Payload tính quyền sửa với `_status: 'draft'` và quyền xuất bản với `_status: 'published'`,
 * nên hàm này vừa ẩn nút "Xuất bản" với Nhân viên, vừa chặn API gửi `_status: 'published'`.
 * Lỗ còn lại (ghi thẳng bản đang hiện trên web không kèm _status, gỡ xuất bản) chặn ở hook editorDraftsOnly.
 */
export const adminOrEditorDraft: Access = ({ req: { user }, data }) => {
  const role = roleOf(user)
  if (role === 'admin') return true
  if (role === 'editor') return (data as { _status?: string } | undefined)?._status !== 'published'
  return false
}

/** Ẩn khỏi menu trái và trang quản trị với Nhân viên (mục chỉ Quản trị sửa được: menu, thông tin công ty, tài khoản...). */
export const hiddenFromEditors = ({ user }: { user: unknown }): boolean => roleOf(user) !== 'admin'
