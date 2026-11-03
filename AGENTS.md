# AGENTS.md — quy tắc cho agent lập trình

Agent đọc tệp này trước khi làm việc trong kho. Agent xuyên qua ranh giới module nghĩa là ràng buộc viết chưa đủ rõ: sửa tệp này trước rồi hãy sửa mã.

## Quy tắc làm việc

1. Agent chỉ làm trên nhánh riêng, không merge, không đẩy thẳng lên `main`.
2. Không ghi vào cơ sở dữ liệu thật, không giữ khoá triển khai.
3. Không commit khoá API, mật khẩu, tệp `.env`.
4. Test do người viết là đặc tả: agent không sửa, không xoá, không đánh dấu bỏ qua, không nới assert, không viết mã xử lý riêng đúng đầu vào của test.
5. Test mâu thuẫn với SRS hoặc với test khác: dừng lại, báo test nào, mâu thuẫn chỗ nào. Không tự chọn cách hiểu.

## Khi nhận việc

- **Bắt buộc đọc `docs/srs/SRS.md` trước khi làm bất kỳ việc gì.** Đây là bản gốc của SRS: mọi sửa SRS làm trên tệp này, qua PR. `SRS.docx` xuất từ `SRS.md` để người đọc và để nộp, không sửa trực tiếp, không dùng làm nguồn. Thêm, đổi hay bỏ ID trong `SRS.md` thì cập nhật `docs/srs/id_index.md` trong cùng PR. Mọi yêu cầu (FR, BR-xx, UC-xx, NFR) đối chiếu với tệp này. Việc cần một luật chưa có trong SRS thì hỏi lại trước khi làm.
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

<!-- Điền khi chốt công nghệ ở giai đoạn 2: phân tầng, bất biến nghiệp vụ (BR-xx đặt ở lớp nào), ranh giới agent không được vượt. -->

## Kiểm thử

- Tên test mô tả hành vi, không chứa ID SRS, ví dụ `test_cannot_cancel_delivered_order`.
- Xong việc thì chạy toàn bộ test.
<!-- Ghi lệnh chạy test của nhóm khi đã chọn công nghệ. -->
