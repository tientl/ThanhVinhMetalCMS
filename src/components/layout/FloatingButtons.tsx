'use client'

import React, { useEffect, useState } from 'react'

import { IconChat, IconPhone, IconUp } from '@/components/ui/Icons'
import { telHref, zaloHref } from '@/lib/format'

export const FloatingButtons = ({ hotline, zalo }: { hotline?: string | null; zalo?: string | null }) => {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const round = 'flex h-[54px] w-[54px] items-center justify-center rounded-full no-underline shadow-[0_6px_16px_rgba(0,0,0,0.25)]'

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-3 md:bottom-6 md:right-6">
      <a
        href="#top"
        aria-label="Về đầu trang"
        className={`${round} border border-line-2 bg-surface-2/90 text-ink transition-opacity duration-300`}
        style={{ opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'auto' : 'none' }}
        onClick={(e) => {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <IconUp />
      </a>
      {zalo && (
        <a href={zaloHref(zalo)} target="_blank" rel="noopener" aria-label="Chat Zalo" className={`${round} hidden border border-accent/60 bg-bg/85 text-accent md:flex`}>
          <IconChat />
        </a>
      )}
      {hotline && (
        <a href={telHref(hotline)} aria-label={`Gọi ${hotline}`} className={`${round} hidden bg-accent text-bg md:flex`}>
          <IconPhone size={24} />
        </a>
      )}
    </div>
  )
}
