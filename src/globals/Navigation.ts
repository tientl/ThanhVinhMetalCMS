import type { ArrayField, Field, GlobalConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { revalidateAll } from '@/hooks/revalidate'

const simpleLink = (): Field[] => [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', label: 'Nhãn', required: true, admin: { width: '50%' } },
      { name: 'href', type: 'text', label: 'Đường dẫn', required: true, admin: { width: '50%' } },
    ],
  },
]

const megaMenu: Field = {
  name: 'megaMenu',
  type: 'group',
  label: 'Nội dung mega menu',
  admin: { condition: (_, siblingData) => siblingData?.type === 'mega' },
  fields: [
    { name: 'intro', type: 'textarea', label: 'Đoạn giới thiệu' },
    {
      name: 'columns',
      type: 'array',
      label: 'Cột liên kết',
      labels: { singular: 'Cột', plural: 'Cột' },
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', label: 'Tiêu đề cột', required: true },
        {
          name: 'links',
          type: 'array',
          label: 'Liên kết',
          labels: { singular: 'Liên kết', plural: 'Liên kết' },
          fields: simpleLink(),
        },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Ô ảnh',
      labels: { singular: 'Ô ảnh', plural: 'Ô ảnh' },
      maxRows: 2,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh', required: true },
        { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
        { name: 'subtitle', type: 'text', label: 'Mô tả ngắn' },
        { name: 'href', type: 'text', label: 'Đường dẫn', required: true },
      ],
    },
    {
      name: 'downloads',
      type: 'array',
      label: 'Tài liệu tải về',
      labels: { singular: 'Tài liệu', plural: 'Tài liệu' },
      fields: [
        { name: 'title', type: 'text', label: 'Tên tài liệu', required: true },
        { name: 'note', type: 'text', label: 'Ghi chú', admin: { description: 'Ví dụ: PDF, 2 MB' } },
        { name: 'file', type: 'upload', relationTo: 'media', label: 'Tệp' },
        { name: 'href', type: 'text', label: 'Hoặc đường dẫn', admin: { description: 'Dùng khi chưa có tệp.' } },
      ],
    },
  ],
}

const menuItems = (name: string, label: string): ArrayField => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Mục menu', plural: 'Mục menu' },
  maxRows: 6,
  admin: { initCollapsed: true, components: { RowLabel: '@/components/admin/MenuRowLabel#MenuRowLabel' } },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', label: 'Nhãn', required: true, admin: { width: '40%' } },
        {
          name: 'type',
          type: 'select',
          label: 'Loại',
          defaultValue: 'link',
          options: [
            { label: 'Liên kết', value: 'link' },
            { label: 'Mega menu', value: 'mega' },
          ],
          admin: { width: '20%' },
        },
        { name: 'href', type: 'text', label: 'Đường dẫn', admin: { width: '40%', condition: (_, s) => s?.type !== 'mega' } },
      ],
    },
    megaMenu,
  ],
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menu và mega menu',
  admin: { components: { elements: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } }, group: 'Cài đặt', hideAPIURL: true },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'Menu trái', fields: [menuItems('left', 'Menu bên trái logo')] },
        { label: 'Menu phải', fields: [menuItems('right', 'Menu bên phải logo')] },
        {
          label: 'Tìm kiếm',
          fields: [
            {
              name: 'searchSuggestions',
              type: 'array',
              label: 'Gợi ý tìm nhanh',
              labels: { singular: 'Gợi ý', plural: 'Gợi ý' },
              maxRows: 8,
              fields: simpleLink(),
            },
          ],
        },
        {
          label: 'Chân trang',
          fields: [
            {
              name: 'footerLinks',
              type: 'array',
              label: 'Liên kết chân trang',
              labels: { singular: 'Liên kết', plural: 'Liên kết' },
              maxRows: 6,
              fields: simpleLink(),
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateAll] },
}
