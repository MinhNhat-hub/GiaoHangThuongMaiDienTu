# AGENTS.md — quy tắc cho agent lập trình

Agent đọc tệp này trước khi làm việc trong kho. Agent xuyên qua ranh giới module nghĩa là ràng buộc viết chưa đủ rõ: sửa tệp này trước rồi hãy sửa mã.

## Quy tắc làm việc

1. Agent chỉ làm trên nhánh riêng, không merge, không đẩy thẳng lên `main`.
2. Không ghi vào cơ sở dữ liệu thật, không giữ khoá triển khai.
3. Không commit khoá API, mật khẩu, tệp `.env`.
4. Test do người viết là đặc tả: agent không sửa, không xoá, không đánh dấu bỏ qua, không nới assert, không viết mã xử lý riêng đúng đầu vào của test.
5. Test mâu thuẫn với SRS hoặc với test khác: dừng lại, báo test nào, mâu thuẫn chỗ nào. Không tự chọn cách hiểu.

## Khi nhận việc

- **Bắt buộc đọc `docs/srs/SRS.md` trước khi làm bất kỳ việc gì.** Đây là bản gốc của SRS: mọi sửa SRS làm trên tệp này, qua PR. `SRS.docx` xuất từ `SRS.md` để người đọc và để nộp, không sửa trực tiếp, không dùng làm nguồn. `docs/srs/source/` là bản chia theo chương của `SRS.md`: sửa `SRS.md` thì sửa chương tương ứng trong `source/` trong cùng PR. Thêm, đổi hay bỏ ID thì cập nhật `docs/srs/source/00_id_index.md` trong cùng PR. Mọi yêu cầu (FR, BR-xx, UC-xx, NFR) đối chiếu với tệp này. Việc cần một luật chưa có trong SRS thì hỏi lại trước khi làm.
- Không tự thêm luật, giới hạn, con số hay trạng thái mà SRS chưa có. Thấy cần thì nêu trong phần trả lời, không đưa vào mã.
- Xong việc thì báo: đã sửa tệp nào, đã chạy gì và kết quả, chỗ nào còn chưa chắc.

## Quy ước chung

- Code viết bằng tiếng Anh: tên biến, hàm, lớp, tệp, comment trong code, log. Commit, PR, review, comment viết tiếng Việt được, thuật ngữ kỹ thuật giữ tiếng Anh (xem mục "Ngôn ngữ" trong `README.md`).
- Tên file và tên folder trong toàn repo (cả `docs/`, `diagrams/`) đặt bằng tiếng Anh, không dấu, không tiếng Việt không dấu.
- Code và test không chứa ID SRS (`UC-`, `FR-`, `NFR-`, `BR-`…) ở bất kỳ đâu: tên biến, hàm, lớp, tệp, tên test, comment, chuỗi, log. Chỉ mô tả làm gì. Truy vết ghi trong mô tả PR.
- Không comment trong thân hàm. Comment ngắn đặt trên hàm; header của file chỉ chứa TODO còn cần bổ sung (xem mục "Comment trong code" của `README.md`).
- Sơ đồ thiết kế viết bằng Mermaid trong `diagrams/`.
- Thuật ngữ dùng đúng Phụ lục B của `docs/srs/SRS.md`.
- Commit message theo mục "Quy ước commit" trong `README.md`. Agent chạy skill `humanizer:humanizer` trên phần mô tả trước khi commit.
- Mô tả PR (`docs/templates/pull-request.md`), bản review PR và comment (cùng mẫu `docs/templates/review-pr.md`): agent chạy `humanizer:humanizer` trên văn bản cuối cùng trước khi đưa cho người dùng.

## Kiến trúc

- **Client** (`src/`, trừ `src/server/`): React 18, Vite 5, TypeScript 5, Tailwind CSS 3. Màn hình theo tính năng ở `src/features/`, gọi server qua `src/api/client.ts`, nhận cập nhật real-time qua `src/realtime/event-client.ts`. Kiểm tra dữ liệu nhập ở `src/utils/validation.ts` chỉ để báo lỗi sớm cho người dùng, không thay cho kiểm tra ở server.
- **Server** (`src/server/`): Node.js `http`, TypeScript, API REST ở `/api/v1`, đẩy cập nhật trạng thái qua SSE ở `/api/v1/events`.
  - `router.ts`: xác thực và phân quyền theo vai trò (SEC-x), đọc request, trả mã lỗi HTTP.
  - `storage.ts`: dữ liệu và quy tắc nghiệp vụ. Mọi bước chuyển trạng thái (Hình A.2, BR-01) và BR-02 đến BR-07 kiểm ở đây, kể cả khi request gửi thẳng tới server.
  - `auth.ts`: băm mật khẩu bằng scrypt (SEC-10). `events.ts`: kênh SSE. `seedData.ts`: dữ liệu seed. `failureInjection.ts`: giả lỗi lưu cho test, bật bằng header `X-Simulate-Failure`.
- **Dữ liệu** giữ trong bộ nhớ của server, không có database server. Khởi động lại server thì dữ liệu nạp lại từ seed.
- Ranh giới: không đưa quy tắc nghiệp vụ hay kiểm tra phân quyền chỉ vào client. Không sửa `seedData.ts` hay `failureInjection.ts` để test qua.

## Kiểm thử

- Tên test mô tả hành vi, không chứa ID SRS, ví dụ `test_cannot_cancel_delivered_order`.
- Xong việc thì chạy toàn bộ test.
- Unit test dùng Vitest, đặt ở `tests/unit/`, cấu hình ở `vitest.config.ts`. Chạy toàn bộ: `npm test`.
