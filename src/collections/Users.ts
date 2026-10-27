import type { CollectionConfig } from 'payload'

import { hiddenFromEditors, isAdmin, isAdminField, isAdminOrSelf, loggedIn } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Tài khoản', plural: 'Tài khoản' },
  auth: true,
  admin: {
    // Nhân viên không quản lý tài khoản; vẫn đổi tên, mật khẩu của mình ở trang "Tài khoản của tôi" (bấm ảnh đại diện)
    hidden: hiddenFromEditors,
    hideAPIURL: true,
    components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } },
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Cài đặt',
  },
  access: {
    admin: loggedIn,
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Họ tên', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Vai trò',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Quản trị', value: 'admin' },
        { label: 'Nhân viên', value: 'editor' },
      ],
      access: { update: isAdminField },
      admin: {
        description:
          'Quản trị: toàn quyền. Nhân viên: thêm, sửa, xuất bản sản phẩm, bài viết, trang tĩnh; thêm, sửa danh mục; tải ảnh; sửa trang chủ và yêu cầu báo giá. Nhân viên không xóa gì, không sửa menu, thông tin công ty, tài khoản.',
      },
    },
  ],
  timestamps: true,
}
