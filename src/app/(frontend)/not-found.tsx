import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <section className="section flex min-h-[calc(70vh_/_var(--zoom))] flex-col items-start justify-center gap-6 pt-[calc(var(--header-h)+64px)]">
      <span className="label-sm">Lỗi 404</span>
      <h1 className="h-display text-[36px] md:text-[56px]">Không tìm thấy trang</h1>
      <p className="lead max-w-[560px]">Trang bạn tìm không tồn tại hoặc đã được chuyển đi. Hãy quay về trang chủ hoặc xem sản phẩm.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="btn-solid">
          Về trang chủ
        </Link>
        <Link href="/san-pham" className="btn-ghost">
          Xem sản phẩm
        </Link>
      </div>
    </section>
  )
}
