'use client'

import { toast, useConfig } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const POLL_MS = 60_000

/*
 * Một kết nối dùng chung cho mọi nơi hiển thị.
 * Chính: SSE (/api/quote-events) đẩy số ngay khi có thay đổi.
 * Dự phòng: thăm dò mỗi 60 giây và khi quay lại tab, phòng khi SSE rớt.
 */
let current: number | null = null
let timer: ReturnType<typeof setInterval> | null = null
let source: EventSource | null = null
let apiRoute = '/api'
const listeners = new Set<(n: number) => void>()

const apply = (n: number) => {
  const prev = current
  current = n
  if (prev !== null && n > prev) {
    toast.info(n - prev === 1 ? 'Có 1 yêu cầu báo giá mới' : `Có ${n - prev} yêu cầu báo giá mới`)
  }
  listeners.forEach((fn) => fn(n))
}

const fetchCount = async () => {
  try {
    const res = await fetch(`${apiRoute}/quote-requests/count?where[status][equals]=new`, { credentials: 'include' })
    if (!res.ok) return
    const data = (await res.json()) as { totalDocs?: number }
    if (typeof data.totalDocs === 'number') apply(data.totalDocs)
  } catch {
    /* mất mạng tạm thời, lần sau thử lại */
  }
}

const connect = () => {
  if (source || typeof EventSource === 'undefined') return
  source = new EventSource('/api/quote-events')
  source.onmessage = (e) => {
    try {
      const { count } = JSON.parse(e.data) as { count?: number }
      if (typeof count === 'number') apply(count)
    } catch {
      /* bỏ qua gói lỗi */
    }
  }
  // Rớt kết nối thì EventSource tự nối lại; thăm dò dự phòng vẫn chạy
}

const subscribe = (fn: (n: number) => void, initial: number) => {
  if (current === null) current = initial
  listeners.add(fn)
  if (!timer) {
    connect()
    timer = setInterval(fetchCount, POLL_MS)
    window.addEventListener('focus', fetchCount)
  }
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
      window.removeEventListener('focus', fetchCount)
      source?.close()
      source = null
    }
  }
}

/** Số yêu cầu báo giá ở trạng thái "Mới", tự cập nhật không cần tải lại trang. */
export const useNewQuoteCount = (initial: number) => {
  const { config } = useConfig()
  const [count, setCount] = useState(current ?? initial)
  useEffect(() => {
    apiRoute = config.routes.api
    return subscribe(setCount, initial)
  }, [config.routes.api, initial])
  return count
}

type Props = { initial: number; variant: 'badge' | 'value' | 'note' }

export const LiveQuoteCount = ({ initial, variant }: Props) => {
  const count = useNewQuoteCount(initial)
  const pathname = usePathname()
  const router = useRouter()

  // Đang mở danh sách Yêu cầu báo giá thì làm mới danh sách khi số thay đổi
  const onList = pathname === '/admin/collections/quote-requests'
  useEffect(() => {
    if (onList && count !== initial) router.refresh()
  }, [count, initial, onList, router])

  if (variant === 'badge') return count > 0 ? <span className="nav-badge">{count}</span> : null
  if (variant === 'note') return <>{count > 0 ? `Hôm nay có ${count} yêu cầu báo giá mới cần xử lý.` : 'Không có yêu cầu báo giá mới.'}</>
  return <>{count}</>
}

export default LiveQuoteCount
