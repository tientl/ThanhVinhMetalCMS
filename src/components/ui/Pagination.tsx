import Link from 'next/link'
import React from 'react'

type Props = { page: number; totalPages: number; basePath: string }

const pageHref = (basePath: string, page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`)

export const Pagination = ({ page, totalPages, basePath }: Props) => {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )
  const items: Array<number | '…'> = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push('…')
    items.push(p)
  })

  const cls = 'inline-flex h-11 min-w-11 items-center justify-center rounded-btn border px-3 text-[12.5px] font-medium no-underline transition-colors'

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-center gap-2" style={{ letterSpacing: 1.5 }}>
      {page > 1 && (
        <Link href={pageHref(basePath, page - 1)} className={`${cls} border-line-2 text-ink hover:border-accent`} rel="prev">
          Trước
        </Link>
      )}
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} className="px-2 text-muted-3">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={pageHref(basePath, it)}
            aria-current={it === page ? 'page' : undefined}
            className={`${cls} ${it === page ? 'border-accent bg-accent text-bg' : 'border-line-2 text-ink hover:border-accent'}`}
          >
            {it}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={pageHref(basePath, page + 1)} className={`${cls} border-line-2 text-ink hover:border-accent`} rel="next">
          Sau
        </Link>
      )}
    </nav>
  )
}
