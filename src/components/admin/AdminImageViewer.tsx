'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Image = { src: string; name: string }
type Viewing = { images: Image[]; index: number }

/** Cách lấy ảnh gốc: có sẵn đường dẫn, hoặc hỏi API theo id, hoặc theo tên tệp. */
type Ref =
  | { kind: 'direct'; src: string; name: string }
  | { kind: 'doc'; slug: string; id: string; name: string }
  | { kind: 'file'; slug: string; filename: string; name: string }

type Source = {
  /** Vùng bấm để mở ảnh (ảnh nhỏ, tên tệp). */
  hit: string
  /** Khối chứa đúng một ảnh. */
  card: string
  ref: (card: Element, api: string) => Ref | null
  /** Khối chứa nhiều ảnh cùng nhóm để xem tiếp bằng ‹ › (chỉ dùng cho nguồn có sẵn đường dẫn). */
  group?: string
}

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i

const text = (el: Element | null | undefined) => el?.textContent?.trim() ?? ''

/** Lấy slug collection từ đường dẫn ảnh dạng <api>/<slug>/file/<tên>. */
const slugFromSrc = (src: string | null | undefined, api: string): string | null => {
  if (!src) return null
  const path = new URL(src, window.location.href).pathname
  const m = path.match(new RegExp(`^${api}/([^/]+)/file/`))
  return m ? m[1] : null
}

const fileRef = (card: Element, api: string, filename: string): Ref | null => {
  const img = card.querySelector('img')
  if (img?.src?.startsWith('blob:')) return { kind: 'direct', src: img.src, name: filename }
  const slug = slugFromSrc(img?.getAttribute('src'), api)
  return slug && filename ? { kind: 'file', slug, filename, name: filename } : null
}

/**
 * Mọi chỗ trong trang quản trị có ảnh nhỏ kèm tên tệp. Thêm chỗ mới: thêm một mục vào đây.
 * Bám vào class của Payload; nâng cấp Payload mà đổi tên class thì chỗ đó quay về hành vi cũ (test e2e sẽ báo).
 */
