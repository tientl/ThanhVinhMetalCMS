import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getNavigation, getSiteSettings } from '@/lib/data'
import { telHref } from '@/lib/format'
import { isMedia, mediaDims, mediaUrl } from '@/lib/media'

/** Bảo đảm iframe bản đồ tải trễ: footer ở cuối trang nên chỉ tải khi khách cuộn gần tới. */
const lazyEmbed = (html: string) => (/loading=/.test(html) ? html : html.replace('<iframe', '<iframe loading="lazy"'))

export const Footer = async () => {
  const [navigation, settings] = await Promise.all([getNavigation(), getSiteSettings()])
  const year = new Date().getFullYear()
  const logoDims = isMedia(settings.logo) ? mediaDims(settings.logo) : { width: 720, height: 720 }

  return (
    <footer className="dark-zone section-x flex flex-col gap-8 bg-deep py-10 text-[13.5px] text-muted">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <Image
              src={mediaUrl(settings.logo) || '/logo.png'}
              alt={`Logo ${settings.brandName}`}
              width={logoDims.width}
              height={logoDims.height}
              className="h-[48px] w-auto max-w-[200px] object-contain"
            />
            <span className="text-[15px] font-bold uppercase text-white" style={{ letterSpacing: 0.4 }}>
              {settings.brandName}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 leading-[1.6]">
            {settings.address && <li>{settings.address}</li>}
            <li>
              Hotline:{' '}
              <a href={telHref(settings.hotline)} className="font-semibold text-white no-underline hover:text-accent-text">
                {settings.hotline}
              </a>
              {settings.contactName && <> ({settings.contactName})</>}
            </li>
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="no-underline hover:text-accent-text">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.workingHours && <li>{settings.workingHours}</li>}
          </ul>
        </div>

        <nav aria-label="Liên kết chân trang" className="flex flex-col gap-2">
          {(navigation.footerLinks ?? []).map((l) => (
            <Link key={l.id} href={l.href} className="text-muted no-underline hover:text-accent-text">
              {l.label}
            </Link>
          ))}
        </nav>

        {settings.mapEmbed && (
          <div
            aria-label="Bản đồ"
            className="h-[200px] w-full overflow-hidden border border-line md:w-[300px] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: lazyEmbed(settings.mapEmbed) }}
          />
        )}
      </div>
      <div className="border-t border-line pt-5">
        © {year} {settings.companyName}. Bảo lưu mọi quyền.
        {settings.taxCode && <span className="ml-2 text-muted-3">MST {settings.taxCode}</span>}
      </div>
    </footer>
  )
}
