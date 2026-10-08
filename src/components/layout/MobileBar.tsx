import Link from 'next/link'
import React from 'react'

import { IconChat, IconFile, IconPhone } from '@/components/ui/Icons'
import { telHref, zaloHref } from '@/lib/format'

/** Thanh cố định đáy màn hình điện thoại: Gọi, Zalo, Báo giá. */
export const MobileBar = ({ hotline, zalo }: { hotline?: string | null; zalo?: string | null }) => {
  const item = 'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold uppercase no-underline'
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-bg/95 backdrop-blur md:hidden" style={{ letterSpacing: 1 }}>
      <a href={telHref(hotline)} className={`${item} text-ink`}>
        <IconPhone />
        Gọi
      </a>
      <a href={zaloHref(zalo)} target="_blank" rel="noopener" className={`${item} text-accent-text`}>
        <IconChat size={20} />
        Zalo
      </a>
      <Link href="/lien-he#bao-gia" className={`${item} bg-accent text-bg`}>
        <IconFile />
        Báo giá
      </Link>
    </div>
  )
}
