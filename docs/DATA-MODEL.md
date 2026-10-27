# Mô hình dữ liệu Payload

Tên collection, slug và field bằng tiếng Anh; label hiển thị trong admin bằng tiếng Việt. Mọi collection có nội dung hiển thị đều bật `versions.drafts`. Sau khi khai báo xong chạy `pnpm payload generate:types` và commit `payload-types.ts` (mốc ngày 3 cho Dev B).

Giới hạn độ dài (26/10/2026): tiêu đề, tên, nhãn, câu ngắn khách nhập đều có `maxLength` qua `limit()` (`src/fields/limits.ts`, mức chung `MAX`): tên sản phẩm 80, tiêu đề bài viết 100, tiêu đề trang tĩnh 80, tên danh mục 50, tóm tắt/đoạn mở đầu 300, tiêu đề khối trang chủ 70, tiêu đề ô ảnh 50, nhãn nút/tab 30, nhãn menu chính 30, nhãn liên kết 50, câu một dòng 120 (bảng đầy đủ ở CHANGELOG 26/10 đợt 4). Chỉ là kiểm tra, không đổi schema.

## Collections

### users
Auth. `role: 'admin' | 'editor'`. Editor (Nhân viên): thêm, sửa products, posts, pages và được chọn lưu nháp hoặc xuất bản; tải lên, sửa media; sửa global home; sửa thông tin, tệp đính kèm và `status` của quote-requests; subscribers chỉ đọc; product-categories, post-categories thêm, sửa được; không xóa gì; không sửa navigation, site-settings, visitor-stats, users khác (các mục này ẩn khỏi menu của editor). `source` và `ip` của yêu cầu báo giá là dữ liệu hệ thống, không ai sửa được. Xem lịch sử thay đổi quyền ở `docs/CHANGELOG.md`.

### media
Upload. `alt` bắt buộc. Sizes: `thumb` 300×300 cover, `card` 800×600 cover, `wide` rộng 1600 giữ tỉ lệ, `hero` 2400×1200 **cắt 2:1** cho slider (từ 13/10), `og` 1200×630 cắt. Cần ảnh không cắt (xem phóng to) thì dùng ảnh gốc: `size="original"` ở `Img`, `mediaUrl`. `mediaUrl()` gắn `?v=<updatedAt>`: thay tệp hay chọn lại vùng ảnh thì tên tệp các cỡ giữ nguyên, có `?v` thì bộ đệm ảnh của Next (4 giờ) và trình duyệt mới lấy bản mới (26/10/2026). Lưu `/media` trên VPS, nằm trong backup. Ảnh chia sẻ (og:image) của trang lấy cỡ `og`; trang không có ảnh riêng (danh sách sản phẩm, bài viết, Liên hệ, danh mục bài viết, trang tĩnh không có ảnh bìa, Trang chủ để trống "Ảnh chia sẻ") dùng `public/og-default.jpg` (1200×630: nền tối, logo ngang trắng, dòng dịch vụ và hotline; `buildMetadata` trong `src/lib/metadata.ts`).

### product-categories
`name`, `slug` (tự sinh), `description`, `image` (media), `order` (number), `showOnHome` (bool). Dùng cho menu, lưới danh mục trang chủ, mega menu. Danh sách admin có cột "Ảnh" (field ui `thumbnail`, không lưu DB) đứng trước tên (12/10/2026). Không xóa được khi còn sản phẩm (kể cả bản nháp) gắn danh mục: `beforeDelete` `blockDeleteWhileUsed` trong `src/hooks/categories.ts` (26/10/2026).

