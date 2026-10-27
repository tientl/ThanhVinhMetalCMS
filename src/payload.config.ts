import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { PostCategories } from './collections/PostCategories'
import { Posts } from './collections/Posts'
import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'
import { QuoteFiles } from './collections/QuoteFiles'
import { QuoteRequests } from './collections/QuoteRequests'
import { Users } from './collections/Users'
import { Home } from './globals/Home'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { VisitorStats } from './globals/VisitorStats'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const smtpConfigured = Boolean(process.env.SMTP_HOST)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' – Thành Vinh Metal',
      icons: [{ rel: 'icon', type: 'image/png', url: '/logo.png' }],
    },
    avatar: { Component: '@/components/admin/Avatar#Avatar' },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
      Nav: '@/components/admin/Nav#AdminNav',
      beforeDashboard: ['@/components/admin/DashboardHeader#DashboardHeader'],
      actions: ['@/components/admin/AdminThemeToggle#AdminThemeToggle'],
      providers: [
        // Trang phiên bản: ẩn nút khôi phục khi giống bản mới nhất, mới vào thì hiện toàn bộ nội dung
        '@/components/admin/VersionRestoreGuard#VersionRestoreGuard',
        // Bấm ảnh nhỏ hoặc tên tệp ở ô ảnh trong form: xem ảnh phóng to
        '@/components/admin/AdminImageViewer#AdminImageViewer',
      ],
    },
    dateFormat: 'dd/MM/yyyy HH:mm',
  },
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  collections: [
    QuoteRequests,
    Products,
    ProductCategories,
    Posts,
    PostCategories,
    Pages,
    Media,
    QuoteFiles,
    Users,
  ],
  globals: [Home, Navigation, SiteSettings, VisitorStats],
  cors: [getServerSideURL()].filter(Boolean),
  csrf: [getServerSideURL()].filter(Boolean),
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  upload: {
    limits: { fileSize: 10 * 1024 * 1024 },
  },
  email: smtpConfigured
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@localhost',
        defaultFromName: process.env.SMTP_FROM_NAME || 'Website Thành Vinh Metal',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        },
      })
    : undefined,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
