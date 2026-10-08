'use client'

import { useAuth } from '@payloadcms/ui'
import React from 'react'

const initials = (name?: string | null, email?: string | null) => {
  const source = (name || '').trim()
  if (source) {
    const parts = source.split(/\s+/)
    const take = parts.length >= 2 ? [parts[0], parts[parts.length - 1]] : [parts[0]]
    return take.map((p) => p[0]).join('').toUpperCase()
  }
  return (email || '?')[0].toUpperCase()
}

/** Avatar chữ cái đầu của tên người dùng, nền màu chủ đạo. */
export const Avatar = () => {
  const { user } = useAuth()
  const name = user && 'name' in user ? (user.name as string) : undefined
  return (
    <span className="avatar-initials" aria-hidden="true">
      {initials(name, user?.email)}
    </span>
  )
}

export default Avatar
