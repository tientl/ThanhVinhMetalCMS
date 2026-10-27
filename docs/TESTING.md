# Kiểm thử

Bộ test phủ cả backend (Payload, phân quyền, API) và giao diện (trang, form, tìm kiếm, responsive, admin).

| Nhóm | Công cụ | Chạy gì | Số test |
|---|---|---|---|
| unit | Vitest | Hàm thuần: bỏ dấu, slug, định dạng, ảnh, màu, rate limit, so sánh phiên bản, vùng ảnh muốn giữ | 77 |
| int | Vitest + Payload Local API | Collection, phân quyền, `src/lib/data.ts`, 4 API route, kênh realtime, lịch sử phiên bản, bản nháp không lên web, khôi phục bản nháp, quyền Nhân viên, chặn lưu đè bản cũ | 125 |
| e2e | Playwright (Chromium) | Trang thật trong trình duyệt, cả desktop và điện thoại, quyền Nhân viên, ô slug trong admin, chữ dài không tràn, slider dừng khi rê chuột, vùng ảnh muốn giữ, mở trang ở hai tab, nhãn điểm chấm không bị cắt và không đè nhau, ảnh chia sẻ mở được, menu mobile không bị thanh đáy che, màn 320px không tràn ngang, nút chia sẻ Facebook mở một cửa sổ | 123 |

## Chạy

```bash
docker compose up -d        # cần PostgreSQL

pnpm test                   # unit + int
pnpm test:unit              # chỉ unit, không cần database
pnpm test:int               # chỉ int
pnpm test:watch             # unit ở chế độ watch khi đang code
pnpm test:e2e               # e2e (tự nạp database rồi build và chạy web server)
pnpm test:all               # tất cả
```

Máy còn ít RAM (khoảng 2 GB trống), `next build` và Playwright chạy song song nhiều tiến trình có thể hết bộ nhớ (`JavaScript heap out of memory`, server test sập giữa chừng). Giảm số tiến trình:

```bash
CIRCLE_NODE_TOTAL=4 pnpm test:e2e --workers=2   # build 3 tiến trình, 2 trình duyệt
```

Lần đầu chạy e2e cần tải trình duyệt:

```bash
pnpm exec playwright install chromium
```

## Database test

Test **không** dùng database dev. `tests/setup/database-url.ts` lấy `DATABASE_URL` trong `.env` rồi đổi tên database thành `<tên>_test` (mặc định `thanhvinh_test`). Đặt `TEST_DATABASE_URL` nếu muốn trỏ chỗ khác.

Trước mỗi lần chạy, `tests/setup/prepare-database.ts` xóa và tạo lại database đó rồi gọi `pnpm seed`, nên test luôn chạy trên đúng bộ dữ liệu mẫu. Muốn giữ lại database cho nhanh khi đang sửa test:

```bash
TEST_DB_REUSE=1 pnpm test:int
```

Các file int chạy tuần tự (`fileParallelism: false` ở **cấp gốc** `vitest.config.mts`; Vitest 3 bỏ qua nếu đặt trong project) và tự dọn bản ghi mình tạo (tiền tố `Zz`) ở `beforeAll` nên chạy lại nhiều lần vẫn đúng.

## E2E chạy tách biệt

E2E không đụng `pnpm dev` đang chạy:

- cổng **3100** (dev dùng 3000), đổi bằng `E2E_PORT`
- thư mục build **`.next-e2e`** (dev dùng `.next`), nhờ `distDir` trong `next.config.ts`
- database `thanhvinh_test`

Playwright tự chạy `pnpm build && pnpm start`. Ở máy local nếu đã có server ở 3100 thì dùng lại (`reuseExistingServer`), trên CI luôn dựng mới.

### Các project

| Project | Chạy file | Ghi chú |
|---|---|---|
| `setup` | `auth.setup.ts` | Đăng nhập admin một lần, lưu cookie vào `playwright/.auth/admin.json` |
| `desktop` | tất cả trừ `responsive`, `admin`, `editor` | Chrome desktop 1440×900 (bề ngang thiết kế gốc); laptop 1280, 1366 có test riêng trong `theme-nav.spec.ts` |
| `admin` | `admin.spec.ts` | Dùng cookie từ `setup`; nhóm "chưa đăng nhập" tự xóa cookie |
| `mobile` | `responsive.spec.ts` | Pixel 7 |
| `setup-editor` | `editor.setup.ts` | Tạo tài khoản Nhân viên `editor.e2e@thanhvinhmetal.vn` qua REST bằng quyền Quản trị (nếu chưa có), đăng nhập, lưu cookie vào `playwright/.auth/editor.json` |
| `editor` | `editor.spec.ts` | Dùng cookie Nhân viên: có nút Xuất bản, menu không có mục chỉ Quản trị, sửa được thông tin trong chi tiết yêu cầu báo giá |

Đăng nhập một lần thay vì mỗi test một lần, vì nhiều phiên đăng nhập song song cùng tài khoản gây lỗi chập chờn.

### Rate limit

`/api/quote` chặn sau 5 lần mỗi IP mỗi giờ, tính trong bộ nhớ tiến trình. Test nào gửi form thì gọi `useOwnRateLimitBucket()` (gửi qua page) hoặc `randomIp()` (gửi thẳng bằng fixture `request`) trong `tests/e2e/rate-limit.ts` để gắn một IP giả riêng qua `X-Forwarded-For`, nhờ vậy chạy lại hay retry đều không bị chặn. Nhóm int cũng đổi IP theo từng test vì lý do tương tự.

## Viết thêm test

- Dữ liệu mẫu đến từ `src/seed/`. Test nên tìm bản ghi qua truy vấn thay vì gán cứng id.
- Tạo sản phẩm trong test cần `name`, `category` và ít nhất một ảnh; bài viết cần thêm `cover` và `content`; trang tĩnh cần `content`. Dùng `richText()` trong `src/seed/lexical.ts` cho field richText.
- Field `related` có `filterOptions` dựa trên id của chính document nên không gán được lúc tạo; tạo trước rồi `update` sau, đúng như thao tác trong admin.
- Payload kiểm tra cấu trúc thật của tệp upload. Dùng `tests/int/fixtures.ts` thay vì chuỗi giả.
- Trong E2E, `[role="alert"]` còn khớp route announcer của Next; bọc trong `form [role="alert"]`.
- Test sửa dữ liệu Trang chủ (ghi global `home`) đặt trong nhóm 'Trang chủ: các test sửa dữ liệu' của `admin.spec.ts` (`mode: 'serial'`). Chạy song song thì lần lưu của test này làm form đang mở của test kia thành bản cũ và bị `rejectStaleSave` chặn. Test mới sửa Trang chủ thì thêm vào nhóm đó.
- Trang người xem có `html { scroll-behavior: smooth }`. Playwright cuộn tới phần tử trước khi `hover`/`click`; trang còn đang trượt thì phần tử trôi khỏi con trỏ, sinh sự kiện rời chuột giả. Test cần giữ chuột yên trên phần tử thì `page.addStyleTag({ content: 'html { scroll-behavior: auto !important }' })` rồi `page.mouse.move` tới tâm `boundingBox()` (xem test slider trong `home.spec.ts`).
- Menu chính lấy từ global Điều hướng và dùng mega menu (thẻ `button`), không có liên kết `/san-pham` cố định trong header.

## CI

`.github/workflows/ci.yml` chạy ba job song song: `check` (lint, typecheck, build), `test` (unit + int) và `e2e`. Job `deploy` chỉ chạy khi cả ba xanh. Báo cáo Playwright được tải lên artifact `playwright-report`.
