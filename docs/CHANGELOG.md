# Nhật ký thay đổi

Mỗi lần sửa code thì thêm một mục vào đầu file, commit cùng với code. Mỗi mục ghi: **làm gì, vì sao, file nào, cách kiểm tra, lưu ý cho người sửa sau**. Thay đổi trước ngày 11/10/2026 xem `git log`.

---

## 27/10/2026 · một font không chân

### Giao diện chỉ dùng một font không chân (Inter Tight)

**Vì sao:** yêu cầu chỉ dùng một font, loại không chân. Trước đó tiêu đề dùng Playfair Display (có chân), chữ thường dùng Be Vietnam Pro. Sau đó khách muốn kiểu chữ của web Modern Village: đó là **Forma DJR Micro**, font thương mại mvillage đã mua giấy phép (`mvillage-web/public/fonts`), không chép sang dự án khác. Đã so sánh 8 font Google có tiếng Việt cùng dáng grotesque; chọn **Inter Tight** (gần Forma nhất về tỉ lệ, khoảng cách chữ khi đậm).

**Cách làm:**
- `src/app/(frontend)/layout.tsx`: bỏ nạp Playfair Display, nạp Inter Tight (font biến thiên, biến `--font-inter-tight`); `globals.css` `--font-sans` trỏ sang nó. Admin giữ Be Vietnam Pro (`custom.scss`).
- **Menu giữ font cũ** theo yêu cầu: Be Vietnam Pro vẫn nạp (biến `--font-be-vietnam`), token `--font-menu` trong `globals.css`, class `font-menu` gắn ở gốc menu ngang (hai `<nav>`), mega menu (`MegaPanel`) và menu điện thoại (`MobileDrawer`) trong `HeaderClient.tsx`. Mọi chữ bên trong, kể cả tiêu đề thẻ ảnh `.h-display` trong mega menu, theo font đó vì `.h-display` không tự đặt font mà kế thừa. Ô tìm kiếm mở từ header vẫn Inter Tight.
- `globals.css`: class `.h-serif` đổi tên thành **`.h-display`** (17 chỗ trong 12 file), Inter Tight **600** thay cho Playfair 500 (chữ không chân ở 500 trông nhạt hơn); tiêu đề trong nội dung bài (`.prose-lux h2–h4`) cũng 600. Token `--font-serif: initial` để Tailwind không tạo `font-serif`, lỡ dùng cũng không ra chữ có chân.
- Tiêu đề trang bài viết (`bai-viet/[slug]/page.tsx`) và thẻ bài viết (`PostCard.tsx`): bỏ `font-serif`, đậm 600.
- Font không chân in hoa rộng hơn Playfair nên nhiều tiêu đề rớt một chữ xuống dòng ("Tìm hiểu sản phẩm theo danh mục" → "MỤC" một mình). `SectionHeading.tsx`: giới hạn 720px chỉ còn ở đoạn mô tả, tiêu đề dùng hết bề ngang; nút bên phải (khối tin tức) bọc `shrink-0`. `.h-display` thêm `text-wrap: balance`: phải xuống dòng thì chia đều (đo ở 1440px và 390px: dòng cuối "Khám phá ứng dụng cho công trình" 146 → 422px, "Liên hệ với chúng tôi" trên điện thoại 56 → 186px).

**Kiểm tra:** trên dev, trang chủ, chi tiết sản phẩm, danh sách và chi tiết bài viết ở 1440px và 390px: tiêu đề, chữ thường là Inter Tight 600/300–500; chụp màn hình xem tay. Menu đo `getComputedStyle().fontFamily` ở 390px (mục menu điện thoại, link mega trong đó), 1920px và 2400px (mục menu ngang, chữ mega, tiêu đề thẻ ảnh mega "Giải pháp"): Be Vietnam Pro; tiêu đề trang và ô tìm kiếm: Inter Tight. `pnpm lint`, `tsc` sạch.

**Lưu ý:** tiêu đề mới dùng `.h-display`; đừng thêm `font-sans` vào `.h-display`, làm vậy thì tiêu đề trong mega menu đổi sang Inter Tight. Giao diện mẫu `docs/design/mau-3-trang-chu.html` vẫn là Playfair, đó là bản duyệt cũ, không phải nguồn chuẩn cho font nữa (DESIGN.md mục Chữ ghi rõ).

---

## 27/10/2026 · bo góc ảnh sản phẩm và nút

### Bo góc ảnh sản phẩm và nút bấm

**Vì sao:** yêu cầu bo tròn góc ảnh sản phẩm và nút (Mẫu 3 gốc góc vuông).

**Cách làm:**
- 2 token trong `@theme` (`src/app/(frontend)/globals.css`): `--radius-btn: 0.5rem` (8px, class `rounded-btn`) và `--radius-card: 0.75rem` (12px, class `rounded-card`). Muốn đổi độ bo chỉ sửa ở đây.
- Nút: `.btn-ghost`, `.btn-solid`, `.chip` trong globals.css; chip lọc `CategoryChips.tsx`, `PostListing.tsx`; `Pagination.tsx`; `ShareBar.tsx`; nút mạng xã hội `ContactSection.tsx`; nút Đóng 2 mega menu `HeaderClient.tsx`; nút Đóng, trước, sau của `Lightbox.tsx`; nút phóng to trên ảnh `ProductGallery.tsx`.
- Ảnh: `ProductCard.tsx`, ảnh chính và ảnh thu nhỏ `ProductGallery.tsx`, thẻ danh mục `CategoriesGrid.tsx` (rounded-card); ảnh 72px tab Ứng dụng `Applications.tsx` (rounded-btn).
- Ảnh bài viết: thẻ `PostCard.tsx` (trang chủ, danh sách, bài liên quan, tìm kiếm) rounded-card; trong nội dung (`RichText.tsx`, dùng cho cả trang tĩnh): ảnh `.prose-lux img` (globals.css) và khung video YouTube rounded-card, thẻ liên kết "Mối quan hệ" và ảnh nhỏ của nó rounded-btn.
- Khối Giới thiệu (`About.tsx`): ảnh bọc trong lớp `absolute inset-0 overflow-hidden rounded-card` (không cắt ở khung ngoài vì ô accent lệch ra ngoài ảnh `lg:-left-10`), ô "CẮT, CHẤN, HÀN, SƠN" `rounded-btn`.
- Khung ảnh tab Ứng dụng (`Applications.tsx`) `rounded-card`; khung vốn `overflow-hidden`, chấm và nhãn đều nằm trong.
- Khối Liên hệ: ô nhập `.field` (globals.css) `rounded-btn`, nút "Chọn tệp" trong `QuoteForm.tsx` `rounded-md`, ô thông tin công ty `ContactSection.tsx` `rounded-card`.
- Không đổi: khung ảnh lớn trang chủ (slider, bộ sưu tập, giải pháp), ảnh bìa mờ đầu trang bài viết, thanh đáy điện thoại. Khung viền vàng trong ảnh chi tiết (`.frame::after`, lùi 18px) vẫn vuông vì lùi vào sâu hơn độ bo.

**Kiểm tra:** đo `border-radius` trên dev: ảnh thẻ, ảnh chính, thẻ danh mục 12px; chip, nút Gọi/Zalo/Báo giá, nút chia sẻ 8px; chụp trang danh sách và chi tiết ở 1440px và 390px. `pnpm lint` sạch, `tsc` sạch.

**Lưu ý:** nút mới viết thêm thì gắn `rounded-btn` (hoặc dùng `.btn-*`), ảnh sản phẩm mới gắn `rounded-card` cùng `overflow-hidden` để ảnh bên trong bị cắt theo góc.

---

## 27/10/2026 · bỏ đăng ký bản tin

### Bỏ tính năng đăng ký bản tin

**Vì sao:** website chỉ lưu email mà không gửi gì (gửi bản tin nằm ở giai đoạn 2, cần email theo tên miền, dịch vụ gửi hàng loạt và người viết nội dung; khách chưa có). Ô đăng ký hứa "nhận thông tin mẫu mới và ưu đãi" mà không ai gửi, lại giữ email khách mà không dùng. Khách của xưởng liên hệ chủ yếu qua điện thoại, Zalo và form báo giá. Ô này thuộc hạng mục 5 đã ký, đã ghi chú trong `docs/SCOPE.md`, **cần khách xác nhận**.

**Cách làm:**
- Xoá `src/collections/Subscribers.ts`, `src/app/(frontend)/api/subscribe/route.ts`, `src/components/forms/NewsletterForm.tsx`; bỏ khỏi `payload.config.ts`.
- Khối liên hệ (`ContactSection.tsx`, trang chủ, trang Liên hệ): bỏ ô đăng ký và prop `newsletterNote`. Global Home: bỏ ô "Ghi chú ô bản tin" (`newsletterNote`). Seed bỏ theo.
- Admin: bỏ ô "Đăng ký bản tin" trên Bảng điều khiển (còn 3 ô, lưới `.dash-stats` đổi sang `auto-fit`), mục trong menu, huy hiệu "+n hôm nay" và kiểu `.nav-badge--soft`, toast "đăng ký bản tin mới". `LiveCounts` (`src/lib/liveEvents.ts`) chỉ còn số yêu cầu báo giá theo trạng thái.
- `pnpm generate:types`.

**Database:** bỏ bảng `subscribers` và cột `newsletter_note` của Home.
- Dev: `pnpm dev` tự đẩy schema. Bảng còn dữ liệu thì Payload hỏi xác nhận xoá trong terminal.
- VPS (`pnpm start` không tự đẩy schema): chạy `pnpm dev` một lần trên môi trường đó, hoặc tạo migration. **Trước khi deploy, nếu trên VPS đã có email thật trong "Đăng ký bản tin" thì xuất ra giữ lại**, vì bảng sẽ bị xoá.

**Kiểm tra:**
- Bỏ 11 test int (7 test `POST /api/subscribe`, 2 test quyền, 2 test realtime) và test e2e "đăng ký bản tin hiện ngay trên bảng điều khiển". Test SSE đổi sang kiểm `newQuotes`.
- Test mới `contact.spec.ts` "khối liên hệ không còn ô đăng ký, API cũ trả 404".
- `pnpm lint` sạch. `tsc` sạch khi bỏ qua `.next/types` cũ: file sinh từ bản build 14/10 còn trỏ tới route đã xoá, tự hết khi build lại hoặc chạy `pnpm dev`; CI không có thư mục này.

**Lưu ý:** muốn làm lại bản tin ở giai đoạn 2 thì lấy lại 3 file trên từ git (commit trước thay đổi này) và đọc mục "Gửi bản tin" trong `docs/SCOPE.md`.

---

## 27/10/2026 · thanh chia sẻ dạng icon

### Thanh chia sẻ: icon thay chữ, bỏ "Sao chép link", nút Facebook không còn mở 2 cửa sổ

**Vì sao:** muốn thanh chia sẻ ở trang sản phẩm và bài viết gọn hơn: nút dạng icon, bỏ nút sao chép link. Khi sửa thì phát hiện bấm Facebook mở **2 cửa sổ** (cửa sổ nhỏ và thêm một tab): `window.open(..., 'noopener')` theo chuẩn luôn trả `null`, nên `preventDefault()` không bao giờ chạy và link `target="_blank"` mở thêm tab.

**Cách làm:**
- `src/components/ui/ShareBar.tsx`: nút vuông 36px chỉ có icon. Có `aria-label` cho trình đọc màn hình và `title` để rê chuột thấy chữ; khung ngoài có `role="group"` để nhãn "Chia sẻ" có tác dụng. Bỏ nút sao chép link cùng state `copied`.
- Facebook: `window.open` không kèm `noopener`, có cửa sổ thì đặt `w.opener = null` (trang Facebook không với ngược được trang mình) rồi `preventDefault()`. Trình duyệt chặn popup thì vẫn rơi về tab mới như cũ.
- `src/components/ui/Icons.tsx`: thêm `IconFacebook`, `IconShare`, nét theo bộ Lucide (giấy phép ISC), cùng kiểu stroke với các icon khác.

**Kiểm tra:**
- Test mới `tests/e2e/products.spec.ts` "nút chia sẻ Facebook dạng icon mở đúng một cửa sổ nhỏ": không còn nút sao chép; bấm Facebook mở đúng 1 cửa sổ, `window.opener` trong đó là `null`, trang sản phẩm giữ nguyên. Request sang Facebook bị chặn trong test.
- Đo tay: cửa sổ 640×560. Ở 390px (giả lập Web Share) có 2 icon.

**Lưu ý:** icon chia sẻ qua ứng dụng (Zalo, Messenger…) chỉ hiện khi trình duyệt có Web Share: điện thoại, Chrome trên Windows/macOS; Chrome trên Linux không có.

---

## 27/10/2026 · nhánh `fix/mobile-menu-hotspot-header`

### Mobile: nút cuối menu bị thanh đáy che, nhãn hotspot bị cắt, tràn ngang ở 320px

**Vì sao:** QA báo 3 lỗi trên điện thoại.
1. Cuộn hết menu ngăn kéo, nút "Yêu cầu báo giá" bị thanh Gọi/Zalo/Báo giá che 38px, bấm vào trúng thanh.
2. Nhãn hotspot "Ốp mặt tiền" ở khối Ứng dụng bị cắt ở mép phải ảnh. Đo thêm thấy "Mặt bích" và "Tấm ốp mặt tiền" cũng bị.
3. Màn 320px trang chủ và trang liên hệ cuộn ngang được (`scrollWidth` 345).

**Cách làm:**
- **Menu ngăn kéo** (`HeaderClient.tsx`, `MobileDrawer`): thêm `pb-16` (bỏ từ `md`), để nút cuối cuộn lên trên `MobileBar`. Thanh này cao khoảng 57px, cùng `z-30` và đứng sau trong DOM nên vẽ đè lên menu. Thanh vẫn hiện khi mở menu, để khách vẫn gọi hoặc nhắn Zalo được.
- **Hotspot** (`Applications.tsx`), bổ sung cho bản sửa nhãn của đợt 15 bên dưới (lật nhãn, xuống dòng; đã có trong `main`):
  - Dưới `sm` (khung ảnh hẹp), nhãn không nằm ngang cạnh chấm mà nằm dưới hoặc trên chấm, canh từ tâm chấm. `placeLabels()` đo nhãn, thử mọi tổ hợp trên/dưới, rồi chọn tổ hợp không đè nhãn khác, không che chấm khác, không tràn khung. Chỉ lật nhãn sang trái thì ở 386px "Ốp mặt tiền" vẫn đè "Vách hoa văn" (đúng trường hợp "hai chấm gần nhau" ghi ở mục đợt 15).
  - Nhãn giờ là con của chấm 22px, nên giới hạn bề ngang tính theo `cqw` của lớp chấm (`@container`) thay cho % của cụm chấm + nhãn. Vẫn chừa 8px tới mép khung như đợt 15.
  - Nhãn có thuộc tính `data-spot-label` cho `placeLabels()` và test. Test của đợt 15 (`.dot-pulse + span`) vẫn khớp vì nhãn đứng ngay sau chấm.
- **Tràn ngang ở 320px** có 2 nguyên nhân:
  - Ô thông tin trong khối liên hệ (`ContactSection.tsx`), là thủ phạm chính, có ở cả trang chủ lẫn trang liên hệ: logo ngang và tên công ty trên cùng một hàng rộng 277px, cộng padding 48px. Đã thêm `flex-wrap` và cho logo `max-w-[min(220px,100%)]`.
  - Header: dưới `lg`, cột logo đổi thành `minmax(0,auto)` và link logo có `min-w-0`, để logo co lại (120px ở 320px, 160px ở 360px) thay vì đẩy cụm nút phải ra ngoài. Màn 360px trước đây cũng tràn khoảng 12px.

**Kiểm tra:**
- 3 test mới trong `tests/e2e/responsive.spec.ts`:
  - Nút cuối menu bấm được ở 386×760.
  - Nhãn hotspot không bị cắt, không đè nhau ở 320px và 386px, cả 4 tab.
- Test của đợt 15 `admin.spec.ts` "điểm chấm sát mép ở tab Ứng dụng" (chấm 3%, 97%, nhãn dài) chạy lại với bản gộp.
  - Màn 320px không tràn ngang ở `/`, `/lien-he`, `/san-pham`.
- Chạy với code chưa sửa: test menu và test tràn ngang báo lỗi đúng.
- Quét 320–1600px không còn tràn ngang. Desktop thu menu về hamburger như trước (so với `HeaderClient` cũ ở 1366, 1440, 1600px).

**Lưu ý:**
- Từ `lg`, header giữ cột `auto` và link logo `lg:min-w-auto`. Phép đo thu menu về hamburger dựa vào việc header tràn thật. Nếu cho logo co ở desktop, menu ngang sẽ hiện ra đè lên logo thay vì thu lại (đã gặp khi thử, ở 1440px).
- Đổi chiều cao `MobileBar` thì sửa `pb-16` của ngăn kéo theo.
- `placeLabels()` tìm nhãn qua thuộc tính `data-spot-label`, test e2e cũng dựa vào thuộc tính này. Đừng bỏ.

---

## 27/10/2026 · nhánh `test` (đợt 16)

### Ảnh chia sẻ dự phòng `/og-default.jpg` bị thiếu

- **Vì sao:** khi soát mục kiểm thử "SEO Trang chủ", `buildMetadata` (`src/lib/metadata.ts`) dùng `/og-default.jpg` cho trang không có ảnh riêng, nhưng file chưa từng có trong `public/` (trả 404). Chia sẻ các trang danh sách sản phẩm, danh sách bài viết, Liên hệ, danh mục bài viết, trang tĩnh không có ảnh bìa, và Trang chủ khi bỏ trống "Ảnh chia sẻ" lên Facebook, Zalo đều ra ảnh hỏng.
- **Làm gì:** thêm `public/og-default.jpg`, 1200×630, 44 KB, theo Mẫu 3. Nền tối `#07080a` có quầng sáng nhẹ, khung mảnh màu accent, logo ngang bản trắng (`public/logo-ngang-trang.png`), vạch đỏ, dòng "Cắt laser CNC · Chấn gấp · Hàn · Sơn tĩnh điện" và "Thuận An, Bình Dương · Hotline/Zalo 0946.272.467". Dựng một lần bằng sharp (chữ SVG font Segoe UI), không phải code chạy trong app.
- **File:** `public/og-default.jpg` (mới), `tests/e2e/home.spec.ts`, `docs/DATA-MODEL.md`, `docs/TESTING.md`, `README.md`.

**Kiểm tra:**
- Dev: `/og-default.jpg` trả 200 `image/jpeg`; `og:image` của `/lien-he`, `/san-pham`, `/bai-viet` trỏ tới file này. Trang chủ đang có "Ảnh chia sẻ" nên dùng cỡ `og` 1200×630 của ảnh đó (200).
- `tests/e2e/home.spec.ts` 'ảnh chia sẻ (og:image) của trang chủ và các trang không có ảnh riêng đều mở được': với `/`, `/lien-he`, `/san-pham`, `/bai-viet`, tải link `og:image` phải được 200 và là ảnh. Qua, kèm test tiêu đề/mô tả trang chủ.