### products
`name`, `slug`, `category` (relationship), `images` (array media, ảnh đầu là ảnh đại diện), `summary` (text ngắn), `description` (richText), `material`, `spec` (array {label, value}), `price` (text nhập tự do, mặc định "Liên hệ"; `beforeValidate` gọn khoảng trắng; hiển thị qua `priceText()` trong `src/lib/price.ts`: trống, toàn khoảng trắng, "Liên hệ" mọi kiểu viết thì trang chi tiết hiện "Liên hệ", thẻ hiện "Xem sản phẩm"), `featured` (bool), `related` (relationship many, tối đa 8, web hiện đủ số đã chọn, để trống tự lấy 4 cùng danh mục: `RELATED` trong `src/lib/related.ts`; chọn mới chỉ được sản phẩm đã xuất bản, không chọn chính nó: `publishedOthers` + `validatePublishedRelation` trong `src/fields/publishedOnly.ts`; mục chọn rồi bị ẩn vẫn giữ, web không hiện), `seo` (plugin), `status` draft/published. Danh sách admin có cột "Ảnh" lấy ảnh đầu của bộ ảnh (field ui `thumbnail`) (12/10/2026). Hook `beforeValidate` bỏ dòng `images` chưa chọn ảnh và dòng `spec` trống (13/10/2026).

### post-categories
`name`, `slug`. Dữ liệu mẫu: Kiến thức, Tin tức, Tuyển dụng. Không xóa được khi còn bài viết gắn danh mục (`blockDeleteWhileUsed`).

### posts
`title`, `slug`, `category`, `cover` (media), `excerpt`, `content` (richText Lexical: heading, list, image, YouTube embed, table), `author` (relationship users, tự gán; chỉ để biết ai đăng trong admin, **không hiện ra web** từ 26/10/2026), `publishedAt`, `related` (tối đa 6, web hiện đủ số đã chọn, để trống tự lấy 3 cùng danh mục: `RELATED`; chỉ chọn bài đã xuất bản, không chọn chính nó: `publishedOthers` trong `src/fields/publishedOnly.ts`), `seo`, drafts.

### pages
Trang tĩnh: `title`, `slug`, `content` (richText), `seo`. Mẫu: gioi-thieu, chinh-sach-bao-hanh, chinh-sach-bao-mat, huong-dan-gui-ban-ve.

### quote-requests
Từ form: `name`, `phone`, `email`, `company`, `message`, `attachment` (upload riêng, chỉ dxf/dwg/pdf/jpg/png ≤10 MB), `status: new | callback | contacted | done` (Mới, Cần liên hệ lại, Đã liên hệ, Hoàn tất; khai báo ở `src/lib/quoteStatus.ts`, `callback` thêm ngày 12/10/2026), `source` (trang gửi, gồm cả `?sp=<tên sản phẩm>` khi gửi từ nút báo giá của sản phẩm), `ip` (chỉ để truy vết spam). Access: public không tạo/đọc collection; admin/editor đọc, sửa các ô hiển thị và tải tệp mới để thay `attachment`. `source` và `ip` không sửa được. Hook afterChange: gửi email SMTP cho Mr Vinh khi khách gửi mới, báo realtime cho admin (`notifyLiveChange`). Bật `versions` (tối đa 50, không nháp): tab "Danh sách phiên bản" để xem, so sánh, khôi phục (11/10/2026). Yêu cầu chưa có phiên bản thì lần sửa đầu tự lưu bản gốc (hook `saveBaselineVersion`). `status` không được để trống (validate, không NOT NULL) (12/10/2026). Không cho khôi phục phiên bản giống hệt nội dung hiện tại (hook `beforeOperation` `blockNoopRestore`).

### subscribers
`email` unique, `createdAt`. Public create, chặn trùng, giới hạn 5 lần/IP/giờ. Hook afterChange/afterDelete báo realtime cho admin (huy hiệu số đăng ký hôm nay, 11/10/2026).

## Globals

### site-settings
`companyName`, `brandName`, `logo`, `taxCode`, `hotline`, `zalo`, `email`, `address`, `workingHours`, `facebook`, `youtube`, `tiktok`, `mapEmbed`, `ga4Id`, `pixelId`.

### navigation
`left[]` và `right[]`: {label, type: link | mega, href, megaMenu}. `megaMenu`: `columns[] {title, links[] {label, href}}`, `featuredImage`, `featuredLabel`, `featuredHref`. Catalogue mega: `downloads[] {title, note, file}`. Footer links riêng `footerLinks[]`. `revision` (number, ẩn, từ 27/10/2026): tăng 1 mỗi lần lưu (`src/fields/revision.ts`). Global này chỉ gồm mảng, adapter Postgres bỏ qua ghi dòng chính nên trước đó `updatedAt` không bao giờ đổi; có ô này thì `updatedAt` đổi theo mỗi lần lưu.

