import { expect, test as setup } from '@playwright/test'

import { EDITOR_EMAIL, EDITOR_PASSWORD, EDITOR_STORAGE_STATE } from './paths'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ThanhVinh@2026'

/**
 * Tạo tài khoản Nhân viên (nếu chưa có) bằng quyền Quản trị qua REST, rồi đăng nhập Nhân viên một lần và lưu cookie
 * cho nhóm test `editor`. Dùng header JWT nên không vướng kiểm tra CSRF của cookie.
 */
setup('đăng nhập bằng tài khoản Nhân viên', async ({ page, request }) => {
  const login = await request.post('/api/users/login', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  expect(login.ok()).toBe(true)
  const { token } = (await login.json()) as { token: string }
  const auth = { Authorization: `JWT ${token}` }

  const found = await request.get(`/api/users?where[email][equals]=${encodeURIComponent(EDITOR_EMAIL)}&limit=1`, { headers: auth })
  const { totalDocs } = (await found.json()) as { totalDocs: number }
  if (totalDocs === 0) {
    const created = await request.post('/api/users', {
      headers: auth,
      data: { name: 'Nhân viên E2E', email: EDITOR_EMAIL, password: EDITOR_PASSWORD, role: 'editor' },
    })
    expect(created.ok()).toBe(true)
  }

  await page.goto('/admin/login')
  await page.locator('#field-email').fill(EDITOR_EMAIL)
  await page.locator('#field-password').fill(EDITOR_PASSWORD)
  await page.getByRole('button', { name: /đăng nhập/i }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'), { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: /xin chào/i })).toBeVisible()
  await page.context().storageState({ path: EDITOR_STORAGE_STATE })
})
