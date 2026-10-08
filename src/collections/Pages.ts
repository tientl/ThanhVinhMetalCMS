import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { fullRichText } from '@/fields/richText'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

const paths = (doc: { slug?: string | null }) => [`/${doc.slug}`]

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Trang tĩnh', plural: 'Trang tĩnh' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Nội dung',
    description: 'Giới thiệu, chính sách bảo hành, bảo mật, hướng dẫn gửi bản vẽ.',
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOrLoggedIn,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Ảnh đầu trang' },
            { name: 'intro', type: 'textarea', label: 'Đoạn mở đầu' },
            { name: 'content', type: 'richText', label: 'Nội dung', editor: fullRichText, required: true },
          ],
        },
        seoTab(),
      ],
    },
    slugField('title'),
  ],
  hooks: {
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
  versions: {
    drafts: { autosave: { interval: 1000 } },
    maxPerDoc: 20,
  },
}
