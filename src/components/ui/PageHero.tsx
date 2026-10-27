import React from 'react'

import type { MediaRef } from '@/lib/media'

import { Breadcrumb, type Crumb } from './Breadcrumb'
import { Img } from './Img'

type Props = {
  title: string
  intro?: string | null
  label?: string | null
  image?: MediaRef
  crumbs: Crumb[]
}

/** Đầu trang con: ảnh nền tối, breadcrumb, tiêu đề serif. */
export const PageHero = ({ title, intro, label, image, crumbs }: Props) => (
  <section className="dark-zone relative overflow-hidden bg-deep pt-[var(--header-h)]">
    {image && (
      <>
        <Img media={image} size="wide" className="opacity-40" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/70 to-deep/20" />
      </>
    )}
    <div className="section-x relative flex flex-col gap-5 py-16 md:py-24">
      <Breadcrumb items={crumbs} />
      {label && <span className="label-sm">{label}</span>}
      <h1 className="h-display max-w-[900px] text-[32px] md:text-[48px]">{title}</h1>
      {intro && <p className="lead max-w-[720px]">{intro}</p>}
    </div>
  </section>
)
