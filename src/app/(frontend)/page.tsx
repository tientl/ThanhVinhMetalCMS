import type { Metadata } from 'next'
import React from 'react'

import { About } from '@/components/home/About'
import { Applications } from '@/components/home/Applications'
import { CategoriesGrid } from '@/components/home/CategoriesGrid'
import { Collections } from '@/components/home/Collections'
import { ContactSection } from '@/components/home/ContactSection'
import { HeroSlider } from '@/components/home/HeroSlider'
import { NewsGrid } from '@/components/home/NewsGrid'
import { Solutions } from '@/components/home/Solutions'
import { getCategories, getHome, getPosts, getSiteSettings } from '@/lib/data'
import { BRAND, buildMetadata } from '@/lib/metadata'
import type { ProductCategory } from '@/payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHome(), getSiteSettings()])
  return buildMetadata({
    title: home.metaTitle || `${BRAND} – ${settings.tagline || 'Cắt laser CNC, gia công kim loại tấm'}`,
    description: home.metaDescription,
    path: '/',
    image: home.metaImage,
  })
}

export default async function HomePage() {
  const [home, settings, allCategories] = await Promise.all([getHome(), getSiteSettings(), getCategories()])
  const posts = await getPosts({ limit: home.newsCount || 4 })

  const picked = (home.homeCategories ?? []).filter((c): c is ProductCategory => typeof c === 'object')
  const categories = picked.length ? picked : allCategories.filter((c) => c.showOnHome).slice(0, 6)

  return (
    <>
      <HeroSlider slides={home.slides ?? []} />
      <Collections items={home.collections ?? []} />
      <About about={home.about} />
      <Solutions heading={home.solutionsHeading} intro={home.solutionsIntro} items={home.solutions ?? []} />
      <Applications heading={home.applicationsHeading} intro={home.applicationsIntro} items={home.applications ?? []} />
      <CategoriesGrid heading={home.categoriesHeading} items={categories} />
      <NewsGrid heading={home.newsHeading} intro={home.newsIntro} posts={posts.docs} />
      <ContactSection settings={settings} heading={home.contactHeading} intro={home.contactIntro} newsletterNote={home.newsletterNote} />
    </>
  )
}
