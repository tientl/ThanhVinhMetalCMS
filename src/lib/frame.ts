import type { CSSProperties } from 'react'

/**
 * "Vùng ảnh muốn giữ" của một ô ảnh trên trang chủ (ô json `imageFrame` của global Home), chọn bằng khung kéo trong admin.
 * x, y, width, height tính theo % ảnh gốc như PercentCrop của react-image-crop; `media` là id ảnh lúc chọn,
 * đổi ảnh khác thì vùng cũ tự bỏ qua.
 */
export type ImageFrame = { x: number; y: number; width: number; height: number; media: number | string }

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)
const round = (n: number) => Math.round(n * 100) / 100

/** Đọc giá trị ô `imageFrame`. Sai dạng, rỗng hay chọn cho ảnh khác thì null (hiển thị như chưa chọn vùng). */
export const parseFrame = (value: unknown, mediaId?: number | string | null): ImageFrame | null => {
  if (!value || typeof value !== 'object') return null
  const { x, y, width, height, media } = value as Record<string, unknown>
  if (!isNum(x) || !isNum(y) || !isNum(width) || !isNum(height)) return null
  if (mediaId != null && String(media) !== String(mediaId)) return null
  const w = Math.min(Math.max(width, 0), 100)
  const h = Math.min(Math.max(height, 0), 100)
  if (w < 1 || h < 1) return null
  return {
    x: round(Math.min(Math.max(x, 0), 100 - w)),
    y: round(Math.min(Math.max(y, 0), 100 - h)),
    width: round(w),
    height: round(h),
    media: media as number | string,
  }
}

const num = (n: number) => Number(n.toFixed(4))

/** Lớp ngoài của ảnh có vùng chọn: phủ kín khung cha (cần position và kích thước) và làm container cho đơn vị cqw/cqh. */
export const FRAME_CONTAINER: CSSProperties = { position: 'absolute', inset: 0, overflow: 'hidden', containerType: 'size' }

/**
 * Vị trí và cỡ của ảnh (đúng tỉ lệ gốc) trong FRAME_CONTAINER để vùng `frame` hiện trọn và to nhất có thể.
 * Khung trên web đổi tỉ lệ theo màn hình nên phần dư lấy thêm từ ảnh quanh vùng chọn.
 * - Rộng ảnh = max(phủ kín khung, min(vùng vừa khít bề ngang, vùng vừa khít bề dọc)): vùng chọn không bị cắt,
 *   trừ khi vùng to hơn phần ảnh hiện được lúc phủ kín khung.
 * - Đưa tâm vùng về giữa khung, chặn ở mép ảnh để không lộ nền.
 * Tính hoàn toàn bằng CSS (cqw, cqh) nên đúng ở mọi cỡ màn hình, không cần JS.
 */
export const frameBoxStyle = (size: { width: number; height: number }, frame: ImageFrame): CSSProperties => {
  const aspect = size.width / size.height
  const w = `max(100cqw, 100cqh * ${num(aspect)}, min(100cqw * ${num(100 / frame.width)}, 100cqh * ${num((aspect * 100) / frame.height)}))`
  const h = `${w} / ${num(aspect)}`
  const cx = num((frame.x + frame.width / 2) / 100)
  const cy = num((frame.y + frame.height / 2) / 100)
  return {
    position: 'absolute',
    width: w,
    height: `calc(${h})`,
    left: `clamp(100cqw - ${w}, 50cqw - ${w} * ${cx}, 0px)`,
    top: `clamp(100cqh - ${h}, 50cqh - ${h} * ${cy}, 0px)`,
  }
}

/**
 * Nhân cỡ ảnh trong thuộc tính `sizes` theo mức phóng của vùng chọn, để trình duyệt tải ảnh đủ nét.
 * Chỉ nhân cỡ ở cuối mỗi mục, không đụng điều kiện như (min-width: 768px).
 */
export const scaleSizes = (sizes: string, frame: ImageFrame) => {
  const zoom = Math.min(4, Math.max(1, 100 / frame.width))
  return sizes
    .split(',')
    .map((part) => part.replace(/(\d+(?:\.\d+)?)(vw|px)\s*$/, (_, value: string, unit: string) => `${Math.round(Number(value) * zoom)}${unit}`))
    .join(',')
}