**Lưu ý:**
- Đổi số hotline, dịch vụ hay logo thì dựng lại ảnh này (khổ 1200×630, chữ to, nằm giữa để Zalo, Facebook cắt vuông vẫn thấy logo).
- Facebook, Zalo lưu tạm ảnh xem trước. Đổi ảnh xong muốn thấy ngay thì dùng Facebook Sharing Debugger (nút "Scrape Again"); chỉ làm được khi web đã có tên miền thật.

---

## 27/10/2026 · nhánh `test` (đợt 15)

### Nhãn điểm chấm ở tab Ứng dụng không còn bị khung ảnh cắt

- **Vì sao:** nhãn luôn nằm bên phải chấm và không xuống dòng (`whitespace-nowrap`). Chấm gần mép phải thì nhãn lọt ra ngoài khung ảnh (`overflow: hidden`) và bị cắt mất chữ.
- **Làm gì:**
  - `src/components/home/Applications.tsx`: chấm có `x > 50` thì nhãn lật sang trái (`flex-row-reverse`).
  - Cụm chấm + nhãn có `width: max-content` và `max-width` bằng phần còn lại của khung theo hướng nhãn, cách mép 8px. Nhãn dài thì xuống dòng (`wrap-anywhere`), không tràn.
  - Dịch dọc `-50%` thay cho `-11px`, để tâm chấm luôn ở đúng (x, y) kể cả khi nhãn hai dòng.
  - Khung đặt chấm trong admin (`HotspotPicker`, `custom.scss`): tâm vòng số nằm đúng điểm đặt (trước đây cả cụm số + nhãn + ✕ được canh giữa tại điểm, vòng số lệch trái so với web). Chấm ở nửa phải cũng lật nhãn sang trái (`.hotspot-picker__dot--flip`).
- **File:** `src/components/home/Applications.tsx`, `src/components/admin/HotspotPicker.tsx`, `src/app/(payload)/custom.scss`, `tests/e2e/admin.spec.ts`, `docs/DESIGN.md`, `docs/TESTING.md`, `README.md`.

**Kiểm tra:**
- Dữ liệu dev (5 chấm, 3 chấm ở nửa phải): đo bằng trình duyệt ở 1920px và 390px, không nhãn nào lọt ra ngoài khung. Đã chụp màn hình xem tay.
- `tests/e2e/admin.spec.ts` 'điểm chấm sát mép ở tab Ứng dụng…': đặt chấm ở x = 97% và 3% với nhãn dài. Ở 1280px và 390px, mọi nhãn nằm trọn trong khung, chấm vẫn ở đúng 97%.
- Ba test e2e ghi global `home` (vùng ảnh, hai tab, điểm chấm) gom vào nhóm 'Trang chủ: các test sửa dữ liệu', chạy lần lượt. CI chạy 2 worker song song; lần lưu của test này làm form đang mở của test kia thành bản cũ và bị `rejectStaleSave` chặn ngẫu nhiên. Nhóm này cùng test Menu: 5/5. Lint, typecheck sạch.

**Lưu ý:**
- Hai chấm đặt sát nhau thì nhãn chấm này vẫn có thể đè lên chấm kia (dữ liệu dev có hai chấm "(sửa nà)" gần như trùng chỗ, thấy rõ trên điện thoại vì khung nhỏ). Đây là chuyện đặt chấm, cần giãn chấm ra trong admin.

---

## 27/10/2026 · nhánh `test` (đợt 14)

### Mở Trang chủ ở hai tab: tab cũ không còn lưu đè thay đổi của tab kia

- **Vì sao:** mở Trang chủ ở tab trình duyệt 1, rồi mở thêm tab 2 sửa mục Giới thiệu và lưu. Quay lại tab 1 sửa Bộ sưu tập rồi lưu thì Giới thiệu bị trả về bản cũ. Form admin gửi **cả trang**; tab 1 vẫn giữ Giới thiệu từ lúc mở. Payload chỉ khóa tài liệu khi **người khác** đang mở, cùng tài khoản mở hai tab thì không báo gì. Đã tái hiện trên server test: tab B không hiện cảnh báo khóa, lần lưu của tab A đè tiêu đề Giới thiệu về bản cũ.
- **Làm gì:**
  - `rejectStaleSave` (`src/hooks/staleSave.ts`, mới), hook `beforeValidate` của Trang chủ, Menu, Thông tin công ty. Form admin luôn gửi kèm `updatedAt` của bản đang mở, và nhận giá trị mới sau mỗi lần lưu. Giá trị gửi lên cũ hơn bản trong DB thì từ chối 409 với thông báo: "Trang chủ đã được lưu ở tab hoặc máy khác lúc HH:MM:SS, sau khi bạn mở trang này. Đã dừng lưu… Chép lại phần vừa sửa, tải lại trang (F5) rồi sửa và lưu lại." Gọi API không kèm `updatedAt` (seed, script, test) thì không bị kiểm.
  - `StaleDocWatcher` (`src/components/admin/StaleDocWatcher.tsx`, mới), gắn ở `beforeDocumentControls` của 3 global.
    - Khi tab được xem lại (focus, visibilitychange) và mỗi 60 giây, so `updatedAt` của form với server. Server mới hơn thì hiện cảnh báo "Trang này vừa được lưu ở tab hoặc máy khác lúc …" kèm nút **Tải lại**, để biết trước khi sửa tiếp trên bản cũ.
    - Lưu xong hoặc tải lại thì cảnh báo tự tắt.
  - Menu: adapter Postgres của Payload bỏ qua ghi dòng chính khi chỉ có mảng thay đổi (`@payloadcms/drizzle` upsertRow: "Exclude timestamp-only updates"). Menu chỉ gồm mảng nên `updatedAt` không bao giờ đổi, không so được. Thêm ô ẩn `revision` (`src/fields/revision.ts`), tăng 1 mỗi lần lưu, để dòng chính luôn được ghi.
  - `timeVN()` trong `src/lib/format.ts` (giờ theo múi giờ Việt Nam), dùng chung cho server và admin.
- **File:** `src/hooks/staleSave.ts` (mới), `src/components/admin/StaleDocWatcher.tsx` (mới), `src/fields/revision.ts` (mới), `src/globals/{Home,Navigation,SiteSettings}.ts`, `src/lib/format.ts`, `src/payload-types.ts`, `importMap.js`, `tests/int/collections.test.ts`, `tests/e2e/admin.spec.ts`, `docs/DATA-MODEL.md`, `docs/TESTING.md`, `README.md`, `CLAUDE.md`.

**Kiểm tra:**
- `tests/int/collections.test.ts` 'không lưu đè bản cũ khi mở cùng trang ở hai tab':
  - Tab 2 lưu với `updatedAt` lúc mở; tab 1 lưu sau với cùng `updatedAt` thì bị 409, đúng thông báo, giá trị của tab 2 giữ nguyên.
  - Gửi `updatedAt` mới nhất, hay không gửi, thì lưu được.
  - Menu và Thông tin công ty cũng bị chặn như vậy. Menu chỉ qua được sau khi có ô `revision`.
- `tests/e2e/admin.spec.ts` 'mở Trang chủ ở hai tab…' (hai trang cùng phiên đăng nhập):
  - B sửa Giới thiệu rồi lưu. Quay lại A thì thấy cảnh báo. A sửa Bộ sưu tập rồi lưu thì bị chặn, API vẫn giữ Giới thiệu của B, Bộ sưu tập chưa đổi.
  - Bấm "Tải lại", sửa lại, lưu thì được, cả hai thay đổi đều còn.
- 'Menu lưu hai lần liên tiếp trong cùng tab…': cả hai lần đều lưu, không bị báo là bản cũ, `updatedAt` có đổi.
- Unit 77/77, int 136/136, e2e toàn bộ 118/118. Lint, typecheck sạch.

