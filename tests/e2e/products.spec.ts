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

  test('ảnh phóng to là ảnh gốc đủ khung, không bị cắt theo khung slider 2:1', async ({ page, request }) => {
    // Chọn sản phẩm có ảnh đầu không phải 2:1 (cỡ "hero" cắt 2:1, trước 26/10 Lightbox dùng nhầm cỡ đó)
    type P = { slug: string; images: { image: { width: number; height: number } }[] }
    const { docs } = (await (await request.get('/api/products?limit=50&depth=1')).json()) as { docs: P[] }
    const product = docs.find((p) => {
      const img = p.images?.[0]?.image
      return img?.width && img.height && Math.abs(img.width / img.height - 2) > 0.3
    })!
    const original = product.images[0]!.image
    await page.goto(`/san-pham/${product.slug}`)
    await page.getByRole('button', { name: /xem ảnh lớn:/i }).click()

    const img = page.getByRole('dialog', { name: /ảnh phóng to/i }).locator('img')
    await expect(img).toBeVisible()
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
    const shown = await img.evaluate((el: HTMLImageElement) => {
      const box = el.getBoundingClientRect()
      return { natural: el.naturalWidth / el.naturalHeight, box: box.width / box.height, src: decodeURIComponent(el.currentSrc) }
    })
    const ratio = original.width / original.height
    expect(Math.abs(shown.natural - ratio), `tệp ảnh có tỉ lệ ${shown.natural}, ảnh gốc ${ratio}`).toBeLessThan(0.02)
    expect(Math.abs(shown.box - ratio), `khung hiện có tỉ lệ ${shown.box}, ảnh gốc ${ratio}`).toBeLessThan(0.02)
    expect(shown.src).not.toMatch(/-2400x1200\./)
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

  test('mô tả chi tiết rộng hết khung như trang tĩnh, kể cả đoạn chữ', async ({ page, request }) => {
    // Dữ liệu mẫu chưa có mô tả: tạo sản phẩm có mô tả bằng Quản trị, xong thì xóa
    const login = await request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
    const product = (await (await request.get('/api/products?limit=1&depth=0&where[_status][equals]=published', { headers })).json()).docs[0]
    const text = 'Tấm thép cắt laser theo bản vẽ, mép cắt sạch, chấn gấp và sơn tĩnh điện theo yêu cầu. '.repeat(6)
    const paragraph = { type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr', textFormat: 0, children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }
    const created = await request.post('/api/products', {
      headers,
      data: {
        name: `Zz Mô tả rộng ${Date.now()}`,
        category: product.category,
        images: [{ image: product.images[0].image }],
        description: { root: { type: 'root', version: 1, format: '', indent: 0, direction: 'ltr', children: [paragraph] } },
        _status: 'published',
      },
    })
    expect(created.ok(), await created.text()).toBe(true)
    const doc = ((await created.json()) as { doc: { id: number; slug: string } }).doc

    try {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`/san-pham/${doc.slug}`)
      const body = page.locator('.prose-wide .prose-lux').first()
      await expect(body).toBeVisible()
      // Trước 25/10 khung mô tả bị giới hạn 860px, bỏ trống nửa phải màn hình
      const gap = await body.evaluate((el) => {
        const section = el.closest('section')!
        const cs = getComputedStyle(section)
        return section.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - el.clientWidth
      })
      expect(Math.abs(gap)).toBeLessThanOrEqual(2)
      // Trước 26/10 đoạn chữ tối đa 1100px; giờ giãn hết khung
      await expect(body.locator('> p').first()).toHaveCSS('max-width', 'none')
    } finally {
      await request.delete(`/api/products/${doc.id}`, { headers })
    }
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

  test('nội dung bài viết rộng hết khung như trang tĩnh, tiêu đề thẳng hàng với nội dung', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/bai-viet')
    await page.locator('a[href^="/bai-viet/"]:not([href*="/danh-muc/"])').first().click()
    const column = page.locator('.article-column')
    await expect(column).toBeVisible()
    // Trước 26/10 là cột 860px; khách chọn giãn hết khung (áp chung bài viết, trang tĩnh, mô tả sản phẩm)
    const gap = await column.evaluate((el) => {
      const section = el.closest('section')!
      const cs = getComputedStyle(section)
      return section.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - el.clientWidth
    })
    expect(Math.abs(gap)).toBeLessThanOrEqual(2)
    await expect(column.locator('.prose-lux > p').first()).toHaveCSS('max-width', 'none')
    const [titleX, columnX] = await Promise.all([
      page.getByRole('heading', { level: 1 }).evaluate((el) => el.getBoundingClientRect().left),
      column.evaluate((el) => el.getBoundingClientRect().left),
    ])
    expect(Math.abs(titleX - columnX)).toBeLessThanOrEqual(2)
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

/**
 * Tóm tắt (sản phẩm, bài viết) và tên là chuỗi liền rất dài: trước đây không ngắt dòng, tràn khỏi cột và làm
 * cả trang cuộn ngang. Tạo dữ liệu bằng tài khoản Quản trị qua API rồi xóa đi.
 */
test.describe('Chữ khách nhập rất dài', () => {
  const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' }
  const LONG = 'test'.repeat(75) // 300 ký tự liền, đúng giới hạn của ô Tóm tắt

  const pageOverflow = (page: import('@playwright/test').Page) =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

  test('tóm tắt và tên dài liền không làm tràn thẻ, trang chi tiết, kết quả tìm kiếm', async ({ page, request }) => {
    const login = await request.post('/api/users/login', { data: ADMIN })
    expect(login.ok()).toBe(true)
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }

    const stamp = Date.now()
    // 79 ký tự liền: vừa dưới giới hạn tên sản phẩm 80 (src/fields/limits.ts)
    const name = `ZzTran${'dai'.repeat(20)}${stamp}`
    const product = (await (await request.get('/api/products?limit=1&depth=0&where[_status][equals]=published', { headers })).json()).docs[0]
    const post = (await (await request.get('/api/posts?limit=1&depth=0&where[_status][equals]=published', { headers })).json()).docs[0]

    const createdProduct = await request.post('/api/products', {
      headers,
      data: { name, summary: LONG, category: product.category, images: [{ image: product.images[0].image }], _status: 'published' },
    })
    expect(createdProduct.ok(), await createdProduct.text()).toBe(true)
    const productDoc = ((await createdProduct.json()) as { doc: { id: number; slug: string } }).doc

    const createdPost = await request.post('/api/posts', {
      headers,
      data: { title: name, excerpt: LONG, category: post.category, cover: post.cover, content: post.content, _status: 'published' },
    })
    expect(createdPost.ok(), await createdPost.text()).toBe(true)
    const postDoc = ((await createdPost.json()) as { doc: { id: number; slug: string } }).doc

    try {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 })

        await page.goto(`/san-pham/${productDoc.slug}`)
        await expect(page.locator('p.lead', { hasText: LONG.slice(0, 40) })).toBeVisible()
        expect(await pageOverflow(page), `chi tiết sản phẩm tràn ngang ở ${width}px`).toBeLessThanOrEqual(1)

        await page.goto(`/bai-viet/${postDoc.slug}`)
        await expect(page.locator('p.lead', { hasText: LONG.slice(0, 40) })).toBeVisible()
        expect(await pageOverflow(page), `chi tiết bài viết tràn ngang ở ${width}px`).toBeLessThanOrEqual(1)

        // Kết quả tìm kiếm dùng chung thẻ sản phẩm, thẻ bài viết với trang danh sách
        await page.goto(`/tim-kiem?q=${name}`)
        const summary = page.locator(`a[href="/san-pham/${productDoc.slug}"] span.line-clamp-2`)
        await expect(summary).toBeVisible()
        const clipped = await summary.evaluate((el) => el.scrollWidth - el.clientWidth)
        expect(clipped, `tóm tắt trên thẻ sản phẩm bị cắt ngang ở ${width}px`).toBeLessThanOrEqual(1)
        expect(await pageOverflow(page), `trang tìm kiếm tràn ngang ở ${width}px`).toBeLessThanOrEqual(1)
      }
    } finally {
      await request.delete(`/api/products/${productDoc.id}`, { headers })
      await request.delete(`/api/posts/${postDoc.id}`, { headers })
    }
  })
})

/**
 * Giá nhập tự do. Đổi giá thì trang chi tiết và mọi thẻ sản phẩm (danh sách, danh mục, tìm kiếm, "Sản phẩm liên quan"
 * ở trang khác) cập nhật; "Liên hệ" (mọi kiểu viết), để trống, chỉ có dấu cách thì trang chi tiết hiện "Liên hệ",
 * thẻ hiện "Xem sản phẩm". Trước 25/10, chỉ có dấu cách thì trang chi tiết hiện ô giá trắng.
 */
test.describe('Giá sản phẩm', () => {
  test('đổi giá: trang chi tiết và thẻ sản phẩm cập nhật; Liên hệ, trống, chỉ dấu cách dùng chữ dự phòng', async ({ page, request }) => {
    test.setTimeout(120_000)
    const login = await request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }

    // Sản phẩm "chủ" không chọn tay sản phẩm liên quan: mục liên quan lấy cùng danh mục, mới sửa trước
    type Doc = { id: number; slug: string; category: number; images: { image: number }[]; related?: unknown[]; _status?: string }
    const docs = ((await (await request.get('/api/products?limit=50&depth=0', { headers })).json()) as { docs: Doc[] }).docs
    // Sản phẩm mẫu đã xuất bản (trang dựng sẵn từ lúc build), không phải sản phẩm thử do test khác để lại
    const host = docs.find((d) => d._status === 'published' && !d.slug.startsWith('zz') && !d.related?.length && d.images?.length)!
    const categorySlug = ((await (await request.get(`/api/product-categories/${host.category}?depth=0`, { headers })).json()) as { slug: string }).slug

    const name = `Zz Giá ${Date.now()}`
    const created = await request.post('/api/products', {
      headers,
      data: { name, category: host.category, images: [{ image: host.images[0]!.image }], _status: 'published' },
    })
    expect(created.ok(), await created.text()).toBe(true)
    const doc = ((await created.json()) as { doc: Doc & { price: string } }).doc
    expect(doc.price).toBe('Liên hệ')

    const setPrice = async (price: string) => {
      const res = await request.patch(`/api/products/${doc.id}`, { headers, data: { price } })
      expect(res.ok(), await res.text()).toBe(true)
      return ((await res.json()) as { doc: { price: string } }).doc.price
    }
    const check = async (detail: string, onCard: string) => {
      await page.goto(`/san-pham/${doc.slug}`)
      await expect(page.locator('main dt', { hasText: 'Giá' }).locator('xpath=following-sibling::dd[1]')).toHaveText(detail)
      for (const path of ['/san-pham', `/san-pham/danh-muc/${categorySlug}`, `/tim-kiem?q=${encodeURIComponent(name)}`, `/san-pham/${host.slug}`]) {
        await page.goto(path)
        const card = page.locator(`main a[href="/san-pham/${doc.slug}"]`).first()
        await expect(card, `thẻ sản phẩm ở ${path}`).toContainText(onCard)
      }
    }

    try {
      await check('Liên hệ', 'Xem sản phẩm')

      expect(await setPrice('1.250.000đ/m²')).toBe('1.250.000đ/m²')
      await check('1.250.000đ/m²', '1.250.000đ/m²')

      // Chỉ có dấu cách: lưu thành trống, web dùng chữ dự phòng
      expect(await setPrice('     ')).toBe('')
      await check('Liên hệ', 'Xem sản phẩm')

      await setPrice('liên hệ')
      await check('Liên hệ', 'Xem sản phẩm')

      await setPrice('')
      await check('Liên hệ', 'Xem sản phẩm')
    } finally {
      await request.delete(`/api/products/${doc.id}`, { headers })
    }
  })
})
