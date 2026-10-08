/** Giới hạn tệp bản vẽ khách gửi kèm yêu cầu báo giá. Dùng chung cho client và server. */
export const QUOTE_FILE_EXTENSIONS = ['dxf', 'dwg', 'pdf', 'jpg', 'jpeg', 'png', 'webp']
export const QUOTE_FILE_MAX_BYTES = 10 * 1024 * 1024
export const QUOTE_FILE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dxf',
  'image/vnd.dxf',
  'image/x-dxf',
  'application/acad',
  'application/x-acad',
  'application/x-dwg',
  'image/vnd.dwg',
  'image/x-dwg',
  'application/octet-stream',
  'text/plain',
]
