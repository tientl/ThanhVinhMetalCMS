'use client'

import { Button, useDocumentInfo, useEditDepth, useForm, useFormModified } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Nút "Hủy" cạnh nút Lưu: luôn bấm được.
 * Nếu form có thay đổi thì hỏi một lần rồi bỏ thay đổi, sau đó quay về trang trước.
 * Không mở từ trang nào (vào thẳng bằng URL) thì về danh sách hoặc bảng điều khiển.
 */
export const CancelButton = () => {
  const { collectionSlug, initialData } = useDocumentInfo()
  const { reset, setModified } = useForm()
  const modified = useFormModified()
  const router = useRouter()
  const editDepth = useEditDepth()

  const onClick = async () => {
    if (modified) {
      if (!window.confirm('Bỏ các thay đổi chưa lưu?')) return
      if (initialData) await reset(initialData)
      setModified(false)
    }

    if (window.history.length > 1) {
      router.back()
    } else if (collectionSlug) {
      router.push(`/admin/collections/${collectionSlug}`)
    } else {
      router.push('/admin')
    }
  }

  // Trong hộp thoại (mở từ ô quan hệ hay tệp đính kèm) đã có nút đóng, quay lui sẽ rời khỏi trang đang sửa
  if (editDepth > 1) return null

  return (
    <Button buttonStyle="secondary" size="medium" onClick={onClick} type="button">
      Hủy
    </Button>
  )
}

export default CancelButton
