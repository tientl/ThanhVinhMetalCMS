import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

const ONLINE_WINDOW_MS = 5 * 60 * 1000

/* Người đang online: id khách -> lần thấy cuối. Giữ trong bộ nhớ, đủ dùng cho 1 tiến trình. */
const g = globalThis as unknown as { __online?: Map<string, number> }
const online = g.__online ?? (g.__online = new Map())

const ONLINE_MAX = 5000

export const touchOnline = (id: string) => {
  const now = Date.now()
  online.set(id, now)
  if (online.size > ONLINE_MAX) {
    for (const [k, t] of online) if (now - t > ONLINE_WINDOW_MS) online.delete(k)
    // vẫn quá đông (bị bơm id giả) thì bỏ các mục cũ nhất
    for (const k of online.keys()) {
      if (online.size <= ONLINE_MAX) break
      online.delete(k)
    }
  }
}

export const countOnline = () => {
  const now = Date.now()
  let n = 0
  for (const t of online.values()) if (now - t <= ONLINE_WINDOW_MS) n++
  return n
}

/** Ngày theo giờ Việt Nam, dạng YYYY-MM-DD, để reset "hôm nay" đúng nửa đêm. */
export const todayVN = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor/i
export const isBot = (ua: string | null) => !ua || BOT_RE.test(ua)

/** Tăng bộ đếm một lượt (tổng + hôm nay), reset "hôm nay" khi sang ngày mới. Một câu SQL, không bị đua. */
export const recordVisit = async (payload: Payload) => {
  const day = todayVN()
  const run = () =>
    payload.db.drizzle.execute(sql`
      update visitor_stats set
        total = coalesce(total, 0) + 1,
        today = case when today_date = ${day} then coalesce(today, 0) + 1 else 1 end,
        today_date = ${day}
    `)
  const res = await run()
  if ((res as { rowCount?: number }).rowCount === 0) {
    // Database mới chưa có dòng của global: tạo rồi đếm lại
    await payload.updateGlobal({ slug: 'visitor-stats', data: { total: 0, today: 0 }, overrideAccess: true })
    await run()
  }
}

export const readStats = async (payload: Payload) => {
  const s = await payload.findGlobal({ slug: 'visitor-stats', depth: 0 })
  const today = s.todayDate === todayVN() ? (s.today ?? 0) : 0
  return { showInFooter: s.showInFooter !== false, total: s.total ?? 0, today, online: countOnline() }
}
