import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { fullRichText } from '@/fields/richText'
import { buildSearchText, searchTextField } from '@/fields/searchText'
import { publishedOthers, validatePublishedRelation } from '@/fields/publishedOnly'
import { RELATED } from '@/lib/related'
import { limit, MAX } from '@/fields/limits'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'
import { blockNoopRestore, restoreVersionEndpoint, VERSIONS_LIST_VIEW } from '@/hooks/versions'

// Đường dẫn bài viết trên website: dùng chung cho làm mới cache và ô slug trong admin
const URL_PREFIX = '/bai-viet/'
const paths = (doc: { slug?: string | null }) => ['/bai-viet', `${URL_PREFIX}${doc.slug}`]

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
    limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.postTitle),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Ảnh bìa', required: true },
            limit({ name: 'excerpt', type: 'textarea', label: 'Tóm tắt' }, MAX.summary),
            { name: 'content', type: 'richText', label: 'Nội dung', editor: fullRichText, required: true },
          ],
        },
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
    slugField('title', {}, { urlPrefix: URL_PREFIX }),
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
      // Chọn tay tối đa bấy nhiêu, web hiện đúng bấy nhiêu (src/lib/related.ts)
      maxRows: RELATED.posts.picked,
      label: 'Bài viết liên quan',
      admin: { position: 'sidebar', description: `Chọn gì hiện nấy, tối đa ${RELATED.posts.picked} bài. Để trống sẽ tự lấy ${RELATED.posts.auto} bài cùng danh mục. Bài bị ẩn sau khi chọn vẫn nằm trong danh sách nhưng không hiện trên web; xuất bản lại thì hiện lại.` },
      // Không chọn được bản nháp và chính nó (xem src/fields/publishedOnly.ts)
      filterOptions: publishedOthers,
      validate: validatePublishedRelation('posts', 'title'),
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
    // Không tự động lưu nháp: bấm "Lưu nháp" hoặc "Xuất bản" mới ghi,
    // nhờ vậy nút Lưu và Hủy chỉ bấm được khi có thay đổi, không sinh nháp rỗng.
    drafts: true,
    maxPerDoc: 20,
  },
}
