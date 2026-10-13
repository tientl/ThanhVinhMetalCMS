'use client'

import { toast } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

// Chỉ import kiểu từ liveEvents (file đó dùng node:events, không đưa vào bundle trình duyệt)
import type { LiveCounts } from '@/lib/liveEvents'
import { QUOTE_STATUSES } from '@/lib/quoteStatus'

const POLL_MS = 60_000
const ENDPOINT = '/api/live-counts'

type Metric = keyof LiveCounts

/*
 * Một kết nối dùng chung cho mọi nơi hiển thị (huy hiệu menu, ô thống kê, danh sách).
 * Chính: SSE (/api/live-counts?stream=1) đẩy số ngay khi có thay đổi.
 * Dự phòng: thăm dò mỗi 60 giây và khi quay lại tab, phòng khi SSE rớt.
 */
let current: LiveCounts | null = null
let timer: ReturnType<typeof setInterval> | null = null
let source: EventSource | null = null
const listeners = new Set<(c: LiveCounts) => void>()

/** Thông báo khi số tăng so với lần trước. */
const TOASTS: Array<{ metric: Metric; text: (n: number) => string }> = [
  { metric: 'newQuotes', text: (n) => (n === 1 ? 'Có 1 yêu cầu báo giá mới' : `Có ${n} yêu cầu báo giá mới`) },
  { metric: 'subscribers', text: (n) => (n === 1 ? 'Có 1 đăng ký bản tin mới' : `Có ${n} đăng ký bản tin mới`) },
]

const KEYS: Metric[] = [...QUOTE_STATUSES.map((s) => s.metric), 'subscribers', 'subscribersToday']

const isCounts = (v: unknown): v is LiveCounts =>
  !!v && typeof v === 'object' && KEYS.every((k) => typeof (v as Record<string, unknown>)[k] === 'number')

const apply = (next: LiveCounts) => {
  const prev = current
  current = next
  if (prev) {
    for (const t of TOASTS) {
      const added = next[t.metric] - prev[t.metric]
      if (added > 0) toast.info(t.text(added))
    }
  }
  listeners.forEach((fn) => fn(next))
}

const fetchCounts = async () => {
  try {
    const res = await fetch(ENDPOINT, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) return
    const data: unknown = await res.json()
    if (isCounts(data)) apply(data)
  } catch {
    /* mất mạng tạm thời, lần sau thử lại */
  }
}

const connect = () => {
  if (source || typeof EventSource === 'undefined') return
  source = new EventSource(`${ENDPOINT}?stream=1`)
  source.onmessage = (e) => {
    try {
      const data: unknown = JSON.parse(e.data)
      if (isCounts(data)) apply(data)
    } catch {
      /* bỏ qua gói lỗi */
    }
  }
  // Rớt kết nối thì EventSource tự nối lại; thăm dò dự phòng vẫn chạy
}

const subscribe = (fn: (c: LiveCounts) => void, initial: LiveCounts) => {
  if (current === null) current = initial
  listeners.add(fn)
  if (!timer) {
    connect()
    timer = setInterval(fetchCounts, POLL_MS)
    window.addEventListener('focus', fetchCounts)
  }
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
      window.removeEventListener('focus', fetchCounts)
      source?.close()
      source = null
    }
  }
}

/** Số liệu realtime cho trang quản trị, tự cập nhật không cần tải lại trang. */
export const useLiveCounts = (initial: LiveCounts) => {
  const [counts, setCounts] = useState(current ?? initial)
  // Chỉ lấy số ban đầu của lần gắn đầu tiên: initial là object mới mỗi lần server render lại,
  // đưa vào deps sẽ làm mọi nơi hủy đăng ký cùng lúc và SSE bị đóng rồi mở lại.
  const first = useRef(initial)
  useEffect(() => subscribe(setCounts, first.current), [])
  return counts
}

const NOTES: Partial<Record<Metric, (n: number) => string>> = {
  newQuotes: (n) => (n > 0 ? `Hôm nay có ${n} yêu cầu báo giá mới cần xử lý.` : 'Không có yêu cầu báo giá mới.'),
  callbackQuotes: (n) => (n > 0 ? `${n} cần liên hệ lại` : ''),
  subscribersToday: (n) => (n > 0 ? `+${n} hôm nay` : ''),
}

/** Huy hiệu trên menu: chú thích khi rê chuột và kiểu màu. "Mới" giữ nền cam đặc như trước. */
const BADGES: Partial<Record<Metric, { title: string; className?: string }>> = {
  newQuotes: { title: 'Yêu cầu báo giá đang ở trạng thái Mới' },
  callbackQuotes: { title: 'Yêu cầu báo giá cần liên hệ lại', className: 'nav-badge--callback' },
  subscribersToday: { title: 'Đăng ký bản tin mới trong hôm nay', className: 'nav-badge--soft' },
}

type Props = { initial: LiveCounts; metric: Metric; variant: 'badge' | 'value' | 'note' }

/** Một con số realtime: huy hiệu trên menu, số trong ô thống kê, hoặc câu ghi chú. */
export const LiveCount = ({ initial, metric, variant }: Props) => {
  const n = useLiveCounts(initial)[metric]
  if (variant === 'badge') {
    if (n <= 0) return null
    const badge = BADGES[metric]
    return (
      <span className={['nav-badge', badge?.className].filter(Boolean).join(' ')} title={badge?.title}>
        {n}
      </span>
    )
  }
  if (variant === 'note') return <>{NOTES[metric]?.(n) ?? ''}</>
  return <>{n}</>
}

/** Danh sách nào tự làm mới khi số nào đổi. */
const LIST_REFRESH: Array<{ metric: Metric; path: string }> = [
  // Đổi trạng thái nào (kể cả do nhân viên khác) cũng làm mới danh sách yêu cầu báo giá
  ...QUOTE_STATUSES.map((s) => ({ metric: s.metric, path: '/admin/collections/quote-requests' })),
  { metric: 'subscribers', path: '/admin/collections/subscribers' },
]

/** Đang mở danh sách Yêu cầu báo giá hoặc Đăng ký bản tin thì làm mới danh sách khi có thay đổi. Gắn một lần ở menu. */
export const LiveListRefresh = ({ initial }: { initial: LiveCounts }) => {
  const counts = useLiveCounts(initial)
  const pathname = usePathname()
  const router = useRouter()
  const seen = useRef(counts)

  useEffect(() => {
    const prev = seen.current
    seen.current = counts
    if (LIST_REFRESH.some((r) => pathname === r.path && counts[r.metric] !== prev[r.metric])) router.refresh()
  }, [counts, pathname, router])

  return null
}
