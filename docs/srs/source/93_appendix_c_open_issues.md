# Phụ lục C Danh sách vấn đề mở

Nhóm đã chốt C-1 đến C-14 ngày 10/11/2026 (C-15 đã đóng ở bản 1.0 nháp 3); kết quả đã ghi vào các mục liên quan (xem Lịch sử sửa đổi).

Các vấn đề dưới đây được tìm ra ngày 13/11/2026, khi viết Test Specification và khi review SRS 1.0 và Test Specification. Bản 1.0.1 chỉ liệt kê, chưa sửa yêu cầu nào. Vấn đề "Đã chốt" sẽ được ghi vào các mục liên quan ở bản 1.1. Đến lúc đó, test case ở những chỗ này chỉ kiểm phần SRS đã nêu.

| Mã | Vấn đề | Ảnh hưởng tới | Hướng xử lý | Trạng thái |
|---|---|---|---|---|
| C-16 | Đơn có hai dòng cùng một sản phẩm thì hệ thống xử lý thế nào | Order.Create.Product | Từ chối và chỉ ra dòng trùng | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-17 | Thiếu nhiều trường bắt buộc cùng lúc thì chỉ ra một trường hay tất cả | Order.Create.Required, Account.Register.Required | Chỉ ra tất cả các trường còn thiếu | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-18 | Admin lưu phân công khi chưa chọn Shipper | Track.Assign.Shipper | Từ chối, chỉ ra phải chọn Shipper | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-19 | Customer thấy những trường nào của một bản ghi lịch sử trạng thái | Track.View.History | Thời điểm, trạng thái cũ, trạng thái mới; không hiện người đổi | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-20 | Người dùng không đồng ý ở bước xác nhận thì sao | Track.Update.Confirm, 3.0.E1, 3.0.E2, 3.0.E3, Issue.Resolve.Returned | Không lưu gì, trạng thái giữ nguyên | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-21 | Sau khi kết nối lại, màn hình có tự cập nhật không, lịch sử trạng thái có cập nhật không | 4.0.E1, ROB-1 | Tự cập nhật, không cần tải lại trang, kể cả lịch sử trạng thái | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-22 | Mật khẩu chỉ gồm khoảng trắng, trong khi §4.2 cho phép mọi ký tự | Account.Register.Required, §4.2 | Coi là thiếu; "mọi ký tự" áp cho mật khẩu có ký tự khác khoảng trắng | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-23 | Email có được bỏ khoảng trắng hai đầu trước khi kiểm định dạng không | Account.Register.Email | Có, giống cách so khớp ở Account.Register.Unique | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-24 | Mật khẩu có phân biệt chữ hoa, chữ thường không; đăng nhập khi để trống email hoặc mật khẩu thì sao | Account.Login.Credentials, Account.Login.Fail | Phân biệt chữ hoa, chữ thường; để trống thì chỉ ra trường còn thiếu | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-25 | Gửi yêu cầu hoàn hàng sai nhiều điều kiện cùng lúc thì báo lỗi nào | 5.0.E1, 5.0.E2, 5.0.E4 | Báo lỗi đầu tiên theo thứ tự kiểm ở UC-05: trạng thái, rồi thời hạn, rồi đã có yêu cầu | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-26 | Có mô tả kèm một lý do khác "Khác" thì sao | Return.Request.Reason | Không bắt buộc; có thì vẫn lưu | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-27 | Mốc 15 ngày tính chính xác tới phút hay tới giây | BR-03 | Tới phút, khớp định dạng hiển thị dd/MM/yyyy HH:mm | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-28 | Đơn đã có 3 sự cố "Giao không thành công": ghi kết quả cho sự cố thứ 1, thứ 2 có bị chặn không; một sự cố có được ghi kết quả hai lần không | Issue.Resolve.Result, BR-06 | Chặn mọi sự cố loại đó của đơn cho tới khi đơn sang "Đang hoàn hàng"; mỗi sự cố chỉ ghi kết quả một lần | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-29 | Request đăng ký gửi kèm trường vai trò | Account.Register.Role | Bỏ qua trường đó, vẫn gán Customer | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-30 | Request đăng nhập sai gửi thẳng tới server: phản hồi có phải giống nhau cả ở mã trạng thái không | SEC-11 | Cùng mã trạng thái và cùng thông báo; không đo thời gian | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-31 | DI-1 áp cho kênh nào | DI-1 | Mọi kênh: giao diện không có chức năng sửa, xóa; server từ chối request sửa, xóa | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-32 | Nhiều trường cùng vượt độ dài thì sao | DI-2 | Chỉ ra tất cả, giống C-17 | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-33 | Request tạo đơn có kèm trạng thái đích | BR-01, Track.Update.Valid | Bỏ qua, đơn luôn bắt đầu ở "Chờ xác nhận" | Đã chốt 13/11/2026, ghi vào bản 1.1 |
| C-34 | Số điện thoại vừa sai định dạng vừa dài hơn độ dài ở §4.2 (ví dụ 11 chữ số) thì báo lỗi định dạng hay lỗi vượt độ dài | Order.Create.Phone, Account.Register.Phone, DI-2, §4.2 | Phương án đã nêu: DI-2 không áp cho trường có quy tắc định dạng với độ dài cố định, hoặc báo lỗi nào trong hai lỗi cũng đạt | Chưa chốt |
| C-35 | Order.Done.Success (hiển thị thông báo thành công) là một bước của giao dịch Order.Done nhưng chạy sau khi đơn đã lưu; lỗi ở bước này có phải hoàn tác đơn không | Order.Done.Success, Order.Done.Failure | Chưa có phương án | Chưa chốt |
| C-36 | Độ dài ở §4.2 đếm theo đơn vị nào (ký tự, code point hay byte), và đếm trước hay sau khi bỏ khoảng trắng hai đầu | §4.2, DI-2, Account.Register.Password, SEC-10 | Phương án đã nêu: đếm số ký tự Unicode sau khi chuẩn hóa NFC; ghi rõ có bỏ khoảng trắng hai đầu trước khi đếm không | Chưa chốt |
| C-37 | Request gửi yêu cầu hoàn hàng kèm trạng thái đích khác "Chờ duyệt" thì hệ thống từ chối hay bỏ qua trạng thái đó | BR-01, Return.Request.Store, Return.Review.Valid | Chưa có phương án; C-33 chỉ chốt cho đơn hàng | Chưa chốt |
