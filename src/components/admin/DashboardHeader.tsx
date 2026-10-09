import type { ServerProps } from 'payload'

import Link from 'next/link'
import React from 'react'

import { getServerSideURL } from '@/utilities/getURL'

import { LiveQuoteCount } from './LiveQuoteCount'

/** Đầu bảng điều khiển: lời chào, 4 ô thống kê, nút thao tác nhanh. */
export const DashboardHeader = async ({ payload, user }: ServerProps) => {
  const [newQuotes, products, posts, subscribers] = await Promise.all([
    payload.count({ collection: 'quote-requests', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'products', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'subscribers' }),
  ])

  const name = user && 'name' in user && user.name ? String(user.name) : 'bạn'
  const n = newQuotes.totalDocs

  const stats = [
    { value: <LiveQuoteCount initial={n} variant="value" />, label: 'Yêu cầu báo giá mới', href: '/admin/collections/quote-requests?where[status][equals]=new', highlight: n > 0 },
    { value: products.totalDocs, label: 'Sản phẩm đang hiển thị', href: '/admin/collections/products' },
    { value: posts.totalDocs, label: 'Bài viết đã đăng', href: '/admin/collections/posts' },
    { value: subscribers.totalDocs, label: 'Đăng ký bản tin', href: '/admin/collections/subscribers' },
  ]

  return (
    <div className="dash-head">
      <h1 className="dash-head__title">Xin chào, {name}</h1>
      <p className="dash-head__sub">
        Thành Vinh Metal, trang quản trị website. <LiveQuoteCount initial={n} variant="note" />
      </p>

      <div className="dash-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`dash-stat${s.highlight ? ' dash-stat--highlight' : ''}`}>
            <span className="dash-stat__value">{s.value}</span>
            <span className="dash-stat__label">{s.label}</span>
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
