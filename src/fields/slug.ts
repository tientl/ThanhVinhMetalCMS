import type { FieldHook, TextField } from 'payload'

import { toSlug } from '@/utilities/unaccent'

/**
 * Field slug không dấu, tự sinh từ `fieldToUse` khi để trống.
 */
export const slugField = (
  fieldToUse = 'title',
  overrides: Partial<Pick<TextField, 'label' | 'required' | 'admin'>> = {},
): TextField => {
  const formatSlug: FieldHook = ({ value, data, operation }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return toSlug(value)
    }
    if (operation === 'create' || !value) {
      const source = data?.[fieldToUse]
      if (typeof source === 'string' && source.trim() !== '') {
        return toSlug(source)
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
      description: 'Để trống sẽ tự tạo từ tiêu đề, không dấu, cách nhau bằng dấu gạch ngang.',
    },
    hooks: {
      beforeValidate: [formatSlug],
    },
    ...overrides,
  }
}
