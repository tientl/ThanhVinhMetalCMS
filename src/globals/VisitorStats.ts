import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access'
import { revalidateAll } from '@/hooks/revalidate'

/** Bộ đếm lượt truy cập hiện ở footer. Website tự tăng qua /api/visit, admin có thể đặt số khởi điểm. */
export const VisitorStats: GlobalConfig = {
  slug: 'visitor-stats',
  label: 'Thống kê truy cập',
  admin: { group: 'Cài đặt', hideAPIURL: true },
  access: { read: () => true, update: isAdmin },
  hooks: { afterChange: [revalidateAll] },
  fields: [
    {
      name: 'showInFooter',
      type: 'checkbox',
      label: 'Hiện bộ đếm ở chân trang',
      defaultValue: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'total',
          type: 'number',
          label: 'Tổng lượt truy cập',
          defaultValue: 0,
          min: 0,
          admin: { description: 'Có thể sửa để đặt số khởi điểm.' },
        },
        { name: 'today', type: 'number', label: 'Hôm nay', defaultValue: 0, min: 0, admin: { readOnly: true } },
      ],
    },
    { name: 'todayDate', type: 'text', admin: { hidden: true } },
  ],
}
