# Thiết kế – Mẫu 3 sang trọng, nền tối, đỏ chủ đạo

Nguồn chuẩn: `docs/design/mau-3-trang-chu.html` (mở bằng trình duyệt, viewport 1440). Mọi số đo dưới đây lấy từ file đó.

## Màu
| Token | Giá trị | Dùng cho |
|---|---|---|
| bg | #0B0D10 | nền trang |
| bg-alt | #111418 | khối xen kẽ (giới thiệu, danh mục, liên hệ) |
| surface | #15191E | panel, mega menu, ô form thông tin |
| deep | #07080A | khối ứng dụng tab, footer |
| ink | #F2EFE8 | chữ chính (trắng ngà) |
| muted | #B5B0A6 / #9C978E / #8F8A81 | chữ phụ 3 cấp |
| line | #2A2D30 | đường kẻ, viền input |
| accent | #E8411A | nút đặc, gạch chân menu, viền tab, điểm chấm, thanh tiến trình |
| accent-text | #FF6A45 | nhãn nhỏ phía trên tiêu đề, link, số đếm slider |
| accent-ghost | #FFB4A2 | chữ trên nút viền |
| accent-line | rgba(232,65,26,.45) | viền mảnh trong ảnh, hairline giữa khối (.25) |
| zalo | giữ nền kính tối + icon accent | nút Zalo nổi |

Chữ trên nền accent dùng #0B0D10 (tối), không dùng trắng. Logo giữ màu gốc.

## Chữ
- Chỉ dùng **một font không chân, Inter Tight** (từ 27/10/2026; Mẫu 3 gốc dùng Playfair Display cho tiêu đề và Be Vietnam Pro cho chữ thường, đã đổi theo yêu cầu). Inter Tight được chọn vì gần Forma DJR Micro (font khách muốn, font thương mại, cần mua giấy phép riêng nên không dùng). Trang admin vẫn dùng Be Vietnam Pro (`custom.scss`).
- Ngoại lệ: **menu giữ Be Vietnam Pro** theo yêu cầu (menu ngang, mega menu kể cả tiêu đề thẻ ảnh trong đó, menu điện thoại), class `font-menu` (token `--font-menu`) gắn ở gốc các vùng đó trong `HeaderClient.tsx`. Ô tìm kiếm mở từ header vẫn Inter Tight. Thêm vùng menu mới thì gắn `font-menu` ở gốc vùng.
- Tiêu đề: Inter Tight **600**, in hoa, letter-spacing 1.5–2px, class `.h-display`. Phải xuống dòng thì chia đều các dòng (`text-wrap: balance` trong `.h-display`), không để một chữ lẻ. Tiêu đề khối (`SectionHeading`) dùng hết bề ngang, chỉ đoạn mô tả giới hạn 720px. Hero 58px, khối 40px, ô bộ sưu tập 46px, ô ảnh nhỏ 24–30px, thẻ bài viết 20px (không in hoa).
- Thân: **Inter Tight** 300/400/500/600. Đoạn 17px/1.8, thẻ 15px, nhãn 11px letter-spacing 2.5px in hoa.
- Menu: 12px, 500, letter-spacing 1.6px, in hoa.
- Google Fonts: Inter Tight (font biến thiên, một file cho mọi độ đậm) và Be Vietnam Pro 300–700 cho menu, subset vietnamese, `next/font` tự tải về khi build. Token `--font-serif` đặt `initial` nên Tailwind không tạo class `font-serif`.
- Chữ khách nhập (tên, tóm tắt, tiêu đề, danh mục, nội dung bài) dùng `overflow-wrap: anywhere` (class `.h-display`, `.label-sm`, `.lead`, đoạn trong `.prose-lux`, hoặc utility `wrap-anywhere`): chuỗi liền dài hơn khung được ngắt giữa chữ thay vì tràn, chữ thường vẫn xuống dòng ở khoảng trắng. Thêm chỗ hiện chữ khách nhập mới thì nhớ gắn (25/10/2026).

## Khoảng cách
Khối: padding 128px dọc, 64px ngang. Lưới sản phẩm 3 cột gap 28. Thẻ bài viết 4 cột gap 28. Nút cao 52px, padding 0 30px, viền 1px accent, chữ 12.5px letter-spacing 2px; hover: nền accent, chữ tối.

