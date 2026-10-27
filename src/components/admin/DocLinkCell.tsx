'use client'

import { useConfig, useListDrawerContext } from '@payloadcms/ui'
import type { CollectionSlug, DefaultCellComponentProps } from 'payload'

import Link from 'next/link'
import React from 'react'

/**
 * Ô tên trong danh sách luôn bấm được để mở trang sửa.
 * Payload chỉ gắn link vào cột đầu tiên; cột "Ảnh" đứng trước nên cột tên cần tự gắn.
 *
 * Trong khung chọn (chèn "Mối quan hệ" trong ô soạn thảo, các ô chọn mở danh sách) thì bấm tên là **chọn** mục đó,
 * giống ô mặc định của Payload (`RenderDefaultCell` gọi `onSelect` của `useListDrawerContext`). Trước 26/10/2026 ô này
 * luôn là link: bấm tên trong khung chọn thì chuyển sang trang sửa, Payload hỏi "Thay đổi chưa được lưu", không chèn được.
 */
export const DocLinkCell: React.FC<DefaultCellComponentProps> = ({ cellData, collectionSlug, rowData }) => {
  const { drawerSlug, onSelect } = useListDrawerContext()
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()

  const text = cellData == null || cellData === '' ? `#${rowData?.id ?? ''}` : String(cellData)
  if (!rowData?.id) return <span>{text}</span>

  if (drawerSlug && typeof onSelect === 'function') {
    return (
      <button
        type="button"
        className="doc-link-cell doc-link-cell--select"
        onClick={() => onSelect({ collectionSlug: collectionSlug as CollectionSlug, doc: rowData, docID: String(rowData.id) })}
      >
        {text}
      </button>
    )
  }

  return (
    <Link href={`${admin}/collections/${collectionSlug}/${rowData.id}`} prefetch={false} className="doc-link-cell">
      {text}
    </Link>
  )
}

export default DocLinkCell
