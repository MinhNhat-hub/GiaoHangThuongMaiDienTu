## 3.3 Hoàn hàng

### 3.3.1 Mô tả và độ ưu tiên

Mục này mô tả chức năng "Hoàn hàng" theo Phụ lục B, khác với "Trả lại" ở mục 3.4.2 (xem Phụ lục B). Customer gửi yêu cầu hoàn hàng cho đơn của mình ở trạng thái "Đã giao" (xem BR-02), trong thời hạn yêu cầu hoàn hàng (xem BR-03), kèm một lý do (xem BR-04). Admin chấp nhận hoặc từ chối yêu cầu, rồi ghi nhận "Hoàn tất" cho yêu cầu đã chấp nhận (xem Hình A.2). Chấp nhận yêu cầu có lý do thuộc BR-05 là ngả thứ hai phát hiện hỏng hoặc thất lạc (xem 3.4). Hệ thống không xử lý tiền (xem BR-07). Độ ưu tiên = Cao.

### 3.3.2 Use Case

```uc
Mã và tên: | UC-05 Yêu cầu hoàn hàng
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Customer | Tác nhân phụ: | Không có
Mô tả: | Customer chọn một đơn hàng đã giao của mình, chọn lý do hoàn hàng và gửi yêu cầu hoàn hàng. Hệ thống lưu yêu cầu với trạng thái "Chờ duyệt" để Admin duyệt (xem UC-06). Customer xem được trạng thái các yêu cầu hoàn hàng mình đã gửi.
Điều kiện kích hoạt: | Customer chọn gửi yêu cầu hoàn hàng cho một đơn hàng của mình, hoặc chọn xem các yêu cầu hoàn hàng đã gửi.
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Customer.
Hậu điều kiện: | POST-1. Yêu cầu hoàn hàng được lưu với trạng thái "Chờ duyệt" và thời điểm gửi (xem Hình A.2).<br>POST-2. Trạng thái đơn hàng không đổi (xem Hình A.2).
Luồng chính: | 5.0 Gửi yêu cầu hoàn hàng<br>1. Customer chọn một đơn hàng do chính mình tạo và chọn gửi yêu cầu hoàn hàng (xem SEC-3, 5.1).<br>2. Hệ thống kiểm tra đơn đang ở trạng thái "Đã giao" (xem 5.0.E1) và còn trong thời hạn yêu cầu hoàn hàng (xem 5.0.E2).<br>3. Hệ thống hiển thị danh sách lý do hoàn hàng (xem BR-04).<br>4. Customer chọn một lý do và gửi yêu cầu (xem 5.0.E3).<br>5. Hệ thống lưu yêu cầu hoàn hàng với trạng thái "Chờ duyệt" và thời điểm gửi (R1, xem Hình A.2).
Luồng thay thế: | 5.1 Xem trạng thái yêu cầu hoàn hàng<br>1. Thay vì bước 1 của luồng chính, Customer chọn xem các yêu cầu hoàn hàng đã gửi.<br>2. Hệ thống hiển thị trạng thái hiện tại của các yêu cầu hoàn hàng do chính Customer gửi (xem SEC-2, Hình A.2).<br>3. Hệ thống kết thúc use case.
Ngoại lệ: | 5.0.E1 Đơn chưa ở trạng thái "Đã giao"<br>1. Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (xem BR-02).<br>2a. Nếu Customer chọn đơn hàng khác, thì quay lại bước 2 của luồng chính.<br>2b. Ngược lại, nếu Customer hủy thao tác, thì hệ thống kết thúc use case.<br>5.0.E2 Quá thời hạn yêu cầu hoàn hàng<br>1. Hệ thống báo Customer đơn đã quá thời hạn yêu cầu hoàn hàng (xem BR-03); thời hạn là TBD (xem C-4).<br>2a. Nếu Customer chọn đơn hàng khác, thì quay lại bước 2 của luồng chính.<br>2b. Ngược lại, nếu Customer hủy thao tác, thì hệ thống kết thúc use case.<br>5.0.E3 Chưa chọn lý do hoàn hàng<br>1. Hệ thống báo Customer phải chọn một lý do hoàn hàng (xem BR-04).<br>2a. Nếu Customer chọn một lý do, thì quay lại bước 4 của luồng chính.<br>2b. Ngược lại, nếu Customer hủy thao tác, thì hệ thống kết thúc use case.
Độ ưu tiên: | Cao
Tần suất sử dụng: | Chưa có số liệu
Quy tắc nghiệp vụ: | BR-02, BR-03, BR-04
Thông tin khác: | Một đơn được gửi một hay nhiều yêu cầu hoàn hàng: TBD (xem C-12).<br>Hệ thống không xử lý tiền (xem BR-07).<br>Khi Admin chấp nhận yêu cầu có lý do thuộc BR-05, trạng thái đơn đổi theo UC-06 (xem Hình A.2).
Giả định: | Không có
```

