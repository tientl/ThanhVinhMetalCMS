import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { isAdmin, isAdminOrEditor } from '@/access'
import { QUOTE_FILE_MIME_TYPES } from '@/lib/quoteFiles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Tệp bản vẽ khách gửi kèm yêu cầu báo giá.
 * Lưu ngoài thư mục public, chỉ admin và nhân viên tải được qua API.
 */
export const QuoteFiles: CollectionConfig = {
  slug: 'quote-files',
  labels: { singular: 'Tệp bản vẽ', plural: 'Tệp bản vẽ' },
  admin: { hideAPIURL: true, group: 'Liên hệ', hidden: true, useAsTitle: 'originalName' },
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: () => false,
    delete: isAdmin,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../uploads/quote-files'),
    mimeTypes: QUOTE_FILE_MIME_TYPES,
    disableLocalStorage: false,
    // Không cắt hay chỉnh nội dung tệp đã tải lên
    crop: false,
    focalPoint: false,
  },
  fields: [
    {
      name: 'originalName',
      type: 'text',
      label: 'Tên tệp gốc',
      admin: { readOnly: true, description: 'Tên tệp đúng như khách đặt. Tên lưu trên máy chủ đã bỏ dấu tiếng Việt.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && !data.originalName && req.file?.name) {
          data.originalName = req.file.name.slice(0, 200)
        }
        return data
      },
    ],
  },
}
