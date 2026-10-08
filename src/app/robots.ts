import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  const base = getServerSideURL()
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/tim-kiem'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
