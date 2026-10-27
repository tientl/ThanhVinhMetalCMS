import React from 'react'

import { mediaUrl } from '@/lib/media'
import type { Product, SiteSetting } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
)

export const LocalBusinessJsonLd = ({ settings }: { settings: SiteSetting }) => {
  const base = getServerSideURL()
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: settings.companyName,
        alternateName: settings.brandName,
        url: base,
        logo: `${base}${mediaUrl(settings.logo) || '/logo.png'}`,
        telephone: settings.hotline,
        email: settings.email || undefined,
        taxID: settings.taxCode || undefined,
        address: settings.address
          ? { '@type': 'PostalAddress', streetAddress: settings.address, addressRegion: 'Bình Dương', addressCountry: 'VN' }
          : undefined,
        openingHours: settings.workingHours || undefined,
        sameAs: [settings.facebook, settings.youtube, settings.tiktok].filter(Boolean),
      }}
    />
  )
}

export const ProductJsonLd = ({ product }: { product: Product }) => {
  const base = getServerSideURL()
  const images = (product.images ?? []).map((i) => mediaUrl(i.image, 'card')).filter(Boolean)
  // typeof null cũng là 'object': sản phẩm mất danh mục (đã bị xóa) thì category là null
  const category = product.category && typeof product.category === 'object' ? product.category.name : undefined
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.summary || undefined,
        image: images.map((u) => `${base}${u}`),
        category,
        material: product.material || undefined,
        brand: { '@type': 'Brand', name: 'Thành Vinh Metal' },
        url: `${base}/san-pham/${product.slug}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
          url: `${base}/san-pham/${product.slug}`,
        },
      }}
    />
  )
}