```uc
Mã và tên: | UC-06 Duyệt / từ chối yêu cầu hoàn hàng
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Admin | Tác nhân phụ: | Không có
Mô tả: | Admin xem các yêu cầu hoàn hàng đang chờ duyệt, chấp nhận hoặc từ chối từng yêu cầu. Với yêu cầu đã chấp nhận, Admin ghi nhận "Hoàn tất" khi việc hoàn hàng xong (xem Hình A.2). Hệ thống chỉ ghi nhận, không xử lý tiền (xem BR-07).
Điều kiện kích hoạt: | Admin chọn xử lý yêu cầu hoàn hàng.
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Admin.
Hậu điều kiện: | POST-1. Yêu cầu hoàn hàng ở trạng thái "Đã chấp nhận", "Bị từ chối" hoặc "Hoàn tất" (xem Hình A.2).<br>POST-2. Nếu yêu cầu được chấp nhận với lý do thuộc BR-05, đơn hàng ở trạng thái "Hư hỏng" hoặc "Thất lạc" (xem Hình A.2).
Luồng chính: | 6.0 Chấp nhận yêu cầu hoàn hàng<br>1. Hệ thống hiển thị danh sách yêu cầu ở trạng thái "Chờ duyệt" và "Đã chấp nhận", kèm đơn hàng và lý do hoàn hàng (xem Return.Review.List).<br>2. Admin chọn một yêu cầu ở trạng thái "Chờ duyệt" và chấp nhận yêu cầu đó (xem 6.1, 6.0.E1).<br>3. Hệ thống chuyển yêu cầu sang "Đã chấp nhận" (R2, xem Hình A.2).<br>4. Nếu lý do hoàn hàng thuộc BR-05, hệ thống chuyển đơn hàng từ "Đã giao" sang "Hư hỏng" (T11) hoặc "Thất lạc" (T12) theo BR-05 (xem Hình A.2).
Luồng thay thế: | 6.1 Từ chối yêu cầu<br>1. Tại bước 2 của luồng chính, Admin chọn từ chối yêu cầu.<br>2. Hệ thống chuyển yêu cầu sang "Bị từ chối" (R3, xem Hình A.2); bắt buộc ghi lý do từ chối hay không là TBD (xem C-6).<br>3. Trạng thái đơn hàng không đổi (xem Hình A.2).<br>6.2 Ghi nhận hoàn tất<br>1. Tại bước 2 của luồng chính, Admin chọn một yêu cầu ở trạng thái "Đã chấp nhận" và ghi nhận hoàn tất.<br>2. Hệ thống chuyển yêu cầu sang "Hoàn tất" (R4, xem Hình A.2), không xử lý tiền (xem BR-07).
Ngoại lệ: | 6.0.E1 Yêu cầu không còn ở trạng thái "Chờ duyệt" (xem BR-01, Return.Review.Valid)
Độ ưu tiên: | Cao
Quy tắc nghiệp vụ: | BR-01, BR-05, BR-07
Thông tin khác: | Chấp nhận yêu cầu có lý do thuộc BR-05 là ngả người mua phát hiện hỏng hoặc thất lạc (xem 3.4).<br>Mỗi lần đổi trạng thái đơn được ghi vào lịch sử trạng thái (xem Track.Update.History).
```

