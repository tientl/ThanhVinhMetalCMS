import React from 'react'

export const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="Thành Vinh Metal" width={56} height={56} style={{ display: 'block' }} />
    <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: 1 }}>THÀNH VINH METAL</span>
  </div>
)

export default Logo
