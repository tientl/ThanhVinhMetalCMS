import { APIError, restoreVersionOperation, type CollectionBeforeOperationHook, type CollectionSlug, type Endpoint } from 'payload'

import { sameContent } from '@/lib/versions'

export const NOOP_RESTORE_MESSAGE = 'Phiên bản này giống hệt nội dung hiện tại, không cần khôi phục.'

/**
 * Không cho khôi phục phiên bản giống hệt phiên bản mới nhất: khôi phục như vậy chẳng đổi gì mà còn đẻ thêm
 * một phiên bản trùng. Gắn vào `hooks.beforeOperation` của mọi collection có `versions`.
 * So với phiên bản mới nhất (theo updatedAt) chứ không với document: collection có nháp thì bản mới nhất
 * là bản đang mở trong trang sửa; không có nháp thì nó trùng nội dung hiện tại.
 * Trang quản trị cũng ẩn nút khôi phục trong trường hợp này (src/components/admin/VersionRestoreGuard.tsx).
 */
// Dùng chung cho mọi collection có versions nên để kiểu slug rộng
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockNoopRestore: CollectionBeforeOperationHook<any> = async ({ args, collection, operation, req }) => {
  if (operation !== 'restoreVersion') return args
  const versionId = (args as { id?: number | string }).id
  if (!versionId) return args
  const slug = collection.slug as CollectionSlug

  const version = await req.payload.findVersionByID({ collection: slug, id: String(versionId), depth: 0, req })
  const parent = version.parent as unknown as number | string | { id: number | string } | null
  const parentId = parent && typeof parent === 'object' ? parent.id : parent
  if (!parentId) return args

  const { docs } = await req.payload.findVersions({
    collection: slug,
    where: { parent: { equals: parentId } },
    // Khôi phục giữ createdAt của bản được khôi phục, nên "mới nhất" phải tính theo updatedAt
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
    req,
  })
  const latest = docs[0]
  if (!latest) return args
  if (
    String(latest.id) === String(version.id) ||
    sameContent(version.version as unknown as Record<string, unknown>, latest.version as unknown as Record<string, unknown>)
  ) {
    throw new APIError(NOOP_RESTORE_MESSAGE, 400, undefined, true)
  }
  return args
}

/**
 * Trang "Danh sách phiên bản" tự làm (src/components/admin/VersionsList.tsx): sắp theo thời gian lưu, đánh số lần lưu,
 * ghi các ô đã đổi. Gắn vào `admin.components.views.edit.versions` của mọi collection có `versions`.
 */
export const VERSIONS_LIST_VIEW = { Component: '@/components/admin/VersionsList#VersionsList' }

/**
 * Khôi phục phiên bản (POST /api/<collection>/versions/:id), thay endpoint mặc định của Payload (endpoint tự khai báo
 * được xét trước). Khác bản gốc một điểm: phiên bản là BẢN NHÁP thì khôi phục dưới dạng nháp.
 *
 * Vì sao: nút "Khôi phục về phiên bản này" luôn gửi ?draft=false, Payload chỉ cho chọn "khôi phục dưới dạng nháp"
 * khi phiên bản KHÔNG phải nháp. Với draft=false, Payload kiểm tra mọi ô bắt buộc như khi xuất bản, nên bản nháp chưa đủ
 * (thiếu ảnh bìa, dòng ảnh trống...) không khôi phục được, chỉ báo "Đã xảy ra vấn đề khi khôi phục phiên bản này".
 * Khôi phục dưới dạng nháp: nội dung về lại trang sửa như một bản nháp, bản đang xuất bản trên web không đổi.
 * Gắn vào `endpoints` của collection có nháp (sản phẩm, bài viết, trang tĩnh).
 */
export const restoreVersionEndpoint: Endpoint = {
  path: '/versions/:id',
  method: 'post',
  handler: async (req) => {
    const slug = req.routeParams?.collection as CollectionSlug | undefined
    const id = req.routeParams?.id as string | undefined
    if (!slug || !id) throw new APIError('Thiếu collection hoặc id phiên bản.', 400, undefined, true)

    const version = await req.payload.findVersionByID({ collection: slug, id, depth: 0, overrideAccess: false, req })
    const isDraftVersion = (version.version as { _status?: string } | undefined)?._status === 'draft'
    const draft = req.searchParams.get('draft') === 'true' || isDraftVersion

    const depth = req.searchParams.get('depth')
    // Gọi thẳng operation như endpoint gốc: payload.restoreVersion (Local API) bỏ qua tham số draft.
    // overrideAccess mặc định false: vẫn kiểm tra quyền như REST.
    const doc = await restoreVersionOperation({
      id,
      collection: req.payload.collections[slug]!,
      depth: depth ? Number(depth) : undefined,
      draft,
      req,
    })
    return Response.json({ doc, message: req.t('version:restoredSuccessfully') }, { status: 200 })
  },
}
