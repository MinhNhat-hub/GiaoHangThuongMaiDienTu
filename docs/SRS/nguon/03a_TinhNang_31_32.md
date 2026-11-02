# 3 Tính năng hệ thống

## 3.1 Tạo đơn hàng

### 3.1.1 Mô tả và độ ưu tiên

Customer đã đăng nhập chọn sản phẩm từ danh sách sản phẩm của cửa hàng, nhập số lượng, thông tin người nhận và địa chỉ giao để tạo đơn hàng. Đơn tạo thành công được gán mã đơn hàng và ở trạng thái "Chờ xác nhận" (xem Hình A.2). Customer có thể sửa hoặc hủy thao tác tạo đơn trước khi xác nhận. Sửa, hủy đơn đã tạo và thanh toán nằm ngoài phạm vi phiên bản này (xem 1.3). Độ ưu tiên = Cao.

### 3.1.2 Use Case

```uc
Mã và tên: | UC-01 Tạo đơn hàng
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Customer | Tác nhân phụ: | Không có
Mô tả: | Customer chọn sản phẩm của cửa hàng, nhập số lượng, thông tin người nhận và địa chỉ giao, xem lại thông tin rồi xác nhận để tạo đơn hàng. Đơn tạo thành công có mã đơn hàng và ở trạng thái "Chờ xác nhận" (xem Hình A.2), chờ Admin phân công cho Shipper (xem UC-02).
Điều kiện kích hoạt: | Customer cho biết muốn tạo đơn hàng.
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Customer.
Hậu điều kiện: | POST-1. Đơn hàng được lưu với mã đơn hàng duy nhất và trạng thái "Chờ xác nhận" (xem Hình A.2).<br>POST-2. Lịch sử trạng thái của đơn có bản ghi đầu tiên (xem Track.Update.History).
Luồng chính: | 1.0 Tạo đơn hàng<br>1. Customer yêu cầu tạo đơn hàng.<br>2. Hệ thống hiển thị danh sách sản phẩm của cửa hàng.<br>3. Customer chọn sản phẩm và nhập số lượng cho mỗi sản phẩm đã chọn.<br>4. Customer nhập thông tin người nhận và địa chỉ giao.<br>5. Customer cho biết đã nhập xong.<br>6. Hệ thống kiểm tra các trường bắt buộc và định dạng từng trường (xem 1.0.E1).<br>7. Hệ thống hiển thị lại sản phẩm, số lượng, người nhận và địa chỉ giao.<br>8. Customer xác nhận đơn (tiếp tục luồng chính), yêu cầu sửa đơn (xem 1.1), hoặc hủy thao tác tạo đơn (hệ thống kết thúc UC, đơn không được lưu).<br>9. Hệ thống gán mã đơn hàng duy nhất, lưu đơn với trạng thái "Chờ xác nhận" (xem Hình A.2) và ghi bản ghi đầu tiên vào lịch sử trạng thái (xem 1.0.E2).<br>10. Hệ thống hiển thị thông báo tạo đơn thành công kèm mã đơn hàng.
Luồng thay thế: | 1.1 Sửa đơn trước khi xác nhận<br>1. Ở bước 8 của luồng chính, Customer yêu cầu sửa đơn.<br>2. Hệ thống hiển thị thông tin đơn đã nhập để Customer sửa.<br>3. Customer sửa sản phẩm, số lượng, thông tin người nhận hoặc địa chỉ giao.<br>4. Quay lại bước 5 của luồng chính.
Ngoại lệ: | 1.0.E1 Thiếu trường bắt buộc hoặc sai định dạng<br>1. Hệ thống chỉ ra trường bắt buộc còn thiếu hoặc trường sai định dạng, kể cả số lượng sai ràng buộc (xem Order.Create.Quantity). Danh sách trường bắt buộc và quy tắc định dạng: TBD (xem C-1).<br>2a. Nếu Customer bổ sung hoặc sửa các trường đó, thì quay lại bước 6 của luồng chính.<br>2b. Ngược lại, nếu Customer hủy thao tác tạo đơn, thì hệ thống kết thúc UC.<br>1.0.E2 Lưu đơn thất bại<br>1. Hệ thống hoàn tác (rollback) mọi bước đã làm khi lưu đơn (xem Order.Done.Failure).<br>2. Hệ thống báo Customer tạo đơn không thành công kèm lý do (xem Order.Done.Reason).<br>3. Hệ thống kết thúc UC; đơn không được lưu.
Độ ưu tiên: | Cao
Tần suất sử dụng: | Chưa có số liệu
Quy tắc nghiệp vụ: | Không có
Thông tin khác: | Customer có thể hủy thao tác tạo đơn trước khi xác nhận đơn (xem Order.Confirm.Prompt).<br>Số sản phẩm trong mỗi đơn: TBD (xem C-7).
Giả định: | Danh sách sản phẩm có sẵn dưới dạng dữ liệu mẫu (xem AS-3).
```

