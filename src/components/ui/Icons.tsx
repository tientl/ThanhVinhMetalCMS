import React from 'react'

type P = React.SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number, props: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const IconHome = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3 11.5l9-7.5 9 7.5" />
    <path d="M5.5 10v10h5v-6h3v6h5V10" />
  </svg>
)
export const IconSearch = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)
export const IconMenu = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const IconClose = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconPrev = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)
export const IconNext = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)
export const IconUp = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
)
export const IconDownload = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 4v11" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
)
export const IconPhone = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
)
export const IconMail = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)
export const IconPin = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
export const IconChat = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z" />
  </svg>
)
export const IconClock = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const IconFile = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
)
export const IconExpand = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M15 3h6v6M9 21H3v-6" />
    <path d="M21 3l-7 7M3 21l7-7" />
  </svg>
)
/** Nét theo bộ Lucide (giấy phép ISC), cùng kiểu với các icon khác */
export const IconFacebook = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)
export const IconShare = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
)
