'use client'

import type { UIFieldClientProps } from 'payload'

import { Button, toast, useConfig, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const ASPECT = 2

type MediaDoc = {
  id: number
  filename?: string | null
  url?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  heroCrop?: PercentCrop | null
  sizes?: { hero?: { url?: string | null } | null } | null
}

const fullWidthCrop = (w: number, h: number): PercentCrop =>
  centerCrop(makeAspectCrop({ unit: '%', width: 100 }, ASPECT, w, h), w, h)

/**
 * Khung slider 2:1, đặt trong mỗi slide ở Trang chủ ngay dưới ô "Ảnh".
 * Kéo khung cố định tỉ lệ trên ảnh đã chọn, bấm lưu để server cắt lại cỡ "hero" của ảnh đó.
 */
export const SliderCropField = ({ path }: UIFieldClientProps) => {
  const imagePath = `${path.slice(0, path.lastIndexOf('.'))}.image`
  const raw = useFormFields(([fields]) => fields[imagePath]?.value as number | string | { id: number } | null | undefined)
  const id = raw && typeof raw === 'object' ? raw.id : raw
  const { config } = useConfig()
  const api = config.routes.api

  const [doc, setDoc] = useState<MediaDoc | null>(null)
  const [crop, setCrop] = useState<PercentCrop | undefined>()
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`${api}/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MediaDoc | null) => {
        if (cancelled || !d) return
        setDoc(d)
        setCrop(d.heroCrop ? { ...d.heroCrop, unit: '%' } : undefined)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api, id, version])

  if (!id) return <p className="slider-crop__hint">Chọn ảnh ở ô trên, sau đó kéo khung để chọn phần hiện trên slider.</p>
  if (!doc || doc.id !== id) return null
  if (!(doc.mimeType || '').startsWith('image/') || !doc.url) return null

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!crop) {
      const { naturalWidth, naturalHeight } = e.currentTarget
      setCrop(fullWidthCrop(naturalWidth, naturalHeight))
    }
  }

  const save = async () => {
    if (!crop) return
    setSaving(true)
    try {
      const res = await fetch(`${api}/media/${id}/hero-crop`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: crop.x, y: crop.y, width: crop.width, height: crop.height }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || `HTTP ${res.status}`)
      toast.success('Đã cắt lại ảnh cho slider')
      setVersion((v) => v + 1)
    } catch (e) {
      toast.error(`Không cắt được: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const heroUrl = doc.sizes?.hero?.url ? `${doc.sizes.hero.url}${doc.sizes.hero.url.includes('?') ? '&' : '?'}v=${version}` : null

  return (
    <div className="field-type slider-crop">
      <div className="slider-crop__head">
        <strong>Khung slider (2:1)</strong>
        <span>Kéo khung tới phần muốn hiện trên slider trang chủ. Khung giữ tỉ lệ 2:1, kéo góc để thu phóng.</span>
      </div>
      <div className="slider-crop__editor">
        <ReactCrop crop={crop} onChange={(_, pc) => setCrop(pc)} aspect={ASPECT} keepSelection minWidth={40} ruleOfThirds>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={doc.url} alt="" onLoad={onImageLoad} draggable={false} />
        </ReactCrop>
      </div>
      <div className="slider-crop__actions">
        <Button buttonStyle="primary" size="medium" onClick={save} disabled={saving || !crop} type="button">
          {saving ? 'Đang cắt…' : 'Lưu khung slider'}
        </Button>
        <Button
          buttonStyle="secondary"
          size="medium"
          type="button"
          onClick={() => doc.width && doc.height && setCrop(fullWidthCrop(doc.width, doc.height))}
        >
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

export default SliderCropField
