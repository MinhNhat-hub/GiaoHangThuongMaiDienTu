# Gửi TV2 – Thay đổi ID của SRS so với danh sách ngày 31/10/2026

Nguồn đối chiếu: `docs/srs/id_index.md` bản 02/11/2026 (61 FR, C-1..C-15). Mỗi dòng dưới đây cần một dòng mới hoặc dòng sửa trong Test Plan §2.

## 1. ID mới

| ID | Ở đâu | Nội dung |
|---|---|---|
| `Order.Create.Phone` | 3.1.3 | Nhập số điện thoại người nhận (tách khỏi `.Receiver`) |
| `Order.Done.Reason` | 3.1.3 | Báo tạo đơn không thành công kèm lý do (tách khỏi `.Failure`) |
| `Track.Update.Status` | 3.2.3 | Chuyển đơn sang trạng thái Shipper đã chọn (T3, T4, T6) khi Shipper xác nhận |
| `Track.Admin` / `Track.Admin.List` | 3.2.3 | Admin xem danh sách đơn ở mọi trạng thái (dùng ở UC-07 7.1, 7.2; RT-2) |
| `Return.Request.Window` | 3.3.3 | Chỉ cho gửi yêu cầu khi còn trong thời hạn BR-03 (tách khỏi `.Eligible`) |
| `Return.Review.Valid` | 3.3.3 | Từ chối bước chuyển trạng thái yêu cầu hoàn hàng không có trên Hình A.2 |
| `Issue.Resolve.LostStore` | 3.4.2.3 | Ghi sự cố "Thất lạc" với người báo là Admin (tách khỏi `.Lost`) |
| `Issue.Resolve.LostStatus` | 3.4.2.3 | Chuyển đơn sang "Thất lạc" (T10) khi Admin xác nhận (tách khỏi `.Lost`) |
| Luồng `7.2` | UC-07 | Admin xác nhận đã nhận lại hàng (T8) |
| `C-13`, `C-14`, `C-15` | Phụ lục C | Thứ tự hiển thị lịch sử; kết quả xử lý có được để trống không; ngày họp nhóm (cột Nguồn của BR) |

## 2. ID giữ nguyên, nội dung đổi

| ID | Thay đổi |
|---|---|
| `Order.Create.Receiver` | Chỉ còn tên người nhận |
| `Order.Create.Quantity` | Bỏ "số nguyên lớn hơn 0"; ràng buộc là TBD (C-1) |
| `Order.Done.Failure` | Chỉ còn hoàn tác (rollback) |
| `Track.Update.Next` | Chỉ các bước T3, T4, T6; T5, T9, T10 chỉ qua `Issue.Report` |
| `Track.Update.Valid` | Chỉ cho đơn hàng (yêu cầu hoàn hàng chuyển sang `Return.Review.Valid`) |
| `Track.View.History` | Chiều sắp xếp TBD (C-13) |
| `Return.Request.Eligible` | Chỉ còn điều kiện "Đã giao"; quyền của Customer xem SEC-3 |
| `Return.Review.List` | Hiện cả yêu cầu "Đã chấp nhận" |
| `Issue.Resolve.Lost` | Chỉ còn việc cho Admin xác nhận thất lạc |
| `Issue.Resolve.Result` | Không cho ghi kết quả sự cố "Giao không thành công" khi đơn đã đạt BR-06 mà chưa sang "Đang hoàn hàng"; bắt buộc nhập hay không: TBD (C-14) |
| `RT-1`, `RT-2` | RT-1 chỉ còn "hiển thị" (bỏ "lưu"); tên màn hình theo UI-1; RT-2 áp dụng cho `Track.Admin.List` |
| `ROB-1` | Áp dụng cho mọi màn hình ở RT-1, RT-2 |
| `SEC-2` | Thêm "chỉ tạo đơn đứng tên chính mình" |
| `SEC-6` | Thêm "ghi nhận hoàn tất" |
| Luồng `1.0` (UC-01) | Bước 8 có nhánh hủy thao tác tạo đơn |
| Luồng `3.0`, `3.1` (UC-03) | Bước 4 trỏ `Track.Update.Next`; bước 7, 11 (3.0) và bước 5 (3.1) trỏ `Track.Update.Status` |
| `2.0.E1` | Trỏ thêm `Track.Update.Valid` |
| Luồng `6.0`, `6.2` (UC-06) | 6.0 bước 1 hiện cả "Đã chấp nhận"; 6.2 bắt đầu "Tại bước 2 của luồng chính" |
| Luồng `7.0` (UC-07) | Viết lại: bước 3 kiểm BR-06 (đạt → bước 4, chưa đạt → bước 5); bước 4 bắt buộc chuyển trả lại trước khi ghi kết quả |
| `7.0.E1` | Đổi tên: "Admin yêu cầu chuyển trả lại khi chưa đạt số lần giao không thành công ở BR-06" |
| `C-1`, `C-4` | C-1 thêm "ràng buộc số lượng"; C-4 thêm "mốc hết hạn có tính vào thời hạn không" |
| `BR-01`..`BR-07` | Cột Nguồn: "Quyết định nhóm ngày TBD (xem C-15)" |

## 3. Không còn

- Hai phần tử dữ liệu "Admin xử lý", "thời điểm xử lý" (§4.2, ERD): bỏ vì không FR nào tạo ra. Không phải ID, chỉ ảnh hưởng ca kiểm dữ liệu nếu đã viết.
