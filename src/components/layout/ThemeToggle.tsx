'use client'

import React, { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const read = (): Theme => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')

/** Nút chuyển sáng/tối. Mặc định tối, lựa chọn lưu trong trình duyệt. */
export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Đồng bộ với thuộc tính đã được script trong <head> đặt trước khi hydrate
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(read())
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    if (next === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Trình duyệt chặn localStorage: vẫn đổi theme cho phiên hiện tại
    }
    setTheme(next)
  }

  const label = theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent text-current"
    >
      {theme === 'dark' ? (
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
