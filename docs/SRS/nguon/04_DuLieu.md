# 4 Yêu cầu dữ liệu

## 4.1 Mô hình dữ liệu logic

Hình 2 thể hiện các thực thể dữ liệu của hệ thống và quan hệ giữa chúng. Mô hình không có thực thể Cửa hàng vì hệ thống chỉ phục vụ một cửa hàng (xem AS-1).

![Hình 2. Mô hình dữ liệu logic của hệ thống](../so-do/erd.png)

Hình 2 vẽ bội số theo trường hợp tổng quát. Bội số ĐƠN HÀNG – DÒNG ĐƠN HÀNG: TBD (xem C-7); ĐƠN HÀNG – YÊU CẦU HOÀN HÀNG: TBD (xem C-12).

## 4.2 Từ điển dữ liệu

| Phần tử dữ liệu | Mô tả | Kiểu hoặc thành phần | Độ dài | Giá trị |
|---|---|---|---|---|
| Customer đặt | Customer đã tạo đơn hàng | mã người dùng | | Người dùng có vai trò Customer |
| dòng đơn hàng | một sản phẩm trong đơn hàng, kèm số lượng đặt | sản phẩm<br>+ số lượng | | |
| địa chỉ giao | nơi giao đơn hàng cho người nhận | chuỗi | Chưa có số liệu | Định dạng: TBD (xem C-1) |
| đơn hàng | thông tin về một đơn hàng do Customer tạo | mã đơn hàng<br>+ Customer đặt<br>+ thời điểm tạo<br>+ 1:m{dòng đơn hàng}<br>+ người nhận<br>+ địa chỉ giao<br>+ trạng thái đơn hàng<br>+ 0:1{vận đơn} | | Một đơn hàng có một hay nhiều dòng đơn hàng: TBD (xem C-7) |
| họ tên | họ tên của người dùng | chuỗi | Chưa có số liệu | |
| kết quả xử lý | kết quả Admin ghi cho một sự cố | chuỗi, do Admin nhập | Chưa có số liệu | Bắt buộc nhập hay không: TBD (xem C-14). Chỉ ghi nhận, không xử lý tiền (xem BR-07) |
| lịch sử trạng thái | bản ghi một lần thay đổi trạng thái của đơn hàng | đơn hàng<br>+ người đổi<br>+ thời điểm<br>+ trạng thái cũ<br>+ trạng thái mới | | Chỉ được thêm (xem DI-1). Bản ghi đầu tiên: trạng thái cũ để trống |
| loại sự cố | loại sự cố được báo cho một đơn hàng | chuỗi | Chưa có số liệu | "Hàng hỏng", "Giao không thành công", "Thất lạc" |
| lý do hoàn hàng | lý do Customer chọn khi gửi yêu cầu hoàn hàng | chuỗi | Chưa có số liệu | Xem BR-04. Các lý do ngoài hai lý do bắt buộc: TBD (xem C-5) |
| lý do từ chối | lý do Admin ghi khi từ chối một yêu cầu hoàn hàng | chuỗi | Chưa có số liệu | Bắt buộc hay không: TBD (xem C-6) |
| mã đơn hàng | mã hệ thống gán cho mỗi đơn hàng khi lưu đơn | chuỗi | Chưa có số liệu | Duy nhất |
| mã người dùng | mã hệ thống gán cho mỗi người dùng | chuỗi | Chưa có số liệu | Duy nhất |
| mã sản phẩm | mã của một sản phẩm trong dữ liệu mẫu | chuỗi | Chưa có số liệu | Duy nhất |
| mã sự cố | mã hệ thống gán cho mỗi sự cố | chuỗi | Chưa có số liệu | Duy nhất |
| mã vận đơn | mã hệ thống gán cho mỗi vận đơn | chuỗi | Chưa có số liệu | Duy nhất (xem Track.Assign.Shipment) |
| mã yêu cầu | mã hệ thống gán cho mỗi yêu cầu hoàn hàng | chuỗi | Chưa có số liệu | Duy nhất |
| người báo | người dùng đã báo một sự cố | mã người dùng | | Shipper được phân công cho đơn hàng, hoặc Admin (xem Issue.Resolve.Lost) |
| người dùng | người có tài khoản trong hệ thống | mã người dùng<br>+ họ tên<br>+ vai trò<br>+ thông tin đăng nhập | | Các trường đăng ký / đăng nhập: TBD (xem C-10) |
| người đổi | người dùng đã làm trạng thái đơn hàng thay đổi | mã người dùng | | |
| người nhận | người nhận hàng của đơn hàng | tên người nhận<br>+ số điện thoại người nhận | | Thành phần, trường bắt buộc và định dạng: TBD (xem C-1) |
| sản phẩm | sản phẩm của cửa hàng mà Customer chọn khi tạo đơn hàng | mã sản phẩm<br>+ tên sản phẩm | | Dữ liệu mẫu (xem AS-3) |
| Shipper được phân công | Shipper được Admin phân công giao đơn hàng | mã người dùng | | Người dùng có vai trò Shipper |
| số điện thoại người nhận | số điện thoại của người nhận hàng | chuỗi | Chưa có số liệu | Định dạng: TBD (xem C-1) |
| số lần giao không thành công | dùng để quyết định giao lại hay trả lại một đơn hàng | số nguyên, tính ra, không lưu | Chưa có số liệu | Tính theo BR-06 |
| số lượng | số đơn vị của một sản phẩm trong một dòng đơn hàng | số nguyên | Chưa có số liệu | Ràng buộc giá trị: TBD (xem C-1) |
| sự cố | sự cố khi giao hàng được báo cho một đơn hàng | mã sự cố<br>+ đơn hàng<br>+ loại sự cố<br>+ người báo<br>+ thời điểm báo<br>+ kết quả xử lý | | |
| tên người nhận | tên của người nhận hàng | chuỗi | Chưa có số liệu | Bắt buộc hay không: TBD (xem C-1) |
| tên sản phẩm | tên của một sản phẩm | chuỗi | Chưa có số liệu | Dữ liệu mẫu (xem AS-3) |
| thời điểm | ngày giờ trạng thái đơn hàng thay đổi, trong một bản ghi lịch sử trạng thái | ngày giờ | Chưa có số liệu | |
| thời điểm báo | ngày giờ một sự cố được báo | ngày giờ | Chưa có số liệu | |
| thời điểm gửi | ngày giờ Customer gửi yêu cầu hoàn hàng | ngày giờ | Chưa có số liệu | |
| thời điểm tạo | ngày giờ đơn hàng được lưu | ngày giờ | Chưa có số liệu | |
| thời điểm tạo vận đơn | ngày giờ Admin tạo vận đơn | ngày giờ | Chưa có số liệu | |
| thông tin đăng nhập | thông tin người dùng dùng để đăng nhập | TBD (xem C-10) | | |
| trạng thái cũ | trạng thái đơn hàng trước một lần thay đổi | trạng thái đơn hàng | | Để trống ở bản ghi lịch sử đầu tiên |
| trạng thái đơn hàng | trạng thái hiện tại của một đơn hàng | chuỗi | Chưa có số liệu | "Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao", "Giao không thành công", "Đang hoàn hàng", "Đã hoàn về người bán", "Hư hỏng", "Thất lạc" (xem Hình A.2) |
| trạng thái mới | trạng thái đơn hàng sau một lần thay đổi | trạng thái đơn hàng | | |
| trạng thái yêu cầu hoàn hàng | trạng thái hiện tại của một yêu cầu hoàn hàng | chuỗi | Chưa có số liệu | "Chờ duyệt", "Đã chấp nhận", "Bị từ chối", "Hoàn tất" (xem Hình A.2) |
| vai trò | vai trò của người dùng, quyết định thao tác được phép (xem mục 6.2) | chuỗi | Chưa có số liệu | Customer, Shipper, Admin |
| vận đơn | thông tin Admin tạo cho một đơn hàng khi phân công Shipper | mã vận đơn<br>+ Shipper được phân công<br>+ thời điểm tạo vận đơn | | |
| yêu cầu hoàn hàng | yêu cầu Customer gửi để hoàn hàng cho một đơn hàng đã giao | mã yêu cầu<br>+ đơn hàng<br>+ lý do hoàn hàng<br>+ trạng thái yêu cầu hoàn hàng<br>+ thời điểm gửi<br>+ lý do từ chối | | Lý do từ chối có bắt buộc không: TBD (xem C-6). Một đơn hàng có một hay nhiều yêu cầu: TBD (xem C-12) |

## 4.3 Báo cáo

Không thuộc phiên bản này. Đề bài không yêu cầu báo cáo thống kê nên báo cáo nằm ngoài phạm vi (xem mục 1.3).

## 4.4 Toàn vẹn, lưu giữ và hủy dữ liệu

- **DI-1:** Hệ thống phải chỉ cho phép thêm bản ghi lịch sử trạng thái, không cho phép sửa hay xóa bản ghi đã có.

Việc ghi lịch sử mỗi khi trạng thái đơn hàng thay đổi là yêu cầu Track.Update.History ở mục 3.2, mục này không viết lại.

Thời hạn lưu dữ liệu: chưa có số liệu.