**Lưu ý:**
- Đổi schema: thêm cột `navigation.revision`. DB dev tự thêm khi chạy `pnpm dev`; VPS cần push hoặc migration (KNOWN-ISSUES #4).
- Chỉ áp cho 3 global. Sản phẩm, bài viết, trang tĩnh mở ở hai tab vẫn có thể đè nhau; các collection này có bản nháp và phiên bản (khôi phục lại được), nên chưa làm. Muốn áp thì làm hook tương tự cho collection, lưu ý `updatedAt` của bản nháp nằm ở bảng phiên bản.
- Global nào chỉ gồm mảng, nhóm hay quan hệ thì thêm `revisionField`, không thì `updatedAt` không đổi và việc chặn không hoạt động.

---

## 27/10/2026 · nhánh `test` (đợt 13)

### "Vùng ảnh muốn giữ" ở trang chủ: web phóng đúng vùng đã chọn

- **Vì sao:** ở ô Bộ sưu tập, kéo khung tới phần muốn giữ, bấm "Lưu vùng ảnh", nhưng web gần như không đổi. Hai lỗi chồng lên nhau:
  1. Chế độ `focal` chỉ lưu **tâm** khung làm `focalX/Y` của ảnh, bỏ qua cỡ khung. Web luôn phủ kín ô bằng cả ảnh rồi căn theo điểm đó, nên chọn vùng nhỏ cũng không phóng to, chỉ dịch vài chục px. Thêm nữa, điểm lấy nét nằm trên ảnh dùng chung, ảnh dùng ở chỗ khác cũng bị đổi theo.
  2. Ảnh trong khung chọn bị kéo đủ 720px ngang, chặn cao 520px rồi `object-fit: contain`. Ảnh vuông hay ảnh dọc có viền đen hai bên, react-image-crop tính % theo cả viền đen, nên vùng lưu lệch so với ảnh. Khung vuông mở lại thành 4:3.
- **Làm gì:**
  - Ô `imageFrame` của 4 khối (Bộ sưu tập, Giới thiệu, Giải pháp, Ứng dụng) đổi từ field `ui` sang field `json` (helper `imageFrame(aspect)` trong `src/globals/Home.ts`). Lưu `{x, y, width, height, media}` theo % ảnh gốc cho riêng ô đó; `media` để khi đổi ảnh khác thì vùng cũ tự bỏ qua.
  - `ImageFrameField` tách 2 chế độ. `hero` (slide) giữ nguyên: bấm "Lưu khung slider", server cắt ảnh. `focal`: thả chuột là ghi vùng vào ô, bấm **Lưu ở đầu trang** như các ô khác (bỏ nút "Lưu vùng ảnh", không gọi `PATCH /api/media` nữa). Có dòng trạng thái "Đã chọn vùng." / "Chưa chọn vùng…" và nút "Dùng cả ảnh" để bỏ vùng. Chưa chọn thì khung hiện quanh điểm lấy nét, gần đúng phần web đang hiện. Khung mặc định tính đúng cho mọi tỉ lệ ảnh (`cropAt`); trước đây `makeAspectCrop` 100% có thể vượt khỏi ảnh.
  - CSS khung chọn (`custom.scss`, `.slider-crop__editor`): ảnh `width/height: auto` với `max-width: 100%`, `max-height: 520px`, ReactCrop ôm sát ảnh. Không còn viền đen, % của khung là % của ảnh.
  - Web: `FramedImage` (`src/components/ui/FramedImage.tsx`, mới) thay `Img` trong `ImageCard` (Bộ sưu tập, Giải pháp), Giới thiệu, Ứng dụng.
    - Có vùng: ảnh gốc đặt trong lớp `container-type: size`, cỡ và vị trí tính bằng CSS `cqw/cqh` (`frameBoxStyle()` trong `src/lib/frame.ts`, mới).
    - Rộng ảnh = max(phủ kín ô, min(vùng vừa khít bề ngang, vùng vừa khít bề dọc)); tâm vùng về giữa ô, chặn ở mép ảnh. Vùng luôn hiện trọn và to nhất có thể ở mọi cỡ màn hình, không cần JS.
    - `sizes` nhân theo mức phóng (`scaleSizes`, tối đa 4 lần) để ảnh đủ nét.
    - Chưa có vùng: y như cũ (cỡ `wide`, căn theo điểm lấy nét).
  - `HotspotPicker` (tab Ứng dụng): khung đặt chấm đổi từ 4:3 sang 16:10 (tỉ lệ ô trên máy tính). Ảnh hiện như web: phóng theo vùng nếu có, không thì phủ kín và căn theo điểm lấy nét (trước dùng cỡ `card` cắt 4:3). Chấm vẫn lưu theo % khung như cũ.
- **File:** `src/lib/frame.ts` (mới), `src/components/ui/FramedImage.tsx` (mới), `src/components/ui/ImageCard.tsx`, `src/components/home/{Collections,Solutions,About,Applications}.tsx`, `src/components/admin/ImageFrameField.tsx`, `src/components/admin/HotspotPicker.tsx`, `src/globals/Home.ts`, `src/payload-types.ts`, `src/app/(payload)/custom.scss`, `tests/unit/frame.test.ts` (mới), `tests/e2e/admin.spec.ts`, `docs/DATA-MODEL.md`, `docs/DESIGN.md`, `docs/TESTING.md`, `README.md`, `CLAUDE.md`.

**Kiểm tra:**
- `tests/unit/frame.test.ts` (9 test): tính thử biểu thức CSS của `frameBoxStyle` với ô dọc, ô ngang, vùng sát mép, vùng to. Vùng hiện trọn, lấp đầy một chiều, nằm giữa; ảnh luôn phủ kín ô. Cùng `parseFrame` (sai dạng, ảnh khác, kéo về trong mép) và `scaleSizes`.
- `tests/e2e/admin.spec.ts` 'vùng ảnh muốn giữ ở Bộ sưu tập…':
  - Ảnh trong cả hai khung đúng tỉ lệ gốc (ô 2 là ảnh 4:3 từng bị viền đen), khung vuông.
  - Kéo góc cho nhỏ lại thì hiện "Đã chọn vùng.". Bấm Lưu thì API trả `imageFrame` đúng id ảnh, vuông theo pixel ảnh.
  - Mở trang chủ: ảnh phủ kín ô, vùng nằm trọn trong ô và lấp đầy một chiều. Xong trả dữ liệu cũ.
  - Đã chụp màn hình xem tay cả khung trong admin lẫn ô trên trang chủ.
- Bấm vào khung mà không kéo thì không ghi gì: react-image-crop gọi `onComplete` cả khi chỉ bấm; vùng không đổi thì bỏ qua, trang không bị tính là có thay đổi. Test e2e trên có bước này.
- Unit 77/77, int 134/134, e2e toàn bộ 115/116. Test hỏng là 'hộp "Chọn từ thư viện"…' (chờ trang sửa sản phẩm load quá 45 giây khi máy thiếu RAM); chạy lại riêng thì qua. Lint, typecheck sạch.

**Lưu ý:**
- Đổi schema: thêm cột jsonb `home_collections.image_frame`, `home.about_image_frame`, `home_solutions.image_frame`, `home_applications.image_frame`. DB dev đã tự thêm khi chạy `pnpm dev`; VPS cần push hoặc migration (KNOWN-ISSUES #4).
- Vùng chọn cũ không chuyển sang: trước đây chỉ có điểm lấy nét trên ảnh, vẫn dùng khi ô chưa chọn vùng. Muốn phóng thì vào từng ô kéo khung lại rồi Lưu.
- Cần trình duyệt hỗ trợ container query units (Chrome 105, Safari 16, Firefox 110 trở lên).
- react-image-crop 10.1.8: phần tử góc kéo rộng 0, ô bấm được là `::after` 10×10 đúng góc khung. Test kéo góc phải bấm vào góc khung, không bấm tâm phần tử góc.

---

## 27/10/2026 · nhánh `test` (đợt 12)

### Slider trang chủ dừng khi rê chuột lên nút

- **Vì sao:** đổi "Nút dẫn tới" của slide 4 sang `/bai-viet` nhưng bấm nút trên web vẫn ra `/san-pham`. Dữ liệu không sai: DB, HTML và nút của slide 4 trong trình duyệt đều đúng `/bai-viet`. Lỗi là slider tự chuyển mỗi 5,5 giây kể cả khi con trỏ đang nằm trên nút. Slide 4 là slide cuối nên slide kế tiếp là slide 1, nút của slide 1 trỏ `/san-pham`. Đang đọc hay đang đưa chuột tới thì nút dưới con trỏ đã đổi thành nút slide 1.
- **Làm gì:** `src/components/home/HeroSlider.tsx` bỏ `setInterval`, chuyển slide bằng `onAnimationEnd` của thanh tiến trình (`.slide-fill`, 5.5s trong globals.css).
  - Rê chuột lên khối chữ (tiêu đề, mô tả, nút) hoặc Tab tới nút (`:focus-visible`) thì đặt `animation-play-state: paused`. Thanh đứng lại và slide không đổi; rời ra thì chạy tiếp từ chỗ dừng.
  - Bấm nút bằng chuột thì không tính là dừng, nên bấm mũi tên hay thanh xong slider vẫn tự chạy.
  - `prefers-reduced-motion` tắt animation nên không tự chuyển nữa (trước đây vẫn nhảy, chỉ bỏ hiệu ứng mờ). Mũi tên và thanh vẫn bấm được.
- **File:** `src/components/home/HeroSlider.tsx`, `tests/e2e/home.spec.ts`, `docs/DESIGN.md`, `docs/TESTING.md`, `README.md`.

**Kiểm tra:**
- Trên dev, trình duyệt thật: rê chuột lên nút slide 4, giữ 8 giây thì vẫn slide 4. Bấm thì ra đúng link slide 4. Không rê chuột thì sau 5,5 giây sang slide kế. Bấm mũi tên xong vẫn tự chạy. Tab tới nút đứng 7 giây không đổi, Tab ra thì chạy tiếp.
- `tests/e2e/home.spec.ts` 'rê chuột lên nút slide thì slider dừng…': giữ chuột 7 giây vẫn slide 2, link không đổi; rời chuột thì sang slide khác; quay lại slide 2, giữ chuột 6 giây rồi bấm thì URL đúng link slide 2. Cả file 11/11. Lint, typecheck sạch.

**Lưu ý:**
- Thời gian mỗi slide nằm ở `.slide-fill` trong globals.css, không còn hằng số trong component. Đổi animation đó là đổi nhịp slider. Bỏ thanh tiến trình thì phải có cách tự chuyển khác.
- Test e2e rê chuột lên phần tử ở trang chủ phải tắt `scroll-behavior: smooth` trước (xem TESTING.md).

---

## 26/10/2026 · nhánh `test` (đợt 11)

### Khung chọn "Mối quan hệ" bỏ bản nháp; dán ảnh vào nội dung là chèn luôn

**Bản nháp vẫn chọn được trong "Mối quan hệ"**
- **Vì sao:** khung chọn khi chèn "Mối quan hệ" liệt kê cả sản phẩm, bài viết chưa xuất bản hoặc đã "Ẩn tài liệu". Web không lộ (đợt 8) nhưng chọn được là vô lý.
- **Không làm cách khác được:** Lexical `RelationshipFeature` không có tùy chọn lọc; các lệnh mở khung chọn không được export; `admin.baseFilter` của collection thì áp cả danh sách thường (Quản trị cần thấy bản nháp ở đó) và không biết đang ở khung chọn hay không.
- **Làm gì:** mọi khung chọn tải danh sách qua server function `render-list` kèm `drawerSlug`, còn danh sách thường thì không. `publishedOnlyInDrawers()` (`src/lib/drawerFilter.ts`, mới) thêm `_status = published` vào truy vấn khi `render-list` có `drawerSlug` và là sản phẩm, bài viết, trang tĩnh. Gắn trong `serverFunction` của `src/app/(payload)/layout.tsx`.
- Bản đang bán mà có bản nháp mới chưa xuất bản vẫn hiện (bản chính vẫn published). Danh mục, ảnh không bị ảnh hưởng.

**Dán ảnh bắt bấm Lưu**
- **Vì sao:** dán ảnh vào nội dung thì Payload luôn mở khung "Tệp để tải lên" bắt điền alt rồi bấm Lưu.
- **Làm gì:** tính năng Lexical `PasteImageFeature` (`src/fields/richText.ts`, client ở `src/components/admin/PasteImageFeature.tsx`, gắn cho cả ô bài viết, trang tĩnh lẫn mô tả sản phẩm). Bắt lệnh dán ở mức `COMMAND_PRIORITY_HIGH` (của Payload là LOW). Khi bộ nhớ tạm **chỉ có ảnh** (chụp màn hình, "Sao chép hình ảnh"): tải lên `POST /api/media` với alt `Ảnh trong "<tiêu đề bài>"` (không có tiêu đề thì theo tên tệp), rồi chèn khối ảnh (`type: 'upload'`, version 3) vào chỗ con trỏ. Có thông báo "Đang tải ảnh lên…" → "Đã chèn ảnh" hoặc lỗi.
- Dán nội dung lẫn chữ và ảnh (từ Word, trang web) hay kéo-thả tệp thì vẫn theo cách cũ của Payload.

**File:** `src/lib/drawerFilter.ts` (mới), `src/app/(payload)/layout.tsx`, `src/components/admin/PasteImageFeature.tsx` (mới), `src/fields/richText.ts`, `importMap.js`, `tests/e2e/admin.spec.ts`, `CLAUDE.md`, `docs/TESTING.md`, `README.md`.

**Kiểm tra:**
- `tests/e2e/admin.spec.ts` 'khung chọn "Mối quan hệ" không liệt kê sản phẩm nháp…': tạo sản phẩm nháp qua API; trong khung chọn tìm tên nó thì 0 dòng, tìm tên sản phẩm đã xuất bản thì có.
- 'dán ảnh vào nội dung…': phát sự kiện dán một ảnh PNG; thấy "Đã chèn ảnh", không có khung bulk upload, khối ảnh hiện tên tệp, ảnh trong thư viện có alt `Ảnh trong "Bài thử dán ảnh"`; xong thì xóa ảnh.
- Toàn bộ project admin + editor 43/43 (gồm "Chọn từ thư viện" ảnh vẫn chọn được). Lint, typecheck sạch.

**Lưu ý:**
- `src/app/(payload)/layout.tsx` là file Payload sinh ra; nâng cấp Payload mà bị ghi đè thì gắn lại `publishedOnlyInDrawers`. Test e2e trên sẽ báo nếu quên.
- Alt tự đặt chỉ là tạm; muốn mô tả chuẩn SEO thì sửa ở "Ảnh và tệp".

---

## 26/10/2026 · nhánh `test` (đợt 10)

### "Liên quan": chọn bao nhiêu hiện bấy nhiêu; bản tin ghi vào giai đoạn 2

**Bài viết liên quan chỉ hiện 3**
- **Vì sao:** chọn 6 bài liên quan nhưng web chỉ hiện 3. Ba chỗ lệch nhau: trang gọi `getRelatedPosts(post)` mặc định 3, mô tả ô ghi "tối đa 4", ô không chặn số lượng. Sản phẩm cũng vậy: mô tả "tối đa 4", không chặn, chọn 6 chỉ hiện 4.
- **Làm gì:** `src/lib/related.ts` (mới) khai `RELATED`: bài viết chọn tay tối đa 6 (2 hàng × 3), để trống tự lấy 3; sản phẩm chọn tay tối đa 8 (2 hàng × 4), để trống tự lấy 4. Dùng chung cho `maxRows`, mô tả ô `related` (Posts, Products) và mặc định của `getRelatedPosts`, `getRelatedProducts` (thêm tham số `pickedLimit` cho số chọn tay, `limit` vẫn là số tự lấy). Tách file riêng vì collection import `data.ts` sẽ thành vòng import.
- **Kiểm tra:** `tests/int/data.test.ts` "bài viết liên quan chọn tay…": chọn 6 thì `getRelatedPosts` trả đủ 6 đúng thứ tự; chọn 7 bị từ chối; để trống trả ≤ 3. data.test 32/32. Lint, typecheck sạch.

**Bản tin không tự gửi email khi xuất bản bài**
- Đúng phạm vi gói: SCOPE mục 5 chỉ có "đăng ký bản tin lưu vào admin", chưa từng có phần gửi. Hiện cũng chưa gửi được vì khách chưa có email công ty, SMTP chưa cấu hình.
- Đã ghi vào "Ngoài gói – giai đoạn 2" trong `docs/SCOPE.md`: gửi bản tin (tự động khi xuất bản hoặc bấm gửi) kèm link hủy đăng ký, hoặc nút xuất CSV để gửi qua Mailchimp/Brevo.

**File:** `src/lib/related.ts` (mới), `src/lib/data.ts`, `src/collections/{Posts,Products}.ts`, `src/payload-types.ts`, `tests/int/data.test.ts`, `docs/{SCOPE,DATA-MODEL,TESTING}.md`, `README.md`.

---

## 26/10/2026 · nhánh `test` (đợt 9)

### Chèn "Mối quan hệ": bấm tên sản phẩm trong khung chọn bị chuyển trang thay vì chèn

**Vì sao:** chèn "Mối quan hệ" trong ô soạn thảo, khung chọn hiện danh sách sản phẩm. Bấm tên một sản phẩm thì hiện hộp "Thay đổi chưa được lưu", chọn nút nào cũng không chèn được. Nguyên nhân: ô tên tự làm `DocLinkCell` (12/10, để bấm tên mở trang sửa vì cột "Ảnh" đứng trước) luôn là link thật. Ô mặc định của Payload trong khung chọn thì đổi thành nút gọi `onSelect` (`RenderDefaultCell` + `useListDrawerContext`). Ô tự làm bỏ qua cơ chế đó, nên bấm vào là trình duyệt chuyển sang trang sửa sản phẩm.

**Làm gì:** `DocLinkCell` chuyển thành client component. Trong khung chọn (`useListDrawerContext` có `drawerSlug`, `onSelect`) thì ô tên là nút **chọn** mục; ngoài danh sách thường vẫn là link mở trang sửa (đường dẫn admin lấy từ `useConfig`). CSS `.doc-link-cell--select` cho nút trông như chữ link. Áp cho sản phẩm và danh mục sản phẩm (2 nơi dùng `linkedNameCell`). Ảnh nhỏ trong khung chọn vẫn không mở trình xem ảnh (`AdminImageViewer` đã bỏ qua `.list-drawer`).

**File:** `src/components/admin/DocLinkCell.tsx`, `src/app/(payload)/custom.scss`, `tests/e2e/admin.spec.ts`, `CLAUDE.md`, `docs/TESTING.md`, `README.md`.

**Kiểm tra:** `tests/e2e/admin.spec.ts` 'chèn "Mối quan hệ"…': mở tạo bài viết, gõ `/quan` + Enter, bấm tên sản phẩm đầu trong khung chọn; khung đóng, không hiện "Thay đổi chưa được lưu", vẫn ở `/posts/create`, tên sản phẩm hiện trong ô soạn thảo. Toàn bộ project admin + editor 41/41 (gồm "danh sách sản phẩm hiện dữ liệu", "mở được một sản phẩm để sửa": ô tên ở danh sách thường vẫn là link). products.spec + responsive 30/30. Lint, typecheck sạch.

**Lưu ý:** ô Cell tự làm cho cột tên mà muốn chạy được trong khung chọn thì phải tự xử lý `useListDrawerContext().onSelect`; Payload chỉ làm việc này cho ô mặc định. Gõ chữ có dấu trong test Playwright dễ thành ký tự tổ hợp, nên lọc menu `/` bằng chữ không dấu.

---

## 26/10/2026 · nhánh `test` (đợt 8)

### Kiểm chứng: "Mối quan hệ" trỏ tới bản nháp không lộ ra web

**Vì sao:** mục kiểm thử "Chèn Mối quan hệ… không để lộ nội dung nháp cho khách". Ghi chú 25/10 (đợt 3) còn để "chưa kiểm tra".

**Kết quả:** không cần sửa code. Ô soạn thảo vẫn cho chọn bản nháp (Lexical `RelationshipFeature` không có lọc), nhưng trang đọc nội dung dưới quyền khách (`AS_GUEST`, depth 2), nên bản nháp không được nạp, chỉ còn id. `RichText.tsx` chỉ vẽ thẻ khi đã nạp đủ (`relationshipCard` trả `null` với id), nên khách không thấy thẻ cũng không thấy nội dung nháp. Xuất bản bản đó thì thẻ tự hiện.

**Thẻ hiện gì:** sản phẩm (ảnh đầu, tên, `/san-pham/<slug>`), bài viết (ảnh bìa, tiêu đề, `/bai-viet/<slug>`), trang tĩnh (ảnh bìa, tiêu đề, `/<slug>`), danh mục sản phẩm (ảnh, tên, `/san-pham/danh-muc/<slug>`), danh mục bài viết (tên, `/bai-viet/danh-muc/<slug>`).

**File:** `tests/int/data.test.ts` (test mới: trang có 2 "Mối quan hệ", tới sản phẩm đã xuất bản và sản phẩm nháp; `getPage` trả bản đã xuất bản là object có tên, slug; bản nháp không phải object), `docs/TESTING.md`, `README.md`. data.test 31/31, lint, typecheck sạch.

---

## 26/10/2026 · nhánh `test` (đợt 7)

### Bài viết không hiện tên tài khoản người viết

**Vì sao:** dưới tiêu đề bài hiện "26/10/2026 · Nhân viên" (hoặc "· Quản trị"). Đó là tên tài khoản nội bộ trong admin, không phải tên tác giả: trông thiếu chuyên nghiệp và lộ cách đặt tên tài khoản. Website doanh nghiệp thường chỉ hiện ngày đăng.

**Làm gì:** trang chi tiết bài viết chỉ hiện ngày đăng. `getPost()` bỏ truy vấn phụ vào bảng tài khoản (trước tra riêng tên vì khách không đọc được `users`). Ô `author` vẫn tự gán để biết ai đăng trong admin.

**File:** `src/app/(frontend)/bai-viet/[slug]/page.tsx`, `src/lib/data.ts`, `tests/int/data.test.ts`, `docs/DATA-MODEL.md`.

**Kiểm tra:** `tests/int/data.test.ts` thay test "vẫn hiện tên người viết" bằng "không lộ tài khoản người viết ra web" (`author` chỉ là id); 30/30. Trang "test bài viết" trên dev server không còn chữ "Nhân viên", "Quản trị". Lint, typecheck sạch.

**Lưu ý:** muốn hiện tác giả thật về sau thì nên thêm ô "Tác giả hiển thị" (chữ tự nhập) ở bài viết thay vì dùng tên tài khoản.

---

## 26/10/2026 · nhánh `test` (đợt 6)

### Nội dung bài viết, trang tĩnh, mô tả sản phẩm: giãn hết khung (khách chọn)

**Vì sao:** khách hỏi vì sao phải giữ cột 860px. Lý do là độ dài dòng: 860px ≈ 100 ký tự/dòng, giãn hết ≈ 140 ký tự/dòng ở 1440px và ≈ 190 ở 1920px; khuyến nghị đọc là 50–90, nên bài dài sẽ mỏi mắt hơn. Mình đã trình bày đánh đổi và 3 phương án; khách chọn **giãn hết khung, áp chung bài viết, trang tĩnh, mô tả sản phẩm**. Thay cho cách đặt cột 860px giữa trang ở đợt 5.

**Làm gì:**
- Bài viết: bỏ `max-w-[860px] mx-auto` ở đầu bài và nội dung; nội dung dùng `.prose-wide` như trang tĩnh, mô tả sản phẩm. Đầu bài thẳng mép trái với nội dung.
- `globals.css`: bỏ giới hạn 1100px cho chữ trong `.prose-wide` (để lại ghi chú chỗ đặt nếu muốn giới hạn lại).
- `.prose-lux img`: đổi từ ép rộng 100% sang `max-width: 100%; height: auto`. Khung giờ rộng ~1600px, ép 100% thì ảnh nhỏ (ảnh dán 500px) bị phóng mờ; giờ ảnh hiện cỡ thật, lớn thì vừa khung.
- Video YouTube: khung rộng hơn nên 2 video liền nhau tự xếp 2 cột (lưới `auto-fit` 420px có sẵn).

**File:** `src/app/(frontend)/bai-viet/[slug]/page.tsx`, `src/app/(frontend)/globals.css`, `tests/e2e/products.spec.ts`, `docs/DESIGN.md`.

**Kiểm tra:** lint, typecheck sạch. Chụp trên dev server ở 1920px: bài "test bài viết" và trang "Giới thiệu" có đoạn chữ rộng 1779px, video xếp 2 cột. Test e2e đổi theo: "nội dung bài viết rộng hết khung…" (cột bằng phần nội dung của section, đoạn chữ `max-width: none`, tiêu đề thẳng hàng) và "mô tả chi tiết rộng hết khung như trang tĩnh, kể cả đoạn chữ". E2E chạy bù ngày 26/10 (đợt 9): products.spec + responsive 30/30.

**Lưu ý:** muốn giới hạn lại bề rộng chữ (vd. 1100px) chỉ cần thêm `max-width` cho `.prose-wide .prose-lux > :where(p, h2, h3, h4, ul, ol, blockquote)` trong globals.css.

---

## 26/10/2026 · nhánh `test` (đợt 5)

### Trang chi tiết bài viết: cột đọc đặt giữa trang

**Vì sao:** nội dung bài viết là cột 860px dính lề trái (đầu bài thì cột 1000px, cũng dính trái), màn rộng bỏ trống cả nửa phải, trông lệch một bên.

**Làm gì:** giữ bề rộng đọc 860px (~100 ký tự/dòng, đã đánh giá ở mục 25/10 đợt 2) nhưng đặt giữa trang (`mx-auto`). Đầu bài (breadcrumb, danh mục, tiêu đề, ngày) dùng cùng cột 860px nên tiêu đề, đoạn mở đầu, nội dung, video, bảng thẳng một mép trái. Ảnh bìa nền và "Bài viết liên quan" vẫn rộng hết khung. Thêm class `article-column` cho cột nội dung (test dùng).

**File:** `src/app/(frontend)/bai-viet/[slug]/page.tsx`, `tests/e2e/products.spec.ts`, `docs/{DESIGN,TESTING}.md`, `README.md`.

**Kiểm tra:** `tests/e2e/products.spec.ts` "nội dung bài viết là cột đọc đặt giữa trang…": ở 1440px khoảng trống trái và phải của cột lệch nhau không quá 2px, tiêu đề thẳng hàng với cột. Các test bài viết trên desktop và điện thoại 5/5. Chụp bài "test bài viết" trên dev server ở 1920px: đầu bài và nội dung cân giữa. Lint, typecheck sạch.

---

## 26/10/2026 · nhánh `test` (đợt 4)

### Giới hạn độ dài tiêu đề, tên, nhãn + bộ đếm ký tự trong admin

**Vì sao:** tiêu đề bài viết không giới hạn: một bài thử có tiêu đề 20.700 ký tự phủ kín cả trang chi tiết. Rà lại thì gần như mọi ô tiêu đề, tên, nhãn (sản phẩm, danh mục, trang tĩnh, khối trang chủ, menu, thông tin công ty) đều không giới hạn; chỉ "Tóm tắt" có 300.

**Làm gì:**
- `src/fields/limits.ts` (mới): `limit(field, max)` đặt `maxLength`, gắn bộ đếm ký tự, gắn hook `enforceMaxLength`. `MAX` là bảng mức dùng chung.
- `src/components/admin/CharCountDescription.tsx` (mới): dưới ô hiện dòng mô tả sẵn có (nếu có) và "45/80 ký tự"; vượt thì đỏ, ghi "dài hơn N ký tự".
- Hook `enforceMaxLength` (`beforeChange` của ô): Payload chỉ kiểm `maxLength` khi xuất bản, còn lúc lưu nháp thì bỏ qua mọi `validate`. Đã thử: nháp tên 81 ký tự vẫn lưu được. Hook vẫn chạy khi lưu nháp nên chặn được, báo cùng câu "Giá trị phải ngắn hơn hoặc bằng … ký tự" kèm nhãn ô ("không hợp lệ: Tên sản phẩm").
- Thẻ sản phẩm, thẻ bài viết: tên/tiêu đề tối đa 3 dòng (`line-clamp-3`) để lưới thẻ đều. Trang chi tiết vẫn hiện đủ.

| Ô | Mức |
|---|---|
| Tên sản phẩm | 80 |
| Tiêu đề bài viết | 100 |
| Tiêu đề trang tĩnh | 80 |
| Tên danh mục sản phẩm, bài viết | 50 |
| Tóm tắt sản phẩm, bài viết; đoạn mở đầu trang tĩnh | 300 |
| Vật liệu, giá trị thông số | 120 |
| Tên thông số | 40 |
| Giá | 60 |
| Trang chủ: tiêu đề slide, tiêu đề khối (Giới thiệu, Giải pháp, Ứng dụng, Danh mục, Tin, Liên hệ), tiêu đề tab ứng dụng | 70 |
| Trang chủ: tiêu đề ô bộ sưu tập, ô giải pháp | 50 |
| Trang chủ: chữ trên nút, nhãn nhỏ, tên tab | 30 |
| Trang chủ: câu khẩu hiệu, mô tả ngắn ô giải pháp, ghi chú ô bản tin | 120 |
| Trang chủ: ô nổi bật (tiêu đề / dòng phụ), nhãn điểm chấm | 40 / 60, 40 |
| Trang chủ SEO: tiêu đề / mô tả | 70 / 160 |
| Menu: nhãn mục menu chính | 30 |
| Menu: nhãn liên kết (gợi ý tìm kiếm, chân trang, cột mega menu) | 50 |
| Menu: tiêu đề cột / tiêu đề ô ảnh / mô tả ô ảnh | 40 / 50 / 120 |
| Menu: tên tài liệu / ghi chú | 80 / 30 |
| Thông tin công ty: tên thương hiệu / tên pháp nhân / câu khẩu hiệu | 60 / 120 / 120 |

Đã đo dữ liệu thật trong DB dev trước khi chọn mức: mọi giá trị đều nằm trong mức (dài nhất: tiêu đề SEO trang chủ 70/70, tiêu đề bài mẫu 79/100). Chỉ có bài thử 20.700 ký tự là vượt. Bài đó vẫn hiện như cũ cho tới khi được sửa; lần lưu tới sẽ bị yêu cầu rút ngắn.

**File:** `src/fields/limits.ts` (mới), `src/components/admin/CharCountDescription.tsx` (mới), `src/collections/{Products,Posts,Pages,ProductCategories,PostCategories}.ts`, `src/globals/{Home,Navigation,SiteSettings}.ts`, `src/components/ui/{ProductCard,PostCard}.tsx`, `src/app/(payload)/custom.scss` (khối "Bộ đếm ký tự"), `importMap.js`, `tests/int/collections.test.ts`, `tests/e2e/{admin,products}.spec.ts`, `CLAUDE.md`, `docs/{DATA-MODEL,TESTING}.md`, `README.md`.

**Kiểm tra:**
- `tests/int/collections.test.ts` "giới hạn độ dài…":
  - Tên sản phẩm đúng 80 lưu được, 81 bị từ chối ở ô `name`; lưu nháp 81 cũng bị chặn.
  - Tiêu đề bài viết 101, tên danh mục 51, tên thương hiệu 61 bị từ chối đúng ô.
  - Dữ liệu mẫu đều trong mức.
- `tests/e2e/admin.spec.ts` "ô tên sản phẩm có bộ đếm ký tự…": gõ hiện "4/80 ký tự"; 81 ký tự thì đỏ "dài hơn 1 ký tự"; bấm Lưu bản nháp thì báo "không hợp lệ: Tên sản phẩm", không tạo sản phẩm. Đã chụp nền tối.
- `products.spec.ts` 20/20 (test chữ dài rút tên còn 79 ký tự). unit 68/68, int 132/132, lint, typecheck sạch.

**Lưu ý:**
- Thêm ô chữ khách nhập mới: bọc `limit({...}, MAX.xxx)`. Đổi mức thì sửa `MAX`, nhưng nhớ đo dữ liệu thật trước khi hạ.
- Ô `textarea` mô tả dài (mô tả slide, đoạn văn giới thiệu, mô tả khối) chưa giới hạn vì xuống dòng thoải mái.

---

## 26/10/2026 · nhánh `test` (đợt 3)

### Xóa danh mục đang dùng: trang sản phẩm lỗi 500; giờ không cho xóa

**Vì sao:** Quản trị xóa danh mục "Test" khi sản phẩm "test sản phẩm 234567" (đang xuất bản) còn gắn vào. Postgres để `category_id` thành trống, sản phẩm mất danh mục (ô bắt buộc) mà vẫn đang bán. Mở trang chi tiết thì lỗi 500 `TypeError`: code viết `typeof product.category === 'object' ? product.category.name : …`, mà `typeof null` cũng là `'object'`. Khung lỗi đỏ còn hiện thêm "Encountered a script tag…" ở `layout.tsx`: đó là hệ quả (React dựng lại layout phía trình duyệt khi trang sập), hết sập là hết.

**Làm gì:**
- Đọc dữ liệu an toàn với `null`:
  - `JsonLd.tsx`: đây là chỗ gây lỗi 500.
  - `src/lib/data.ts` thêm `relationId()`. `getRelatedProducts` và `getRelatedPosts` không có danh mục thì trả rỗng thay vì đọc `.id` của null; `getRelatedPosts` cũng bỏ phần tử `null` trong danh sách đã chọn.
- Chặn tận gốc: `src/hooks/categories.ts` → `blockDeleteWhileUsed()` gắn `beforeDelete` cho Danh mục sản phẩm và Danh mục bài viết. Còn sản phẩm / bài viết (kể cả bản nháp) dùng danh mục thì không xóa được, báo: `Không xóa được danh mục "Test": còn 3 sản phẩm đang dùng ("A", "B", "C", … và 2 sản phẩm khác). Chuyển các sản phẩm này sang danh mục khác rồi xóa lại.` Danh mục trống xóa bình thường.

**File:** `src/components/layout/JsonLd.tsx`, `src/lib/data.ts`, `src/hooks/categories.ts` (mới), `src/collections/{ProductCategories,PostCategories}.ts`, `tests/int/collections.test.ts`, `docs/{DATA-MODEL,TESTING}.md`, `README.md`.

**Kiểm tra:**
- Trang `/san-pham/test-san-pham-2` lúc chưa có danh mục: trước sửa trả 500, sau sửa trả 200. Mở bằng trình duyệt không cài tiện ích: không còn huy hiệu "Issue", console sạch.
- `tests/int/collections.test.ts` "xóa danh mục":
  - Danh mục còn một sản phẩm nháp thì từ chối, thông báo nêu đúng tên danh mục, số lượng, tên sản phẩm; danh mục trống thì xóa được.
  - Danh mục bài viết còn bài thì từ chối.
  - `getRelatedProducts` và `getRelatedPosts` với `category = null` trả rỗng, không lỗi.
- unit 68/68, int 128/128, lint, typecheck sạch.

**Lưu ý:**
- Viết tắt kiểu `typeof x === 'object' ? x.id : x` cho ô quan hệ là sai khi ô trống; dùng `relationId()` hoặc kiểm `x && typeof x === 'object'`.
- Dữ liệu dev: sản phẩm này đã được gắn lại danh mục "Tấm đục lỗ"; không còn sản phẩm, bài viết nào thiếu danh mục.

---

## 26/10/2026 · nhánh `test` (đợt 2)

### Ảnh: thẻ sản phẩm hiện ảnh cũ sau khi đổi ảnh; xem phóng to bị cắt mất một phần

**Thẻ hiện ảnh cũ**
- **Vì sao:** đổi ảnh (thay tệp `screen.jpg`, chọn lại vùng ảnh) thì trang chi tiết ra ảnh mới nhưng thẻ ở trang danh mục vẫn ảnh cũ. Tệp trên đĩa đã đúng (`screen-800x600.webp` là ảnh mới), nhưng Payload ghi đè các cỡ ảnh **giữ nguyên tên tệp**, mà `next/image` lưu ảnh đã tối ưu theo đường dẫn (bản chạy thật: `minimumCacheTTL` mặc định 14400 giây = 4 giờ, cả server lẫn trình duyệt; dev: trình duyệt giữ ảnh trong bộ nhớ khi chuyển trang). Chỗ nào đã từng tải đường dẫn đó thì vẫn nhận ảnh cũ.
- **Làm gì:** `mediaUrl()` (`src/lib/media.ts`) gắn `?v=<updatedAt của media, cơ số 36>`. Ảnh đổi thì đường dẫn đổi, mọi bộ đệm lấy bản mới; ảnh không đổi thì giữ nguyên đường dẫn, bộ đệm vẫn dùng được. `images.localPatterns` không khai `search` nên Next nhận query. Áp cho mọi chỗ dùng `mediaUrl` (ảnh, logo, tệp catalogue, ảnh OG, JSON-LD, ô ảnh trong admin).
- **Kiểm tra:** trên dev server, trang danh mục giờ dùng `screen-800x600.webp?v=mvo39zgw`, tải về đúng ảnh mới. Unit `media.test.ts`: đường dẫn đổi khi `updatedAt` đổi, giữ nguyên khi không đổi, thiếu `updatedAt` thì trả đường dẫn trơn.

**Xem phóng to bị cắt**
- **Vì sao:** Lightbox (11/10) dùng cỡ `hero`, lúc đó là "rộng 2400, giữ tỉ lệ". Ngày 13/10 (#5) `hero` đổi thành 2400×1200 cắt 2:1 cho slider, nên ảnh phóng to bị cắt theo khung 2:1 (ảnh gần vuông mất đỉnh và đáy).
- **Làm gì:** thêm cỡ `'original'` (`MediaSize`, `sizedOf()` dùng chung cho `mediaUrl`, `mediaDims`, `Img`): ảnh gốc, không cắt. Lightbox dùng `original`; `next/image` vẫn thu nhỏ theo màn hình nên ảnh gốc lớn không nặng. Chỉ Lightbox dùng nhầm, slider dùng `hero` 2:1 là đúng.
- **Kiểm tra:** `tests/e2e/products.spec.ts` "ảnh phóng to là ảnh gốc đủ khung…": chọn sản phẩm có ảnh đầu không phải 2:1, tỉ lệ tệp ảnh và khung hiện trong Lightbox khớp ảnh gốc (sai số dưới 0,02), đường dẫn không phải `-2400x1200`. Unit: `'original'` luôn trả ảnh gốc kể cả khi có cỡ cắt sẵn. Đã chụp Lightbox trên dev server: ảnh 1080×892 hiện đủ khung.

**File:** `src/lib/media.ts`, `src/components/ui/{Img,Lightbox}.tsx`, `tests/unit/media.test.ts`, `tests/e2e/products.spec.ts`, `docs/{DATA-MODEL,DESIGN,TESTING}.md`, `README.md`.

**Sửa test:** `tests/e2e/products.spec.ts` mượn sản phẩm, bài viết mẫu qua API giờ lọc `_status = published` (bài đầu tiên trong DB test đang là bản nháp thiếu ảnh bìa, tạo bài mới từ nó bị từ chối). Toàn bộ `products.spec.ts` 20/20, unit 68/68, int 125/125, lint, typecheck sạch.

**Lưu ý:** DATA-MODEL trước ghi `hero` "2400 width" (đúng trước 13/10) nên dễ dùng nhầm; đã sửa. Cần ảnh không cắt thì dùng `original` (hoặc `wide` nếu chỉ cần rộng 1600).

---

## 26/10/2026 · nhánh `test`

### Ô liên quan: mục đã chọn rồi bị ẩn không còn chặn lưu; lỗi nêu rõ tên mục

**Vì sao:** sau thay đổi 25/10 (đợt 3), sản phẩm "phong cảnh" đang nằm trong "Sản phẩm liên quan" của sản phẩm khác thì bị "Ẩn tài liệu". Web tự không hiện nó, đúng. Nhưng khi sửa sản phẩm chủ, thêm một sản phẩm khác rồi xuất bản thì bị chặn với câu chung chung "Field này có những lựa chọn không hợp lệ", không biết mục nào sai: Payload áp `filterOptions` (chỉ bản đã xuất bản) lên cả danh sách khi lưu.

**Làm gì:** `validatePublishedRelation()` trong `src/fields/publishedOnly.ts` thay bước kiểm mặc định của Payload cho 3 ô ("Sản phẩm liên quan", "Bài viết liên quan", "4 sản phẩm tiêu biểu" ở Trang chủ):
- Chạy kiểm tra mặc định của Payload (`relationship` từ `payload/shared`: bắt buộc, số dòng, id hợp lệ) nhưng bỏ phần `filterOptions`.
- Mục đã có từ lần lưu trước (`previousValue`) được giữ kể cả khi nay đang ẩn. Web không hiện, xuất bản lại thì hiện lại.
- Mục **mới thêm** mà chưa xuất bản (chỉ còn đường API vì danh sách chọn đã lọc) bị chặn, báo rõ: `"<tên>" chưa xuất bản (bản nháp hoặc đang ẩn) nên không chọn được. Xuất bản trước rồi chọn lại.`
- Chọn chính nó: `Không chọn được chính tài liệu này.` (Trang chủ tắt bước này vì `id` khi đó là của global.)
- Mô tả ô ghi thêm: mục bị ẩn sau khi chọn vẫn nằm trong danh sách nhưng không hiện trên web.

**File:** `src/fields/publishedOnly.ts`, `src/collections/{Products,Posts}.ts`, `src/globals/Home.ts`, `src/payload-types.ts`, `tests/int/collections.test.ts`, `tests/int/data.test.ts`, `docs/{DATA-MODEL,TESTING}.md`, `README.md`.

**Kiểm tra:** `tests/int/collections.test.ts`: đúng kịch bản trên (chọn sản phẩm đang xuất bản → ẩn nó → thêm sản phẩm khác, xuất bản sản phẩm chủ: lưu được, giữ cả hai, `getRelatedProducts` chỉ trả sản phẩm đang xuất bản); thêm mới bản nháp thì lỗi nằm ở ô `related` và nêu đúng tên; chọn chính nó báo rõ. `tests/int/data.test.ts` "bản nháp không lên website": dữ liệu chuẩn bị đổi sang "chọn lúc đang xuất bản rồi ẩn" (không còn tạo được bản nháp trong ô liên quan). unit 65/65, int 125/125, `pnpm lint`, `pnpm typecheck` sạch.

**Lưu ý:** e2e đầy đủ chưa chạy lại được từ 25/10 (đợt 2) vì máy hết RAM khi build (`JavaScript heap out of memory`); các test e2e mới của giá, mô tả rộng đã chạy riêng và qua. Chạy lại `CIRCLE_NODE_TOTAL=4 pnpm test:e2e --workers=1` khi máy rảnh.

---

## 25/10/2026 · nhánh `test` (đợt 3)

### Ô "Sản phẩm liên quan", "Bài viết liên quan", "4 sản phẩm tiêu biểu" không chọn được bản nháp

**Vì sao:** ô "Sản phẩm liên quan" cho chọn cả bản nháp (kể cả bản nháp chưa đặt tên, hiện "Chưa có tiêu đề - ID: 20"). Ngoài web bản nháp không hiện (truy vấn chạy dưới quyền khách) nhưng chọn được trong admin là vô lý, dễ tưởng đã gắn mà web không thấy. "Bài viết liên quan" và "4 sản phẩm tiêu biểu" (tab Ứng dụng ở Trang chủ) cùng lỗi.

**Làm gì:** `src/fields/publishedOnly.ts` (mới):
- `publishedOthers`: chỉ bản đã xuất bản và không phải chính tài liệu đang sửa. Gắn vào `related` của Sản phẩm và Bài viết (trước chỉ loại chính nó).
- `publishedOnly`: chỉ bản đã xuất bản. Gắn vào `products` trong tab Ứng dụng của global Trang chủ (global không có "chính nó"; `id` Payload truyền vào có thể là id của global, lọc theo id sẽ loại nhầm).
- (Đã đổi ngày 26/10, xem mục 26/10) Lúc đầu để Payload tự kiểm `filterOptions` khi lưu: mục chọn từ trước mà sau bị ẩn làm cả tài liệu không lưu được.

**File:** `src/fields/publishedOnly.ts` (mới), `src/collections/{Products,Posts}.ts`, `src/globals/Home.ts`, `tests/int/collections.test.ts`, `docs/{DATA-MODEL,TESTING}.md`.

**Kiểm tra:** `tests/int/collections.test.ts` "ô quan hệ chỉ chọn được bản đã xuất bản": Sản phẩm liên quan lưu được bản đã xuất bản, từ chối bản nháp và chính nó; Bài viết liên quan từ chối bản nháp (lỗi nêu tên ô "…liên quan").

**Lưu ý:**
- Sản phẩm đang có bản nháp mới chưa xuất bản (đã từng xuất bản) vẫn chọn được, vì bản trên web vẫn còn.
- Chưa áp cho khối "Mối quan hệ" và link nội bộ trong ô soạn thảo (Lexical `RelationshipFeature`, `LinkFeature`): web không lộ (kiểm ngày 26/10 đợt 8); từ 26/10 đợt 11 khung chọn cũng không còn liệt kê bản nháp.

---

## 25/10/2026 · nhánh `test` (đợt 2)

### Giá: chỉ có dấu cách không còn hiện ô trắng; thẻ "Sản phẩm liên quan" cập nhật khi sửa sản phẩm khác

**Vì sao:** ô Giá nhập toàn dấu cách rồi xuất bản thì trang chi tiết hiện "Giá" trống trơn (trang chỉ thay chuỗi rỗng bằng "Liên hệ"). Thẻ sản phẩm thì so đúng chữ `Liên hệ`, gõ "liên hệ", "Lien he" hay toàn dấu cách là hiện nguyên chữ đó hoặc trống, thay vì "Xem sản phẩm". Khi kiểm kịch bản "đổi giá thì thẻ danh sách cập nhật" còn lộ thêm: mục "Sản phẩm liên quan" trên trang của sản phẩm khác (trang dựng sẵn) giữ giá, tên cũ, vì sửa sản phẩm chỉ làm mới trang của chính nó.

**Làm gì:**
- `src/lib/price.ts` (mới): `priceText()` trả giá đã gọn khoảng trắng, hoặc `null` khi coi như chưa có giá: trống, toàn khoảng trắng (cả dấu cách không ngắt, ký tự rộng 0 khi dán), "Liên hệ" viết kiểu nào (thường, hoa, không dấu, có dấu chấm). Trang chi tiết thay `null` bằng "Liên hệ" (`CONTACT_PRICE`), `ProductCard` thay bằng "Xem sản phẩm".
- Ô `price`: `beforeValidate` gọn khoảng trắng (`tidyPrice`), toàn dấu cách thì lưu thành trống. Mô tả ô ghi rõ nhập tự do kèm ví dụ.
- Sửa sản phẩm thì làm mới thêm mọi trang chi tiết sản phẩm (`revalidatePath('/(frontend)/san-pham/[slug]', 'page')`, trang dựng lại khi có người mở). Hàm `revalidatePath` trong `src/hooks/revalidate.ts` tự thêm type `'page'` cho đường dẫn dạng mẫu.
- Trang `/san-pham`, trang danh mục đọc `?page=` nên luôn dựng mới; trang tìm kiếm cũng vậy. Không cần làm mới.

**Trả lời "giá nhập tự do hay chỉ số?":** giữ nhập tự do. Gia công kim loại thường báo theo đơn vị hoặc khoảng ("Từ 350.000đ/m²", "45.000đ/kg", "1.200.000đ/bộ"); chỉ cho số sẽ mất đơn vị. Web hiện đúng chữ đã nhập.

**File:** `src/lib/price.ts` (mới), `src/collections/Products.ts`, `src/hooks/revalidate.ts`, `src/components/ui/ProductCard.tsx`, `src/app/(frontend)/san-pham/[slug]/page.tsx`, `src/payload-types.ts`, `tests/unit/price.test.ts` (mới), `tests/e2e/products.spec.ts`, `docs/{DATA-MODEL,TESTING}.md`, `README.md`.

**Kiểm tra:** `tests/unit/price.test.ts` (5 test). `tests/e2e/products.spec.ts` "Giá sản phẩm": tạo sản phẩm (giá mặc định "Liên hệ"), đổi giá qua API lần lượt `1.250.000đ/m²` → toàn dấu cách (API trả `''`) → `liên hệ` → trống; mỗi lần kiểm ô Giá ở trang chi tiết và thẻ của sản phẩm ở `/san-pham`, trang danh mục, trang tìm kiếm, mục "Sản phẩm liên quan" của một sản phẩm mẫu cùng danh mục.

**Lưu ý:**
- Làm mới theo mẫu phải ghi đúng đường thư mục route, **kể cả nhóm** `(frontend)`. Ghi `/san-pham/[slug]` thì Next lặng lẽ bỏ qua (đã thử: test hỏng, log vẫn báo "Làm mới cache"). Đường dẫn cụ thể (`/san-pham/abc`) thì không ghi nhóm.
- Cùng kiểu thiếu sót, chưa sửa: sửa bài viết không làm mới mục "Bài viết liên quan" ở bài khác; đổi tên danh mục không làm mới tên danh mục trên trang chi tiết sản phẩm, bài viết. Sửa cùng cách nếu cần.
- JSON-LD `Offer` vẫn không có `price` (giá chữ tự do không chuyển chắc chắn thành số).

### Mô tả chi tiết sản phẩm rộng hết khung như trang tĩnh; bài viết giữ 860px

**Vì sao:** khối "Mô tả chi tiết" bị giới hạn 860px, màn rộng bỏ trống nửa phải.

**Làm gì:** mô tả sản phẩm dùng `.prose-wide` như trang tĩnh: khung rộng hết (lưới video lấp đầy), riêng đoạn chữ, tiêu đề, bảng, ảnh tối đa 1100px.

**Bài viết: đã xem xét, giữ 860px.** 860px có từ commit dựng giao diện đầu tiên (08/10, áp chung cho mô tả sản phẩm, bài viết, trang tĩnh); 17/10 (#6) đồng nghiệp đổi riêng trang tĩnh sang `.prose-wide` và ghi rõ "bài viết giữ 860px". Đo bằng đúng font, cỡ chữ của bài (Be Vietnam Pro 300, 17px): 860px ≈ 100 ký tự/dòng, 1100px ≈ 120–130. Khuyến nghị cho chữ dễ đọc là 45–75, tối đa khoảng 80–90 ký tự/dòng; bài viết dài nên giữ cột đọc. Cột bài viết cũng thẳng hàng trái với tiêu đề, breadcrumb ở ảnh bìa phía trên. Muốn lấp khoảng trống bên phải thì làm cột phụ (mục lục, bài liên quan), là tính năng mới, ghi giai đoạn 2.

**File:** `src/app/(frontend)/san-pham/[slug]/page.tsx`, `tests/e2e/products.spec.ts`, `docs/DESIGN.md`.

**Kiểm tra:** `tests/e2e/products.spec.ts` "mô tả chi tiết rộng hết khung…": tạo sản phẩm có mô tả (dữ liệu mẫu chưa có), ở 1440px khung mô tả rộng bằng phần nội dung của trang, đoạn chữ `max-width: 1100px`.

---

## 25/10/2026 · nhánh `test`

### Tóm tắt (và tên) là chuỗi liền dài không còn làm tràn trang

**Vì sao:** sản phẩm có Tóm tắt là chuỗi liền không khoảng trắng (`testtest…`, 300 ký tự) thì ở trang chi tiết đoạn tóm tắt chạy thẳng ra ngoài cột, cả trang cuộn ngang (đo được tràn 2004px ở 1440px); trên thẻ sản phẩm thì bị cắt cụt ở mép. Bài viết (ô Tóm tắt `excerpt`) và tên, tiêu đề dài liền cũng cùng lỗi.

**Làm gì:** cho phép ngắt giữa chữ (`overflow-wrap: anywhere`) ở mọi chỗ hiện chữ khách nhập. Chỉ ngắt khi một chuỗi dài hơn cả dòng; chữ bình thường vẫn xuống dòng ở khoảng trắng như cũ.
- `globals.css`: thêm vào `.h-serif` (tên sản phẩm, tiêu đề, tên danh mục trên ảnh, mega menu), `.label-sm` (nhãn danh mục), `.lead` (tóm tắt ở trang chi tiết sản phẩm, bài viết, đoạn giới thiệu đầu trang); `.prose-lux > p, ul, ol, h2–h4, blockquote` (link, chuỗi dài trong nội dung; không áp cho bảng).
- Utility `wrap-anywhere` (Tailwind 4.1+): tóm tắt trên `ProductCard` (giờ xuống 2 dòng rồi "…"), tiêu đề `PostCard`, tiêu đề trang chi tiết bài viết, bảng giá/vật liệu/thông số ở chi tiết sản phẩm, `Breadcrumb` (thêm `min-w-0`), tên sản phẩm ở khối Ứng dụng trang chủ (thêm `min-w-0`), mô tả trong `ImageCard`.

**File:** `src/app/(frontend)/globals.css`, `src/components/ui/{ProductCard,PostCard,Breadcrumb,ImageCard}.tsx`, `src/components/home/Applications.tsx`, `src/app/(frontend)/san-pham/[slug]/page.tsx`, `src/app/(frontend)/bai-viet/[slug]/page.tsx`, `tests/e2e/products.spec.ts`, `docs/{DESIGN,TESTING}.md`, `README.md`.

**Kiểm tra:** `tests/e2e/products.spec.ts` "Chữ khách nhập rất dài": tạo sản phẩm và bài viết có tóm tắt 300 ký tự liền, tên/tiêu đề ~95 ký tự liền (qua API, tài khoản Quản trị, xóa sau khi xong); ở 1440px và 390px: trang chi tiết sản phẩm, bài viết, trang tìm kiếm không tràn ngang, tóm tắt trên thẻ không bị cắt ngang. Đối chứng: tắt `overflow-wrap` thì trang tràn lại 2004px. Đã chụp màn hình trang chi tiết và thẻ sau khi sửa. Toàn bộ e2e 106/106, `pnpm lint`, `pnpm typecheck` sạch.

**Lưu ý:** thêm chỗ hiện chữ khách nhập mới (nhất là trong flex/grid) thì gắn `wrap-anywhere` (và `min-w-0` nếu là phần tử con của flex), hoặc dùng các class trên. Không áp chung cho cả trang để tránh nhãn menu, nút bị ngắt giữa chữ khi chật.

---

## 24/10/2026 · nhánh `test`

### Ô slug hiện cả đường dẫn, tiền tố khóa, nút chép

**Vì sao:** ô "Đường dẫn (slug)" chỉ có phần cuối (`hn2`). Chép nó sang ô "Đường dẫn" của "Menu và mega menu" thì thiếu `/san-pham/danh-muc/`, link trên menu bị sai.

**Làm gì:**
- Ô slug của sản phẩm, danh mục sản phẩm, bài viết, danh mục bài viết, trang tĩnh hiện cả đường dẫn trên website: tiền tố màu xám, không sửa được (`/san-pham/`, `/san-pham/danh-muc/`, `/bai-viet/`, `/bai-viet/danh-muc/`, `/`) + slug màu thường, sửa được. Hai phần nằm chung một khung, bôi đen một lượt chép được cả đường dẫn.
- Nút chép ở cuối ô: chép đường dẫn không kèm tên miền (vd. `/san-pham/danh-muc/hn2`), đã chuẩn hóa như khi lưu (bỏ dấu, khoảng trắng thành gạch), báo "Đã chép đường dẫn …". Ô trống thì nút mờ.
- Tiền tố được giữ: bấm vào tiền tố thì con trỏ nhảy về đầu slug; Backspace ở đầu slug không xóa được; gõ, xóa, dán, cắt khi vùng bôi đen lấn vào tiền tố chỉ tác động phần slug; dán cả URL (`https://…/san-pham/danh-muc/abc` hay `/san-pham/danh-muc/abc`) chỉ giữ `abc`; Enter không xuống dòng.
- Ô trống thì hiện chữ nghiêng mờ gợi ý slug sẽ tự tạo từ tên/tiêu đề.
- Mỗi collection khai báo một hằng `URL_PREFIX`, dùng chung cho hàm làm mới cache (`paths`) và ô slug, để hai chỗ không lệch nhau.

**Cách làm:** `src/components/admin/SlugField.tsx`, gắn qua tùy chọn mới `urlPrefix` của `slugField()` (`src/fields/slug.ts`, `admin.components.Field` + `clientProps`). Cả đường dẫn nằm trong một `<textarea>` thật có chữ trong suốt; lớp `__mirror` nằm dưới, cùng font và lề, vẽ màu (tiền tố xám, slug thường). Thử `contentEditable` trước nhưng Chrome không cho bôi đen nối từ chữ thường sang vùng sửa được, nên bỏ. Giá trị lưu vẫn chỉ là slug, không đổi dữ liệu.

**File:** `src/components/admin/SlugField.tsx` (mới), `src/fields/slug.ts`, `src/collections/{Products,ProductCategories,Posts,PostCategories,Pages}.ts`, `src/app/(payload)/custom.scss` (khối "Ô slug"), `importMap.js`, `tests/e2e/admin.spec.ts`, `CLAUDE.md`, `docs/{DATA-MODEL,TESTING}.md`, `README.md`.

**Kiểm tra:** `tests/e2e/admin.spec.ts` nhóm "Ô đường dẫn (slug) trong trang sửa" (3 test, e2e giờ 105): đúng tiền tố từng loại, tiền tố màu khác slug; kéo chuột bôi đen ra cả đường dẫn, Ctrl+C và nút chép cho `/san-pham/danh-muc/<slug>`; bấm tiền tố, Home + Backspace, gõ, dán cả URL, Ctrl+A rồi Ctrl+X đều không đụng tiền tố. Đã chụp màn hình nền tối: slug ngắn, slug dài xuống dòng ở dấu gạch, đang bôi đen, ô trống có gợi ý.

**Lưu ý:**
- `__mirror` và `__input` trong custom.scss phải giữ y hệt font, cỡ chữ, lề, cách xuống dòng; lệch một chút là con trỏ và vùng bôi đen không khớp chữ.
- Slug dài xuống dòng: phím End về cuối dòng đang đứng như mọi ô nhiều dòng, Ctrl+End về cuối chữ.
- Thêm collection có slug mới: truyền `urlPrefix` đúng route trong `src/app/(frontend)`.
- Dev server đang chạy từ trước phải khởi động lại `pnpm dev` mới thấy ô mới (cấu hình collection không tự nạp lại).
- Không đổi schema database.

---

## 20/10/2026 · quyền Nhân viên sửa báo giá và xuất bản

**Làm gì:** Nhân viên sửa được họ tên, điện thoại, email, công ty, nội dung, trạng thái và thay tệp trong chi tiết yêu cầu báo giá. Quản trị và Nhân viên có thể tải tệp bản vẽ mới trong trang quản trị; tệp cũ không bị chỉnh sửa hay xóa. Hai ô hệ thống `source`, `ip` vẫn khóa. Nhân viên được chọn lưu nháp hoặc xuất bản sản phẩm, bài viết, trang tĩnh; có thể khôi phục phiên bản đã xuất bản để xuất bản lại. Bỏ thông báo và CSS chỉ dành cho chính sách cũ.

**Vì sao:** theo yêu cầu cập nhật quyền của vai trò Nhân viên.

**File:** `src/access/index.ts`, `src/collections/{Products,Posts,Pages,QuoteRequests,QuoteFiles,Users}.ts`, `src/hooks/versions.ts`, `src/app/(payload)/custom.scss`, import map, test quyền và giao diện, `CLAUDE.md`, `docs/{DATA-MODEL,TESTING}.md`.

**Kiểm tra:** `pnpm lint`, `pnpm typecheck`, kiểm thử `tests/int/editor.test.ts` và `tests/e2e/editor.spec.ts`. Nhân viên vẫn không được xóa, không sửa `source`/`ip` hay nội dung tệp đã tải lên.

**Lưu ý:** ô tệp đính kèm dùng lại upload field mặc định của Payload để cho phép chọn/tải tệp mới. Collection `quote-files` không hiện trên menu và chỉ Quản trị được xóa. Không đổi schema cơ sở dữ liệu.

---

## 20/10/2026 · nhánh `test`

### Ghi lại tài khoản Nhân viên để thử quyền

**Làm gì:** ghi tài khoản `nhanvien@thanhvinhmetal.vn` / `NhanVien@2026` (vai trò editor) vào `CLAUDE.md` (mục Chạy local) và `README.md` (cạnh tài khoản mẫu), kèm tài khoản E2E `editor.e2e@thanhvinhmetal.vn` / `Editor@2026`.

**Vì sao:** tài khoản tạo tay trong DB dev ngày 17/10 để thử chính sách Nhân viên, chưa ghi ở đâu nên khó dùng lại.

**Kiểm tra:** đăng nhập thử bằng Local API `payload.login` → được, vai trò `editor`.

**Lưu ý:** seed không tạo tài khoản này; `SEED_RESET=1 pnpm seed` không xóa bảng `users` nên tài khoản vẫn còn. DB mới (máy khác, `docker compose down -v`) thì tạo lại ở Tài khoản → Tạo mới. Không tạo tài khoản mật khẩu mẫu này trên bản thật.

---

## 18/10/2026 · nhánh `test` (đợt 2)

### Nhân viên thêm, sửa được danh mục; vẫn không xóa

**Vì sao:** khách muốn Nhân viên tự quản lý danh mục sản phẩm, danh mục bài viết (thêm, sửa) nhưng không được xóa. Chính sách 17/10 để danh mục chỉ Quản trị.

**Làm gì:**
- `ProductCategories`, `PostCategories`: `create`, `update` đổi từ `isAdmin` sang `isAdminOrEditor`; `delete` giữ `isAdmin`. Payload tự ẩn nút "Xóa" (trong menu "..." ở trang sửa và nút xóa hàng loạt ở danh sách) khi không có quyền xóa.
- Mô tả vai trò ở trang Tài khoản cập nhật theo.
- Rà lại quyền xóa toàn bộ: mọi collection (sản phẩm, bài viết, trang tĩnh, danh mục, ảnh, yêu cầu báo giá, tệp bản vẽ, đăng ký bản tin, tài khoản) đều `delete: isAdmin`, nên Nhân viên không xóa được gì. Không đổi.

**File:** `src/collections/ProductCategories.ts`, `PostCategories.ts`, `Users.ts`, `src/payload-types.ts`, `tests/int/editor.test.ts`, `tests/e2e/editor.spec.ts`, `CLAUDE.md`, `docs/DATA-MODEL.md`, `docs/TESTING.md`, `README.md`.

**Kiểm tra:** `tests/int/editor.test.ts`: test "danh mục chỉ Quản trị" thay bằng 2 test: Nhân viên thêm, sửa được cả hai loại danh mục; Nhân viên xóa bị từ chối, Quản trị xóa được (int 117 → 118). `tests/e2e/editor.spec.ts`: danh sách danh mục có nút Tạo mới, chọn dòng không có nút Xóa; trang sửa ô tên sửa được, menu "..." có "Tạo mới" nhưng không có "Xóa".

**Lưu ý:**
- Danh mục không có nháp: Nhân viên lưu là đổi ngay trên web (menu, trang chủ, đường dẫn `/san-pham/danh-muc/...`). Đổi tên danh mục thì slug đã có giữ nguyên (`src/fields/slug.ts`), link cũ vẫn chạy; nhưng Nhân viên sửa tay ô slug thì link đổi theo.
- Sản phẩm, bài viết, trang tĩnh giữ chính sách chỉ lưu nháp như 17/10.
- Không đổi schema database.

---

## 18/10/2026 · nhánh `test`

### Gộp `main` (#4, #5, #6) vào `test`, gỡ conflict

**Vì sao:** kéo `main` về `test` thì conflict 9 file (`CLAUDE.md`, `CHANGELOG.md`, `DATA-MODEL.md`, `DESIGN.md`, `custom.scss`, `QuoteRequests.ts`, `QuoteForm.tsx`, `data.ts`, `payload-types.ts`). Phần việc 17/10 (phân quyền Nhân viên) chưa commit nên đã được cất vào stash trước khi kéo.

**Cách gỡ:**
- Commit `2ca3fa9` của `test` giống hệt `428c8b4` (#4) trên `main`, tức mọi thứ phía `test` đã có trong `main`; `main` sửa tiếp các dòng đó ở #5, #6. Nên mọi conflict lấy bản của `main`. Kết quả gộp (đã `git add`) trùng từng byte với `main`. Riêng `payload-types.ts` git tự gộp còn sót chú thích cũ của ô `ip`, đã bỏ.
- Stash = bản chưa commit của #5 (đã có trong `main`) + phần việc 17/10. Không `stash pop` thẳng vì sẽ khôi phục file cũ đã bị #6 bỏ (`SliderCropField.tsx`). Chỉ lấy phần chênh giữa stash và `606bd82` (#5), tức đúng phần việc 17/10, áp lại vào thư mục làm việc (chưa `git add`). `custom.scss` (#6 thêm khối ẩn "Kích cỡ xem trước" cùng chỗ) gắn tay khối CSS Nhân viên vào cuối file; `importMap.js` chạy lại `pnpm generate:importmap`.
- `DATA-MODEL.md`: bỏ dòng "Truy vấn cho giao diện" bị lặp (bản cũ không có ghi chú `AS_GUEST`). Code `data.ts` của `main` vẫn đủ `AS_GUEST`.
- Phần việc 17/10 vẫn chạy với tính năng mới của `main`: khung chọn vùng ảnh `ImageFrameField` gọi `PATCH /api/media/:id` và `/api/media/:id/hero-crop`, cả hai cho Quản trị và Nhân viên; Trang chủ Nhân viên vẫn sửa được.

**Sửa test:** `tests/int/api.test.ts` 3 test tìm kiếm lấy "bản ghi đầu tiên" với quyền root rồi tìm như khách; database test còn bản nháp do file test khác để lại (`restore`, `data`, `editor` chỉ dọn ở `beforeAll`), nên tùy thứ tự chạy file mà lấy trúng bản nháp và hỏng. Giờ chỉ lấy bản đã xuất bản.

**Kiểm tra:** `pnpm lint`, `pnpm typecheck` sạch; unit 60/60, int 117/117; e2e chạy lại toàn bộ.

**Lưu ý:**
- Merge chưa commit: `git commit` sẽ chỉ ghi phần gộp `main` (đã stage); phần việc 17/10 vẫn là thay đổi chưa stage như trước khi kéo.
- `stash@{0}` không cần nữa (nội dung đã có trong `main` + thư mục làm việc). Đừng `stash pop` vì sẽ khôi phục `SliderCropField.tsx`; xóa bằng `git stash drop` khi đã yên tâm.
- Schema đổi theo `main` (Media `heroCrop`, `focalX/Y`, cỡ `og`, global `visitor-stats`): database dev máy này đã có sẵn; máy khác, VPS cần `pnpm dev` một lần hoặc migration (KNOWN-ISSUES #4).

---

## 17/10/2026 · nhánh `test`

### Siết phân quyền vai trò Nhân viên (editor)

**Vì sao:** yêu cầu quản lý thêm, sửa, xóa của Nhân viên cho chặt. Rà lại thì thấy:
- Nhân viên tự xuất bản được; gọi API sửa không kèm `_status` còn ghi thẳng vào bản đang hiện trên web, gửi `_status: 'draft'` thì gỡ được bài khỏi web.
- Nhân viên sửa được cả thông tin khách gửi trong yêu cầu báo giá. "Gửi từ trang", "IP" tuy ẩn khỏi form nhưng vẫn sửa được qua API.
- Nhân viên thêm, sửa được danh mục.
- Menu trái vẫn hiện "Menu và mega menu", "Thông tin công ty", "Thống kê truy cập", "Tài khoản" cho Nhân viên (mở ra chỉ xem, không lưu được).

**Chính sách đã chốt với khách:**

| | Quản trị | Nhân viên |
|---|---|---|
| Sản phẩm, bài viết, trang tĩnh | toàn quyền | thêm, sửa **chỉ dưới dạng nháp**; không xuất bản, không gỡ khỏi web, không xóa |
| Danh mục sản phẩm, danh mục bài viết | toàn quyền | chỉ xem (chọn khi đăng bài) |
| Ảnh và tệp | toàn quyền | tải lên, sửa; không xóa |
| Trang chủ | sửa | sửa |
| Yêu cầu báo giá | toàn quyền (IP, "Gửi từ trang" thì không ai sửa) | xem, **chỉ đổi trạng thái**; không xóa |
| Đăng ký bản tin | toàn quyền | chỉ xem |
| Menu, Thông tin công ty, Thống kê truy cập | sửa | ẩn khỏi menu trái |
| Tài khoản | toàn quyền | chỉ tài khoản của mình (đổi tên, mật khẩu ở "Tài khoản của tôi"); danh sách tài khoản ẩn |

**Cách làm:**
- `src/access/index.ts`: `adminOrEditorDraft` cho `create`/`update` của Sản phẩm, Bài viết, Trang tĩnh. Payload tính quyền sửa với `_status: 'draft'` và quyền xuất bản với `_status: 'published'`, nên nút "Xuất bản tài liệu" tự ẩn với Nhân viên mà form vẫn sửa được. Thêm `hiddenFromEditors` (ẩn Menu, Thông tin công ty, Thống kê truy cập, Tài khoản khỏi Nhân viên), `isAdminUser`, `isEditorUser`.
- `src/hooks/drafts.ts` → `editorDraftsOnly` (`beforeOperation`): ép mọi lần tạo, sửa của Nhân viên thành lưu nháp (`draft: true`, `_status: 'draft'`), nên bản trên web không đổi. Cố ý gửi `published` thì báo "Nhân viên chỉ lưu được bản nháp. Quản trị sẽ duyệt và xuất bản.". Khôi phục phiên bản của Nhân viên chỉ được dưới dạng nháp (`restoreVersionEndpoint` tự ép; đường khác bị chặn).
- Danh mục sản phẩm, danh mục bài viết: `create`/`update` chỉ Quản trị.
- Yêu cầu báo giá: thông tin khách (tên, SĐT, email, công ty, nội dung, tệp bản vẽ) `access.update` chỉ Quản trị (Nhân viên thấy ô bị khóa); "Gửi từ trang", "IP" không ai sửa (chỉ route `/api/quote` ghi khi khách gửi).
- Giao diện: cạnh nút Lưu của Sản phẩm, Bài viết, Trang tĩnh hiện nhãn "Chỉ lưu nháp, chờ Quản trị duyệt" cho Nhân viên (`EditorDraftNotice`). Menu trái đặt `data-role` trên `<html>`; `custom.scss` ẩn nút "Xuất bản", "Ẩn tài liệu" hàng loạt ở danh sách với Nhân viên (Payload chỉ xét quyền sửa chung nên vẫn hiện; server sẽ từ chối).
- Mô tả vai trò ở trang Tài khoản cập nhật theo chính sách mới.

**File:** `src/access/index.ts`, `src/hooks/drafts.ts` (mới), `src/hooks/versions.ts`, `src/collections/Products.ts`, `Posts.ts`, `Pages.ts`, `ProductCategories.ts`, `PostCategories.ts`, `QuoteRequests.ts`, `Users.ts`, `src/globals/Navigation.ts`, `SiteSettings.ts`, `VisitorStats.ts`, `src/components/admin/EditorDraftNotice.tsx` (mới), `Nav/NavClient.tsx`, `src/app/(payload)/custom.scss`, `importMap.js`.

**Lưu ý:**
- Quản trị duyệt: mở sản phẩm, bài viết có trạng thái "Bản nháp" hoặc "Đã thay đổi" rồi bấm "Xuất bản tài liệu". Chưa có ô "chờ duyệt" trên bảng điều khiển.
- Thêm collection có nháp mới: dùng `adminOrEditorDraft` cho create/update và gắn `editorDraftsOnly` vào `beforeOperation`.
- Không đổi schema database.

**Kiểm tra:** `tests/int/editor.test.ts` (15 test ở tầng API: không xuất bản khi tạo, khi sửa; sửa bản đang bán chỉ thành nháp; không gỡ được khỏi web; khôi phục luôn dưới dạng nháp; danh mục chỉ Quản trị; yêu cầu báo giá chỉ đổi trạng thái, IP không ai sửa; trang chủ sửa được; menu, thống kê không sửa được; không xóa). `tests/int/access.test.ts`: test cũ cho Nhân viên tạo sản phẩm đã xuất bản đổi thành tạo nháp. e2e: project mới `setup-editor` (tạo tài khoản `editor.e2e@thanhvinhmetal.vn` nếu chưa có, đăng nhập) và `editor` (`tests/e2e/editor.spec.ts`, 6 test giao diện).

---

## 13–14/10/2026 · nhánh `dev`

### Admin: khung cắt 2:1 cho ảnh slider, ô SEO do plugin quản lý, ẩn ô kỹ thuật ở yêu cầu báo giá

**Vì sao:** ảnh slide tải lên tỉ lệ bất kỳ bị slider cắt không kiểm soát; nút "Tự động tạo" ở tab SEO trả 403 vì plugin SEO chỉ cấp quyền cho collection khai báo trong `collections`, mà ô SEO được thêm tay; hai ô "Gửi từ trang" và "IP" gây thắc mắc cho nhân viên.

**Cách làm:**
- `ImageFrameField` (thay `SliderCropField`): một component khung kéo dùng chung, `clientProps.mode` = `hero` (slide, cắt cứng 2:1) hoặc `focal` (Bộ sưu tập, Giới thiệu, Giải pháp, Ứng dụng: lưu tâm khung làm điểm lấy nét qua `PATCH /api/media/:id`, vì khung các khối này đổi tỉ lệ theo màn hình nên không cắt cứng).
- Media: cỡ `hero` cắt sẵn 2400×1200 và `og` 1200×630 quanh điểm lấy nét, cho phép phóng to ảnh nhỏ (`withoutEnlargement: false`). `SliderCropField` (field ui trong mỗi slide của global Home, đọc ảnh cùng hàng) kéo khung 2:1 bằng `react-image-crop`, gọi `POST /api/media/:id/hero-crop` → `src/lib/heroCrop.ts` (sharp) ghi file hero **tên mới mỗi lần** (tránh cache trình duyệt/Next/Nginx), xóa file cũ, lưu `heroCrop` + `focalX/Y`. Thư mục ảnh dùng chung `src/lib/mediaDir.ts`.
- `Img`: `object-position` theo điểm lấy nét chỉ cho cỡ chưa cắt (`wide`, gốc); cỡ đã cắt quanh điểm đó thì giữ 50%/50%.
- Slider desktop cao `min(50vw, 90svh ÷ --zoom)`, min 560px; `--zoom` vì html phóng 110%.
- SEO: `seoPlugin({ collections: ['products','posts','pages'], uploadsCollection: 'media' })`, bỏ `src/fields/seo.ts` và tab SEO thủ công; plugin tự chèn nhóm `meta` (cùng cột database, không mất dữ liệu). `generateTitle` đọc tên thương hiệu từ site-settings.
- Tiêu đề tab và `og:site_name` lấy từ ô "Tên thương hiệu" (`getBrand()` trong `src/lib/metadata.ts`, `buildMetadata` thành async, trả `title.absolute` để layout không nối tên lần hai). Trang chủ dùng nguyên văn "Tiêu đề trang chủ" nếu có. Ba trang có `metadata` tĩnh chuyển sang `generateMetadata`.
- Quote-requests: ẩn `source` và `ip` (`admin.hidden`), vẫn lưu. `QuoteForm` ghi trang sản phẩm xuất phát qua tham số `from` (trang sản phẩm gửi kèm), không có thì ghi đường dẫn + `?sp=`.
- Nội dung rich text: nút "Mối quan hệ" render thành thẻ liên kết (`RichText.tsx`), trước đó in "unknown node"; giới hạn Relationship/Upload tới collection công khai. `getPage` depth 2 để có ảnh của bản ghi được chèn.
- Video YouTube trong nội dung: từ 2 khối video đứng liền nhau (không có chữ xen giữa) được `groupYouTube()` trong `RichText.tsx` gom thành khối `youtubeGrid` lưới `auto-fit` (mỗi ô tối thiểu 420px, tự lấp hết chiều rộng); một video đứng riêng vẫn toàn chiều rộng. Trang tĩnh bỏ giới hạn cột (`.prose-wide`): lưới video rộng hết khung, riêng chữ/tiêu đề/bảng giữ tối đa 1100px; bài viết giữ 860px.

### Giao diện: footer có bản đồ, bộ đếm truy cập, nút chia sẻ, màn chào trang chủ, logo ngang

- Footer 3 cột: thông tin liên hệ, link chính sách, Google Maps nhỏ 300×200 `loading="lazy"`; bản đồ bỏ khỏi thân trang Liên hệ (`ContactSection` còn prop `showMap`, mặc định tắt).
- Bộ đếm truy cập: global `visitor-stats`, `POST /api/visit` (cookie `tv_day` chống trùng trong ngày, `tv_id` + Map bộ nhớ cho "đang online" 5 phút, bỏ bot, rate limit 30/phút/IP, tự tạo dòng khi database mới), `VisitorCounter` ở footer luôn mount để vẫn đếm khi ẩn; số đọc qua `getVisitorStats()` trong data.ts.
- `ShareBar` ở trang sản phẩm và bài viết: Facebook (popup), Web Share (Zalo, Messenger trên điện thoại), sao chép link. Thẻ OG đã có sẵn; tạo lại cỡ `og` cho 9 ảnh mẫu.
- `IntroSplash` ở trang chủ: nền tối, logo + vạch accent + tên thương hiệu 1,5 giây rồi tan; hiệu ứng và đồng hồ chỉ bắt đầu khi logo đã tải (tải lại trang không bị "nhanh quá"); hiện mỗi lần mở trang chủ; tắt khi `prefers-reduced-motion`.
- Logo: header/footer/thẻ liên hệ cao cố định, rộng theo tỉ lệ (logo tròn hay ngang đều đúng). Ba bản logo ngang "VINH METAL" ở `public/logo-ngang-*.png` và `docs/design/images/`.
- `next.config.ts`: rewrite `afterFiles` `/media/:path*` → `/api/media/file/:path*` để ảnh tải lên sau khi build vẫn phục vụ được khi chạy `pnpm start` (trên VPS Nginx phục vụ `/media/` trước).
- Mega menu desktop: "Đoạn giới thiệu" trước chỉ hiện ở kiểu bố cục 2 thẻ ảnh (và menu điện thoại); giờ hiện ở cả kiểu cột liên kết (Sản phẩm) và kiểu tải tài liệu (Catalogue), phía trên nội dung (`HeaderClient.tsx`).
- Menu: bỏ mục "Năng lực" (trùng "Về Vinh Metal"); thử tăng cỡ chữ menu rồi hoàn lại theo yêu cầu.

### Sửa lỗi

- Bản nháp lọt ra website: truy vấn giao diện thiếu `overrideAccess: false` (upstream đã thêm `AS_GUEST`, gộp lại).
- Hook làm mới cache ném lỗi khi chạy ngoài Next (seed, `payload run`): bọc `revalidatePath` trong try/catch (`src/hooks/revalidate.ts`). Media chỉ làm mới cache khi `update`.
- Sản phẩm liên quan: chọn gì hiện nấy, để trống mới tự lấy cùng danh mục (trước bù thêm cho đủ 4).
- Endpoint cắt ảnh dùng `isAdminOrEditor` thay vì so chuỗi role.
- Ẩn nút "Kích cỡ xem trước" ở trang ảnh (`.file-field__previewSizes` trong custom.scss): các cỡ ảnh tự tạo là chuyện kỹ thuật, nhân viên thấy ảnh bị cắt lại thắc mắc. Payload không có tùy chọn tắt nên ẩn bằng CSS.

**File chính:** `src/collections/Media.ts`, `QuoteRequests.ts`, `src/globals/Home.ts`, `VisitorStats.ts` (mới), `src/lib/{heroCrop,mediaDir,visitors,metadata,data}.ts`, `src/components/admin/SliderCropField.tsx` (mới), `src/components/layout/{Footer,VisitorCounter,IntroSplash,HeaderClient}.tsx`, `src/components/ui/{ShareBar,RichText,Img}.tsx`, `src/components/home/{HeroSlider,ContactSection}.tsx`, `src/components/forms/QuoteForm.tsx`, `src/app/(frontend)/api/visit/route.ts` (mới), `src/plugins/index.ts`, `next.config.ts`, `custom.scss`, `globals.css`.

**Kiểm tra:** `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:unit` (60 test) đều đạt. Thử tay trên bản build cổng tạm: cắt khung slider và xem trang chủ đổi theo; `POST /api/visit` khách mới/cũ/bot; chia sẻ qua ngrok thấy đủ thẻ OG; màn chào ở 0,3s/1,0s/1,8s/2,6s/3,4s.

**Lưu ý:**
- Schema đổi (global `visitor-stats`, field `heroCrop` ở media, enum status của quote-requests, bảng phiên bản): local đã push; **VPS cần push schema hoặc migration** trước khi khởi động bản mới.
- Trang sản phẩm/bài viết/trang tĩnh có `revalidate`; đổi ảnh làm mới toàn site qua hook của Media.
- Ô "Tên thương hiệu" trong Thông tin công ty quyết định tiêu đề tab, màn chào, footer; hiện đang là tên pháp nhân, nên đổi về "Thành Vinh Metal".
- Các tính năng ngoài 9 hạng mục ghi ở cuối `docs/SCOPE.md`.

---

## 13/10/2026 · nhánh `test` (đợt 2)

### Sửa lỗi: khôi phục phiên bản là bản nháp báo "Đã xảy ra vấn đề khi khôi phục phiên bản này"

**Tái hiện:** sản phẩm "phong cảnh" (chỉ mới lưu nháp) có 9 dòng "Bộ ảnh", 7 dòng không chọn ảnh. Vào Danh sách phiên bản, mở bản cũ, bấm "Khôi phục về phiên bản này" thì báo lỗi chung chung.

**Nguyên nhân (2 tầng):**
1. Payload cho **lưu nháp mà không kiểm tra ô bắt buộc**, nên dòng ảnh trống (ảnh là ô bắt buộc) vẫn nằm trong phiên bản nháp.
2. Nút khôi phục của Payload luôn gửi `?draft=false`; lựa chọn "khôi phục dưới dạng nháp" chỉ có khi phiên bản **không** phải nháp. Với `draft=false`, Payload kiểm tra mọi ô bắt buộc như khi xuất bản, nên bản nháp chưa đủ (dòng ảnh trống, bài viết chưa có ảnh bìa, sản phẩm chưa có danh mục...) không qua được. Giao diện chỉ hiện câu chung chung, không nói ô nào lỗi.

**Cách làm:**
- `src/hooks/versions.ts` → `restoreVersionEndpoint`: endpoint `POST /versions/:id` tự khai báo cho Sản phẩm, Bài viết, Trang tĩnh (endpoint tự khai báo được Payload xét trước endpoint mặc định). Phiên bản là bản nháp thì khôi phục **dưới dạng nháp**: không kiểm tra ô bắt buộc (giống lưu nháp), nội dung về lại trang sửa như một bản nháp, bản đang xuất bản trên web không đổi. Phiên bản đã xuất bản thì như cũ.
- Gọi thẳng `restoreVersionOperation` (Payload có export): `payload.restoreVersion` của Local API **bỏ qua** tham số `draft`, đã thử và thấy vẫn kiểm tra ô bắt buộc.
- `src/hooks/arrays.ts` → `dropEmptyRows`: Sản phẩm tự bỏ dòng "Bộ ảnh" chưa chọn ảnh và dòng "Thông số" trống cả tên lẫn giá trị, khi lưu nháp, xuất bản và khôi phục. Từ nay bản nháp không còn lưu dòng trống; phiên bản cũ có dòng trống khi khôi phục cũng được dọn.

**File:** `src/hooks/versions.ts`, `src/hooks/arrays.ts` (mới), `src/collections/Products.ts`, `Posts.ts`, `Pages.ts`.

**Lưu ý:**
- Khôi phục bản nháp xong thì còn là bản nháp; muốn lên web phải bấm "Xuất bản tài liệu" (lúc đó mới kiểm tra ô bắt buộc).
- Thêm collection có nháp mới: gắn `endpoints: [restoreVersionEndpoint]`.
- Endpoint thay đường dẫn của Payload; nâng cấp Payload thì chạy lại `tests/int/restore.test.ts` (gọi đúng route REST mà nút khôi phục gọi).

**Kiểm tra:** `tests/int/restore.test.ts`: bài viết nháp thiếu ảnh bìa, danh mục, nội dung khôi phục được qua route REST của nút (và cho thấy cách mặc định của Payload hỏng); sản phẩm bỏ dòng ảnh và dòng thông số trống khi lưu nháp. e2e `admin.spec.ts` "khôi phục phiên bản là bản nháp chưa đủ ô bắt buộc vẫn thành công": tạo sản phẩm chỉ có tên, lưu nháp 2 lần, khôi phục Lần 1 qua nút trên giao diện.

---

## 13/10/2026 · nhánh `test`

### Danh sách phiên bản dễ hiểu: đánh số lần lưu, sắp theo thời gian, ghi ô đã đổi

**Vì sao:** bảng mặc định của Payload có cột "ID của phiên bản" (số tự tăng trong database, không mang nghĩa gì với người dùng), và các dòng có ID lớn hơn lại nằm dưới. Nguyên nhân: bảng **hiện** "Ngày cập nhật" nhưng khi không có `?sort` thì **sắp** theo ngày tạo, mà khôi phục một phiên bản thì Payload giữ ngày tạo của bản cũ, nên bản sinh ra do khôi phục bị đẩy xuống dưới.

**Cách làm:** trang "Danh sách phiên bản" tự làm (`src/components/admin/VersionsList.tsx`, gắn qua `admin.components.views.edit.versions` = `VERSIONS_LIST_VIEW` trong `src/hooks/versions.ts`) cho Sản phẩm, Bài viết, Trang tĩnh, Yêu cầu báo giá:
- Sắp theo thời gian lưu, mới nhất ở trên. Cột "Lần lưu": Lần 1 là bản cũ nhất, số lớn nhất là bản mới nhất, có nhãn "Hiện tại" (mục có nháp: "Mới nhất").
- Cột "Thời gian" định dạng `dd/MM/yyyy HH:mm` theo giờ Việt Nam (render ở server nên ghi rõ múi giờ).
- Cột "Trạng thái" (chỉ mục có nháp): Đã xuất bản, Bản nháp.
- Cột "Thay đổi so với lần trước": tên các ô đã đổi (nhãn tiếng Việt lấy từ cấu hình field, quá 4 ô thì gộp "và N ô khác"), "Bản đầu tiên", "Xuất bản", "Chuyển về bản nháp" hoặc "Không đổi nội dung". Không kể field ẩn (`searchText`) và field ui.
- Dòng đầu trang ghi số lần lưu và giới hạn `maxPerDoc`. Không phân trang vì mỗi mục giữ tối đa 20–50 bản. Bấm dòng mở trang phiên bản với `?modifiedOnly=false`.

**Sửa kèm, lỗi so sánh:** `sameContent()` gặp hai object có `id` thì chỉ so `id` rồi dừng. Dòng của mảng (Bộ ảnh, Thông số) có `id` riêng và giữ nguyên khi sửa giá trị bên trong, nên sửa một dòng thông số vẫn bị coi là "giống nhau" (ẩn nhầm nút khôi phục). Giờ hai object thì so toàn bộ nội dung; chỉ so theo `id` khi một bên là object còn bên kia là id trần.

**File:** `src/components/admin/VersionsList.tsx` (mới), `src/lib/versions.ts` (sửa `sameContent`, thêm `changedKeys`, `fieldLabels`), `src/hooks/versions.ts`, 4 collection, `custom.scss`, `importMap.js`.

**Lưu ý:** "Lần N" đánh lại khi bản cũ nhất bị xóa do vượt `maxPerDoc`. Payload không ghi ai sửa, nên chưa có cột người sửa.

### Cột "Nội dung" của yêu cầu báo giá không còn kéo giãn bảng

**Vì sao:** khách gõ chuỗi liền không có khoảng trắng ("caccac...") thì không tự xuống dòng, bảng danh sách bị kéo rộng phải cuộn ngang.

**Cách làm (`custom.scss`):** mọi ô trong bảng danh sách cho chữ dài xuống dòng (`overflow-wrap: anywhere`). Cột "Nội dung, quy cách cần gia công" rộng 200–360px, hiện tối đa 2 dòng; mở yêu cầu để đọc đủ.

### "Gửi từ trang" ghi cả sản phẩm, thêm mô tả cho "Gửi từ trang" và "IP"

- `QuoteForm` ghi `source` gồm cả phần sau dấu `?` (đã giải mã): gửi từ nút "Yêu cầu báo giá" của sản phẩm sẽ thấy `/lien-he?sp=<tên sản phẩm>`. Yêu cầu cũ giữ nguyên.
- Thêm dòng mô tả dưới hai ô trong trang sửa: "Gửi từ trang" để biết trang nào mang lại khách; "IP" chỉ dùng truy vết khi bị spam (`::1`, `192.168...` là máy nội bộ lúc thử nghiệm).

**File:** `src/components/forms/QuoteForm.tsx`, `src/collections/QuoteRequests.ts`.

**Kiểm tra (cả đợt):** unit: dòng mảng sửa giá trị là khác, `changedKeys`, `fieldLabels`. e2e: danh sách phiên bản yêu cầu báo giá ("Lần 2 / Hiện tại / Điện thoại", "Lần 1 / Bản đầu tiên"), nội dung rất dài không làm bảng tràn. Đã chụp màn hình danh sách phiên bản sản phẩm và yêu cầu báo giá.

**Ghi chú chạy test:** máy còn ít RAM (khoảng 2 GB trống) thì `next build` (11 tiến trình) và Playwright (khoảng 6 trình duyệt) có thể hết bộ nhớ. Chạy `CIRCLE_NODE_TOTAL=4 pnpm test:e2e --workers=2` (xem `docs/TESTING.md`).

---

## 12/10/2026 · nhánh `test` (đợt 6)

### Bấm ảnh nhỏ ở mọi chỗ có ảnh kèm tên tệp trong trang quản trị đều xem được ảnh lớn

**Vì sao:** đợt 5 chỉ áp cho ô ảnh trong form. Trang so sánh phiên bản (giờ hiện toàn bộ nội dung) và vài chỗ khác vẫn có ảnh nhỏ kèm tên tệp mà bấm không phóng to được.

**Cách làm:** `AdminImageViewer` đổi sang danh sách nguồn `SOURCES`. Mỗi chỗ khai báo vùng bấm và cách lấy ảnh gốc: có sẵn link tệp gốc thì dùng luôn; chỉ có id hoặc tên tệp thì hỏi API lấy `url` của ảnh gốc, để xem ảnh nét chứ không phải bản thumb 300×300. Các chỗ đang áp dụng:

| Chỗ | Bấm vào | Ghi chú |
|---|---|---|
| Ô ảnh trong form (bộ ảnh sản phẩm, ảnh danh mục, ảnh bìa, slider...) | ảnh nhỏ, tên tệp | xem tiếp các ảnh cùng mảng |
| Trang so sánh phiên bản | ảnh nhỏ, tên tệp | lấy ảnh gốc qua API theo id |
| Danh sách "Ảnh và tệp" | ảnh nhỏ | bấm tên vẫn mở trang sửa |
| Trang sửa một ảnh (khung chi tiết tệp) | ảnh nhỏ, tên tệp | |
| Ô tệp có kéo thả | ảnh nhỏ, tên tệp | |
| Ảnh chèn trong nội dung bài viết | ảnh | bấm tên vẫn mở hộp sửa của Payload; chưa có test e2e vì dữ liệu mẫu không có ảnh trong bài |
| Cột "Ảnh" danh sách Sản phẩm, Danh mục | ảnh | bỏ link mở trang sửa quanh ảnh; bấm tên để mở trang sửa |
| Tệp bản vẽ của yêu cầu báo giá (là ảnh) | ảnh nhỏ, tên tệp | như đợt 5 |

- Không áp ở hộp "Chọn từ thư viện" (bấm là để chọn ảnh) và màn hình tải nhiều tệp.
- Nút nằm **trong** khối ảnh (sửa, xóa, đổi ảnh) giữ nguyên chức năng. Nút bọc bên **ngoài** thì không tính, vì Payload có lúc bọc ô liên kết của danh sách trong `<button>`.
- Tệp không phải ảnh (PDF, bản vẽ) mở ở tab mới như link bình thường.
- Provider đặt `data-image-viewer-ready="true"` trên `<html>` khi đã gắn xong. Bấm trước lúc trang hydrate xong thì link vẫn chạy theo kiểu cũ; test e2e chờ dấu này.

**File:** `src/components/admin/AdminImageViewer.tsx`, `src/components/admin/ThumbnailCell.tsx`, `src/app/(payload)/custom.scss` (con trỏ kính lúp ở các vùng bấm), `tests/e2e/admin.spec.ts`.

**Lưu ý:** thêm chỗ mới thì thêm một mục vào `SOURCES`. Các mục bám vào class của Payload; nâng cấp Payload mà đổi tên class thì chỗ đó quay về hành vi cũ, test e2e sẽ báo.

**Kiểm tra:** e2e: trang so sánh phiên bản mở ảnh gốc (không phải thumb), danh sách "Ảnh và tệp" phóng to mà không chuyển trang, cột Ảnh sản phẩm, hộp "Chọn từ thư viện" bấm ảnh vẫn chọn được ảnh. Test cũ "mở được một sản phẩm để sửa" giờ bấm vào tên. Chạy lặp 3 lần các test trình xem ảnh: 10/10 qua.

---

## 12/10/2026 · nhánh `test` (đợt 5)

### Yêu cầu báo giá: trạng thái "Cần liên hệ lại", 4 ô lọc theo trạng thái, màu đặc trưng

**Vì sao:** cần đánh dấu yêu cầu chưa liên lạc được hoặc hẹn gọi lại, và nhìn nhanh mỗi trạng thái còn bao nhiêu yêu cầu.

**Cách làm:**
- `src/lib/quoteStatus.ts`: nguồn chung cho 4 trạng thái theo thứ tự Mới, **Cần liên hệ lại** (`callback`, mới), Đã liên hệ, Hoàn tất; mỗi trạng thái có nhãn, mô tả, tên số đếm realtime. Ô chọn trạng thái của collection lấy từ đây.
- Màu đặc trưng (`custom.scss`, class `qs--<value>`, có bản sáng và tối): Mới cam `#E8411A` (giống huy hiệu cũ), Cần liên hệ lại vàng `#F5A524`, Đã liên hệ xanh dương `#3B82F6`, Hoàn tất xanh lá `#22C55E`.
- Danh sách Yêu cầu báo giá: 4 ô tổng theo trạng thái (`QuoteStatusCards`, slot `beforeListTable`, nằm ngay trên bảng). Mỗi ô có biểu tượng, số yêu cầu và mô tả. Bấm để lọc, bấm lại ô đang chọn để bỏ lọc. Lọc qua `useListQuery` của Payload, vì chỉ đổi URL thì bộ quản lý danh sách áp lại bộ lọc cũ. Lọc bằng nút "Bộ lọc" có sẵn thì ô tương ứng cũng sáng. Số tự cập nhật realtime.
- Cột "Trạng thái" hiện nhãn có màu (`QuoteStatusCell`).
- Menu trái: sau huy hiệu cam (số yêu cầu Mới) có thêm huy hiệu nền vàng = số yêu cầu Cần liên hệ lại. Bảng điều khiển: ô "Yêu cầu báo giá mới" thêm dòng "N cần liên hệ lại".
- `LiveCounts` (`src/lib/liveEvents.ts`) có thêm `callbackQuotes`, `contactedQuotes`, `doneQuotes`. Đổi trạng thái nào cũng làm mới danh sách yêu cầu báo giá đang mở.

**File:** `src/lib/quoteStatus.ts` (mới), `src/components/admin/QuoteStatusCards.tsx`, `QuoteStatusCardsClient.tsx`, `QuoteStatusCell.tsx` (mới), `src/collections/QuoteRequests.ts`, `src/lib/liveEvents.ts`, `src/components/admin/LiveCount.tsx`, `Nav/NavClient.tsx`, `Nav/index.tsx`, `DashboardHeader.tsx`, `src/app/(payload)/custom.scss`, `src/payload-types.ts`.

**Lưu ý:**
- **Thay đổi database:** enum trạng thái thêm giá trị `callback`. Chạy `pnpm dev` một lần trước khi `pnpm build && pnpm start` (dự án chưa có migration, xem KNOWN-ISSUES mục 4).
- Thêm trạng thái khác: thêm vào `QUOTE_STATUSES`, thêm màu `.qs--<value>` trong `custom.scss`, thêm số vào `LiveCounts`.

### Không cho khôi phục phiên bản giống nội dung hiện tại: áp cho mọi mục có "Danh sách phiên bản"

**Vì sao:** trước chỉ áp cho yêu cầu báo giá; sản phẩm, bài viết, trang tĩnh vẫn khôi phục được bản trùng.

**Cách làm:**
- Hook dùng chung `blockNoopRestore` chuyển sang `src/hooks/versions.ts`, gắn vào `beforeOperation` của Sản phẩm, Bài viết, Trang tĩnh, Yêu cầu báo giá. So với **phiên bản mới nhất** (theo `updatedAt`): mục có nháp thì đó là bản đang mở trong trang sửa, mục không nháp thì trùng nội dung hiện tại.
- `VersionRestoreGuard` tự áp cho mọi collection có `versions` (đọc từ cấu hình), cũng so với phiên bản mới nhất. Thêm collection có versions sau này thì chỉ cần gắn hook `blockNoopRestore`.

### Trang xem phiên bản mặc định hiện toàn bộ nội dung

**Vì sao:** Payload mặc định tick "Chỉ được sửa đổi", nên chỉ thấy các ô đã đổi.

**Cách làm:** `VersionRestoreGuard` thêm `?modifiedOnly=false` khi **mới vào** trang phiên bản: bấm link tới trang phiên bản thì sửa link trước khi điều hướng (không nháy); mở thẳng URL thì đổi một lần. Payload xóa tham số khi người dùng tick lại, nên không ép lại khi đang ở trên trang: tick lại vẫn được.

### Bấm ảnh nhỏ hoặc tên tệp ở ô ảnh trong form thì xem ảnh phóng to

**Vì sao:** ô ảnh của Payload (ví dụ "Bộ ảnh" sản phẩm, ảnh danh mục, ảnh bìa bài viết, ảnh slider) có ảnh nhỏ và tên tệp; bấm tên tệp mở tab mới, bấm ảnh nhỏ không làm gì.

**Cách làm:** `src/components/admin/AdminImageViewer.tsx` (gắn qua `admin.components.providers`) bắt click vào `.upload-relationship-details__thumbnail` hoặc `__filename` ở mọi ô ảnh, mở ảnh gốc toàn màn hình. Ô ảnh nằm trong mảng thì chuyển được giữa các ảnh của mảng đó (nút ‹ ›, phím ← →). Đóng bằng nút Đóng, Esc, hoặc bấm ra ngoài ảnh. Có link "Mở tệp gốc". Tệp không phải ảnh (PDF, DXF) vẫn mở tab mới như cũ; giữ Ctrl/Cmd khi bấm cũng mở tab mới. Ô "Tệp bản vẽ" của yêu cầu báo giá (khi khách gửi ảnh) cũng mở được, qua thuộc tính `data-image-viewer`.

**File:** `src/components/admin/AdminImageViewer.tsx` (mới), `QuoteAttachmentField.tsx`, `src/payload.config.ts`, `custom.scss`.

**Lưu ý:** bám vào class của Payload (`upload-relationship-details__*`). Nâng cấp Payload mà đổi tên class thì bấm ảnh sẽ quay về hành vi cũ; test e2e sẽ báo.

**Kiểm tra (cả đợt):** int: trạng thái `callback` lưu và đếm riêng, `getLiveCounts` đủ 4 trạng thái, chặn khôi phục trùng ở sản phẩm (có nháp). e2e `admin.spec.ts`: đổi trạng thái sang Cần liên hệ lại, 4 ô, huy hiệu vàng, bấm lọc và bỏ lọc; trang phiên bản bỏ tick khi mới vào, tick lại được, sản phẩm không có nút khôi phục bản trùng; bấm tên tệp và ảnh nhỏ mở trình xem. Đã chụp màn hình danh sách, menu, bảng điều khiển, trình xem ảnh.

---

## 12/10/2026 · nhánh `test` (đợt 4)

### Sửa lỗi: sản phẩm, bài viết, trang tĩnh còn là bản nháp vẫn hiện trên website

**Vì sao:** sản phẩm "phong cảnh" mới bấm "Lưu bản nháp" đã hiện trong danh mục Tấm đục lỗ như đã xuất bản. Mọi truy vấn cho website trong `src/lib/data.ts` dùng Local API của Payload, mà Local API **mặc định bỏ qua phân quyền** (`overrideAccess: true`). Quy tắc "khách chỉ thấy bản đã xuất bản" (`publishedOrLoggedIn` trong `src/access/index.ts`) vì vậy không được áp dụng, và không chỗ nào tự lọc `_status`. Lỗi có từ đầu dự án: mọi bản nháp chưa xuất bản lần nào đều lọt ra danh sách, trang chi tiết, tìm kiếm, sản phẩm liên quan, tab Ứng dụng ở trang chủ và `sitemap.xml`.

**Cách làm:**
- `src/lib/data.ts`: thêm `AS_GUEST = { overrideAccess: false }`, gắn vào mọi truy vấn sản phẩm, bài viết, trang tĩnh, tìm kiếm và global Trang chủ. Payload áp đúng phân quyền của khách; quan hệ được populate cũng qua phân quyền, nên bản nháp nằm trong "Sản phẩm liên quan", "Bài viết liên quan" hay 4 sản phẩm của tab Ứng dụng chỉ còn là id và bị bỏ qua (các component vốn đã lọc `typeof === 'object'`).
- `sitemap.ts` và `generateStaticParams` của trang sản phẩm, bài viết, trang tĩnh cũng dùng `AS_GUEST`.
- Tài khoản người dùng không công khai với khách, nên người viết bài chỉ còn là id. `getPost` lấy riêng **chỉ tên** để hiện dưới tiêu đề. Trước đây trang bài viết lấy cả tài khoản, gồm cả email.

**File:** `src/lib/data.ts`, `src/app/sitemap.ts`, `src/app/(frontend)/san-pham/[slug]/page.tsx`, `src/app/(frontend)/bai-viet/[slug]/page.tsx`, `src/app/(frontend)/[slug]/page.tsx`.

**Lưu ý khi sửa sau:**
- Truy vấn mới cho giao diện người xem thì thêm `...AS_GUEST`. Không thêm thì bản nháp lọt ra.
- Sản phẩm đã xuất bản rồi lưu nháp thêm thì website vẫn hiện bản đã xuất bản (bản nháp chỉ nằm trong danh sách phiên bản) cho tới khi bấm "Xuất bản tài liệu".
- Trang người xem không có chế độ xem trước bản nháp; muốn xem thử thì xuất bản.

**Kiểm tra:** `tests/int/data.test.ts` nhóm "bản nháp không lên website" (5 test: danh sách, nổi bật, chi tiết, tìm kiếm, sản phẩm liên quan, bài viết, trang tĩnh, tên người viết không kèm email). Đã thử tắt bản sửa: 5 test này đỏ, cùng một test cũ.

---

## 12/10/2026 · nhánh `test` (đợt 3)

### Cột "Ảnh" đứng trước tên trong danh sách Sản phẩm và Danh mục sản phẩm

**Vì sao:** danh sách trong trang quản trị chỉ có chữ, khó nhận ra sản phẩm nào là sản phẩm nào.

**Cách làm:**
- Field `ui` tên `thumbnail` (`src/fields/thumbnail.ts`, hàm `thumbnailColumn(imagePath)`), không lưu gì vào database và không hiện trong trang sửa, chỉ làm một cột trong danh sách. Sản phẩm lấy ảnh đầu của bộ ảnh (`images.0.image`), danh mục lấy `image`.
- `src/components/admin/ThumbnailCell.tsx`: ô chạy ở server, lấy ảnh cỡ `thumb` (300×300, đã có sẵn) rồi hiện 52×52. Danh sách của Payload tải dữ liệu ở depth 0 nên ảnh chỉ là id; mỗi dòng thêm một truy vấn nhỏ theo khóa chính. Chưa có ảnh thì hiện ô sọc.
- `thumbnail` đứng đầu `defaultColumns`. Payload chỉ gắn link mở trang sửa cho cột đầu tiên, nên cột tên dùng `DocLinkCell` để vẫn bấm được (bấm ảnh cũng mở trang sửa).
- `custom.scss`: cột ảnh hẹp vừa ảnh (Payload đặt mọi ô tối thiểu 150px), ảnh không bị bóp (Payload đặt `img` `max-width: 100%`), bảng có cột ảnh thì chữ căn giữa theo chiều cao ảnh.

**File:** `src/fields/thumbnail.ts` (mới), `src/components/admin/ThumbnailCell.tsx` (mới), `src/components/admin/DocLinkCell.tsx` (mới), `src/collections/Products.ts`, `src/collections/ProductCategories.ts`, `src/app/(payload)/custom.scss`, `src/app/(payload)/admin/importMap.js`.

**Lưu ý:**
- Tài khoản nào đã từng tự chỉnh "Hiển thị cột" ở hai danh sách này thì Payload giữ lựa chọn cũ, cột Ảnh sẽ không tự hiện: bật lại trong "Hiển thị cột".
- Muốn thêm cột ảnh cho bài viết: `thumbnailColumn('cover')`, thêm `'thumbnail'` vào đầu `defaultColumns`, gắn `linkedNameCell` cho field `title`.

**Kiểm tra:** e2e `admin.spec.ts` "danh sách products/product-categories có cột ảnh đứng trước tên, bấm tên vẫn mở trang sửa". Đã chụp màn hình kiểm tra cả hai danh sách.

---

## 12/10/2026 · nhánh `test` (đợt 2)

### Bấm ảnh thu nhỏ của sản phẩm là mở ảnh đó phóng to

**Vì sao:** trước đây bấm ảnh thu nhỏ chỉ đổi ảnh chính, phải bấm thêm ảnh chính mới xem lớn được.

**Cách làm:** bấm ảnh thu nhỏ mở thẳng `Lightbox` ở ảnh đó; đóng lại thì ảnh chính đổi theo ảnh vừa xem. Con trỏ chuột trên ảnh thu nhỏ là kính lúp (`cursor-zoom-in`). Nhãn trợ năng: ảnh chính "Xem ảnh lớn: <tên sản phẩm>", ảnh thu nhỏ "Xem ảnh lớn 1", "Xem ảnh lớn 2"…

**File:** `src/components/product/ProductGallery.tsx`. **Kiểm tra:** `products.spec.ts` "bấm ảnh thu nhỏ mở thẳng ảnh đó phóng to".

### Nút "Khôi phục về phiên bản này" chỉ hiện khi phiên bản khác nội dung hiện tại

**Vì sao:** khôi phục một phiên bản giống hệt nội dung hiện tại chẳng đổi gì, mà còn đẻ thêm một phiên bản trùng (hai bản chỉ khác "Ngày cập nhật").

**Cách làm:**
- `src/lib/versions.ts`: `sameContent()` so nội dung hai bản, bỏ qua id, ngày tạo, ngày cập nhật, `_status`; trống, null và thiếu trường coi như nhau; quan hệ so theo id.
- Server: hook `beforeOperation` `blockNoopRestore` trong `QuoteRequests.ts` từ chối khôi phục khi phiên bản giống nội dung hiện tại, báo "Phiên bản này giống hệt nội dung hiện tại, không cần khôi phục.". Chặn được cả khi gọi qua API.
- Giao diện: Payload không có chỗ thay riêng nút khôi phục, nên `src/components/admin/VersionRestoreGuard.tsx` (gắn qua `admin.components.providers`) so phiên bản đang xem với nội dung hiện tại rồi đánh dấu `data-version-restore` trên `<html>`; `custom.scss` ẩn nút khi `checking` hoặc `same`, và khi `same` thì hiện dòng "Giống nội dung hiện tại, không cần khôi phục". Không so được (mất mạng) thì vẫn hiện nút, server vẫn chặn.
- Hiện chỉ áp cho `quote-requests` (mảng `GUARDED`). Muốn áp cho sản phẩm, bài viết thì thêm slug vào `GUARDED` và gắn hook tương tự; lưu ý các collection đó có nháp.

**File:** `src/lib/versions.ts` (mới), `src/components/admin/VersionRestoreGuard.tsx` (mới), `src/collections/QuoteRequests.ts`, `src/payload.config.ts`, `src/app/(payload)/custom.scss`, `src/app/(payload)/admin/importMap.js`.

**Lưu ý:** khôi phục làm Payload tạo phiên bản mới với `createdAt` bằng của bản được khôi phục, nên muốn lấy bản mới nhất thì sắp theo `-updatedAt`, không phải `-createdAt`.

**Kiểm tra:** `tests/unit/versions.test.ts`, int "không cho khôi phục phiên bản giống hệt nội dung hiện tại", e2e `admin.spec.ts` "nút khôi phục chỉ hiện ở phiên bản khác nội dung hiện tại".

### Sửa lỗi realtime: có lúc số trên trang quản trị không tự cập nhật

**Vì sao:** chạy lặp test e2e phát hiện ô "Đăng ký bản tin" đứng yên dù đã có đăng ký mới. Hook `afterChange` (và cả `afterOperation`) của Payload chạy **trước** khi commit transaction. Tin báo phát ngay thì route SSE đếm lại vẫn ra số cũ, rồi không còn tin nào nữa, nên tab admin đứng số tới lần thăm dò sau (60 giây).

**Cách làm:** `notifyLiveChange()` chờ 300 ms (`NOTIFY_DELAY_MS`) rồi mới phát, đủ để commit xong. Nhiều thay đổi liền nhau (xóa hàng loạt) gộp thành một lần đẩy.

**File:** `src/lib/liveEvents.ts`. Test int `countEvents` chờ thêm `NOTIFY_DELAY_MS` trước khi đếm.

**Kiểm tra:** chạy lặp 5 lần test e2e realtime (cả khi các bản lặp chạy song song): 5/5 qua. Test e2e dùng `randomIp()` (`tests/e2e/rate-limit.ts`) cho request gửi thẳng, và chỉ đòi số tăng lên chứ không đòi đúng +1, vì test khác chạy song song cũng tạo đăng ký.

---

## 12/10/2026 · nhánh `test`

### Sửa lỗi: lần sửa đầu tiên của yêu cầu báo giá cũ không so sánh được

**Vì sao:** yêu cầu gửi trước khi bật lịch sử (11/10/2026) chưa có phiên bản nào. Lần sửa đầu chỉ tạo **một** phiên bản, chính là bản sau khi sửa, nên trang so sánh không có gì để đặt cạnh: mọi ô đều hiện như mới thêm. Ví dụ yêu cầu "Choa ddatj" sửa số điện thoại từ `0989541246` thành `0989541249`, nhưng không thấy được đã đổi gì.

**Cách làm:** hook `beforeChange` (`saveBaselineVersion`) trong `QuoteRequests.ts`. Khi sửa một yêu cầu chưa có phiên bản nào, nó lưu nội dung cũ làm phiên bản gốc (dùng `payload.db.createVersion`, giống Payload làm nội bộ, thời điểm bằng `updatedAt` cũ) trước khi ghi đè. Sau đó Payload tạo phiên bản của lần sửa như bình thường, nên trang so sánh thấy đúng ô đã đổi. Không cần chạy script gì: yêu cầu cũ nào cũng tự có bản gốc ở lần sửa đầu, kể cả trên VPS.

**Không cứu được:** yêu cầu nào **đã** sửa trước bản vá này (như "Choa ddatj") thì nội dung trước lần sửa đó không còn lưu ở đâu. Từ lần sửa sau, lịch sử so sánh bình thường.

### Trạng thái yêu cầu báo giá không được để trống

**Vì sao:** yêu cầu "Choa ddatj" có trạng thái trống (`null`), nhiều khả năng do bấm dấu ✕ trên ô Trạng thái. Yêu cầu trống trạng thái không được đếm là "Mới" (huy hiệu, ô thống kê), và trang so sánh phiên bản hiện chữ `null`.

**Cách làm:** ô Trạng thái bỏ dấu ✕ (`isClearable: false`), lưu mà trống thì báo "Chọn trạng thái cho yêu cầu này.". Dùng `validate` thay cho `required` để **không** thêm ràng buộc NOT NULL vào database: bảng đang có dòng trống, đẩy schema sẽ lỗi hoặc bị hỏi xóa dữ liệu.

**Lưu ý:** yêu cầu đang trống trạng thái thì lần lưu tới phải chọn trạng thái mới lưu được.

**File:** `src/collections/QuoteRequests.ts`.

**Kiểm tra:** `tests/int/live.test.ts`: "yêu cầu cũ chưa có lịch sử: lần sửa đầu lưu cả bản gốc để so sánh được", "không cho lưu yêu cầu với trạng thái trống".

### Test int chạy tuần tự thật

**Vì sao:** `vitest.config.mts` đặt `fileParallelism: false` trong project `int`, nhưng Vitest 3 chỉ đọc tùy chọn này ở cấp gốc, nên các file int vẫn chạy song song trên cùng một database. Thêm `tests/int/live.test.ts` làm lỗi lộ ra: chạy 3 lần thì 2 lần đỏ ở chỗ khác nhau (số đếm lệch do file khác tạo bản ghi cùng lúc, hai file cùng tạo tài khoản nhân viên test trên database mới).

**Cách làm:** chuyển `fileParallelism: false` lên cấp gốc `test`. Test unit cũng chạy tuần tự, vẫn dưới 1 giây. Bản ghi test trong `live.test.ts` dùng tiền tố `Livetest` (không chứa "zz") để lệnh dọn `like 'Zz%'` của `api.test.ts` không xóa nhầm.

**File:** `vitest.config.mts`, `tests/int/live.test.ts`.

**Kiểm tra:** `pnpm test:int` chạy 3 lần liên tiếp đều 91/91.

---

## 11/10/2026 · nhánh `test` (đợt 2)

### Sửa lỗi: header bị tràn trên màn hình laptop 1127–1365px

**Vì sao:** chạy đủ bộ e2e mới phát hiện ra. Sau khi phóng 110%, menu ngang hiện từ 1127px nhưng thực tế cần khoảng 1365px (dữ liệu mẫu). Trong khoảng đó nút tìm kiếm và nút sáng/tối bị đẩy ra ngoài màn hình, không bấm được. Lỗi đã có từ trước ở 1024–1240px; phóng 110% chỉ dời nó sang màn rộng hơn, đúng vào laptop 1280 và 1366px. Admin còn thêm được mục menu (tối đa 6 mỗi bên), nên chọn một mốc cố định nào cũng không chắc.

**Cách làm:** `HeaderClient` tự đo. Menu ngang không đủ chỗ (`scrollWidth > clientWidth` của header) thì thu về nút mở menu và ngăn kéo như điện thoại. Lúc thu, nó ghi lại bề ngang cần; header rộng bằng chừng đó thì hiện menu ngang lại. Đo lại khi đổi cỡ cửa sổ (`ResizeObserver`) và khi font tải xong. Với dữ liệu mẫu: 1366px trở lên hiện menu ngang, hẹp hơn dùng nút mở menu.

**File:** `src/components/layout/HeaderClient.tsx`.

**Lưu ý:**
- Lần tải đầu, trước khi JavaScript chạy (vài trăm mili giây), màn 1127–1365px vẫn thấy menu ngang bị tràn, sau đó tự thu.
- Muốn nhiều màn hình hiện menu ngang hơn thì giảm khoảng cách giữa các mục (`gap-5`, `letterSpacing: 1.6`) hoặc bớt mục menu.

**Kiểm tra:** `tests/e2e/theme-nav.spec.ts` nhóm "Header trên màn hình laptop" (1280px, 1366px, thu về nút mở menu ở 1200px). Project `desktop` của Playwright chuyển từ 1280×720 sang **1440×900**, bằng bề ngang thiết kế gốc.

### Lưu ý khi kéo code này về máy

- Đã xóa route `/api/quote-events`. Nếu `pnpm build` hoặc `pnpm typecheck` báo `Cannot find module '.../api/quote-events/route.js'` trong `.next/types` hoặc `.next/dev/types`, xóa hai thư mục đó (file kiểu dữ liệu Next sinh ra, sẽ tự tạo lại). `next build` không tự dọn `.next/dev`.
- Database có thêm bảng phiên bản cho yêu cầu báo giá: chạy `pnpm dev` một lần trước khi `pnpm build && pnpm start` (xem mục dưới).

### Đăng ký bản tin cập nhật realtime như yêu cầu báo giá

**Vì sao:** trước đây chỉ yêu cầu báo giá tự cập nhật trong trang quản trị; đăng ký bản tin phải tải lại trang mới thấy.

**Giờ có:**
- Menu trái, mục "Đăng ký bản tin": huy hiệu số **đăng ký mới trong hôm nay** (tính từ 0 giờ giờ Việt Nam). Kiểu viền, không nền đặc như báo giá, vì đây là số để biết chứ không phải việc cần xử lý.
- Bảng điều khiển: ô "Đăng ký bản tin" tự tăng số tổng, thêm dòng "+N hôm nay".
- Thông báo góc màn hình "Có 1 đăng ký bản tin mới".
- Đang mở danh sách Đăng ký bản tin thì danh sách tự làm mới.

**Cách làm:** gộp kênh realtime của báo giá thành một kênh chung cho cả hai:
- `src/lib/quoteEvents.ts` → `src/lib/liveEvents.ts`: `notifyLiveChange()` để phát, `getLiveCounts()` trả `{ newQuotes, subscribers, subscribersToday }`.
- Route `/api/quote-events` → `/api/live-counts`: `?stream=1` là SSE, không có tham số thì trả JSON (thăm dò dự phòng mỗi 60 giây gọi vào đây thay cho REST count).
- `LiveQuoteCount.tsx` → `LiveCount.tsx`: `<LiveCount initial metric variant />` cho một con số, `<LiveListRefresh />` gắn một lần ở menu để làm mới danh sách.
- Collection `subscribers` thêm hook `afterChange`, `afterDelete` gọi `notifyLiveChange()`.
- Một tab admin vẫn chỉ mở **một** kết nối SSE cho mọi con số.

**File:** `src/lib/liveEvents.ts` (mới), `src/lib/format.ts` (thêm `startOfDayVN`), `src/app/(frontend)/api/live-counts/route.ts` (mới), `src/components/admin/LiveCount.tsx` (mới), `src/components/admin/Nav/index.tsx`, `Nav/NavClient.tsx`, `DashboardHeader.tsx`, `src/collections/Subscribers.ts`, `QuoteRequests.ts`, `src/app/(payload)/custom.scss`. Đã xóa `src/lib/quoteEvents.ts`, `src/app/(frontend)/api/quote-events/route.ts`, `src/components/admin/LiveQuoteCount.tsx`.

**Lưu ý khi sửa sau:**
- Thêm số realtime mới: thêm vào `LiveCounts` và `getLiveCounts()`, gọi `notifyLiveChange()` trong hook của collection, rồi dùng `<LiveCount metric=... />`.
- Vẫn chỉ đúng khi chạy **một tiến trình** (PM2 `instances: 1`), như trước.
- Huy hiệu "hôm nay" về 0 sau nửa đêm ở lần thăm dò kế tiếp (tối đa 60 giây).

**Kiểm tra:** `tests/int/live.test.ts` (đếm số, phát sự kiện, route 401/JSON/SSE), `tests/unit/format.test.ts` (`startOfDayVN`), e2e `admin.spec.ts` "đăng ký bản tin mới hiện ngay trên bảng điều khiển".

### Yêu cầu báo giá có "Danh sách phiên bản" (lịch sử chỉnh sửa)

**Vì sao:** muốn xem ai đã đổi gì trên một yêu cầu báo giá, giống tab phiên bản bên sản phẩm.

**Cách làm:** bật `versions` cho collection `quote-requests` (giữ tối đa 50 phiên bản mỗi yêu cầu, **không** bật nháp: lưu là có hiệu lực ngay). Trang sửa có thêm tab "Danh sách phiên bản": xem từng lần lưu, so sánh hai phiên bản, khôi phục về phiên bản cũ. Thêm `readVersions: isAdminOrEditor`.

**File:** `src/collections/QuoteRequests.ts`.

**Lưu ý:**
- **Thay đổi database:** thêm bảng `_quote_requests_v`. Dự án chưa có migration, schema chỉ tự cập nhật khi chạy `pnpm dev` hoặc `payload run` (ví dụ `pnpm seed`). Trước khi `pnpm build && pnpm start` trên máy đang có dữ liệu, chạy `pnpm dev` một lần cho schema cập nhật. Trên VPS cũng vậy (xem KNOWN-ISSUES mục 4).
- Yêu cầu báo giá đã có từ trước chưa có phiên bản nào; lần lưu tiếp theo mới bắt đầu có lịch sử.
- Phiên bản của Payload chỉ ghi thời điểm và nội dung, **không ghi ai sửa**. Muốn biết người sửa thì phải thêm field ghi người cập nhật (chưa làm).

**Kiểm tra:** `tests/int/live.test.ts` nhóm "lịch sử chỉnh sửa yêu cầu báo giá" (tạo phiên bản, quyền xem, khôi phục), e2e `admin.spec.ts` "yêu cầu báo giá có danh sách phiên bản như sản phẩm".

---

## 11/10/2026 · nhánh `test`

### Toàn trang phóng 110% trên máy tính và máy tính bảng

**Vì sao:** xem ở mức 100% thấy chữ và khối hơi nhỏ, phải phóng 110% trên trình duyệt mới vừa. Sửa để mức 100% của người xem trông như 110% cũ.

**Cách làm:**
- `html { zoom: var(--zoom) }`. `--zoom` bằng `1.1` từ bề ngang 768px trở lên, bằng `1` dưới 768px (điện thoại giữ nguyên).
- Các mốc breakpoint `md`, `lg`, `xl`, `2xl` nhân 1.1 (`52.8rem`, `70.4rem`, `88rem`, `105.6rem`). Nhờ vậy bố cục đổi ở đúng bề ngang như khi tự phóng 110% trên trình duyệt. Ví dụ menu ngang trên header giờ hiện từ 1127px; hẹp hơn thì dùng nút mở menu (trước là 1024px).
- `zoom` phóng luôn đơn vị `vh`: `100vh` thành 110% chiều cao màn hình. Đã chia lại cho `var(--zoom)` ở chiều cao tối đa của mega menu và chiều cao tối thiểu của trang 404.
- Chỉ áp cho trang người xem. Trang quản trị `/admin` không đổi.

**File:** `src/app/(frontend)/globals.css`, `src/components/layout/HeaderClient.tsx`, `src/app/(frontend)/not-found.tsx`.

**Lưu ý khi sửa sau:**
- Dùng `vh` thì viết `calc(100vh_/_var(--zoom))`, nếu không khối sẽ cao hơn màn hình 10%.
- Mọi số đo trong code (px) hiển thị thực tế lớn hơn 10% trên màn hình từ 768px.
- Phần tử `position: fixed` với `inset-0` vẫn phủ đúng toàn màn hình, không cần sửa.

**Kiểm tra:** đã thử ở 1440, 1280, 1100, 1024, 800 và 390px: không tràn ngang, menu đổi đúng mốc. Test mới: `home.spec.ts` "máy tính hiển thị phóng 110%", `responsive.spec.ts` "điện thoại giữ tỉ lệ 100%".

### Bộ ảnh trang chi tiết sản phẩm: ảnh nhỏ to hơn, bấm để xem ảnh lớn

**Vì sao:** ảnh thu nhỏ bên dưới ảnh chính quá bé; khách muốn bấm vào ảnh để xem rõ.

**Cách làm:**
- Ảnh thu nhỏ: 4 cột trên điện thoại, 5 cột từ 640px (trước là 5 và 6 cột). Trên màn hình 1440px mỗi ảnh từ 103px lên 123px.
- Bấm ảnh chính mở **xem ảnh lớn toàn màn hình** (component mới `Lightbox`). Ảnh phóng vừa khung theo đúng tỉ lệ, kể cả ảnh gốc nhỏ. Có số thứ tự `01 / 02` và tên sản phẩm.
- Chuyển ảnh: nút mũi tên, phím ← →, hoặc vuốt trên điện thoại. Đóng: nút Đóng, phím Esc, hoặc bấm ra ngoài ảnh (bấm vào ảnh không đóng). Đóng ở ảnh nào thì bộ ảnh chọn ảnh đó.
- Góc ảnh chính có biểu tượng phóng to để khách biết bấm được.
- Bấm ảnh thu nhỏ vẫn như cũ: đổi ảnh chính.

**File:** `src/components/product/ProductGallery.tsx`, `src/components/ui/Lightbox.tsx` (mới), `src/components/ui/Icons.tsx` (thêm `IconExpand`), `src/app/(frontend)/globals.css` (thêm hiệu ứng `.fade-in`).

**Lưu ý khi sửa sau:**
- `Lightbox` dùng chung được cho chỗ khác (ví dụ ảnh trong bài viết): truyền `images`, `start`, `label`, `onClose`.
- `Lightbox` render qua portal vào `body`. Nếu render bên trong phần tử có `transform` (như `.tab-fade`), lớp phủ `fixed` sẽ bị kẹt trong phần tử đó.
- `next.config.ts` chỉ cho chất lượng ảnh 75, 80, 85, 100. Đặt `quality` khác sẽ lỗi.

**Kiểm tra:** test mới ở `products.spec.ts`: "bấm ảnh chính mở ảnh phóng to, Esc đóng lại". Đã thử bằng tay trên 1440px và 390px.

### Quy ước ghi nhật ký

Thêm file này. `CLAUDE.md` có thêm quy ước: mọi thay đổi code phải ghi vào đây.
