import { expect, test } from '@playwright/test'

import { randomIp } from './rate-limit'
import { EDITOR_EMAIL, EDITOR_PASSWORD } from './paths'

/**
 * Chạy với project `editor`: đã đăng nhập bằng tài khoản Nhân viên (editor.setup.ts).
 * Nhân viên được lưu nháp hoặc xuất bản nội dung, sửa chi tiết yêu cầu báo giá,
 * thêm, sửa danh mục; không thấy menu, thông tin công ty, thống kê truy cập, danh sách tài khoản.
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

  test('sản phẩm mới: có cả nút Lưu bản nháp và Xuất bản', async ({ page }) => {
    await page.goto('/admin/collections/products/create')
    await expect(page.getByRole('button', { name: /lưu bản nháp/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /xuất bản tài liệu/i })).toBeVisible()
  })

  test('xuất bản sản phẩm trùng tên: hỏi xác nhận và cho quay lại sửa', async ({ page, request }) => {
    const response = await request.get('/api/products?limit=1&depth=0')
    expect(response.ok()).toBe(true)
    const existing = (await response.json()).docs[0] as { name: string }

    await page.goto('/admin/collections/products/create')
    await page.locator('#field-name').fill(existing.name)
    await page.getByRole('button', { name: 'Xuất bản tài liệu' }).click()

    const dialog = page.locator('.confirmation-modal')
    await expect(dialog.getByRole('heading', { name: 'Tên sản phẩm đã tồn tại' })).toBeVisible()
    await expect(dialog).toContainText(existing.name)
    await expect(dialog.getByRole('button', { name: 'Vẫn xuất bản' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Quay lại chỉnh sửa' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('#field-name')).toHaveValue(existing.name)
  })

  test('xuất bản sản phẩm trùng tên: xác nhận thì bản nháp được xuất bản', async ({ page, request }) => {
    const login = await request.post('/api/users/login', {
      data: { email: EDITOR_EMAIL, password: EDITOR_PASSWORD },
    })
    expect(login.ok()).toBe(true)
    const { token } = (await login.json()) as { token: string }
    const headers = { Authorization: `JWT ${token}` }

    const response = await request.get('/api/products?limit=1&depth=0')
    expect(response.ok()).toBe(true)
    const existing = (await response.json()).docs[0] as {
      name: string
      category: number
      images: { image: number }[]
    }
    const created = await request.post('/api/products?draft=true', {
      headers,
      data: {
        name: existing.name,
        category: existing.category,
        images: [{ image: existing.images[0]!.image }],
        slug: '',
        _status: 'draft',
      },
    })
    expect(created.ok()).toBe(true)
    const { doc } = (await created.json()) as { doc: { id: number } }

    await page.goto(`/admin/collections/products/${doc.id}`)
    await page.getByRole('button', { name: 'Xuất bản tài liệu' }).click()
    const dialog = page.locator('.confirmation-modal')
    await expect(dialog.getByRole('heading', { name: 'Tên sản phẩm đã tồn tại' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Vẫn xuất bản' }).click()

    await expect.poll(async () => {
      const published = await request.get(`/api/products/${doc.id}?depth=0`, { headers })
      return published.ok() ? (await published.json())._status : null
    }).toBe('published')
  })

  test('xuất bản bản nháp tên duy nhất: không hỏi xác nhận', async ({ page, request }) => {
    const login = await request.post('/api/users/login', {
      data: { email: EDITOR_EMAIL, password: EDITOR_PASSWORD },
    })
    expect(login.ok()).toBe(true)
    const { token } = (await login.json()) as { token: string }
    const headers = { Authorization: `JWT ${token}` }

    const response = await request.get('/api/products?limit=1&depth=0')
    const existing = (await response.json()).docs[0] as { category: number; images: { image: number }[] }
    const created = await request.post('/api/products?draft=true', {
      headers,
      data: {
        name: `Zz E2E Tên Riêng ${Date.now()}`,
        category: existing.category,
        images: [{ image: existing.images[0]!.image }],
        _status: 'draft',
      },
    })
    expect(created.ok()).toBe(true)
    const { doc } = (await created.json()) as { doc: { id: number } }

    await page.goto(`/admin/collections/products/${doc.id}`)
    await page.getByRole('button', { name: 'Xuất bản tài liệu' }).click()
    await expect(page.locator('.confirmation-modal')).toHaveCount(0)
    await expect.poll(async () => {
      const published = await request.get(`/api/products/${doc.id}?depth=0`, { headers })
      return published.ok() ? (await published.json())._status : null
    }).toBe('published')
  })

  test('danh sách sản phẩm: chọn dòng có nút xuất bản hàng loạt', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr input[type="checkbox"]').first().check()
    await expect(page.locator('.list-selection button[aria-label="Xuất bản"]')).toBeVisible()
  })

  test('danh mục sản phẩm: tạo, sửa được; không có nút Xóa', async ({ page }) => {
    await page.goto('/admin/collections/product-categories')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page.locator('a[href$="/product-categories/create"]').first()).toBeVisible()

    // Chọn dòng: không có nút xóa hàng loạt
    await page.locator('table tbody tr input[type="checkbox"]').first().check()
    await expect(page.locator('.list-selection button[aria-label="Xóa"]')).toHaveCount(0)

    // Trang sửa: ô nhập sửa được, menu "..." có Tạo mới nhưng không có Xóa
    await page.locator('table tbody tr td.cell-name a').first().click()
    await expect(page.locator('#field-name')).toBeEditable()
    await page.locator('.doc-controls__dots').click()
    await expect(page.locator('#action-create')).toBeVisible()
    await expect(page.locator('#action-delete')).toHaveCount(0)
  })

  test('yêu cầu báo giá: sửa được thông tin khách và trạng thái', async ({ page, request }) => {
    const name = `Zz E2E Nhân Viên ${Date.now()}`
    const sent = await request.post('/api/quote', { multipart: { name, phone: '0946272467' }, headers: { 'x-forwarded-for': randomIp() } })
    expect(sent.ok()).toBe(true)

    await page.goto(`/admin/collections/quote-requests?search=${encodeURIComponent(name)}`)
    await page.getByRole('link', { name }).first().click()
    await expect(page.locator('#field-name')).toBeEditable()
    await expect(page.locator('#field-phone')).toBeEditable()
    await expect(page.locator('#field-email')).toBeEditable()
    await expect(page.locator('#field-company')).toBeEditable()
    await expect(page.locator('#field-message')).toBeEditable()
    await expect(page.locator('#field-attachment .upload__createNewToggler')).toBeVisible()
    await page.locator('#field-phone').fill('0946272468')
    await page.locator('#field-status .rs__control').click()
    await page.locator('.rs__option', { hasText: 'Đã liên hệ' }).click()
    await page.getByRole('button', { name: 'Lưu', exact: true }).click()
    await expect(page.getByText(/thành công/i).first()).toBeVisible()
    await expect(page.locator('#field-phone')).toHaveValue('0946272468')
  })

  test('trang Tài khoản của tôi vẫn mở được, trang Thông tin công ty thì không', async ({ page }) => {
    await page.goto('/admin/account')
    await expect(page.locator('#field-name')).toBeVisible()
    await page.goto('/admin/globals/site-settings')
    await expect(page.locator('#field-brandName')).toHaveCount(0)
  })
})
