# Phụ lục C Danh sách vấn đề mở

Các vấn đề dưới đây nhóm chưa chốt; mỗi chỗ ghi TBD trong tài liệu trỏ tới một dòng của bảng.

| Mã | Vấn đề | Ảnh hưởng tới | Ai chốt | Hạn |
|---|---|---|---|---|
| C-1 | Ngoài tên và số điện thoại người nhận, còn trường nào; trường nào bắt buộc; định dạng số điện thoại, địa chỉ; ràng buộc số lượng | Order.Create.Receiver, .Phone, .Address, .Quantity, .Required, .Format, 1.0.E1, §4.2 | Cả nhóm | 04/11/2026 |
| C-2 | Kênh thông báo cho Customer: trong ứng dụng hay email | CI-1, SI, UC-03, §2.1, §2.5 | Cả nhóm | 04/11/2026 |
| C-3 | Giao không thành công bao nhiêu lần thì chuyển trả lại | BR-06, T6, T7, UC-03 (3.1, 3.0.E2), UC-07, Issue.Resolve.Return, Track.Update.Next | Cả nhóm | 04/11/2026 |
| C-4 | Thời hạn yêu cầu hoàn hàng; mốc hết hạn có tính vào thời hạn không | BR-03, 5.0.E2, Return.Request.Window | Cả nhóm | 04/11/2026 |
| C-5 | Ngoài 2 lý do bắt buộc, còn lý do hoàn hàng nào | BR-04, §4.2, Return.Request.Reason | Cả nhóm | 04/11/2026 |
| C-6 | Từ chối yêu cầu hoàn hàng có bắt buộc ghi lý do không | Return.Review.Reject, UC-06 (6.1), §4.2 | Cả nhóm | 04/11/2026 |
| C-7 | Một đơn được chứa một hay nhiều sản phẩm | Order.Create.Product, UC-01, §4.1, §4.2 | Cả nhóm | 04/11/2026 |
| C-8 | Trình duyệt hỗ trợ | OE-2 | Cả nhóm | 04/11/2026 |
| C-9 | Ngôn ngữ giao diện (tiếng Việt?) | §2.4 | Cả nhóm | 04/11/2026 |
| C-10 | Thông tin tài khoản khi Customer đăng ký / đăng nhập | §4.2 (người dùng, thông tin đăng nhập) | Cả nhóm | 04/11/2026 |
| C-11 | Có báo sự cố được khi đơn ở trạng thái khác "Đang giao" (vd "Chờ lấy hàng", "Đang hoàn hàng") không | Hình A.2, Issue.Report.Type, UC-03, 3.4.1.1, Issue.Resolve.Lost, UC-07 (7.1) | Cả nhóm | 04/11/2026 |
| C-12 | Một đơn được gửi một hay nhiều yêu cầu hoàn hàng | Return.Request, UC-05, §4.1, §4.2, Return.Review.Issue, UC-06 | Cả nhóm | 04/11/2026 |
| C-13 | Lịch sử trạng thái hiển thị theo thứ tự cũ → mới hay mới → cũ | Track.View.History, UC-04 | Cả nhóm | 04/11/2026 |
| C-14 | Kết quả xử lý sự cố có bắt buộc nhập không (để trống thì hệ thống báo lỗi, hay vẫn coi sự cố đã xử lý) | Issue.Resolve.Result, UC-07 (7.0 bước 5), §4.2 | Cả nhóm | 04/11/2026 |
| C-15 | Ngày họp nhóm chốt các quyết định theo file 03 (ngày ghi ở cột Nguồn của BR) | BR-01, BR-02, BR-03, BR-04, BR-05, BR-06, BR-07 (§7) | Cả nhóm | 04/11/2026 |
