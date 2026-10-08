import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { FloatingButtons } from '@/components/layout/FloatingButtons'
import { MobileBar } from '@/components/layout/MobileBar'
import { RevealObserver } from '@/components/layout/RevealObserver'
import { LocalBusinessJsonLd } from '@/components/layout/JsonLd'
import { getSiteSettings } from '@/lib/data'
import { BRAND } from '@/lib/metadata'
import { getServerSideURL } from '@/utilities/getURL'

import './globals.css'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: { default: BRAND, template: `%s | ${BRAND}` },
  icons: { icon: '/logo.png', apple: '/logo.png' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="vi" className={`${beVietnam.variable} ${playfair.variable}`}>
      <head>
        {settings.searchConsoleToken && (
          <meta name="google-site-verification" content={settings.searchConsoleToken} />
        )}
      </head>
      <body className="pb-16 md:pb-0">
        <Header />
        <main id="top">{children}</main>
        <Footer />
        <FloatingButtons hotline={settings.hotline} zalo={settings.zalo} />
        <MobileBar hotline={settings.hotline} zalo={settings.zalo} />
        <RevealObserver />
        <LocalBusinessJsonLd settings={settings} />
        {settings.ga4Id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.ga4Id}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
