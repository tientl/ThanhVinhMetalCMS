import type { Payload } from 'payload'

type QuoteDoc = {
  id: number | string
  name: string
  phone: string
  email?: string | null
  company?: string | null
  message?: string | null
  attachment?: number | string | { filename?: string | null } | null
  source?: string | null
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

/** Gửi email báo có yêu cầu báo giá mới. Lỗi email không làm hỏng việc lưu yêu cầu. */
export const sendQuoteEmail = async ({ doc, payload }: { doc: QuoteDoc; payload: Payload }) => {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    const to = settings.quoteEmail || settings.email || process.env.QUOTE_TO_EMAIL
    if (!to) {
      payload.logger.warn('Chưa cấu hình email nhận yêu cầu báo giá.')
      return
    }

    const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
    const adminUrl = `${base}/admin/collections/quote-requests/${doc.id}`
    const attachment =
      doc.attachment && typeof doc.attachment === 'object' ? doc.attachment.filename : undefined

    const rows: Array<[string, string | null | undefined]> = [
      ['Họ tên', doc.name],
      ['Điện thoại', doc.phone],
      ['Email', doc.email],
      ['Công ty', doc.company],
      ['Nội dung', doc.message],
      ['Tệp đính kèm', attachment ? `${attachment} (tải trong trang quản trị)` : 'Không có'],
      ['Gửi từ trang', doc.source],
    ]

    const html = `
      <h2 style="font-family:sans-serif">Yêu cầu báo giá mới từ website</h2>
      <table style="font-family:sans-serif;border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#666">${k}</td><td style="padding:6px 0"><strong>${escapeHtml(v || '—')}</strong></td></tr>`,
          )
          .join('')}
      </table>
      <p style="font-family:sans-serif"><a href="${adminUrl}">Mở trong trang quản trị</a></p>
    `

    await payload.sendEmail({
      to,
      subject: `[Website] Yêu cầu báo giá từ ${doc.name} – ${doc.phone}`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n') + `\n\n${adminUrl}`,
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Gửi email báo giá thất bại' })
  }
}
