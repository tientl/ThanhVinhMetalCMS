import type { Page, TestInfo } from '@playwright/test'

/**
 * API báo giá và bản tin giới hạn 5 lần mỗi IP mỗi giờ. Server test chạy liên tục
 * nên các lần chạy lại sẽ đụng trần. Mỗi test gắn một IP giả riêng qua
 * X-Forwarded-For (đúng header mà clientIp() đọc) để không chặn lẫn nhau.
 */
let counter = 0

export const useOwnRateLimitBucket = async (page: Page, testInfo: TestInfo) => {
  counter += 1
  const worker = testInfo.workerIndex % 200
  const attempt = testInfo.retry % 5
  await page.setExtraHTTPHeaders({
    'x-forwarded-for': `203.0.${worker + 1}.${((counter + attempt * 50) % 250) + 1}`,
  })
}
