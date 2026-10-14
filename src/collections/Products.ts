import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { simpleRichText } from '@/fields/richText'
import { buildSearchText, searchTextField } from '@/fields/searchText'
import { slugField } from '@/fields/slug'
import { linkedNameCell, thumbnailColumn } from '@/fields/thumbnail'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'
import { dropEmptyRows } from '@/hooks/arrays'
import { blockNoopRestore, restoreVersionEndpoint, VERSIONS_LIST_VIEW } from '@/hooks/versions'

const paths = (doc: { slug?: string | null }) => ['/san-pham', `/san-pham/${doc.slug}`]

export const Products: CollectionConfig<'products'> = {
  slug: 'products',
  labels: { singular: 'Sản phẩm', plural: 'Sản phẩm' },
  admin: {
    hideAPIURL: true,
    components: {
      edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] },
      views: { edit: { versions: VERSIONS_LIST_VIEW } },
    },
    useAsTitle: 'name',
    defaultColumns: ['thumbnail', 'name', 'category', 'featured', '_status', 'updatedAt'],
    group: 'Sản phẩm',
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOrLoggedIn,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultPopulate: {
    name: true,
    slug: true,
    summary: true,
    images: true,
    category: true,
    price: true,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Tên sản phẩm', required: true, admin: { components: linkedNameCell } },
    thumbnailColumn('images.0.image'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            {
              name: 'images',
              type: 'array',
              label: 'Bộ ảnh',
              labels: { singular: 'Ảnh', plural: 'Ảnh' },
              minRows: 1,
              admin: { description: 'Ảnh đầu tiên là ảnh đại diện.' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Ảnh' }],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Tóm tắt',
              maxLength: 300,
              admin: { description: 'Hiện ở thẻ sản phẩm và đầu trang chi tiết.' },
            },
            { name: 'description', type: 'richText', label: 'Mô tả chi tiết', editor: simpleRichText },
          ],
        },
        {
          label: 'Thông số',
          fields: [
            { name: 'material', type: 'text', label: 'Vật liệu', admin: { description: 'Ví dụ: Thép tấm CT3, Inox 304, Nhôm 5052.' } },
            {
              name: 'spec',
              type: 'array',
              label: 'Quy cách, thông số',
              labels: { singular: 'Thông số', plural: 'Thông số' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', label: 'Tên', required: true, admin: { width: '40%' } },
                    { name: 'value', type: 'text', label: 'Giá trị', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
            {
              name: 'price',
              type: 'text',
              label: 'Giá',
              defaultValue: 'Liên hệ',
              admin: { description: 'Nhập giá hoặc để "Liên hệ".' },
            },
          ],
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      label: 'Danh mục',
      required: true,
      admin: { position: 'sidebar' },
    },
    slugField('name'),
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Sản phẩm nổi bật',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Sản phẩm liên quan',
      admin: { position: 'sidebar', description: 'Chọn gì hiện nấy (tối đa 4). Để trống sẽ tự lấy 4 sản phẩm cùng danh mục.' },
      filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
    },
    searchTextField,
  ],
  // Phiên bản là bản nháp thì khôi phục dưới dạng nháp (xem restoreVersionEndpoint)
  endpoints: [restoreVersionEndpoint],
  hooks: {
    beforeOperation: [blockNoopRestore],
    // Bỏ dòng "Bộ ảnh" chưa chọn ảnh, dòng "Thông số" trống cả tên lẫn giá trị (lưu nháp vẫn lọt nếu không bỏ)
    beforeValidate: [dropEmptyRows({ images: ['image'], spec: ['label', 'value'] })],
    beforeChange: [buildSearchText({ fields: ['name', 'summary', 'material'], relation: { field: 'category', collection: 'product-categories' } })],
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
