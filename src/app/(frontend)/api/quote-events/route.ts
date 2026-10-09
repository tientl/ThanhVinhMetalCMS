import { getPayloadClient } from '@/lib/payload'
import { quoteEvents } from '@/lib/quoteEvents'

export const dynamic = 'force-dynamic'

const HEARTBEAT_MS = 25_000

/**
 * SSE: đẩy số yêu cầu báo giá "Mới" xuống admin ngay khi có thay đổi.
 * Chỉ admin/editor đã đăng nhập (cookie payload-token) mới kết nối được.
 */
export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && 'role' in user ? (user.role as string) : null
  if (!user || (role !== 'admin' && role !== 'editor')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const count = async () => (await payload.count({ collection: 'quote-requests', where: { status: { equals: 'new' } } })).totalDocs

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      const push = async () => {
        try {
          send({ count: await count() })
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

      quoteEvents.on('change', push)
      req.signal.addEventListener('abort', () => {
        quoteEvents.off('change', push)
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
