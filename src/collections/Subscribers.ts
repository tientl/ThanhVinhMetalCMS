import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Đăng ký bản tin', plural: 'Đăng ký bản tin' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'createdAt'],
    group: 'Liên hệ',
  },
  access: {
    create: () => false,
    read: isAdminOrEditor,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true, unique: true },
    { name: 'source', type: 'text', label: 'Gửi từ trang', admin: { readOnly: true } },
  ],
  timestamps: true,
}
