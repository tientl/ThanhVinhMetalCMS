'use client'

import type { DefaultCellComponentProps } from 'payload'

import React from 'react'

import { quoteStatusLabel } from '@/lib/quoteStatus'

/** Cột "Trạng thái" trong danh sách yêu cầu báo giá: nhãn có màu đặc trưng (màu ở custom.scss, class qs--<value>). */
export const QuoteStatusCell = ({ cellData }: DefaultCellComponentProps) => {
  const label = quoteStatusLabel(cellData)
  if (!label) return <span className="qs-pill qs-pill--empty">Chưa đặt</span>
  return <span className={`qs-pill qs--${String(cellData)}`}>{label}</span>
}

export default QuoteStatusCell
