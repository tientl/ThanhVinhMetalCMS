import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

import { mediaUrl } from './media'

type Meta = { title?: string | null; description?: string | null; image?: Media | number | string | null } | null | undefined

export const BRAND = 'Thành Vinh Metal'

export const buildMetadata = ({
  title,
  description,
  path,
  meta,
  image,
  type = 'website',
}: {
  title: string
  description?: string | null
  path: string
  meta?: Meta
  image?: Media | number | string | null
  type?: 'website' | 'article'
}): Metadata => {
  const base = getServerSideURL()
  const finalTitle = meta?.title || (title.includes(BRAND) ? title : `${title} | ${BRAND}`)
  const finalDescription = meta?.description || description || ''
  const og = mediaUrl(meta?.image ?? image, 'og')
  const ogUrl = og ? `${base}${og}` : `${base}/og-default.jpg`

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: { canonical: `${base}${path}` },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `${base}${path}`,
      siteName: BRAND,
      locale: 'vi_VN',
      type,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: finalTitle, description: finalDescription, images: [ogUrl] },
  }
}
