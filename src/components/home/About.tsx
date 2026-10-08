import Link from 'next/link'
import React from 'react'

import { Img } from '@/components/ui/Img'
import type { Home } from '@/payload-types'

export const About = ({ about }: { about: Home['about'] }) => {
  if (!about) return null
  return (
    <section id="gioi-thieu" className="section hairline grid items-center gap-12 bg-bg-alt lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-24">
      <div className="flex flex-col gap-5" data-reveal>
        {about.slogan && <span className="text-base font-medium text-muted">{about.slogan}</span>}
        {about.foundedYear && <span className="label-sm">Thành lập năm {about.foundedYear}</span>}
        <h2 className="h-serif text-[30px] md:text-[40px]">{about.heading || 'Giới thiệu'}</h2>
        {(about.paragraphs ?? []).map((p, i) => (
          <p key={p.id ?? i} className="lead m-0">
            {p.text}
          </p>
        ))}
        <Link href={about.buttonHref || '/gioi-thieu'} className="btn-ghost self-start">
          {about.buttonLabel || 'Về chúng tôi'}
        </Link>
      </div>
      <div className="relative h-[360px] md:h-[480px] lg:h-[560px]" data-reveal>
        <Img media={about.image} size="wide" sizes="(min-width: 1024px) 55vw, 100vw" />
        {about.badgeTitle && (
          <span className="absolute bottom-6 left-0 flex flex-col gap-1.5 bg-accent px-6 py-5 text-bg md:bottom-10 lg:-left-10 lg:px-[30px] lg:py-[26px]">
            <span className="h-serif text-[20px] md:text-[26px]">{about.badgeTitle}</span>
            {about.badgeSub && <span className="text-sm">{about.badgeSub}</span>}
          </span>
        )}
      </div>
    </section>
  )
}
