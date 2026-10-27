'use client'

import {
  ConfirmationModal,
  FormSubmit,
  toast,
  useConfig,
  useDocumentInfo,
  useForm,
  useFormFields,
  useFormModified,
  useModal,
} from '@payloadcms/ui'
import { useState } from 'react'

type ProductMatch = { id: number | string; name: string }

/** Hỏi xác nhận khi xuất bản một sản phẩm có tên đã được sử dụng. */
export const ProductPublishButton = () => {
  const {
    id,
    hasPublishedDoc,
    hasPublishPermission,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    unpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo()
  const { config } = useConfig()
  const { submit } = useForm()
  const modified = useFormModified()
  const name = useFormFields(([fields]) => fields.name?.value as string | undefined)?.trim() ?? ''
  const { openModal } = useModal()
  const [checking, setChecking] = useState(false)
  const [duplicateName, setDuplicateName] = useState('')
  const modalSlug = `product-duplicate-name-${id ?? 'create'}`

  const publish = async () => {
    const action = `${config.routes.api}/products${id ? `/${id}` : ''}?depth=0`
    const result = await submit({ action, overrides: { _status: 'published' } })
    if (result) {
      setUnpublishedVersionCount(0)
      setMostRecentVersionIsAutosaved(false)
      setHasPublishedDoc(true)
    }
  }

  const onPublishClick = async () => {
    if (checking || uploadStatus === 'uploading') return
    if (!name) {
      await publish()
      return
    }

    setChecking(true)
    let duplicate = false
    try {
      const params = new URLSearchParams({
        'where[name][equals]': name,
        limit: '2',
        depth: '0',
      })
      const response = await fetch(`${config.routes.api}/products?${params}`, { credentials: 'same-origin' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as { docs?: ProductMatch[] }
      if (!Array.isArray(data.docs)) throw new Error('Invalid response')

      duplicate = data.docs.some((product) => String(product.id) !== String(id) && product.name.trim() === name)
    } catch {
      toast.error('Không thể kiểm tra tên sản phẩm. Vui lòng thử lại.')
      return
    } finally {
      setChecking(false)
    }

    if (duplicate) {
      setDuplicateName(name)
      openModal(modalSlug)
    } else {
      await publish()
    }
  }

  if (!hasPublishPermission) return null

  return (
    <>
      <FormSubmit
        buttonId="action-save"
        disabled={checking || uploadStatus === 'uploading' || (!modified && unpublishedVersionCount === 0 && hasPublishedDoc)}
        onClick={onPublishClick}
        size="medium"
        type="button"
      >
        Xuất bản tài liệu
      </FormSubmit>
      <ConfirmationModal
        body={`Đã có sản phẩm mang tên “${duplicateName}”. Nếu tiếp tục, hai sản phẩm sẽ cùng tên trong hệ thống. Bạn vẫn muốn xuất bản?`}
        cancelLabel="Quay lại chỉnh sửa"
        confirmLabel="Vẫn xuất bản"
        confirmingLabel="Đang xuất bản…"
        heading="Tên sản phẩm đã tồn tại"
        modalSlug={modalSlug}
        onConfirm={publish}
      />
    </>
  )
}

export default ProductPublishButton
