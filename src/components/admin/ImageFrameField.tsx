'use client'

import type { JSONFieldClientProps, UIFieldClientProps } from 'payload'

import { Button, toast, useConfig, useField, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import ReactCrop, { type PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { parseFrame, type ImageFrame } from '@/lib/frame'

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

type Props = (UIFieldClientProps | JSONFieldClientProps) & {
  /** Tỉ lệ khung (rộng / cao), ví dụ 2 cho 2:1, 1 cho vuông */
  aspect?: number
  /**
   * 'hero' (ô ui của slide): server cắt cứng cỡ slider 2400×1200 theo khung.
   * 'focal' (ô json `imageFrame`): lưu vùng chọn cho riêng ô này cùng trang chủ, web phóng ảnh theo vùng (src/lib/frame.ts).
   */
  mode?: 'hero' | 'focal'
  /** Tên ô ảnh cùng hàng mà khung đọc, mặc định "image" */
  imageField?: string
  title?: string
  hint?: string
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

/** Khung lớn nhất đúng tỉ lệ nằm trong ảnh, tâm ở (cx, cy) %, chặn trong mép ảnh */
const cropAt = (w: number, h: number, aspect: number, cx = 50, cy = 50): PercentCrop => {
  const width = w / h > aspect ? ((aspect * h) / w) * 100 : 100
  const height = w / h > aspect ? 100 : (w / aspect / h) * 100
  return { unit: '%', width, height, x: clamp(cx - width / 2, 0, 100 - width), y: clamp(cy - height / 2, 0, 100 - height) }
}

/** Ảnh đang chọn ở ô `imageField` cùng hàng, tải lại khi `version` đổi */
const useMediaDoc = (path: string, imageField: string, version = 0) => {
  const imagePath = `${path.slice(0, path.lastIndexOf('.'))}.${imageField}`
  const raw = useFormFields(([fields]) => fields[imagePath]?.value as number | string | { id: number } | null | undefined)
  const id = raw && typeof raw === 'object' ? raw.id : raw
  const { config } = useConfig()
  const api = config.routes.api
  const [doc, setDoc] = useState<MediaDoc | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`${api}/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MediaDoc | null) => {
        if (!cancelled && d) setDoc(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api, id, version])

  // doc của ảnh cũ chưa kịp thay thì coi như chưa tải
  const ready = doc && String(doc.id) === String(id) && (doc.mimeType || '').startsWith('image/') && doc.url && doc.width && doc.height
  return { api, id, doc: ready ? (doc as MediaDoc & { url: string; width: number; height: number }) : null }
}

const Editor = ({ src, crop, aspect, onChange, onComplete }: { src: string; crop: PercentCrop; aspect: number; onChange: (c: PercentCrop) => void; onComplete?: (c: PercentCrop) => void }) => (
  <div className="slider-crop__editor">
    <ReactCrop crop={crop} onChange={(_, pc) => onChange(pc)} onComplete={(_, pc) => onComplete?.(pc)} aspect={aspect} keepSelection minWidth={40} ruleOfThirds>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} />
    </ReactCrop>
  </div>
)

const NoImage = () => <p className="slider-crop__hint">Chọn ảnh ở ô trên, sau đó kéo khung để chọn phần muốn giữ.</p>

/** Slide: kéo khung 2:1, bấm "Lưu khung slider" thì server cắt lại cỡ hero (POST /api/media/:id/hero-crop). */
const HeroFrame = ({ path, aspect = 2, imageField = 'image', title, hint }: Props) => {
  const [version, setVersion] = useState(0)
  const { api, id, doc } = useMediaDoc(path, imageField, version)
  const [edit, setEdit] = useState<{ id: number; crop: PercentCrop } | null>(null)
  const [saving, setSaving] = useState(false)

  if (!id) return <NoImage />
  if (!doc) return null
  const crop = edit?.id === doc.id ? edit.crop : doc.heroCrop ? { ...doc.heroCrop, unit: '%' as const } : cropAt(doc.width, doc.height, aspect)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${api}/media/${doc.id}/hero-crop`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: crop.x, y: crop.y, width: crop.width, height: crop.height }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || `HTTP ${res.status}`)
      toast.success('Đã cắt lại ảnh cho slider')
      setVersion((v) => v + 1)
    } catch (e) {
      toast.error(`Không lưu được: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const heroUrl = doc.sizes?.hero?.url ? `${doc.sizes.hero.url}${doc.sizes.hero.url.includes('?') ? '&' : '?'}v=${version}` : null

  return (
    <div className="field-type slider-crop">
      <div className="slider-crop__head">
        <strong>{title ?? 'Khung slider (2:1)'}</strong>
        <span>{hint ?? 'Kéo khung tới phần muốn hiện trên slider trang chủ. Khung giữ tỉ lệ 2:1, kéo góc để thu phóng.'}</span>
      </div>
      <Editor src={doc.url} crop={crop} aspect={aspect} onChange={(c) => setEdit({ id: doc.id, crop: c })} />
      <div className="slider-crop__actions">
        <Button buttonStyle="primary" size="medium" onClick={save} disabled={saving} type="button">
          {saving ? 'Đang lưu…' : 'Lưu khung slider'}
        </Button>
        <Button buttonStyle="secondary" size="medium" type="button" onClick={() => setEdit({ id: doc.id, crop: cropAt(doc.width, doc.height, aspect) })}>
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

/**
 * Ô ảnh trên trang chủ (Bộ sưu tập, Giới thiệu, Giải pháp, Ứng dụng): kéo khung là ghi vùng chọn vào ô `imageFrame`,
 * lưu khi bấm Lưu của trang. Vùng gắn với ô này, không sửa ảnh dùng chung trong "Ảnh và tệp".
 * Chưa chọn vùng thì khung hiện quanh điểm lấy nét của ảnh, gần đúng phần web đang hiện.
 */
const TileFrame = ({ path, aspect = 1, imageField = 'image', title, hint }: Props) => {
  const { id, doc } = useMediaDoc(path, imageField)
  const { value, setValue } = useField<ImageFrame | null>({ path })
  const [edit, setEdit] = useState<{ id: number; crop: PercentCrop } | null>(null)

  if (!id) return <NoImage />
  if (!doc) return null
  const saved = parseFrame(value, doc.id)
  const crop =
    edit?.id === doc.id
      ? edit.crop
      : saved
        ? { unit: '%' as const, x: saved.x, y: saved.y, width: saved.width, height: saved.height }
        : cropAt(doc.width, doc.height, aspect, doc.focalX ?? 50, doc.focalY ?? 50)

  const commit = (c: PercentCrop) => {
    const round = (n: number) => Math.round(n * 100) / 100
    // Bấm vào khung mà không kéo cũng gọi onComplete: vùng không đổi thì không ghi, trang không bị tính là có thay đổi
    const before = edit?.id === doc.id ? null : crop
    if (before && (['x', 'y', 'width', 'height'] as const).every((k) => Math.abs(round(c[k]) - round(before[k])) < 0.01)) return
    setValue({ x: round(c.x), y: round(c.y), width: round(c.width), height: round(c.height), media: doc.id })
  }

  return (
    <div className="field-type slider-crop">
      <div className="slider-crop__head">
        <strong>{title ?? 'Vùng ảnh muốn giữ'}</strong>
        <span>
          {hint ??
            'Kéo khung tới phần muốn hiện, kéo góc để phóng to hay thu nhỏ, rồi bấm Lưu ở đầu trang. Trên web phần trong khung luôn hiện trọn; khung trên web đổi tỉ lệ theo màn hình nên có thể hiện thêm ảnh xung quanh.'}
        </span>
      </div>
      <Editor src={doc.url} crop={crop} aspect={aspect} onChange={(c) => setEdit({ id: doc.id, crop: c })} onComplete={commit} />
      <div className="slider-crop__actions">
        <span className="slider-crop__status">{saved ? 'Đã chọn vùng.' : 'Chưa chọn vùng: web hiện cả ảnh, căn theo điểm lấy nét.'}</span>
        {saved && (
          <Button
            buttonStyle="secondary"
            size="medium"
            type="button"
            onClick={() => {
              setEdit(null)
              setValue(null)
            }}
          >
            Dùng cả ảnh
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Khung chọn vùng ảnh, đặt ngay dưới ô "Ảnh" trong các khối của Trang chủ.
 * Ảnh trong khung hiện đúng tỉ lệ (không viền đen) để % của khung là % của ảnh.
 */
export const ImageFrameField = (props: Props) => (props.mode === 'hero' ? <HeroFrame {...props} /> : <TileFrame {...props} />)

export default ImageFrameField
