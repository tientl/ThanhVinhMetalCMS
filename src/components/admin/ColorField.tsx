'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import React from 'react'

const PRESETS = ['#E8411A', '#C8102E', '#B8860B', '#D4A017', '#1F7A8C', '#2E7D32', '#5B4B8A', '#374151']

/** Ô chọn màu: nhập mã hex hoặc bấm bảng màu, kèm vài màu gợi ý. */
export const ColorField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const current = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : '#E8411A'

  return (
    <div className="field-type text" style={{ marginBottom: 'var(--base)' }}>
      <FieldLabel label={field.label} path={path} required={field.required} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="color"
          value={current}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          aria-label="Chọn màu"
          style={{ width: 48, height: 40, padding: 2, border: '1px solid var(--theme-elevation-150)', background: 'transparent', cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#E8411A"
          maxLength={7}
          style={{ width: 140, height: 40, padding: '0 10px', border: `1px solid ${showError ? 'var(--theme-error-500)' : 'var(--theme-elevation-150)'}`, background: 'var(--theme-input-bg)', color: 'inherit', fontFamily: 'monospace' }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={`Chọn ${c}`}
              onClick={() => setValue(c)}
              style={{ width: 26, height: 26, borderRadius: 13, background: c, border: c.toUpperCase() === (value ?? '').toUpperCase() ? '3px solid #fff' : '1px solid rgba(255,255,255,.25)', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
      </div>
      {showError && <div style={{ color: 'var(--theme-error-500)', marginTop: 6, fontSize: '0.9em' }}>{errorMessage}</div>}
      {field.admin?.description && typeof field.admin.description === 'string' && (
        <div style={{ color: 'var(--theme-elevation-500)', marginTop: 6, fontSize: '0.9em' }}>{field.admin.description}</div>
      )}
    </div>
  )
}

export default ColorField
