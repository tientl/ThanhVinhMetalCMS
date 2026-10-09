import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/media/**' }, { pathname: '/**' }],
    qualities: [75, 80, 85, 100],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  // Build riêng cho test E2E (NEXT_DIST_DIR=.next-e2e) để không đụng .next của dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Cho phép mở dev server từ điện thoại trong mạng LAN (chỉ ảnh hưởng pnpm dev)
  allowedDevOrigins: ['172.20.10.*', '192.168.*.*', '10.*.*.*'],
  agentRules: false,
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
