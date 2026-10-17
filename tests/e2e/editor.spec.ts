import { expect, test } from '@playwright/test'

import { randomIp } from './rate-limit'

/**
 * Chạy với project `editor`: đã đăng nhập bằng tài khoản Nhân viên (editor.setup.ts).
 * Chính sách: chỉ lưu nháp (Quản trị duyệt, xuất bản); được sửa trang chủ; không thêm, sửa danh mục;
 * yêu cầu báo giá chỉ đổi trạng thái; không thấy menu, thông tin công ty, thống kê truy cập, danh sách tài khoản.
 * Phía API đã có tests/int/editor.test.ts; ở đây kiểm giao diện.
 */
test.describe('Trang quản trị, vai trò Nhân viên', () => {
  test('menu trái không có các mục chỉ Quản trị dùng', async ({ page }) => {
    await page.goto('/admin')
    const nav = page.locator('aside.nav')
    await expect(nav.getByRole('link', { name: 'Sản phẩm', exact: true })).toBeAttached()
    await expect(nav.getByRole('link', { name: 'Trang chủ', exact: true })).toBeAttached()
    for (const label of ['Menu và mega menu', 'Thông tin công ty', 'Thống kê truy cập']) {
      await expect(nav.getByRole('link', { name: label })).toHaveCount(0)
    }
    await expect(nav.locator('a[href="/admin/collections/users"]')).toHaveCount(0)
  })

  test('sản phẩm mới: chỉ có nút Lưu bản nháp, không có nút Xuất bản', async ({ page }) => {
    await page.goto('/admin/collections/products/create')
    await expect(page.getByRole('button', { name: /lưu bản nháp/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /xuất bản tài liệu/i })).toHaveCount(0)
    await expect(page.getByText('Chỉ lưu nháp, chờ Quản trị duyệt')).toBeVisible()
  })

  test('danh sách sản phẩm: chọn dòng không hiện nút xuất bản hàng loạt', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr input[type="checkbox"]').first().check()
    await expect(page.locator('.list-selection button[aria-label="Xuất bản"]')).toBeHidden()
  })

  test('danh mục sản phẩm: không có nút Tạo mới', async ({ page }) => {
    await page.goto('/admin/collections/product-categories')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page.locator('a[href$="/product-categories/create"]')).toHaveCount(0)
  })

  test('yêu cầu báo giá: thông tin khách chỉ xem, trạng thái đổi được', async ({ page, request }) => {
    const name = `Zz E2E Nhân Viên ${Date.now()}`
    const sent = await request.post('/api/quote', { multipart: { name, phone: '0946272467' }, headers: { 'x-forwarded-for': randomIp() } })
    expect(sent.ok()).toBe(true)

    await page.goto(`/admin/collections/quote-requests?search=${encodeURIComponent(name)}`)
    await page.getByRole('link', { name }).first().click()
    await expect(page.locator('#field-name')).toBeDisabled()
    await expect(page.locator('#field-phone')).toBeDisabled()
    await page.locator('#field-status .rs__control').click()
    await page.locator('.rs__option', { hasText: 'Đã liên hệ' }).click()
    await page.getByRole('button', { name: 'Lưu', exact: true }).click()
    await expect(page.getByText(/thành công/i).first()).toBeVisible()
  })

  test('trang Tài khoản của tôi vẫn mở được, trang Thông tin công ty thì không', async ({ page }) => {
    await page.goto('/admin/account')
    await expect(page.locator('#field-name')).toBeVisible()
    await page.goto('/admin/globals/site-settings')
    await expect(page.locator('#field-brandName')).toHaveCount(0)
  })
})
