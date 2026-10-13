import type { UIField } from 'payload'

/**
 * Cột "Ảnh" trong danh sách quản trị: ảnh đại diện nhỏ đứng trước tên. Không hiện gì trong trang sửa.
 * `imagePath`: field ảnh trong document, ví dụ 'image' hoặc 'images.0.image' (ảnh đầu của bộ ảnh).
 * Đặt 'thumbnail' đứng đầu `defaultColumns`, và gắn `linkedNameCell` cho field tên để tên vẫn bấm được.
 */
export const thumbnailColumn = (imagePath: string): UIField => ({
  name: 'thumbnail',
  type: 'ui',
  label: 'Ảnh',
  admin: {
    components: {
      Cell: { path: '@/components/admin/ThumbnailCell#ThumbnailCell', serverProps: { imagePath } },
    },
  },
})

/** Ô tên luôn có link mở trang sửa (Payload chỉ gắn link cho cột đầu tiên, giờ là cột ảnh). */
export const linkedNameCell = { Cell: '@/components/admin/DocLinkCell#DocLinkCell' }
