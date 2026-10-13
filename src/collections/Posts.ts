import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { fullRichText } from '@/fields/richText'
import { buildSearchText, searchTextField } from '@/fields/searchText'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'
import { blockNoopRestore, restoreVersionEndpoint, VERSIONS_LIST_VIEW } from '@/hooks/versions'

const paths = (doc: { slug?: string | null }) => ['/bai-viet', `/bai-viet/${doc.slug}`]

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: { singular: 'Bài viết', plural: 'Bài viết' },
  admin: {
    hideAPIURL: true,
    components: {
      edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] },
      views: { edit: { versions: VERSIONS_LIST_VIEW } },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'publishedAt'],
    group: 'Bài viết',
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOrLoggedIn,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    excerpt: true,
    cover: true,
    category: true,
    publishedAt: true,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Ảnh bìa', required: true },
            { name: 'excerpt', type: 'textarea', label: 'Tóm tắt', maxLength: 300 },
            { name: 'content', type: 'richText', label: 'Nội dung', editor: fullRichText, required: true },
          ],
        },
        seoTab(),
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'post-categories',
      label: 'Danh mục',
      required: true,
      admin: { position: 'sidebar' },
    },
    slugField('title'),
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Ngày đăng',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' } },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) return new Date()
            return value
          },
        ],
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Người viết',
      admin: { position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ value, req }) => {
            if (!value && req.user) return req.user.id
            return value
          },
        ],
      },
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      label: 'Bài viết liên quan',
      admin: { position: 'sidebar', description: 'Để trống sẽ tự lấy bài cùng danh mục.' },
      filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
    },
    searchTextField,
  ],
  // Phiên bản là bản nháp thì khôi phục dưới dạng nháp (xem restoreVersionEndpoint)
  endpoints: [restoreVersionEndpoint],
  hooks: {
    beforeOperation: [blockNoopRestore],
    beforeChange: [buildSearchText({ fields: ['title', 'excerpt'], relation: { field: 'category', collection: 'post-categories' } })],
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
  versions: {
    // Không tự động lưu nháp: nhân viên bấm "Lưu nháp" hoặc "Xuất bản" mới ghi,
    // nhờ vậy nút Lưu và Hủy chỉ bấm được khi có thay đổi, không sinh nháp rỗng.
    drafts: true,
    maxPerDoc: 20,
  },
}
