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
  // Ảnh trong public/media có sẵn lúc build thì Next phục vụ tĩnh (afterFiles chỉ chạy khi không tìm thấy file).
  // Ảnh tải lên sau khi build (chạy `pnpm start` local) được chuyển sang Payload API. Trên VPS, Nginx phục vụ /media/ trước.
  async rewrites() {
    return { afterFiles: [{ source: '/media/:path*', destination: '/api/media/file/:path*' }] }
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
