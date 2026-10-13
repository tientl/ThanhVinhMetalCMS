import { config as loadEnv } from 'dotenv'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

import { testDatabaseUrl } from './tests/setup/database-url'

loadEnv({ path: '.env' })

/**
 * Test chạy trên database riêng (mặc định `thanhvinh_test`) để không đụng dữ liệu dev.
 * `tests/setup/global.ts` tạo database và nạp dữ liệu mẫu trước khi chạy nhóm int.
 */
const env = {
  DATABASE_URL: testDatabaseUrl(),
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'test-secret',
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  // Không gửi email thật trong test.
  SMTP_HOST: '',
}

const withPaths = () => [tsconfigPaths()]

export default defineConfig({
  test: {
    // Nhóm int dùng chung một database nên các file phải chạy tuần tự.
    // Vitest 3 chỉ đọc fileParallelism ở cấp gốc; đặt trong từng project sẽ bị bỏ qua (các file int từng chạy chồng nhau).
    fileParallelism: false,
    projects: [
      {
        plugins: withPaths(),
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        plugins: withPaths(),
        test: {
          name: 'int',
          environment: 'node',
          include: ['tests/int/**/*.test.ts'],
          env,
          globalSetup: ['tests/setup/global.ts'],
          testTimeout: 60_000,
          hookTimeout: 180_000,
        },
      },
    ],
  },
})
