import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { revalidatePath as nextRevalidatePath } from 'next/cache'

/** revalidatePath chỉ chạy trong request của Next; từ script (seed, payload run) nó ném lỗi, bỏ qua là đủ. */
const revalidatePath = (path: string, type?: 'layout' | 'page') => {
  try {
    nextRevalidatePath(path, type)
  } catch {
    /* ngoài Next, không có cache để làm mới */
  }
}

type Doc = { id: number | string; slug?: string | null; _status?: string | null }

/**
 * Làm mới cache Next.js khi nội dung thay đổi.
 * `paths(doc)` trả về các đường dẫn cần làm mới ngoài trang chủ.
 */
export const revalidateCollection =
  (paths: (doc: Doc) => string[]): CollectionAfterChangeHook<Doc> =>
  ({ doc, previousDoc, req: { payload, context } }) => {
    if (context.disableRevalidate) return doc

    const targets = new Set<string>(['/'])
    paths(doc).forEach((p) => targets.add(p))
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      paths(previousDoc).forEach((p) => targets.add(p))
    }
    targets.forEach((p) => {
      payload.logger.info(`Làm mới cache: ${p}`)
      revalidatePath(p)
    })
    return doc
  }

export const revalidateCollectionDelete =
  (paths: (doc: Doc) => string[]): CollectionAfterDeleteHook<Doc> =>
  ({ doc, req: { context } }) => {
    if (context.disableRevalidate) return doc
    ;['/', ...paths(doc)].forEach((p) => revalidatePath(p))
    return doc
  }

/** Globals (menu, thông tin công ty, trang chủ) ảnh hưởng mọi trang. */
export const revalidateAll: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Làm mới cache toàn bộ trang')
    revalidatePath('/', 'layout')
  }
  return doc
}

/** Collection ảnh hưởng mọi trang (ảnh có thể dùng ở bất kỳ đâu). */
export const revalidateAllCollection: CollectionAfterChangeHook = ({ doc, operation, req: { payload, context } }) => {
  if (!context.disableRevalidate && operation === 'update') {
    payload.logger.info('Làm mới cache toàn bộ trang')
    revalidatePath('/', 'layout')
  }
  return doc
}
