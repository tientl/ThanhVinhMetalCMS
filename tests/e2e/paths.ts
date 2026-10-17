import path from 'node:path'

/** Nơi lưu cookie đăng nhập admin dùng chung cho nhóm test admin. */
export const ADMIN_STORAGE_STATE = path.resolve('playwright/.auth/admin.json')

/** Tài khoản Nhân viên dùng cho nhóm test editor (editor.setup.ts tự tạo nếu chưa có). */
export const EDITOR_STORAGE_STATE = path.resolve('playwright/.auth/editor.json')
export const EDITOR_EMAIL = 'editor.e2e@thanhvinhmetal.vn'
export const EDITOR_PASSWORD = 'Editor@2026'
