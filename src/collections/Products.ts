import { ValidationError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { simpleRichText } from '@/fields/richText'
import { buildSearchText, searchTextField } from '@/fields/searchText'
import { limit, MAX } from '@/fields/limits'
import { publishedOthers, validatePublishedRelation } from '@/fields/publishedOnly'
import { RELATED } from '@/lib/related'
import { slugField } from '@/fields/slug'
import { linkedNameCell, thumbnailColumn } from '@/fields/thumbnail'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'
import { dropEmptyRows } from '@/hooks/arrays'
import { blockNoopRestore, restoreVersionEndpoint, VERSIONS_LIST_VIEW } from '@/hooks/versions'
import { tidyPrice } from '@/lib/price'

// Đường dẫn sản phẩm trên website: dùng chung cho làm mới cache và ô slug trong admin
const URL_PREFIX = '/san-pham/'
// `/(frontend)/san-pham/[slug]`: mọi trang chi tiết dựng sẵn khác, vì mục "Sản phẩm liên quan" ở đó hiện thẻ (tên, giá) của sản phẩm này.
// Làm mới theo mẫu phải ghi đúng đường thư mục route, kể cả nhóm (frontend); ghi `/san-pham/[slug]` thì Next bỏ qua.
// Trang danh sách, danh mục đọc ?page= nên luôn dựng mới, không cần làm mới.
const paths = (doc: { slug?: string | null }) => ['/san-pham', `${URL_PREFIX}${doc.slug}`, '/(frontend)/san-pham/[slug]']

const invalidImagesMessage = 'Cần chọn ít nhất một ảnh hợp lệ trước khi xuất bản sản phẩm.'

/** Lưu nháp có thể thiếu ảnh; bản xuất bản phải tham chiếu tới ảnh thật trong Media. */
const validatePublishedImages: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  if (data._status === 'draft') return data

  const images = data.images ?? originalDoc?.images
  const invalid = !Array.isArray(images) || images.length === 0 || await Promise.all(images.map(async (row) => {
    const ref = row?.image
    const id = typeof ref === 'object' && ref !== null ? ref.id : ref
    if (typeof id !== 'number' && typeof id !== 'string') return true
    try {
      const media = await req.payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true, req })
      return !media.mimeType?.startsWith('image/') || !media.url
    } catch {
      return true
    }
  })).then((results) => results.some(Boolean))

  if (invalid) {
    throw new ValidationError({
      collection: 'products',
      errors: [{ path: 'images', label: 'Bộ ảnh', message: invalidImagesMessage }],
      req,
    }, req.t)
  }
  return data
}

export const Products: CollectionConfig<'products'> = {
  slug: 'products',
  labels: { singular: 'Sản phẩm', plural: 'Sản phẩm' },
  admin: {
    hideAPIURL: true,
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'],
        PublishButton: '@/components/admin/ProductPublishButton#ProductPublishButton',
      },
      views: { edit: { versions: VERSIONS_LIST_VIEW } },
    },
    useAsTitle: 'name',
    defaultColumns: ['thumbnail', 'name', 'category', 'featured', '_status', 'updatedAt'],
    group: 'Sản phẩm',
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOrLoggedIn,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultPopulate: {
    name: true,
    slug: true,
    summary: true,
    images: true,
    category: true,
    price: true,
  },
  fields: [
    limit({ name: 'name', type: 'text', label: 'Tên sản phẩm', required: true, admin: { components: linkedNameCell } }, MAX.productName),
    thumbnailColumn('images.0.image'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            {
              name: 'images',
              type: 'array',
              label: 'Bộ ảnh',
              labels: { singular: 'Ảnh', plural: 'Ảnh' },
              required: true,
              minRows: 1,
              admin: { description: 'Ảnh đầu tiên là ảnh đại diện.' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Ảnh' }],
            },
            limit(
              {
                name: 'summary',
                type: 'textarea',
                label: 'Tóm tắt',
                admin: { description: 'Hiện ở thẻ sản phẩm và đầu trang chi tiết.' },
              },
              MAX.summary,
            ),
            { name: 'description', type: 'richText', label: 'Mô tả chi tiết', editor: simpleRichText },
          ],
        },
        {
          label: 'Thông số',
          fields: [
            limit({ name: 'material', type: 'text', label: 'Vật liệu', admin: { description: 'Ví dụ: Thép tấm CT3, Inox 304, Nhôm 5052.' } }, MAX.line),
            {
              name: 'spec',
              type: 'array',
              label: 'Quy cách, thông số',
              labels: { singular: 'Thông số', plural: 'Thông số' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    limit({ name: 'label', type: 'text', label: 'Tên', required: true, admin: { width: '40%' } }, 40),
                    limit({ name: 'value', type: 'text', label: 'Giá trị', required: true, admin: { width: '60%' } }, MAX.line),
                  ],
                },
              ],
            },
            limit(
              {
                name: 'price',
                type: 'text',
                label: 'Giá',
                defaultValue: 'Liên hệ',
                admin: {
                  description:
                    'Nhập tự do, ví dụ "1.200.000đ", "Từ 350.000đ/m²", "45.000đ/kg". Để trống hoặc "Liên hệ" thì trang chi tiết hiện "Liên hệ", thẻ sản phẩm hiện "Xem sản phẩm".',
                },
                // Chỉ có dấu cách thì lưu thành trống (trước đây web hiện ô giá trắng)
                hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? tidyPrice(value) : value)] },
              },
              60,
            ),
          ],
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      label: 'Danh mục',
      required: true,
      admin: { position: 'sidebar' },
    },
    slugField('name', {}, { autoSuffixOnCreate: true, urlPrefix: URL_PREFIX }),
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Sản phẩm nổi bật',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      // Chọn tay tối đa bấy nhiêu, web hiện đúng bấy nhiêu (src/lib/related.ts)
      maxRows: RELATED.products.picked,
      label: 'Sản phẩm liên quan',
      admin: { position: 'sidebar', description: `Chọn gì hiện nấy, tối đa ${RELATED.products.picked} sản phẩm. Để trống sẽ tự lấy ${RELATED.products.auto} sản phẩm cùng danh mục. Sản phẩm bị ẩn sau khi chọn vẫn nằm trong danh sách nhưng không hiện trên web; xuất bản lại thì hiện lại.` },
      // Không chọn được bản nháp và chính nó (xem src/fields/publishedOnly.ts)
      filterOptions: publishedOthers,
      validate: validatePublishedRelation('products', 'name'),
    },
    searchTextField,
  ],
  // Phiên bản là bản nháp thì khôi phục dưới dạng nháp (xem restoreVersionEndpoint)
  endpoints: [restoreVersionEndpoint],
  hooks: {
    beforeOperation: [blockNoopRestore],
    // Bỏ dòng "Bộ ảnh" chưa chọn ảnh, dòng "Thông số" trống cả tên lẫn giá trị (lưu nháp vẫn lọt nếu không bỏ)
    beforeValidate: [dropEmptyRows({ images: ['image'], spec: ['label', 'value'] })],
    beforeChange: [validatePublishedImages, buildSearchText({ fields: ['name', 'summary', 'material'], relation: { field: 'category', collection: 'product-categories' } })],
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionDelete(paths)],
  },
  versions: {
    // Không tự động lưu nháp: bấm "Lưu nháp" hoặc "Xuất bản" mới ghi,
    // nhờ vậy nút Lưu và Hủy chỉ bấm được khi có thay đổi, không sinh nháp rỗng.
    drafts: true,
    maxPerDoc: 20,
  },
}
