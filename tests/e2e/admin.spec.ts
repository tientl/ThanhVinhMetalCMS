import { expect, test, type Locator, type Page } from '@playwright/test'

import { randomIp } from './rate-limit'

/** Chờ trình xem ảnh của admin gắn xong (trang đã hydrate); bấm sớm hơn thì link vẫn điều hướng như cũ. */
const viewerReady = (page: Page) => expect(page.locator('html')).toHaveAttribute('data-image-viewer-ready', 'true')

/**
 * Chạy với project `admin`: đã đăng nhập sẵn bằng cookie từ `auth.setup.ts`.
 * Các test cần vai trò khách tự xóa trạng thái đăng nhập ở describe riêng bên dưới.
 */
test.describe('Trang quản trị, đã đăng nhập', () => {
  test('bảng điều khiển có lời chào và ô thống kê', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /xin chào/i })).toBeVisible()
    expect(await page.locator('.dash-stat').count()).toBeGreaterThan(0)
  })

  test('menu bên trái có nhóm Sản phẩm và Liên hệ', async ({ page }) => {
    await page.goto('/admin')
    const nav = page.locator('nav').first()
    await expect(nav).toContainText(/Sản phẩm/i)
    await expect(nav).toContainText(/Liên hệ/i)
  })

  test('danh sách sản phẩm hiện dữ liệu', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await expect(page.getByRole('heading', { name: /sản phẩm/i }).first()).toBeVisible()
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0)
  })

  for (const slug of ['products', 'product-categories']) {
    test(`danh sách ${slug} có cột ảnh đứng trước tên, bấm tên vẫn mở trang sửa`, async ({ page }) => {
      await page.goto(`/admin/collections/${slug}`)
      const ids = await page.locator('table thead th').evaluateAll((ths) => ths.map((th) => th.id))
      expect(ids).toContain('heading-thumbnail')
      expect(ids.indexOf('heading-thumbnail')).toBeLessThan(ids.indexOf('heading-name'))

      const firstRow = page.locator('table tbody tr').first()
      await expect(firstRow.locator('td.cell-thumbnail img')).toHaveAttribute('src', /\/media\//)

      await firstRow.locator('td.cell-name a').click()
      await expect(page).toHaveURL(new RegExp(`/admin/collections/${slug}/\\d+$`))
    })
  }

  test('mở được một sản phẩm để sửa', async ({ page }) => {
    await page.goto('/admin/collections/products')
    // Bấm tên (bấm ảnh ở cột đầu là mở ảnh phóng to)
    await page.locator('table tbody tr td.cell-name a').first().click()
    await expect(page).toHaveURL(/\/admin\/collections\/products\/\d+/)
    await expect(page.locator('#field-name')).toBeVisible()
  })

  test('danh sách yêu cầu báo giá mở được', async ({ page }) => {
    await page.goto('/admin/collections/quote-requests')
    await expect(page.getByRole('heading', { name: /yêu cầu báo giá/i }).first()).toBeVisible()
  })

  test('yêu cầu báo giá có danh sách phiên bản như sản phẩm', async ({ page, request }) => {
    const name = `Zz E2E Lịch Sử ${Date.now()}`
    const form = { name, phone: '0946272467' }
    const sent = await request.post('/api/quote', { multipart: form, headers: { 'x-forwarded-for': randomIp() } })
    expect(sent.ok()).toBe(true)

    await page.goto('/admin/collections/quote-requests')
    await page.getByRole('link', { name }).first().click()
    await expect(page).toHaveURL(/\/admin\/collections\/quote-requests\/\d+$/)

    await page.getByRole('link', { name: /danh sách phiên bản/i }).click()
    await expect(page).toHaveURL(/\/versions/)
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0)
  })

  test('nút khôi phục chỉ hiện ở phiên bản khác nội dung hiện tại', async ({ page, request }) => {
    const name = `Zz E2E Khôi Phục ${Date.now()}`
    const sent = await request.post('/api/quote', {
      multipart: { name, phone: '0989541246' },
      headers: { 'x-forwarded-for': randomIp() },
    })
    expect(sent.ok()).toBe(true)

    // Sửa số điện thoại để có 2 phiên bản: bản gốc và bản hiện tại
    await page.goto('/admin/collections/quote-requests')
    await page.getByRole('link', { name }).first().click()
    await page.locator('#field-phone').fill('0989541249')
    await page.getByRole('button', { name: 'Lưu', exact: true }).click()
    await expect(page.getByText(/thành công/i).first()).toBeVisible()

    await page.getByRole('link', { name: /danh sách phiên bản/i }).click()
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(2)
    // Danh sách phiên bản dễ hiểu: mới nhất ở trên, đánh số lần lưu, ghi ô đã đổi
    await expect(rows.first()).toContainText('Lần 2')
    await expect(rows.first()).toContainText('Hiện tại')
    await expect(rows.first().locator('.vlist__change')).toHaveText('Điện thoại')
    await expect(rows.last()).toContainText('Lần 1')
    await expect(rows.last().locator('.vlist__change')).toHaveText('Bản đầu tiên')
    const restore = page.getByRole('button', { name: /khôi phục/i })

    // Dòng trên cùng là bản mới nhất, giống hệt nội dung hiện tại: không có nút khôi phục
    await rows.first().locator('a').first().click()
    await expect(page.locator('html')).toHaveAttribute('data-version-restore', 'same')
    await expect(restore).toBeHidden()

    // Bản gốc khác số điện thoại: có nút khôi phục
    await page.goBack()
    await rows.last().locator('a').first().click()
    await expect(page.locator('html')).toHaveAttribute('data-version-restore', 'different')
    await expect(restore).toBeVisible()
  })

  test('trạng thái Cần liên hệ lại: 4 ô lọc, nhãn màu, huy hiệu vàng trên menu', async ({ page, request }) => {
    const name = `Zz E2E Gọi Lại ${Date.now()}`
    const sent = await request.post('/api/quote', { multipart: { name, phone: '0946272467' }, headers: { 'x-forwarded-for': randomIp() } })
    expect(sent.ok()).toBe(true)

    // Đổi trạng thái sang "Cần liên hệ lại"
    await page.goto('/admin/collections/quote-requests')
    await page.getByRole('link', { name }).first().click()
    await page.locator('#field-status .rs__control').click()
    await page.locator('.rs__option', { hasText: 'Cần liên hệ lại' }).click()
    await page.getByRole('button', { name: 'Lưu', exact: true }).click()
    await expect(page.getByText(/thành công/i).first()).toBeVisible()

    await page.goto('/admin/collections/quote-requests')
    await expect(page.locator('.qs-card')).toHaveCount(4)
    await expect(page.locator('#nav-quote-requests .nav-badge--callback')).toBeVisible()

    // Bấm ô "Cần liên hệ lại": chỉ còn yêu cầu trạng thái đó
    const card = page.locator('.qs-card.qs--callback')
    await card.click()
    await expect(card).toHaveClass(/qs-card--active/)
    await expect(page).toHaveURL(/callback/)
    // Bảng tải lại bất đồng bộ sau khi lọc: dùng kiểm tra có tự chờ
    await expect(page.locator('td.cell-status .qs-pill:not(.qs--callback)')).toHaveCount(0)
    await expect(page.locator('td.cell-status .qs-pill').first()).toHaveText('Cần liên hệ lại')
    await expect(page.getByRole('link', { name })).toBeVisible()

    // Bấm lại ô đang chọn thì bỏ lọc
    await card.click()
    await expect(card).not.toHaveClass(/qs-card--active/)
    await expect(page).not.toHaveURL(/callback/)
  })

  test('trang phiên bản mới vào hiện toàn bộ nội dung, tick lại "Chỉ được sửa đổi" được', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr td.cell-name a').first().click()
    await page.getByRole('link', { name: /danh sách phiên bản/i }).click()
    await page.locator('table tbody tr a').first().click()

    await expect(page).toHaveURL(/modifiedOnly=false/)
    const modifiedOnly = page.getByRole('checkbox', { name: /chỉ được sửa đổi/i })
    await expect(modifiedOnly).not.toBeChecked()

    // Bản mới nhất giống nội dung hiện tại: sản phẩm (có nháp) cũng không có nút khôi phục
    await expect(page.locator('html')).toHaveAttribute('data-version-restore', 'same')
    await expect(page.locator('.view-version__restore')).toBeHidden()

    await modifiedOnly.check()
    await expect(page).not.toHaveURL(/modifiedOnly/)
    await expect(modifiedOnly).toBeChecked()
  })

  test('bấm ảnh nhỏ hoặc tên tệp ở ô ảnh trong form thì xem ảnh phóng to', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr td.cell-name a').first().click()
    await page.waitForURL(/\/admin\/collections\/products\/\d+$/)
    await viewerReady(page)
    const url = page.url()
    const card = page.locator('.upload-relationship-details').first()
    const viewer = page.getByRole('dialog', { name: /xem ảnh/i })

    await card.locator('.upload-relationship-details__filename a').click()
    await expect(viewer).toBeVisible()
    await expect(viewer.locator('img.img-viewer__img')).toBeVisible()
    expect(page.url()).toBe(url)
    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()

    await card.locator('.upload-relationship-details__thumbnail').click()
    await expect(viewer).toBeVisible()
    await viewer.getByRole('button', { name: /đóng/i }).click()
    await expect(viewer).toBeHidden()
  })

  test('ảnh nhỏ ở trang so sánh phiên bản, danh sách Ảnh và tệp, cột Ảnh sản phẩm đều phóng to được', async ({ page }) => {
    const viewer = page.getByRole('dialog', { name: /xem ảnh/i })

    // Trang so sánh phiên bản: mở ảnh gốc, không phải ảnh thumb 300x300
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr td.cell-name a').first().click()
    await page.getByRole('link', { name: /danh sách phiên bản/i }).click()
    await page.locator('table tbody tr a').first().click()
    await viewerReady(page)
    await page.locator('.upload-diff__thumbnail').first().click()
    await expect(viewer).toBeVisible()
    await expect(viewer.locator('img.img-viewer__img')).not.toHaveAttribute('src', /-\d+x\d+\.\w+$/)
    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()

    // Danh sách Ảnh và tệp: bấm ảnh thì phóng to, không chuyển sang trang sửa
    await page.goto('/admin/collections/media')
    await viewerReady(page)
    await page.locator('table tbody tr .file__thumbnail').first().click()
    await expect(viewer).toBeVisible()
    await expect(page).not.toHaveURL(/\/admin\/collections\/media\/\d+/)
    await page.keyboard.press('Escape')

    // Cột Ảnh của danh sách sản phẩm: bấm ảnh phóng to (bấm tên vẫn mở trang sửa, có test riêng)
    await page.goto('/admin/collections/products')
    await viewerReady(page)
    await page.locator('td.cell-thumbnail img').first().click()
    await expect(viewer).toBeVisible()
    await expect(page).not.toHaveURL(/\/admin\/collections\/products\/\d+/)
  })

  test('hộp "Chọn từ thư viện": bấm ảnh vẫn là chọn ảnh, không mở trình xem', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await page.locator('table tbody tr td.cell-name a').first().click()
    await page.waitForURL(/\/admin\/collections\/products\/\d+$/)
    const cards = page.locator('.upload-relationship-details')
    await expect(cards.first()).toBeVisible()
    await viewerReady(page)
    const before = await cards.count()

    await page.getByRole('button', { name: /thêm: ảnh/i }).first().click()
    await page.getByRole('button', { name: /chọn từ thư viện/i }).last().click()
    const drawer = page.locator('.list-drawer')
    await expect(drawer).toBeVisible()
    await drawer.locator('table tbody tr .file__thumbnail').first().click()

    await expect(page.getByRole('dialog', { name: /xem ảnh/i })).toHaveCount(0)
    await expect(drawer).toBeHidden()
    await expect(cards).toHaveCount(before + 1)
  })

  test('nội dung yêu cầu báo giá rất dài (chuỗi liền) không kéo giãn bảng danh sách', async ({ page, request }) => {
    const name = `Zz E2E Dài ${Date.now()}`
    const sent = await request.post('/api/quote', {
      multipart: { name, phone: '0946272467', message: 'cac'.repeat(400) },
      headers: { 'x-forwarded-for': randomIp() },
    })
    expect(sent.ok()).toBe(true)

    // Bật cột Nội dung như khi nhân viên chọn trong "Hiển thị cột"
    const columns = JSON.stringify(['name', 'phone', 'message', 'status', 'createdAt'])
    await page.goto(`/admin/collections/quote-requests?columns=${encodeURIComponent(columns)}`)
    await expect(page.locator('td.cell-message').first()).toBeVisible()
    const overflow = await page.locator('.table').first().evaluate((el) => el.scrollWidth - el.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('khôi phục phiên bản là bản nháp chưa đủ ô bắt buộc vẫn thành công', async ({ page }) => {
    // Sản phẩm nháp chỉ có tên (chưa có danh mục, ảnh): lưu nháp không kiểm tra ô bắt buộc
    const name = `Zz E2E Nháp ${Date.now()}`
    await page.goto('/admin/collections/products/create')
    await page.locator('#field-name').fill(name)
    await page.getByRole('button', { name: /lưu bản nháp/i }).click()
    await page.waitForURL(/\/admin\/collections\/products\/\d+$/)
    await page.locator('#field-name').fill(`${name} sửa`)
    await page.getByRole('button', { name: /lưu bản nháp/i }).click()
    await expect(page.locator('#field-name')).toHaveValue(`${name} sửa`)
    await expect(page.getByRole('button', { name: /lưu bản nháp/i })).toBeDisabled()

    await page.getByRole('link', { name: /danh sách phiên bản/i }).click()
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(2)
    await rows.last().locator('a').first().click()
    await expect(page.locator('html')).toHaveAttribute('data-version-restore', 'different')

    await page.locator('.view-version__restore button').first().click()
    await page.getByRole('button', { name: 'Xác nhận' }).click()
    await page.waitForURL(/\/admin\/collections\/products\/\d+$/)
    await expect(page.locator('#field-name')).toHaveValue(name)
  })

  test('cài đặt chung mở được', async ({ page }) => {
    await page.goto('/admin/globals/site-settings')
    await expect(page.locator('form').first()).toBeVisible()
    await expect(page.locator('#field-brandName')).toBeVisible()
  })

  test('giao diện quản trị bằng tiếng Việt', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await expect(page.locator('body')).toContainText(/Tạo mới|Lưu|Sản phẩm/i)
  })
})

