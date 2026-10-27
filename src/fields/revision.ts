import type { Field } from 'payload'

/**
 * Ô ẩn đếm số lần lưu, cho global chỉ gồm mảng (Menu). Adapter Postgres bỏ qua ghi dòng chính khi ngoài mốc thời gian
 * không có cột nào (@payloadcms/drizzle upsertRow: "Exclude timestamp-only updates"), nên `updatedAt` đứng yên mãi và
 * rejectStaleSave (src/hooks/staleSave.ts) không nhận ra bản cũ. Ô này tăng mỗi lần lưu nên dòng chính luôn được ghi.
 */
export const revisionField: Field = {
  name: 'revision',
  type: 'number',
  admin: { hidden: true },
  hooks: { beforeChange: [({ originalDoc }) => (Number(originalDoc?.revision) || 0) + 1] },
}
