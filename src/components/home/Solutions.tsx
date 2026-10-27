import React from 'react'

import { ImageCard } from '@/components/ui/ImageCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Home } from '@/payload-types'

export const Solutions = ({ heading, intro, items }: { heading?: string | null; intro?: string | null; items: NonNullable<Home['solutions']> }) => {
  if (!items.length) return null
  return (
    <section id="giai-phap" className="section flex flex-col gap-10 lg:gap-11">
      <SectionHeading title={heading || 'Giải pháp'} intro={intro} />
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {items.map((s, i) => (
          <div key={s.id ?? i} className="h-[380px] md:h-[440px] lg:h-[520px] [&>a]:h-full">
            <ImageCard href={s.href} image={s.image} frame={s.imageFrame} title={s.title} subtitle={s.subtitle} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        ))}
      </div>
    </section>
  )
}