/** Ô slug hiện cả đường dẫn trên website (SlugField): tiền tố xám không sửa được + slug + nút chép. */
test.describe('Ô đường dẫn (slug) trong trang sửa', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  const readClipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText())

  /** Mở bản ghi đầu tiên, chờ ô slug có chữ (sau hydrate). */
  const openFirst = async (page: Page, collection: string, prefixText: string) => {
    await page.goto(`/admin/collections/${collection}`)
    await page.locator(`table tbody tr a[href*="/collections/${collection}/"]`).first().click()
    const input = page.locator('textarea.slug-field__input')
    await expect(input).toHaveValue(new RegExp(`^${prefixText.replace(/\//g, '\\/')}.+`))
    const slug = (await input.inputValue()).slice(prefixText.length)
    return {
      input,
      slug,
      prefix: page.locator('.slug-field__prefix'),
      value: page.locator('.slug-field__value'),
      copy: page.locator('.slug-field__copy'),
    }
  }

  const selectedText = (input: Locator) =>
    input.evaluate((el: HTMLTextAreaElement) => el.value.slice(el.selectionStart, el.selectionEnd))

  test('mỗi loại hiện đúng tiền tố, tiền tố màu khác phần slug', async ({ page }) => {
    const cases = [
      ['product-categories', '/san-pham/danh-muc/'],
      ['products', '/san-pham/'],
      ['posts', '/bai-viet/'],
      ['post-categories', '/bai-viet/danh-muc/'],
      ['pages', '/'],
    ] as const
    for (const [collection, expected] of cases) {
      const { prefix, value, slug } = await openFirst(page, collection, expected)
      await expect(prefix).toHaveText(expected)
      await expect(value).toHaveText(slug)
      const [prefixColor, valueColor] = await Promise.all([
        prefix.evaluate((el) => getComputedStyle(el).color),
        value.evaluate((el) => getComputedStyle(el).color),
      ])
      expect(prefixColor).not.toBe(valueColor)
    }
  })

  test('kéo chuột bôi đen được cả đường dẫn; nút chép lấy đường dẫn không kèm tên miền', async ({ page }) => {
    const { input, prefix, value, copy, slug } = await openFirst(page, 'product-categories', '/san-pham/danh-muc/')
    const full = `/san-pham/danh-muc/${slug}`

    // Chuột thật bấm trúng textarea phủ trên chữ màu; slug dài có thể xuống dòng nên kéo tới góc dưới phải
    const from = (await prefix.boundingBox())!
    const to = (await value.boundingBox())!
    await page.mouse.move(from.x + 1, from.y + 10)
    await page.mouse.down()
    await page.mouse.move(to.x + to.width + 2, to.y + to.height - 4, { steps: 10 })
    await page.mouse.up()
    expect(await selectedText(input)).toBe(full)
    await page.keyboard.press('Control+C')
    expect(await readClipboard(page)).toBe(full)

    await page.evaluate(() => navigator.clipboard.writeText(''))
    await copy.click()
    expect(await readClipboard(page)).toBe(full)
    await expect(page.getByText(`Đã chép đường dẫn ${full}`)).toBeVisible()
  })

  test('tiền tố không sửa được: gõ, xóa, dán, cắt chỉ tác động lên phần slug', async ({ page }) => {
    const prefixText = '/san-pham/danh-muc/'
    const { input, prefix, copy, slug } = await openFirst(page, 'product-categories', prefixText)

    // Bấm vào tiền tố: con trỏ nhảy về đầu phần slug; Backspace ở đó không xóa được tiền tố
    const at = (await prefix.boundingBox())!
    await page.mouse.click(at.x + 8, at.y + 10)
    await page.keyboard.type('moi-')
    await page.keyboard.press('Home')
    await page.keyboard.press('Backspace')
    await expect(input).toHaveValue(`${prefixText}moi-${slug}`)

    // Gõ ở cuối (slug dài xuống dòng nên dùng Ctrl+End); nút chép chuẩn hóa như khi lưu (bỏ dấu, khoảng trắng thành gạch)
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' Thử')
    await copy.click()
    expect(await readClipboard(page)).toBe(`${prefixText}moi-${slug}-thu`)

    // Bôi đen tất cả rồi dán cả URL: chỉ phần slug bị thay, tiền tố trong URL được bỏ
    await page.evaluate(() => navigator.clipboard.writeText('https://thanhvinhmetal.vn/san-pham/danh-muc/dan-thu'))
    await input.focus()
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Control+V')
    await expect(input).toHaveValue(`${prefixText}dan-thu`)

    // Bôi đen tất cả rồi cắt: chép đủ đường dẫn, chỉ xóa phần slug
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Control+X')
    expect(await readClipboard(page)).toBe(`${prefixText}dan-thu`)
    await expect(input).toHaveValue(prefixText)
    await expect(prefix).toHaveText(prefixText)
  })
})

