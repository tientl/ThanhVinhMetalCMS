'use client'

import { FieldDescription, FieldError, FieldLabel, toast, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import React, { useRef, useState } from 'react'

import { toSlug } from '@/utilities/unaccent'

type Props = TextFieldClientProps & {
  /** Phần đường dẫn đứng trước slug trên website, ví dụ `/san-pham/danh-muc/`. */
  prefix?: string
  /** Field nguồn để gợi ý slug khi ô còn trống (tên, tiêu đề). */
  sourceField?: string
}

/** Chép chữ vào bộ nhớ tạm; trang không chạy https (trừ localhost) thì dùng cách cũ. */
const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  if (!ok) throw new Error('copy failed')
}

/**
 * Ô slug hiện cả đường dẫn trên website: tiền tố (xám, không sửa được) + slug (sửa được) + nút chép
 * đường dẫn không kèm tên miền, để dán thẳng vào ô "Đường dẫn" của menu.
 *
 * Cả đường dẫn nằm trong một `<textarea>` thật nên bôi đen, Ctrl+A, Ctrl+C, hoàn tác, bộ gõ tiếng Việt chạy
 * như ô thường (Chrome không cho bôi đen nối từ chữ thường sang vùng contentEditable). Chữ trong textarea
 * trong suốt; lớp chữ nằm dưới (`__mirror`, cùng font, cùng lề) vẽ màu: tiền tố xám, slug màu thường.
 * Mọi thao tác sửa bị giữ ở sau tiền tố; sửa lấn vào tiền tố thì bỏ qua.
 */
export const SlugField: React.FC<Props> = ({ field, path, readOnly: readOnlyProp, prefix = '/', sourceField }) => {
  const { value, setValue, showError, errorMessage, disabled } = useField<string>({ path })
  const source = useFormFields(([fields]) => (sourceField ? fields[sourceField]?.value : undefined))
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | undefined>(undefined)

  const current = typeof value === 'string' ? value : ''
  const readOnly = Boolean(readOnlyProp || disabled)
  const start = prefix.length
  const suggestion = typeof source === 'string' ? toSlug(source) : ''
  // Đường dẫn thật sau khi lưu: server cũng chuẩn hóa bằng toSlug (src/fields/slug.ts)
  const slug = toSlug(current)
  const fullPath = `${prefix}${slug}`

  /** Kéo vùng chọn ra khỏi tiền tố trước khi sửa. */
  const keepOutOfPrefix = (el: HTMLTextAreaElement) => {
    const from = Math.max(el.selectionStart, start)
    const to = Math.max(el.selectionEnd, start)
    if (from !== el.selectionStart || to !== el.selectionEnd) el.setSelectionRange(from, to)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.replace(/[\r\n]+/g, '')
    // Sửa lấn vào tiền tố (vd. Ctrl+Backspace xóa cả từ): không nhận, React tự trả lại chữ cũ
    if (!next.startsWith(prefix)) return
    setValue(next.slice(start))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    if (e.key === 'Enter') {
      e.preventDefault()
      return
    }
    const collapsed = el.selectionStart === el.selectionEnd
    if (e.key === 'Backspace' && (collapsed ? el.selectionStart <= start : el.selectionEnd <= start)) {
      e.preventDefault()
      return
    }
    if (e.key === 'Delete' && el.selectionEnd <= start && !collapsed) {
      e.preventDefault()
      return
    }
    const typing = e.key.length === 1 && !e.metaKey && !(e.ctrlKey && !e.altKey)
    if (typing || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Process') keepOutOfPrefix(el)
  }

  // Con trỏ (không bôi đen) không được đứng trong tiền tố: bấm vào tiền tố, phím Home… đều đưa về sau tiền tố
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    if (el.selectionStart === el.selectionEnd && el.selectionStart < start) el.setSelectionRange(start, start)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    let text = e.clipboardData.getData('text/plain').replace(/\s+/g, ' ').trim()
    // Dán cả đường dẫn (có hoặc không kèm tên miền) thì chỉ giữ phần slug
    text = text.replace(/^https?:\/\/[^/]+/, '')
    if (text.startsWith(prefix)) text = text.slice(start)
    keepOutOfPrefix(e.currentTarget)
    // execCommand giữ được hoàn tác (Ctrl+Z) và bắn sự kiện input như khi gõ
    document.execCommand('insertText', false, text)
  }

  // Cắt mà vùng chọn có cả tiền tố: chép đủ những gì đang bôi đen nhưng chỉ xóa phần slug
  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    if (el.selectionStart >= start) return
    e.preventDefault()
    e.clipboardData.setData('text/plain', el.value.slice(el.selectionStart, el.selectionEnd))
    keepOutOfPrefix(el)
    if (el.selectionStart !== el.selectionEnd) document.execCommand('delete')
  }

  const handleCopyButton = async () => {
    try {
      await copyText(fullPath)
      setCopied(true)
      window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1500)
      toast.success(`Đã chép đường dẫn ${fullPath}`)
    } catch {
      toast.error('Không chép được, hãy bôi đen đường dẫn rồi bấm Ctrl+C.')
    }
  }

  const label = typeof field.label === 'string' ? field.label : 'Đường dẫn (slug)'

  return (
    <div className={['field-type', 'text', 'slug-field', showError && 'error', readOnly && 'read-only'].filter(Boolean).join(' ')}>
      <FieldLabel label={field.label} path={path} required={field.required} />
      <div className="field-type__wrap">
        <FieldError path={path} showError={showError} message={errorMessage} />
        <div className="slug-field__box">
          <div className="slug-field__control">
            <div className="slug-field__mirror" aria-hidden="true">
              <span className="slug-field__prefix">{prefix}</span>
              {current ? (
                <span className="slug-field__value">{current}</span>
              ) : (
                <span className="slug-field__placeholder">{suggestion}</span>
              )}
              {'​'}
            </div>
            <textarea
              id={`field-${path.replace(/\./g, '__')}`}
              name={path}
              className="slug-field__input"
              value={`${prefix}${current}`}
              rows={1}
              readOnly={readOnly}
              aria-label={label}
              spellCheck={false}
              autoComplete="off"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onSelect={handleSelect}
              onPaste={handlePaste}
              onCut={handleCut}
              onDrop={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
          <button
            type="button"
            className="slug-field__copy"
            onClick={handleCopyButton}
            disabled={!slug}
            title={slug ? `Chép ${fullPath}` : 'Chưa có đường dẫn để chép'}
            aria-label="Chép đường dẫn"
          >
            {copied ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
        <FieldDescription description={field.admin?.description} path={path} />
      </div>
    </div>
  )
}

export default SlugField
