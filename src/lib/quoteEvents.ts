import { EventEmitter } from 'node:events'

/**
 * Kênh báo thay đổi của yêu cầu báo giá trong cùng tiến trình Node.
 * Hook của collection phát, route SSE lắng nghe và đẩy xuống các tab admin.
 * Gắn lên globalThis để dev hot reload không tạo nhiều bản.
 */
const g = globalThis as unknown as { __quoteEvents?: EventEmitter }
export const quoteEvents = g.__quoteEvents ?? (g.__quoteEvents = new EventEmitter())
quoteEvents.setMaxListeners(100)

export const notifyQuoteChange = () => quoteEvents.emit('change')
