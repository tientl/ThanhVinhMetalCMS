'use client'

import { Hamburger, Link, NavGroup, useNav } from '@payloadcms/ui'

import { LiveQuoteCount } from '../LiveQuoteCount'
import { usePathname } from 'next/navigation'
import React from 'react'

export type NavGroupData = {
  label: string
  entities: { slug: string; type: 'collection' | 'global'; label: string; badge?: number }[]
}

const baseClass = 'nav'

export const NavClient = ({ groups, brandName }: { groups: NavGroupData[]; brandName: string }) => {
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const pathname = usePathname()

  const classes = [
    baseClass,
    navOpen && `${baseClass}--nav-open`,
    shouldAnimate && `${baseClass}--nav-animate`,
    hydrated && `${baseClass}--nav-hydrated`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={classes} inert={!navOpen ? true : undefined}>
      <div className={`${baseClass}__scroll`} ref={navRef}>
        <nav className={`${baseClass}__wrap`}>
          <Link href="/admin" className="nav-brand" prefetch={false}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={40} height={40} />
            <span className="nav-brand__text">
              <strong>{brandName}</strong>
              <small>Trang quản trị</small>
            </span>
          </Link>

          {groups.map((group) => (
            <NavGroup key={group.label} label={group.label}>
              {group.entities.map((e) => {
                const href = e.type === 'collection' ? `/admin/collections/${e.slug}` : `/admin/globals/${e.slug}`
                const isActive = pathname.startsWith(href) && ['/', undefined].includes(pathname[href.length])
                const content = (
                  <>
                    {isActive && <div className={`${baseClass}__link-indicator`} />}
                    <span className={`${baseClass}__link-label`}>{e.label}</span>
                    {e.slug === 'quote-requests' && <LiveQuoteCount initial={e.badge ?? 0} variant="badge" />}
                  </>
                )
                if (pathname === href) {
                  return (
                    <div key={e.slug} className={`${baseClass}__link nav__link--active`} id={`nav-${e.slug}`}>
                      {content}
                    </div>
                  )
                }
                return (
                  <Link key={e.slug} href={href} className={`${baseClass}__link${isActive ? ' nav__link--active' : ''}`} id={`nav-${e.slug}`} prefetch={false}>
                    {content}
                  </Link>
                )
              })}
            </NavGroup>
          ))}

          <Link href="/admin/logout" className="nav-logout" prefetch={false}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Đăng xuất
          </Link>
        </nav>
      </div>
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <button className={`${baseClass}__mobile-close`} onClick={() => setNavOpen(false)} tabIndex={!navOpen ? -1 : undefined} type="button">
            <Hamburger isActive />
          </button>
        </div>
      </div>
    </aside>
  )
}
