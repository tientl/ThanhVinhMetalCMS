/**
 * Bỏ dấu tiếng Việt và chuẩn hóa chuỗi để tạo slug, so khớp tìm kiếm.
 */
export const unaccent = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')

export const normalizeSearch = (input: string | null | undefined): string =>
  unaccent(input ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

export const toSlug = (input: string): string =>
  unaccent(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
