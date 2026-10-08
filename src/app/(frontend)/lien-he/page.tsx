import type { Metadata } from 'next'
import React from 'react'

import { ContactSection } from '@/components/home/ContactSection'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getHome, getSiteSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { searchParams: Promise<{ sp?: string }> }

export const metadata: Metadata = buildMetadata({
  title: 'Liên hệ và yêu cầu báo giá',
  description: 'Gửi bản vẽ DXF, DWG, PDF để nhận báo giá cắt laser, chấn gấp, hàn, sơn tĩnh điện. Hotline 0946.272.467.',
  path: '/lien-he',
})

export default async function ContactPage({ searchParams }: Props) {
  const [{ sp }, settings, home] = await Promise.all([searchParams, getSiteSettings(), getHome()])

  return (
    <>
      <div className="section-x pt-[calc(var(--header-h)+32px)]">
        <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      </div>
      <ContactSection
        settings={settings}
        heading="Liên hệ và yêu cầu báo giá"
        intro={home.contactIntro}
        newsletterNote={home.newsletterNote}
        product={sp}
        as="h1"
      />
      {settings.mapEmbed && (
        <section aria-label="Bản đồ" className="relative h-[360px] bg-deep md:h-[480px] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" dangerouslySetInnerHTML={{ __html: settings.mapEmbed }} />
      )}
    </>
  )
}
