'use client'

import Link from 'next/link'
import React, { useLayoutEffect, useRef, useState } from 'react'

import { FramedImage } from '@/components/ui/FramedImage'
import { Img } from '@/components/ui/Img'
import type { Home, Product } from '@/payload-types'

type App = NonNullable<Home['applications']>[number]

type Spot = { cx: number; cy: number; w: number; h: number; flip: boolean }
const DOT = 11 // bán kính chấm hotspot
const GAP = 6 // khoảng cách nhãn với chấm, khớp calc(100%+6px)

/**
 * Dưới sm khung ảnh hẹp, nhãn nằm trên hoặc dưới chấm. Thử mọi tổ hợp (mỗi tab chỉ vài chấm) và lấy tổ hợp
 * ít va chạm nhất: nhãn đè nhãn, nhãn che chấm khác, nhãn tràn khỏi khung; hoà điểm thì ưu tiên nhãn nằm dưới.
 * Trả về true = nhãn nằm trên chấm.
 */
const placeLabels = (spots: Spot[], fw: number, fh: number): boolean[] => {
  if (spots.length > 8) return spots.map((s) => s.cy > fh * 0.8)
  let best = 0
  let bestScore = Infinity
  for (let mask = 0; mask < 1 << spots.length; mask++) {
    const rects = spots.map((s, i) => {
      // dưới sm nhãn canh từ tâm chấm (right-1/2 / left-1/2)
      const l = s.flip ? s.cx - s.w : s.cx
      const t = (mask >> i) & 1 ? s.cy - DOT - GAP - s.h : s.cy + DOT + GAP
      return { l, t, r: l + s.w, b: t + s.h }
    })
    let score = 0
    rects.forEach((a, i) => {
      if (a.l < 0 || a.t < 0 || a.r > fw || a.b > fh) score += 100
      rects.forEach((b, j) => {
        if (j > i && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) score += 100
      })
      spots.forEach((s, k) => {
        if (k !== i && a.l < s.cx + DOT && s.cx - DOT < a.r && a.t < s.cy + DOT && s.cy - DOT < a.b) score += 50
      })
      if ((mask >> i) & 1) score += 1
    })
    if (score < bestScore) {
      bestScore = score
      best = mask
    }
  }
  return spots.map((_, i) => ((best >> i) & 1) === 1)
}