const SOURCES: Source[] = [
  // Ô ảnh trong form (Bộ ảnh sản phẩm, ảnh danh mục, ảnh bìa, slider...): tên tệp là link tới tệp gốc
  {
    hit: '.upload-relationship-details__thumbnail, .upload-relationship-details__filename',
    card: '.upload-relationship-details',
    group: '.array-field',
    ref: (card) => {
      const link = card.querySelector<HTMLAnchorElement>('.upload-relationship-details__filename a')
      if (!link?.href) return null
      const meta = text(card.querySelector('.upload-relationship-details__meta'))
      if (!/image\//i.test(meta) && !IMAGE_EXT.test(link.pathname)) return null
      return { kind: 'direct', src: link.href, name: text(link) }
    },
  },
  // Trang so sánh phiên bản: chỉ có id và collection
  {
    hit: '.upload-diff__thumbnail, .upload-diff__info',
    card: '.upload-diff',
    ref: (card) => {
      const id = card.getAttribute('data-id')
      const slug = card.getAttribute('data-relation-to')
      return id && slug && !slug.includes(',') ? { kind: 'doc', slug, id, name: text(card.querySelector('.upload-diff__info')) } : null
    },
  },
  // Cột tệp trong danh sách (Ảnh và tệp): chỉ bấm ảnh, bấm tên vẫn mở trang sửa
  {
    hit: '.file__thumbnail',
    card: '.file',
    ref: (card, api) => fileRef(card, api, text(card.querySelector('.file__filename'))),
  },
  // Trang sửa một ảnh: khung chi tiết tệp, tên tệp là link tới tệp gốc
  {
    hit: '.file-details__thumbnail, .file-meta__url a',
    card: '.file-details',
    ref: (card) => {
      const link = card.querySelector<HTMLAnchorElement>('.file-meta__url a')
      if (!link?.href) return null
      const meta = text(card.querySelector('.file-meta__size-type'))
      if (!/image\//i.test(meta) && !IMAGE_EXT.test(link.pathname)) return null
      return { kind: 'direct', src: link.href, name: text(link) }
    },
  },
  // Ô tệp có kéo thả (nhiều tệp)
  {
    hit: '.file-details-draggable__thumbnail, .file-details-draggable__main-detail',
    card: '.file-details-draggable',
    ref: (card, api) => fileRef(card, api, text(card.querySelector('.file-details-draggable__main-detail'))),
  },
  // Ảnh chèn trong nội dung bài viết (trình soạn thảo): bấm ảnh; bấm tên vẫn mở hộp sửa của Payload
  {
    hit: '.lexical-upload__media',
    card: '.lexical-upload__contents',
    ref: (card, api) => fileRef(card, api, card.getAttribute('data-filename') || ''),
  },
]

/** Không mở trình xem ở hộp "Chọn từ thư viện" (bấm là để chọn ảnh) và màn hình tải nhiều tệp. */
const EXCLUDED = '.list-drawer, [class*="bulk-upload"]'

const resolve = async (ref: Ref, api: string): Promise<Image | null> => {
  if (ref.kind === 'direct') return { src: ref.src, name: ref.name }
  const url =
    ref.kind === 'doc'
      ? `${api}/${ref.slug}/${encodeURIComponent(ref.id)}?depth=0`
      : `${api}/${ref.slug}?where[filename][equals]=${encodeURIComponent(ref.filename)}&limit=1&depth=0`
  const res = await fetch(url, { credentials: 'include' }).catch(() => null)
  if (!res?.ok) return null
  const body = await res.json()
  const doc = ref.kind === 'doc' ? body : body?.docs?.[0]
  if (!doc?.url) return null
  if (!String(doc.mimeType || '').startsWith('image/')) {
    // Không phải ảnh (PDF, bản vẽ): mở tệp ở tab mới như link bình thường
    window.open(doc.url, '_blank', 'noopener')
    return null
  }
  return { src: doc.url, name: doc.filename || ref.name }
}

/**
 * Bọc toàn trang quản trị (admin.components.providers): bấm ảnh nhỏ (hoặc tên tệp, ở những chỗ tên không phải link mở trang sửa)
 * ở mọi chỗ có ảnh nhỏ kèm tên tệp thì mở ảnh gốc phóng to toàn màn hình. Ảnh nằm trong mảng (như "Bộ ảnh" sản phẩm)
 * thì chuyển được giữa các ảnh của mảng đó. Giữ Ctrl/Cmd khi bấm để vẫn dùng hành vi cũ.
 * Ô tự làm (ví dụ tệp bản vẽ trong yêu cầu báo giá, cột Ảnh của danh sách) gắn data-image-viewer="<url>" để dùng chung.
 */
export const AdminImageViewer = ({ children }: { children: React.ReactNode }) => {
  const [viewing, setViewing] = useState<Viewing | null>(null)
  const { config } = useConfig()
  const api = config.routes.api

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (!target?.closest || target.closest(EXCLUDED)) return

      const custom = target.closest('[data-image-viewer]')
      if (custom) {
        const src = custom.getAttribute('data-image-viewer')
        if (!src) return
        e.preventDefault()
        e.stopPropagation()
        setViewing({ images: [{ src, name: custom.getAttribute('data-image-name') || '' }], index: 0 })
        return
      }

      for (const source of SOURCES) {
        if (!target.closest(source.hit)) continue
        const card = target.closest(source.card)
        if (!card) return
        // Nút nằm trong khối ảnh (sửa, xóa, đổi ảnh...) giữ nguyên chức năng.
        // Nút bọc bên ngoài khối thì không tính: Payload bọc ô liên kết của danh sách trong <button>.
        const button = target.closest('button')
        if (button && card.contains(button)) return
        const ref = source.ref(card, api)
        if (!ref) return
        e.preventDefault()
        e.stopPropagation()

        if (ref.kind === 'direct' && source.group) {
          // Gom các ảnh cùng nhóm để xem tiếp; không nằm trong nhóm thì chỉ một ảnh
          const scope = card.closest(source.group)
          const cards = scope ? Array.from(scope.querySelectorAll(source.card)) : [card]
          const images: Image[] = []
          let index = 0
          for (const c of cards) {
            const r = source.ref(c, api)
            if (r?.kind !== 'direct') continue
            if (c === card) index = images.length
            images.push({ src: r.src, name: r.name })
          }
          setViewing({ images: images.length ? images : [{ src: ref.src, name: ref.name }], index })
        } else {
          void resolve(ref, api).then((img) => img && setViewing({ images: [img], index: 0 }))
        }
        return
      }
    }
    // Pha capture: chặn trước khi link mở tab mới, Link điều hướng hay React xử lý
    document.addEventListener('click', onClick, true)
    // Đánh dấu đã sẵn sàng: bấm trước lúc này (trang chưa hydrate xong) thì link vẫn chạy như cũ. Test e2e chờ dấu này.
    document.documentElement.setAttribute('data-image-viewer-ready', 'true')
    return () => {
      document.removeEventListener('click', onClick, true)
      document.documentElement.removeAttribute('data-image-viewer-ready')
    }
  }, [api])

  return (
    <>
      {children}
      {viewing && <Viewer viewing={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}

const Viewer = ({ viewing, onClose }: { viewing: Viewing; onClose: () => void }) => {
  const { images } = viewing
  const [index, setIndex] = useState(viewing.index)
  const count = images.length
  const closeRef = useRef<HTMLButtonElement>(null)
  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count])
  const current = images[index]!

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowLeft' && count > 1) go(-1)
      else if (e.key === 'ArrowRight' && count > 1) go(1)
    }
    // Capture để Esc không đóng luôn hộp thoại Payload phía sau (nếu có)
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [count, go, onClose])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [])

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return createPortal(
    <div className="img-viewer" role="dialog" aria-modal="true" aria-label={`Xem ảnh: ${current.name}`} onClick={onClose}>
      <div className="img-viewer__bar">
        <span className="img-viewer__count">{count > 1 ? `${index + 1} / ${count}` : ''}</span>
        <button ref={closeRef} type="button" className="img-viewer__close" onClick={onClose}>
          ✕ Đóng
        </button>
      </div>
      <div className="img-viewer__stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={current.src} src={current.src} alt={current.name} className="img-viewer__img" onClick={stop} />
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Ảnh trước"
            className="img-viewer__nav img-viewer__nav--prev"
            onClick={(e) => {
              stop(e)
              go(-1)
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            className="img-viewer__nav img-viewer__nav--next"
            onClick={(e) => {
              stop(e)
              go(1)
            }}
          >
            ›
          </button>
        </>
      )}
      <div className="img-viewer__name">
        {current.name}
        <a href={current.src} target="_blank" rel="noopener" onClick={stop} className="img-viewer__open">
          Mở tệp gốc ↗
        </a>
      </div>
    </div>,
    document.body,
  )
}

export default AdminImageViewer
