'use client'

import { useConfig, useListQuery } from '@payloadcms/ui'
import React from 'react'

import type { LiveCounts } from '@/lib/liveEvents'
import { QUOTE_STATUSES, type QuoteStatus } from '@/lib/quoteStatus'

import { useLiveCounts } from './LiveCount'

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const ICONS: Record<QuoteStatus, React.ReactNode> = {
  // Hộp thư có chấm: yêu cầu mới đến
  new: (
    <svg {...ICON_PROPS}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />
    </svg>
  ),
  // Điện thoại có mũi tên quay lại: cần gọi lại
  callback: (
    <svg {...ICON_PROPS}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
      <path d="M15 2h6v6" />
      <path d="m21 2-6 6" />
    </svg>
  ),
  // Khung chat: đã trao đổi
  contacted: (
    <svg {...ICON_PROPS}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  ),
  // Dấu tích trong vòng tròn: xong
  done: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  ),
}

/** Tìm điều kiện status = ... trong bộ lọc của Payload (có thể lồng trong or/and khi lọc bằng nút "Bộ lọc"). */
const statusInWhere = (where: unknown): string | null => {
  if (!where || typeof where !== 'object') return null
  const w = where as Record<string, unknown>
  const status = w.status as { equals?: unknown } | undefined
  if (status && typeof status.equals === 'string') return status.equals
  for (const key of ['and', 'or']) {
    const list = w[key]
    if (Array.isArray(list)) {
      for (const item of list) {
        const found = statusInWhere(item)
        if (found) return found
      }
    }
  }
  return null
}

/**
 * 4 ô tổng theo trạng thái. Bấm một ô để lọc danh sách theo trạng thái đó, bấm lại ô đang chọn để bỏ lọc.
 * Đổi bộ lọc qua useListQuery của Payload (không chỉ đổi URL): bộ quản lý danh sách giữ bộ lọc trong bộ nhớ,
 * chỉ đổi URL thì nó áp lại bộ lọc cũ. Href vẫn là URL có lọc để bấm chuột giữa mở tab mới được.
 * Số tự cập nhật qua kênh realtime dùng chung với huy hiệu menu.
 */
export const QuoteStatusCardsClient = ({ initial }: { initial: LiveCounts }) => {
  const counts = useLiveCounts(initial)
  const { config } = useConfig()
  const { query, handleWhereChange } = useListQuery()
  const base = `${config.routes.admin}/collections/quote-requests`
  const active = statusInWhere(query?.where)

  return (
    <nav className="qs-cards" aria-label="Lọc yêu cầu báo giá theo trạng thái">
      {QUOTE_STATUSES.map((s) => {
        const isActive = active === s.value
        return (
          <a
            key={s.value}
            href={isActive ? base : `${base}?where[status][equals]=${s.value}`}
            className={`qs-card qs--${s.value}${isActive ? ' qs-card--active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
            title={isActive ? 'Bấm lần nữa để bỏ lọc' : `Chỉ xem yêu cầu "${s.label}"`}
            onClick={(e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
              e.preventDefault()
              void handleWhereChange?.(isActive ? (undefined as never) : { status: { equals: s.value } })
            }}
          >
            <span className="qs-card__head">
              <span className="qs-card__label">{s.label}</span>
              <span className="qs-card__icon">{ICONS[s.value]}</span>
            </span>
            <span className="qs-card__value">
              {counts[s.metric]} <small>yêu cầu</small>
            </span>
            <span className="qs-card__hint">{s.hint}</span>
          </a>
        )
      })}
    </nav>
  )
}
