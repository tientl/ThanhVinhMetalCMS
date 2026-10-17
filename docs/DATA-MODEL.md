# Mô hình dữ liệu Payload

Tên collection, slug và field bằng tiếng Anh; label hiển thị trong admin bằng tiếng Việt. Mọi collection có nội dung hiển thị đều bật `versions.drafts`. Sau khi khai báo xong chạy `pnpm payload generate:types` và commit `payload-types.ts` (mốc ngày 3 cho Dev B).

## Collections

### users
Auth. `role: 'admin' | 'editor'`. Editor (Nhân viên, siết ngày 17/10/2026): thêm, sửa products, posts, pages **chỉ dưới dạng nháp** (Quản trị duyệt và xuất bản); tải lên, sửa media; sửa global home; quote-requests chỉ đổi `status`; subscribers chỉ đọc; product-categories, post-categories chỉ đọc; không xóa gì; không sửa navigation, site-settings, visitor-stats, users khác (các mục này ẩn khỏi menu của editor). Bảng đầy đủ ở `docs/CHANGELOG.md` mục 17/10/2026.

### media
Upload. `alt` bắt buộc. Sizes: `thumb` 300×300 cover, `card` 800×600 cover, `wide` 1600 width, `hero` 2400 width. Lưu `/media` trên VPS, nằm trong backup.

### product-categories
`name`, `slug` (tự sinh), `description`, `image` (media), `order` (number), `showOnHome` (bool). Dùng cho menu, lưới danh mục trang chủ, mega menu. Danh sách admin có cột "Ảnh" (field ui `thumbnail`, không lưu DB) đứng trước tên (12/10/2026).

### products
`name`, `slug`, `category` (relationship), `images` (array media, ảnh đầu là ảnh đại diện), `summary` (text ngắn), `description` (richText), `material`, `spec` (array {label, value}), `price` (text, mặc định "Liên hệ"), `featured` (bool), `related` (relationship many), `seo` (plugin), `status` draft/published. Danh sách admin có cột "Ảnh" lấy ảnh đầu của bộ ảnh (field ui `thumbnail`) (12/10/2026). Hook `beforeValidate` bỏ dòng `images` chưa chọn ảnh và dòng `spec` trống (13/10/2026).

### post-categories
`name`, `slug`. Dữ liệu mẫu: Kiến thức, Tin tức, Tuyển dụng.

### posts
`title`, `slug`, `category`, `cover` (media), `excerpt`, `content` (richText Lexical: heading, list, image, YouTube embed, table), `author` (relationship users, tự gán), `publishedAt`, `related`, `seo`, drafts.

### pages
Trang tĩnh: `title`, `slug`, `content` (richText), `seo`. Mẫu: gioi-thieu, chinh-sach-bao-hanh, chinh-sach-bao-mat, huong-dan-gui-ban-ve.

### quote-requests
Từ form: `name`, `phone`, `email`, `company`, `message`, `attachment` (upload riêng, chỉ dxf/dwg/pdf/jpg/png ≤10 MB), `status: new | callback | contacted | done` (Mới, Cần liên hệ lại, Đã liên hệ, Hoàn tất; khai báo ở `src/lib/quoteStatus.ts`, `callback` thêm ngày 12/10/2026), `source` (trang gửi, gồm cả `?sp=<tên sản phẩm>` khi gửi từ nút báo giá của sản phẩm), `ip` (chỉ để truy vết spam). Access: public create; admin/editor read; không public read. Hook afterChange: gửi email SMTP cho Mr Vinh, báo realtime cho admin (`notifyLiveChange`). Bật `versions` (tối đa 50, không nháp): tab "Danh sách phiên bản" để xem, so sánh, khôi phục (11/10/2026). Yêu cầu chưa có phiên bản thì lần sửa đầu tự lưu bản gốc (hook `saveBaselineVersion`). `status` không được để trống (validate, không NOT NULL) (12/10/2026). Không cho khôi phục phiên bản giống hệt nội dung hiện tại (hook `beforeOperation` `blockNoopRestore`).

### subscribers
`email` unique, `createdAt`. Public create, chặn trùng, giới hạn 5 lần/IP/giờ. Hook afterChange/afterDelete báo realtime cho admin (huy hiệu số đăng ký hôm nay, 11/10/2026).

## Globals

### site-settings
`companyName`, `brandName`, `logo`, `taxCode`, `hotline`, `zalo`, `email`, `address`, `workingHours`, `facebook`, `youtube`, `tiktok`, `mapEmbed`, `ga4Id`, `pixelId`.

### navigation
`left[]` và `right[]`: {label, type: link | mega, href, megaMenu}. `megaMenu`: `columns[] {title, links[] {label, href}}`, `featuredImage`, `featuredLabel`, `featuredHref`. Catalogue mega: `downloads[] {title, note, file}`. Footer links riêng `footerLinks[]`.

### home
- `slides[] {image, title, description, buttonLabel, buttonHref}` (3 slide).
- `collections[] {tag, title, description, image, href}` (2 ô).
- `about {slogan, foundedYear, heading, paragraphs[], image, badgeTitle, badgeSub}`.
- `solutions[] {title, subtitle, image, href}` (2 ô).
- `applications[] {tabLabel, title, description, image, products[] (relationship), hotspots[] {x, y, label}}` (4 tab; hotspots đặt bằng chuột qua UI field `hotspotPicker` trong admin, bấm vào ảnh để thêm, kéo để dời).
- `homeCategories` (relationship product-categories, 6).
- `newsCount` (4).

## Hooks và tiện ích
- `beforeValidate`: tạo slug không dấu từ title/name nếu trống; đảm bảo unique.
- `afterChange` trên products, posts, pages, globals: `revalidatePath` / `revalidateTag` tương ứng.
- Tìm kiếm: endpoint `/api/search?q=` tìm products và posts, so khớp trên bản không dấu (lưu thêm field `searchText` không dấu, cập nhật qua hook).
- Seed script: nạp danh mục, 12 sản phẩm, 8 bài, home, navigation từ `docs/design/images`.

## Truy vấn cho giao diện (Dev A viết, Dev B gọi)
`getHome()`, `getNavigation()`, `getSiteSettings()`, `getCategories()`, `getProducts({category, page})`, `getProduct(slug)`, `getRelatedProducts(id)`, `getPosts({category, page})`, `getPost(slug)`, `getPage(slug)`, `search(q)`. Dùng Local API của Payload, cache theo tag. Truy vấn sản phẩm, bài viết, trang tĩnh, trang chủ chạy dưới quyền khách (`AS_GUEST`, `overrideAccess: false`) để bản nháp không lên website (12/10/2026).

### visitor-stats (thêm 13/10/2026)
`showInFooter`, `total`, `today`, `todayDate`. Website tự tăng qua `POST /api/visit`; admin có thể đặt số khởi điểm cho `total`.