## Bo góc (từ 27/10/2026)
Mẫu 3 gốc góc vuông; nay bo theo yêu cầu, qua 2 token trong `@theme` (`globals.css`):
- `--radius-btn` 8px (`rounded-btn`): mọi nút (`.btn-ghost`, `.btn-solid`, `.chip`, chip lọc danh mục, phân trang, chia sẻ, mạng xã hội, nút Đóng của mega menu, nút của ảnh phóng to, nút phóng to trên ảnh) và ảnh nhỏ (ảnh thu nhỏ bộ ảnh sản phẩm, ảnh 72px ở tab Ứng dụng).
- `--radius-card` 12px (`rounded-card`): ảnh thẻ sản phẩm, ảnh chính trang chi tiết, ảnh thẻ danh mục trang chủ, ảnh thẻ bài viết, ảnh và video YouTube trong nội dung bài viết, trang tĩnh, ảnh khối Giới thiệu trang chủ (ô accent "CẮT, CHẤN, HÀN, SƠN" bo `rounded-btn`), khung ảnh tab Ứng dụng, ô thông tin công ty ở khối Liên hệ. Thẻ liên kết "Mối quan hệ" trong nội dung và ảnh nhỏ của nó dùng `rounded-btn`.
- Ô nhập form báo giá (`.field`, cả ô nội dung và ô chọn tệp) `rounded-btn`; nút "Chọn tệp" bên trong `rounded-md` (6px).
- Chưa bo: khung ảnh lớn ở trang chủ (slider, bộ sưu tập, giải pháp), ảnh bìa mờ tràn màn hình ở đầu trang bài viết, thanh Gọi/Zalo/Báo giá ở đáy điện thoại. Nút tròn nổi (Zalo, gọi, lên đầu trang) vốn đã tròn.

## Tỉ lệ hiển thị (từ 11/10/2026)
Từ bề ngang 768px trở lên toàn trang phóng 110% (`zoom` trên `<html>`). Mọi số đo trong file này là số trong code; trên máy tính hiển thị thực tế lớn hơn 10%. Điện thoại giữ 100%. Các mốc đổi bố cục `md`, `lg`, `xl`, `2xl` nhân 1.1 theo; ví dụ menu ngang trên header hiện từ 1127px (trước 1024px). Chi tiết ở `docs/CHANGELOG.md`.

## Header (cố định khi cuộn)
- Cao 80px, nền `rgba(18,20,24,.55)` + `backdrop-filter: blur(10px)`, không viền. Khi mở menu hoặc tìm kiếm: nền đặc #0B0D10, viền dưới #2A2D30.
- Lưới 3 cột `1fr auto 1fr`: trái = icon trang chủ + Bộ sưu tập, Về Vinh Metal, Sản phẩm, Giải pháp, Dự án; giữa = logo 70px (chỉ huy hiệu, không chữ); phải = Kiến thức, Catalogue, Tin tức, Tuyển dụng, icon tìm kiếm, nút sáng/tối. (Đã bỏ VI | EN ngày 08/10/2026 theo yêu cầu.)
- Sản phẩm, Giải pháp, Catalogue là nút mở **mega menu** (panel ngay dưới header, nền surface, có nút Đóng, đóng khi bấm ra ngoài hoặc Esc). Gạch chân 1px accent khi hover hoặc đang mở.
- Icon tìm kiếm mở **overlay tìm kiếm** dưới header: ô nhập 34px light, gợi ý nhanh dạng chip viền.
- Mobile: hamburger mở menu ngăn kéo; thanh cố định đáy có Gọi, Zalo, Báo giá. Ngăn kéo chừa 64px ở đáy để nút cuối không bị thanh che. Dưới `lg`, logo co lại khi màn quá hẹp (320px) thay vì đẩy nút tìm kiếm, nút sáng/tối ra ngoài màn hình.
- Màn máy tính mà menu ngang không đủ chỗ (laptop hẹp, hoặc nhiều mục menu) cũng tự thu về hamburger như mobile; với dữ liệu mẫu, menu ngang hiện từ 1366px (11/10/2026).

## Trang chủ, 8 khối theo thứ tự
1. **Slider** 860px toàn màn hình, 3 ảnh, tự chuyển 5.5s, crossfade 1.8s, ảnh active scale 1→1.08 trong 9s. Chữ trái dưới: tiêu đề serif, mô tả, nút viền "Khám phá ngay". Phải dưới: số `01 / 03` + 2 nút mũi tên. Đáy: 3 thanh tiến trình, thanh active chạy 5.5s. Thanh chạy hết thì sang slide kế. Rê chuột lên khối chữ hoặc Tab tới nút thì thanh và slide đứng lại (để không bấm nhầm link slide sau). `prefers-reduced-motion` thì không tự chuyển.
2. **Bộ sưu tập**: 2 ô ảnh 680px sát nhau, tràn ngang, overlay tối từ dưới, viền mảnh accent lùi 18px, nhãn nhỏ + tiêu đề + mô tả + "Khám phá ngay" góc dưới trái. Nội dung từ admin.
3. **Giới thiệu**: 2 cột; trái: câu khẩu hiệu, "Thành lập năm …", tiêu đề, 2 đoạn, nút; phải: ảnh 560px với ô accent "CẮT, CHẤN, HÀN, SƠN" lệch ra ngoài 40px.
4. **Giải pháp**: tiêu đề + mô tả; 2 ô ảnh 520px overlay chữ.
5. **Ứng dụng theo công trình** (nền deep): 4 tab; trái ảnh 540px có tối đa 5 điểm chấm (nới từ 3 ngày 09/10/2026) (vòng accent viền trắng, nhấp nháy, nhãn chip trắng); phải tiêu đề, mô tả, 4 sản phẩm thumbnail 72px, nút "Xem tất cả sản phẩm". Vị trí điểm chấm đặt bằng chuột trong admin. Nhãn nằm bên phải chấm; chấm ở nửa phải ảnh thì nhãn lật sang trái. Nhãn dài thì xuống dòng trong phần còn lại của khung, không bị cắt (27/10/2026). Trên điện thoại (dưới 640px) nhãn nằm dưới hoặc trên chấm, tự chọn để các nhãn không đè nhau.
6. **Sản phẩm theo danh mục**: lưới 3×2, ảnh 4:3, tên in hoa + "XEM SẢN PHẨM".
7. **Kiến thức và tin tức**: 4 thẻ ảnh 230px, nhãn danh mục accent-text, tiêu đề đậm, "Đọc thêm".
8. **Liên hệ**: trái form (Họ tên*, Email*, Điện thoại*, Công ty, Nội dung, nút "Gửi yêu cầu"); phải panel surface: logo, tên công ty, hotline, email, địa chỉ, MST, mạng xã hội. (Ô đăng ký bản tin đã bỏ ngày 27/10/2026.)
Footer: 3 cột (logo + địa chỉ, hotline, email, giờ làm; link chính sách; bản đồ Google Maps nhỏ 300×200 tải trễ), © năm. (Thêm bản đồ ngày 09/10/2026.)
Nút nổi góc phải dưới: về đầu trang (hiện khi cuộn > 500px), Zalo, gọi.

