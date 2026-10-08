'use client'

import React, { useState } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export const NewsletterForm = ({ note }: { note?: string | null }) => {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = String(new FormData(form).get('email') || '').trim()
    if (!email) return
    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: window.location.pathname }),
      })
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'Không đăng ký được')
      setMessage(json.message || 'Đã đăng ký nhận bản tin.')
      setStatus('sent')
      form.reset()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không đăng ký được, vui lòng thử lại.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5 border-t border-line pt-[18px]">
      <label htmlFor="nl-email" className="field-label">
        Đăng ký nhận bản tin
      </label>
      {note && <span className="text-[13.5px] text-muted-2">{note}</span>}
      <div className="flex">
        <input id="nl-email" name="email" type="email" required placeholder="Email của bạn" className="field h-[46px] min-w-0 flex-grow border-r-0 text-sm" />
        <button type="submit" disabled={status === 'sending'} className="h-[46px] shrink-0 cursor-pointer border-0 bg-ink px-5 text-[13.5px] font-semibold uppercase text-bg hover:bg-accent disabled:opacity-60">
          {status === 'sending' ? '…' : 'Đăng ký'}
        </button>
      </div>
      {(status === 'sent' || status === 'error') && (
        <p role="status" className={`m-0 text-sm ${status === 'sent' ? 'text-soft' : 'text-accent-ghost'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
