import React from 'react'

import { ImageCard } from '@/components/ui/ImageCard'
import type { Home } from '@/payload-types'

export const Collections = ({ items }: { items: NonNullable<Home['collections']> }) => {
  if (!items.length) return null
  return (
    <section id="bo-suu-tap" aria-label="Bộ sưu tập" className="grid md:grid-cols-2">
      {items.map((c, i) => (
        <div key={c.id ?? i} className="h-[460px] md:h-[560px] lg:h-[680px] [&>a]:h-full">
          <ImageCard
            href={c.href}
            image={c.image}
            frame={c.imageFrame}
            tag={c.tag}
            title={c.title}
            subtitle={c.description}
            cta="Khám phá ngay"
            strong
            titleSize={36}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      ))}
    </section>
  )
}
