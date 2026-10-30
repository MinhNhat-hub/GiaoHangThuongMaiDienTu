Agent: <công cụ hoặc "không"> · Điều khiển: N07-B · Review: N07-A
Đóng #

<!-- Dòng đầu: tên công cụ agent (hoặc "không"), mã người điều khiển phiên agent, mã người review. Người review khác người điều khiển. -->
<!-- "Đóng #<số>": số của đúng một hạng mục trên tab Issues. Dòng này không tự đóng hạng mục: Phụ trách yêu cầu nghiệm thu theo Given–When–Then rồi đóng. Làm lại sau khi đã merge thì mở PR mới ghi cùng số. -->
<!-- PR tài liệu (chỉ sửa bao-cao/, docs/, diagrams/, phieu-thay-doi/ hoặc tệp .md ở gốc kho) chỉ cần dòng đầu, xoá dòng "Đóng #". -->

### Mô tả ngắn

<!-- Thay đổi gì, vì sao. Trỏ tới use case, yêu cầu, sơ đồ hoặc phiếu thay đổi liên quan nếu có. -->

### Test

Sửa hoặc xoá test đã có? Vì sao:

<!-- Để trống nếu PR không sửa, đổi tên hay xoá tệp nào đã có trong tests/. Có thì ghi tệp nào và vì sao, ví dụ: "tests/luat/test_huy_don.py: lớp Don đổi tên thành DonHang theo class.mmd, chỉ sửa dòng import". Test trong tests/luat/ là đặc tả do nhóm viết; agent không sửa. Người review đọc diff của tests/ trước diff mã. kiem-pr cảnh báo nếu PR sửa test đã có mà dòng trên còn trống. -->

### Mục kiểm

- [ ] Người review đã đọc diff và chạy thử trên máy mình
- [ ] Bộ test chạy đạt (hoặc ghi rõ ca hỏng và lý do)
- [ ] Sơ đồ trong `diagrams/` vẫn khớp mã (nếu PR đổi lớp hay luồng)
- [ ] Không có khoá, mật khẩu, họ tên, MSSV hay email trong thay đổi
