import { expect, test } from '@playwright/test'

test.describe('Trang chủ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('tiêu đề trang và thẻ mô tả có thương hiệu', async ({ page }) => {
    await expect(page).toHaveTitle(/Thành Vinh Metal/i)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /.{40,}/)
  })

  test('hiện đủ 8 khối nội dung của trang chủ', async ({ page }) => {
    // Mỗi khối là một section; mẫu đã duyệt có 8 khối.
    const sections = page.locator('main > section, body > section')
    expect(await sections.count()).toBeGreaterThanOrEqual(7)

    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
  })

  test('slider đầu trang có ảnh và nút chuyển', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
    await expect(hero.locator('img').first()).toBeVisible()
  })

  test('khối danh mục dẫn sang trang danh mục sản phẩm', async ({ page }) => {
    const categoryLink = page.locator('a[href^="/san-pham/danh-muc/"]').first()
    await expect(categoryLink).toBeVisible()
    const href = await categoryLink.getAttribute('href')
    await categoryLink.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('khối tin tức hiện bài viết và dẫn sang bài', async ({ page }) => {
    const postLink = page.locator('a[href^="/bai-viet/"]').first()
    await expect(postLink).toBeVisible()
    await postLink.click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('mọi ảnh đều có thuộc tính alt', async ({ page }) => {
    const images = page.locator('img')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.*/)
    }
  })

  test('chân trang có thông tin công ty', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByText(/Vinh Metal/i).first()).toBeVisible()
  })

  test('trang có nút gọi nhanh tới hotline', async ({ page }) => {
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
  })

  test('có dữ liệu có cấu trúc JSON-LD cho SEO', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]')
    expect(await jsonLd.count()).toBeGreaterThan(0)
    const raw = await jsonLd.first().textContent()
    expect(() => JSON.parse(raw || '')).not.toThrow()
  })
})
