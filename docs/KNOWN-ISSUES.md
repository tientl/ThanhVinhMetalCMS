# Lỗi đã biết và việc còn nợ

Những chỗ phát hiện khi viết bộ test (09/10/2026). Mỗi mục có cách tái hiện và hướng sửa. Sửa xong thì xóa mục đó khỏi file và thêm test chặn hồi quy.

| # | Vấn đề | Mức độ | Ảnh hưởng |
|---|---|---|---|
| 1 | `/api/quote` trả 500 khi tệp đính kèm bị Payload từ chối | Cao | Mất yêu cầu báo giá của khách |
| 2 | Không gán được "Sản phẩm liên quan" lúc tạo mới qua API | Trung bình | Import, seed, tích hợp ngoài |
| 3 | `/api/search` chưa có nơi nào gọi | Thấp | Code chết, hoặc tính năng dang dở |

---

## 1. `/api/quote` trả 500 khi tệp đính kèm bị Payload từ chối

**Mức độ:** cao. Khách gửi yêu cầu báo giá kèm bản vẽ, request đổ 500, form chỉ hiện "Gửi thất bại" chung chung, **và yêu cầu không được lưu**. Xưởng mất đơn mà không biết.

**Nơi xảy ra:** [src/app/(frontend)/api/quote/route.ts:54](../src/app/(frontend)/api/quote/route.ts#L54)

Route tự kiểm tra phần mở rộng và dung lượng, nhưng Payload còn kiểm tra **cấu trúc thật** của tệp (`checkFileRestrictions`): PDF phải có header `%PDF-`, bảng `xref` và `%%EOF`. Tệp trượt vòng này làm `payload.create` ném lỗi, mà quanh đó không có `try/catch` nên lỗi thoát ra khỏi route handler.

**Tái hiện:**

```bash
# PDF đúng đuôi, đúng mimetype, dưới 10 MB nhưng nội dung không phải PDF hợp lệ
printf '%%PDF-1.4' > hong.pdf
curl -i -F "name=Khách" -F "phone=0946272467" -F "attachment=@hong.pdf" \
  http://localhost:3000/api/quote
# → 500, không có bản ghi nào trong quote-requests
```

Khách thật dễ dính: PDF xuất từ phần mềm lạ, tệp tải dở, hoặc đổi đuôi tay cho "hợp lệ".

**Hướng sửa:** bọc `try/catch` quanh phần tạo `quote-files`, trả 400 kèm thông báo tiếng Việt (ví dụ "Tệp bản vẽ không đọc được, vui lòng xuất lại hoặc gửi ảnh chụp"). Cân nhắc thêm: **vẫn lưu yêu cầu báo giá** dù tệp hỏng, rồi ghi chú là khách có gửi tệp nhưng không nhận được — mất bản vẽ còn đỡ hơn mất cả đơn.

Lưu ý thêm: tệp được tạo **trước** bản ghi yêu cầu ([route.ts:68](../src/app/(frontend)/api/quote/route.ts#L68)). Nếu bước tạo yêu cầu lỗi thì tệp đã upload thành rác trong `uploads/quote-files`.

---

## 2. Không gán được "Sản phẩm liên quan" lúc tạo mới qua API

**Mức độ:** trung bình. Trong admin thì không gặp vì biên tập viên tạo xong mới chọn. Nhưng script import, seed hoặc tích hợp ngoài tạo kèm `related` sẽ trượt validate.

**Nơi xảy ra:** [src/collections/Products.ts:117](../src/collections/Products.ts#L117) và [src/collections/Posts.ts:97](../src/collections/Posts.ts#L97)

```ts
filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
```

Lúc `create`, document chưa có `id` nên điều kiện thành `not_in: [undefined]`, mọi lựa chọn đều bị coi là không hợp lệ.

**Tái hiện:**

```ts
await payload.create({
  collection: 'products',
  data: { name: 'Thử', category: 1, images: [{ image: 1 }], related: [2] },
})
// → ValidationError: Field sau không hợp lệ: Sản phẩm liên quan
```

Tạo trước rồi `update` sau thì chạy bình thường — đó cũng là cách `tests/int/data.test.ts` đang làm.

**Hướng sửa:** bỏ qua điều kiện khi chưa có id:

```ts
filterOptions: ({ id }) => (id ? { id: { not_in: [id] } } : true),
```

---

## 3. `/api/search` chưa có nơi nào gọi

**Mức độ:** thấp. Endpoint chạy đúng (đã có test ở `tests/int/api.test.ts` và `tests/e2e/search.spec.ts`), chỉ là không component nào dùng — `grep -r "api/search" src/` không ra kết quả.

**Nơi xảy ra:** [src/app/(frontend)/api/search/route.ts](../src/app/(frontend)/api/search/route.ts)

Ô tìm kiếm trên header ([HeaderClient.tsx](../src/components/layout/HeaderClient.tsx), phần `SearchOverlay`) chỉ hiện chip "Gợi ý tìm nhanh" lấy từ global Điều hướng; gõ xong Enter thì chuyển sang `/tim-kiem`. Trang `/tim-kiem` gọi thẳng `search()` trong `src/lib/data.ts`, không qua API.

**Cần quyết:** endpoint này vốn định dùng cho gợi ý tức thì khi gõ trong overlay (đúng phạm vi `docs/SCOPE.md` không?), hay là code thừa nên xóa. Nếu làm gợi ý tức thì thì nhớ thêm debounce và giới hạn số lần gọi.

---

## Lưu ý khi mở rộng

- **Rate limit nằm trong bộ nhớ tiến trình** ([src/lib/rateLimit.ts](../src/lib/rateLimit.ts)). Hiện đúng vì PM2 chạy `instances: 1, exec_mode: 'fork'` ([deploy/ecosystem.config.cjs](../deploy/ecosystem.config.cjs)). Nếu sau này tăng số instance hoặc chuyển sang cluster mode thì mỗi tiến trình đếm riêng, trần thực tế thành 5 × số tiến trình — lúc đó phải chuyển sang Redis.
- **`tsconfig.tsbuildinfo` đang được commit vào git.** Đây là cache của `tsc`, đổi sau mỗi lần `pnpm typecheck` nên lần nào cũng bẩn working tree. Nên `git rm --cached` rồi thêm vào `.gitignore`.
