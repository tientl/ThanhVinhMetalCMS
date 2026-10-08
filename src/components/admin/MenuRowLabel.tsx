'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

export const MenuRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ label?: string; type?: string }>()
  const label = data?.label || `Mục ${(rowNumber ?? 0) + 1}`
  return <span>{data?.type === 'mega' ? `${label} (mega menu)` : label}</span>
}
