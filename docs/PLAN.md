# Kế hoạch 4 tuần, 2 dev chạy song song

Cập nhật 08/10/2026: nền tảng, mô hình dữ liệu, toàn bộ giao diện và form đã dựng xong trên local với dữ liệu mẫu (các mục tick bên dưới). Chưa làm: việc của Bạn với khách, VPS thật, GA4/Search Console (cần ID của khách), test thiết bị thật, video hướng dẫn, logo SVG (chưa có tv.pdf).

Checklist tick được: https://claude.ai/artifact/NA5JMf9hAbQPii5oJR3kvy

Bạn = quản lý dự án, làm việc với khách. Dev A = backend, Payload, server. Dev B = giao diện.

## Tuần 1: Chốt nội dung, dựng nền, thống nhất cấu trúc dữ liệu, khung giao diện Mẫu 3

- [ ] **Bạn**: Nhận cọc đợt 1 (4.000.000đ), khách ký báo giá Mẫu 3
- [ ] **Bạn**: Gửi khách danh sách nội dung cần cung cấp, kèm hạn — Ảnh xưởng và sản phẩm (nên nền tối), danh mục và sản phẩm thật, email, địa chỉ mới, Fanpage, Zalo
- [ ] **Bạn**: Chốt với khách cấu trúc menu, 3 mega menu và danh mục sản phẩm — Để Dev A khai báo dữ liệu đúng ngay từ đầu
- [ ] **Bạn**: Đăng ký tên miền và VPS đứng tên khách
- [x] **Dev A**: Tạo repo GitHub, chạy create-payload-app với template website
- [x] **Dev A**: Chạy PostgreSQL bằng Docker trên máy
- [x] **Dev A**: Cấu hình .env, ESLint, Prettier, quy ước nhánh Git — Mỗi tính năng một nhánh, mở PR để người kia review
- [x] **Dev A**: Đổi admin sang tiếng Việt, gắn logo, xóa phần thừa của template
- [x] **Dev A**: Users: phân quyền admin và nhân viên
- [x] **Dev A**: Media: các cỡ ảnh nhỏ, vừa, lớn; bắt buộc mô tả ảnh
- [x] **Dev A**: Danh mục sản phẩm
- [x] **Dev A**: Sản phẩm — Tên, nhiều ảnh, danh mục, mô tả, vật liệu, quy cách, giá mặc định "Liên hệ", nổi bật, SEO
- [x] **Dev A**: Danh mục bài viết và Bài viết có lưu nháp — Kiến thức, Tin tức, Tuyển dụng
- [x] **Dev A**: Trang tĩnh, Yêu cầu báo giá, Đăng ký bản tin
- [x] **Dev A**: Global Thông tin công ty — Logo, hotline, Zalo, email, địa chỉ, mã số thuế, Fanpage, bản đồ
- [x] **Dev A**: Global Menu, Mega menu và Trang chủ — Slider, 2 bộ sưu tập, giới thiệu, giải pháp, 4 tab ứng dụng với điểm chấm cố định, nhóm sản phẩm hiển thị
- [x] **Dev A**: Xuất kiểu dữ liệu TypeScript, gửi Dev B **(mốc quan trọng)** — Hạn chót hết ngày thứ 3. Dev B dựng giao diện bằng dữ liệu giả cùng cấu trúc
- [ ] **Dev B**: Chuyển logo từ tv.pdf sang SVG
- [x] **Dev B**: Thiết kế các trang còn lại theo Mẫu 3 — Danh mục, chi tiết sản phẩm, bài viết, giới thiệu, liên hệ, bản điện thoại
- [x] **Dev B**: Khai báo màu đỏ chủ đạo, font Playfair Display và Be Vietnam Pro, khoảng cách chung
- [x] **Dev B**: Header trong suốt, logo giữa 70px, đổi sang nền đặc khi mở menu
- [x] **Dev B**: Footer, nút Zalo, gọi, về đầu trang
- [x] **Dev B**: Khối dùng chung — Thẻ sản phẩm, thẻ bài viết, ô ảnh viền đỏ mảnh, tiêu đề serif, breadcrumb, phân trang

## Tuần 2: Đủ các trang với dữ liệu giả, mega menu, tìm kiếm, có bản chạy thử trên server

