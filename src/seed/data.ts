import { richText } from './lexical'

export const IMAGES: Record<string, { file: string; alt: string }> = {
  logo: { file: 'logo-thanh-vinh-metal.png', alt: 'Logo Thành Vinh Metal' },
  heroSparks: { file: 'hero-sparks.jpg', alt: 'Minh họa cắt laser tấm kim loại' },
  slideHoaVan: { file: 'slide-hoa-van-gold.jpg', alt: 'Minh họa vách hoa văn cắt laser' },
  wSong: { file: 'w-song-gold.jpg', alt: 'Minh họa tấm trang trí họa tiết sóng' },
  wLa: { file: 'w-la-bronze.jpg', alt: 'Tấm trang trí họa tiết lá' },
  plateCut: { file: 'plate-cut.jpg', alt: 'Minh họa tấm thép đục lỗ bằng laser' },
  wOVuong: { file: 'w-o-vuong-steel.jpg', alt: 'Tấm thép đục lỗ ô vuông cho nhà xưởng' },
  wCongNan: { file: 'w-cong-nan-black.jpg', alt: 'Cổng sắt hoa văn sơn đen' },
  pVachTron: { file: 'p-vach-tron-gold.jpg', alt: 'Vách họa tiết tròn màu vàng đồng' },
  pVachLucGiac: { file: 'p-vach-luc-giac-black.jpg', alt: 'Vách lục giác sơn đen' },
  pVachQuaTram: { file: 'p-vach-qua-tram.jpg', alt: 'Vách quả trám inox' },
  pTamDucLo: { file: 'p-tam-duc-lo.jpg', alt: 'Tấm đục lỗ trang trí' },
  pVoTuDien: { file: 'p-vo-tu-dien.jpg', alt: 'Vỏ tủ điện chấn gấp' },
  pPat: { file: 'p-pat-lien-ket.jpg', alt: 'Pát liên kết, giá đỡ' },
  pMatBich: { file: 'p-mat-bich.jpg', alt: 'Mặt bích đường ống' },
  pBanhRang: { file: 'p-banh-rang.jpg', alt: 'Bánh răng, đĩa xích cắt laser' },
  pChu: { file: 'p-chu-cat-laser.jpg', alt: 'Chữ cắt laser inox' },
}

export const PRODUCT_CATEGORIES = [
  { key: 'vach', name: 'Vách ngăn hoa văn', image: 'pVachTron', description: 'Vách ngăn, lam che nắng, cổng, lan can cắt laser theo mẫu.' },
  { key: 'tamDucLo', name: 'Tấm đục lỗ', image: 'pTamDucLo', description: 'Tấm đục lỗ tròn, vuông, lục giác hoặc họa tiết trang trí.' },
  { key: 'chu', name: 'Chữ và biển hiệu', image: 'pChu', description: 'Chữ nổi, logo, biển hiệu cắt laser inox, thép.' },
  { key: 'tuDien', name: 'Vỏ tủ điện, máng cáp', image: 'pVoTuDien', description: 'Vỏ tủ điện, máng cáp, giá đỡ chấn gấp theo bản vẽ.' },
  { key: 'matBich', name: 'Mặt bích, chi tiết máy', image: 'pMatBich', description: 'Chi tiết máy cắt từ thép tấm theo bản vẽ.' },
  { key: 'banhRang', name: 'Bánh răng, đĩa xích', image: 'pBanhRang', description: 'Bánh răng, đĩa xích, cam cắt laser chính xác.' },
]

