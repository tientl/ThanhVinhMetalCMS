import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { QUOTE_FILE_EXTENSIONS, QUOTE_FILE_MAX_BYTES } from '@/lib/quoteFiles'
import { clientIp, rateLimit } from '@/lib/rateLimit'
import { unaccent } from '@/utilities/unaccent'

const text = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const PHONE_RE = /^[0-9+().\s-]{8,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!rateLimit(`quote:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Bạn gửi quá nhiều lần, vui lòng thử lại sau 1 giờ.' }, { status: 429 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
  }

  // Bẫy bot
  if (text(form.get('website'), 10)) {
    return NextResponse.json({ ok: true })
  }

  const name = text(form.get('name'), 120)
  const phone = text(form.get('phone'), 20)
  const email = text(form.get('email'), 120)
  const company = text(form.get('company'), 120)
  const message = text(form.get('message'), 3000)
  const source = text(form.get('source'), 200)

  if (name.length < 2) return NextResponse.json({ ok: false, error: 'Vui lòng nhập họ tên.' }, { status: 400 })
  if (!PHONE_RE.test(phone)) return NextResponse.json({ ok: false, error: 'Số điện thoại không hợp lệ.' }, { status: 400 })
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: 'Email không hợp lệ.' }, { status: 400 })

  const payload = await getPayloadClient()
  let attachment: number | undefined

  const file = form.get('attachment')
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!QUOTE_FILE_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ ok: false, error: 'Chỉ nhận tệp DXF, DWG, PDF, JPG, PNG, WEBP.' }, { status: 400 })
    }
    if (file.size > QUOTE_FILE_MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'Tệp vượt quá 10 MB.' }, { status: 400 })
    }
    // Tên lưu trên máy chủ: bỏ dấu tiếng Việt, thay ký tự lạ bằng gạch dưới; tên gốc giữ ở originalName
    const safeName = unaccent(file.name)
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .slice(-100)
    const uploaded = await payload.create({
      collection: 'quote-files',
      data: { originalName: file.name.slice(0, 200) },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type || 'application/octet-stream',
        name: safeName,
        size: file.size,
      },
      overrideAccess: true,
    })
    attachment = uploaded.id
  }

  await payload.create({
    collection: 'quote-requests',
    data: { name, phone, email: email || undefined, company, message, attachment, source, ip, status: 'new' },
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true })
}
