import type { Metadata } from 'next'
import React from 'react'

import { ContactSection } from '@/components/home/ContactSection'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getHome, getSiteSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { searchParams: Promise<{ sp?: string; from?: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Liên hệ và yêu cầu báo giá',
    description: 'Gửi bản vẽ DXF, DWG, PDF để nhận báo giá cắt laser, chấn gấp, hàn, sơn tĩnh điện. Hotline 0946.272.467.',
    path: '/lien-he',
  })
}
export default async function ContactPage({ searchParams }: Props) {
  const [{ sp, from }, settings, home] = await Promise.all([searchParams, getSiteSettings(), getHome()])

  return (
    <>
      <div className="section-x pt-[calc(var(--header-h)+32px)]">
        <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      </div>
      <ContactSection
        settings={settings}
        heading="Liên hệ và yêu cầu báo giá"
        intro={home.contactIntro}
        product={sp}
        sourcePage={from}
        as="h1"
      />
    </>
  )
}
