import { expect, test as setup } from '@playwright/test'

import { ADMIN_STORAGE_STATE } from './paths'

const EMAIL = process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn'
const PASSWORD = process.env.ADMIN_PASSWORD || 'ThanhVinh@2026'

/**
 * Đăng nhập một lần rồi lưu cookie cho cả nhóm test admin dùng chung.
 * Đăng nhập nhiều lần song song bằng cùng tài khoản dễ sinh lỗi chập chờn.
 */
setup('đăng nhập trang quản trị', async ({ page }) => {
  await page.goto('/admin/login')
  await page.locator('#field-email').fill(EMAIL)
  await page.locator('#field-password').fill(PASSWORD)
  await page.getByRole('button', { name: /đăng nhập/i }).click()

  await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'), { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: /xin chào/i })).toBeVisible()

  await page.context().storageState({ path: ADMIN_STORAGE_STATE })
})
