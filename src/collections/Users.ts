import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf, loggedIn } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Tài khoản', plural: 'Tài khoản' },
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Hệ thống',
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
          'Quản trị: toàn quyền. Nhân viên: đăng sản phẩm, bài viết, ảnh; xem yêu cầu báo giá; không xóa sản phẩm, không sửa tài khoản và cài đặt chung.',
      },
    },
  ],
  timestamps: true,
}
