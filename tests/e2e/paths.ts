import path from 'node:path'

/** Nơi lưu cookie đăng nhập admin dùng chung cho nhóm test admin. */
export const ADMIN_STORAGE_STATE = path.resolve('playwright/.auth/admin.json')