### 3.1.3 Yêu cầu chức năng

```fr
Order.Create: Customer tạo đơn hàng
.Product: Hệ thống phải cho Customer chọn sản phẩm từ danh sách sản phẩm của cửa hàng (xem AS-3), với số sản phẩm mỗi đơn là TBD (xem C-7).
.Quantity: Hệ thống phải cho Customer nhập số lượng cho mỗi sản phẩm đã chọn, với ràng buộc TBD (xem C-1).
.Receiver: Hệ thống phải cho Customer nhập tên người nhận.
.Phone: Hệ thống phải cho Customer nhập số điện thoại người nhận, với định dạng TBD (xem C-1).
.Address: Hệ thống phải cho Customer nhập địa chỉ giao, với định dạng TBD (xem C-1).
.Required: Hệ thống phải kiểm tra Customer đã nhập đủ các trường bắt buộc, với danh sách TBD (xem C-1), và chỉ ra trường còn thiếu.
.Format: Hệ thống phải kiểm tra định dạng từng trường theo quy tắc TBD (xem C-1) và chỉ ra trường sai định dạng.

Order.Confirm: Xác nhận đơn
.Display: Hệ thống phải hiển thị lại sản phẩm, số lượng, người nhận và địa chỉ giao trước khi lưu đơn.
.Prompt: Hệ thống phải yêu cầu Customer chọn xác nhận đơn, sửa đơn (xem luồng 1.1 của UC-01) hoặc hủy thao tác tạo đơn.

Order.Done: Khi Customer xác nhận đơn, hệ thống phải làm các bước sau như 1 giao dịch.
.Store: Hệ thống phải gán mã đơn hàng duy nhất và lưu đơn với trạng thái "Chờ xác nhận" (xem Hình A.2).
.History: Hệ thống phải ghi bản ghi đầu tiên vào lịch sử trạng thái của đơn (xem Track.Update.History).
.Success: Hệ thống phải hiển thị thông báo tạo đơn thành công kèm mã đơn hàng.
.Failure: Hệ thống phải hoàn tác (rollback) giao dịch nếu một bước bất kỳ của Order.Done lỗi.
.Reason: Hệ thống phải báo Customer tạo đơn không thành công kèm lý do khi Order.Done.Failure xảy ra.
```

## 3.2 Theo dõi tình trạng vận chuyển

### 3.2.1 Mô tả và độ ưu tiên

Admin tạo vận đơn và phân công đơn ở trạng thái "Chờ xác nhận" cho một Shipper. Shipper cập nhật trạng thái đơn khi lấy hàng và giao hàng, và báo sự cố khi hàng bị hỏng, giao không thành công hoặc hàng thất lạc (xem 3.4.1). Mọi lần đổi trạng thái đều theo Hình A.2 (xem BR-01) và được ghi vào lịch sử trạng thái. Customer theo dõi trạng thái hiện tại và lịch sử trạng thái của đơn của mình; trạng thái mới hiển thị mà không cần tải lại trang (xem RT-1). Độ ưu tiên = Cao.

### 3.2.2 Use Case

