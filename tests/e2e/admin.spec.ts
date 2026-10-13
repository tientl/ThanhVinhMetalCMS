import { expect, test, type Page } from '@playwright/test'

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

  test('đăng ký bản tin mới hiện ngay trên bảng điều khiển, không cần tải lại', async ({ page, request }) => {
    await page.goto('/admin')
    const stat = page.locator('.dash-stat', { hasText: 'Đăng ký bản tin' }).locator('.dash-stat__value')
    const before = Number(await stat.textContent())

    const res = await request.post('/api/subscribe', {
      data: { email: `zz-e2e-${Date.now()}@example.com` },
      headers: { 'x-forwarded-for': randomIp() },
    })
    expect(res.ok()).toBe(true)

    // Test khác chạy song song cũng có thể tạo đăng ký, nên chỉ đòi số tăng lên, không đòi đúng +1
    await expect.poll(async () => Number(await stat.textContent())).toBeGreaterThan(before)
    await expect(page.locator('#nav-subscribers .nav-badge')).toBeVisible()
    await expect(page.getByText(/đăng ký bản tin mới/).first()).toBeVisible()
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
