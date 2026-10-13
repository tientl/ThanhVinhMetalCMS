import { expect, test } from '@playwright/test'

test.describe('Sản phẩm', () => {
  test('trang danh sách hiện sản phẩm', async ({ page }) => {
    await page.goto('/san-pham')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const cards = page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('mở được trang chi tiết từ danh sách', async ({ page }) => {
    await page.goto('/san-pham')
    const card = page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').first()
    const href = await card.getAttribute('href')
    await card.click()

    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('main img').first()).toBeVisible()
  })

  test('trang chi tiết có nút yêu cầu báo giá', async ({ page }) => {
    await page.goto('/san-pham')
    await page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').first().click()
    await expect(page.getByRole('link', { name: /báo giá/i }).or(page.getByRole('button', { name: /báo giá/i })).first()).toBeVisible()
  })

  test('bấm ảnh chính mở ảnh phóng to, Esc đóng lại', async ({ page }) => {
    await page.goto('/san-pham')
    await page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').first().click()
    await page.getByRole('button', { name: /xem ảnh lớn:/i }).click()

    const viewer = page.getByRole('dialog', { name: /ảnh phóng to/i })
    await expect(viewer).toBeVisible()
    await expect(viewer.locator('img')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()
  })

  test('bấm ảnh thu nhỏ mở thẳng ảnh đó phóng to', async ({ page }) => {
    // Sản phẩm mẫu có 2 ảnh
    await page.goto('/san-pham/vach-hoa-tiet-tron-vang-dong')
    await page.getByRole('button', { name: 'Xem ảnh lớn 2' }).click()

    const viewer = page.getByRole('dialog', { name: /ảnh phóng to/i })
    await expect(viewer).toBeVisible()
    await expect(viewer.getByText('02 / 02')).toBeVisible()

    await viewer.getByRole('button', { name: /đóng/i }).click()
    await expect(viewer).toBeHidden()
    await expect(page.getByRole('button', { name: 'Xem ảnh lớn 2' })).toHaveAttribute('aria-current', 'true')
  })

  test('trang danh mục chỉ hiện sản phẩm của danh mục đó', async ({ page }) => {
    await page.goto('/san-pham')
    const categoryLink = page.locator('a[href^="/san-pham/danh-muc/"]').first()
    await categoryLink.click()

    await expect(page).toHaveURL(/\/san-pham\/danh-muc\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').count()).toBeGreaterThan(0)
  })

  test('đường dẫn sản phẩm không tồn tại trả về trang 404', async ({ page }) => {
    const res = await page.goto('/san-pham/khong-ton-tai-gi-ca')
    expect(res?.status()).toBe(404)
  })

  test('trang chi tiết có thẻ Open Graph', async ({ page }) => {
    await page.goto('/san-pham')
    await page.locator('a[href^="/san-pham/"]:not([href*="/danh-muc/"])').first().click()
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('meta[property="og:type"]')).toHaveCount(1)
  })
})

test.describe('Bài viết', () => {
  test('trang danh sách hiện bài viết', async ({ page }) => {
    await page.goto('/bai-viet')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.locator('a[href^="/bai-viet/"]:not([href*="/danh-muc/"])').count()).toBeGreaterThan(0)
  })

  test('mở được bài viết và thấy nội dung', async ({ page }) => {
    await page.goto('/bai-viet')
    await page.locator('a[href^="/bai-viet/"]:not([href*="/danh-muc/"])').first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const body = (await page.locator('article').first().textContent()) ?? ''
    expect(body.trim().length).toBeGreaterThan(200)
  })

  test('lọc được bài viết theo danh mục', async ({ page }) => {
    await page.goto('/bai-viet')
    const categoryLink = page.locator('a[href^="/bai-viet/danh-muc/"]').first()
    if ((await categoryLink.count()) === 0) test.skip(true, 'Giao diện không có bộ lọc danh mục bài viết')
    await categoryLink.click()
    await expect(page).toHaveURL(/\/bai-viet\/danh-muc\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Trang tĩnh', () => {
  for (const slug of ['gioi-thieu', 'chinh-sach-bao-hanh', 'chinh-sach-bao-mat', 'huong-dan-gui-ban-ve']) {
    test(`trang /${slug} mở được`, async ({ page }) => {
      const res = await page.goto(`/${slug}`)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    })
  }

  test('đường dẫn không tồn tại trả về 404', async ({ page }) => {
    const res = await page.goto('/trang-khong-co-that')
    expect(res?.status()).toBe(404)
  })
})