```uc
Mã và tên: | UC-02 Phân công đơn cho Shipper (gồm tạo vận đơn)
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Admin | Tác nhân phụ: | Không có
Mô tả: | Admin tạo vận đơn cho một đơn ở trạng thái "Chờ xác nhận" và phân công đơn cho một Shipper. Đơn chuyển sang trạng thái "Chờ lấy hàng" (xem Hình A.2).
Điều kiện kích hoạt: | Admin cho biết muốn phân công một đơn cho Shipper.
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Admin.
Hậu điều kiện: | POST-1. Đơn có vận đơn với mã vận đơn duy nhất và Shipper được phân công.<br>POST-2. Đơn ở trạng thái "Chờ lấy hàng" (xem Hình A.2).
Luồng chính: | 2.0 Phân công đơn cho Shipper<br>1. Admin mở danh sách đơn hàng.<br>2. Hệ thống hiển thị danh sách đơn ở trạng thái "Chờ xác nhận".<br>3. Admin chọn một đơn.<br>4. Admin chọn một Shipper để phân công cho đơn.<br>5. Admin lưu phân công (xem 2.0.E1).<br>6. Hệ thống tạo vận đơn có mã vận đơn duy nhất cho đơn, gồm Shipper đã chọn.<br>7. Hệ thống chuyển đơn sang trạng thái "Chờ lấy hàng" (xem Hình A.2) và ghi lịch sử trạng thái.
Luồng thay thế: | Không có
Ngoại lệ: | 2.0.E1 Đơn không còn ở trạng thái "Chờ xác nhận" (xem BR-01, Track.Update.Valid)
Độ ưu tiên: | Cao
Quy tắc nghiệp vụ: | BR-01
Thông tin khác: | Chỉ Admin được tạo vận đơn và phân công đơn cho Shipper (xem SEC-5).<br>Sau khi lưu phân công, đơn có trong danh sách đơn được phân công của Shipper đó (xem UC-03).
```

