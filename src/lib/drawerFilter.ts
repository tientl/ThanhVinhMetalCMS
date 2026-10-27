import type { ServerFunctionClientArgs, Where } from 'payload'

/** Collection có bản nháp: trong khung chọn chỉ nên thấy bản đang hiện trên web. */
const DRAFTABLE = new Set(['products', 'posts', 'pages'])

/**
 * Khung chọn (list drawer) của sản phẩm, bài viết, trang tĩnh chỉ liệt kê bản đã xuất bản.
 *
 * Vì sao chặn ở đây: chèn "Mối quan hệ" trong ô soạn thảo mở khung chọn của Lexical, mà `RelationshipFeature` không có
 * tùy chọn lọc; `admin.baseFilter` của collection thì áp cả danh sách thường (Quản trị cần thấy bản nháp ở đó).
 * Mọi khung chọn tải danh sách qua server function `render-list` kèm `drawerSlug`; danh sách thường thì không đi qua đây.
 * Gọi trong `serverFunction` của `src/app/(payload)/layout.tsx` (26/10/2026).
 * Bản đang bán mà có bản nháp mới chưa xuất bản vẫn hiện (`_status` của bản chính vẫn là published).
 */
export const publishedOnlyInDrawers = (fn: ServerFunctionClientArgs): ServerFunctionClientArgs => {
  if (fn.name !== 'render-list') return fn
  const args = fn.args as { collectionSlug?: string; drawerSlug?: string; query?: { where?: Where } & Record<string, unknown> }
  if (!args.drawerSlug || !args.collectionSlug || !DRAFTABLE.has(args.collectionSlug)) return fn

  const published: Where = { _status: { equals: 'published' } }
  const where: Where = args.query?.where ? { and: [args.query.where, published] } : published
  return { ...fn, args: { ...args, query: { ...args.query, where } } }
}
