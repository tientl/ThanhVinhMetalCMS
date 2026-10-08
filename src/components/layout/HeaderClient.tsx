'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Img } from '@/components/ui/Img'
import { IconClose, IconDownload, IconHome, IconMenu, IconSearch } from '@/components/ui/Icons'
import { mediaUrl } from '@/lib/media'
import type { Navigation, SiteSetting } from '@/payload-types'

type Item = NonNullable<Navigation['left']>[number]
type Mega = NonNullable<Item['megaMenu']>

type Props = { navigation: Navigation; settings: SiteSetting }

const NAV_TEXT = 'text-[12px] font-medium uppercase no-underline'
const NAV_SPACING = { letterSpacing: 1.6 }

export const HeaderClient = ({ navigation, settings }: Props) => {
  const [open, setOpen] = useState<string>('')
  const [mobile, setMobile] = useState(false)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Đóng menu khi chuyển trang (cập nhật state ngay trong lúc render, theo khuyến nghị của React)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen('')
    setMobile(false)
  }

  const close = useCallback(() => {
    setOpen('')
    setMobile(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [close])

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobile])

  const isOpen = open !== '' || mobile
  const toggle = (key: string) => setOpen((cur) => (cur === key ? '' : key))
  const left = navigation.left ?? []
  const right = navigation.right ?? []
  const allItems = [...left, ...right]
  const current = allItems.find((i) => i.id === open)

  const renderItem = (item: Item) =>
    item.type === 'mega' ? (
      <button
        key={item.id}
        type="button"
        className={`navl h-10 cursor-pointer border-0 bg-transparent p-0 text-current ${NAV_TEXT}`}
        style={NAV_SPACING}
        aria-expanded={open === item.id}
        aria-controls={`mega-${item.id}`}
        onClick={() => toggle(item.id ?? item.label)}
      >
        {item.label}
      </button>
    ) : (
      <Link
        key={item.id}
        href={item.href || '/'}
        className={`navl text-current ${NAV_TEXT}`}
        style={NAV_SPACING}
        aria-current={item.href && item.href !== '/' && pathname.startsWith(item.href.split('#')[0]) ? 'page' : undefined}
      >
        {item.label}
      </Link>
    )

  return (
    <div ref={wrapRef}>
      <div
        className="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
        style={{
          background: isOpen ? 'var(--color-bg)' : 'var(--header-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isOpen ? 'var(--color-line)' : 'transparent'}`,
          color: isOpen ? 'var(--color-ink)' : 'var(--header-ink)',
        }}
      >
        <header className="section-x grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:gap-7 lg:px-10">
          {/* Trái */}
          <nav aria-label="Menu chính" className="hidden items-center gap-5 justify-self-start lg:flex">
            <Link href="/" aria-label="Trang chủ" className="navl flex text-current">
              <IconHome />
            </Link>
            {left.map(renderItem)}
          </nav>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center justify-self-start border-0 bg-transparent text-current lg:hidden"
            aria-label={mobile ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobile}
            onClick={() => {
              setOpen('')
              setMobile((m) => !m)
            }}
          >
            {mobile ? <IconClose /> : <IconMenu />}
          </button>

          {/* Logo giữa */}
          <Link href="/" aria-label={`${settings.brandName}, về trang chủ`} className="flex items-center justify-center justify-self-center">
            <Image
              src={mediaUrl(settings.logo) || '/logo.png'}
              alt={`Logo ${settings.brandName}`}
              width={70}
              height={70}
              priority
              className="h-[56px] w-[56px] lg:h-[70px] lg:w-[70px]"
            />
          </Link>

          {/* Phải */}
          <div className="flex items-center gap-4 justify-self-end lg:gap-5">
            <nav aria-label="Menu chính, phần phải" className="hidden items-center gap-5 lg:flex">
              {right.map(renderItem)}
            </nav>
            <button
              type="button"
              aria-label="Tìm kiếm"
              aria-expanded={open === 'search'}
              aria-controls="search-overlay"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent text-current"
              onClick={() => {
                setMobile(false)
                toggle('search')
              }}
            >
              <IconSearch />
            </button>
            <ThemeToggle />
          </div>
        </header>
      </div>

      {current && current.type === 'mega' && current.megaMenu && (
        <MegaPanel id={`mega-${current.id}`} label={current.label} mega={current.megaMenu} onClose={close} />
      )}
      {open === 'search' && <SearchOverlay suggestions={navigation.searchSuggestions ?? []} onClose={close} />}
      {mobile && <MobileDrawer items={allItems} onClose={close} />}
    </div>
  )
}

