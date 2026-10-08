import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

const paths = (doc: { slug?: string | null }) => ['/bai-viet', `/bai-viet/danh-muc/${doc.slug}`]

export const PostCategories: CollectionConfig = {
  slug: 'post-categories',
  labels: { singular: 'Danh mục bài viết', plural: 'Danh mục bài viết' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug'], group: 'Bài viết' },
  access: {
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
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
