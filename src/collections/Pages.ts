import type { CollectionConfig } from 'payload'

import { adminOrEditorDraft, isAdmin, publishedOrLoggedIn } from '@/access'
import { fullRichText } from '@/fields/richText'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'
import { editorDraftsOnly } from '@/hooks/drafts'
import { blockNoopRestore, restoreVersionEndpoint, VERSIONS_LIST_VIEW } from '@/hooks/versions'

const paths = (doc: { slug?: string | null }) => [`/${doc.slug}`]

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Trang tĩnh', plural: 'Trang tĩnh' },
  admin: {
    hideAPIURL: true,
    components: {
      edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton', '@/components/admin/EditorDraftNotice#EditorDraftNotice'] },
      views: { edit: { versions: VERSIONS_LIST_VIEW } },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Nội dung',
    description: 'Giới thiệu, chính sách bảo hành, bảo mật, hướng dẫn gửi bản vẽ.',
  },
  access: {
    // Nhân viên chỉ lưu nháp, Quản trị xuất bản
    create: adminOrEditorDraft,
    read: publishedOrLoggedIn,
    update: adminOrEditorDraft,
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
      ],
    },
    slugField('title'),
  ],
  // Phiên bản là bản nháp thì khôi phục dưới dạng nháp (xem restoreVersionEndpoint)
  endpoints: [restoreVersionEndpoint],
  hooks: {
    beforeOperation: [blockNoopRestore, editorDraftsOnly],
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
