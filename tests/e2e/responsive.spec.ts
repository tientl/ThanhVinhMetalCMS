import { expect, test } from '@playwright/test'

import { useOwnRateLimitBucket } from './rate-limit'

/** Chạy với project `mobile` (Pixel 7) trong playwright.config.ts. */
test.describe('Giao diện trên điện thoại', () => {
  test('không bị tràn ngang ở các trang chính', async ({ page }) => {
    for (const path of ['/', '/san-pham', '/bai-viet', '/lien-he']) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `trang ${path} bị tràn ngang`).toBeLessThanOrEqual(1)
    }
  })

  test('trang chi tiết sản phẩm và bài viết cũng không tràn ngang', async ({ page }) => {
    await page.goto('/san-pham')
    await page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').first().click()
    let overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)

    await page.goto('/bai-viet')
    await page.locator('a[href^="/bai-viet/"]:not([href*="/danh-muc/"])').first().click()
    overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('menu chính thu lại thành nút mở menu', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Mở menu' })
    await expect(toggle).toBeVisible()

    await toggle.click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()

    await page.getByRole('button', { name: 'Đóng menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
  })

  test('menu mở ra dẫn sang trang liên hệ', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Mở menu' }).click()
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: /báo giá/i }).click()
    await expect(page).toHaveURL(/\/lien-he$/)
  })

  test('mục mega menu trong ngăn kéo mở ra danh sách liên kết', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Mở menu' }).click()

    const drawer = page.getByRole('dialog', { name: 'Menu' })
    const group = drawer.getByRole('button', { name: 'Sản phẩm' })
    await expect(group).toHaveAttribute('aria-expanded', 'false')

    await group.click()
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(await drawer.locator('a[href^="/san-pham"]').count()).toBeGreaterThan(0)
  })

  test('form báo giá dùng được trên điện thoại', async ({ page }, testInfo) => {
    await useOwnRateLimitBucket(page, testInfo)
    await page.goto('/lien-he')
    await expect(page.locator('#q-name')).toBeVisible()
    await page.locator('#q-name').fill('Khách Di Động')
    await page.locator('#q-phone').fill('0946272467')
    await page.getByRole('button', { name: /gửi/i }).click()
    await expect(page.locator('[role="status"]')).toContainText(/sẽ liên hệ|đã gửi/i)
  })

  test('thẻ sản phẩm xếp dọc gần hết bề ngang màn hình', async ({ page }) => {
    await page.goto('/san-pham')
    const card = page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').first()
    const box = await card.boundingBox()
    const viewport = page.viewportSize()!.width
    expect(box!.width).toBeGreaterThan(viewport * 0.5)
    expect(box!.width).toBeLessThanOrEqual(viewport)
  })

  test('nút gọi nhanh hiện trên màn hình nhỏ', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
  })

  test('điện thoại giữ tỉ lệ 100%, không phóng 110% như máy tính', async ({ page }) => {
    await page.goto('/')
    const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom)
    expect(zoom).toBe('1')
  })
})