### 3.3.3 Yêu cầu chức năng

```fr
Return.Request: Customer gửi yêu cầu hoàn hàng (UC-05; quyền: xem SEC-3)
.Eligible: Hệ thống phải chỉ cho Customer gửi yêu cầu hoàn hàng với đơn đang ở trạng thái "Đã giao" (xem BR-02).
.Window: Hệ thống phải chỉ cho Customer gửi yêu cầu hoàn hàng khi còn trong thời hạn yêu cầu hoàn hàng (xem BR-03).
.Reason: Hệ thống phải bắt buộc Customer chọn một lý do hoàn hàng từ danh sách ở BR-04 trước khi gửi yêu cầu.
.Store: Hệ thống phải lưu yêu cầu hoàn hàng với trạng thái "Chờ duyệt" và thời điểm gửi (R1, xem Hình A.2).

Return.View: Customer xem yêu cầu hoàn hàng (UC-05, luồng 5.1)
.Status: Hệ thống phải hiển thị cho Customer trạng thái hiện tại của các yêu cầu hoàn hàng do chính Customer đó gửi.

Return.Review: Admin duyệt / từ chối yêu cầu hoàn hàng (UC-06)
.List: Hệ thống phải hiển thị cho Admin danh sách yêu cầu hoàn hàng ở trạng thái "Chờ duyệt" và "Đã chấp nhận", kèm đơn hàng và lý do hoàn hàng của mỗi yêu cầu.
.Approve: Hệ thống phải chuyển yêu cầu sang trạng thái "Đã chấp nhận" khi Admin chấp nhận yêu cầu đó (R2, xem Hình A.2).
.Reject: Hệ thống phải chuyển yêu cầu sang trạng thái "Bị từ chối" khi Admin từ chối yêu cầu đó (R3, xem Hình A.2); việc có bắt buộc ghi lý do từ chối hay không là TBD (xem C-6).
.Issue: Hệ thống phải chuyển đơn hàng sang trạng thái "Hư hỏng" (T11) hoặc "Thất lạc" (T12) theo BR-05 khi Admin chấp nhận yêu cầu có lý do thuộc BR-05 (xem Hình A.2).
.Complete: Hệ thống phải cho Admin ghi nhận "Hoàn tất" cho yêu cầu ở trạng thái "Đã chấp nhận" (R4, xem Hình A.2) mà không xử lý tiền (xem BR-07).
.Valid: Hệ thống phải từ chối mọi thao tác chuyển trạng thái yêu cầu hoàn hàng không có trên Hình A.2 và báo lý do (xem BR-01).
```

## 3.4 Xử lý ngoại lệ

Đề bài yêu cầu xử lý 3 ngoại lệ: hàng hỏng, trả lại và thất lạc. Mục 3.4.1 mô tả việc Shipper báo sự cố khi giao hàng; mục 3.4.2 mô tả việc Admin xử lý sự cố và trả lại hàng. Hỏng và thất lạc còn được phát hiện qua yêu cầu hoàn hàng của Customer (xem 3.3, BR-05); hai ngả dẫn về cùng trạng thái "Hư hỏng" hoặc "Thất lạc" (xem Hình A.2).

### 3.4.1 Báo sự cố khi giao hàng

#### 3.4.1.1 Mô tả và độ ưu tiên

Shipper báo sự cố khi đơn đang ở trạng thái "Đang giao" (xem Hình A.2). Các bước báo sự cố nằm ở ngoại lệ của UC-03 (mục 3.2.2): 3.0.E1 Hàng bị hỏng khi giao, 3.0.E2 Giao không thành công, 3.0.E3 Hàng thất lạc; mục này không viết lại. Báo sự cố khi đơn ở trạng thái khác: TBD (xem C-11). Độ ưu tiên = Cao.

