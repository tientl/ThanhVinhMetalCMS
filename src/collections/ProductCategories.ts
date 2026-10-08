import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

const paths = (doc: { slug?: string | null }) => ['/san-pham', `/san-pham/danh-muc/${doc.slug}`]

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  labels: { singular: 'Danh mục sản phẩm', plural: 'Danh mục sản phẩm' },
  admin: {
    hideAPIURL: true,
    components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } },
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'showOnHome'],
    group: 'Sản phẩm',
  },
  access: {
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', label: 'Tên danh mục', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea', label: 'Mô tả ngắn' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh đại diện' },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiển thị trước.' },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Hiện ở trang chủ',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
}