### home
- `slides[] {image, title, description, buttonLabel, buttonHref}` (3 slide).
- `collections[] {tag, title, description, image, imageFrame, href}` (2 ô).
- `about {slogan, foundedYear, heading, paragraphs[], image, imageFrame, badgeTitle, badgeSub}`.
- `solutions[] {title, subtitle, image, imageFrame, href}` (2 ô).
- `applications[] {tabLabel, title, description, image, imageFrame, products[] (relationship, chỉ chọn sản phẩm đã xuất bản: `publishedOnly`), hotspots[] {x, y, label}}` (4 tab; hotspots đặt bằng chuột qua UI field `hotspotPicker` trong admin, bấm vào ảnh để thêm, kéo để dời).
- `imageFrame` (json, từ 27/10/2026): "Vùng ảnh muốn giữ" của ô ảnh cùng hàng, `{x, y, width, height, media}`. Bốn số tính theo % ảnh gốc, `media` là id ảnh lúc chọn; đổi ảnh khác thì vùng cũ bị bỏ qua. Kéo khung trong admin (`ImageFrameField` chế độ `focal`), lưu cùng trang chủ khi bấm Lưu. Web phóng ảnh sao cho vùng hiện trọn và to nhất trong ô (`FramedImage`, `src/lib/frame.ts`). Trống thì hiện như cũ: cỡ `wide`, căn theo điểm lấy nét của ảnh. Vùng gắn với ô, không sửa `focalX/Y` của ảnh dùng chung.
- `homeCategories` (relationship product-categories, 6).
- `newsCount` (4).

## Hooks và tiện ích
- `beforeValidate`: tạo slug không dấu từ title/name nếu trống; đảm bảo unique.
- Ô slug trong admin (`SlugField`, từ 24/10/2026) hiện tiền tố đường dẫn trước slug (`slugField(..., { urlPrefix })`, hằng `URL_PREFIX` của từng collection): products `/san-pham/`, product-categories `/san-pham/danh-muc/`, posts `/bai-viet/`, post-categories `/bai-viet/danh-muc/`, pages `/`. Chỉ là hiển thị; giá trị lưu vẫn là slug trơn.
- `afterChange` trên products, posts, pages, globals: `revalidatePath` / `revalidateTag` tương ứng.
- `beforeValidate` `rejectStaleSave` trên home, navigation, site-settings (`src/hooks/staleSave.ts`, từ 27/10/2026): form admin gửi kèm `updatedAt` của lúc mở trang; cũ hơn bản trong DB (trang đã được lưu ở tab hay máy khác) thì từ chối 409, không để form cũ đè mất thay đổi. Gọi API không kèm `updatedAt` thì bỏ qua. Phía admin `StaleDocWatcher` báo khi quay lại tab đã cũ.
- Tìm kiếm: endpoint `/api/search?q=` tìm products và posts, so khớp trên bản không dấu (lưu thêm field `searchText` không dấu, cập nhật qua hook).
- Seed script: nạp danh mục, 12 sản phẩm, 8 bài, home, navigation từ `docs/design/images`.

## Truy vấn cho giao diện (Dev A viết, Dev B gọi)
`getHome()`, `getNavigation()`, `getSiteSettings()`, `getCategories()`, `getProducts({category, page})`, `getProduct(slug)`, `getRelatedProducts(id)`, `getPosts({category, page})`, `getPost(slug)`, `getPage(slug)`, `search(q)`. Dùng Local API của Payload, cache theo tag. Truy vấn sản phẩm, bài viết, trang tĩnh, trang chủ chạy dưới quyền khách (`AS_GUEST`, `overrideAccess: false`) để bản nháp không lên website (12/10/2026).

### visitor-stats (thêm 13/10/2026)
`showInFooter`, `total`, `today`, `todayDate`. Website tự tăng qua `POST /api/visit`; admin có thể đặt số khởi điểm cho `total`.
