import Image from 'next/image'
import React from 'react'

import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { IconClock, IconMail, IconPhone, IconPin } from '@/components/ui/Icons'
import { telHref, zaloHref } from '@/lib/format'
import { isMedia, mediaDims, mediaUrl } from '@/lib/media'
import type { SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
  heading?: string | null
  intro?: string | null
  newsletterNote?: string | null
  product?: string
  /** Trang khách bấm nút báo giá (ví dụ /san-pham/vach-hoa-van), ghi vào ô "Gửi từ trang" */
  sourcePage?: string
  as?: 'h1' | 'h2'
  /** Hiện bản đồ Google Maps (mã nhúng trong Thông tin công ty) trong thẻ thông tin */
  showMap?: boolean
}

export const ContactSection = ({ settings, heading, intro, newsletterNote, product, sourcePage, as: Tag = 'h2', showMap = false }: Props) => {
  const logoDims = isMedia(settings.logo) ? mediaDims(settings.logo) : { width: 720, height: 720 }
  const socials = [
    { label: 'Facebook', href: settings.facebook },
    { label: 'YouTube', href: settings.youtube },
    { label: 'TikTok', href: settings.tiktok },
    { label: 'Zalo', href: settings.zalo ? zaloHref(settings.zalo) : null },
  ].filter((s) => s.href)

  return (
    <section id="lien-he" className="section hairline grid gap-12 bg-bg-alt lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-[72px]">
      <div id="bao-gia" className="relative flex scroll-mt-24 flex-col gap-6" data-reveal>
        <Tag className="h-serif text-[30px] md:text-[40px]">{heading || 'Liên hệ với chúng tôi'}</Tag>
        {intro && <p className="lead m-0">{intro}</p>}
        <QuoteForm product={product} sourcePage={sourcePage} />
      </div>

      <div className="flex flex-col gap-[22px] self-start bg-surface p-6 md:p-10" data-reveal>
        <div className="flex items-center gap-3.5">
          <Image
            src={mediaUrl(settings.logo) || '/logo.png'}
            alt=""
            width={logoDims.width}
            height={logoDims.height}
            className="h-[56px] w-auto max-w-[220px] object-contain"
          />
          <span className="h-serif text-[17px] md:text-[19px]" style={{ letterSpacing: 1.2 }}>
            {settings.companyName}
          </span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0 text-[15px] leading-[1.6]">
          <li className="flex gap-3">
            <IconPhone className="mt-0.5 shrink-0" />
            <span>
              <a href={telHref(settings.hotline)} className="font-bold no-underline hover:text-accent-text">
                {settings.hotline}
              </a>
              {settings.contactName && <> ({settings.contactName})</>}
            </span>
          </li>
          {settings.email && (
            <li className="flex gap-3">
              <IconMail className="mt-0.5 shrink-0" />
              <a href={`mailto:${settings.email}`} className="no-underline hover:text-accent-text">
                {settings.email}
              </a>
            </li>
          )}
          {settings.address && (
            <li className="flex gap-3">
              <IconPin className="mt-0.5 shrink-0" />
              <span>{settings.address}</span>
            </li>
          )}
          {settings.workingHours && (
            <li className="flex gap-3">
              <IconClock className="mt-0.5 shrink-0" />
              <span>{settings.workingHours}</span>
            </li>
          )}
          {settings.taxCode && (
            <li className="flex gap-3 text-muted-2">
              <span className="w-5 shrink-0" />
              <span>Mã số thuế: {settings.taxCode}</span>
            </li>
          )}
        </ul>
        {showMap && settings.mapEmbed && (
          <div
            aria-label="Bản đồ"
            className="h-[220px] overflow-hidden border border-line md:h-[260px] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: settings.mapEmbed }}
          />
        )}
        {socials.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line pt-[18px]">
            <span className="text-sm font-semibold">Theo dõi chúng tôi trên</span>
            <div className="flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <a key={s.label} href={s.href as string} target="_blank" rel="noopener" className="inline-flex h-10 items-center border border-line-2 px-4 text-[13.5px] font-medium no-underline hover:border-accent">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}
        <NewsletterForm note={newsletterNote} />
      </div>
    </section>
  )
}
