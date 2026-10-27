import type { FieldHook, TextField } from 'payload'

import { toSlug } from '@/utilities/unaccent'

/**
 * Field slug không dấu, tự sinh từ `fieldToUse` khi để trống.
 * `urlPrefix`: phần đường dẫn đứng trước slug trên website (ví dụ `/san-pham/danh-muc/`); ô trong admin
 * hiện tiền tố này màu xám, không sửa được, kèm nút chép cả đường dẫn (`SlugField`).
 */
export const slugField = (
  fieldToUse = 'title',
  overrides: Partial<Pick<TextField, 'label' | 'required' | 'admin'>> = {},
  options: { autoSuffixOnCreate?: boolean; urlPrefix?: string } = {},
): TextField => {
  const formatSlug: FieldHook = async ({ value, data, operation, collection, req }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return toSlug(value)
    }
    if (operation === 'create' || !value) {
      const source = data?.[fieldToUse]
      if (typeof source === 'string' && source.trim() !== '') {
        const base = toSlug(source)
        if (!base || !options.autoSuffixOnCreate || operation !== 'create' || !collection) {
          return base
        }

        let candidate = base
        let suffix = 2
        while (true) {
          const existing = await req.payload.find({
            collection: collection.slug,
            where: { slug: { equals: candidate } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (existing.totalDocs === 0) return candidate
          candidate = `${base}-${suffix++}`
        }
      }
    }
    return value
  }

  return {
    name: 'slug',
    type: 'text',
    label: 'Đường dẫn (slug)',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      components: {
        Field: {
          path: '@/components/admin/SlugField#SlugField',
          clientProps: { prefix: options.urlPrefix ?? '/', sourceField: fieldToUse },
        },
      },
      description: options.autoSuffixOnCreate
        ? 'Để trống sẽ tự tạo từ tên; nếu trùng sẽ thêm -2, -3… Slug tự nhập phải là duy nhất.'
        : 'Để trống sẽ tự tạo từ tiêu đề, không dấu, cách nhau bằng dấu gạch ngang.',
    },
    hooks: {
      beforeValidate: [formatSlug],
    },
    ...overrides,
  }
}