```uc
Mã và tên: | UC-03 Cập nhật trạng thái giao hàng
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Shipper | Tác nhân phụ: | Không có
Mô tả: | Shipper cập nhật trạng thái của đơn được phân công cho mình khi lấy hàng và khi giao hàng. Khi hàng bị hỏng, giao không thành công hoặc hàng thất lạc, Shipper báo sự cố; hệ thống ghi sự cố, đổi trạng thái đơn và hiển thị cho Admin. Các ngoại lệ của UC này là phần báo sự cố ở 3.4.1.
Điều kiện kích hoạt: | Shipper cho biết muốn cập nhật trạng thái của một đơn được phân công cho mình.
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Shipper.
Hậu điều kiện: | POST-1. Đơn ở trạng thái mới theo một bước chuyển trên Hình A.2 (xem BR-01).<br>POST-2. Lịch sử trạng thái của đơn có thêm bản ghi cho mỗi lần đổi trạng thái (xem Track.Update.History).<br>POST-3. Nếu Shipper báo sự cố, sự cố được lưu (xem Issue.Report.Store).
Luồng chính: | 3.0 Cập nhật trạng thái giao hàng<br>1. Shipper mở danh sách đơn được phân công.<br>2. Hệ thống hiển thị danh sách đơn được phân công cho chính Shipper đó.<br>3. Shipper chọn một đơn ở trạng thái "Chờ lấy hàng".<br>4. Hệ thống hiển thị các trạng thái kế tiếp Shipper được chọn (xem Track.Update.Next).<br>5. Shipper lấy hàng và chọn trạng thái "Đang giao".<br>6. Hệ thống yêu cầu xác nhận và Shipper xác nhận.<br>7. Hệ thống chuyển đơn sang trạng thái "Đang giao" (xem Hình A.2, Track.Update.Status) và ghi lịch sử trạng thái.<br>8. Shipper giao hàng cho người nhận (xem 3.0.E1, 3.0.E2, 3.0.E3).<br>9. Shipper chọn trạng thái "Đã giao".<br>10. Hệ thống yêu cầu xác nhận và Shipper xác nhận.<br>11. Hệ thống chuyển đơn sang trạng thái "Đã giao" (xem Hình A.2, Track.Update.Status) và ghi lịch sử trạng thái.
Luồng thay thế: | 3.1 Giao lại sau khi giao không thành công<br>1. Shipper chọn một đơn ở trạng thái "Giao không thành công" trong danh sách đơn được phân công.<br>2. Hệ thống chỉ cho chọn trạng thái "Đang giao" khi số lần giao không thành công của đơn chưa đạt giới hạn ở BR-06.<br>3. Shipper chọn trạng thái "Đang giao".<br>4. Hệ thống yêu cầu xác nhận và Shipper xác nhận.<br>5. Hệ thống chuyển đơn từ "Giao không thành công" sang "Đang giao" (xem Hình A.2, Track.Update.Status) và ghi lịch sử trạng thái.<br>6. Quay lại bước 8 của luồng chính.
Ngoại lệ: | 3.0.E1 Hàng bị hỏng khi giao<br>1. Shipper phát hiện hàng bị hư hỏng khi đơn đang ở trạng thái "Đang giao".<br>2. Shipper chọn báo sự cố, loại "Hàng hỏng" (xem Issue.Report.Type).<br>3. Hệ thống yêu cầu xác nhận và Shipper xác nhận.<br>4. Hệ thống lưu sự cố (xem Issue.Report.Store).<br>5. Hệ thống chuyển đơn sang trạng thái "Hư hỏng" (xem Hình A.2), ghi lịch sử trạng thái và hiển thị trạng thái mới cho Admin (xem RT-2).<br>6. Hệ thống kết thúc UC. Admin xử lý sự cố ở UC-07.<br>3.0.E2 Giao không thành công<br>1. Shipper không giao được hàng cho người nhận khi đơn đang ở trạng thái "Đang giao".<br>2. Shipper chọn báo sự cố, loại "Giao không thành công" (xem Issue.Report.Type).<br>3. Hệ thống yêu cầu xác nhận và Shipper xác nhận.<br>4. Hệ thống lưu sự cố (xem Issue.Report.Store).<br>5. Hệ thống chuyển đơn sang trạng thái "Giao không thành công" (xem Hình A.2), ghi lịch sử trạng thái và hiển thị trạng thái mới cho Admin (xem RT-2).<br>6. Hệ thống tính số lần giao không thành công của đơn (xem BR-06).<br>7a. Nếu số lần này chưa đạt giới hạn ở BR-06, thì Shipper giao lại theo luồng 3.1.<br>7b. Ngược lại, nếu số lần này đạt giới hạn ở BR-06, thì Shipper không được giao lại; Admin chuyển đơn sang trạng thái "Đang hoàn hàng" rồi "Đã hoàn về người bán" ở UC-07 (xem Hình A.2), và hệ thống kết thúc UC.<br>3.0.E3 Hàng thất lạc<br>1. Shipper không tìm thấy hàng khi đơn đang ở trạng thái "Đang giao".<br>2. Shipper chọn báo sự cố, loại "Thất lạc" (xem Issue.Report.Type).<br>3. Hệ thống yêu cầu xác nhận và Shipper xác nhận.<br>4. Hệ thống lưu sự cố (xem Issue.Report.Store).<br>5. Hệ thống chuyển đơn sang trạng thái "Thất lạc" (xem Hình A.2), ghi lịch sử trạng thái và hiển thị trạng thái mới cho Admin (xem RT-2).<br>6. Hệ thống kết thúc UC. Admin cũng có thể xác nhận thất lạc ở UC-07 (luồng 7.1).
Độ ưu tiên: | Cao
Tần suất sử dụng: | Chưa có số liệu
Quy tắc nghiệp vụ: | BR-01, BR-06
Thông tin khác: | Shipper chỉ xem và cập nhật được đơn được phân công cho chính mình (xem SEC-4).<br>Hệ thống từ chối mọi bước chuyển không có trên Hình A.2 và báo lý do (xem Track.Update.Valid).<br>Các bước chuyển T5, T9, T10 chỉ thực hiện qua báo sự cố (xem Issue.Report), không chọn qua Track.Update.Next.<br>Mỗi lần trạng thái đơn thay đổi, màn hình đang mở của Customer và Admin hiển thị trạng thái mới mà không cần tải lại trang (xem RT-1, RT-2); Customer được thông báo theo CI-1, kênh TBD (xem C-2).<br>Sự cố chỉ báo được khi đơn ở trạng thái "Đang giao"; báo sự cố ở trạng thái khác: TBD (xem C-11).<br>Hàng hỏng hoặc thất lạc do Customer báo sau khi đơn "Đã giao" được xử lý qua yêu cầu hoàn hàng (xem UC-05, UC-06).
Giả định: | Tài khoản Shipper đã có sẵn (xem AS-2).
```

