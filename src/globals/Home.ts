import type { Field, GlobalConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { limit, MAX } from '@/fields/limits'
import { publishedOnly, validatePublishedRelation } from '@/fields/publishedOnly'
import { revalidateAll } from '@/hooks/revalidate'
import { rejectStaleSave } from '@/hooks/staleSave'

/**
 * "Vùng ảnh muốn giữ" của ô ảnh cùng hàng: kéo khung trong admin (ImageFrameField), lưu cùng trang chủ khi bấm Lưu,
 * web phóng ảnh theo vùng đó (FramedImage, src/lib/frame.ts). `aspect` là tỉ lệ khung trên máy tính.
 */
const imageFrame = (aspect: number): Field => ({
  name: 'imageFrame',
  type: 'json',
  label: 'Vùng ảnh muốn giữ',
  admin: { components: { Field: { path: '@/components/admin/ImageFrameField#ImageFrameField', clientProps: { aspect, mode: 'focal' } } } },
})

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Trang chủ',
  admin: { components: { elements: { beforeDocumentControls: ['@/components/admin/StaleDocWatcher#StaleDocWatcher', '@/components/admin/CancelButton#CancelButton'] } }, hideAPIURL: true, group: 'Nội dung' },
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
                {
                  name: 'sliderCrop',
                  type: 'ui',
                  admin: { components: { Field: { path: '@/components/admin/ImageFrameField#ImageFrameField', clientProps: { aspect: 2, mode: 'hero' } } } },
                },
                limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.heading),
                { name: 'description', type: 'textarea', label: 'Mô tả' },
                {
                  type: 'row',
                  fields: [
                    limit({ name: 'buttonLabel', type: 'text', label: 'Chữ trên nút', defaultValue: 'Khám phá ngay' }, MAX.short),
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
                imageFrame(1),
                limit({ name: 'tag', type: 'text', label: 'Nhãn nhỏ', admin: { description: 'Ví dụ: INOX, THÉP' } }, MAX.short),
                limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.tile),
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
                limit({ name: 'slogan', type: 'text', label: 'Câu khẩu hiệu' }, MAX.line),
                { name: 'foundedYear', type: 'number', label: 'Năm thành lập' },
                limit({ name: 'heading', type: 'text', label: 'Tiêu đề', defaultValue: 'Giới thiệu' }, MAX.heading),
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
                    limit({ name: 'buttonLabel', type: 'text', label: 'Chữ trên nút', defaultValue: 'Về chúng tôi' }, MAX.short),
                    { name: 'buttonHref', type: 'text', label: 'Nút dẫn tới', defaultValue: '/gioi-thieu' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh' },
                imageFrame(1.4),
                {
                  type: 'row',
                  fields: [
                    limit({ name: 'badgeTitle', type: 'text', label: 'Ô nổi bật: tiêu đề', defaultValue: 'Cắt, chấn, hàn, sơn' }, 40),
                    limit({ name: 'badgeSub', type: 'text', label: 'Ô nổi bật: dòng phụ', defaultValue: 'Làm trọn trong một xưởng' }, 60),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Giải pháp',
          fields: [
            limit({ name: 'solutionsHeading', type: 'text', label: 'Tiêu đề', defaultValue: 'Giải pháp' }, MAX.heading),
            { name: 'solutionsIntro', type: 'textarea', label: 'Mô tả' },
            {
              name: 'solutions',
              type: 'array',
              label: '2 ô giải pháp',
              labels: { singular: 'Giải pháp', plural: 'Giải pháp' },
              maxRows: 2,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh', required: true },
                imageFrame(4 / 3),
                limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.tile),
                limit({ name: 'subtitle', type: 'text', label: 'Mô tả ngắn' }, MAX.line),
                { name: 'href', type: 'text', label: 'Dẫn tới', required: true },
              ],
            },
          ],
        },
        {
          label: 'Ứng dụng',
          fields: [
            limit({ name: 'applicationsHeading', type: 'text', label: 'Tiêu đề', defaultValue: 'Khám phá ứng dụng cho công trình' }, MAX.heading),
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
                    limit({ name: 'tabLabel', type: 'text', label: 'Tên tab', required: true }, MAX.short),
                    limit({ name: 'title', type: 'text', label: 'Tiêu đề', required: true }, MAX.heading),
                  ],
                },
                { name: 'description', type: 'textarea', label: 'Mô tả' },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Ảnh', required: true },
                imageFrame(1.6),
                {
                  name: 'products',
                  type: 'relationship',
                  relationTo: 'products',
                  hasMany: true,
                  maxRows: 4,
                  label: '4 sản phẩm tiêu biểu',
                  // Bản nháp không chọn được (src/fields/publishedOnly.ts)
                  filterOptions: publishedOnly,
                  validate: validatePublishedRelation('products', 'name', { excludeSelf: false }),
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
                        limit({ name: 'label', type: 'text', label: 'Nhãn', required: true, admin: { width: '50%' } }, 40),
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
            limit({ name: 'categoriesHeading', type: 'text', label: 'Tiêu đề khối danh mục', defaultValue: 'Tìm hiểu sản phẩm theo danh mục' }, MAX.heading),
            {
              name: 'homeCategories',
              type: 'relationship',
              relationTo: 'product-categories',
              hasMany: true,
              maxRows: 6,
              label: '6 danh mục hiển thị',
              admin: { description: 'Để trống sẽ lấy các danh mục có bật "Hiện ở trang chủ".' },
            },
            limit({ name: 'newsHeading', type: 'text', label: 'Tiêu đề khối tin', defaultValue: 'Kiến thức và tin tức' }, MAX.heading),
            { name: 'newsIntro', type: 'textarea', label: 'Mô tả khối tin' },
            { name: 'newsCount', type: 'number', label: 'Số bài hiển thị', defaultValue: 4, min: 1, max: 8 },
          ],
        },
        {
          label: 'Liên hệ',
          fields: [
            limit({ name: 'contactHeading', type: 'text', label: 'Tiêu đề', defaultValue: 'Liên hệ với chúng tôi' }, MAX.heading),
            { name: 'contactIntro', type: 'textarea', label: 'Mô tả' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            limit({ name: 'metaTitle', type: 'text', label: 'Tiêu đề trang chủ' }, 70),
            limit({ name: 'metaDescription', type: 'textarea', label: 'Mô tả trang chủ' }, 160),
            { name: 'metaImage', type: 'upload', relationTo: 'media', label: 'Ảnh chia sẻ' },
          ],
        },
      ],
    },
  ],
  hooks: { beforeValidate: [rejectStaleSave], afterChange: [revalidateAll] },
}
