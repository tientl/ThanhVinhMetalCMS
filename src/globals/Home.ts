import type { GlobalConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { revalidateAll } from '@/hooks/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Trang chủ',
  admin: { components: { elements: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } }, hideAPIURL: true, group: 'Nội dung' },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Slider',
          fields: [
            {
              name: 'slides',
              type: 'array',
              label: 'Ảnh slider',
              labels: { singular: 'Slide', plural: 'Slide' },
              minRows: 1,
              maxRows: 5,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh (nên 2400×1200, nền tối)', required: true },
                { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
                { name: 'description', type: 'textarea', label: 'Mô tả' },
                {
                  type: 'row',
                  fields: [
                    { name: 'buttonLabel', type: 'text', label: 'Chữ trên nút', defaultValue: 'Khám phá ngay' },
                    { name: 'buttonHref', type: 'text', label: 'Nút dẫn tới', defaultValue: '/san-pham' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Bộ sưu tập',
          fields: [
            {
              name: 'collections',
              type: 'array',
              label: '2 ô bộ sưu tập',
              labels: { singular: 'Bộ sưu tập', plural: 'Bộ sưu tập' },
              minRows: 2,
              maxRows: 2,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh', required: true },
                { name: 'tag', type: 'text', label: 'Nhãn nhỏ', admin: { description: 'Ví dụ: INOX, THÉP' } },
                { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
                { name: 'description', type: 'textarea', label: 'Mô tả' },
                { name: 'href', type: 'text', label: 'Dẫn tới', required: true },
              ],
            },
          ],
        },
        {
          label: 'Giới thiệu',
          fields: [
            {
              name: 'about',
              type: 'group',
              label: 'Khối giới thiệu',
              fields: [
                { name: 'slogan', type: 'text', label: 'Câu khẩu hiệu' },
                { name: 'foundedYear', type: 'number', label: 'Năm thành lập' },
                { name: 'heading', type: 'text', label: 'Tiêu đề', defaultValue: 'Giới thiệu' },
                {
                  name: 'paragraphs',
                  type: 'array',
                  label: 'Đoạn văn',
                  labels: { singular: 'Đoạn', plural: 'Đoạn' },
                  maxRows: 3,
                  fields: [{ name: 'text', type: 'textarea', label: 'Nội dung', required: true }],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'buttonLabel', type: 'text', label: 'Chữ trên nút', defaultValue: 'Về chúng tôi' },
                    { name: 'buttonHref', type: 'text', label: 'Nút dẫn tới', defaultValue: '/gioi-thieu' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh' },
                {
                  type: 'row',
                  fields: [
                    { name: 'badgeTitle', type: 'text', label: 'Ô nổi bật: tiêu đề', defaultValue: 'Cắt, chấn, hàn, sơn' },
                    { name: 'badgeSub', type: 'text', label: 'Ô nổi bật: dòng phụ', defaultValue: 'Làm trọn trong một xưởng' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Giải pháp',
          fields: [
            { name: 'solutionsHeading', type: 'text', label: 'Tiêu đề', defaultValue: 'Giải pháp' },
            { name: 'solutionsIntro', type: 'textarea', label: 'Mô tả' },
            {
              name: 'solutions',
              type: 'array',
              label: '2 ô giải pháp',
              labels: { singular: 'Giải pháp', plural: 'Giải pháp' },
              maxRows: 2,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh', required: true },
                { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
                { name: 'subtitle', type: 'text', label: 'Mô tả ngắn' },
                { name: 'href', type: 'text', label: 'Dẫn tới', required: true },
              ],
            },
          ],
        },
        {
          label: 'Ứng dụng',
          fields: [
            { name: 'applicationsHeading', type: 'text', label: 'Tiêu đề', defaultValue: 'Khám phá ứng dụng cho công trình' },
            { name: 'applicationsIntro', type: 'textarea', label: 'Mô tả', defaultValue: 'Chọn loại công trình để xem các sản phẩm phù hợp.' },
            {
              name: 'applications',
              type: 'array',
              label: '4 tab ứng dụng',
              labels: { singular: 'Tab', plural: 'Tab' },
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'tabLabel', type: 'text', label: 'Tên tab', required: true },
                    { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
                  ],
                },
                { name: 'description', type: 'textarea', label: 'Mô tả' },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh', required: true },
                {
                  name: 'products',
                  type: 'relationship',
                  relationTo: 'products',
                  hasMany: true,
                  maxRows: 4,
                  label: '4 sản phẩm tiêu biểu',
                },
                {
                  name: 'hotspotPicker',
                  type: 'ui',
                  label: 'Điểm chấm trên ảnh',
                  admin: { components: { Field: '@/components/admin/HotspotPicker#HotspotPicker' } },
                },
                {
                  name: 'hotspots',
                  type: 'array',
                  label: 'Danh sách điểm chấm',
                  labels: { singular: 'Điểm', plural: 'Điểm' },
                  maxRows: 5,
                  admin: { description: 'Vị trí tính theo % từ mép trái và mép trên (0–100). Đặt bằng chuột trên ảnh phía trên hoặc gõ số ở đây.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'x', type: 'number', label: '% trái', min: 0, max: 100, required: true, admin: { width: '25%' } },
                        { name: 'y', type: 'number', label: '% trên', min: 0, max: 100, required: true, admin: { width: '25%' } },
                        { name: 'label', type: 'text', label: 'Nhãn', required: true, admin: { width: '50%' } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Danh mục và tin',
          fields: [
            { name: 'categoriesHeading', type: 'text', label: 'Tiêu đề khối danh mục', defaultValue: 'Tìm hiểu sản phẩm theo danh mục' },
            {
              name: 'homeCategories',
              type: 'relationship',
              relationTo: 'product-categories',
              hasMany: true,
              maxRows: 6,
              label: '6 danh mục hiển thị',
              admin: { description: 'Để trống sẽ lấy các danh mục có bật "Hiện ở trang chủ".' },
            },
            { name: 'newsHeading', type: 'text', label: 'Tiêu đề khối tin', defaultValue: 'Kiến thức và tin tức' },
            { name: 'newsIntro', type: 'textarea', label: 'Mô tả khối tin' },
            { name: 'newsCount', type: 'number', label: 'Số bài hiển thị', defaultValue: 4, min: 1, max: 8 },
          ],
        },
        {
          label: 'Liên hệ',
          fields: [
            { name: 'contactHeading', type: 'text', label: 'Tiêu đề', defaultValue: 'Liên hệ với chúng tôi' },
            { name: 'contactIntro', type: 'textarea', label: 'Mô tả' },
            { name: 'newsletterNote', type: 'text', label: 'Ghi chú ô bản tin', defaultValue: 'Nhận thông tin mẫu hoa văn mới và chương trình ưu đãi.' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', label: 'Tiêu đề trang chủ' },
            { name: 'metaDescription', type: 'textarea', label: 'Mô tả trang chủ' },
            { name: 'metaImage', type: 'upload', relationTo: 'media', label: 'Ảnh chia sẻ' },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateAll] },
}
