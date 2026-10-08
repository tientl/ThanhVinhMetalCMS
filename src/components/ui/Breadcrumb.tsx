import Link from 'next/link'
import React from 'react'

export type Crumb = { label: string; href?: string }

export const Breadcrumb = ({ items }: { items: Crumb[] }) => (
  <nav aria-label="Vị trí trang" className="text-[12px] font-medium uppercase text-muted-2" style={{ letterSpacing: 1.6 }}>
    <ol className="flex flex-wrap items-center gap-2">
      <li>
        <Link href="/" className="no-underline hover:text-accent-text">
          Trang chủ
        </Link>
      </li>
      {items.map((c, i) => (
        <li key={i} className="flex items-center gap-2">
          <span aria-hidden="true" className="text-line-2">
            /
          </span>
          {c.href ? (
            <Link href={c.href} className="no-underline hover:text-accent-text">
              {c.label}
            </Link>
          ) : (
            <span className="text-ink" aria-current="page">
              {c.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
)
