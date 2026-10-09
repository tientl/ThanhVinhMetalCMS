import { expect, test } from '@playwright/test'

test.describe('Tìm kiếm', () => {
  test('trang /tim-kiem trả kết quả khi gõ có dấu', async ({ page }) => {
    await page.goto('/tim-kiem?q=' + encodeURIComponent('vách'))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.locator('a[href^="/san-pham/"], a[href^="/bai-viet/"]').count()).toBeGreaterThan(0)
  })

  test('gõ không dấu vẫn ra kết quả', async ({ page }) => {
    await page.goto('/tim-kiem?q=vach')
    expect(await page.locator('a[href^="/san-pham/"], a[href^="/bai-viet/"]').count()).toBeGreaterThan(0)
  })

  test('từ khóa không khớp hiện thông báo không có kết quả', async ({ page }) => {
    await page.goto('/tim-kiem?q=zzzkhongcogikhopzzz')
    await expect(page.locator('main')).toContainText(/không tìm thấy|không có kết quả/i)
  })

  test('gõ vào ô tìm kiếm trên trang rồi gửi sẽ chuyển trang kèm từ khóa', async ({ page }) => {
    await page.goto('/tim-kiem')
    await page.locator('#search-q').fill('inox')
    await page.locator('#search-q').press('Enter')
    await expect(page).toHaveURL(/\/tim-kiem\?q=inox/)
  })

  test('ô tìm kiếm trên header mở ra và tự đặt con trỏ', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tìm kiếm' }).first().click()

    const input = page.locator('#site-search')
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
  })

  test('ô tìm kiếm trên header có chip gợi ý tìm nhanh', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tìm kiếm' }).first().click()

    const overlay = page.locator('#search-overlay')
    await expect(overlay).toContainText(/gợi ý tìm nhanh/i)
    expect(await overlay.locator('a.chip').count()).toBeGreaterThan(0)
  })

  test('gõ từ khóa rồi Enter chuyển sang trang kết quả', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tìm kiếm' }).first().click()
    await page.locator('#site-search').fill('vach')
    await page.locator('#site-search').press('Enter')

    await expect(page).toHaveURL(/\/tim-kiem\?q=vach/)
    expect(await page.locator('a[href^="/san-pham/"], a[href^="/bai-viet/"]').count()).toBeGreaterThan(0)
  })

  test('đóng ô tìm kiếm trên header', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tìm kiếm' }).first().click()
    await expect(page.locator('#search-overlay')).toBeVisible()

    await page.locator('#search-overlay').getByRole('button', { name: 'Đóng' }).click()
    await expect(page.locator('#search-overlay')).toHaveCount(0)
  })

  test('API tìm kiếm trả JSON đúng cấu trúc', async ({ request }) => {
    const res = await request.get('/api/search?q=vach')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.products)).toBe(true)
    expect(Array.isArray(data.posts)).toBe(true)
    if (data.products.length > 0) {
      expect(data.products[0]).toHaveProperty('name')
      expect(data.products[0].href).toMatch(/^\/san-pham\//)
    }
  })
})
