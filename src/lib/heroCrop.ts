import { existsSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'
import sharp from 'sharp'

import { MEDIA_DIR } from '@/lib/mediaDir'

export const HERO_W = 2400
export const HERO_H = 1200

/** Vùng cắt tính theo % kích thước ảnh gốc (x, y là góc trên trái). */
export type HeroCrop = { x: number; y: number; width: number; height: number }

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

/**
 * Cắt ảnh gốc theo vùng khách chọn, thu về 2400x1200, ghi đè cỡ "hero" của bản ghi media
 * và đặt điểm lấy nét vào tâm vùng cắt để các cỡ khác cùng hướng.
 */
export const applyHeroCrop = async (payload: Payload, id: number | string, crop: HeroCrop) => {
  const media = await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
  if (!media.filename || !media.width || !media.height || !media.mimeType?.startsWith('image/')) {
    throw new Error('Bản ghi không phải ảnh')
  }
  const dir = MEDIA_DIR
  const src = path.join(dir, media.filename)

  // Đổi % sang pixel, ép đúng tỉ lệ 2:1 và nằm trong ảnh
  let width = clamp(Math.round((crop.width / 100) * media.width), 10, media.width)
  let height = Math.round(width / 2)
  if (height > media.height) {
    height = media.height
    width = height * 2
  }
  const left = clamp(Math.round((crop.x / 100) * media.width), 0, media.width - width)
  const top = clamp(Math.round((crop.y / 100) * media.height), 0, media.height - height)

  // Tên file mới mỗi lần cắt để trình duyệt, Next và Nginx không dùng lại bản cache cũ
  const base = media.filename.replace(/\.[^.]+$/, '')
  const outName = `${base}-${HERO_W}x${HERO_H}-${Date.now().toString(36)}.webp`
  await sharp(src).extract({ left, top, width, height }).resize(HERO_W, HERO_H).webp().toFile(path.join(dir, outName))
  const filesize = statSync(path.join(dir, outName)).size
  const oldName = media.sizes?.hero?.filename
  if (oldName && oldName !== outName && existsSync(path.join(dir, oldName))) {
    try {
      unlinkSync(path.join(dir, oldName))
    } catch {
      /* file cũ đang bận, bỏ qua */
    }
  }

  const focalX = Math.round(((left + width / 2) / media.width) * 100)
  const focalY = Math.round(((top + height / 2) / media.height) * 100)

  await payload.update({
    collection: 'media',
    id,
    data: {
      focalX,
      focalY,
      heroCrop: { x: (left / media.width) * 100, y: (top / media.height) * 100, width: (width / media.width) * 100, height: (height / media.height) * 100 },
      sizes: { hero: { filename: outName, width: HERO_W, height: HERO_H, mimeType: 'image/webp', filesize, url: `/api/media/file/${encodeURIComponent(outName)}` } },
    },
    overrideAccess: true,
  })
  return { url: `/api/media/file/${encodeURIComponent(outName)}`, focalX, focalY }
}
