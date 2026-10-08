/**
 * Nạp dữ liệu mẫu: pnpm seed
 * Xóa dữ liệu cũ rồi nạp lại: SEED_RESET=1 pnpm seed
 */
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { IMAGES, PAGES, POST_CATEGORIES, POSTS, PRODUCT_CATEGORIES, PRODUCTS } from './data'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGE_DIR = path.resolve(dirname, '../../docs/design/images')
const ctx = { context: { disableRevalidate: true } }

const reset = async (payload: Payload) => {
  for (const collection of [
    'quote-requests',
    'quote-files',
    'subscribers',
    'products',
    'product-categories',
    'posts',
    'post-categories',
    'pages',
    'media',
  ] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, ...ctx })
  }
}

const run = async () => {
  const payload = await getPayload({ config })

  const existing = await payload.count({ collection: 'product-categories' })
  if (existing.totalDocs > 0) {
    if (process.env.SEED_RESET === '1') {
      payload.logger.info('Xóa dữ liệu cũ...')
      await reset(payload)
    } else {
      payload.logger.info('Đã có dữ liệu. Dùng SEED_RESET=1 để nạp lại.')
      process.exit(0)
    }
  }

  // Tài khoản quản trị
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thanhvinhmetal.vn'
  const adminPassword = process.env.ADMIN_PASSWORD || 'ThanhVinh@2026'
  const users = await payload.find({ collection: 'users', where: { email: { equals: adminEmail } } })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'Quản trị', email: adminEmail, password: adminPassword, role: 'admin' },
    })
    payload.logger.info(`Tạo tài khoản admin ${adminEmail} / ${adminPassword}`)
  }

  // Ảnh
  payload.logger.info('Tải ảnh mẫu...')
  const media: Record<string, number> = {}
  for (const [key, { file, alt }] of Object.entries(IMAGES)) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: path.join(IMAGE_DIR, file),
      ...ctx,
    })
    media[key] = doc.id
  }

  // Danh mục sản phẩm
  const categories: Record<string, number> = {}
  for (const [i, c] of PRODUCT_CATEGORIES.entries()) {
    const doc = await payload.create({
      collection: 'product-categories',
      data: { name: c.name, description: c.description, image: media[c.image], order: i + 1, showOnHome: true },
      ...ctx,
    })
    categories[c.key] = doc.id
  }

  // Sản phẩm
  const products: Record<string, number> = {}
  for (const p of PRODUCTS) {
    const doc = await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        category: categories[p.category],
        images: p.images.map((k) => ({ image: media[k] })),
        summary: p.summary,
        material: p.material,
        spec: p.spec.map(([label, value]) => ({ label, value })),
        price: 'Liên hệ',
        featured: p.featured,
        _status: 'published',
      },
      ...ctx,
    })
    products[p.key] = doc.id
  }

  // Danh mục bài viết và bài viết
  const postCategories: Record<string, number> = {}
  for (const c of POST_CATEGORIES) {
    const doc = await payload.create({
      collection: 'post-categories',
      data: { name: c.name, description: c.description },
      ...ctx,
    })
    postCategories[c.key] = doc.id
  }
  const now = Date.now()
  for (const [i, p] of POSTS.entries()) {
    await payload.create({
      collection: 'posts',
      data: {
        title: p.title,
        category: postCategories[p.category],
        cover: media[p.cover],
        excerpt: p.excerpt,
        content: p.content,
        publishedAt: new Date(now - i * 3 * 24 * 3600 * 1000).toISOString(),
        _status: 'published',
      },
      ...ctx,
    })
  }

  // Trang tĩnh
  for (const p of PAGES) {
    await payload.create({
      collection: 'pages',
      data: {
        title: p.title,
        slug: p.slug,
        cover: 'cover' in p && p.cover ? media[p.cover] : undefined,
        intro: p.intro,
        content: p.content,
        _status: 'published',
      },
      ...ctx,
    })
  }

  // Thông tin công ty
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: 'Thành Vinh Metal',
      companyName: 'Công ty TNHH Vinh Metal',
      logo: media.logo,
      tagline: 'Giải pháp kim loại tấm cho mọi công trình',
      taxCode: '3702941317',
      address: 'Thửa đất 362, Tờ bản đồ C2, Khu phố Bình Phước A, Phường Bình Chuẩn, TP. Thuận An, Bình Dương',
      workingHours: 'Thứ 2 – Thứ 7, 7:30 – 17:00',
      hotline: '0946.272.467',
      contactName: 'Mr Vinh',
      zalo: '0946272467',
      email: 'info@thanhvinhmetal.vn',
      facebook: 'https://facebook.com/',
    },
    ...ctx,
  })

  // Menu
  const catLink = (key: string) => {
    const c = PRODUCT_CATEGORIES.find((x) => x.key === key)
    return `/san-pham/danh-muc/${slugOf(c?.name || '')}`
  }
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      left: [
        { label: 'Bộ sưu tập', type: 'link', href: '/#bo-suu-tap' },
        { label: 'Về Vinh Metal', type: 'link', href: '/gioi-thieu' },
        {
          label: 'Sản phẩm',
          type: 'mega',
          megaMenu: {
            columns: [
              { title: 'Sản phẩm cắt laser', links: [
                { label: 'Vách ngăn hoa văn', href: catLink('vach') },
                { label: 'Lam che nắng', href: catLink('vach') },
                { label: 'Cổng và hàng rào', href: catLink('vach') },
                { label: 'Tấm đục lỗ', href: catLink('tamDucLo') },
                { label: 'Chữ và biển hiệu', href: catLink('chu') },
              ] },
              { title: 'Gia công cơ khí', links: [
                { label: 'Vỏ tủ điện', href: catLink('tuDien') },
                { label: 'Máng cáp', href: catLink('tuDien') },
                { label: 'Mặt bích', href: catLink('matBich') },
                { label: 'Bánh răng, đĩa xích', href: catLink('banhRang') },
                { label: 'Pát liên kết', href: catLink('tuDien') },
              ] },
              { title: 'Kết cấu thép', links: [
                { label: 'Khung, bệ máy', href: '/san-pham' },
                { label: 'Giá kệ', href: '/san-pham' },
                { label: 'Cầu thang, lan can', href: catLink('vach') },
                { label: 'Mái che', href: '/san-pham' },
              ] },
              { title: 'Hoàn thiện bề mặt', links: [
                { label: 'Sơn tĩnh điện', href: '/gioi-thieu' },
                { label: 'Mạ kẽm', href: '/gioi-thieu' },
                { label: 'Đánh bóng inox', href: '/gioi-thieu' },
              ] },
            ],
            cards: [{ image: media.slideHoaVan, title: 'Bộ sưu tập vách hoa văn', href: catLink('vach') }],
          },
        },
        {
          label: 'Giải pháp',
          type: 'mega',
          megaMenu: {
            intro: 'Từ một file bản vẽ đến sản phẩm hoàn thiện, Vinh Metal làm trọn trong một xưởng.',
            columns: [{ title: 'Xem thêm', links: [{ label: 'Catalogue', href: '/lien-he' }, { label: 'Dự án', href: '/bai-viet/danh-muc/tin-tuc' }] }],
            cards: [
              { image: media.heroSparks, title: 'Cắt laser CNC', subtitle: 'Thép tấm, inox, nhôm theo bản vẽ', href: '/gioi-thieu' },
              { image: media.wSong, title: 'Gia công và hoàn thiện', subtitle: 'Chấn, hàn, sơn tĩnh điện', href: '/gioi-thieu' },
            ],
          },
        },
        { label: 'Dự án', type: 'link', href: '/bai-viet/danh-muc/tin-tuc' },
      ],
      right: [
        { label: 'Năng lực', type: 'link', href: '/gioi-thieu' },
        { label: 'Kiến thức', type: 'link', href: '/bai-viet/danh-muc/kien-thuc' },
        {
          label: 'Catalogue',
          type: 'mega',
          megaMenu: {
            downloads: [
              { title: 'Hồ sơ năng lực', note: 'PDF', href: '/lien-he' },
              { title: 'Catalogue mẫu hoa văn', note: 'PDF', href: '/lien-he' },
              { title: 'Bảng màu sơn tĩnh điện', note: 'PDF', href: '/lien-he' },
              { title: 'Hướng dẫn gửi bản vẽ', note: 'Trang web', href: '/huong-dan-gui-ban-ve' },
            ],
            cards: [
              { image: media.pVachTron, title: 'Catalogue', subtitle: 'Xem mẫu hoa văn trực tuyến', href: catLink('vach') },
              { image: media.plateCut, title: 'Bảng giá', subtitle: 'Nhận bảng giá theo quy cách', href: '/lien-he' },
            ],
          },
        },
        { label: 'Tin tức', type: 'link', href: '/bai-viet/danh-muc/tin-tuc' },
        { label: 'Tuyển dụng', type: 'link', href: '/bai-viet/danh-muc/tuyen-dung' },
      ],
      searchSuggestions: [
        { label: 'Vách hoa văn', href: '/tim-kiem?q=vach+hoa+van' },
        { label: 'Tấm đục lỗ', href: '/tim-kiem?q=tam+duc+lo' },
        { label: 'Mặt bích', href: '/tim-kiem?q=mat+bich' },
        { label: 'Vỏ tủ điện', href: '/tim-kiem?q=vo+tu+dien' },
        { label: 'Chữ cắt laser', href: '/tim-kiem?q=chu+cat+laser' },
        { label: 'Sơn tĩnh điện', href: '/tim-kiem?q=son+tinh+dien' },
      ],
      footerLinks: [
        { label: 'Điều khoản sử dụng', href: '/chinh-sach-bao-mat' },
        { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
        { label: 'Chính sách bảo hành', href: '/chinh-sach-bao-hanh' },
      ],
    },
    ...ctx,
  })

  // Trang chủ
  await payload.updateGlobal({
    slug: 'home',
    data: {
      slides: [
        { image: media.heroSparks, title: 'Cắt laser CNC theo bản vẽ', description: 'Cắt thép tấm, inox, nhôm theo file DXF, DWG, PDF. Nhận đơn từ chi tiết mẫu đến hàng loạt.', buttonLabel: 'Khám phá ngay', buttonHref: '/san-pham' },
        { image: media.slideHoaVan, title: 'Vách ngăn hoa văn cắt laser', description: 'Nhiều mẫu họa tiết cắt trên thép, inox, nhôm, hoàn thiện sơn tĩnh điện vàng đồng, đen hoặc giữ màu kim loại.', buttonLabel: 'Xem bộ sưu tập', buttonHref: catLink('vach') },
        { image: media.wSong, title: 'Gia công kim loại tấm trọn gói', description: 'Cắt, chấn, hàn và sơn hoàn thiện trong cùng một xưởng tại Thuận An, Bình Dương.', buttonLabel: 'Yêu cầu báo giá', buttonHref: '/lien-he' },
      ],
      collections: [
        { image: media.slideHoaVan, tag: 'Inox, thép', title: 'Vách laser hoa văn', description: 'Vách ngăn, lam che nắng, cổng, lan can cắt laser theo mẫu có sẵn hoặc thiết kế riêng.', href: catLink('vach') },
        { image: media.wLa, tag: 'Thép sơn tĩnh điện', title: 'Tấm trang trí họa tiết', description: 'Ốp mặt tiền, trần, vách sảnh với họa tiết cắt laser và màu sơn theo công trình.', href: catLink('tamDucLo') },
      ],
      about: {
        slogan: 'Giải pháp kim loại tấm cho mọi công trình',
        foundedYear: 2020,
        heading: 'Giới thiệu',
        paragraphs: [
          { text: 'Công ty TNHH Vinh Metal chuyên cắt laser CNC, chấn gấp, hàn và gia công kim loại tấm theo bản vẽ cho nhà máy, nhà thầu và đơn vị thi công. Xưởng đặt tại Phường Bình Chuẩn, TP. Thuận An, Bình Dương.' },
          { text: 'Từ một file bản vẽ, xưởng làm trọn các công đoạn cắt, chấn, hàn và sơn hoàn thiện, giao hàng tận nơi.' },
        ],
        buttonLabel: 'Về chúng tôi',
        buttonHref: '/gioi-thieu',
        image: media.plateCut,
        badgeTitle: 'Cắt, chấn, hàn, sơn',
        badgeSub: 'Làm trọn trong một xưởng',
      },
      solutionsHeading: 'Giải pháp',
      solutionsIntro: 'Tại Vinh Metal, mỗi công đoạn từ cắt phôi đến hoàn thiện bề mặt đều làm trong cùng một xưởng.',
      solutions: [
        { image: media.heroSparks, title: 'Cắt laser CNC', subtitle: 'Thép tấm, inox, nhôm cắt theo file DXF, DWG, PDF', href: '/gioi-thieu' },
        { image: media.wSong, title: 'Gia công và hoàn thiện', subtitle: 'Chấn gấp, hàn TIG, MIG, sơn tĩnh điện theo màu công trình', href: '/gioi-thieu' },
      ],
      applicationsHeading: 'Khám phá ứng dụng cho công trình',
      applicationsIntro: 'Chọn loại công trình để xem các sản phẩm phù hợp.',
      applications: [
        { tabLabel: 'Kiến trúc, trang trí', title: 'Kiến trúc, trang trí', description: 'Vách ngăn, lam che nắng, ốp mặt tiền, cổng và lan can hoa văn.', image: media.slideHoaVan, products: [products.vachTron, products.vachLucGiac, products.vachQuaTram, products.tamDucLoTrangTri], hotspots: [{ x: 22, y: 30, label: 'Vách hoa văn' }, { x: 58, y: 62, label: 'Lam che nắng' }, { x: 78, y: 26, label: 'Ốp mặt tiền' }] },
        { tabLabel: 'Nhà xưởng, cơ điện', title: 'Nhà xưởng, cơ điện', description: 'Vỏ tủ điện, máng cáp, giá đỡ, tấm che máy cho nhà xưởng và hệ thống cơ điện.', image: media.wOVuong, products: [products.voTuDien, products.pat, products.tamDucLoTron, products.matBich], hotspots: [{ x: 28, y: 40, label: 'Tấm che máy' }, { x: 64, y: 30, label: 'Giá đỡ' }, { x: 46, y: 70, label: 'Máng cáp' }] },
        { tabLabel: 'Máy móc, thiết bị', title: 'Máy móc, thiết bị', description: 'Chi tiết máy cắt từ thép tấm theo bản vẽ, làm lại chi tiết theo mẫu cũ.', image: media.heroSparks, products: [products.banhRang, products.matBich, products.pat, products.voTuDien], hotspots: [{ x: 62, y: 64, label: 'Chi tiết máy' }, { x: 30, y: 36, label: 'Bánh răng' }, { x: 80, y: 30, label: 'Mặt bích' }] },
        { tabLabel: 'Biển hiệu, quảng cáo', title: 'Biển hiệu, quảng cáo', description: 'Chữ nổi inox, logo công ty, biển hiệu và tấm trang trí mặt tiền cửa hàng.', image: media.wLa, products: [products.chuInox, products.tamOpLa, products.vachLucGiac, products.vachTron], hotspots: [{ x: 30, y: 34, label: 'Chữ nổi inox' }, { x: 70, y: 46, label: 'Tấm ốp mặt tiền' }, { x: 46, y: 72, label: 'Logo công ty' }] },
      ],
      categoriesHeading: 'Tìm hiểu sản phẩm theo danh mục',
      homeCategories: Object.values(categories),
      newsHeading: 'Kiến thức và tin tức',
      newsIntro: 'Kinh nghiệm chọn vật liệu, chuẩn bị bản vẽ và tin mới từ xưởng.',
      newsCount: 4,
      contactHeading: 'Liên hệ với chúng tôi',
      contactIntro: 'Không tìm thấy sản phẩm bạn cần? Hãy để lại lời nhắn hoặc gửi bản vẽ, Vinh Metal sẽ liên hệ lại.',
      newsletterNote: 'Nhận thông tin mẫu hoa văn mới và chương trình ưu đãi.',
      metaTitle: 'Thành Vinh Metal – Cắt laser CNC, gia công kim loại tấm tại Bình Dương',
      metaDescription: 'Cắt laser CNC, chấn gấp, hàn và sơn tĩnh điện theo bản vẽ. Vách hoa văn, tấm đục lỗ, vỏ tủ điện, mặt bích, bánh răng. Xưởng tại Thuận An, Bình Dương.',
      metaImage: media.slideHoaVan,
    },
    ...ctx,
  })

  payload.logger.info('Nạp dữ liệu mẫu xong.')
  process.exit(0)
}

const slugOf = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}
