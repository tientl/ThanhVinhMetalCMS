'use client'

import { useTheme } from '@payloadcms/ui'
import React from 'react'

/** Nút chuyển sáng/tối cho trang quản trị, đặt ở header cạnh biểu tượng tài khoản. */
export const AdminThemeToggle = () => {
  const { setTheme, theme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        border: 0,
        background: 'transparent',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
      }}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}

export default AdminThemeToggle