export const Applications = ({ heading, intro, items }: { heading?: string | null; intro?: string | null; items: App[] }) => {
  const [active, setActive] = useState(0)
  const frameRef = useRef<HTMLDivElement>(null)
  // null: chưa đo (render ở server, hoặc từ sm trở lên) thì dùng quy tắc CSS: chấm sát đáy nhãn nằm trên
  const [labelsUp, setLabelsUp] = useState<boolean[] | null>(null)
  const spots = items[Math.min(active, items.length - 1)]?.hotspots

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame || !spots?.length) return
    const sm = window.matchMedia('(min-width: 640px)')
    const place = () => {
      if (sm.matches) return setLabelsUp(null)
      // Toạ độ tính từ % và kích thước layout (offsetWidth), không từ getBoundingClientRect, để hiệu ứng tab-fade không làm lệch
      const fw = frame.clientWidth
      const fh = frame.clientHeight
      const labels = [...frame.querySelectorAll<HTMLElement>('[data-spot-label]')]
      setLabelsUp(placeLabels(spots.map((h, i) => ({ cx: (h.x / 100) * fw, cy: (h.y / 100) * fh, w: labels[i]?.offsetWidth ?? 0, h: labels[i]?.offsetHeight ?? 0, flip: h.x > 50 })), fw, fh))
    }
    place()
    document.fonts?.ready.then(place)
    const ro = new ResizeObserver(place)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [spots])

  if (!items.length) return null
  const tab = items[Math.min(active, items.length - 1)]
  const products = (tab.products ?? []).filter((p): p is Product => typeof p === 'object')

  return (
    <section id="ung-dung" className="dark-zone section flex flex-col gap-8 bg-deep text-white lg:gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12" data-reveal>
        <h2 className="h-display text-[30px] text-white md:text-[40px]">{heading || 'Khám phá ứng dụng cho công trình'}</h2>
        {intro && <p className="m-0 max-w-[440px] text-[17px] font-light leading-[1.75] text-muted">{intro}</p>}
      </div>

      <div role="tablist" aria-label="Loại công trình" className="flex gap-2 overflow-x-auto border-b border-line" data-reveal>
        {items.map((it, i) => (
          <button
            key={it.id ?? i}
            type="button"
            role="tab"
            id={`app-tab-${i}`}
            aria-selected={i === active}
            aria-controls="app-panel"
            onClick={() => setActive(i)}
            className="h-[52px] shrink-0 cursor-pointer border-0 border-b-[3px] bg-transparent px-4 text-[13px] font-medium text-white md:px-[22px]"
            style={{ borderBottomColor: i === active ? 'var(--color-accent)' : 'transparent', letterSpacing: 1.2 }}
          >
            {it.tabLabel}
          </button>
        ))}
      </div>

      <div id="app-panel" role="tabpanel" aria-labelledby={`app-tab-${active}`} className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14" data-reveal>
        <div key={`img-${active}`} ref={frameRef} className="relative h-[320px] overflow-hidden rounded-card bg-surface sm:h-[420px] lg:h-[540px]">
          <div className="tab-fade absolute inset-0">
            <FramedImage media={tab.image} frame={tab.imageFrame} sizes="(min-width: 1024px) 60vw, 100vw" />
          </div>
          {/* @container: max-width của nhãn tính theo cqw = bề ngang khung ảnh */}
          <div className="tab-fade absolute inset-0 @container">
            {/* Nhãn mở về phía giữa ảnh: chấm ở nửa phải thì nhãn nằm bên trái chấm. Nhãn dài xuống dòng trong phần còn lại
                của khung, không bị cắt. Tâm chấm (22px) luôn ở đúng (x, y).
                Từ sm nhãn nằm ngang cạnh chấm. Dưới sm khung hẹp: nhãn nằm dưới hoặc trên chấm, canh từ tâm chấm,
                placeLabels chọn trên/dưới để các nhãn không đè nhau. */}
            {(tab.hotspots ?? []).map((h, i) => {
              const flip = h.x > 50
              const up = labelsUp?.[i] ?? h.y > 80
              // Chỗ còn lại theo hướng nhãn, chừa 8px tới mép khung: dưới sm tính từ tâm chấm, từ sm tính từ mép chấm + 10px
              const room = flip ? h.x : 100 - h.x
              const roomStyle = { '--room': `calc(${room}cqw - 8px)`, '--room-sm': `calc(${room}cqw - 29px)` } as React.CSSProperties
              return (
                <span key={h.id ?? i} className="absolute h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                  <span className="dot-pulse block h-full w-full rounded-full border-[3px] border-white bg-accent" />
                  <span
                    data-spot-label
                    style={roomStyle}
                    className={`absolute w-max max-w-[var(--room)] bg-[rgba(15,19,23,0.92)] px-3 py-1.5 text-[13px] font-semibold leading-snug text-ink wrap-anywhere sm:bottom-auto sm:top-1/2 sm:max-w-[var(--room-sm)] sm:-translate-y-1/2 ${
                      up ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
                    } ${flip ? 'right-1/2 sm:right-[calc(100%+10px)]' : 'left-1/2 sm:left-[calc(100%+10px)]'}`}
                  >
                    {h.label}
                  </span>
                </span>
              )
            })}
          </div>
        </div>

        <div key={`txt-${active}`} className="flex flex-col justify-center gap-5">
          <h3 className="tab-fade h-display text-[24px] md:text-[28px]" style={{ letterSpacing: 1.2 }}>
            {tab.title}
          </h3>
          {tab.description && <p className="tab-fade m-0 text-base font-light leading-[1.75] text-muted">{tab.description}</p>}
          {products.length > 0 && (
            <div className="tab-fade grid grid-cols-2 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/san-pham/${p.slug}`} className="flex items-center gap-3.5 text-white no-underline hover:text-accent-text">
                  <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-btn bg-surface">
                    <Img media={p.images?.[0]?.image} size="thumb" sizes="72px" />
                  </span>
                  <span className="min-w-0 text-sm font-medium leading-[1.4] wrap-anywhere">{p.name}</span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/san-pham" className="btn-ghost self-start">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  )
}
