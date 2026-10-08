import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { simpleRichText } from '@/fields/richText'
import { buildSearchText, searchTextField } from '@/fields/searchText'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

const paths = (doc: { slug?: string | null }) => ['/san-pham', `/san-pham/${doc.slug}`]

export const Products: CollectionConfig<'products'> = {
  slug: 'products',
  labels: { singular: 'Sản phẩm', plural: 'Sản phẩm' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'featured', '_status', 'updatedAt'],
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
    { name: 'name', type: 'text', label: 'Tên sản phẩm', required: true },
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
        seoTab(),
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
      admin: { position: 'sidebar', description: 'Để trống sẽ tự lấy sản phẩm cùng danh mục.' },
      filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
    },
    searchTextField,
  ],
  hooks: {
    beforeChange: [buildSearchText({ fields: ['name', 'summary', 'material'], relation: { field: 'category', collection: 'product-categories' } })],
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
  versions: {
    drafts: { autosave: { interval: 1000 } },
    maxPerDoc: 20,
  },
}
