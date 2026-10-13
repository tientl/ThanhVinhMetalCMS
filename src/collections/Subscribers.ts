import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/access'
import { notifyLiveChange } from '@/lib/liveEvents'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Đăng ký bản tin', plural: 'Đăng ký bản tin' },
  admin: {
    hideAPIURL: true,
    components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } },
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
  hooks: {
    // Báo cho các tab admin đang mở: huy hiệu menu, ô thống kê, thông báo và danh sách tự cập nhật
    afterChange: [
      ({ doc }) => {
        notifyLiveChange()
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        notifyLiveChange()
        return doc
      },
    ],
  },
  timestamps: true,
}
