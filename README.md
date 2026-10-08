# ThanhVinhMetalCMS – Website Thành Vinh Metal

Next.js 16 (App Router) + Payload CMS 3 + PostgreSQL. Giao diện theo Mẫu 3 đã duyệt (nền tối, đỏ chủ đạo). Phạm vi, thiết kế, mô hình dữ liệu và kế hoạch ở `docs/`.

## Chạy local

Yêu cầu Node 22 LTS, pnpm, Docker.

```bash
cp .env.example .env          # sửa PAYLOAD_SECRET
docker compose up -d          # PostgreSQL 16 tại localhost:5440
pnpm install
pnpm seed                     # tạo admin + dữ liệu mẫu (ADMIN_EMAIL, ADMIN_PASSWORD trong env để đổi)
pnpm dev                      # http://localhost:3000, admin http://localhost:3000/admin
```

Tài khoản mẫu: `admin@thanhvinhmetal.vn` / `ThanhVinh@2026`. Đổi mật khẩu sau khi đăng nhập. Nạp lại dữ liệu mẫu từ đầu: `SEED_RESET=1 pnpm seed`.

## Lệnh

| Lệnh | Việc |
|---|---|
| `pnpm dev` | chạy dev |
| `pnpm build && pnpm start` | build và chạy production |
| `pnpm generate:types` | sinh `src/payload-types.ts` sau khi sửa collection/global |
| `pnpm generate:importmap` | sinh import map admin sau khi thêm component admin |
| `pnpm lint`, `pnpm typecheck` | kiểm tra |
| `pnpm seed` | nạp dữ liệu mẫu |

## Cấu trúc

```
src/
  payload.config.ts      cấu hình Payload (admin tiếng Việt, logo, email SMTP)
  collections/           products, product-categories, posts, post-categories, pages, media, quote-requests, quote-files, subscribers, users
  globals/               home, navigation, site-settings
  access/                phân quyền admin / editor
  fields/                slug không dấu, searchText, SEO tab, richText
  hooks/revalidate.ts    làm mới cache Next khi đăng/sửa
  seed/                  dữ liệu mẫu
  lib/data.ts            hàm lấy dữ liệu cho giao diện (getHome, getProducts, search...)
  app/(frontend)/        trang người dùng: /, /san-pham, /san-pham/danh-muc/[slug], /san-pham/[slug], /bai-viet..., /lien-he, /tim-kiem, /[slug]
  app/(frontend)/api/    quote (form báo giá), subscribe (bản tin), search
  app/(payload)/         admin và REST API của Payload
  components/            layout (header, footer, nút nổi), home (8 khối), ui, forms
deploy/                  nginx.conf, ecosystem PM2, backup.sh, deploy.sh
docs/                    SCOPE, DESIGN, DATA-MODEL, PLAN, DEPLOY
```

## Quy ước

- Tên code tiếng Anh, nhãn trong admin tiếng Việt.
- Mỗi tính năng một nhánh, mở PR để người kia review. `main` tự deploy lên bản thử qua GitHub Actions.
- Không thêm tính năng ngoài `docs/SCOPE.md`.
- Ảnh upload nằm ở `public/media` (Nginx phục vụ trực tiếp), tệp bản vẽ khách gửi ở `uploads/quote-files` (chỉ admin tải qua API).

Triển khai lên VPS: xem `docs/DEPLOY.md`.
