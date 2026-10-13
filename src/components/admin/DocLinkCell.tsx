import type { DefaultServerCellComponentProps } from 'payload'

import Link from 'next/link'
import React from 'react'

/**
 * Ô tên trong danh sách luôn bấm được để mở trang sửa.
 * Payload chỉ gắn link vào cột đầu tiên; cột "Ảnh" đứng trước nên cột tên cần tự gắn.
 */
export const DocLinkCell = ({ cellData, collectionSlug, payload, rowData }: DefaultServerCellComponentProps) => {
  const text = cellData == null || cellData === '' ? `#${rowData?.id ?? ''}` : String(cellData)
  if (!rowData?.id) return <span>{text}</span>
  return (
    <Link href={`${payload.config.routes.admin}/collections/${collectionSlug}/${rowData.id}`} prefetch={false} className="doc-link-cell">
      {text}
    </Link>
  )
}

export default DocLinkCell
