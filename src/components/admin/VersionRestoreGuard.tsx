'use client'

import { useConfig } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { sameContent } from '@/lib/versions'

const ATTR = 'data-version-restore'

/**
 * Bọc toàn trang quản trị (admin.components.providers), lo hai việc trên trang xem phiên bản của mọi collection có `versions`:
 *
 * 1. Ẩn nút "Khôi phục về phiên bản này" khi phiên bản đang xem giống hệt phiên bản mới nhất.
 *    Payload không có chỗ thay riêng nút này, nên đánh dấu trên <html> rồi để custom.scss ẩn:
 *    "checking" lúc đang so (ẩn để khỏi nháy), "same" khi giống, "different" khi khác (hiện nút).
 *    Server vẫn chặn khôi phục vô ích (src/hooks/versions.ts), đây chỉ là phần giao diện.
 *
 * 2. Mới vào trang phiên bản thì hiện toàn bộ nội dung, tức bỏ tick "Chỉ được sửa đổi" (?modifiedOnly=false).
 *    Payload mặc định tick, và khi người dùng tick lại thì Payload XÓA tham số khỏi URL, nên chỉ đặt false
 *    lúc mới vào (bấm link tới trang phiên bản, hoặc mở thẳng URL), không ép lại khi đang ở trên trang.
 */
export const VersionRestoreGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { config } = useConfig()
  const { admin: adminRoute, api } = config.routes
  const versioned: string[] = config.collections.filter((c) => c.versions).map((c) => c.slug)
  const versionedKey = versioned.join(',')

  const versionPage = new RegExp(`^${adminRoute}/collections/([^/]+)/([^/]+)/versions/([^/]+)$`)
  const matchVersionPage = (path: string) => {
    const m = path.match(versionPage)
    return m && versioned.includes(m[1]) ? m : null
  }

  // 2a. Bấm link tới trang phiên bản: thêm modifiedOnly=false trước khi Next điều hướng (không bị nháy)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank') return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || !matchVersionPage(url.pathname) || url.searchParams.has('modifiedOnly')) return
      e.preventDefault()
      e.stopPropagation()
      url.searchParams.set('modifiedOnly', 'false')
      router.push(`${url.pathname}?${url.searchParams.toString()}`)
    }
    // Pha capture ở document: chạy trước khi React (gắn ở root) xử lý click của Link
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminRoute, versionedKey, router])

  // 2b. Mở thẳng URL trang phiên bản (gõ tay, tải lại): đổi sang modifiedOnly=false một lần khi mới vào
  const lastPath = useRef<string | null>(null)
  useEffect(() => {
    const entering = lastPath.current !== pathname
    lastPath.current = pathname
    if (!entering || !matchVersionPage(pathname) || searchParams.has('modifiedOnly')) return
    const next = new URLSearchParams(searchParams.toString())
    next.set('modifiedOnly', 'false')
    router.replace(`${pathname}?${next.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, router, versionedKey])

  // 1. So phiên bản đang xem với phiên bản mới nhất
  useEffect(() => {
    const root = document.documentElement
    const m = matchVersionPage(pathname)
    if (!m) {
      root.removeAttribute(ATTR)
      return
    }
    const [, slug, docId, versionId] = m
    let cancelled = false
    root.setAttribute(ATTR, 'checking')

    const get = (url: string) => fetch(url, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null))
    const latestUrl = `${api}/${slug}/versions?where[parent][equals]=${encodeURIComponent(docId)}&sort=-updatedAt&limit=1&depth=0`
    Promise.all([get(latestUrl), get(`${api}/${slug}/versions/${versionId}?depth=0`)])
      .then(([latestRes, version]) => {
        if (cancelled) return
        const latest = latestRes?.docs?.[0]
        const same = Boolean(
          latest && version?.version && (String(latest.id) === String(version.id) || sameContent(version.version, latest.version)),
        )
        root.setAttribute(ATTR, same ? 'same' : 'different')
      })
      .catch(() => {
        // Không so được thì cứ hiện nút; server vẫn chặn nếu khôi phục vô ích
        if (!cancelled) root.setAttribute(ATTR, 'different')
      })

    return () => {
      cancelled = true
      root.removeAttribute(ATTR)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, api, versionedKey])

  return <>{children}</>
}

export default VersionRestoreGuard
