import { getPayload, type Payload, type TypedUser } from 'payload'

import config from '@/payload.config'

let cached: Payload | null = null

export const getTestPayload = async (): Promise<Payload> => {
  if (!cached) cached = await getPayload({ config })
  return cached
}

/** Bỏ qua phân quyền: dùng để dựng dữ liệu cho test. */
export const asRoot = { overrideAccess: true } as const

/** Ngữ cảnh khách vãng lai (chưa đăng nhập), để kiểm tra phân quyền công khai. */
export const asGuest = { overrideAccess: false, user: null } as const

/** Không chạy hook revalidate của Next trong test. */
export const noRevalidate = { context: { disableRevalidate: true } } as const

type Role = 'admin' | 'editor'

const userCache = new Map<Role, TypedUser>()

/** Lấy (hoặc tạo) một tài khoản theo vai trò để kiểm tra phân quyền. */
export const getUser = async (role: Role): Promise<TypedUser> => {
  const existing = userCache.get(role)
  if (existing) return existing

  const payload = await getTestPayload()
  const email = role === 'admin' ? 'admin@thanhvinhmetal.vn' : 'editor.test@thanhvinhmetal.vn'

  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, ...asRoot })
  let user = found.docs[0]

  if (!user) {
    user = await payload.create({
      collection: 'users',
      data: { name: role === 'admin' ? 'Quản trị' : 'Nhân viên test', email, password: 'Test@2026', role },
      ...asRoot,
    })
  }

  const typed = user as TypedUser
  userCache.set(role, typed)
  return typed
}

/** Tham số find/create/update chạy dưới quyền của một vai trò. */
export const as = async (role: Role) => ({ overrideAccess: false, user: await getUser(role) })

/** Dọn các bản ghi test tạo ra, nhận biết qua tiền tố trong một field. */
export const cleanup = async (
  collection: 'products' | 'posts' | 'product-categories' | 'post-categories' | 'pages',
  field: string,
  prefix: string,
) => {
  const payload = await getTestPayload()
  await payload.delete({
    collection,
    where: { [field]: { like: prefix } },
    ...asRoot,
    ...noRevalidate,
  })
}
