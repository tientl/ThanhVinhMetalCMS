import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '@/access'
import { limit, MAX } from '@/fields/limits'
import { slugField } from '@/fields/slug'
import { linkedNameCell, thumbnailColumn } from '@/fields/thumbnail'
import { blockDeleteWhileUsed } from '@/hooks/categories'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

// Đường dẫn danh mục trên website: dùng chung cho làm mới cache và ô slug trong admin
const URL_PREFIX = '/san-pham/danh-muc/'
const paths = (doc: { slug?: string | null }) => ['/san-pham', `${URL_PREFIX}${doc.slug}`]

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
    // Nhân viên thêm, sửa được (không có nháp, lưu là lên web); xóa thì chỉ Quản trị vì sản phẩm đang gắn danh mục
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultSort: 'order',
  fields: [
    limit({ name: 'name', type: 'text', label: 'Tên danh mục', required: true, admin: { components: linkedNameCell } }, MAX.categoryName),
    thumbnailColumn('image'),
    slugField('name', {}, { urlPrefix: URL_PREFIX }),
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
    // Còn sản phẩm đang dùng thì không xóa được (src/hooks/categories.ts)
    beforeDelete: [blockDeleteWhileUsed('products')],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
}
