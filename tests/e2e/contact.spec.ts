import { expect, test } from '@playwright/test'

import { useOwnRateLimitBucket } from './rate-limit'

// Thông báo lỗi của form; tách khỏi role="alert" mà Next gắn sẵn cho route announcer.
const formAlert = (page: import('@playwright/test').Page) => page.locator('form [role="alert"]')

test.describe('Trang liên hệ và form báo giá', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await useOwnRateLimitBucket(page, testInfo)
    await page.goto('/lien-he')
  })

  test('hiện thông tin liên hệ và form', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#q-name')).toBeVisible()
    await expect(page.locator('#q-phone')).toBeVisible()
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
  })

  test('gửi form hợp lệ hiện lời cảm ơn', async ({ page }) => {
    await page.locator('#q-name').fill('Khách E2E Hợp Lệ')
    await page.locator('#q-phone').fill('0946272467')
    await page.locator('#q-email').fill('e2e@example.com')
    await page.locator('#q-message').fill('Cần cắt 20 tấm thép 3mm theo bản vẽ.')
    await page.getByRole('button', { name: /gửi/i }).click()

    await expect(page.locator('[role="status"]')).toContainText(/sẽ liên hệ|đã gửi/i)
  })

  test('thiếu họ tên thì máy chủ báo lỗi, không lưu', async ({ page }) => {
    // Form đặt noValidate nên trình duyệt không chặn, máy chủ mới là nơi kiểm tra.
    await page.locator('#q-phone').fill('0946272467')
    await page.getByRole('button', { name: /gửi/i }).click()

    await expect(formAlert(page)).toContainText(/họ tên/i)
    await expect(page.locator('[role="status"]')).toHaveCount(0)
  })

  test('số điện thoại sai định dạng hiện lỗi từ máy chủ', async ({ page }) => {
    await page.locator('#q-name').fill('Khách E2E Sai SĐT')
    await page.locator('#q-phone').fill('123')
    await page.getByRole('button', { name: /gửi/i }).click()

    await expect(formAlert(page)).toContainText(/điện thoại/i)
  })

  test('email sai định dạng hiện lỗi từ máy chủ', async ({ page }) => {
    await page.locator('#q-name').fill('Khách E2E Sai Email')
    await page.locator('#q-phone').fill('0946272467')
    await page.locator('#q-email').fill('sai-email')
    await page.getByRole('button', { name: /gửi/i }).click()

    await expect(formAlert(page)).toContainText(/email/i)
  })

  test('tệp sai định dạng bị chặn ngay trên trình duyệt', async ({ page }) => {
    await page.locator('#q-name').fill('Khách E2E Tệp Sai')
    await page.locator('#q-phone').fill('0946272467')
    await page.locator('input[name="attachment"]').setInputFiles({
      name: 'virus.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ'),
    })
    await page.getByRole('button', { name: /gửi/i }).click()

    await expect(formAlert(page)).toContainText(/DXF/i)
  })

  test('trường bẫy bot nằm ngoài màn hình và bị đánh dấu aria-hidden', async ({ page }) => {
    const honeypot = page.locator('#q-website')
    await expect(honeypot).toHaveCount(1)

    // Ô bẫy bot đẩy ra ngoài khung nhìn chứ không dùng display:none,
    // để bot vẫn điền còn người thật thì không thấy.
    const box = await honeypot.boundingBox()
    expect(box!.x + box!.width).toBeLessThan(0)
    await expect(page.locator('[aria-hidden="true"]').filter({ has: honeypot })).toHaveCount(1)
  })
})

/** Tính năng đăng ký bản tin đã bỏ ngày 27/10/2026 (xem docs/CHANGELOG.md). */
test.describe('Đăng ký bản tin đã bỏ', () => {
  test('khối liên hệ không còn ô đăng ký, API cũ trả 404', async ({ page, request }) => {
    await page.goto('/lien-he')
    await expect(page.locator('#q-name')).toBeVisible()
    await expect(page.locator('#nl-email')).toHaveCount(0)
    const res = await request.post('/api/subscribe', { data: { email: 'zz-da-bo@example.com' } })
    expect(res.status()).toBe(404)
  })
})

test.describe('Nút liên hệ nhanh', () => {
  test('có liên kết gọi điện và Zalo', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
    await expect(page.locator('a[href*="zalo.me"]').first()).toBeAttached()
  })
})
