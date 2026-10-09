/**
 * URL database dùng cho test. Ưu tiên TEST_DATABASE_URL, nếu không có thì
 * lấy DATABASE_URL và đổi tên database thành `<tên>_test`.
 */
export const testDatabaseUrl = (): string => {
  const explicit = process.env.TEST_DATABASE_URL
  if (explicit) return explicit

  const base = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5440/thanhvinh'
  const url = new URL(base)
  const name = url.pathname.replace(/^\//, '') || 'thanhvinh'
  if (name.endsWith('_test')) return url.toString()
  url.pathname = `/${name}_test`
  return url.toString()
}

/** Tách URL thành URL tới database quản trị `postgres` và tên database cần tạo. */
export const splitDatabaseUrl = (connectionString: string) => {
  const url = new URL(connectionString)
  const database = url.pathname.replace(/^\//, '')
  url.pathname = '/postgres'
  return { adminUrl: url.toString(), database }
}