- [ ] **Bạn**: Khách duyệt giao diện các trang, thu đợt 2 (3.000.000đ)
- [x] **Dev A**: Hook tạo slug không dấu, làm mới cache khi đăng hoặc sửa
- [x] **Dev A**: Nhập dữ liệu mẫu theo demo
- [x] **Dev A**: Hàm lấy dữ liệu cho giao diện **(mốc quan trọng)** — Sản phẩm theo danh mục, chi tiết, liên quan, bài viết, tìm kiếm sản phẩm và bài viết không dấu
- [ ] **Dev A**: Cài VPS chạy bản thử: Ubuntu, Node LTS, PostgreSQL, Nginx, SSL, PM2, swap — Để khách xem được tiến độ từ tuần 2
- [x] **Dev A**: Bài viết: danh sách theo danh mục, chi tiết, bài liên quan — Dùng các khối giao diện của Dev B
- [x] **Dev A**: Giới thiệu, Liên hệ, các trang chính sách, trang 404 — Dùng các khối giao diện của Dev B
- [x] **Dev B**: Bản điện thoại: menu ngăn kéo, thanh Gọi, Zalo, Báo giá ở cuối màn hình
- [x] **Dev B**: Trang chủ Mẫu 3 — Slider tự chạy, 2 bộ sưu tập, giới thiệu, giải pháp, 4 tab ứng dụng có điểm chấm, danh mục, kiến thức và tin tức, liên hệ
- [x] **Dev B**: 3 mega menu: Sản phẩm, Giải pháp, Catalogue — Mở bằng bấm, đóng khi bấm ra ngoài hoặc nhấn Esc
- [x] **Dev B**: Ô tìm kiếm toàn trang và trang kết quả
- [x] **Dev B**: Trang tất cả sản phẩm và trang theo danh mục có phân trang
- [x] **Dev B**: Trang chi tiết sản phẩm — Bộ ảnh, thông số, nút Gọi, Zalo, Yêu cầu báo giá, sản phẩm liên quan
- [x] **Dev B**: Hiệu ứng: chuyển ảnh mờ dần, phóng ảnh khi rê chuột, hiện dần khi cuộn — Tắt khi người dùng bật giảm chuyển động

## Tuần 3: Nối dữ liệu thật, form báo giá, bản tin, SEO

- [x] **Dev A**: Xử lý form: kiểm tra dữ liệu, nhận file DXF, DWG, PDF, ảnh tối đa 10 MB
- [x] **Dev A**: Chống spam: trường bẫy bot, giới hạn số lần gửi
- [x] **Dev A**: Lưu yêu cầu vào admin, gửi email cho Mr Vinh qua SMTP
- [x] **Dev A**: Đăng ký bản tin: lưu email vào admin, chặn trùng
- [x] **Dev A**: Metadata từng trang, ảnh khi chia sẻ, sitemap, robots.txt
- [x] **Dev A**: Dữ liệu cấu trúc LocalBusiness và Product
- [ ] **Dev A**: Gắn GA4, xác minh Search Console
- [x] **Dev A**: Deploy tự động bằng GitHub Actions — Không bắt buộc
- [x] **Dev A**: Sao lưu hằng ngày database và thư mục ảnh, giữ 7–14 ngày
- [x] **Dev B**: Nối các trang với dữ liệu thật thay dữ liệu giả — Cần xong trước: hàm lấy dữ liệu của Dev A
- [x] **Dev B**: Giao diện form báo giá và ô bản tin, thông báo gửi thành công hoặc lỗi — Ghép với phần xử lý của Dev A
- [x] **Dev B**: Tối ưu ảnh bằng next/image, font chỉ tải bộ tiếng Việt
- [ ] **Dev B**: Lighthouse trên điện thoại từ 90 trở lên

## Tuần 4: Kiểm thử, triển khai thật, bàn giao

- [ ] **Bạn**: Khách nhập nội dung thật — Dev chỉ hỗ trợ dữ liệu mẫu
- [ ] **Bạn**: Gom góp ý của khách, tối đa 3 vòng
- [ ] **Bạn**: Bàn giao tài khoản admin, kho GitHub, VPS, tên miền
- [ ] **Bạn**: Thu đợt 3 (3.000.000đ)
- [ ] **Dev A**: Đi thử các thao tác admin bằng tài khoản nhân viên — Đăng sản phẩm, đăng bài, thay slider, sửa menu, sửa hotline
- [ ] **Dev A**: Thử form, kiểm tra email có vào thư rác không
- [ ] **Dev A**: Cho khách xem bản thử, rồi trỏ tên miền thật
- [ ] **Dev A**: Quay video hướng dẫn dùng admin
- [ ] **Dev B**: Responsive ở 360, 390, 768, 1024, 1440px
- [ ] **Dev B**: Thử trên Safari iPhone và Chrome Android
- [ ] **Dev B**: Rà link hỏng, ảnh thiếu mô tả, mega menu và tìm kiếm trên điện thoại
- [ ] **Dev A + Dev B**: Sửa theo góp ý của khách — Lỗi giao diện giao Dev B, lỗi dữ liệu và server giao Dev A

## Cách chạy song song
1. Dev A chốt cấu trúc dữ liệu và commit `payload-types.ts` trước hết ngày thứ 3.
2. Dev B dựng giao diện bằng mock data đúng kiểu đó, không chờ backend.
3. Mỗi tính năng một nhánh Git, người kia review rồi mới gộp. `main` tự lên bản thử.
4. Họp nhanh 15 phút mỗi sáng.
5. Mọi thứ ngoài `docs/SCOPE.md` để sang giai đoạn 2.