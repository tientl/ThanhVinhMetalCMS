import type { ArrayField, Field, GlobalConfig } from 'payload'

import { anyone, hiddenFromEditors, isAdmin } from '@/access'
import { limit, MAX } from '@/fields/limits'
import { revisionField } from '@/fields/revision'
import { revalidateAll } from '@/hooks/revalidate'
import { rejectStaleSave } from '@/hooks/staleSave'

const simpleLink = (): Field[] => [
  {
    type: 'row',
    fields: [
      limit({ name: 'label', type: 'text', label: 'Nhãn', required: true, admin: { width: '50%' } }, MAX.linkLabel),
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
        limit({ name: 'title', type: 'text', label: 'Tiêu đề cột', required: true }, 40),
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
        limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.tile),
        limit({ name: 'subtitle', type: 'text', label: 'Mô tả ngắn' }, MAX.line),
        { name: 'href', type: 'text', label: 'Đường dẫn', required: true },
      ],
    },
    {
      name: 'downloads',
      type: 'array',
      label: 'Tài liệu tải về',
      labels: { singular: 'Tài liệu', plural: 'Tài liệu' },
      fields: [
        limit({ name: 'title', type: 'text', label: 'Tên tài liệu', required: true }, 80),
        limit({ name: 'note', type: 'text', label: 'Ghi chú', admin: { description: 'Ví dụ: PDF, 2 MB' } }, MAX.short),
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
        limit({ name: 'label', type: 'text', label: 'Nhãn', required: true, admin: { width: '40%' } }, MAX.menuLabel),
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
  admin: { components: { elements: { beforeDocumentControls: ['@/components/admin/StaleDocWatcher#StaleDocWatcher', '@/components/admin/CancelButton#CancelButton'] } }, group: 'Cài đặt', hideAPIURL: true, hidden: hiddenFromEditors },
  access: { read: anyone, update: isAdmin },
  fields: [
    revisionField,
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
  hooks: { beforeValidate: [rejectStaleSave], afterChange: [revalidateAll] },
}
