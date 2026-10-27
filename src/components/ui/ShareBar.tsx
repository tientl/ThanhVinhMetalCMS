'use client'

import React, { useSyncExternalStore } from 'react'

import { IconFacebook, IconShare } from '@/components/ui/Icons'

type Props = { url: string; title: string }

/** Nút chia sẻ trang dạng icon: Facebook, chia sẻ qua ứng dụng (Zalo, Messenger… trên điện thoại). */
export const ShareBar = ({ url, title }: Props) => {
  // Web Share API chỉ biết được ở trình duyệt; server coi như không có để HTML khớp lúc hydrate
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === 'function',
    () => false,
  )

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  // Nút chỉ có icon: aria-label cho trình đọc màn hình, title để rê chuột thấy chữ
  const btn = 'inline-flex h-9 w-9 items-center justify-center rounded-btn border border-line-2 text-ink no-underline hover:border-accent hover:text-accent-text'

  return (
    <div role="group" className="flex flex-wrap items-center gap-2" aria-label="Chia sẻ">
      <span className="text-[13px] text-muted-2">Chia sẻ:</span>
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener"
        className={btn}
        aria-label="Chia sẻ lên Facebook"
        title="Chia sẻ lên Facebook"
        onClick={(e) => {
          // Mở cửa sổ nhỏ như các báo, không rời trang; trình duyệt chặn popup thì rơi về tab mới.
          // Không truyền 'noopener' vào window.open: có nó thì hàm luôn trả null, link mở thêm một tab nữa.
          // Cắt opener bằng tay để trang Facebook không với ngược lại được trang này.
          const w = window.open(fbUrl, 'fb-share', 'width=640,height=560')
          if (w) {
            w.opener = null
            e.preventDefault()
          }
        }}
      >
        <IconFacebook />
      </a>
      {canShare && (
        <button
          type="button"
          className={btn}
          aria-label="Chia sẻ qua ứng dụng khác (Zalo, Messenger…)"
          title="Chia sẻ qua Zalo, Messenger…"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
        >
          <IconShare />
        </button>
      )}
    </div>
  )
}
