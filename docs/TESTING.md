# Kiểm thử

Bộ test phủ cả backend (Payload, phân quyền, API) và giao diện (trang, form, tìm kiếm, responsive, admin).

| Nhóm | Công cụ | Chạy gì | Số test |
|---|---|---|---|
| unit | Vitest | Hàm thuần: bỏ dấu, slug, định dạng, ảnh, màu, rate limit | 48 |
| int | Vitest + Payload Local API | Collection, phân quyền, `src/lib/data.ts`, 3 API route | 79 |
| e2e | Playwright (Chromium) | Trang thật trong trình duyệt, cả desktop và điện thoại | 73 |

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

Các file int tự dọn bản ghi mình tạo (tiền tố `Zz`) ở `beforeAll` nên chạy lại nhiều lần vẫn đúng.

## E2E chạy tách biệt

E2E không đụng `pnpm dev` đang chạy:

- cổng **3100** (dev dùng 3000), đổi bằng `E2E_PORT`
- thư mục build **`.next-e2e`** (dev dùng `.next`), nhờ `distDir` trong `next.config.ts`
- database `thanhvinh_test`

Playwright tự chạy `pnpm build && pnpm start`. Ở máy local nếu đã có server ở 3100 thì dùng lại (`reuseExistingServer`), trên CI luôn dựng mới.

### Bốn project

| Project | Chạy file | Ghi chú |
|---|---|---|
| `setup` | `auth.setup.ts` | Đăng nhập admin một lần, lưu cookie vào `playwright/.auth/admin.json` |
| `desktop` | tất cả trừ `responsive`, `admin` | Chrome desktop |
| `admin` | `admin.spec.ts` | Dùng cookie từ `setup`; nhóm "chưa đăng nhập" tự xóa cookie |
| `mobile` | `responsive.spec.ts` | Pixel 7 |

Đăng nhập một lần thay vì mỗi test một lần, vì nhiều phiên đăng nhập song song cùng tài khoản gây lỗi chập chờn.

### Rate limit

`/api/quote` và `/api/subscribe` chặn sau 5 lần mỗi IP mỗi giờ, tính trong bộ nhớ tiến trình. Test nào gửi form thì gọi `useOwnRateLimitBucket()` (`tests/e2e/rate-limit.ts`) để gắn một IP giả riêng qua `X-Forwarded-For`, nhờ vậy chạy lại hay retry đều không bị chặn. Nhóm int cũng đổi IP theo từng test vì lý do tương tự.

## Viết thêm test

- Dữ liệu mẫu đến từ `src/seed/`. Test nên tìm bản ghi qua truy vấn thay vì gán cứng id.
- Tạo sản phẩm trong test cần `name`, `category` và ít nhất một ảnh; bài viết cần thêm `cover` và `content`; trang tĩnh cần `content`. Dùng `richText()` trong `src/seed/lexical.ts` cho field richText.
- Field `related` có `filterOptions` dựa trên id của chính document nên không gán được lúc tạo; tạo trước rồi `update` sau, đúng như thao tác trong admin.
- Payload kiểm tra cấu trúc thật của tệp upload. Dùng `tests/int/fixtures.ts` thay vì chuỗi giả.
- Trong E2E, `[role="alert"]` còn khớp route announcer của Next; bọc trong `form [role="alert"]`.
- Menu chính lấy từ global Điều hướng và dùng mega menu (thẻ `button`), không có liên kết `/san-pham` cố định trong header.

## CI

`.github/workflows/ci.yml` chạy ba job song song: `check` (lint, typecheck, build), `test` (unit + int) và `e2e`. Job `deploy` chỉ chạy khi cả ba xanh. Báo cáo Playwright được tải lên artifact `playwright-report`.
