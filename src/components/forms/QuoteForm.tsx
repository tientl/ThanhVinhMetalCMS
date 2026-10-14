'use client'

import React, { useState } from 'react'

import { QUOTE_FILE_EXTENSIONS, QUOTE_FILE_MAX_BYTES } from '@/lib/quoteFiles'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export const QuoteForm = ({ product, sourcePage }: { product?: string; sourcePage?: string }) => {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const file = data.get('attachment')
    if (file instanceof File && file.size > 0) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (!QUOTE_FILE_EXTENSIONS.includes(ext)) {
        setError(`Chỉ nhận tệp ${QUOTE_FILE_EXTENSIONS.join(', ').toUpperCase()}.`)
        setStatus('error')
        return
      }
      if (file.size > QUOTE_FILE_MAX_BYTES) {
        setError('Tệp vượt quá 10 MB.')
        setStatus('error')
        return
      }
    }
    // Khách bấm "Yêu cầu báo giá" từ trang sản phẩm: ghi trang sản phẩm đó (tham số from).
    // Còn lại ghi đường dẫn hiện tại kèm ?sp=<tên sản phẩm>, giải mã để đọc được trong admin
    const page = window.location.pathname + window.location.search
    let source = page
    try {
      source = decodeURIComponent(page)
    } catch {
      // Địa chỉ có ký tự % lẻ: giữ nguyên
    }
    if (sourcePage && /^\/[a-z0-9\-\/]*$/i.test(sourcePage)) source = sourcePage
    data.set('source', source)
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/quote', { method: 'POST', body: data })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'Gửi thất bại')
      setStatus('sent')
      form.reset()
      setFileName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được, vui lòng thử lại.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p role="status" className="m-0 border-l-[3px] border-accent bg-surface px-[18px] py-4 text-[15px] font-medium">
        Đã gửi yêu cầu. Vinh Metal sẽ liên hệ lại với bạn sớm.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]" noValidate>
      <div className="grid gap-[18px] sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="q-name" className="field-label">
            Họ tên (*)
          </label>
          <input id="q-name" name="name" type="text" required maxLength={120} autoComplete="name" className="field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="q-phone" className="field-label">
            Điện thoại (*)
          </label>
          <input id="q-phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" className="field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="q-email" className="field-label">
            Email
          </label>
          <input id="q-email" name="email" type="email" maxLength={120} autoComplete="email" className="field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="q-company" className="field-label">
            Công ty
          </label>
          <input id="q-company" name="company" type="text" maxLength={120} autoComplete="organization" className="field" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="q-message" className="field-label">
          Nội dung, quy cách cần gia công
        </label>
        <textarea id="q-message" name="message" rows={4} maxLength={3000} className="field" defaultValue={product ? `Tôi quan tâm sản phẩm: ${product}\n` : ''} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="q-file" className="field-label">
          Bản vẽ đính kèm (DXF, DWG, PDF, ảnh, tối đa 10 MB)
        </label>
        <label className="field flex cursor-pointer items-center gap-3 text-muted-2">
          <span className="shrink-0 border border-line-2 px-3 py-1 text-[12px] font-semibold uppercase text-ink" style={{ letterSpacing: 1.5 }}>
            Chọn tệp
          </span>
          <span className="truncate text-sm">{fileName || 'Chưa chọn tệp'}</span>
          <input
            id="q-file"
            name="attachment"
            type="file"
            accept=".dxf,.dwg,.pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          />
        </label>
      </div>
      {/* Bẫy bot: người thật không thấy ô này */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label htmlFor="q-website">Website</label>
        <input id="q-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status === 'error' && (
        <p role="alert" className="m-0 border-l-[3px] border-accent bg-surface px-[18px] py-3 text-sm text-accent-ghost">
          {error}
        </p>
      )}
      <button type="submit" className="btn-solid self-start" disabled={status === 'sending'}>
        {status === 'sending' ? 'Đang gửi…' : 'Gửi yêu cầu'}
      </button>
    </form>
  )
}
