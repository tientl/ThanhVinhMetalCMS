# Nhật ký thay đổi

Mỗi lần sửa code thì thêm một mục vào đầu file, commit cùng với code. Mỗi mục ghi: **làm gì, vì sao, file nào, cách kiểm tra, lưu ý cho người sửa sau**. Thay đổi trước ngày 11/10/2026 xem `git log`.

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
