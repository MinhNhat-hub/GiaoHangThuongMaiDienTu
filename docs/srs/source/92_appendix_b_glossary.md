# Phụ lục B Thuật ngữ

| Thuật ngữ | Tiếng Anh | Từ Shopee tương ứng | Định nghĩa |
|---|---|---|---|
| Admin | — | Người bán + Sàn | Nhân viên cửa hàng, gộp vai trò người bán và sàn của Shopee. Có thể có nhiều tài khoản Admin, cùng thuộc một cửa hàng (xem 2.2). |
| Cập nhật theo sự kiện (real-time) | Real-time Order Status Update | — | Khi trạng thái đơn hàng thay đổi, hệ thống hiển thị trạng thái mới trên màn hình người dùng đang mở mà không cần tải lại trang; không dùng cơ chế tự tải lại theo chu kỳ (xem CO-1, RT-1, RT-2). |
| Customer | — | Người mua | Người mua của cửa hàng. Customer tạo đơn hàng, theo dõi đơn và yêu cầu hoàn hàng (xem 2.2). |
| Cửa hàng | — | Shop (S5) | Hệ thống là web riêng của một cửa hàng, không phải sàn có nhiều người bán (xem AS-1). |
| Đơn hàng | Order | — | Đơn do Customer tạo, gồm sản phẩm, số lượng, người nhận và địa chỉ giao (xem 4.2). |
| Giao không thành công | Failed Delivery | "Giao hàng không thành công" (S5) | Trạng thái đơn hàng, đồng thời là một loại sự cố: Shipper không giao được hàng cho người nhận khi đơn ở "Đang giao". Đơn được giao lại hoặc chuyển sang trả lại (xem BR-06). |
| Hoàn hàng | Return Order | "Trả hàng / Hoàn tiền" (S1) | Chức năng (xem 3.3): Customer yêu cầu trả hàng / hoàn tiền cho đơn ở trạng thái "Đã giao" (xem BR-02, BR-04). Customer kích hoạt. Lưu ý: trạng thái "Đang hoàn hàng" thuộc ngả Trả lại, không thuộc chức năng Hoàn hàng. |
| Hư hỏng | Damaged Order | Hư hỏng (S3) | Trạng thái kết thúc của đơn hàng khi hàng bị hỏng. Phát hiện qua 2 ngả: Shipper báo sự cố, hoặc qua yêu cầu hoàn hàng (xem BR-05, Hình A.2). |
| Lịch sử trạng thái | Shipment History | — | Danh sách các lần trạng thái đơn hàng thay đổi. Mỗi bản ghi gồm người đổi, thời điểm, trạng thái cũ, trạng thái mới. Chỉ được thêm, không được sửa hay xóa (xem DI-1). |
| Người bán | — | Người bán (S4) | Bên bán hàng trên Shopee. Trong hệ thống, vai trò người bán do Admin đảm nhận (xem Admin, AS-1); dùng trong tên trạng thái "Đã hoàn về người bán". |
| Shipper | — | Nhân viên SPX | Nhân viên giao hàng. Shipper lấy hàng, giao hàng, cập nhật trạng thái và báo sự cố (xem 2.2). |
| Sự cố | Delivery Issue | — | Vấn đề ghi nhận trong lúc giao hàng, gồm 3 loại: "Hàng hỏng", "Giao không thành công", "Thất lạc". Shipper báo sự cố (Admin cũng ghi được sự cố "Thất lạc"); Admin xử lý (xem 3.4). |
| TBD | To Be Determined | — | Nhóm chưa chốt, không có nguồn. Mỗi TBD trỏ tới 1 dòng ở Phụ lục C. Phiên bản này không còn chỗ TBD. |
| Thất lạc | Lost Order | Mất hàng, thất lạc (S3) | Trạng thái kết thúc của đơn hàng khi không tìm thấy hàng. Phát hiện qua 2 ngả: Shipper hoặc Admin xác nhận khi giao, hoặc qua yêu cầu hoàn hàng (xem BR-05, Hình A.2). |
| TMĐT | E-commerce | — | Viết tắt của "thương mại điện tử", dùng trong tên hệ thống ở Hình 1 và Hình A.1. |
| Trả lại | Returned Order | "Giao hàng không thành công" → "Đang hoàn hàng" (S5); "hoàn trả hàng" (S3) | Ngoại lệ (xem 3.4): giao không thành công, hàng quay về người bán. Shipper báo, Admin xử lý. Đơn chuyển qua "Đang hoàn hàng" rồi "Đã hoàn về người bán" (xem BR-06, Hình A.2). |
| Vận đơn | Shipment | Đơn vận chuyển (S5) | Đơn vận chuyển do Admin tạo cho một đơn hàng, có mã vận đơn duy nhất và Shipper được phân công (xem 3.2). |
| Yêu cầu hoàn hàng | Return Request | Yêu cầu "Trả hàng / Hoàn tiền" (S1) | Yêu cầu Customer gửi cho một đơn "Đã giao", kèm lý do hoàn hàng (xem BR-02, BR-04). Admin chấp nhận hoặc từ chối (xem 3.3). |
