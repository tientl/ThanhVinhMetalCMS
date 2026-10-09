import { expect, test } from '@playwright/test'

test.describe('Header và menu', () => {
  test('menu chính hiện các mục từ global Điều hướng', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Menu chính' }).first()
    await expect(nav).toBeVisible()
    expect(await nav.getByRole('link').count()).toBeGreaterThan(1)
  })

  test('mở mega menu Sản phẩm thấy danh mục và bấm vào được', async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByRole('button', { name: 'Sản phẩm' }).click()

    const link = page.locator('a[href^="/san-pham/"]').first()
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
  })

  test('bấm logo quay về trang chủ', async ({ page }) => {
    await page.goto('/san-pham')
    await page.locator('header a[href="/"]').first().click()
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('Chế độ sáng và tối', () => {
  test('mặc định là nền tối', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light')
  })

  test('bấm nút đổi sang nền sáng rồi đổi lại', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Chuyển sang chế độ sáng' }).first().click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: 'Chuyển sang chế độ tối' }).first().click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light')
  })

  test('lựa chọn được nhớ sang trang khác', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Chuyển sang chế độ sáng' }).first().click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    const stored = await page.evaluate(() => localStorage.getItem('theme'))
    expect(stored).toBe('light')

    await page.goto('/san-pham')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('không nháy nền tối khi vào trang với chế độ sáng đã lưu', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('theme', 'light'))
    await page.goto('/')
    // Script trong <head> áp theme trước khi vẽ, nên ngay khi tải xong đã là sáng.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('Màu chủ đạo từ admin', () => {
  test('biến CSS màu chủ đạo được gắn lên thẻ html', async ({ page }) => {
    await page.goto('/')
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(),
    )
    expect(accent).toMatch(/^#|^rgb/)
  })
})

test.describe('Trang kỹ thuật cho SEO', () => {
  test('robots.txt mở được', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    expect(await res.text()).toContain('Sitemap')
  })

  test('sitemap.xml liệt kê các trang', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('/san-pham')
  })
})
