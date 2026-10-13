import type { CollectionSlug, DocumentViewServerProps } from 'payload'

import { Gutter, SetDocumentStepNav } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

import { changedKeys, fieldLabels } from '@/lib/versions'

/** Hiện tối đa bao nhiêu tên ô đã đổi trong cột "Thay đổi", phần còn lại gộp thành "+N ô khác". */
const MAX_FIELDS_SHOWN = 4

// Định dạng ở server nên phải ghi rõ múi giờ (VPS thường chạy giờ UTC)
const timeParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** "13/10/2026 02:21", cùng kiểu dd/MM/yyyy HH:mm với các chỗ khác trong admin. */
const formatTime = (value: string): string => {
  const p = Object.fromEntries(timeParts.formatToParts(new Date(value)).map((x) => [x.type, x.value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

type Row = {
  id: string
  number: number
  updatedAt: string
  status: string | null
  change: string
  isLatest: boolean
}

/**
 * Trang "Danh sách phiên bản" thay bản mặc định của Payload (gắn qua admin.components.views.edit.versions).
 * Bản mặc định hiện "Ngày cập nhật" nhưng khi không có ?sort lại sắp theo ngày tạo, mà khôi phục một phiên bản thì
 * Payload giữ ngày tạo của bản cũ, nên bản mới có thể nằm dưới cùng; cột "ID của phiên bản" chỉ là số tự tăng
 * trong database. Ở đây: sắp theo thời gian lưu (mới nhất ở trên), đánh số "Lần lưu" từ cũ đến mới,
 * và ghi các ô đã đổi so với lần lưu trước. Mỗi mục giữ tối đa maxPerDoc bản nên hiện hết, không phân trang.
 */
export const VersionsList = async ({ initPageResult, i18n }: DocumentViewServerProps) => {
  const { collectionConfig, docID, req } = initPageResult
  if (!collectionConfig || docID === undefined || docID === null) return null

  const slug = collectionConfig.slug as CollectionSlug
  const versionsConfig = typeof collectionConfig.versions === 'object' ? collectionConfig.versions : null
  const hasDrafts = Boolean(versionsConfig?.drafts)
  const maxPerDoc = versionsConfig?.maxPerDoc

  const { docs } = await req.payload.findVersions({
    collection: slug,
    where: { parent: { equals: docID } },
    sort: '-updatedAt',
    limit: 200,
    depth: 0,
    overrideAccess: false,
    user: req.user,
    req,
  })

  const labels = fieldLabels(collectionConfig.fields as never)
  const chrono = [...docs].reverse()
  const rows: Row[] = chrono.map((v, i) => {
    const data = v.version as unknown as Record<string, unknown>
    const prev = i > 0 ? (chrono[i - 1]!.version as unknown as Record<string, unknown>) : null
    let change = 'Bản đầu tiên'
    if (prev) {
      // Chỉ kể field nhân viên thấy được: field ẩn (searchText tự sinh cho tìm kiếm), ui, trường hệ thống bỏ qua
      const names = changedKeys(prev, data)
        .filter((k) => k in labels)
        .map((k) => labels[k]!)
      if (names.length > MAX_FIELDS_SHOWN) change = `${names.slice(0, MAX_FIELDS_SHOWN).join(', ')} và ${names.length - MAX_FIELDS_SHOWN} ô khác`
      else if (names.length) change = names.join(', ')
      else if (hasDrafts && prev._status !== data._status) change = data._status === 'published' ? 'Xuất bản' : 'Chuyển về bản nháp'
      else change = 'Không đổi nội dung'
    }
    return {
      id: String(v.id),
      number: i + 1,
      updatedAt: v.updatedAt,
      status: typeof data._status === 'string' ? data._status : null,
      change,
      isLatest: i === chrono.length - 1,
    }
  })
  rows.reverse()

  const adminRoute = req.payload.config.routes.admin
  const base = `${adminRoute}/collections/${slug}/${docID}/versions`
  const pluralLabel = typeof collectionConfig.labels?.plural === 'string' ? collectionConfig.labels.plural : slug

  return (
    <>
      <SetDocumentStepNav
        collectionSlug={slug}
        id={docID}
        pluralLabel={pluralLabel}
        useAsTitle={collectionConfig.admin?.useAsTitle}
        view={i18n.t('version:versions')}
      />
      <main className="versions vlist">
        <Gutter className="versions__wrap">
          <p className="vlist__intro">
            {rows.length} lần lưu, mới nhất ở trên{maxPerDoc ? `, giữ tối đa ${maxPerDoc} lần gần nhất` : ''}. Bấm một dòng để xem
            chi tiết, so sánh hoặc khôi phục.
          </p>
          {rows.length === 0 ? (
            <p className="vlist__empty">Chưa có phiên bản nào. Lần lưu tiếp theo sẽ bắt đầu ghi lịch sử.</p>
          ) : (
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>Lần lưu</th>
                    <th>Thời gian</th>
                    {hasDrafts && <th>Trạng thái</th>}
                    <th>Thay đổi so với lần trước</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const href = `${base}/${r.id}?modifiedOnly=false`
                    return (
                      <tr key={r.id} className={r.isLatest ? 'vlist__row--latest' : undefined}>
                        <td className="vlist__number">
                          <Link href={href} prefetch={false}>
                            Lần {r.number}
                          </Link>
                          {r.isLatest && <span className="vlist__tag">{hasDrafts ? 'Mới nhất' : 'Hiện tại'}</span>}
                        </td>
                        <td>
                          <Link href={href} prefetch={false} className="vlist__time">
                            {formatTime(r.updatedAt)}
                          </Link>
                        </td>
                        {hasDrafts && (
                          <td>
                            <span className={`vlist__status vlist__status--${r.status === 'published' ? 'published' : 'draft'}`}>
                              {r.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </td>
                        )}
                        <td className="vlist__change">{r.change}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Gutter>
      </main>
    </>
  )
}

export default VersionsList
