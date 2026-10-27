'use client'

import { toast, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

import { timeVN } from '@/lib/format'

const TOAST_ID = 'stale-doc'

/**
 * Trang chủ, Menu, Thông tin công ty: quay lại tab đang mở trang mà trang đã được lưu ở tab hay máy khác thì báo ngay,
 * kèm nút "Tải lại", để khỏi sửa tiếp trên bản cũ. Lưu bản cũ cũng bị server chặn (src/hooks/staleSave.ts).
 * Kiểm tra khi tab được xem lại (focus, visibilitychange) và mỗi 60 giây. Gắn qua `beforeDocumentControls`, không vẽ gì.
 */
export const StaleDocWatcher = () => {
  const { globalSlug } = useDocumentInfo()
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  // updatedAt của bản đang mở; lưu xong form nhận giá trị mới
  const loaded = useFormFields(([fields]) => fields.updatedAt?.value as string | undefined)
  const loadedRef = useRef(loaded)

  useEffect(() => {
    loadedRef.current = loaded
    toast.dismiss(TOAST_ID)
  }, [loaded])

  useEffect(() => {
    if (!globalSlug) return
    let busy = false
    const check = async () => {
      if (busy || document.visibilityState !== 'visible' || !loadedRef.current) return
      busy = true
      try {
        const res = await fetch(`${serverURL || ''}${api}/globals/${globalSlug}?depth=0&select[updatedAt]=true`, { credentials: 'include' })
        const doc = res.ok ? ((await res.json()) as { updatedAt?: string }) : null
        if (doc?.updatedAt && loadedRef.current && Date.parse(doc.updatedAt) > Date.parse(loadedRef.current)) {
          toast.warning(
            `Trang này vừa được lưu ở tab hoặc máy khác lúc ${timeVN(doc.updatedAt)}. Bản đang mở ở đây đã cũ, lưu sẽ bị chặn. Tải lại trang để lấy bản mới rồi hãy sửa.`,
            { id: TOAST_ID, duration: Infinity, action: { label: 'Tải lại', onClick: () => window.location.reload() } },
          )
        }
      } catch {
        // mất mạng thì thôi, lần sau kiểm lại
      } finally {
        busy = false
      }
    }
    const onShow = () => void check()
    window.addEventListener('focus', onShow)
    document.addEventListener('visibilitychange', onShow)
    const timer = setInterval(onShow, 60_000)
    return () => {
      window.removeEventListener('focus', onShow)
      document.removeEventListener('visibilitychange', onShow)
      clearInterval(timer)
    }
  }, [api, globalSlug, serverURL])

  return null
}
