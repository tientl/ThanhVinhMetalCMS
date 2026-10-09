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
- Tiêu đề: **Playfair Display** 500, in hoa, letter-spacing 1.5–2px. Hero 58px, khối 40px, ô bộ sưu tập 46px, ô ảnh nhỏ 24–30px, thẻ bài viết 20px (không in hoa).
- Thân: **Be Vietnam Pro** 300/400/500/600. Đoạn 17px/1.8, thẻ 15px, nhãn 11px letter-spacing 2.5px in hoa.
- Menu: 12px, 500, letter-spacing 1.6px, in hoa.
- Google Fonts: Be Vietnam Pro + Playfair Display, subset vietnamese.

## Khoảng cách
Khối: padding 128px dọc, 64px ngang. Lưới sản phẩm 3 cột gap 28. Thẻ bài viết 4 cột gap 28. Nút cao 52px, padding 0 30px, viền 1px accent, chữ 12.5px letter-spacing 2px; hover: nền accent, chữ tối.

## Header (cố định khi cuộn)
- Cao 80px, nền `rgba(18,20,24,.55)` + `backdrop-filter: blur(10px)`, không viền. Khi mở menu hoặc tìm kiếm: nền đặc #0B0D10, viền dưới #2A2D30.
- Lưới 3 cột `1fr auto 1fr`: trái = icon trang chủ + Bộ sưu tập, Về Vinh Metal, Sản phẩm, Giải pháp, Dự án; giữa = logo 70px (chỉ huy hiệu, không chữ); phải = Kiến thức, Catalogue, Tin tức, Tuyển dụng, icon tìm kiếm, nút sáng/tối. (Đã bỏ VI | EN ngày 08/10/2026 theo yêu cầu.)
- Sản phẩm, Giải pháp, Catalogue là nút mở **mega menu** (panel ngay dưới header, nền surface, có nút Đóng, đóng khi bấm ra ngoài hoặc Esc). Gạch chân 1px accent khi hover hoặc đang mở.
- Icon tìm kiếm mở **overlay tìm kiếm** dưới header: ô nhập 34px light, gợi ý nhanh dạng chip viền.
- Mobile: hamburger mở menu ngăn kéo; thanh cố định đáy có Gọi, Zalo, Báo giá.

## Trang chủ, 8 khối theo thứ tự
1. **Slider** 860px toàn màn hình, 3 ảnh, tự chuyển 5.5s, crossfade 1.8s, ảnh active scale 1→1.08 trong 9s. Chữ trái dưới: tiêu đề serif, mô tả, nút viền "Khám phá ngay". Phải dưới: số `01 / 03` + 2 nút mũi tên. Đáy: 3 thanh tiến trình, thanh active chạy 5.5s.
2. **Bộ sưu tập**: 2 ô ảnh 680px sát nhau, tràn ngang, overlay tối từ dưới, viền mảnh accent lùi 18px, nhãn nhỏ + tiêu đề + mô tả + "Khám phá ngay" góc dưới trái. Nội dung từ admin.
3. **Giới thiệu**: 2 cột; trái: câu khẩu hiệu, "Thành lập năm …", tiêu đề, 2 đoạn, nút; phải: ảnh 560px với ô accent "CẮT, CHẤN, HÀN, SƠN" lệch ra ngoài 40px.
4. **Giải pháp**: tiêu đề + mô tả; 2 ô ảnh 520px overlay chữ.
5. **Ứng dụng theo công trình** (nền deep): 4 tab; trái ảnh 540px có tối đa 5 điểm chấm (nới từ 3 ngày 09/10/2026) (vòng accent viền trắng, nhấp nháy, nhãn chip trắng); phải tiêu đề, mô tả, 4 sản phẩm thumbnail 72px, nút "Xem tất cả sản phẩm". Vị trí điểm chấm đặt bằng chuột trong admin.
6. **Sản phẩm theo danh mục**: lưới 3×2, ảnh 4:3, tên in hoa + "XEM SẢN PHẨM".
7. **Kiến thức và tin tức**: 4 thẻ ảnh 230px, nhãn danh mục accent-text, tiêu đề serif, "Đọc thêm".
8. **Liên hệ**: trái form (Họ tên*, Email*, Điện thoại*, Công ty, Nội dung, nút "Gửi yêu cầu"); phải panel surface: logo, tên công ty, hotline, email, địa chỉ, MST, mạng xã hội, ô đăng ký bản tin.
Footer: 3 cột (logo + địa chỉ, hotline, email, giờ làm; link chính sách; bản đồ Google Maps nhỏ 300×200 tải trễ), © năm. (Thêm bản đồ ngày 09/10/2026.)
Nút nổi góc phải dưới: về đầu trang (hiện khi cuộn > 500px), Zalo, gọi.

## Hiệu ứng
- Ảnh trong ô có class zoom: hover scale 1.04, 1.4s.
- Khối hiện dần khi cuộn: opacity 0 → 1, translateY 28px → 0, 0.9s, IntersectionObserver, rootMargin -8%.
- Tab và slide: nội dung mới fade-up 0.6–0.9s.
- `prefers-reduced-motion: reduce` tắt toàn bộ.

## Trang con (Dev B thiết kế tuần 1, cùng ngôn ngữ hình ảnh)
Danh sách sản phẩm theo danh mục, chi tiết sản phẩm, danh sách bài viết, chi tiết bài viết, giới thiệu, liên hệ, chính sách, 404, trang kết quả tìm kiếm, bản điện thoại.
