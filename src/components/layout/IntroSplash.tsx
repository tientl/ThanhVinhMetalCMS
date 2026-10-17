'use client'

import React, { useEffect, useRef, useState } from 'react'

const SHOW_MS = 1500 // thời gian logo hiện (tính từ lúc hiệu ứng bắt đầu) trước khi màn tan
const FADE_MS = 600 // thời gian tan
const LOGO_WAIT_MS = 1500 // chờ logo tải tối đa chừng này rồi vẫn bắt đầu

/**
 * Màn chào khi vào trang chủ: nền tối, logo hiện dần kèm vạch màu chủ đạo, rồi tan ra để lộ trang.
 * Hiện mỗi lần mở trang chủ (kể cả quay về từ trang khác). Hiệu ứng và đồng hồ chỉ bắt đầu khi logo
 * đã tải xong, nên tải lại trang cũng mượt như điều hướng. Tắt khi người dùng bật "giảm chuyển động".
 */
export const IntroSplash = ({ logo, brand }: { logo: string; brand: string }) => {
  const [phase, setPhase] = useState<'wait' | 'show' | 'hide' | 'gone'>('wait')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      // CSS đã ẩn sẵn, chỉ gỡ khỏi DOM ở nhịp sau
      const t = setTimeout(() => setPhase('gone'), 0)
      return () => clearTimeout(t)
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    let started = false
    const start = () => {
      if (started) return
      started = true
      timers.push(setTimeout(() => setPhase('show'), 0))
      timers.push(setTimeout(() => setPhase('hide'), SHOW_MS))
      timers.push(setTimeout(() => setPhase('gone'), SHOW_MS + FADE_MS))
    }
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) start()
    else {
      img?.addEventListener('load', start, { once: true })
      img?.addEventListener('error', start, { once: true })
      timers.push(setTimeout(start, LOGO_WAIT_MS))
    }
    return () => {
      timers.forEach(clearTimeout)
      img?.removeEventListener('load', start)
      img?.removeEventListener('error', start)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      className={`intro-splash ${phase === 'wait' ? 'intro-splash--wait' : ''} ${phase === 'hide' ? 'intro-splash--hide' : ''}`}
      aria-hidden="true"
    >
      <div className="intro-splash__logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={logo} alt="" decoding="sync" fetchPriority="high" />
      </div>
      <span className="intro-splash__line" />
      <span className="intro-splash__brand">{brand}</span>
    </div>
  )
}
