import type { ServerProps } from 'payload'

import Link from 'next/link'
import React from 'react'

import { getLiveCounts } from '@/lib/liveEvents'
import { getServerSideURL } from '@/utilities/getURL'

import { LiveCount } from './LiveCount'

/** Đầu bảng điều khiển: lời chào, 4 ô thống kê, nút thao tác nhanh. Số báo giá và bản tin cập nhật realtime. */
export const DashboardHeader = async ({ payload, user }: ServerProps) => {
  const [live, products, posts] = await Promise.all([
    getLiveCounts(payload),
    payload.count({ collection: 'products', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
  ])

  const name = user && 'name' in user && user.name ? String(user.name) : 'bạn'

  const stats: Array<{ value: React.ReactNode; label: string; href: string; highlight?: boolean; sub?: React.ReactNode }> = [
    {
      value: <LiveCount initial={live} metric="newQuotes" variant="value" />,
      label: 'Yêu cầu báo giá mới',
      href: '/admin/collections/quote-requests?where[status][equals]=new',
      highlight: live.newQuotes > 0,
      sub: (
        <span className="qs-text qs--callback">
          <LiveCount initial={live} metric="callbackQuotes" variant="note" />
        </span>
      ),
    },
    { value: products.totalDocs, label: 'Sản phẩm đang hiển thị', href: '/admin/collections/products' },
    { value: posts.totalDocs, label: 'Bài viết đã đăng', href: '/admin/collections/posts' },
    {
      value: <LiveCount initial={live} metric="subscribers" variant="value" />,
      label: 'Đăng ký bản tin',
      href: '/admin/collections/subscribers',
      sub: <LiveCount initial={live} metric="subscribersToday" variant="note" />,
    },
  ]

  return (
    <div className="dash-head">
      <h1 className="dash-head__title">Xin chào, {name}</h1>
      <p className="dash-head__sub">
        Thành Vinh Metal, trang quản trị website. <LiveCount initial={live} metric="newQuotes" variant="note" />
      </p>

      <div className="dash-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`dash-stat${s.highlight ? ' dash-stat--highlight' : ''}`}>
            <span className="dash-stat__value">{s.value}</span>
            <span className="dash-stat__label">{s.label}</span>
            {s.sub && <span className="dash-stat__sub">{s.sub}</span>}
          </Link>
        ))}
      </div>

      <div className="dash-actions">
        <Link href="/admin/collections/products/create" className="dash-btn dash-btn--primary">
          + Thêm sản phẩm
        </Link>
        <Link href="/admin/collections/posts/create" className="dash-btn">
          + Viết bài
        </Link>
        <Link href="/admin/globals/home" className="dash-btn">
          Thay ảnh slider
        </Link>
        <a href={getServerSideURL()} target="_blank" rel="noopener" className="dash-btn">
          Xem website ↗
        </a>
      </div>
    </div>
  )
}

export default DashboardHeader
