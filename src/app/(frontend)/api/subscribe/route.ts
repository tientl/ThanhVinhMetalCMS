import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { clientIp, rateLimit } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!rateLimit(`subscribe:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Bạn gửi quá nhiều lần, vui lòng thử lại sau.' }, { status: 429 })
  }

  let body: { email?: unknown; source?: unknown; website?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
  }
  if (typeof body.website === 'string' && body.website) return NextResponse.json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 120) : ''
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Email không hợp lệ.' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const existing = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
  if (existing.totalDocs > 0) {
    return NextResponse.json({ ok: true, message: 'Email này đã đăng ký trước đó.' })
  }
  await payload.create({
    collection: 'subscribers',
    data: { email, source: typeof body.source === 'string' ? body.source.slice(0, 200) : undefined },
    overrideAccess: true,
  })
  return NextResponse.json({ ok: true, message: 'Đã đăng ký nhận bản tin. Cảm ơn bạn!' })
}
