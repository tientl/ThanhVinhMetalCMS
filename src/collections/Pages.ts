import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { fullRichText } from '@/fields/richText'
import { limit, MAX } from '@/fields/limits'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'
import { blockNoopRestore, restoreVersionEndpoint, VERSIONS_LIST_VIEW } from '@/hooks/versions'

// Trang tĩnh nằm ngay sau tên miền: dùng chung cho làm mới cache và ô slug trong admin
const URL_PREFIX = '/'
const paths = (doc: { slug?: string | null }) => [`${URL_PREFIX}${doc.slug}`]

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Trang tĩnh', plural: 'Trang tĩnh' },
  admin: {
    hideAPIURL: true,
    components: {
      edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] },
      views: { edit: { versions: VERSIONS_LIST_VIEW } },
    },
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
    limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.pageTitle),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Ảnh đầu trang' },
            limit({ name: 'intro', type: 'textarea', label: 'Đoạn mở đầu' }, MAX.summary),
            { name: 'content', type: 'richText', label: 'Nội dung', editor: fullRichText, required: true },
          ],
        },
      ],
    },
    slugField('title', {}, { urlPrefix: URL_PREFIX }),
  ],
  // Phiên bản là bản nháp thì khôi phục dưới dạng nháp (xem restoreVersionEndpoint)
  endpoints: [restoreVersionEndpoint],
  hooks: {
    beforeOperation: [blockNoopRestore],
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
