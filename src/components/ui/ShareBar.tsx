'use client'

import React, { useState, useSyncExternalStore } from 'react'

type Props = { url: string; title: string }

/** Nút chia sẻ trang: Facebook, chia sẻ qua ứng dụng (Zalo, Messenger… trên điện thoại), sao chép link. */
export const ShareBar = ({ url, title }: Props) => {
  // Web Share API chỉ biết được ở trình duyệt; server coi như không có để HTML khớp lúc hydrate
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === 'function',
    () => false,
  )
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Sao chép đường dẫn:', url)
    }
  }

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const btn = 'inline-flex h-9 items-center gap-1.5 border border-line-2 px-3 text-[13px] font-medium no-underline hover:border-accent'

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Chia sẻ">
      <span className="text-[13px] text-muted-2">Chia sẻ:</span>
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener"
        className={btn}
        onClick={(e) => {
          // Mở cửa sổ nhỏ như các báo, không rời trang; trình duyệt chặn popup thì rơi về tab mới
          const w = window.open(fbUrl, 'fb-share', 'width=640,height=560,noopener')
          if (w) e.preventDefault()
        }}
      >
        Facebook
      </a>
      {canShare && (
        <button type="button" className={btn} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          Zalo, Messenger…
        </button>
      )}
      <button type="button" className={btn} onClick={copy}>
        {copied ? 'Đã sao chép' : 'Sao chép link'}
      </button>
    </div>
  )
}
