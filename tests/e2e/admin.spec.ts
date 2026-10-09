import { expect, test } from '@playwright/test'

/**
 * Chạy với project `admin`: đã đăng nhập sẵn bằng cookie từ `auth.setup.ts`.
 * Các test cần vai trò khách tự xóa trạng thái đăng nhập ở describe riêng bên dưới.
 */
test.describe('Trang quản trị, đã đăng nhập', () => {
  test('bảng điều khiển có lời chào và ô thống kê', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /xin chào/i })).toBeVisible()
    expect(await page.locator('.dash-stat').count()).toBeGreaterThan(0)
  })

  test('menu bên trái có nhóm Sản phẩm và Liên hệ', async ({ page }) => {
    await page.goto('/admin')
    const nav = page.locator('nav').first()
    await expect(nav).toContainText(/Sản phẩm/i)
    await expect(nav).toContainText(/Liên hệ/i)
  })

  test('danh sách sản phẩm hiện dữ liệu', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await expect(page.getByRole('heading', { name: /sản phẩm/i }).first()).toBeVisible()
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0)
  })

  test('mở được một sản phẩm để sửa', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr a').first().click()
    await expect(page).toHaveURL(/\/admin\/collections\/products\/\d+/)
    await expect(page.locator('#field-name')).toBeVisible()
  })

  test('danh sách yêu cầu báo giá mở được', async ({ page }) => {
    await page.goto('/admin/collections/quote-requests')
    await expect(page.getByRole('heading', { name: /yêu cầu báo giá/i }).first()).toBeVisible()
  })

  test('cài đặt chung mở được', async ({ page }) => {
    await page.goto('/admin/globals/site-settings')
    await expect(page.locator('form').first()).toBeVisible()
    await expect(page.locator('#field-brandName')).toBeVisible()
  })

  test('giao diện quản trị bằng tiếng Việt', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await expect(page.locator('body')).toContainText(/Tạo mới|Lưu|Sản phẩm/i)
  })
})

test.describe('Trang quản trị, chưa đăng nhập', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('trang đăng nhập hiện bằng tiếng Việt', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('#field-email')).toBeVisible()
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  })

  test('sai mật khẩu thì không vào được', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#field-email').fill('admin@thanhvinhmetal.vn')
    await page.locator('#field-password').fill('sai-mat-khau')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('#field-email')).toBeVisible()
  })

  test('vào thẳng trang quản trị thì bị chặn', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await expect(page.locator('#field-email')).toBeVisible()
  })

  test('API công khai không trả yêu cầu báo giá', async ({ request }) => {
    const res = await request.get('/api/quote-requests')
    expect([401, 403]).toContain(res.status())
  })

  test('API công khai không trả danh sách tài khoản', async ({ request }) => {
    const res = await request.get('/api/users')
    expect([401, 403]).toContain(res.status())
  })

  test('API công khai không trả tệp bản vẽ khách gửi', async ({ request }) => {
    const res = await request.get('/api/quote-files')
    expect([401, 403]).toContain(res.status())
  })
})
