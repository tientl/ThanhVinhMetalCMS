import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

import { getSiteSettings } from './data'
import { mediaUrl } from './media'

type Meta = { title?: string | null; description?: string | null; image?: Media | number | string | null } | null | undefined

/** Dự phòng khi chưa có cài đặt; tên thật lấy từ ô "Tên thương hiệu" trong Thông tin công ty. */
export const BRAND = 'Thành Vinh Metal'

export const getBrand = async () => (await getSiteSettings()).brandName || BRAND

export const buildMetadata = async ({
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
}): Promise<Metadata> => {
  const base = getServerSideURL()
  const brand = await getBrand()
  const finalTitle = meta?.title || (title.includes(brand) ? title : `${title} | ${brand}`)
  const finalDescription = meta?.description || description || ''
  const og = mediaUrl(meta?.image ?? image, 'og')
  const ogUrl = og ? `${base}${og}` : `${base}/og-default.jpg`

  return {
    // Tuyệt đối để layout không nối thêm "| tên thương hiệu" lần nữa
    title: { absolute: finalTitle },
    description: finalDescription,
    alternates: { canonical: `${base}${path}` },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `${base}${path}`,
      siteName: brand,
      locale: 'vi_VN',
      type,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: finalTitle, description: finalDescription, images: [ogUrl] },
  }
}
