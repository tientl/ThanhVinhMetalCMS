/**
 * Trạng thái yêu cầu báo giá. Dùng chung cho collection (ô chọn), cột trạng thái, 4 ô thống kê trên danh sách
 * và số realtime. Màu đặc trưng khai báo trong src/app/(payload)/custom.scss theo class `qs--<value>`.
 * Thêm trạng thái mới: thêm vào mảng này (thứ tự = thứ tự hiển thị), thêm màu trong custom.scss,
 * thêm số đếm vào LiveCounts (src/lib/liveEvents.ts). Database cần cập nhật enum (chạy `pnpm dev` một lần).
 */
export const QUOTE_STATUSES = [
  { value: 'new', label: 'Mới', hint: 'Khách vừa gửi, chưa xử lý', metric: 'newQuotes' },
  { value: 'callback', label: 'Cần liên hệ lại', hint: 'Chưa liên lạc được hoặc hẹn gọi lại', metric: 'callbackQuotes' },
  { value: 'contacted', label: 'Đã liên hệ', hint: 'Đã trao đổi, đang báo giá', metric: 'contactedQuotes' },
  { value: 'done', label: 'Hoàn tất', hint: 'Đã chốt hoặc đã đóng', metric: 'doneQuotes' },
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]['value']
export type QuoteStatusMetric = (typeof QUOTE_STATUSES)[number]['metric']

export const quoteStatusLabel = (value: unknown): string | null =>
  QUOTE_STATUSES.find((s) => s.value === value)?.label ?? null
