import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '@/access'
import { revalidateAllCollection } from '@/hooks/revalidate'
import { MEDIA_DIR } from '@/lib/mediaDir'
import { applyHeroCrop, type HeroCrop } from '@/lib/heroCrop'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Ảnh và tệp', plural: 'Ảnh và tệp' },
  admin: { components: { edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] } }, hideAPIURL: true, group: 'Nội dung', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: {
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Mô tả ảnh (alt)',
      required: true,
      admin: {},
    },
    {
      // Vùng cắt 2:1 đã chọn (% ảnh gốc), để mở lại đúng khung lần sau
      name: 'heroCrop',
      type: 'json',
      admin: { hidden: true },
    },
  ],
  // Ảnh có thể xuất hiện ở bất kỳ trang nào nên sửa ảnh (cắt lại, thay file, sửa alt) làm mới toàn bộ cache; ảnh mới tải chưa dùng ở đâu nên bỏ qua
  hooks: { afterChange: [revalidateAllCollection] },
  endpoints: [
    {
      path: '/:id/hero-crop',
      method: 'post',
      handler: async (req) => {
        if (isAdminOrEditor({ req } as Parameters<typeof isAdminOrEditor>[0]) !== true) {
          return Response.json({ message: 'Không có quyền' }, { status: 403 })
        }
        const id = req.routeParams?.id as string
        const body = (await req.json?.()) as Partial<HeroCrop> | undefined
        const crop = body ?? {}
        if ([crop.x, crop.y, crop.width, crop.height].some((n) => typeof n !== 'number' || Number.isNaN(n))) {
          return Response.json({ message: 'Thiếu vùng cắt' }, { status: 400 })
        }
        try {
          const result = await applyHeroCrop(req.payload, id, crop as HeroCrop)
          return Response.json(result)
        } catch (e) {
          return Response.json({ message: (e as Error).message }, { status: 400 })
        }
      },
    },
  ],
  upload: {
    staticDir: MEDIA_DIR,
    adminThumbnail: 'thumb',
    focalPoint: true,
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 300, height: 300, position: 'centre', formatOptions: { format: 'webp' } },
      { name: 'card', width: 800, height: 600, position: 'centre', formatOptions: { format: 'webp' } },
      { name: 'wide', width: 1600, formatOptions: { format: 'webp' } },
      // Slider trang chủ: cắt sẵn về 2:1 quanh điểm lấy nét, phóng to nếu ảnh nhỏ để slide nào cũng cùng khung
      { name: 'hero', width: 2400, height: 1200, position: 'centre', withoutEnlargement: false, formatOptions: { format: 'webp' } },
      // Ảnh khi chia sẻ Facebook, Zalo: luôn đủ 1200x630, ảnh nhỏ thì phóng to
      { name: 'og', width: 1200, height: 630, position: 'centre', withoutEnlargement: false, formatOptions: { format: 'jpeg' } },
    ],
  },
}
