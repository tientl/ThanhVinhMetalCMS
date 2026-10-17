import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

const paths = (doc: { slug?: string | null }) => ['/bai-viet', `/bai-viet/danh-muc/${doc.slug}`]

export const PostCategories: CollectionConfig = {
  slug: 'post-categories',
  labels: { singular: 'Danh mục bài viết', plural: 'Danh mục bài viết' },
  admin: { components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } }, hideAPIURL: true, useAsTitle: 'name', defaultColumns: ['name', 'slug'], group: 'Bài viết' },
  access: {
    // Danh mục ảnh hưởng menu, trang chủ, đường dẫn: chỉ Quản trị thêm, sửa
    create: isAdmin,
    read: anyone,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Tên danh mục', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea', label: 'Mô tả ngắn' },
  ],
  hooks: {
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
}
