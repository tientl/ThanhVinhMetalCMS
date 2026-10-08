# Triển khai lên VPS Ubuntu

Mục tiêu: 1 VPS Ubuntu 22.04/24.04 (2 CPU, 2 GB RAM trở lên), PostgreSQL, Nginx, SSL Let's Encrypt, PM2, swap 2 GB, sao lưu hằng ngày. Các file cấu hình mẫu nằm trong `deploy/`.

## 1. Chuẩn bị server

```bash
# Swap 2 GB
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Gói cơ bản
sudo apt update && sudo apt install -y nginx postgresql postgresql-contrib git curl build-essential certbot python3-certbot-nginx

# Node 22 LTS + pnpm + PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pnpm pm2
```

## 2. Database

```bash
sudo -u postgres psql -c "CREATE USER thanhvinh WITH PASSWORD 'MAT_KHAU_MANH';"
sudo -u postgres psql -c "CREATE DATABASE thanhvinh OWNER thanhvinh;"
```

## 3. Mã nguồn

```bash
sudo mkdir -p /var/www/thanhvinhmetal /var/log/thanhvinh && sudo chown -R $USER /var/www/thanhvinhmetal /var/log/thanhvinh
git clone git@github.com:<org>/ThanhVinhMetalCMS.git /var/www/thanhvinhmetal
cd /var/www/thanhvinhmetal
cp .env.example .env   # rồi sửa: DATABASE_URL, PAYLOAD_SECRET (openssl rand -hex 32), NEXT_PUBLIC_SERVER_URL=https://thanhvinhmetal.vn, SMTP_*
pnpm install --frozen-lockfile
pnpm build
pnpm seed               # chỉ lần đầu, tạo admin và dữ liệu mẫu
pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
```

## 4. Nginx và SSL

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/thanhvinhmetal
sudo ln -s /etc/nginx/sites-available/thanhvinhmetal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d thanhvinhmetal.vn -d www.thanhvinhmetal.vn
```

## 5. Sao lưu hằng ngày

```bash
crontab -e
# 30 2 * * * /var/www/thanhvinhmetal/deploy/backup.sh >> /var/log/thanhvinh/backup.log 2>&1
```

Bản sao lưu nằm ở `/var/backups/thanhvinh`, giữ 14 ngày. Nên đồng bộ thêm thư mục này ra ngoài VPS (rclone lên Google Drive) để an toàn.

## 6. Cập nhật bản mới

Gộp vào `main` thì GitHub Actions (`.github/workflows/ci.yml`) tự SSH vào VPS chạy `deploy/deploy.sh`. Cần khai báo secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` trong repo. Chạy tay: `bash deploy/deploy.sh`.

## 7. Email yêu cầu báo giá

Điền `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` trong `.env`. Với Gmail: bật xác minh 2 bước, tạo "Mật khẩu ứng dụng", `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`. Email nhận đặt trong admin: Thông tin công ty > Liên hệ > Email nhận yêu cầu báo giá. Khi chưa có SMTP, nội dung email được ghi ra log PM2.

## 8. GA4 và Search Console

Admin > Thông tin công ty > tab Theo dõi: dán `G-XXXX` và mã xác minh Search Console. Sitemap: `https://thanhvinhmetal.vn/sitemap.xml`.