```uc
Mã và tên: | UC-04 Theo dõi đơn hàng
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Customer | Tác nhân phụ: | Không có
Mô tả: | Customer xem danh sách đơn hàng của mình, rồi xem trạng thái hiện tại và lịch sử trạng thái của một đơn.
Điều kiện kích hoạt: | Customer cho biết muốn xem tình trạng vận chuyển của đơn hàng.
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Customer.
Hậu điều kiện: | POST-1. Trạng thái hiện tại và lịch sử trạng thái của đơn được chọn hiển thị cho Customer.
Luồng chính: | 4.0 Theo dõi đơn hàng<br>1. Customer mở danh sách đơn hàng.<br>2. Hệ thống hiển thị danh sách đơn của chính Customer đó.<br>3. Customer chọn một đơn.<br>4. Hệ thống hiển thị trạng thái hiện tại của đơn và lịch sử trạng thái theo thứ tự thời gian, chiều sắp xếp TBD (xem C-13) (xem 4.0.E1).
Luồng thay thế: | Không có
Ngoại lệ: | 4.0.E1 Mất kết nối khi đang theo dõi (xem ROB-1)
Độ ưu tiên: | Cao
Quy tắc nghiệp vụ: | Không có
Thông tin khác: | Khi trạng thái đơn thay đổi, màn hình theo dõi đơn đang mở hiển thị trạng thái mới mà không cần tải lại trang (xem RT-1).<br>Customer chỉ xem được đơn do chính mình tạo (xem SEC-2).
```

### 3.2.3 Yêu cầu chức năng

```fr
Track.Assign: Admin tạo vận đơn và phân công đơn cho Shipper (UC-02)
.List: Hệ thống phải hiển thị cho Admin danh sách đơn ở trạng thái "Chờ xác nhận".
.Shipment: Hệ thống phải tạo vận đơn có mã vận đơn duy nhất cho đơn Admin chọn.
.Shipper: Hệ thống phải cho Admin chọn một Shipper để phân công cho đơn.
.Status: Hệ thống phải chuyển đơn sang trạng thái "Chờ lấy hàng" (xem Hình A.2) khi Admin lưu phân công.

Track.Update: Shipper cập nhật trạng thái giao hàng (UC-03)
.List: Hệ thống phải hiển thị cho Shipper danh sách đơn được phân công cho chính Shipper đó.
.Next: Hệ thống phải chỉ cho Shipper chọn trạng thái kế tiếp của đơn theo các bước chuyển T3, T4, T6 trên Hình A.2 (xem BR-01, BR-06).
.Confirm: Hệ thống phải yêu cầu Shipper xác nhận trước khi lưu trạng thái mới.
.Status: Hệ thống phải chuyển đơn sang trạng thái Shipper đã chọn (T3, T4, T6, xem Hình A.2) khi Shipper xác nhận.
.Valid: Hệ thống phải từ chối mọi thao tác chuyển trạng thái đơn hàng không có trên Hình A.2 và báo lý do (xem BR-01).
.History: Hệ thống phải lưu người đổi, thời điểm, trạng thái cũ và trạng thái mới mỗi khi trạng thái đơn thay đổi, bất kể ai thay đổi.

Track.View: Customer theo dõi đơn hàng (UC-04)
.List: Hệ thống phải hiển thị cho Customer danh sách đơn của chính Customer đó.
.Current: Hệ thống phải hiển thị trạng thái hiện tại của đơn được chọn.
.History: Hệ thống phải hiển thị lịch sử trạng thái của đơn được chọn theo thứ tự thời gian, chiều sắp xếp TBD (xem C-13).

Track.Admin: Admin theo dõi đơn hàng (dùng ở UC-07 luồng 7.1, 7.2; xem RT-2)
.List: Hệ thống phải hiển thị cho Admin danh sách đơn hàng ở mọi trạng thái, kèm trạng thái hiện tại của mỗi đơn.
```
