# 6 Thuộc tính chất lượng

## 6.1 Cập nhật trạng thái thời gian thực

Trạng thái được cập nhật theo sự kiện (xem CO-1), nên các yêu cầu dưới đây được kiểm theo kiểu có/không (trạng thái mới có hiện mà không cần tải lại trang hay không), không đo thời gian.

- **RT-1:** Khi trạng thái một đơn hàng thay đổi do Shipper hoặc Admin xác nhận, hệ thống phải hiển thị trạng thái mới trên màn hình Theo dõi vận chuyển hoặc Chi tiết đơn hàng (xem UI-1) của đơn hàng đó đang mở trên máy Customer, mà không cần người dùng tải lại trang.
- **RT-2:** Khi trạng thái một đơn hàng thay đổi do Shipper hoặc Admin xác nhận, hệ thống phải hiển thị trạng thái mới trong danh sách đơn hàng (xem Track.Admin.List) trên màn hình Bảng điều khiển Admin (xem UI-1) đang mở, mà không cần người dùng tải lại trang.

## 6.2 Bảo mật

- **SEC-1:** Hệ thống phải yêu cầu người dùng đăng nhập cho mọi thao tác, trừ đăng ký tài khoản Customer và đăng nhập.
- **SEC-2:** Hệ thống phải chỉ cho phép Customer tạo đơn hàng đứng tên chính mình, và chỉ xem đơn hàng, yêu cầu hoàn hàng do chính mình tạo.
- **SEC-3:** Hệ thống phải chỉ cho phép Customer gửi yêu cầu hoàn hàng cho đơn hàng do chính Customer đó tạo.
- **SEC-4:** Hệ thống phải chỉ cho phép Shipper xem và cập nhật đơn hàng được phân công cho chính Shipper đó.
- **SEC-5:** Hệ thống phải chỉ cho phép Admin tạo vận đơn và phân công đơn hàng cho Shipper.
- **SEC-6:** Hệ thống phải chỉ cho phép Admin duyệt, từ chối và ghi nhận hoàn tất yêu cầu hoàn hàng.
- **SEC-7:** Hệ thống phải chỉ cho phép Admin xử lý sự cố (xem UC-07).

## 6.3 Độ bền vững

- **ROB-1:** Khi người dùng đang mở một màn hình hiển thị trạng thái đơn hàng (xem RT-1, RT-2) thì mất kết nối rồi kết nối lại, hệ thống phải hiển thị trạng thái mới nhất của các đơn hàng trên màn hình đó, kể cả thay đổi xảy ra trong lúc mất kết nối.

Các thuộc tính chất lượng khác (hiệu năng, khả dụng, an toàn, dễ dùng) chưa có yêu cầu đo được ở phiên bản này. Vì vậy tài liệu không có yêu cầu hiệu năng (PER-x).
