'use client'

import type { UploadFieldClientProps } from 'payload'

import { FieldLabel, useConfig, useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type QuoteFile = {
  id: number
  filename?: string | null
  originalName?: string | null
  filesize?: number | null
  mimeType?: string | null
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Ô "Tệp bản vẽ" trong yêu cầu báo giá: chỉ xem và tải về.
 * Thay cho ô upload mặc định (có bút chì mở hộp thoại sửa ảnh và dấu X gỡ tệp), vì tệp khách gửi không được sửa.
 */
export const QuoteAttachmentField = ({ field, path }: UploadFieldClientProps) => {
  const { value } = useField<number | QuoteFile | null>({ path })
  const { config } = useConfig()
  const api = config.routes.api
  const id = typeof value === 'object' && value ? value.id : value
  const [file, setFile] = useState<QuoteFile | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`${api}/quote-files/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc: QuoteFile | null) => {
        if (!cancelled && doc) setFile(doc)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api, id])

  const label = typeof field.label === 'string' ? field.label : 'Tệp bản vẽ'
  const current = id && file?.id === id ? file : null
  const url = current?.filename ? `${api}/quote-files/file/${encodeURIComponent(current.filename)}` : null
  const isImage = !!current?.mimeType?.startsWith('image/')

  return (
    <div className="field-type quote-attachment">
      <FieldLabel label={label} path={path} />
      {!id ? (
        <p className="quote-attachment__empty">Khách không gửi tệp.</p>
      ) : !current ? (
        <p className="quote-attachment__empty">Đang tải thông tin tệp…</p>
      ) : (
        <div className="quote-attachment__row">
          {isImage && url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="quote-attachment__thumb" />
          ) : (
            <span className="quote-attachment__thumb quote-attachment__thumb--doc">{(current.filename || '').split('.').pop()?.toUpperCase()}</span>
          )}
          <div className="quote-attachment__meta">
            <strong>{current.originalName || current.filename}</strong>
            <span>
              {formatSize(current.filesize)}
              {current.mimeType ? ` · ${current.mimeType}` : ''}
            </span>
          </div>
          {url && (
            <a href={url} download={current.originalName || current.filename || undefined} className="btn btn--style-primary btn--size-medium quote-attachment__download">
              Tải về
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default QuoteAttachmentField
