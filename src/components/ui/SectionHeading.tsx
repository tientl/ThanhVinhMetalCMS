import React from 'react'

type Props = {
  title: string
  intro?: string | null
  action?: React.ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  light?: boolean
}

export const SectionHeading = ({ title, intro, action, align = 'left', as: Tag = 'h2', light }: Props) => (
  <div
    className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12 ${align === 'center' ? 'md:justify-center text-center' : ''}`}
    data-reveal
  >
    <div className={`flex max-w-[720px] flex-col gap-3.5 ${align === 'center' ? 'mx-auto' : ''}`}>
      <Tag className={`h-serif text-[30px] md:text-[40px] ${light ? 'text-white' : ''}`}>{title}</Tag>
      {intro && <p className="lead">{intro}</p>}
    </div>
    {action}
  </div>
)
