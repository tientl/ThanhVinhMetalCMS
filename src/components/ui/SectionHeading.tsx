import React from 'react'

type Props = {
  title: string
  intro?: string | null
  action?: React.ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  light?: boolean
}

/**
 * Tiêu đề khối. Chỉ đoạn mô tả giới hạn 720px cho dễ đọc; tiêu đề dùng hết bề ngang (font không chân in hoa rộng hơn
 * Playfair cũ, giới hạn chung thì "Tìm hiểu sản phẩm theo danh mục" rớt một chữ xuống dòng). Chia đều dòng khi phải
 * xuống dòng nằm trong class .h-display (text-wrap: balance).
 */
export const SectionHeading = ({ title, intro, action, align = 'left', as: Tag = 'h2', light }: Props) => (
  <div
    className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12 ${align === 'center' ? 'md:justify-center text-center' : ''}`}
    data-reveal
  >
    <div className={`flex min-w-0 flex-col gap-3.5 ${align === 'center' ? 'mx-auto items-center' : ''}`}>
      <Tag className={`h-display text-[30px] md:text-[40px] ${light ? 'text-white' : ''}`}>{title}</Tag>
      {intro && <p className="lead max-w-[720px]">{intro}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)
