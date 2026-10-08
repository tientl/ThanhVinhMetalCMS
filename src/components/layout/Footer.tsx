import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getNavigation, getSiteSettings } from '@/lib/data'
import { mediaUrl } from '@/lib/media'

export const Footer = async () => {
  const [navigation, settings] = await Promise.all([getNavigation(), getSiteSettings()])
  const year = new Date().getFullYear()

  return (
    <footer className="section-x flex flex-col gap-6 bg-deep py-10 text-[13.5px] text-muted">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex items-center gap-3.5">
          <Image src={mediaUrl(settings.logo) || '/logo.png'} alt={`Logo ${settings.brandName}`} width={52} height={52} />
          <span className="text-[15px] font-bold uppercase text-white" style={{ letterSpacing: 0.4 }}>
            {settings.brandName}
          </span>
        </div>
        <nav aria-label="Liên kết chân trang" className="flex flex-wrap gap-x-7 gap-y-2">
          {(navigation.footerLinks ?? []).map((l) => (
            <Link key={l.id} href={l.href} className="text-muted no-underline hover:text-accent-text">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line pt-5">
        © {year} {settings.companyName}. Bảo lưu mọi quyền.
        {settings.taxCode && <span className="ml-2 text-muted-3">MST {settings.taxCode}</span>}
      </div>
    </footer>
  )
}
