import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '@/access'
import { limit, MAX } from '@/fields/limits'
import { slugField } from '@/fields/slug'
import { blockDeleteWhileUsed } from '@/hooks/categories'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

// Đường dẫn danh mục trên website: dùng chung cho làm mới cache và ô slug trong admin
const URL_PREFIX = '/bai-viet/danh-muc/'
const paths = (doc: { slug?: string | null }) => ['/bai-viet', `${URL_PREFIX}${doc.slug}`]

export const PostCategories: CollectionConfig = {
  slug: 'post-categories',
  labels: { singular: 'Danh mục bài viết', plural: 'Danh mục bài viết' },
  admin: { components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } }, hideAPIURL: true, useAsTitle: 'name', defaultColumns: ['name', 'slug'], group: 'Bài viết' },
  access: {
    // Nhân viên thêm, sửa được (không có nháp, lưu là lên web); xóa thì chỉ Quản trị vì bài viết đang gắn danh mục
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    limit({ name: 'name', type: 'text', label: 'Tên danh mục', required: true }, MAX.categoryName),
    slugField('name', {}, { urlPrefix: URL_PREFIX }),
    { name: 'description', type: 'textarea', label: 'Mô tả ngắn' },
  ],
  hooks: {
    afterChange: [revalidateCollection(paths)],
    // Còn bài viết đang dùng thì không xóa được (src/hooks/categories.ts)
    beforeDelete: [blockDeleteWhileUsed('posts')],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
}
