import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'
import { linkedNameCell, thumbnailColumn } from '@/fields/thumbnail'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

const paths = (doc: { slug?: string | null }) => ['/san-pham', `/san-pham/danh-muc/${doc.slug}`]

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  labels: { singular: 'Danh mục sản phẩm', plural: 'Danh mục sản phẩm' },
  admin: {
    hideAPIURL: true,
    components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } },
    useAsTitle: 'name',
    defaultColumns: ['thumbnail', 'name', 'slug', 'order', 'showOnHome'],
    group: 'Sản phẩm',
  },
  access: {
    // Danh mục ảnh hưởng menu, trang chủ, đường dẫn: chỉ Quản trị thêm, sửa
    create: isAdmin,
    read: anyone,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', label: 'Tên danh mục', required: true, admin: { components: linkedNameCell } },
    thumbnailColumn('image'),
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
