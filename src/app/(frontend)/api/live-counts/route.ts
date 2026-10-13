import { NextResponse } from 'next/server'

import { getLiveCounts, liveEvents } from '@/lib/liveEvents'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const HEARTBEAT_MS = 25_000

/**
 * Số liệu realtime cho trang quản trị: yêu cầu báo giá "Mới", đăng ký bản tin (tổng và hôm nay).
 * `?stream=1`: SSE, đẩy số mới ngay khi có thay đổi. Không có tham số: trả JSON một lần, dùng cho thăm dò dự phòng.
 * Chỉ admin/editor đã đăng nhập (cookie payload-token) mới gọi được.
 */
export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && 'role' in user ? (user.role as string) : null
  if (!user || (role !== 'admin' && role !== 'editor')) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (new URL(req.url).searchParams.get('stream') !== '1') {
    return NextResponse.json(await getLiveCounts(payload), { headers: { 'Cache-Control': 'no-store' } })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      const push = async () => {
        try {
          send(await getLiveCounts(payload))
        } catch {
          /* kết nối đã đóng */
        }
      }
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          /* kết nối đã đóng */
        }
      }, HEARTBEAT_MS)

      liveEvents.on('change', push)
      req.signal.addEventListener('abort', () => {
        liveEvents.off('change', push)
        clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          /* đã đóng */
        }
      })
      await push()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
