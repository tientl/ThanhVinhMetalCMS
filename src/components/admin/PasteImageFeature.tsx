'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { $insertNodes, $parseSerializedNode, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { toast, useConfig, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useRef } from 'react'

/** Id của nút ảnh trong Lexical (chuỗi hex 24 ký tự như Payload tự sinh). */
const nodeId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')

/**
 * Dán ảnh (chụp màn hình, "Sao chép hình ảnh" trên trình duyệt) vào ô soạn thảo thì tự tải lên "Ảnh và tệp" rồi chèn
 * luôn, không mở khung "Tệp để tải lên" bắt điền alt và bấm Lưu như mặc định của Payload.
 * - Alt tự đặt theo tiêu đề bài (hoặc tên sản phẩm); sửa sau ở "Ảnh và tệp" nếu cần.
 * - Chỉ nhận khi bộ nhớ tạm chỉ có ảnh. Dán nội dung lẫn chữ và ảnh (từ Word, trang web) hay kéo-thả tệp thì vẫn để
 *   Payload xử lý như cũ.
 * Chạy trước trình xử lý dán của Payload (của Payload ở mức COMMAND_PRIORITY_LOW).
 */
const PasteImagePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  const title = useFormFields(([fields]) => (fields.title?.value ?? fields.name?.value) as string | undefined)
  const titleRef = useRef(title)
  useEffect(() => {
    titleRef.current = title
  }, [title])

  useEffect(() => {
    const altFor = (file: File) => {
      const t = typeof titleRef.current === 'string' ? titleRef.current.trim() : ''
      return t ? `Ảnh trong "${t}"` : file.name.replace(/\.[^.]+$/, '') || 'Ảnh'
    }

    const uploadAndInsert = async (files: File[]) => {
      const progress = toast.loading(files.length > 1 ? `Đang tải ${files.length} ảnh lên…` : 'Đang tải ảnh lên…')
      try {
        for (const file of files) {
          const form = new FormData()
          form.append('file', file)
          form.append('_payload', JSON.stringify({ alt: altFor(file) }))
          const res = await fetch(`${serverURL || ''}${api}/media`, { method: 'POST', body: form, credentials: 'include' })
          const json = (await res.json().catch(() => null)) as { doc?: { id: number | string }; errors?: { message: string }[] } | null
          if (!res.ok || !json?.doc) throw new Error(json?.errors?.[0]?.message || `Lỗi ${res.status}`)
          const id = json.doc.id
          editor.update(() => {
            $insertNodes([$parseSerializedNode({ type: 'upload', version: 3, format: '', id: nodeId(), fields: {}, relationTo: 'media', value: id } as never)])
          })
        }
        toast.success(files.length > 1 ? `Đã chèn ${files.length} ảnh` : 'Đã chèn ảnh', { id: progress })
      } catch (error) {
        toast.error(`Không tải được ảnh: ${(error as Error).message}`, { id: progress })
      }
    }

    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (typeof ClipboardEvent === 'undefined' || !(event instanceof ClipboardEvent) || !event.clipboardData) return false
        const data = event.clipboardData
        const images = Array.from(data.files).filter((f) => f.type.startsWith('image/'))
        if (images.length === 0 || images.length !== data.files.length || data.getData('text/plain').trim()) return false
        event.preventDefault()
        void uploadAndInsert(images)
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor, api, serverURL])

  return null
}

export const PasteImageFeatureClient = createClientFeature({
  plugins: [{ Component: PasteImagePlugin, position: 'normal' }],
})
