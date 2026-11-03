<!-- Dùng cho cả bản review PR lẫn comment trên dòng mã. Comment lẻ thì chỉ lấy một ý theo dạng ở mục "Cần sửa". -->
<!-- Viết xong thì chạy toàn bộ qua humanizer:humanizer rồi mới đăng, giữ nguyên nhãn và đoạn mã. Xoá các dòng chú thích. -->
<!-- Nhãn: [cần sửa] chặn merge · [góp ý] người làm tự quyết · [hỏi] cần giải thích · [nit] đặt tên, định dạng. -->
## Review PR #<số> — <tiêu đề>

### Kết luận

- [ ] Duyệt
- [ ] Duyệt, sửa nhỏ ở PR sau
- [ ] Cần sửa trước khi merge

### Đã kiểm

- Chạy test: <lệnh> → <kết quả>
- Chạy thử: <luồng đã thử> → <kết quả>

### Cần sửa (chặn merge)

<!-- Không có thì ghi "không". -->

1. `tệp:dòng` [cần sửa] <vấn đề>
   Vì sao: <lý do>
   Đề xuất: <cách sửa>

### Góp ý (không chặn)

<!-- Nhãn [góp ý], [hỏi] hoặc [nit]. -->

1. `tệp:dòng` [nhãn] <vấn đề>
   Vì sao: <lý do>
   Đề xuất: <cách sửa>

### Điểm tốt

<!-- Không bắt buộc. -->

<!-- Người làm trả lời từng ý bằng một dòng: "Đã sửa ở <mã commit>." / "Không sửa vì <lý do>." / "Để PR sau: <việc cần làm>." Người mở ý là người bấm Resolve. -->