export const PRODUCTS = [
  { key: 'vachTron', name: 'Vách họa tiết tròn vàng đồng', category: 'vach', images: ['pVachTron', 'slideHoaVan'], material: 'Thép tấm 2 mm, sơn tĩnh điện vàng đồng', featured: true, summary: 'Vách ngăn họa tiết tròn, cắt laser trên thép tấm, sơn tĩnh điện vàng đồng.', spec: [['Độ dày', '1.5 – 3 mm'], ['Kích thước tấm', 'Tối đa 1500 × 3000 mm'], ['Hoàn thiện', 'Sơn tĩnh điện']] },
  { key: 'vachLucGiac', name: 'Vách lục giác sơn đen', category: 'vach', images: ['pVachLucGiac'], material: 'Thép tấm 2 mm, sơn tĩnh điện đen nhám', featured: true, summary: 'Vách lục giác tổ ong cho sảnh, quán cà phê, mặt dựng.', spec: [['Độ dày', '2 mm'], ['Hoàn thiện', 'Sơn tĩnh điện đen nhám']] },
  { key: 'vachQuaTram', name: 'Vách quả trám inox', category: 'vach', images: ['pVachQuaTram'], material: 'Inox 304, 1.5 mm', featured: true, summary: 'Vách quả trám inox 304 xước mờ, dùng ngoài trời không gỉ.', spec: [['Vật liệu', 'Inox 304'], ['Độ dày', '1.2 – 2 mm']] },
  { key: 'lamSong', name: 'Lam che nắng họa tiết sóng', category: 'vach', images: ['wSong'], material: 'Nhôm 5052, 2 mm', featured: false, summary: 'Lam che nắng mặt tiền, họa tiết sóng, nhôm sơn tĩnh điện.', spec: [['Vật liệu', 'Nhôm 5052'], ['Độ dày', '2 – 3 mm']] },
  { key: 'congHoaVan', name: 'Cổng hoa văn cắt laser', category: 'vach', images: ['wCongNan'], material: 'Thép tấm 3 mm, sơn tĩnh điện', featured: false, summary: 'Cổng, hàng rào, lan can hoa văn cắt laser, hàn khung hoàn thiện.', spec: [['Độ dày', '3 – 5 mm'], ['Hoàn thiện', 'Sơn tĩnh điện, mạ kẽm']] },
  { key: 'tamDucLoTrangTri', name: 'Tấm đục lỗ trang trí', category: 'tamDucLo', images: ['pTamDucLo'], material: 'Thép, inox, nhôm', featured: true, summary: 'Tấm đục lỗ họa tiết tùy chọn cho trần, vách, mặt dựng.', spec: [['Độ dày', '1 – 3 mm'], ['Khổ tấm', '1220 × 2440 mm']] },
  { key: 'tamDucLoTron', name: 'Tấm đục lỗ tròn tiêu chuẩn', category: 'tamDucLo', images: ['plateCut', 'wOVuong'], material: 'Thép CT3, inox 201/304', featured: false, summary: 'Tấm đục lỗ tròn, ô vuông theo bước lỗ tiêu chuẩn, dùng che máy, sàng lọc.', spec: [['Đường kính lỗ', '3 – 20 mm'], ['Bước lỗ', 'Theo yêu cầu']] },
  { key: 'chuInox', name: 'Chữ cắt laser inox', category: 'chu', images: ['pChu'], material: 'Inox 304 gương, xước', featured: true, summary: 'Chữ nổi, logo công ty cắt laser inox, có thể gắn đèn LED.', spec: [['Vật liệu', 'Inox 304'], ['Độ dày', '1 – 3 mm']] },
  { key: 'tamOpLa', name: 'Tấm ốp mặt tiền họa tiết lá', category: 'chu', images: ['wLa'], material: 'Thép 2 mm, sơn tĩnh điện màu đồng', featured: false, summary: 'Tấm ốp mặt tiền, biển hiệu cửa hàng với họa tiết lá cắt laser.', spec: [['Độ dày', '2 mm'], ['Hoàn thiện', 'Sơn tĩnh điện']] },
  { key: 'voTuDien', name: 'Vỏ tủ điện chấn gấp', category: 'tuDien', images: ['pVoTuDien'], material: 'Tôn 1.2 – 2 mm, sơn tĩnh điện', featured: true, summary: 'Vỏ tủ điện trong nhà, ngoài trời, chấn gấp CNC, sơn tĩnh điện.', spec: [['Độ dày', '1.2 – 2 mm'], ['Tiêu chuẩn', 'IP54 tùy loại']] },
  { key: 'pat', name: 'Pát liên kết, giá đỡ', category: 'tuDien', images: ['pPat'], material: 'Thép CT3 3 – 10 mm, mạ kẽm', featured: false, summary: 'Pát liên kết, giá đỡ, máng cáp cắt laser và chấn gấp theo bản vẽ.', spec: [['Độ dày', '3 – 10 mm'], ['Hoàn thiện', 'Mạ kẽm, sơn']] },
  { key: 'matBich', name: 'Mặt bích đường ống', category: 'matBich', images: ['pMatBich'], material: 'Thép CT3, SS400, inox', featured: true, summary: 'Mặt bích tiêu chuẩn JIS, DIN hoặc theo bản vẽ, cắt laser chính xác.', spec: [['Độ dày', '5 – 20 mm'], ['Tiêu chuẩn', 'JIS 5K, 10K; DIN PN10, PN16']] },
  { key: 'banhRang', name: 'Bánh răng, đĩa xích', category: 'banhRang', images: ['pBanhRang'], material: 'Thép C45, SS400', featured: true, summary: 'Bánh răng, đĩa xích, cam cắt laser từ thép tấm theo bản vẽ hoặc mẫu cũ.', spec: [['Độ dày', '5 – 20 mm'], ['Dung sai', '± 0.1 mm']] },
]

