'use client'

import type { UIFieldClientProps } from 'payload'

import { useConfig, useForm, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useRef, useState } from 'react'

const MAX_POINTS = 5

type Point = { x: number; y: number; label: string }

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10

/**
 * Đặt "Điểm chấm trên ảnh" bằng chuột: bấm vào ảnh để thêm chấm, kéo chấm để dời, ✕ để xóa.
 * Ghi thẳng vào các ô % trái, % trên của mảng hotspots cùng tab; nhãn gõ ở ô bên dưới.
 */
export const HotspotPicker = ({ path }: UIFieldClientProps) => {
  const parent = path.slice(0, path.lastIndexOf('.'))
  const imagePath = `${parent}.image`
  const hotspotsPath = `${parent}.hotspots`

  const { config } = useConfig()
  const { addFieldRow, dispatchFields, removeFieldRow, setModified } = useForm()

  const imageId = useFormFields(([fields]) => fields[imagePath]?.value as number | string | undefined)
  const points = useFormFields(([fields]) => {
    const rows = fields[hotspotsPath]?.rows ?? []
    return rows.map((_, i) => ({
      x: Number(fields[`${hotspotsPath}.${i}.x`]?.value ?? 0),
      y: Number(fields[`${hotspotsPath}.${i}.y`]?.value ?? 0),
      label: String(fields[`${hotspotsPath}.${i}.label`]?.value ?? ''),
    })) as Point[]
  })

  // Ảnh đã tải, kèm id để đổi ảnh thì không hiện nhầm ảnh cũ
  const [loaded, setLoaded] = useState<{ id: number | string; url: string | null } | null>(null)
  const imageUrl = loaded && loaded.id === imageId ? loaded.url : null
  const boxRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<number | null>(null)

  useEffect(() => {
    if (!imageId) return
    let cancelled = false
    fetch(`${config.routes.api}/media/${imageId}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        if (cancelled) return
        setLoaded({ id: imageId, url: doc?.sizes?.card?.url || doc?.url || null })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [imageId, config.routes.api])

  const toPercent = (e: { clientX: number; clientY: number }) => {
    const rect = boxRef.current!.getBoundingClientRect()
    return { x: clamp(((e.clientX - rect.left) / rect.width) * 100), y: clamp(((e.clientY - rect.top) / rect.height) * 100) }
  }

  const update = (i: number, p: { x: number; y: number }) => {
    dispatchFields({ type: 'UPDATE', path: `${hotspotsPath}.${i}.x`, value: p.x })
    dispatchFields({ type: 'UPDATE', path: `${hotspotsPath}.${i}.y`, value: p.y })
    setModified(true)
  }

  const onBoxClick = (e: React.MouseEvent) => {
    if (dragging.current !== null || points.length >= MAX_POINTS) return
    const p = toPercent(e)
    addFieldRow({
      path: hotspotsPath,
      schemaPath: 'applications.hotspots',
      subFieldState: {
        x: { initialValue: p.x, valid: true, value: p.x },
        y: { initialValue: p.y, valid: true, value: p.y },
        label: { initialValue: '', valid: true, value: '' },
      },
    })
  }

  const onDotDown = (i: number) => (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = i
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* một số trình duyệt không hỗ trợ, kéo vẫn chạy trong vùng ảnh */
    }
  }
  const onDotMove = (i: number) => (e: React.PointerEvent) => {
    if (dragging.current !== i) return
    update(i, toPercent(e))
  }
  const onDotUp = () => {
    // Chờ một nhịp để click của ảnh không bị tính là thêm chấm mới
    setTimeout(() => (dragging.current = null), 0)
  }

  if (!imageId) {
    return <p className="hotspot-picker__hint">Chọn ảnh ở ô &quot;Ảnh&quot; phía trên, sau đó bấm vào ảnh để đặt điểm chấm.</p>
  }

  return (
    <div className="hotspot-picker">
      <p className="hotspot-picker__hint">
        Bấm vào ảnh để thêm chấm (tối đa {MAX_POINTS}), kéo chấm để dời, bấm ✕ để xóa. Nhãn gõ ở danh sách bên dưới.
      </p>
      <div className="hotspot-picker__box" ref={boxRef} onClick={onBoxClick} role="presentation">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" draggable={false} />
        ) : (
          <div className="hotspot-picker__loading">Đang tải ảnh…</div>
        )}
        {points.map((p, i) => (
          <div
            key={i}
            className="hotspot-picker__dot"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onPointerDown={onDotDown(i)}
            onPointerMove={onDotMove(i)}
            onPointerUp={onDotUp}
            onPointerCancel={onDotUp}
            onClick={(e) => e.stopPropagation()}
            title={`${p.x}% trái, ${p.y}% trên`}
          >
            <span className="hotspot-picker__num">{i + 1}</span>
            {p.label && <span className="hotspot-picker__label">{p.label}</span>}
            <button
              type="button"
              className="hotspot-picker__remove"
              aria-label={`Xóa điểm ${i + 1}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                removeFieldRow({ path: hotspotsPath, rowIndex: i })
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HotspotPicker
