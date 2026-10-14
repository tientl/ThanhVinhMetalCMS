import { NextResponse, type NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { clientIp, rateLimit } from '@/lib/rateLimit'
import { isBot, readStats, recordVisit, todayVN, touchOnline } from '@/lib/visitors'

export const dynamic = 'force-dynamic'

/**
 * Ghi nhận một lượt truy cập. Mỗi người tính một lượt mỗi ngày (cookie tv_day),
 * "đang online" theo cookie tv_id trong 5 phút gần nhất. Bỏ qua bot, chặn gọi dồn dập từ một IP.
 */
export async function POST(req: NextRequest) {
  const payload = await getPayloadClient()
  const day = todayVN()
  const res = NextResponse.json({ ok: true })

  const allowed = rateLimit(`visit:${clientIp(req)}`, 30, 60 * 1000)
  if (allowed && !isBot(req.headers.get('user-agent'))) {
    const existingId = req.cookies.get('tv_id')?.value
    const id = existingId || crypto.randomUUID()
    if (!existingId) res.cookies.set('tv_id', id, { maxAge: 365 * 24 * 3600, sameSite: 'lax', path: '/' })
    touchOnline(id)
    if (req.cookies.get('tv_day')?.value !== day) {
      await recordVisit(payload)
      res.cookies.set('tv_day', day, { maxAge: 36 * 3600, sameSite: 'lax', path: '/' })
    }
  }

  const stats = await readStats(payload)
  return NextResponse.json(stats, { headers: res.headers })
}
