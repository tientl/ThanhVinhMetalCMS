import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { anyone, isAdmin, isAdminOrEditor } from '@/access'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Ảnh và tệp', plural: 'Ảnh và tệp' },
  admin: { group: 'Nội dung', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: {
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Mô tả ảnh (alt)',
      required: true,
      admin: { description: 'Mô tả ngắn nội dung ảnh, dùng cho SEO và người khiếm thị.' },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumb',
    focalPoint: true,
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 300, height: 300, position: 'centre', formatOptions: { format: 'webp' } },
      { name: 'card', width: 800, height: 600, position: 'centre', formatOptions: { format: 'webp' } },
      { name: 'wide', width: 1600, formatOptions: { format: 'webp' } },
      { name: 'hero', width: 2400, formatOptions: { format: 'webp' } },
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: { format: 'jpeg' } },
    ],
  },
}