export const POST_CATEGORIES = [
  { key: 'kienThuc', name: 'Kiến thức', description: 'Kinh nghiệm chọn vật liệu, chuẩn bị bản vẽ, gia công.' },
  { key: 'tinTuc', name: 'Tin tức', description: 'Tin mới từ xưởng, dự án đã hoàn thành.' },
  { key: 'tuyenDung', name: 'Tuyển dụng', description: 'Cơ hội làm việc tại Vinh Metal.' },
]

export const POSTS = [
  { title: 'Inox 201 và inox 304: chọn loại nào cho chi tiết máy?', category: 'kienThuc', cover: 'plateCut', excerpt: 'So sánh độ bền, khả năng chống gỉ và giá của inox 201 và 304 để chọn đúng cho từng ứng dụng.', content: richText([{ type: 'h2', text: 'Khác nhau ở thành phần' }, 'Inox 304 chứa nhiều niken hơn nên chống gỉ tốt hơn, phù hợp môi trường ẩm, ngoài trời. Inox 201 rẻ hơn, dùng trong nhà.', { type: 'h2', text: 'Nên chọn loại nào' }, { type: 'ul', items: ['Chi tiết máy thực phẩm, ngoài trời: inox 304.', 'Vách trang trí trong nhà, chi phí thấp: inox 201.'] }]) },
  { title: 'Cắt laser và cắt plasma khác nhau thế nào?', category: 'kienThuc', cover: 'heroSparks', excerpt: 'Laser cho đường cắt mịn, chính xác; plasma cắt tấm dày nhanh và rẻ hơn.', content: richText(['Cắt laser dùng chùm tia hội tụ nên đường cắt hẹp, mép mịn, phù hợp tấm 0.5 – 20 mm. Cắt plasma dùng hồ quang, phù hợp tấm dày trên 20 mm nhưng mép cắt rộng hơn.', { type: 'h2', text: 'Khi nào chọn laser' }, { type: 'ul', items: ['Chi tiết nhỏ, nhiều đường cong.', 'Yêu cầu dung sai dưới 0.2 mm.', 'Inox, nhôm cần mép sạch.'] }]) },
  { title: 'Chuẩn bị file DXF để cắt laser không bị lỗi', category: 'kienThuc', cover: 'pChu', excerpt: 'Các lỗi thường gặp khi gửi bản vẽ và cách khắc phục trước khi gửi xưởng.', content: richText([{ type: 'ul', items: ['Đường nét phải khép kín, không chồng lặp.', 'Đổi chữ sang đường (explode text).', 'Đơn vị mm, tỉ lệ 1:1.', 'Xóa layer thừa, kích thước, ghi chú.'] }, 'Gửi kèm độ dày, vật liệu và số lượng để xưởng báo giá nhanh.']) },
  { title: 'Sơn tĩnh điện hay mạ kẽm cho sản phẩm ngoài trời?', category: 'kienThuc', cover: 'wCongNan', excerpt: 'Mạ kẽm nhúng nóng chống gỉ lâu, sơn tĩnh điện đẹp và nhiều màu. Kết hợp cả hai là tốt nhất.', content: richText(['Với cổng, hàng rào, lan can ngoài trời, nên mạ kẽm trước rồi sơn tĩnh điện để vừa bền vừa đẹp.', 'Với vách trang trí trong nhà, chỉ cần sơn tĩnh điện.']) },
  { title: 'Hoàn thành lô vách lục giác sơn đen cho công trình quán cà phê tại Thủ Dầu Một', category: 'tinTuc', cover: 'pVachLucGiac', excerpt: 'Hơn 120 m² vách lục giác thép 2 mm sơn đen nhám đã được lắp đặt trong 10 ngày.', content: richText(['Xưởng đã hoàn thành cắt, sơn và giao lắp lô vách lục giác cho công trình quán cà phê tại Thủ Dầu Một, Bình Dương.', 'Cảm ơn khách hàng đã tin tưởng Vinh Metal.']) },
  { title: 'Ra mắt bộ mẫu vách họa tiết tròn màu vàng đồng', category: 'tinTuc', cover: 'pVachTron', excerpt: 'Bộ mẫu mới gồm 12 họa tiết tròn, sẵn file cắt, giao nhanh trong 3 ngày.', content: richText(['Vinh Metal giới thiệu bộ mẫu vách họa tiết tròn với 12 kiểu, sơn tĩnh điện màu vàng đồng, đen hoặc trắng.', 'Liên hệ để nhận catalogue mẫu.']) },
  { title: 'Xưởng đầu tư thêm máy chấn CNC 3 m', category: 'tinTuc', cover: 'pVoTuDien', excerpt: 'Máy chấn mới cho phép gia công vỏ tủ điện, máng cáp dài đến 3 m với độ chính xác cao.', content: richText(['Từ tháng này, xưởng nhận gia công chấn gấp tấm dài đến 3 m, dày đến 6 mm.']) },
  { title: 'Tuyển thợ vận hành máy cắt laser CNC', category: 'tuyenDung', cover: 'heroSparks', excerpt: 'Làm việc tại Thuận An, Bình Dương. Lương thỏa thuận theo tay nghề, có phụ cấp.', content: richText([{ type: 'h2', text: 'Mô tả công việc' }, { type: 'ul', items: ['Vận hành máy cắt laser fiber.', 'Đọc bản vẽ, sắp xếp phôi cắt.', 'Kiểm tra chất lượng sản phẩm.'] }, { type: 'h2', text: 'Yêu cầu' }, { type: 'ul', items: ['Có kinh nghiệm 1 năm trở lên.', 'Chăm chỉ, cẩn thận.'] }, 'Liên hệ Mr Vinh 0946.272.467.']) },
]

