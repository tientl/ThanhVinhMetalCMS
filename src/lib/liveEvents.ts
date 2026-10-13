import { EventEmitter } from 'node:events'

import type { Payload } from 'payload'

import { startOfDayVN } from './format'
import { QUOTE_STATUSES, type QuoteStatusMetric } from './quoteStatus'

/**
 * Kênh báo thay đổi cho trang quản trị trong cùng tiến trình Node: yêu cầu báo giá và đăng ký bản tin.
 * Hook của collection phát, route SSE /api/live-counts lắng nghe rồi đẩy số mới xuống các tab admin.
 * Gắn lên globalThis để dev hot reload không tạo nhiều bản. Chỉ đúng khi chạy 1 tiến trình.
 */
const g = globalThis as unknown as { __liveEvents?: EventEmitter; __liveTimer?: ReturnType<typeof setTimeout> }
export const liveEvents = g.__liveEvents ?? (g.__liveEvents = new EventEmitter())
liveEvents.setMaxListeners(100)

/**
 * Chờ một nhịp mới phát. Hook afterChange/afterDelete chạy TRƯỚC khi Payload commit transaction,
 * phát ngay thì route SSE đếm lại vẫn ra số cũ và tab admin đứng số cho tới lần thăm dò sau (60 giây).
 * Nhiều thay đổi liền nhau (xóa hàng loạt) cũng gộp thành một lần đẩy.
 */
export const NOTIFY_DELAY_MS = 300

export const notifyLiveChange = () => {
  if (g.__liveTimer) clearTimeout(g.__liveTimer)
  g.__liveTimer = setTimeout(() => {
    g.__liveTimer = undefined
    liveEvents.emit('change')
  }, NOTIFY_DELAY_MS)
}

export type LiveCounts = {
  /** Yêu cầu báo giá theo trạng thái (src/lib/quoteStatus.ts). "Mới" là số hiện ở huy hiệu cam trên menu. */
  newQuotes: number
  callbackQuotes: number
  contactedQuotes: number
  doneQuotes: number
  /** Tổng số email đăng ký bản tin. */
  subscribers: number
  /** Email đăng ký bản tin từ 0 giờ hôm nay (giờ Việt Nam). */
  subscribersToday: number
}

export const LIVE_COUNT_KEYS: (keyof LiveCounts)[] = [
  ...QUOTE_STATUSES.map((s) => s.metric),
  'subscribers',
  'subscribersToday',
]

export const getLiveCounts = async (payload: Payload): Promise<LiveCounts> => {
  const [quotes, subscribers, subscribersToday] = await Promise.all([
    Promise.all(
      QUOTE_STATUSES.map(async (s) => {
        const { totalDocs } = await payload.count({ collection: 'quote-requests', where: { status: { equals: s.value } } })
        return [s.metric, totalDocs] as const
      }),
    ),
    payload.count({ collection: 'subscribers' }),
    payload.count({ collection: 'subscribers', where: { createdAt: { greater_than_equal: startOfDayVN().toISOString() } } }),
  ])
  return {
    ...(Object.fromEntries(quotes) as Record<QuoteStatusMetric, number>),
    subscribers: subscribers.totalDocs,
    subscribersToday: subscribersToday.totalDocs,
  }
}
