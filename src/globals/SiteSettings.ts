import type { GlobalConfig } from 'payload'

import { anyone, hiddenFromEditors, isAdmin } from '@/access'
import { limit, MAX } from '@/fields/limits'
import { revalidateAll } from '@/hooks/revalidate'
import { rejectStaleSave } from '@/hooks/staleSave'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Thông tin công ty',
  admin: { components: { elements: { beforeDocumentControls: ['@/components/admin/StaleDocWatcher#StaleDocWatcher', '@/components/admin/CancelButton#CancelButton'] } }, hideAPIURL: true, group: 'Cài đặt', hidden: hiddenFromEditors },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Công ty',
          fields: [
            {
              type: 'row',
              fields: [
                limit({ name: 'brandName', type: 'text', label: 'Tên thương hiệu', required: true, defaultValue: 'Thành Vinh Metal' }, 60),
                limit({ name: 'companyName', type: 'text', label: 'Tên pháp nhân', required: true, defaultValue: 'Công ty TNHH Vinh Metal' }, MAX.line),
              ],
            },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
            limit({ name: 'tagline', type: 'text', label: 'Câu khẩu hiệu', defaultValue: 'Giải pháp kim loại tấm cho mọi công trình' }, MAX.line),
            { name: 'taxCode', type: 'text', label: 'Mã số thuế' },
            { name: 'address', type: 'textarea', label: 'Địa chỉ' },
            { name: 'workingHours', type: 'text', label: 'Giờ làm việc', defaultValue: 'Thứ 2 – Thứ 7, 7:30 – 17:00' },
            {
              name: 'mapEmbed',
              type: 'textarea',
              label: 'Google Maps',
              admin: { description: 'Dán mã nhúng (iframe) từ Google Maps > Chia sẻ > Nhúng bản đồ.' },
            },
          ],
        },
        {
          label: 'Liên hệ',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'hotline', type: 'text', label: 'Hotline', required: true },
                { name: 'contactName', type: 'text', label: 'Người liên hệ', defaultValue: 'Mr Vinh' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'zalo', type: 'text', label: 'Số Zalo', admin: { description: 'Số điện thoại dùng Zalo, ví dụ 0946272467.' } },
                { name: 'email', type: 'email', label: 'Email hiển thị' },
              ],
            },
            {
              name: 'quoteEmail',
              type: 'email',
              label: 'Email nhận yêu cầu báo giá',
              admin: { description: 'Để trống sẽ dùng email hiển thị.' },
            },
            { name: 'facebook', type: 'text', label: 'Link Facebook' },
            { name: 'youtube', type: 'text', label: 'Link YouTube' },
            { name: 'tiktok', type: 'text', label: 'Link TikTok' },
          ],
        },
        {
          label: 'Giao diện',
          fields: [
            {
              name: 'accentColor',
              type: 'text',
              label: 'Màu chủ đạo',
              defaultValue: '#E8411A',
              validate: (value: unknown) =>
                !value || /^#[0-9a-fA-F]{6}$/.test(String(value).trim()) ? true : 'Nhập mã màu dạng #RRGGBB, ví dụ #E8411A',
              admin: {
                description:
                  'Dùng cho nút, gạch chân menu, điểm chấm, viền ảnh. Các tông nhạt hơn cho nhãn nhỏ và chữ trên nút viền được tự suy ra. Nên chọn màu đậm vì chữ trên nền màu luôn là màu tối.',
                components: { Field: '@/components/admin/ColorField#ColorField' },
              },
            },
          ],
        },
        {
          label: 'Theo dõi',
          fields: [
            { name: 'ga4Id', type: 'text', label: 'Google Analytics 4 ID', admin: { description: 'Dạng G-XXXXXXXXXX' } },
            { name: 'searchConsoleToken', type: 'text', label: 'Mã xác minh Search Console', admin: { description: 'Nội dung thuộc tính content của thẻ meta google-site-verification.' } },
            { name: 'pixelId', type: 'text', label: 'Facebook Pixel ID' },
          ],
        },
      ],
    },
  ],
  hooks: { beforeValidate: [rejectStaleSave], afterChange: [revalidateAll] },
}
