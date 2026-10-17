'use client'

import { useAuth } from '@payloadcms/ui'
import React from 'react'

/** Cạnh nút Lưu (sản phẩm, bài viết, trang tĩnh): nhắc Nhân viên rằng mình chỉ lưu nháp, Quản trị sẽ duyệt và xuất bản. */
export const EditorDraftNotice = () => {
  const { user } = useAuth()
  const role = user && 'role' in user ? user.role : null
  if (role !== 'editor') return null
  return (
    <span className="editor-draft-notice" title="Quản trị duyệt nội dung rồi mới xuất bản lên website">
      Chỉ lưu nháp, chờ Quản trị duyệt
    </span>
  )
}

export default EditorDraftNotice