export const PAGES = [
  { title: 'Giới thiệu', slug: 'gioi-thieu', cover: 'plateCut', intro: 'Công ty TNHH Vinh Metal chuyên cắt laser CNC, chấn gấp, hàn và gia công kim loại tấm theo bản vẽ.', content: richText([{ type: 'h2', text: 'Về Vinh Metal' }, 'Xưởng đặt tại Phường Bình Chuẩn, TP. Thuận An, Bình Dương. Từ một file bản vẽ, xưởng làm trọn các công đoạn cắt, chấn, hàn và sơn hoàn thiện, giao hàng tận nơi.', { type: 'h2', text: 'Năng lực sản xuất' }, { type: 'ul', items: ['Máy cắt laser fiber, khổ 1500 × 3000 mm, cắt thép đến 20 mm.', 'Máy chấn CNC 3 m.', 'Hàn TIG, MIG, hàn điểm.', 'Sơn tĩnh điện, mạ kẽm (liên kết).'] }, { type: 'h2', text: 'Cam kết' }, { type: 'ul', items: ['Báo giá trong 24 giờ.', 'Đúng bản vẽ, đúng hẹn.', 'Bảo hành theo thỏa thuận từng đơn hàng.'] }]) },
  { title: 'Chính sách bảo hành', slug: 'chinh-sach-bao-hanh', intro: 'Điều kiện và thời gian bảo hành sản phẩm gia công tại Vinh Metal.', content: richText(['Sản phẩm được bảo hành lỗi gia công (sai kích thước, mối hàn hở, bong sơn do lỗi xưởng) trong 6 tháng kể từ ngày giao.', 'Không bảo hành hư hỏng do va đập, lắp đặt sai hoặc sử dụng ngoài mục đích.']) },
  { title: 'Chính sách bảo mật', slug: 'chinh-sach-bao-mat', intro: 'Cách chúng tôi sử dụng thông tin bạn gửi qua website.', content: richText(['Thông tin bạn gửi qua form yêu cầu báo giá chỉ dùng để liên hệ và báo giá. Chúng tôi không chia sẻ cho bên thứ ba.', 'Bản vẽ khách gửi được lưu riêng và chỉ nhân viên phụ trách được xem.']) },
  { title: 'Hướng dẫn gửi bản vẽ', slug: 'huong-dan-gui-ban-ve', intro: 'Gửi đúng định dạng để nhận báo giá nhanh nhất.', content: richText([{ type: 'ul', items: ['Định dạng: DXF, DWG, PDF hoặc ảnh chụp rõ nét.', 'Ghi rõ vật liệu, độ dày, số lượng.', 'Đường nét khép kín, tỉ lệ 1:1, đơn vị mm.'] }, 'Gửi qua form Yêu cầu báo giá hoặc Zalo 0946.272.467.']) },
]
