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
import { accentVars } from '@/lib/color'
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
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnam.variable} ${playfair.variable}`}
      style={accentVars(settings.accentColor) as React.CSSProperties}
    >
      <head>
        {/* Áp chế độ sáng/tối đã lưu trước khi vẽ trang để không bị nháy. Mặc định tối. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}",
          }}
        />
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
        {settings.pixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${settings.pixelId}');fbq('track','PageView');`}
          </Script>
        )}
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
