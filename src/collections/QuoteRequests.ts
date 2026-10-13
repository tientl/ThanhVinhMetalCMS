import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/access'
import { blockNoopRestore, VERSIONS_LIST_VIEW } from '@/hooks/versions'
import { sendQuoteEmail } from '@/lib/email'
import { notifyLiveChange } from '@/lib/liveEvents'
import { QUOTE_STATUSES } from '@/lib/quoteStatus'

/**
 * Yêu cầu chưa có phiên bản nào (gửi trước khi bật lịch sử ngày 11/10/2026) thì lần sửa đầu tiên
 * lưu nội dung cũ làm phiên bản gốc trước khi ghi đè, để "Danh sách phiên bản" so sánh được thay đổi.
 * Payload tạo phiên bản của lần sửa này ngay sau đó như bình thường.
 */
const saveBaselineVersion: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
  if (operation !== 'update' || !originalDoc?.id) return data
  const { totalDocs } = await req.payload.countVersions({
    collection: 'quote-requests',
    where: { parent: { equals: originalDoc.id } },
    req,
  })
  if (totalDocs > 0) return data

  const at = typeof originalDoc.updatedAt === 'string' ? originalDoc.updatedAt : new Date().toISOString()
  await req.payload.db.createVersion({
    autosave: false,
    collectionSlug: 'quote-requests',
    createdAt: at,
    updatedAt: at,
    parent: originalDoc.id,
    req,
    returning: false,
    versionData: originalDoc,
  })
  return data
}

export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  labels: { singular: 'Yêu cầu báo giá', plural: 'Yêu cầu báo giá' },
  admin: {
    hideAPIURL: true,
    components: {
      edit: { beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'] },
      views: { edit: { versions: VERSIONS_LIST_VIEW } },
      // 4 ô tổng theo trạng thái, bấm để lọc danh sách
      beforeListTable: ['@/components/admin/QuoteStatusCards#QuoteStatusCards'],
    },
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'status', 'createdAt'],
    group: 'Liên hệ',
    description: 'Khách gửi từ form trên website. Đổi trạng thái sau khi đã liên hệ.',
  },
  access: {
    create: () => false,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
    readVersions: isAdminOrEditor,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Họ tên', required: true },
        { name: 'phone', type: 'text', label: 'Điện thoại', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'company', type: 'text', label: 'Công ty' },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Nội dung, quy cách cần gia công' },
    {
      name: 'attachment',
      type: 'upload',
      relationTo: 'quote-files',
      label: 'Tệp bản vẽ',
      admin: { components: { Field: '@/components/admin/QuoteAttachmentField#QuoteAttachmentField' } },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'new',
      options: QUOTE_STATUSES.map(({ label, value }) => ({ label, value })),
      // Không cho để trống: yêu cầu trống trạng thái không được đếm là "Mới" lẫn "Đã liên hệ".
      // Kiểm tra bằng validate thay vì required để không thêm NOT NULL vào database (đã có dòng trống từ trước).
      validate: (value: unknown) => (value ? true : 'Chọn trạng thái cho yêu cầu này.'),
      admin: {
        position: 'sidebar',
        isClearable: false,
        // Cột trạng thái trong danh sách: nhãn có màu đặc trưng
        components: { Cell: '@/components/admin/QuoteStatusCell#QuoteStatusCell' },
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Gửi từ trang',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Trang khách đang mở khi gửi: "/" là trang chủ, "/lien-he" là trang Liên hệ; có "?sp=..." là bấm "Yêu cầu báo giá" từ sản phẩm đó. Dùng để biết trang nào mang lại khách.',
      },
    },
    {
      name: 'ip',
      type: 'text',
      label: 'IP',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Địa chỉ mạng của người gửi, chỉ dùng để truy vết khi bị gửi spam. "::1" hay "192.168..." là máy trong mạng nội bộ (lúc thử nghiệm).',
      },
    },
  ],
  hooks: {
    beforeOperation: [blockNoopRestore],
    beforeChange: [saveBaselineVersion],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          await sendQuoteEmail({ doc, payload: req.payload })
        }
        notifyLiveChange()
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        notifyLiveChange()
        return doc
      },
    ],
  },
  // Lịch sử chỉnh sửa: mỗi lần lưu tạo một phiên bản, xem và so sánh ở tab "Phiên bản", khôi phục được.
  // Không bật nháp: yêu cầu do khách gửi, lưu là có hiệu lực ngay.
  versions: {
    maxPerDoc: 50,
  },
  timestamps: true,
}