## Hiệu ứng
- Ảnh trong ô có class zoom: hover scale 1.04, 1.4s.
- Khối hiện dần khi cuộn: opacity 0 → 1, translateY 28px → 0, 0.9s, IntersectionObserver, rootMargin -8%.
- Tab và slide: nội dung mới fade-up 0.6–0.9s.
- `prefers-reduced-motion: reduce` tắt toàn bộ.

## Trang con (Dev B thiết kế tuần 1, cùng ngôn ngữ hình ảnh)
Bề rộng nội dung (26/10/2026, khách chọn): bài viết, trang tĩnh, "Mô tả chi tiết" sản phẩm đều rộng hết khung (`.prose-wide`), kể cả đoạn chữ; đầu bài viết (breadcrumb, tiêu đề) thẳng mép trái với nội dung. Ảnh trong nội dung hiện cỡ thật, tối đa bằng khung (không ép 100% để ảnh nhỏ không bị phóng mờ). Đánh đổi: màn 1920 khoảng 190 ký tự/dòng (khuyến nghị đọc 50–90); muốn giới hạn lại thì đặt max-width ở `.prose-wide` trong globals.css. Lịch sử: 860px (bài viết), 1100px (chữ ở trang tĩnh) trước 26/10, xem CHANGELOG 25/10 đợt 2 và 26/10 đợt 5–6.

Danh sách sản phẩm theo danh mục, chi tiết sản phẩm, danh sách bài viết, chi tiết bài viết, giới thiệu, liên hệ, chính sách, 404, trang kết quả tìm kiếm, bản điện thoại.

Chi tiết sản phẩm, bộ ảnh (cập nhật 11/10/2026): ảnh chính 4:3 có viền mảnh accent và biểu tượng phóng to ở góc; ảnh thu nhỏ vuông, 4 cột trên điện thoại, 5 cột từ 640px. Bấm ảnh chính hoặc ảnh thu nhỏ mở xem ảnh lớn toàn màn hình (ảnh thu nhỏ mở thẳng ảnh đó, 12/10/2026): nền gần đen, ảnh gốc không cắt (cỡ `original`; trước 26/10 dùng nhầm cỡ `hero` đã cắt 2:1) vừa khung theo tỉ lệ, số `01 / 02` trên trái, nút Đóng trên phải, 2 nút mũi tên hai bên, tên sản phẩm dưới cùng. Chuyển bằng mũi tên, phím ← → hoặc vuốt; đóng bằng Esc, nút Đóng hoặc bấm ra ngoài ảnh.

Slider (cập nhật 13/10/2026): ảnh slide được Payload cắt sẵn về 2400×1200 (2:1) quanh điểm lấy nét khi tải lên. Trên desktop khung slider theo tỉ lệ 2:1, tối thiểu 600px, tối đa bằng chiều cao màn hình; điện thoại giữ 640px.

Ô ảnh trang chủ (cập nhật 27/10/2026): Bộ sưu tập, Giới thiệu, Giải pháp, Ứng dụng có "Vùng ảnh muốn giữ" chọn trong admin. Vùng luôn hiện trọn và to nhất có thể trong ô. Ô đổi tỉ lệ theo màn hình (máy tính ngang, điện thoại dọc), nên phần dư lấy thêm ảnh quanh vùng; ảnh luôn phủ kín ô, sát mép ảnh thì dừng ở mép. Khung chọn trong admin theo tỉ lệ ô trên máy tính: Bộ sưu tập 1:1, Giới thiệu 1.4, Giải pháp 4:3, Ứng dụng 1.6. Chưa chọn vùng thì ảnh phủ kín ô, căn theo điểm lấy nét. Khung đặt điểm chấm của tab Ứng dụng có tỉ lệ 1.6 và hiện đúng phần ảnh web hiện, để chấm khớp vị trí.
