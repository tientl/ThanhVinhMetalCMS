import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'

import { ADMIN_STORAGE_STATE, EDITOR_STORAGE_STATE } from './tests/e2e/paths'
import { testDatabaseUrl } from './tests/setup/database-url'

loadEnv({ path: '.env' })

/**
 * E2E chạy trên cổng riêng, database test riêng và thư mục build riêng,
 * nên không đụng `pnpm dev` đang chạy ở cổng 3000.
 * Nạp dữ liệu trước bằng `pnpm test:db` (script `pnpm test:e2e` đã gọi sẵn).
 */
const PORT = Number(process.env.E2E_PORT || 3100)
const baseURL = `http://localhost:${PORT}`
const browserExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const editorBrowser = {
  ...devices['Desktop Chrome'],
  ...(browserExecutable ? { launchOptions: { executablePath: browserExecutable } } : {}),
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'desktop',
      // 1440px là bề ngang của thiết kế gốc. Màn laptop nhỏ hơn có test riêng trong theme-nav.spec.ts.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: [/responsive\.spec\.ts/, /admin\.spec\.ts/, /editor\.spec\.ts/],
    },
    {
      name: 'admin',
      testMatch: /admin\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_STORAGE_STATE },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
    // Vai trò Nhân viên: tự tạo tài khoản (nếu chưa có) rồi đăng nhập một lần
    { name: 'setup-editor', testMatch: /editor\.setup\.ts/, use: editorBrowser },
    {
      name: 'editor',
      testMatch: /editor\.spec\.ts/,
      dependencies: ['setup-editor'],
      use: { ...editorBrowser, storageState: EDITOR_STORAGE_STATE },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // Lệnh gồm cả `next build` nên cần nhiều thời gian, nhất là trên CI.
    timeout: 600_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DATABASE_URL: testDatabaseUrl(),
      NEXT_PUBLIC_SERVER_URL: baseURL,
      NEXT_DIST_DIR: '.next-e2e',
      PORT: String(PORT),
      // Không gửi email thật khi test form báo giá.
      SMTP_HOST: '',
    },
  },
})
