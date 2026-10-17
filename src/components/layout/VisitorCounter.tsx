'use client'

import React, { useEffect, useState } from 'react'

type Stats = { online: number; today: number; total: number }

const fmt = (n: number) => n.toLocaleString('vi-VN')

/** Bộ đếm ở footer: hiện số từ server, rồi ghi nhận lượt vào và cập nhật sau khi trang đã tải xong. */
export const VisitorCounter = ({ initial }: { initial: Stats }) => {
  const [stats, setStats] = useState<Stats>(initial)

  useEffect(() => {
    const run = () => {
      fetch('/api/visit', { method: 'POST', keepalive: true })
        .then((r) => (r.ok ? r.json() : null))
        .then((s: Stats | null) => s && setStats(s))
        .catch(() => {})
    }
    // Chờ trang tải xong để không tranh băng thông với ảnh
    if (document.readyState === 'complete') run()
    else window.addEventListener('load', run, { once: true })
    return () => window.removeEventListener('load', run)
  }, [])

  return (
    <span className="text-muted-3" aria-label="Thống kê truy cập">
      Đang online: <strong className="font-semibold text-muted">{fmt(stats.online)}</strong>
      <span className="mx-2">·</span>
      Hôm nay: <strong className="font-semibold text-muted">{fmt(stats.today)}</strong>
      <span className="mx-2">·</span>
      Tổng: <strong className="font-semibold text-muted">{fmt(stats.total)}</strong>
    </span>
  )
}
