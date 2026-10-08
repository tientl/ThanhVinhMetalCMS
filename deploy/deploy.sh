#!/usr/bin/env bash
# Cập nhật bản mới trên VPS: git pull, cài, build, khởi động lại PM2.
set -euo pipefail
cd "${APP_DIR:-/var/www/thanhvinhmetal}"
git pull --ff-only
pnpm install --frozen-lockfile --prod=false
pnpm build
pm2 reload thanhvinh-web --update-env
pm2 save
