import { APIError, type CollectionBeforeDeleteHook } from 'payload'

const NOUN = { products: 'sản phẩm', posts: 'bài viết' } as const
const TITLE = { products: 'name', posts: 'title' } as const

/**
 * Không cho xóa danh mục khi còn sản phẩm / bài viết (kể cả bản nháp) đang gắn. Xóa thì các mục đó mất danh mục
 * (ô bắt buộc) mà vẫn đang xuất bản; trang chi tiết từng lỗi 500 vì đọc tên danh mục từ null (26/10/2026).
 * Báo rõ số lượng và vài tên để Quản trị chuyển sang danh mục khác trước.
 */
export const blockDeleteWhileUsed =
  (target: 'products' | 'posts'): CollectionBeforeDeleteHook =>
  async ({ collection, id, req }) => {
    const { docs, totalDocs } = await req.payload.find({
      collection: target,
      where: { category: { equals: id } },
      limit: 3,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (totalDocs === 0) return

    const category = (await req.payload.findByID({ collection: collection.slug, id, depth: 0, overrideAccess: true, req })) as {
      name?: string
    }
    const names = docs.map((d) => `"${(d as unknown as Record<string, unknown>)[TITLE[target]] || `ID ${d.id}`}"`).join(', ')
    const more = totalDocs > docs.length ? `, … và ${totalDocs - docs.length} ${NOUN[target]} khác` : ''
    throw new APIError(
      `Không xóa được danh mục "${category.name ?? id}": còn ${totalDocs} ${NOUN[target]} đang dùng (${names}${more}). ` +
        `Chuyển các ${NOUN[target]} này sang danh mục khác rồi xóa lại.`,
      400,
      undefined,
      true,
    )
  }
