/**
 * Dựng database test từ dòng lệnh: pnpm test:db
 * Dùng trước khi chạy Playwright, vì web server E2E cần dữ liệu sẵn.
 */
import { prepareDatabase } from './prepare-database'

await prepareDatabase()