#### 3.4.1.2 Yêu cầu chức năng

```fr
Issue.Report: Shipper báo sự cố khi giao hàng (UC-03, xem 3.0.E1, 3.0.E2, 3.0.E3)
.Type: Hệ thống phải cho Shipper chọn một trong các loại sự cố "Hàng hỏng", "Giao không thành công", "Thất lạc" cho đơn ở trạng thái "Đang giao".
.Store: Hệ thống phải lưu mỗi sự cố gồm đơn hàng, loại sự cố, người báo và thời điểm báo.
.Status: Hệ thống phải chuyển đơn sang trạng thái tương ứng với loại sự cố: "Hàng hỏng" sang "Hư hỏng" (T9), "Giao không thành công" sang "Giao không thành công" (T5), "Thất lạc" sang "Thất lạc" (T10) (xem Hình A.2).
```

### 3.4.2 Xử lý sự cố và trả lại hàng

#### 3.4.2.1 Mô tả và độ ưu tiên

Admin xử lý các sự cố Shipper đã báo ở mục 3.4.1, gồm cả ngoại lệ "Trả lại" (xem Phụ lục B). Đơn giao không thành công chưa đạt giới hạn ở BR-06 thì Shipper giao lại (xem luồng 3.1 của UC-03). Đạt giới hạn thì Admin chuyển đơn sang "Đang hoàn hàng", và khi đã nhận lại hàng thì xác nhận để đơn sang "Đã hoàn về người bán" (xem Hình A.2). Admin cũng xác nhận được thất lạc với đơn "Đang giao", và ghi kết quả xử lý cho từng sự cố mà không xử lý tiền (xem BR-07). Độ ưu tiên = Cao.

#### 3.4.2.2 Use Case

