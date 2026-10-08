/** Tiện ích màu: suy ra các tông nhạt từ màu chủ đạo khách chọn trong admin. */

export const DEFAULT_ACCENT = '#E8411A'

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export const isHexColor = (v: unknown): v is string => typeof v === 'string' && HEX_RE.test(v.trim())

const toRgb = (hex: string): [number, number, number] => {
  let h = hex.trim().slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = ([r, g, b]: [number, number, number]) =>
  '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')

/** Pha màu với trắng theo tỉ lệ 0..1. */
export const lighten = (hex: string, amount: number): string => {
  const [r, g, b] = toRgb(hex)
  return toHex([r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount])
}

/** Pha màu với đen theo tỉ lệ 0..1. */
export const darken = (hex: string, amount: number): string => {
  const [r, g, b] = toRgb(hex)
  return toHex([r * (1 - amount), g * (1 - amount), b * (1 - amount)])
}

/** Độ sáng cảm nhận 0..1, để chọn chữ tối hay sáng trên nền màu. */
export const luminance = (hex: string): number => {
  const [r, g, b] = toRgb(hex).map((v) => v / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Bộ biến CSS cho giao diện từ một màu chủ đạo.
 * Trên nền tối dùng tông nhạt hơn, trên nền sáng dùng tông đậm hơn để đủ tương phản.
 * globals.css chọn bộ nào theo data-theme và .dark-zone.
 */
export const accentVars = (accent: string | null | undefined): Record<string, string> => {
  const base = isHexColor(accent) ? accent.trim() : DEFAULT_ACCENT
  return {
    '--color-accent': base,
    '--accent-text-on-dark': lighten(base, 0.22),
    '--accent-ghost-on-dark': lighten(base, 0.58),
    '--accent-text-on-light': darken(base, 0.1),
    '--accent-ghost-on-light': darken(base, 0.2),
  }
}
