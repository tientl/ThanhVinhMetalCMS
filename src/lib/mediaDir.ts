import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Thư mục lưu ảnh tải lên, dùng chung cho collection Media và công cụ cắt ảnh. Không phụ thuộc thư mục chạy lệnh. */
export const MEDIA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/media')
