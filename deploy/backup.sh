#!/usr/bin/env bash
# Sao lưu database và thư mục ảnh hằng ngày, giữ 14 ngày.
# Cài: chmod +x deploy/backup.sh && crontab -e  ->  30 2 * * * /var/www/thanhvinhmetal/deploy/backup.sh >> /var/log/thanhvinh/backup.log 2>&1
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/thanhvinhmetal}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/thanhvinh}"
KEEP_DAYS="${KEEP_DAYS:-14}"
DATE="$(date +%Y%m%d-%H%M)"

# Đọc DATABASE_URL từ .env
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$APP_DIR/.env" | cut -d= -f2- | tr -d '"')"

mkdir -p "$BACKUP_DIR"

echo "[$DATE] Sao lưu database..."
pg_dump "$DATABASE_URL" --no-owner --format=custom --file="$BACKUP_DIR/db-$DATE.dump"

echo "[$DATE] Sao lưu ảnh và tệp bản vẽ..."
tar -czf "$BACKUP_DIR/media-$DATE.tar.gz" -C "$APP_DIR" public/media uploads 2>/dev/null || tar -czf "$BACKUP_DIR/media-$DATE.tar.gz" -C "$APP_DIR" public/media

echo "[$DATE] Xóa bản cũ hơn $KEEP_DAYS ngày..."
find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete

echo "[$DATE] Xong. Dung lượng:"
du -sh "$BACKUP_DIR"

# Khôi phục: pg_restore --clean --no-owner -d "$DATABASE_URL" db-YYYYMMDD-HHMM.dump && tar -xzf media-....tar.gz -C /var/www/thanhvinhmetal
