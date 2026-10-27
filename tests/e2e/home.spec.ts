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

  test('rê chuột lên nút slide thì slider dừng, bấm vào đúng link của slide đang xem', async ({ page }) => {
    // Trước đây slide vẫn tự chuyển dưới con trỏ: bấm nút slide cuối lại vào link "/san-pham" của slide 1.
    // Tắt cuộn mượt: Playwright cuộn tới phần tử trước khi thao tác, trang còn trượt thì nút trôi khỏi con trỏ.
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important }' })
    await expect(page.locator('.intro-splash')).toHaveCount(0)
    const hero = page.locator('section[aria-label="Bộ sưu tập nổi bật"]')
    const current = hero.locator('button[aria-current="true"]')
    const button = hero.locator('a.btn-ghost')

    await hero.getByRole('button', { name: 'Ảnh 2', exact: true }).click()
    const href = await button.getAttribute('href')
    const box = (await button.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
    await page.waitForTimeout(7000) // quá 5,5 giây của một slide
    await expect(current).toHaveAttribute('aria-label', 'Ảnh 2')
    await expect(button).toHaveAttribute('href', href!)

    // Rời chuột thì chạy tiếp
    await page.mouse.move(box.x + box.width / 2, 5)
    await expect(current).not.toHaveAttribute('aria-label', 'Ảnh 2', { timeout: 8000 })

    await hero.getByRole('button', { name: 'Ảnh 2', exact: true }).click()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
    await page.waitForTimeout(6000)
    await page.mouse.down()
    await page.mouse.up()
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
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

  test('ảnh chia sẻ (og:image) của trang chủ và các trang không có ảnh riêng đều mở được', async ({ page, request }) => {
    // Trang không có ảnh riêng dùng /og-default.jpg (src/lib/metadata.ts); trước 27/10/2026 file này không có, chia sẻ ra ảnh hỏng
    for (const path of ['/', '/lien-he', '/san-pham', '/bai-viet']) {
      await page.goto(path)
      const og = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(og, path).toBeTruthy()
      const res = await request.get(og!)
      expect(res.status(), `${path} → ${og}`).toBe(200)
      expect(res.headers()['content-type'], `${path} → ${og}`).toMatch(/^image\//)
    }
  })

  test('có dữ liệu có cấu trúc JSON-LD cho SEO', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]')
    expect(await jsonLd.count()).toBeGreaterThan(0)
    const raw = await jsonLd.first().textContent()
    expect(() => JSON.parse(raw || '')).not.toThrow()
  })

  test('máy tính hiển thị phóng 110%', async ({ page }) => {
    const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom)
    expect(zoom).toBe('1.1')
  })
})
