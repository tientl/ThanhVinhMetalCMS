import type { ServerProps, VisibleEntities } from 'payload'

import { EntityType, groupNavItems } from '@payloadcms/ui/shared'
import React from 'react'

import { NavClient, type NavGroupData } from './NavClient'

/** Thứ tự nhóm và mục trong menu bên trái. Mục không có trong danh sách xếp cuối. */
const GROUP_ORDER = ['Liên hệ', 'Sản phẩm', 'Bài viết', 'Nội dung', 'Cài đặt']
const ENTITY_ORDER = [
  'quote-requests',
  'subscribers',
  'products',
  'product-categories',
  'posts',
  'post-categories',
  'home',
  'pages',
  'media',
  'navigation',
  'site-settings',
  'users',
]

const rank = (list: string[], key: string) => {
  const i = list.indexOf(key)
  return i === -1 ? list.length : i
}

type Props = ServerProps & { visibleEntities?: VisibleEntities }

/** Menu bên trái tùy chỉnh: thương hiệu, nhóm theo thứ tự cố định, huy hiệu số yêu cầu báo giá mới. */
export const AdminNav = async ({ i18n, payload, permissions, visibleEntities }: Props) => {
  if (!payload?.config || !permissions) return null
  const { collections, globals } = payload.config
  const visibleCollections = visibleEntities?.collections ?? collections.map((c) => c.slug)
  const visibleGlobals = visibleEntities?.globals ?? globals.map((g) => g.slug)

  const raw = groupNavItems(
    [
      ...collections
        .filter(({ slug }) => visibleCollections.includes(slug))
        .map((entity) => ({ type: EntityType.collection as const, entity })),
      ...globals
        .filter(({ slug }) => visibleGlobals.includes(slug))
        .map((entity) => ({ type: EntityType.global as const, entity })),
    ],
    permissions,
    i18n,
  )

  let newQuotes = 0
  if (visibleCollections.includes('quote-requests') && permissions.collections?.['quote-requests']?.read) {
    const res = await payload.count({ collection: 'quote-requests', where: { status: { equals: 'new' } } })
    newQuotes = res.totalDocs
  }

  const groups: NavGroupData[] = raw
    .map((g) => ({
      label: g.label,
      entities: [...g.entities]
        .sort((a, b) => rank(ENTITY_ORDER, a.slug) - rank(ENTITY_ORDER, b.slug))
        .map((e) => ({
          slug: e.slug,
          type: e.type === EntityType.collection ? ('collection' as const) : ('global' as const),
          label: typeof e.label === 'string' ? e.label : i18n.t(e.label as never),
          badge: e.slug === 'quote-requests' && newQuotes > 0 ? newQuotes : undefined,
        })),
    }))
    .sort((a, b) => rank(GROUP_ORDER, a.label) - rank(GROUP_ORDER, b.label))

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  return <NavClient groups={groups} brandName={settings.brandName || 'Thành Vinh Metal'} />
}

export default AdminNav
