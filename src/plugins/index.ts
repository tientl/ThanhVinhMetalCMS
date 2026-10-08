import type { Plugin } from 'payload'

import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateDescription, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import type { Page, Post, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type Doc = Page | Post | Product

const BRAND = 'Thành Vinh Metal'

const titleOf = (doc: Doc): string =>
  'name' in doc && typeof doc.name === 'string' ? doc.name : (doc as Page | Post).title

const generateTitle: GenerateTitle<Doc> = ({ doc }) => (doc ? `${titleOf(doc)} | ${BRAND}` : BRAND)

const generateDescription: GenerateDescription<Doc> = ({ doc }) => {
  if (!doc) return ''
  if ('summary' in doc && doc.summary) return doc.summary
  if ('excerpt' in doc && doc.excerpt) return doc.excerpt
  if ('intro' in doc && doc.intro) return doc.intro
  return ''
}

const generateURL: GenerateURL<Doc> = ({ doc, collectionSlug }) => {
  const base = getServerSideURL()
  if (!doc?.slug) return base
  if (collectionSlug === 'products') return `${base}/san-pham/${doc.slug}`
  if (collectionSlug === 'posts') return `${base}/bai-viet/${doc.slug}`
  return `${base}/${doc.slug}`
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateDescription,
    generateURL,
  }),
]
