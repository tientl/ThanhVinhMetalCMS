'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Img } from '@/components/ui/Img'
import { IconNext, IconPrev } from '@/components/ui/Icons'
import type { Home } from '@/payload-types'

type Slide = NonNullable<Home['slides']>[number]

const INTERVAL = 5500

export const HeroSlider = ({ slides }: { slides: Slide[] }) => {
  const [index, setIndex] = useState(0)
  const [tick, setTick] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = slides.length

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    if (count <= 1) return
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL)
  }, [count])

  useEffect(() => {
    restart()
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [restart])

  const go = (i: number) => {
    setIndex((i + count) % count)
    setTick((t) => t + 1)
    restart()
  }

  if (count === 0) return null

  return (
    <section aria-label="Bộ sưu tập nổi bật" className="dark-zone relative h-[640px] overflow-hidden bg-deep md:h-[760px] lg:h-[860px]">
      {slides.map((s, i) => (
        <div
          key={s.id ?? i}
          className="slide-img absolute inset-0"
          style={{ opacity: i === index ? 1 : 0, transform: `scale(${i === index ? 1.08 : 1})` }}
          aria-hidden={i !== index}
        >
          <Img media={s.image} size="hero" sizes="100vw" priority={i === 0} quality={80} />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(0deg, rgba(8,10,13,.88) 0%, rgba(8,10,13,.45) 45%, rgba(8,10,13,.05) 75%)' }}
      />

      <div key={`${index}-${tick}`} className="absolute bottom-28 left-5 right-5 flex flex-col gap-5 text-white sm:left-8 md:left-12 md:bottom-24 lg:left-16 lg:w-[780px] lg:right-auto">
        {index === 0 ? (
          <h1 className="fade-up h-serif text-[34px] text-white sm:text-[44px] lg:text-[58px]" style={{ letterSpacing: 2 }}>
            {slides[index].title}
          </h1>
        ) : (
          <h2 className="fade-up h-serif text-[34px] text-white sm:text-[44px] lg:text-[58px]" style={{ letterSpacing: 2 }}>
            {slides[index].title}
          </h2>
        )}
        {slides[index].description && (
          <p className="fade-up-2 m-0 max-w-[620px] text-base font-light leading-[1.7] text-soft md:text-lg">{slides[index].description}</p>
        )}
        <Link href={slides[index].buttonHref || '/san-pham'} className="btn-ghost self-start">
          {slides[index].buttonLabel || 'Khám phá ngay'}
        </Link>
      </div>

      {count > 1 && (
        <>
          <div className="absolute bottom-[72px] right-5 flex items-center gap-4 text-white sm:right-8 md:bottom-24 md:right-12 lg:right-16">
            <span className="text-sm font-medium text-accent-text" style={{ letterSpacing: 3 }}>
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button type="button" aria-label="Ảnh trước" onClick={() => go(index - 1)} className="flex h-11 w-11 cursor-pointer items-center justify-center border-[1.5px] border-white/70 bg-transparent text-white hover:border-accent md:h-[52px] md:w-[52px]">
              <IconPrev />
            </button>
            <button type="button" aria-label="Ảnh tiếp theo" onClick={() => go(index + 1)} className="flex h-11 w-11 cursor-pointer items-center justify-center border-[1.5px] border-white/70 bg-transparent text-white hover:border-accent md:h-[52px] md:w-[52px]">
              <IconNext />
            </button>
          </div>
          <div className="section-x absolute bottom-8 left-0 right-0 grid gap-3 md:bottom-12" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {slides.map((s, i) => (
              <button key={s.id ?? i} type="button" aria-label={`Ảnh ${i + 1}`} aria-current={i === index} onClick={() => go(i)} className="flex h-6 cursor-pointer items-center border-0 bg-transparent p-0">
                <span className="relative block h-[3px] w-full overflow-hidden bg-white/30">
                  {i === index && <span key={`${index}-${tick}`} className="slide-fill absolute left-0 top-0 h-full bg-accent" />}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