```uc
Mã và tên: | UC-07 Xử lý sự cố
Người tạo: | TV1 | Ngày tạo: | 31/10/2026
Tác nhân chính: | Admin | Tác nhân phụ: | Không có
Mô tả: | Admin xử lý các sự cố đã được ghi khi giao hàng (xem 3.0.E1, 3.0.E2, 3.0.E3 của UC-03 và luồng 7.1). Admin chuyển đơn giao không thành công sang "Đang hoàn hàng", xác nhận hàng đã hoàn về người bán, xác nhận thất lạc và ghi kết quả xử lý (xem Hình A.2).
Điều kiện kích hoạt: | Có sự cố chưa có kết quả xử lý; hoặc Admin phát hiện một đơn ở trạng thái "Đang giao" bị thất lạc; hoặc Admin đã nhận lại hàng của một đơn ở trạng thái "Đang hoàn hàng".
Tiền điều kiện: | PRE-1. Người dùng đã đăng nhập với vai trò Admin.
Hậu điều kiện: | POST-1. Sự cố có kết quả xử lý (xem BR-07).<br>POST-2. Đơn trả lại ở trạng thái "Đang hoàn hàng" hoặc "Đã hoàn về người bán"; đơn được Admin xác nhận thất lạc ở trạng thái "Thất lạc" (xem Hình A.2).
Luồng chính: | 7.0 Xử lý sự cố<br>1. Hệ thống hiển thị cho Admin danh sách sự cố chưa có kết quả xử lý (xem Issue.Resolve.List).<br>2. Admin chọn một sự cố.<br>3. Nếu sự cố thuộc loại "Giao không thành công" (xem 3.0.E2) và đơn đang ở trạng thái "Giao không thành công", hệ thống kiểm tra số lần giao không thành công của đơn đã đạt giới hạn ở BR-06 chưa, với số lần là TBD (xem C-3): đạt thì sang bước 4; ngược lại (chưa đạt, sự cố khác loại, hoặc đơn không còn ở "Giao không thành công") thì sang bước 5 (Admin yêu cầu chuyển trả lại khi chưa đạt: xem 7.0.E1).<br>4. Khi đã đạt giới hạn, Admin phải chuyển đơn sang trả lại trước khi ghi kết quả (xem BR-06, Issue.Resolve.Result); hệ thống chuyển đơn sang "Đang hoàn hàng" (T7, xem Hình A.2).<br>5. Admin ghi kết quả xử lý của sự cố; hệ thống lưu kết quả, chỉ ghi nhận, không xử lý tiền (xem BR-07). Sự cố không còn trong danh sách ở bước 1.
Luồng thay thế: | 7.1 Admin xác nhận thất lạc<br>1. Thay vì bước 2 của luồng chính, Admin chọn một đơn ở trạng thái "Đang giao" trong danh sách đơn hàng (xem Track.Admin.List) và xác nhận thất lạc.<br>2. Hệ thống ghi sự cố loại "Thất lạc" với người báo là Admin.<br>3. Hệ thống chuyển đơn sang "Thất lạc" (T10, xem Hình A.2).<br>4. Quay lại bước 1 của luồng chính.<br>7.2 Admin xác nhận đã nhận lại hàng<br>1. Thay vì bước 1 của luồng chính, Admin chọn một đơn ở trạng thái "Đang hoàn hàng" trong danh sách đơn hàng (xem Track.Admin.List).<br>2. Khi đã nhận lại hàng, Admin xác nhận.<br>3. Hệ thống chuyển đơn sang "Đã hoàn về người bán" (T8, xem Hình A.2).
Ngoại lệ: | 7.0.E1 Admin yêu cầu chuyển trả lại khi chưa đạt số lần giao không thành công ở BR-06
Độ ưu tiên: | Cao
Quy tắc nghiệp vụ: | BR-01, BR-06, BR-07
Thông tin khác: | Trạng thái đơn đã đổi ngay khi sự cố được ghi (xem Issue.Report.Status, Issue.Resolve.LostStatus); luồng 7.0 chỉ đổi trạng thái đơn ở bước 4 (T7).<br>Bốn ý của ngoại lệ "Trả lại" nằm ở 3.0.E2 của UC-03; UC này là phần Admin xử lý (T7 ở luồng 7.0, T8 ở luồng 7.2).<br>Mỗi lần đổi trạng thái đơn được ghi vào lịch sử trạng thái (xem Track.Update.History).
```

#### 3.4.2.3 Yêu cầu chức năng

```fr
Issue.Resolve: Admin xử lý sự cố (UC-07)
.List: Hệ thống phải hiển thị cho Admin danh sách sự cố chưa có kết quả xử lý.
.Return: Hệ thống phải cho Admin chuyển đơn từ trạng thái "Giao không thành công" sang "Đang hoàn hàng" (T7, xem Hình A.2) chỉ khi số lần giao không thành công của đơn đạt giới hạn ở BR-06, với số lần là TBD (xem C-3).
.Returned: Hệ thống phải cho Admin xác nhận đã nhận lại hàng và chuyển đơn từ trạng thái "Đang hoàn hàng" sang "Đã hoàn về người bán" (T8, xem Hình A.2).
.Lost: Hệ thống phải cho Admin xác nhận thất lạc một đơn ở trạng thái "Đang giao".
.LostStore: Hệ thống phải ghi sự cố loại "Thất lạc" với người báo là Admin khi Admin xác nhận thất lạc.
.LostStatus: Hệ thống phải chuyển đơn sang "Thất lạc" (T10, xem Hình A.2) khi Admin xác nhận thất lạc.
.Result: Hệ thống phải cho Admin ghi kết quả xử lý của một sự cố, trừ sự cố "Giao không thành công" của đơn đã đạt giới hạn ở BR-06 mà đơn chưa sang "Đang hoàn hàng"; kết quả bắt buộc nhập hay không: TBD (xem C-14); kết quả chỉ được ghi nhận, không xử lý tiền (xem BR-07).
```
