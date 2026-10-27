'use client'

import { useField } from '@payloadcms/ui'
import React from 'react'

type Props = {
  path: string
  field: { maxLength?: number; admin?: { description?: unknown } }
}

/**
 * Dòng mô tả dưới ô chữ có giới hạn độ dài (gắn qua `limit()` trong src/fields/limits.ts): mô tả sẵn có của ô (nếu có)
 * + bộ đếm "45/80 ký tự", chuyển đỏ và báo dư bao nhiêu khi vượt. Payload chỉ báo lỗi lúc lưu, đếm sẵn để khỏi bất ngờ.
 */
export const CharCountDescription: React.FC<Props> = ({ field, path }) => {
  const { value } = useField<string>({ path })
  const max = field.maxLength
  const length = typeof value === 'string' ? value.length : 0
  const over = max ? length - max : 0
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className={`field-description char-count field-description-${path.replace(/\./g, '__')}`}>
      {description && <span>{description}</span>}
      {max ? (
        <span className={over > 0 ? 'char-count__n char-count__n--over' : 'char-count__n'} aria-live="polite">
          {length}/{max} ký tự{over > 0 ? `, dài hơn ${over} ký tự` : ''}
        </span>
      ) : null}
    </div>
  )
}

export default CharCountDescription