/**
 * Chèn "Mối quan hệ" trong ô soạn thảo: khung chọn liệt kê sản phẩm với ô tên tự làm (DocLinkCell). Trước 26/10/2026 ô tên
 * luôn là link: bấm tên thì chuyển sang trang sửa sản phẩm, hiện "Thay đổi chưa được lưu", không chèn được.
 */
test('chèn "Mối quan hệ": bấm tên sản phẩm trong khung chọn là chèn vào nội dung, không chuyển trang', async ({ page }) => {
  await page.goto('/admin/collections/posts/create')
  const editor = page.locator('[data-lexical-editor="true"]').first()
  await editor.click()
  // Gõ không dấu: Playwright gõ chữ có dấu thành ký tự tổ hợp, menu / không lọc ra
  await page.keyboard.type('/quan')
  await expect(page.getByText('Mối quan hệ', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Enter')

  const drawer = page.locator('.list-drawer').first()
  const pick = drawer.locator('button.doc-link-cell--select').first()
  await expect(pick).toBeVisible()
  const name = (await pick.textContent())!.trim()
  await pick.click()

  await expect(drawer).toBeHidden()
  await expect(page.getByText('Thay đổi chưa được lưu')).toHaveCount(0)
  await expect(page).toHaveURL(/\/posts\/create/)
  await expect(page.locator('.rich-text-lexical').getByText(name).first()).toBeVisible()
})

/**
 * Khung chọn "Mối quan hệ" chỉ liệt kê bản đã xuất bản (src/lib/drawerFilter.ts, gắn ở serverFunction của layout admin).
 * Trước 26/10/2026 bản nháp, bản bị ẩn vẫn chọn được.
 */
test('khung chọn "Mối quan hệ" không liệt kê sản phẩm nháp, vẫn có sản phẩm đã xuất bản', async ({ page }) => {
  const stamp = Date.now()
  const draftName = `ZzNhapKhongChon ${stamp}`
  const published = ((await (await page.request.get('/api/products?where[_status][equals]=published&limit=1&depth=0')).json()) as {
    docs: { name: string; category: number; images: { image: number }[] }[]
  }).docs[0]!
  // Gọi API bằng token (cookie đăng nhập không được nhận khi request không kèm Origin)
  const login = await page.request.post('/api/users/login', {
    data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
  })
  const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
  const created = await page.request.post('/api/products?draft=true', {
    headers,
    data: { name: draftName, category: published.category, images: [{ image: published.images[0]!.image }], _status: 'draft' },
  })
  expect(created.ok(), await created.text()).toBe(true)
  const draftId = ((await created.json()) as { doc: { id: number } }).doc.id

  try {
    await page.goto('/admin/collections/posts/create')
    await page.locator('[data-lexical-editor="true"]').first().click()
    await page.keyboard.type('/quan')
    await expect(page.getByText('Mối quan hệ', { exact: true }).first()).toBeVisible()
    await page.keyboard.press('Enter')

    const drawer = page.locator('.list-drawer').first()
    const search = drawer.locator('.search-filter__input')
    await search.fill(draftName)
    await expect(drawer.locator('table tbody tr')).toHaveCount(0)
    await search.fill(published.name)
    await expect(drawer.locator('button.doc-link-cell--select', { hasText: published.name }).first()).toBeVisible()
  } finally {
    await page.request.delete(`/api/products/${draftId}`, { headers })
  }
})

/**
 * Dán ảnh vào ô soạn thảo: tự tải lên "Ảnh và tệp" rồi chèn, không mở khung "Tệp để tải lên" bắt điền alt, bấm Lưu
 * (src/components/admin/PasteImageFeature.tsx).
 */
test('dán ảnh vào nội dung: tự tải lên và chèn, không bắt bấm Lưu', async ({ page }) => {
  const fileName = `zz-dan-anh-${Date.now()}.png`
  // PNG 1×1 hợp lệ (sharp phải đọc được để tạo các cỡ ảnh)
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  await page.goto('/admin/collections/posts/create')
  await page.locator('#field-title').fill('Bài thử dán ảnh')
  const editor = page.locator('[data-lexical-editor="true"]').first()
  await editor.click()

  try {
    await editor.evaluate(
      (el, { b64, name }) => {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        const data = new DataTransfer()
        data.items.add(new File([bytes], name, { type: 'image/png' }))
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
      },
      { b64: png, name: fileName },
    )

    await expect(page.getByText('Đã chèn ảnh').first()).toBeVisible()
    await expect(page.locator('[class*="bulk-upload"]')).toHaveCount(0)
    // Khối ảnh trong ô soạn thảo hiện tên tệp vừa tải
    await expect(page.locator('.rich-text-lexical').getByText(fileName.replace(/\.png$/, ''), { exact: false }).first()).toBeVisible()

    // Ảnh đã nằm trong thư viện, alt tự đặt theo tiêu đề bài
    const media = (await (await page.request.get(`/api/media?where[filename][like]=${fileName.replace(/\.png$/, '')}&limit=1`)).json()) as {
      docs: { alt: string }[]
    }
    expect(media.docs[0]?.alt).toBe('Ảnh trong "Bài thử dán ảnh"')
  } finally {
    // Dọn ảnh bằng token (cookie đăng nhập không được nhận khi request không kèm Origin)
    const login = await page.request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
    await page.request.delete(`/api/media?where[filename][like]=${fileName.replace(/\.png$/, '')}`, { headers })
  }
})

/**
 * Các test sửa dữ liệu Trang chủ chạy lần lượt: chạy song song (CI 2 worker) thì lần lưu của test này làm form đang mở
 * của test kia thành bản cũ và bị chặn (src/hooks/staleSave.ts).
 */
test.describe('Trang chủ: các test sửa dữ liệu', () => {
  test.describe.configure({ mode: 'serial' })

  /**
   * "Vùng ảnh muốn giữ" ở ô Bộ sưu tập (ImageFrameField chế độ focal, FramedImage, src/lib/frame.ts).
   * Trước đây khung chỉ lưu tâm làm điểm lấy nét của ảnh nên web gần như không đổi; ảnh cao còn có viền đen trong khung
   * làm % lệch so với ảnh.
   */
  test('vùng ảnh muốn giữ ở Bộ sưu tập: kéo khung, bấm Lưu, trang chủ phóng ảnh đúng vùng đó', async ({ page }) => {
    const login = await page.request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
    type Tile = { image: number; imageFrame?: { x: number; y: number; width: number; height: number; media: number } | null }
    const getTiles = async () => ((await (await page.request.get('/api/globals/home?depth=0')).json()) as { collections: Tile[] }).collections
    const original = await getTiles()

    try {
      await page.goto('/admin/globals/home')
      await page.locator('.tabs-field__tab-button', { hasText: /^Bộ sưu tập$/ }).click()
      const field = page.locator('.slider-crop').first()
      const img = field.locator('.ReactCrop img')
      await expect(img).toBeVisible()
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)

      // Ảnh trong khung đúng tỉ lệ gốc, không viền đen: % của khung là % của ảnh.
      // Ô thứ hai là ảnh 4:3 bị chặn cao 520px, trước đây bị kéo đủ ngang rồi contain, có viền đen hai bên.
      for (const each of await page.locator('.slider-crop .ReactCrop img').all()) {
        await expect.poll(() => each.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
        const [shown, natural] = await each.evaluate((el: HTMLImageElement) => [el.clientWidth / el.clientHeight, el.naturalWidth / el.naturalHeight])
        expect(Math.abs(shown / natural - 1)).toBeLessThan(0.02)
      }
      // Khung vuông như ô Bộ sưu tập (aspect 1)
      const corner = field.locator('.ReactCrop__drag-handle.ord-se')
      await corner.scrollIntoViewIfNeeded()
      const box = (await field.locator('.ReactCrop__crop-selection').boundingBox())!
      expect(Math.abs(box.width / box.height - 1)).toBeLessThan(0.03)

      // Bấm vào khung mà không kéo: vùng không đổi, không ghi gì (trang không bị tính là có thay đổi)
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await expect(field.getByText(/^Chưa chọn vùng/)).toBeVisible()

      // Kéo góc dưới phải vào trong cho khung nhỏ lại rồi thả. Phần tử góc rộng 0, ô bấm được là ::after 10×10 nằm đúng góc khung.
      const [x, y] = [box.x + box.width - 2, box.y + box.height - 2]
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x - box.width * 0.4, y - box.height * 0.4, { steps: 8 })
      await page.mouse.up()
      await expect(field.getByText('Đã chọn vùng.')).toBeVisible()
      await page.getByRole('button', { name: 'Lưu', exact: true }).click()
      await expect(page.getByText(/thành công/i).first()).toBeVisible()

      // Vùng lưu cùng trang chủ, gắn với ảnh của ô, vẫn vuông theo pixel ảnh
      const tile = (await getTiles())[0]!
      const frame = tile.imageFrame!
      expect(frame.media).toBe(tile.image)
      expect(frame.width).toBeLessThan(80)
      const media = (await (await page.request.get(`/api/media/${tile.image}?depth=0`)).json()) as { width: number; height: number }
      expect(Math.abs((frame.width * media.width) / (frame.height * media.height) - 1)).toBeLessThan(0.03)

      // Trang chủ: ảnh phủ kín ô, vùng chọn hiện trọn trong ô và lấp đầy một chiều của ô
      await page.goto('/')
      await page.mouse.move(1, 1)
      const card = page.locator('#bo-suu-tap a').first()
      await card.scrollIntoViewIfNeeded()
      await expect(card.locator('img')).toHaveJSProperty('complete', true)
      const r = await card.evaluate((a) => {
        const t = a.getBoundingClientRect()
        const i = a.querySelector('img')!.getBoundingClientRect()
        return { t: { x: t.x, y: t.y, w: t.width, h: t.height }, i: { x: i.x, y: i.y, w: i.width, h: i.height } }
      })
      const region = {
        x: r.i.x + (frame.x / 100) * r.i.w,
        y: r.i.y + (frame.y / 100) * r.i.h,
        w: (frame.width / 100) * r.i.w,
        h: (frame.height / 100) * r.i.h,
      }
      expect(r.i.x).toBeLessThanOrEqual(r.t.x + 1)
      expect(r.i.y).toBeLessThanOrEqual(r.t.y + 1)
      expect(r.i.x + r.i.w).toBeGreaterThanOrEqual(r.t.x + r.t.w - 1)
      expect(r.i.y + r.i.h).toBeGreaterThanOrEqual(r.t.y + r.t.h - 1)
      expect(region.x).toBeGreaterThanOrEqual(r.t.x - 1)
      expect(region.y).toBeGreaterThanOrEqual(r.t.y - 1)
      expect(region.x + region.w).toBeLessThanOrEqual(r.t.x + r.t.w + 1)
      expect(region.y + region.h).toBeLessThanOrEqual(r.t.y + r.t.h + 1)
      expect(Math.min(Math.abs(region.w - r.t.w), Math.abs(region.h - r.t.h))).toBeLessThan(2)
    } finally {
      await page.request.post('/api/globals/home', { headers, data: { collections: original } })
    }
  })

  /**
   * Mở Trang chủ ở hai tab: tab B sửa Giới thiệu rồi lưu, tab A (mở từ trước) sửa Bộ sưu tập rồi lưu thì trước đây đè
   * Giới thiệu về bản cũ. Giờ quay lại tab A là có cảnh báo (StaleDocWatcher), lưu thì bị chặn (src/hooks/staleSave.ts).
   */
  test('mở Trang chủ ở hai tab: tab cũ được cảnh báo và không lưu đè được thay đổi của tab kia', async ({ page }) => {
    const login = await page.request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
    type HomeDoc = { about: { heading: string }; collections: { title: string }[] }
    const getHome = async () => (await (await page.request.get('/api/globals/home?depth=0')).json()) as HomeDoc
    const original = await getHome()
    const tab = (p: Page, name: string) => p.locator('.tabs-field__tab-button', { hasText: new RegExp(`^${name}$`) }).click()

    const other = await page.context().newPage()
    try {
      await page.goto('/admin/globals/home')
      await tab(page, 'Bộ sưu tập')
      await expect(page.locator('#field-collections__0__title')).toBeVisible()

      // Tab B mở sau, sửa Giới thiệu rồi lưu
      await other.goto('/admin/globals/home')
      await tab(other, 'Giới thiệu')
      await other.locator('#field-about__heading').fill('Giới thiệu sửa ở tab B')
      await other.getByRole('button', { name: 'Lưu', exact: true }).click()
      await expect(other.getByText(/thành công/i).first()).toBeVisible()

      // Quay lại tab A: báo ngay là bản đang mở đã cũ
      await page.bringToFront()
      await page.evaluate(() => window.dispatchEvent(new Event('focus')))
      await expect(page.getByText(/Trang này vừa được lưu ở tab hoặc máy khác/)).toBeVisible()

      // Vẫn sửa và bấm Lưu: bị chặn, Giới thiệu của tab B giữ nguyên
      await page.locator('#field-collections__0__title').fill('Bộ sưu tập sửa ở tab A')
      await page.getByRole('button', { name: 'Lưu', exact: true }).click()
      await expect(page.getByText(/Trang chủ đã được lưu ở tab hoặc máy khác lúc/)).toBeVisible()
      let now = await getHome()
      expect(now.about.heading).toBe('Giới thiệu sửa ở tab B')
      expect(now.collections[0]!.title).toBe(original.collections[0]!.title)

      // Tải lại theo nút trên cảnh báo: lấy bản mới, lưu được, không mất phần của tab B
      page.once('dialog', (d) => d.accept())
      await page.getByRole('button', { name: 'Tải lại' }).click()
      await tab(page, 'Bộ sưu tập')
      await page.locator('#field-collections__0__title').fill('Bộ sưu tập sửa ở tab A')
      await page.getByRole('button', { name: 'Lưu', exact: true }).click()
      await expect(page.getByText(/thành công/i).first()).toBeVisible()
      now = await getHome()
      expect(now.about.heading).toBe('Giới thiệu sửa ở tab B')
      expect(now.collections[0]!.title).toBe('Bộ sưu tập sửa ở tab A')
    } finally {
      await other.close()
      const latest = await getHome()
      await page.request.post('/api/globals/home', {
        headers,
        data: {
          about: { ...latest.about, heading: original.about.heading },
          collections: latest.collections.map((c, i) => ({ ...c, title: original.collections[i]!.title })),
        },
      })
    }
  })

  /** Chấm sát mép trái, phải với nhãn dài: nhãn lật vào trong và xuống dòng, không bị khung ảnh cắt (Applications.tsx). */
  test('điểm chấm sát mép ở tab Ứng dụng: nhãn nằm trọn trong khung ảnh, cả máy tính lẫn điện thoại', async ({ page }) => {
    const login = await page.request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
    type App = Record<string, unknown> & { hotspots?: { x: number; y: number; label: string }[] | null }
    const original = ((await (await page.request.get('/api/globals/home?depth=0')).json()) as { applications: App[] }).applications
    const label = 'Nhãn dài để thử xuống dòng sát mép ảnh'
    const spots = [
      { x: 97, y: 30, label },
      { x: 3, y: 60, label },
      { x: 55, y: 85, label: 'Giữa' },
    ]

    try {
      const saved = await page.request.post('/api/globals/home', {
        headers,
        data: { applications: original.map((a, i) => (i === 0 ? { ...a, hotspots: spots } : a)) },
      })
      expect(saved.ok(), await saved.text()).toBe(true)

      for (const size of [
        { width: 1280, height: 800 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(size)
        await page.goto('/')
        const frame = page.locator('#app-panel > div').first()
        await frame.scrollIntoViewIfNeeded()
        await expect(frame.locator('.dot-pulse + span')).toHaveCount(3)
        // Đo trong một lần để hiệu ứng hiện dần (data-reveal) không làm lệch giữa các phép đo
        const m = await frame.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const labels = [...el.querySelectorAll('.dot-pulse + span')].map((l) => l.getBoundingClientRect())
          const dot = el.querySelector('.dot-pulse')!.getBoundingClientRect()
          return { left: box.left, right: box.right, width: box.width, labels: labels.map((r) => [r.left, r.right]), dotX: dot.left + dot.width / 2 }
        })
        for (const [l, r] of m.labels) {
          expect(l, `nhãn lọt mép trái ở ${size.width}px`).toBeGreaterThanOrEqual(m.left - 1)
          expect(r, `nhãn lọt mép phải ở ${size.width}px`).toBeLessThanOrEqual(m.right + 1)
        }
        // Chấm vẫn ở đúng vị trí đã đặt
        expect(Math.abs(m.dotX - (m.left + m.width * 0.97))).toBeLessThan(2)
      }
    } finally {
      await page.request.post('/api/globals/home', { headers, data: { applications: original } })
    }
  })
})

/**
 * Menu chỉ gồm mảng: trước đây `updatedAt` không bao giờ đổi (adapter Postgres bỏ qua ghi dòng chính), nay có ô ẩn
 * `revision` (src/fields/revision.ts). Lưu xong form phải nhận `updatedAt` mới, lưu lần hai trong cùng tab không bị chặn nhầm.
 */
test('Menu lưu hai lần liên tiếp trong cùng tab đều được, không bị báo là bản cũ', async ({ page }) => {
  type Nav = { updatedAt: string; searchSuggestions: { label: string; href: string }[] }
  const getNav = async () => (await (await page.request.get('/api/globals/navigation?depth=0')).json()) as Nav
  const original = await getNav()
  expect(original.searchSuggestions.length).toBeGreaterThan(0)
  const first = original.searchSuggestions[0]!.label

  try {
    await page.goto('/admin/globals/navigation')
    await page.locator('.tabs-field__tab-button', { hasText: /^Tìm kiếm$/ }).click()
    const label = page.locator('#field-searchSuggestions__0__label')
    for (const n of [1, 2]) {
      await label.fill(`${first} ${n}`)
      await page.getByRole('button', { name: 'Lưu', exact: true }).click()
      await expect.poll(async () => (await getNav()).searchSuggestions[0]!.label).toBe(`${first} ${n}`)
    }
    await expect(page.getByText(/đã được lưu ở tab hoặc máy khác/)).toHaveCount(0)
    expect(Date.parse((await getNav()).updatedAt)).toBeGreaterThan(Date.parse(original.updatedAt))
  } finally {
    const login = await page.request.post('/api/users/login', {
      data: { email: process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn', password: process.env.ADMIN_PASSWORD || 'ThanhVinh@2026' },
    })
    const headers = { Authorization: `JWT ${((await login.json()) as { token: string }).token}` }
    await page.request.post('/api/globals/navigation', { headers, data: { searchSuggestions: original.searchSuggestions } })
  }
})

/** Ô có giới hạn độ dài hiện bộ đếm ký tự dưới ô (CharCountDescription, src/fields/limits.ts). */
test('ô tên sản phẩm có bộ đếm ký tự, vượt 80 thì báo đỏ, lưu bị chặn', async ({ page }) => {
  await page.goto('/admin/collections/products/create')
  const name = page.locator('#field-name')
  const counter = page.locator('.field-type.text').filter({ has: name }).locator('.char-count__n')

  await name.fill('Vách')
  await expect(counter).toHaveText('4/80 ký tự')
  await expect(counter).not.toHaveClass(/char-count__n--over/)

  await name.fill('a'.repeat(81))
  await expect(counter).toHaveText('81/80 ký tự, dài hơn 1 ký tự')
  await expect(counter).toHaveClass(/char-count__n--over/)

  // Lưu nháp vẫn kiểm độ dài (hook enforceMaxLength): báo lỗi ở ô tên, không tạo sản phẩm
  await page.getByRole('button', { name: /lưu bản nháp/i }).click()
  await expect(page.getByText(/không hợp lệ: Tên sản phẩm/).first()).toBeVisible()
  await expect(page).toHaveURL(/\/products\/create/)
})

test.describe('Trang quản trị, chưa đăng nhập', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('trang đăng nhập hiện bằng tiếng Việt', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('#field-email')).toBeVisible()
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  })

  test('sai mật khẩu thì không vào được', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#field-email').fill('admin@thanhvinhmetal.vn')
    await page.locator('#field-password').fill('sai-mat-khau')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('#field-email')).toBeVisible()
  })

  test('vào thẳng trang quản trị thì bị chặn', async ({ page }) => {
    await page.goto('/admin/collections/products')
    await expect(page.locator('#field-email')).toBeVisible()
  })

  test('API công khai không trả yêu cầu báo giá', async ({ request }) => {
    const res = await request.get('/api/quote-requests')
    expect([401, 403]).toContain(res.status())
  })

  test('API công khai không trả danh sách tài khoản', async ({ request }) => {
    const res = await request.get('/api/users')
    expect([401, 403]).toContain(res.status())
  })

  test('API công khai không trả tệp bản vẽ khách gửi', async ({ request }) => {
    const res = await request.get('/api/quote-files')
    expect([401, 403]).toContain(res.status())
  })
})
