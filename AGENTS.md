# AGENTS.md — quy tắc cho agent lập trình

Agent đọc tệp này trước khi làm việc trong kho. Agent xuyên qua ranh giới module nghĩa là ràng buộc viết chưa đủ rõ: sửa tệp này trước rồi hãy sửa mã.

## Quy tắc làm việc

1. Agent chỉ làm trên nhánh riêng, không merge, không đẩy thẳng lên `main`.
2. Không ghi vào cơ sở dữ liệu thật, không giữ khoá triển khai.
3. Không commit khoá API, mật khẩu, tệp `.env`.
4. Test do người viết là đặc tả: agent không sửa, không xoá, không đánh dấu bỏ qua, không nới assert, không viết mã xử lý riêng đúng đầu vào của test.
5. Test mâu thuẫn với SRS hoặc với test khác: dừng lại, báo test nào, mâu thuẫn chỗ nào. Không tự chọn cách hiểu.

## Khi nhận việc

- Đối chiếu yêu cầu trong `docs/SRS/nguon/` (FR, BR-xx, UC-xx). Việc cần một luật chưa có trong SRS thì hỏi lại trước khi làm.
- Không tự thêm luật, giới hạn, con số hay trạng thái mà SRS chưa có. Thấy cần thì nêu trong phần trả lời, không đưa vào mã.
- Xong việc thì báo: đã sửa tệp nào, đã chạy gì và kết quả, chỗ nào còn chưa chắc.

## Quy ước chung

- Sơ đồ thiết kế viết bằng Mermaid trong `diagrams/`.
- Thuật ngữ dùng đúng `docs/SRS/nguon/92_PhuLucB_ThuatNgu.md`.
- Commit message một dòng, nói **vì sao** chứ không phải cái gì.

## Kiến trúc

<!-- Điền khi chốt công nghệ ở giai đoạn 2: phân tầng, bất biến nghiệp vụ (BR-xx đặt ở lớp nào), ranh giới agent không được vượt. -->

## Kiểm thử

- Test luật nghiệp vụ đặt tên theo mã luật, ví dụ `test_BR03_quay_da_nhan_thi_khong_huy_duoc`.
- Xong việc thì chạy toàn bộ test.
<!-- Ghi lệnh chạy test của nhóm khi đã chọn công nghệ. -->
