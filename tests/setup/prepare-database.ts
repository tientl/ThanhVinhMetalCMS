import { spawnSync } from 'node:child_process'

import { Client } from 'pg'

import { splitDatabaseUrl, testDatabaseUrl } from './database-url'

/**
 * Dựng lại database test từ đầu rồi nạp dữ liệu mẫu bằng chính `pnpm seed`,
 * nhờ vậy test chạy trên đúng bộ dữ liệu mà seed sinh ra.
 *
 * Bỏ qua bước dựng lại khi đặt TEST_DB_REUSE=1 (chạy test nhanh trong lúc code).
 */
export const prepareDatabase = async () => {
  const connectionString = testDatabaseUrl()
  const { adminUrl, database } = splitDatabaseUrl(connectionString)

  if (process.env.TEST_DB_REUSE === '1') {
    console.log(`[test] Dùng lại database ${database}`)
    return
  }

  const admin = new Client({ connectionString: adminUrl })
  try {
    await admin.connect()
  } catch (err) {
    throw new Error(
      `Không kết nối được PostgreSQL tại ${adminUrl}. Chạy \`docker compose up -d\` trước khi test.\n${String(err)}`,
    )
  }

  try {
    // WITH (FORCE) ngắt các kết nối còn treo, cần PostgreSQL 13 trở lên.
    await admin.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`)
    await admin.query(`CREATE DATABASE "${database}"`)
  } finally {
    await admin.end()
  }

  console.log(`[test] Đã tạo database ${database}, đang nạp dữ liệu mẫu...`)

  const seed = spawnSync('pnpm', ['run', 'seed'], {
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
      // Payload chỉ đẩy schema khi không chạy ở chế độ production.
      NODE_ENV: 'development',
      SMTP_HOST: '',
    },
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })

  if (seed.status !== 0) {
    throw new Error(`Nạp dữ liệu mẫu thất bại:\n${seed.stdout || ''}\n${seed.stderr || ''}`)
  }

  console.log('[test] Dữ liệu mẫu đã sẵn sàng.')
}
