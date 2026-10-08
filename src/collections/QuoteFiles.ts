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
  admin: { group: 'Liên hệ', hidden: true },
  access: {
    create: () => false,
    read: isAdminOrEditor,
    update: () => false,
    delete: isAdmin,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../uploads/quote-files'),
    mimeTypes: QUOTE_FILE_MIME_TYPES,
    disableLocalStorage: false,
  },
  fields: [],
}
