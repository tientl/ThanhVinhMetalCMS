import type { CollectionBeforeChangeHook, TextField } from 'payload'

import { normalizeSearch } from '@/utilities/unaccent'

/**
 * Field ẩn chứa bản không dấu của các trường cần tìm kiếm.
 */
export const searchTextField: TextField = {
  name: 'searchText',
  type: 'text',
  index: true,
  admin: { hidden: true },
}

type Options = {
  /** Các field text của chính document. */
  fields: string[]
  /** Field relationship và collection đích, lấy thêm `name` của bản ghi liên quan. */
  relation?: { field: string; collection: 'product-categories' | 'post-categories' }
}

export const buildSearchText =
  ({ fields, relation }: Options): CollectionBeforeChangeHook =>
  async ({ data, req }) => {
    const parts = fields.map((key) => {
      const value = data?.[key]
      return typeof value === 'string' ? value : ''
    })
    if (relation) {
      const raw = data?.[relation.field]
      const id = raw && typeof raw === 'object' ? raw.id : raw
      if (id) {
        try {
          const doc = await req.payload.findByID({ collection: relation.collection, id, depth: 0 })
          if (doc?.name) parts.push(doc.name)
        } catch {
          // Danh mục không tồn tại: bỏ qua
        }
      }
    }
    data.searchText = normalizeSearch(parts.join(' '))
    return data
  }