/* ---------- Mega menu ---------- */
const MegaPanel = ({ id, label, mega, onClose }: { id: string; label: string; mega: Mega; onClose: () => void }) => {
  const columns = mega.columns ?? []
  const cards = mega.cards ?? []
  const downloads = mega.downloads ?? []
  const hasColumns = columns.length > 0
  const hasDownloads = downloads.length > 0

  return (
    <div
      id={id}
      className="mega-drop section-x fixed inset-x-0 top-[var(--header-h)] z-30 hidden max-h-[calc(100vh-var(--header-h))] flex-col gap-6 overflow-y-auto border-t border-line bg-surface pb-12 pt-10 shadow-[0_24px_40px_rgba(15,19,23,0.16)] lg:flex"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase text-muted-3" style={{ letterSpacing: 1 }}>
          {label}
        </span>
        <button type="button" onClick={onClose} className="h-10 cursor-pointer border border-line-2 bg-transparent px-3.5 text-[13px] font-semibold text-ink">
          Đóng
        </button>
      </div>

      {hasDownloads ? (
        <div className="grid grid-cols-2 items-start gap-14">
          <div className="flex flex-col">
            <span className="mb-1 text-[15px] font-bold">Tải tài liệu</span>
            {downloads.map((d) => {
              const href = (typeof d.file === 'object' && d.file ? mediaUrl(d.file) : '') || d.href || '#'
              return (
                <a key={d.id} href={href} className="mlink flex items-center justify-between border-b border-line py-4 text-ink no-underline" target={href.startsWith('/media') ? '_blank' : undefined}>
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-semibold">{d.title}</span>
                    {d.note && <span className="text-[13px] text-muted-3">{d.note}</span>}
                  </span>
                  <IconDownload />
                </a>
              )
            })}
          </div>
          <MegaCards cards={cards} height={260} />
        </div>
      ) : hasColumns && cards.length <= 1 ? (
        <div className="grid gap-10" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) ${cards.length ? 'minmax(0, 1.3fr)' : ''}` }}>
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <span className="mb-1 text-[15px] font-bold text-ink">{col.title}</span>
              {(col.links ?? []).map((l) => (
                <Link key={l.id} href={l.href} className="mlink text-[15px] text-muted no-underline">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          {cards[0] && (
            <Link href={cards[0].href} className="zoom relative block h-[240px] overflow-hidden no-underline">
              <Img media={cards[0].image} size="card" sizes="30vw" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep/85 to-transparent px-[18px] py-4 text-[15px] font-bold uppercase text-white">
                {cards[0].title}
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 items-start gap-8">
          <div className="flex flex-col gap-4">
            {mega.intro && <p className="m-0 text-[17px] font-light leading-[1.75] text-muted">{mega.intro}</p>}
            {columns.flatMap((col) => col.links ?? []).map((l) => (
              <Link key={l.id} href={l.href} className="mlink text-sm font-semibold uppercase text-ink no-underline" style={{ letterSpacing: 0.5 }}>
                {l.label}
              </Link>
            ))}
          </div>
          <MegaCards cards={cards} height={220} wrap={false} />
        </div>
      )}
    </div>
  )
}

const MegaCards = ({ cards, height, wrap = true }: { cards: Mega['cards']; height: number; wrap?: boolean }) => {
  const list = (cards ?? []).map((c) => (
    <Link key={c.id} href={c.href} className="dark-zone zoom frame relative block overflow-hidden bg-deep text-white no-underline" style={{ height }}>
      <Img media={c.image} size="card" sizes="25vw" />
      <span className="overlay-up absolute inset-0" />
      <span className="absolute inset-x-8 bottom-[30px] flex flex-col gap-2">
        <span className="h-serif text-[24px]" style={{ letterSpacing: 1.2 }}>
          {c.title}
        </span>
        {c.subtitle && <span className="text-[15px] font-light text-soft">{c.subtitle}</span>}
      </span>
    </Link>
  ))
  return wrap ? <div className="grid grid-cols-2 gap-5">{list}</div> : <>{list}</>
}

/* ---------- Tìm kiếm ---------- */
const SearchOverlay = ({ suggestions, onClose }: { suggestions: NonNullable<Navigation['searchSuggestions']>; onClose: () => void }) => {
  const router = useRouter()
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => inputRef.current?.focus(), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(q.trim())}`)
      onClose()
    }
  }

  return (
    <div
      id="search-overlay"
      className="mega-drop section-x fixed inset-x-0 top-[var(--header-h)] z-30 flex flex-col gap-7 bg-surface-2 pb-12 pt-10 text-ink shadow-[0_24px_40px_rgba(0,0,0,0.4)] md:pb-16 md:pt-14"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase text-muted" style={{ letterSpacing: 1 }}>
          Tìm kiếm
        </span>
        <button type="button" onClick={onClose} className="h-10 cursor-pointer border border-line-2 bg-transparent px-3.5 text-[13px] font-semibold text-ink">
          Đóng
        </button>
      </div>
      <form onSubmit={submit} role="search">
        <label htmlFor="site-search" className="sr-only">
          Từ khóa
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm sản phẩm, dịch vụ, bài viết..."
          className="h-[56px] w-full border-0 border-b border-line-2 bg-transparent px-1 text-[22px] font-light text-ink outline-none placeholder:text-muted-3 focus:border-accent md:h-[72px] md:text-[34px]"
        />
      </form>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-3.5">
          <span className="text-[13px] text-muted">Gợi ý tìm nhanh</span>
          <div className="flex flex-wrap gap-2.5">
            {suggestions.map((s) => (
              <Link key={s.id} href={s.href} className="chip">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Ngăn kéo mobile ---------- */
const MobileDrawer = ({ items, onClose }: { items: Item[]; onClose: () => void }) => {
  const [expanded, setExpanded] = useState<string>('')
  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-30 overflow-y-auto bg-bg lg:hidden" role="dialog" aria-label="Menu">
      <nav className="flex flex-col">
        <Link href="/" onClick={onClose} className="border-b border-line px-5 py-4 text-[13px] font-medium uppercase text-ink no-underline" style={{ letterSpacing: 1.6 }}>
          Trang chủ
        </Link>
        {items.map((item) => {
          const key = item.id ?? item.label
          if (item.type !== 'mega' || !item.megaMenu) {
            return (
              <Link key={key} href={item.href || '/'} onClick={onClose} className="border-b border-line px-5 py-4 text-[13px] font-medium uppercase text-ink no-underline" style={{ letterSpacing: 1.6 }}>
                {item.label}
              </Link>
            )
          }
          const isOpen = expanded === key
          const links = [
            ...(item.megaMenu.columns ?? []).flatMap((c) => c.links ?? []),
            ...(item.megaMenu.cards ?? []).map((c) => ({ id: c.id, label: c.title, href: c.href })),
            ...(item.megaMenu.downloads ?? []).map((d) => ({
              id: d.id,
              label: d.title,
              href: (typeof d.file === 'object' && d.file ? mediaUrl(d.file) : '') || d.href || '#',
            })),
          ]
          return (
            <div key={key} className="border-b border-line">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? '' : key)}
                className="flex w-full items-center justify-between border-0 bg-transparent px-5 py-4 text-left text-[13px] font-medium uppercase text-ink"
                style={{ letterSpacing: 1.6 }}
              >
                {item.label}
                <span aria-hidden="true" className="text-accent-text">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-3 bg-surface px-5 pb-5 pt-2">
                  {item.megaMenu.intro && <p className="m-0 text-[15px] font-light leading-relaxed text-muted">{item.megaMenu.intro}</p>}
                  {links.map((l, i) => (
                    <Link key={`${l.id ?? i}`} href={l.href} onClick={onClose} className="text-[15px] text-muted no-underline">
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        <Link href="/lien-he" onClick={onClose} className="m-5 btn-ghost">
          Yêu cầu báo giá
        </Link>
      </nav>
    </div>
  )
}
