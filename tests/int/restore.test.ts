import { beforeAll, describe, expect, it, vi } from 'vitest'

import { REST_POST } from '@payloadcms/next/routes'
import type { Payload } from 'payload'

import config from '@/payload.config'

import { asRoot, getTestPayload, getUser, noRevalidate } from './helpers'

// Gọi qua REST thì không truyền được context disableRevalidate; revalidatePath chỉ chạy trong server Next thật
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

const PREFIX = 'Rstest'
let payload: Payload

const editorHeaders = async () => {
  const user = await getUser('editor')
  const { token } = await payload.login({ collection: 'users', data: { email: user.email, password: 'Test@2026' } })
  return { Authorization: `JWT ${token}` }
}

/** Gọi đúng route REST mà nút "Khôi phục về phiên bản này" gọi (luôn kèm ?draft=false). */
const restoreViaRest = async (collection: string, versionId: string | number) =>
  REST_POST(config)(
    new Request(`http://localhost:3000/api/${collection}/versions/${versionId}?draft=false`, {
      method: 'POST',
      headers: await editorHeaders(),
    }),
    { params: Promise.resolve({ slug: [collection, 'versions', String(versionId)] }) },
  )

const versionsOf = async (collection: 'posts' | 'products', parent: number) =>
  (await payload.findVersions({ collection, where: { parent: { equals: parent } }, sort: 'updatedAt', depth: 0, ...asRoot })).docs

beforeAll(async () => {
  payload = await getTestPayload()
  await payload.delete({ collection: 'posts', where: { title: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
  await payload.delete({ collection: 'products', where: { name: { like: `${PREFIX}%` } }, ...asRoot, ...noRevalidate })
})

describe('khôi phục phiên bản là bản nháp', () => {
  it('bài viết nháp thiếu ô bắt buộc vẫn khôi phục được (dưới dạng nháp) qua nút trong admin', async () => {
    // Bản nháp chưa có ảnh bìa, nội dung, danh mục: lưu nháp không kiểm tra ô bắt buộc
    const post = await payload.create({
      collection: 'posts',
      data: { title: `${PREFIX} Bài Nháp`, _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...noRevalidate,
    })
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { title: `${PREFIX} Bài Nháp Đã Sửa`, _status: 'draft' } as never,
      draft: true,
      ...asRoot,
      ...noRevalidate,
    })
    const [first] = await versionsOf('posts', post.id)

    // Cách Payload làm mặc định (draft=false) thì hỏng vì kiểm tra ô bắt buộc như khi xuất bản
    await expect(payload.restoreVersion({ collection: 'posts', id: String(first!.id), draft: false, ...asRoot, ...noRevalidate })).rejects.toThrow()

    const res = await restoreViaRest('posts', first!.id)
    expect(res.status).toBe(200)
    const latest = (await versionsOf('posts', post.id)).at(-1)!
    const restored = latest.version as { title?: string; _status?: string }
    expect(restored.title).toBe(`${PREFIX} Bài Nháp`)
    expect(restored._status).toBe('draft')
  })
})

describe('dòng mảng trống', () => {
  it('sản phẩm bỏ dòng "Bộ ảnh" chưa chọn ảnh và dòng "Thông số" trống, kể cả khi lưu nháp', async () => {
    const base = (await payload.find({ collection: 'products', limit: 1, depth: 0, ...asRoot })).docs[0]!
    const image = base.images![0]!.image
    const draft = await payload.create({
      collection: 'products',
      data: {
        name: `${PREFIX} SP Nháp`,
        category: base.category,
        images: [{ image }, { image: null }, { image: null }],
        spec: [{ label: 'Độ dày', value: '2 mm' }, { label: '', value: '' }],
        _status: 'draft',
      } as never,
      draft: true,
      ...asRoot,
      ...noRevalidate,
    })
    const saved = await payload.findByID({ collection: 'products', id: draft.id, draft: true, depth: 0, ...asRoot })
    expect(saved.images).toHaveLength(1)
    expect(saved.spec).toHaveLength(1)
  })
})
