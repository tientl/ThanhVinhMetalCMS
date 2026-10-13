import type { ServerProps } from 'payload'

import React from 'react'

import { getLiveCounts } from '@/lib/liveEvents'

import { QuoteStatusCardsClient } from './QuoteStatusCardsClient'

/** 4 ô tổng theo trạng thái trên danh sách Yêu cầu báo giá (beforeListTable). Số ban đầu lấy ở server, sau đó cập nhật realtime. */
export const QuoteStatusCards = async ({ payload }: ServerProps) => {
  const live = await getLiveCounts(payload)
  return <QuoteStatusCardsClient initial={live} />
}

export default QuoteStatusCards
