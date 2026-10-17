'use client'

import type { UIFieldClientProps } from 'payload'

import { Button, toast, useConfig, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

type MediaDoc = {
  id: number
  filename?: string | null
  url?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  heroCrop?: PercentCrop | null
  sizes?: { hero?: { url?: string | null } | null } | null
}

type Props = UIFieldClientProps & {
  /** Tỉ lệ khung (rộng / cao), ví dụ 2 cho 2:1, 1 cho vuông */
  aspect?: number
  /** 'hero': cắt cứng ra cỡ slider 2400×1200. 'focal': lưu tâm khung làm điểm lấy nét, dùng cho khung đổi tỉ lệ theo màn hình */
  mode?: 'hero' | 'focal'
  /** Tên ô ảnh cùng hàng mà khung đọc, mặc định "image" */
  imageField?: string
  title?: string
  hint?: string
}

const fullCrop = (w: number, h: number, aspect: number): PercentCrop =>
  centerCrop(makeAspectCrop({ unit: '%', width: 100 }, aspect, w, h), w, h)

/** Khung quanh điểm lấy nét đã lưu, rộng 60% ảnh */
const cropAroundFocal = (w: number, h: number, aspect: number, fx: number, fy: number): PercentCrop => {
  const base = makeAspectCrop({ unit: '%', width: 60 }, aspect, w, h)
  const x = Math.min(Math.max(fx - base.width / 2, 0), 100 - base.width)
  const y = Math.min(Math.max(fy - base.height / 2, 0), 100 - base.height)
  return { ...base, x, y }
}

/**
 * Khung chọn vùng ảnh, đặt ngay dưới ô "Ảnh" trong các khối của Trang chủ.
 * Chế độ hero: server cắt lại cỡ slider đúng vùng chọn. Chế độ focal: lưu tâm khung làm điểm lấy nét của ảnh,
 * mọi chỗ hiển thị ảnh bị cắt theo khung (thẻ, bộ sưu tập, tab ứng dụng…) đều giữ vùng đó.
 */
export const ImageFrameField = ({ path, aspect = 2, mode = 'focal', imageField = 'image', title, hint }: Props) => {
  const imagePath = `${path.slice(0, path.lastIndexOf('.'))}.${imageField}`
  const raw = useFormFields(([fields]) => fields[imagePath]?.value as number | string | { id: number } | null | undefined)
  const id = raw && typeof raw === 'object' ? raw.id : raw
  const { config } = useConfig()
  const api = config.routes.api

  const [doc, setDoc] = useState<MediaDoc | null>(null)
  const [crop, setCrop] = useState<PercentCrop | undefined>()
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`${api}/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MediaDoc | null) => {
        if (cancelled || !d) return
        setDoc(d)
        if (mode === 'hero' && d.heroCrop) setCrop({ ...d.heroCrop, unit: '%' })
        else if (mode === 'focal' && d.width && d.height && typeof d.focalX === 'number' && typeof d.focalY === 'number' && (d.focalX !== 50 || d.focalY !== 50))
          setCrop(cropAroundFocal(d.width, d.height, aspect, d.focalX, d.focalY))
        else setCrop(undefined)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api, id, version, mode, aspect])

  const heading = title ?? (mode === 'hero' ? 'Khung slider (2:1)' : 'Vùng ảnh muốn giữ')
  const help =
    hint ??
    (mode === 'hero'
      ? `Kéo khung tới phần muốn hiện trên slider trang chủ. Khung giữ tỉ lệ 2:1, kéo góc để thu phóng.`
      : `Kéo khung tới phần quan trọng của ảnh. Khung chỉ để ngắm; website lấy tâm khung làm điểm lấy nét, nên trên mọi cỡ màn hình phần này luôn được giữ lại.`)

  if (!id) return <p className="slider-crop__hint">Chọn ảnh ở ô trên, sau đó kéo khung để chọn phần muốn giữ.</p>
  if (!doc || doc.id !== id) return null
  if (!(doc.mimeType || '').startsWith('image/') || !doc.url) return null

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!crop) setCrop(fullCrop(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight, aspect))
  }

  const save = async () => {
    if (!crop) return
    setSaving(true)
    try {
      if (mode === 'hero') {
        const res = await fetch(`${api}/media/${id}/hero-crop`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: crop.x, y: crop.y, width: crop.width, height: crop.height }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || `HTTP ${res.status}`)
        toast.success('Đã cắt lại ảnh cho slider')
      } else {
        const focalX = Math.round(crop.x + crop.width / 2)
        const focalY = Math.round(crop.y + crop.height / 2)
        const res = await fetch(`${api}/media/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ focalX, focalY }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.errors?.[0]?.message || `HTTP ${res.status}`)
        toast.success('Đã lưu vùng ảnh muốn giữ')
      }
      setVersion((v) => v + 1)
    } catch (e) {
      toast.error(`Không lưu được: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const heroUrl = mode === 'hero' && doc.sizes?.hero?.url ? `${doc.sizes.hero.url}${doc.sizes.hero.url.includes('?') ? '&' : '?'}v=${version}` : null

  return (
    <div className="field-type slider-crop">
      <div className="slider-crop__head">
        <strong>{heading}</strong>
        <span>{help}</span>
      </div>
      <div className="slider-crop__editor">
        <ReactCrop crop={crop} onChange={(_, pc) => setCrop(pc)} aspect={aspect} keepSelection minWidth={40} ruleOfThirds>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={doc.url} alt="" onLoad={onImageLoad} draggable={false} />
        </ReactCrop>
      </div>
      <div className="slider-crop__actions">
        <Button buttonStyle="primary" size="medium" onClick={save} disabled={saving || !crop} type="button">
          {saving ? 'Đang lưu…' : mode === 'hero' ? 'Lưu khung slider' : 'Lưu vùng ảnh'}
        </Button>
        <Button buttonStyle="secondary" size="medium" type="button" onClick={() => doc.width && doc.height && setCrop(fullCrop(doc.width, doc.height, aspect))}>
          Đặt lại
        </Button>
      </div>
      {heroUrl && (
        <div className="slider-crop__preview">
          <span>Ảnh slider hiện tại (2400×1200):</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroUrl} alt="" />
        </div>
      )}
    </div>
  )
}

export default ImageFrameField
