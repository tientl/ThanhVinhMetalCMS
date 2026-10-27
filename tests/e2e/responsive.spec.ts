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

  test('nút "Yêu cầu báo giá" cuối menu không bị thanh Gọi/Zalo/Báo giá che', async ({ page }) => {
    // Màn 386×760 menu dài hơn màn hình: cuộn hết cỡ thì nút cuối từng nằm dưới thanh đáy, bấm vào trúng thanh.
    await page.setViewportSize({ width: 386, height: 760 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Mở menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await drawer.evaluate((el) => el.scrollTo(0, el.scrollHeight))
    // click() chỉ bấm khi chính nút nhận được sự kiện, bị phần tử khác che là test lỗi
    await drawer.getByRole('link', { name: 'Yêu cầu báo giá' }).click({ timeout: 5_000 })
    await expect(page).toHaveURL(/\/lien-he$/)
  })

  test('nhãn hotspot khối ứng dụng không bị cắt, không đè nhau ở màn hẹp', async ({ page }) => {
    for (const width of [320, 386]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      const tabs = page.locator('#ung-dung [role="tab"]')
      for (let t = 0; t < (await tabs.count()); t++) {
        await tabs.nth(t).click()
        const frame = page.locator('#app-panel > div').first()
        // data-spot-label: nhãn hotspot (Applications.tsx); phải tìm thấy nhãn, kẻo test qua mà không kiểm gì
        expect(await frame.locator('[data-spot-label]').count(), `màn ${width}px, tab ${t + 1} không thấy nhãn hotspot`).toBeGreaterThan(0)
        const problems = await frame.evaluate((frame) => {
          const f = frame.getBoundingClientRect()
          const labels = [...frame.querySelectorAll<HTMLElement>('[data-spot-label]')].map((s) => ({ text: s.textContent, r: s.getBoundingClientRect() }))
          const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
          const out: string[] = []
          labels.forEach(({ text, r }, i) => {
            if (r.left < f.left - 0.5 || r.right > f.right + 0.5 || r.top < f.top - 0.5 || r.bottom > f.bottom + 0.5) out.push(`"${text}" bị cắt`)
            labels.slice(i + 1).forEach((o) => hit(r, o.r) && out.push(`"${text}" đè "${o.text}"`))
          })
          return out
        })
        expect(problems, `màn ${width}px, tab ${t + 1}`).toEqual([])
      }
    }
  })

  test('màn 320px không tràn ngang (header, khối liên hệ)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const path of ['/', '/lien-he', '/san-pham']) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `trang ${path} bị tràn ngang ở 320px`).toBeLessThanOrEqual(1)
      const searchRight = await page.getByRole('button', { name: 'Tìm kiếm' }).evaluate((el) => el.getBoundingClientRect().right)
      expect(searchRight, `nút tìm kiếm ra ngoài màn hình ở ${path}`).toBeLessThanOrEqual(320)
    }
  })
})
