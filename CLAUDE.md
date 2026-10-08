# ThanhVinhMetalCMS – Website Công ty TNHH Vinh Metal

Website giới thiệu doanh nghiệp và danh mục sản phẩm cho xưởng cắt laser, gia công kim loại tấm tại Thuận An, Bình Dương. Khách đã duyệt **Mẫu 3** (phong cách sang trọng, nền tối, màu đỏ chủ đạo). Gói đã chốt: **10.000.000đ, 9 hạng mục, 20–25 ngày làm việc**. Chi tiết ở `docs/`.

## Đọc trước khi làm
- `docs/SCOPE.md` – 9 hạng mục đã ký, những gì nằm ngoài gói (không làm).
- `docs/DESIGN.md` – màu, font, các khối trang chủ, hành vi header, menu, slider, hiệu ứng.
- `docs/DATA-MODEL.md` – collections và globals của Payload, field từng mục.
- `docs/PLAN.md` – 62 việc chia 4 tuần cho Dev A (backend) và Dev B (giao diện).
- `docs/design/mau-3-trang-chu.html` – giao diện mẫu đã duyệt, mở bằng trình duyệt để xem. Đây là nguồn chuẩn cho bố cục, màu, chữ, khoảng cách.
- `docs/design/images/` – logo PNG và ảnh minh họa dùng cho dữ liệu mẫu.

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind 4) + Payload CMS 3.90 (admin tại `/admin`, tiếng Việt) + PostgreSQL 16.
- Đã khởi tạo từ template **website** của create-payload-app, đã bỏ blocks/heros/form-builder/search plugin; chỉ giữ seo plugin.
- Chạy local: `docker compose up -d` (Postgres ở port **5440**), `pnpm seed` (admin `admin@thanhvinhmetal.vn` / `ThanhVinh@2026`), `pnpm dev`.
- Node 22 qua nvm (`~/.nvm`), máy có Node 18 hệ thống không đủ cho Payload 3. Trước lệnh pnpm: `export PATH="$HOME/.nvm/versions/node/v22.23.3/bin:$PATH"`.
- Sau khi sửa collection/global: `pnpm generate:types`. Thêm component admin: `pnpm generate:importmap`.
- Kiểm tra: `pnpm lint`, `pnpm typecheck`, `pnpm build`.
- Deploy: VPS Ubuntu, Nginx, SSL, PM2, swap 2 GB, backup hằng ngày. File mẫu trong `deploy/`, hướng dẫn `docs/DEPLOY.md`. CI ở `.github/workflows/ci.yml`.

## Cấu trúc đã có
- `src/collections/*`, `src/globals/*` theo `docs/DATA-MODEL.md`. Phân quyền `src/access/index.ts` (admin, editor).
- `src/fields/slug.ts` slug không dấu; `src/fields/searchText.ts` field ẩn không dấu cho tìm kiếm (gồm cả tên danh mục).
- `src/hooks/revalidate.ts`: `revalidatePath` khi đăng/sửa; globals làm mới toàn bộ layout.
- `src/lib/data.ts`: mọi truy vấn cho giao diện (React `cache`, Local API). Giao diện không gọi Payload trực tiếp.
- `src/app/(frontend)/api/{quote,subscribe,search}`: form báo giá (multipart, honeypot `website`, rate limit 5/IP/giờ, file ≤10 MB), bản tin, tìm kiếm JSON. Collection `quote-requests`, `quote-files`, `subscribers` không cho public create; route handler dùng `overrideAccess`.
- Tệp bản vẽ khách gửi lưu ở `uploads/quote-files` (ngoài public), chỉ admin/editor tải qua API.
- Giao diện: token màu/font trong `src/app/(frontend)/globals.css` (`@theme`), 8 khối trang chủ ở `src/components/home`, header client ở `src/components/layout/HeaderClient.tsx`.
- Admin tùy chỉnh trong `src/components/admin/`: `Nav/` thay menu bên trái (thứ tự nhóm cố định trong `GROUP_ORDER`/`ENTITY_ORDER`, huy hiệu số yêu cầu báo giá mới), `DashboardHeader` (lời chào, 4 ô thống kê, nút nhanh, qua `beforeDashboard`), `Avatar` chữ cái, `AdminThemeToggle` ở header, `CancelButton` cạnh nút Lưu, `ColorField` chọn màu. Style ở `src/app/(payload)/custom.scss`. Thêm component admin mới phải chạy `pnpm generate:importmap`.
- Chế độ sáng/tối: mặc định tối, nút chuyển ở header (`ThemeToggle`), lưu `localStorage.theme`, script trong `<head>` áp trước khi vẽ. Token sáng ở `:root[data-theme='light']`; vùng luôn tối dùng class `dark-zone`. Màu chủ đạo khách chọn trong admin (site-settings.accentColor), layout gắn biến CSS lên `<html>` qua `accentVars()` trong `src/lib/color.ts`.
- Ảnh: dùng `<Img media size>` (`src/components/ui/Img.tsx`), URL tĩnh `/media/...` qua `mediaUrl()`.
- Chụp màn hình kiểm tra responsive: script CDP trong lịch sử phiên (Chrome headless không cho cửa sổ dưới 500px, cần `Emulation.setDeviceMetricsOverride`).

## Quy ước
- Ngôn ngữ giao diện: tiếng Việt. Tên code (collection, field, component) bằng tiếng Anh.
- Mỗi tính năng một nhánh Git, PR để người kia review, `main` tự deploy lên bản thử.
- Dev A: backend, Payload, server, SEO kỹ thuật, form, email. Dev B: giao diện, trang, hiệu ứng, responsive.
- Mốc quan trọng: Dev A xuất `payload-types.ts` trước hết ngày 3; Dev B dựng giao diện bằng mock data đúng kiểu đó, không chờ backend.
- Không thêm tính năng ngoài `docs/SCOPE.md`. Khách xin thêm thì ghi vào giai đoạn 2.
- Không dùng ảnh, chữ, logo của web tham khảo (ancuong.com, cokhicuongphat.vn). Chỉ tham khảo bố cục.
- Slug tiếng Việt không dấu, tự sinh từ tiêu đề. Tìm kiếm phải ra kết quả khi gõ không dấu.
- Hiệu ứng tắt khi `prefers-reduced-motion`.

## Thông tin khách (dữ liệu thật)
- Thương hiệu: Thành Vinh Metal. Pháp nhân: Công ty TNHH Vinh Metal. MST 3702941317.
- Địa chỉ: Thửa đất 362, Tờ bản đồ C2, Khu phố Bình Phước A, Phường Bình Chuẩn, TP. Thuận An, Bình Dương (khách cần xác nhận địa chỉ theo đơn vị hành chính mới).
- Liên hệ: Mr Vinh, hotline/Zalo 0946.272.467. Email: chưa có, dùng placeholder.
- Logo: `docs/design/images/logo-thanh-vinh-metal.png` (gốc là bản vẽ CAD, có thể xuất SVG).
- Dịch vụ: cắt laser CNC, chấn gấp CNC, hàn và lắp ráp, kết cấu thép, gia công theo mẫu, sơn tĩnh điện. Sản phẩm mẫu: vách hoa văn, tấm đục lỗ, chữ và biển hiệu, vỏ tủ điện, mặt bích, bánh răng, pát liên kết.
- Ảnh trong `docs/design/images/` là ảnh minh họa tự tạo; sẽ thay bằng ảnh thật khi khách gửi.
