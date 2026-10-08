import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/access'
import { sendQuoteEmail } from '@/lib/email'

export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  labels: { singular: 'Yêu cầu báo giá', plural: 'Yêu cầu báo giá' },
  admin: {
    hideAPIURL: true,
    components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } },
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'status', 'createdAt'],
    group: 'Liên hệ',
    description: 'Khách gửi từ form trên website. Đổi trạng thái sau khi đã liên hệ.',
  },
  access: {
    create: () => false,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Họ tên', required: true },
        { name: 'phone', type: 'text', label: 'Điện thoại', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'company', type: 'text', label: 'Công ty' },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Nội dung, quy cách cần gia công' },
    { name: 'attachment', type: 'upload', relationTo: 'quote-files', label: 'Tệp bản vẽ' },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'new',
      options: [
        { label: 'Mới', value: 'new' },
        { label: 'Đã liên hệ', value: 'contacted' },
        { label: 'Hoàn tất', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Gửi từ trang',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'ip',
      type: 'text',
      label: 'IP',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          await sendQuoteEmail({ doc, payload: req.payload })
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
