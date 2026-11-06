# Kế hoạch kiểm thử cho Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử, phiên bản 1.0

Soạn bởi TV2

Nhóm 10 – SE113 Kiểm chứng phần mềm

06/11/2026

## Lịch sử sửa đổi

| **Tên** | **Ngày** | **Lý do thay đổi** | **Phiên bản** |
|---|---|---|---|
| TV2 | 06/11/2026 | Bản đầu tiên | 1.0 |

## 1 Giới thiệu

### 1.1 Mục đích

Tài liệu này là kế hoạch kiểm thử (Test Plan) cho phiên bản 1.0 của Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử. Nó xác định phạm vi kiểm thử, rủi ro, tiêu chí hoàn thành, sản phẩm bàn giao, chiến lược kiểm thử và trách nhiệm của từng người, đồng thời chọn sớm phần nào kiểm thử tự động.

Người đọc gồm các thành viên nhóm (TV1 đến TV4) và giảng viên. TV3 và TV4 dựa vào tài liệu để biết phần unit test của mình. TV1 dựa vào tài liệu để biết lỗi nào đến từ yêu cầu sai và cần sửa SRS.

Tài liệu gồm sáu mục theo cấu trúc của slide Test Plan [4 trong SRS]. Mục 1 là phần giới thiệu này. Mục 2 liệt kê các yêu cầu cần kiểm thử, lấy ID từ SRS. Mục 3 nêu chiến lược: các loại kiểm thử, giai đoạn và công cụ. Mục 4 nêu tài nguyên. Mục 5 nêu mốc kiểm thử và ước lượng công. Mục 6 liệt kê sản phẩm bàn giao.

### 1.2 Thông tin nền

Tóm tắt dự án, các vai trò người dùng và 4 tính năng của phiên bản 1.0 nằm ở SRS §1.3, tài liệu này không viết lại. Test Plan dựa trên bản SRS 1.0 nháp 3 ngày 03/11/2026.

### 1.3 Tài liệu tham chiếu

1. Nhóm 10. Đặc tả yêu cầu phần mềm (SRS) v1.0, `docs/srs/SRS.md`. Nguồn của mọi ID ở §2.
2. Nguyễn Thị Thanh Trúc. Test Plan, slide bài giảng môn SE113 (`4_Test-Plan_v1.0.pdf`), cập nhật 03/2014. Đây là tài liệu [4] của SRS và là nguồn của cấu trúc sáu mục.
3. Nhóm 10. Backlog dự án (`BackLogPlan.xlsx`) và bản phân công theo backlog, `docs/plan/04_backlog_assignment.md`.
4. Mẫu test case `testcase.xlsx`, dùng cho test case ở giai đoạn 2.

### 1.4 Phạm vi kiểm thử

**Giai đoạn kiểm thử.** Dự án kiểm thử qua bốn giai đoạn: unit test, integration test, system test và acceptance test. Người làm, task trong backlog và cách thực hiện từng giai đoạn ở §3.2.

**Loại kiểm thử.** Nhóm làm 6 trong 10 loại ở slide. Bốn loại còn lại không làm, vì SRS không có yêu cầu tương ứng.

| Loại kiểm thử | Làm? | Lý do |
|---|---|---|
| Function Testing | Có (§3.1.1) | Kiểm mọi yêu cầu chức năng ở SRS §3.1 đến §3.4 |
| Business Cycle Testing | Có (§3.1.2) | Chạy trọn vòng đời đơn (tạo, phân công, giao, hoàn hàng hoặc sự cố) và kiểm từng BR ở SRS §7. Phần "chức năng chạy theo lịch định kỳ" của slide không áp dụng, vì hệ thống chạy theo sự kiện |
| User Interface Testing | Có (§3.1.3) | Ứng dụng web có giao diện. Tiêu chí hoàn thành là khớp mockup (TV3 làm ở giai đoạn 2) |
| Data and Database Integrity Testing | Có (§3.1.4) | Dữ liệu đơn và lịch sử trạng thái phải lưu đúng. Đây là cơ sở để theo dõi đơn và giải quyết thất lạc |
| Security and Access Control Testing | Có (§3.1.5) | Phân quyền theo vai trò (SEC-x) |
| Regression Testing | Có (§3.1.6) | Backlog A84 |
| Performance Profiling | Không | SRS không có yêu cầu về thời gian phản hồi (cập nhật real-time theo sự kiện) |
| Load Testing | Không | SRS không có yêu cầu về số người dùng đồng thời |
| Stress Testing | Không | Như Load Testing |
| Volume Testing | Không | SRS không có yêu cầu về khối lượng dữ liệu |

**Giả định.**

- Nhóm không có khách hàng thật, nên buổi demo với giảng viên được coi là nghiệm thu (acceptance test).
- Tài khoản Admin, tài khoản Shipper và danh sách sản phẩm có sẵn nhờ dữ liệu seed của dự án, đúng với AS-2 và AS-3. Customer tự đăng ký.

**Quản lý lỗi (Plan defects).** Slide chỉ ghi hai chữ này, nên nhóm hiểu là kế hoạch quản lý lỗi: ghi ở đâu, mức nghiêm trọng nào, ai xử lý.

- Ghi lỗi trên GitHub Issues của repo, gắn nhãn `bug`. Số Issue được điền vào cột Bug# của test case tương ứng.
- Bốn mức nghiêm trọng:

| Mức | Dấu hiệu |
|---|---|
| Nghiêm trọng | Chặn một luồng chính của UC, hoặc sai phân quyền |
| Cao | Sai bước chuyển trạng thái, hoặc sai dữ liệu lưu |
| Trung bình | Sai thông báo hoặc sai hiển thị nhưng vẫn đi tiếp được |
| Thấp | Chính tả, bố cục |

- Người viết code phần đó sửa lỗi: TV3 với giao diện, TV4 với server. TV2 kiểm lại và đóng Issue. Nếu nguyên nhân là yêu cầu sai thì TV1 sửa SRS.

### 1.5 Ràng buộc

- **Môi trường.** Nhóm chưa chốt công nghệ cho server, client và cơ sở dữ liệu, nên §4.2 chưa ghi cấu hình cụ thể. Trình duyệt hỗ trợ là TBD (xem C-8, OE-2), nên chưa chọn được trình duyệt để chạy test giao diện.
- **Nhân lực.** Chỉ có một người kiểm thử là TV2. TV3 và TV4 tự unit test phần code của mình.
- **Lịch.** Chưa có hạn cuối kỳ cho giai đoạn 2, nên các mốc sau Test planning ở §5 ghi "Chưa xác định". Khi có hạn, Test Plan cập nhật lên v1.1.
- **Công cụ.** Danh sách công cụ ở §3.3 (Playwright, GitHub Issues, GitHub Actions…). Một số công cụ, như thư viện unit test, nhóm sẽ chốt khi vào giai đoạn 2.

### 1.6 Rủi ro

| Rủi ro | Ảnh hưởng | Cách giảm |
|---|---|---|
| 14 vấn đề mở C-1 đến C-14 trong SRS còn TBD, hạn chốt 04/11/2026 đã qua | Chưa viết được kết quả mong đợi của các test case liên quan (ví dụ BR-03 với C-4, BR-06 với C-3) | Ghi "TBD (xem C-x)" ở §2 cho các dòng bị ảnh hưởng; hỏi nhóm chốt trước giai đoạn 2; khi có đáp án thì cập nhật Test Plan |
| SRS có thể đổi ID sau 06/11/2026 (task A43, A71 sửa SRS theo code thực tế) | Dòng ở §2 bị lệch ID so với SRS | Chạy lại script kiểm phủ ID mỗi khi SRS đổi; cập nhật §2 và nâng phiên bản Test Plan |
| Giao diện chưa có, mockup làm ở giai đoạn 2 | Chưa thiết kế được test giao diện chi tiết | Ghi tiêu chí "khớp mockup" ở §3.1.3; viết test giao diện sau khi TV3 có mockup |
| Chỉ có một người kiểm thử | Test case, chạy test và kiểm lại lỗi cùng đổ lên một người; chậm nếu nhiều lỗi | Ưu tiên test tự động bằng Playwright và chạy lại qua GitHub Actions; TV3, TV4 tự unit test |
| Chưa có hạn cuối kỳ | Không đặt được lịch cho test design, execution, evaluation | Ghi "Chưa xác định" ở §5; cập nhật lên v1.1 khi có hạn |

## 2 Yêu cầu cần kiểm thử

Bảng ở mục này là ma trận truy vết: mỗi ID trong SRS có ít nhất một dòng, gồm 49 yêu cầu chức năng, 12 ngoại lệ của Use Case và 18 yêu cầu phi chức năng hoặc ràng buộc, tổng 79 ID. Cột "Loại kiểm thử" dùng đúng 6 loại "Có" ở §1.4. Regression Testing chạy lại cả bộ test (§3.1.6) nên không ghi ở từng dòng. Chỗ SRS còn TBD thì ghi "TBD (xem C-x)" theo Phụ lục C của SRS.

### 2.1 Yêu cầu chức năng

Mỗi ngoại lệ của Use Case nằm ở tính năng chứa Use Case đó (UC-01 ở FE-1; UC-02, UC-04 ở FE-2; UC-05, UC-06 ở FE-3; UC-07 ở FE-4), trừ 3.0.E1, 3.0.E2, 3.0.E3 của UC-03 là ngoại lệ báo sự cố nên nằm ở FE-4 theo SRS §3.4.1.

#### 2.1.1 FE-1 Tạo đơn hàng

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Order.Create.Product` | Chọn sản phẩm từ danh sách | Function Testing | Phân vùng tương đương + giá trị biên cho số sản phẩm mỗi đơn | Trung bình | TBD (xem C-7) |
| `Order.Create.Quantity` | Nhập số lượng mỗi sản phẩm | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `Order.Create.Receiver` | Nhập tên người nhận | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `Order.Create.Phone` | Nhập số điện thoại người nhận | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `Order.Create.Address` | Nhập địa chỉ giao | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `Order.Create.Required` | Kiểm trường bắt buộc | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `Order.Create.Format` | Kiểm định dạng từng trường | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `Order.Confirm.Display` | Hiển thị lại đơn trước khi lưu | Function Testing, User Interface Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Order.Confirm.Prompt` | Chọn xác nhận, sửa hoặc hủy tạo đơn | Function Testing | Bảng quyết định (3 lựa chọn, hủy thì đơn không được lưu) | Trung bình |  |
| `Order.Done.Store` | Gán mã đơn và lưu trạng thái Chờ xác nhận | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái (T1) | Trung bình |  |
| `Order.Done.History` | Ghi bản ghi đầu tiên vào lịch sử | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái (T1) | Trung bình |  |
| `Order.Done.Success` | Thông báo tạo đơn thành công kèm mã | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Order.Done.Failure` | Hoàn tác giao dịch khi một bước lỗi | Function Testing, Data and Database Integrity Testing | Giả lỗi lưu ở bước bất kỳ, kiểm không còn bản ghi đơn và lịch sử | Phức tạp | Giao dịch có rollback |
| `Order.Done.Reason` | Báo lý do tạo đơn không thành công | Function Testing | Giả lỗi lưu ở bước bất kỳ, kiểm thông báo lý do | Trung bình |  |
| `1.0.E1` | Thiếu trường bắt buộc hoặc sai định dạng | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-1) |
| `1.0.E2` | Lưu đơn thất bại | Function Testing, Data and Database Integrity Testing | Giả lỗi lưu ở bước bất kỳ, kiểm không còn bản ghi đơn và lịch sử | Phức tạp | Giao dịch có rollback |

#### 2.1.2 FE-2 Theo dõi tình trạng vận chuyển

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Track.Assign.List` | Admin xem đơn Chờ xác nhận | Function Testing | Chuyển trạng thái | Đơn giản |  |
| `Track.Assign.Shipment` | Tạo vận đơn có mã duy nhất | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình |  |
| `Track.Assign.Shipper` | Chọn Shipper để phân công | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Track.Assign.Status` | Chuyển đơn sang Chờ lấy hàng | Function Testing, Business Cycle Testing | Chuyển trạng thái (T2) | Trung bình |  |
| `Track.Update.List` | Shipper xem đơn được phân công | Function Testing, Security and Access Control Testing | Phân vùng tương đương + giá trị biên | Phức tạp | Phân quyền xem SEC-4 |
| `Track.Update.Next` | Chỉ hiện trạng thái kế tiếp T3, T4, T6 | Function Testing, Business Cycle Testing | Chuyển trạng thái; giá trị biên: giới hạn − 1, giới hạn, TBD (xem C-3) | Phức tạp | Phụ thuộc đếm theo BR-06; TBD (xem C-3) |
| `Track.Update.Confirm` | Yêu cầu Shipper xác nhận | Function Testing | Chuyển trạng thái | Đơn giản |  |
| `Track.Update.Status` | Chuyển sang trạng thái Shipper chọn | Function Testing, Business Cycle Testing | Chuyển trạng thái (T3, T4, T6) | Trung bình |  |
| `Track.Update.Valid` | Từ chối bước chuyển không có trên Hình A.2 | Function Testing, Business Cycle Testing, Security and Access Control Testing | Chuyển trạng thái (bước không hợp lệ) + gửi request trực tiếp tới server | Trung bình | Ví dụ Đã giao quay về Đang giao |
| `Track.Update.History` | Lưu người đổi, thời điểm, trạng thái cũ và mới | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái, kiểm bản ghi sau thay đổi do mỗi vai trò | Phức tạp | Bất kể ai thay đổi |
| `Track.View.List` | Customer xem đơn của mình | Function Testing, Security and Access Control Testing | Phân vùng tương đương + giá trị biên | Phức tạp | Phân quyền xem SEC-2 |
| `Track.View.Current` | Xem trạng thái hiện tại của đơn | Function Testing | Chuyển trạng thái | Đơn giản |  |
| `Track.View.History` | Xem lịch sử trạng thái theo thời gian | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản | TBD (xem C-13) |
| `Track.Admin.List` | Admin xem đơn mọi trạng thái | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `2.0.E1` | Đơn không còn ở Chờ xác nhận | Function Testing | 2 phiên song song (hai Admin cùng phân công một đơn); chuyển trạng thái | Phức tạp | Người thứ hai bị từ chối kèm lý do |
| `4.0.E1` | Mất kết nối khi đang theo dõi | Function Testing | Ngắt rồi nối lại kết nối phiên Customer, kiểm trạng thái mới nhất (xem ROB-1) | Phức tạp | Cần phiên khác đổi trạng thái lúc mất kết nối |

#### 2.1.3 FE-3 Hoàn hàng

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Return.Request.Eligible` | Chỉ gửi yêu cầu khi đơn Đã giao | Function Testing, Business Cycle Testing | Bảng quyết định (trạng thái đơn) | Trung bình |  |
| `Return.Request.Window` | Chỉ gửi yêu cầu khi còn thời hạn | Function Testing, Business Cycle Testing | Giá trị biên quanh mốc hết hạn, TBD (xem C-4) | Trung bình | TBD (xem C-4) |
| `Return.Request.Reason` | Bắt buộc chọn lý do hoàn hàng | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình | TBD (xem C-5) |
| `Return.Request.Store` | Lưu yêu cầu Chờ duyệt kèm thời điểm gửi | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái (R1) | Trung bình | TBD (xem C-12) |
| `Return.View.Status` | Customer xem trạng thái yêu cầu của mình | Function Testing, Security and Access Control Testing | Phân vùng tương đương + giá trị biên | Phức tạp |  |
| `Return.Review.List` | Admin xem yêu cầu Chờ duyệt và Đã chấp nhận | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Return.Review.Approve` | Chấp nhận yêu cầu | Function Testing | Chuyển trạng thái (R2) | Trung bình |  |
| `Return.Review.Reject` | Từ chối yêu cầu | Function Testing | Chuyển trạng thái (R3) | Trung bình | TBD (xem C-6) |
| `Return.Review.OrderStatus` | Chuyển đơn sang Hư hỏng hoặc Thất lạc theo lý do | Function Testing, Business Cycle Testing | Bảng quyết định (lý do × trạng thái đơn, T11, T12) | Trung bình | TBD (xem C-12) |
| `Return.Review.Complete` | Ghi nhận Hoàn tất cho yêu cầu Đã chấp nhận | Function Testing | Chuyển trạng thái (R4) | Trung bình |  |
| `Return.Review.Valid` | Từ chối bước chuyển yêu cầu không có trên Hình A.2 | Function Testing, Business Cycle Testing, Security and Access Control Testing | Chuyển trạng thái (bước không hợp lệ) + gửi request trực tiếp tới server | Trung bình |  |
| `5.0.E1` | Đơn chưa ở trạng thái Đã giao | Function Testing | Bảng quyết định (trạng thái đơn) | Trung bình |  |
| `5.0.E2` | Quá thời hạn yêu cầu hoàn hàng | Function Testing | Giá trị biên quanh mốc hết hạn, TBD (xem C-4) | Trung bình | TBD (xem C-4) |
| `5.0.E3` | Chưa chọn lý do hoàn hàng | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `6.0.E1` | Yêu cầu không còn ở Chờ duyệt | Function Testing | 2 phiên song song (hai Admin cùng duyệt một yêu cầu); chuyển trạng thái | Phức tạp | Người thứ hai bị từ chối kèm lý do |

#### 2.1.4 FE-4 Xử lý ngoại lệ

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Issue.Report.Type` | Chọn loại sự cố khi đơn Đang giao | Function Testing | Bảng quyết định (loại sự cố × trạng thái đơn) | Trung bình | TBD (xem C-11) |
| `Issue.Report.Store` | Lưu sự cố: đơn, loại, người báo, thời điểm | Function Testing, Data and Database Integrity Testing | Phân vùng tương đương + giá trị biên | Trung bình |  |
| `Issue.Report.Status` | Chuyển đơn theo loại sự cố (T9, T5, T10) | Function Testing, Business Cycle Testing | Chuyển trạng thái | Trung bình |  |
| `3.0.E1` | Hàng bị hỏng khi giao | Function Testing, Business Cycle Testing | Chuyển trạng thái (T9) | Trung bình |  |
| `3.0.E2` | Giao không thành công | Function Testing, Business Cycle Testing | Chuyển trạng thái (T5); giá trị biên: giới hạn − 1, giới hạn, TBD (xem C-3) | Phức tạp | Phụ thuộc đếm theo BR-06; TBD (xem C-3) |
| `3.0.E3` | Hàng thất lạc | Function Testing, Business Cycle Testing | Chuyển trạng thái (T10) | Trung bình |  |
| `Issue.Resolve.List` | Admin xem sự cố chưa có kết quả | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Issue.Resolve.Return` | Chuyển đơn sang Đang hoàn hàng khi đạt giới hạn | Function Testing, Business Cycle Testing | Giá trị biên: giới hạn − 1, giới hạn, TBD (xem C-3) | Phức tạp | Phụ thuộc đếm theo BR-06; TBD (xem C-3) |
| `Issue.Resolve.Returned` | Xác nhận đã nhận lại hàng | Function Testing, Business Cycle Testing | Chuyển trạng thái (T8) | Trung bình |  |
| `Issue.Resolve.Lost` | Admin xác nhận thất lạc đơn Đang giao | Function Testing | Chuyển trạng thái | Trung bình | TBD (xem C-11) |
| `Issue.Resolve.LostStore` | Ghi sự cố Thất lạc, người báo là Admin | Function Testing, Data and Database Integrity Testing | Phân vùng tương đương + giá trị biên | Trung bình |  |
| `Issue.Resolve.LostStatus` | Chuyển đơn sang Thất lạc | Function Testing, Business Cycle Testing | Chuyển trạng thái (T10) | Trung bình |  |
| `Issue.Resolve.Result` | Ghi kết quả xử lý sự cố | Function Testing | Bảng quyết định (loại sự cố × số lần × trạng thái đơn) | Phức tạp | Phụ thuộc đếm theo BR-06; TBD (xem C-14) |
| `7.0.E1` | Chuyển trả lại khi chưa đạt giới hạn | Function Testing | Giá trị biên: giới hạn − 1, giới hạn, TBD (xem C-3) | Phức tạp | Phụ thuộc đếm theo BR-06; TBD (xem C-3) |

**Quy tắc độ phức tạp** (dùng để đối chiếu khi review và để ước lượng ở §5):

- Đơn giản: hiển thị hoặc nhập một trường, một vai trò, không đổi trạng thái.
- Trung bình: kiểm hợp lệ có nhiều phân vùng, hoặc một bước chuyển trạng thái của một vai trò.
- Phức tạp: nhiều vai trò hoặc nhiều phiên, giao dịch có rollback, hoặc phụ thuộc đếm theo BR-06.

### 2.2 Yêu cầu phi chức năng

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `RT-1` | Customer thấy trạng thái mới không tải lại | Function Testing, Business Cycle Testing | 2 phiên trình duyệt song song (Shipper xác nhận, Customer thấy trạng thái mới không tải lại trang); thêm phiên Customer khác, phải không nhận cập nhật | Phức tạp | Kèm SEC-2 |
| `RT-2` | Admin thấy trạng thái mới không tải lại | Function Testing | 2 phiên trình duyệt song song (Shipper xác nhận, Bảng điều khiển Admin cập nhật không tải lại trang) | Phức tạp |  |
| `SEC-1` | Đăng nhập cho mọi thao tác | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-2` | Customer chỉ tạo và xem đơn của mình | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp | Có phiên Customer thứ hai |
| `SEC-3` | Customer chỉ hoàn hàng cho đơn của mình | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-4` | Shipper chỉ xem, cập nhật đơn được phân công | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-5` | Chỉ Admin tạo vận đơn, phân công | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-6` | Chỉ Admin duyệt, từ chối, hoàn tất yêu cầu hoàn hàng | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-7` | Chỉ Admin xử lý sự cố | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-8` | Chỉ Shipper được phân công cập nhật và báo sự cố | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-9` | Đăng xuất và đăng nhập lại | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `ROB-1` | Hiển thị trạng thái mới nhất sau mất kết nối | Function Testing | Ngắt mạng phiên Customer, đổi trạng thái 2 lần, nối lại, kiểm trạng thái hiện tại và lịch sử | Phức tạp |  |
| `UI-1` | Các màn hình của hệ thống | User Interface Testing | Đối chiếu danh sách màn hình ở SRS và mockup | Đơn giản | Bố cục chi tiết theo mockup ở giai đoạn 2 |
| `CI-1` | Thông báo cho Customer khi trạng thái đổi | Function Testing | Đổi trạng thái đơn, kiểm Customer nhận thông báo | Trung bình | TBD (xem C-2) |
| `DI-1` | Lịch sử trạng thái chỉ thêm, không sửa, không xóa | Data and Database Integrity Testing | Gửi request sửa / xóa bản ghi lịch sử, phải bị từ chối; kiểm cơ sở dữ liệu không đổi | Trung bình |  |
| `OE-1` | Ứng dụng web truy cập qua trình duyệt | Function Testing | Mở các màn hình chính trên trình duyệt | Đơn giản |  |
| `OE-2` | Chạy đúng trên các trình duyệt hỗ trợ | Function Testing | Chạy bộ test trên từng trình duyệt trong danh sách | Trung bình | TBD (xem C-8) |
| `CO-1` | Cập nhật theo sự kiện, không tự tải lại theo chu kỳ | Function Testing | Theo dõi request mạng, không có request tải lại theo chu kỳ | Trung bình |  |

Quy tắc độ phức tạp ở cuối §2.1 áp dụng cho cả bảng này.

### 2.3 Tính năng không kiểm thử

| Tính năng | Lý do |
|---|---|
| Báo cáo thống kê | Ngoài phạm vi phiên bản 1.0 (SRS §1.3, §4.3) |
| Quản lý tài khoản người dùng và Shipper | Ngoài phạm vi; tài khoản Admin và Shipper có sẵn nhờ dữ liệu seed (AS-2) |
| Sửa, hủy, tìm kiếm đơn hàng đã lưu | Ngoài phạm vi phiên bản 1.0 (SRS §1.3) |
| Thanh toán, phí, hoàn tiền, bồi thường | Hệ thống không xử lý tiền, chỉ ghi nhận kết quả xử lý (BR-07) |
| Danh mục sản phẩm, đánh giá sản phẩm, kho trung chuyển | Ngoài phạm vi phiên bản 1.0 (SRS §1.3) |
| Giao diện phần mềm và giao diện phần cứng | SRS §5.2 và §5.3 ghi "Không có" |

Giả định AS-x và quy tắc BR-xx không có dòng riêng ở §2; BR được kiểm ở §3.1.2.

## 3 Chiến lược kiểm thử

Mục này nêu cách kiểm thử: các loại kiểm thử và kỹ thuật cho từng loại (§3.1), bốn giai đoạn kiểm thử (§3.2), công cụ (§3.3) và định dạng test case (§3.4). Mỗi loại kiểm thử "Có" ở §1.4 được viết đủ bốn ý theo slide Test Plan [4 trong SRS]: mục tiêu, kỹ thuật, tiêu chí hoàn thành, lưu ý đặc biệt.

### 3.1 Các loại kiểm thử

#### 3.1.1 Function Testing

**Mục tiêu:** Bảo đảm mỗi yêu cầu chức năng ở SRS §3.1 đến §3.4 chạy đúng với dữ liệu hợp lệ, và bị từ chối kèm lý do với dữ liệu không hợp lệ hay thao tác không được phép. Loại này gồm cả kiểm cập nhật real-time (RT-1, RT-2, ROB-1) vì đó là kiểm hành vi có hay không.

**Kỹ thuật:** Với mỗi dòng ở §2.1 và §2.2 thuộc loại này, TV2 viết test case cho đường chính, đường thay thế và từng ngoại lệ, dùng phân vùng tương đương và giá trị biên cho trường nhập. Mỗi ngoại lệ và mỗi bước chuyển trạng thái "chặn" có ít nhất một ca âm. Test case chạy bằng Playwright; kết quả mong đợi là trạng thái đơn, thông báo lỗi hoặc dữ liệu hiển thị đúng theo SRS. Real-time kiểm theo kiểu có/không bằng hai phiên trình duyệt chạy song song (hai browser context của Playwright): phiên Shipper xác nhận đổi trạng thái, phiên Customer chủ đơn phải thấy trạng thái mới mà không tải lại trang. Thêm phiên thứ ba là một Customer khác đang mở màn hình đơn của mình, phiên này không được nhận cập nhật của đơn kia (RT-1 cộng SEC-2). Hai phiên Admin thao tác cùng một đơn hoặc cùng một yêu cầu dùng để kiểm 2.0.E1 và 6.0.E1.

**Tiêu chí hoàn thành:** Mọi test case của các dòng §2 loại Function Testing có Result `Pass`, hoặc `Fail` kèm Issue mức Thấp còn mở (mức độ ở §1.4).

**Lưu ý đặc biệt:** Chỗ SRS còn TBD thì chưa viết được kết quả mong đợi; test case ghi "TBD (xem C-x)" ở cột Note và chưa tính vào tiêu chí cho tới khi nhóm chốt. Thư viện unit test do TV3, TV4 chọn ở giai đoạn 2 (§3.3); phần Function Testing của TV2 không thay unit test của họ. Trình duyệt để chạy test chưa chọn được vì C-8.

#### 3.1.2 Business Cycle Testing

**Mục tiêu:** Bảo đảm mỗi quy tắc nghiệp vụ BR-01 đến BR-07 được áp dụng đúng trên toàn vòng đời đơn hàng và yêu cầu hoàn hàng: chỉ chuyển trạng thái theo các bước T1 đến T12 và R1 đến R4 của Hình A.2, không có bước nào khác. Phần "chức năng chạy theo lịch định kỳ" của slide không áp dụng, vì hệ thống chạy theo sự kiện (CO-1).

**Kỹ thuật:** Dùng năm công cụ dưới đây. Mã Tn, Rn lấy từ bảng ở Phụ lục A.2 của SRS. Hàng là trạng thái hiện tại, cột là trạng thái đích.

(a) Ma trận chuyển trạng thái đơn 9 × 9. Số ở tiêu đề cột là thứ tự trạng thái, cùng thứ tự với cột "Từ" từ trên xuống. Ô hợp lệ ghi mã bước chuyển kèm vai trò kích hoạt; mọi ô còn lại, kể cả đường chéo (đơn "chuyển" sang chính trạng thái đang có), là "chặn". Mỗi ô "chặn" thử hai lần: qua giao diện (không có nút) và qua request gửi thẳng tới server (phải bị từ chối kèm lý do, Track.Update.Valid). T1 không có trạng thái nguồn nên ghi ở dòng "(bắt đầu)".

| Từ \ Sang | 1. Chờ xác nhận | 2. Chờ lấy hàng | 3. Đang giao | 4. Đã giao | 5. Giao không thành công | 6. Đang hoàn hàng | 7. Đã hoàn về người bán | 8. Hư hỏng | 9. Thất lạc |
|---|---|---|---|---|---|---|---|---|---|
| (bắt đầu) | T1 (Customer) | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Chờ xác nhận | chặn | T2 (Admin) | chặn | chặn | TBD (xem C-11) | chặn | chặn | TBD (xem C-11) | TBD (xem C-11) |
| Chờ lấy hàng | chặn | chặn | T3 (Shipper) | chặn | TBD (xem C-11) | chặn | chặn | TBD (xem C-11) | TBD (xem C-11) |
| Đang giao | chặn | chặn | chặn | T4 (Shipper) | T5 (Shipper) | chặn | chặn | T9 (Shipper) | T10 (Shipper hoặc Admin) |
| Đã giao | chặn | chặn | chặn | chặn | TBD (xem C-11) | chặn | chặn | T11 (Admin) | T12 (Admin) |
| Giao không thành công | chặn | chặn | T6 (Shipper) | chặn | chặn | T7 (Admin) | chặn | TBD (xem C-11) | TBD (xem C-11) |
| Đang hoàn hàng | chặn | chặn | chặn | chặn | TBD (xem C-11) | chặn | T8 (Admin) | TBD (xem C-11) | TBD (xem C-11) |
| Đã hoàn về người bán | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Hư hỏng | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Thất lạc | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |

Ghi chú về C-11: SRS chưa nói có báo sự cố được khi đơn không ở "Đang giao" hay không. Các ô "TBD (xem C-11)" là ô đích "Giao không thành công", "Hư hỏng", "Thất lạc" xuất phát từ trạng thái khác "Đang giao" mà không có bước chuyển nào trên Hình A.2: ba hàng "Chờ xác nhận", "Chờ lấy hàng", "Đang hoàn hàng", cùng ô "Đã giao" sang "Giao không thành công" và hai ô "Giao không thành công" sang "Hư hỏng", "Thất lạc". Chưa có kết quả mong đợi cho các ô này. Ba hàng trạng thái kết thúc ("Đã hoàn về người bán", "Hư hỏng", "Thất lạc") ghi "chặn" vì SRS gọi là trạng thái kết thúc.

(b) Ma trận yêu cầu hoàn hàng 4 × 4, cùng quy ước. Trạng thái yêu cầu: 1. "Chờ duyệt", 2. "Đã chấp nhận", 3. "Bị từ chối", 4. "Hoàn tất".

| Từ \ Sang | 1. Chờ duyệt | 2. Đã chấp nhận | 3. Bị từ chối | 4. Hoàn tất |
|---|---|---|---|---|
| (bắt đầu) | R1 (Customer) | chặn | chặn | chặn |
| Chờ duyệt | chặn | R2 (Admin) | R3 (Admin) | chặn |
| Đã chấp nhận | chặn | chặn | chặn | R4 (Admin) |
| Bị từ chối | chặn | chặn | chặn | chặn |
| Hoàn tất | chặn | chặn | chặn | chặn |

Mỗi ô "chặn" cũng thử qua giao diện và qua request trực tiếp (Return.Review.Valid). Hai Admin cùng duyệt một yêu cầu: người thứ hai bị từ chối (6.0.E1). Số yêu cầu mà một đơn được gửi: TBD (xem C-12).

(c) Hai bảng quyết định. Bảng thứ nhất là UC-06, chỉ dùng điều kiện và kết quả SRS đã nêu (BR-05, UC-06).

| Lý do hoàn hàng | Hành động của Admin | Trạng thái yêu cầu sau đó | Trạng thái đơn sau đó |
|---|---|---|---|
| "Hàng lỗi / hư hỏng" | Chấp nhận (yêu cầu "Chờ duyệt") | "Đã chấp nhận" (R2) | "Đã giao" sang "Hư hỏng" (T11) |
| "Chưa nhận được hàng" | Chấp nhận (yêu cầu "Chờ duyệt") | "Đã chấp nhận" (R2) | "Đã giao" sang "Thất lạc" (T12) |
| Lý do khác | Chấp nhận (yêu cầu "Chờ duyệt") | "Đã chấp nhận" (R2) | TBD (xem C-5): SRS chỉ nêu đổi trạng thái đơn khi lý do thuộc BR-05 |
| Bất kỳ lý do | Từ chối (yêu cầu "Chờ duyệt") | "Bị từ chối" (R3) | Không đổi ("Đã giao") |
| Bất kỳ lý do | Ghi nhận hoàn tất (yêu cầu "Đã chấp nhận") | "Hoàn tất" (R4) | Không đổi |
| Bất kỳ lý do | Chấp nhận, từ chối hoặc hoàn tất khi yêu cầu không ở trạng thái tương ứng | Không đổi, báo lý do (6.0.E1) | Không đổi |

Bảng thứ hai là bước 3 của UC-07: loại sự cố, trạng thái đơn và việc số lần giao không thành công đã đạt giới hạn (BR-06; giới hạn là TBD, xem C-3) quyết định đi bước 4, bước 5 hay ngoại lệ 7.0.E1.

| Loại sự cố | Trạng thái đơn | Số lần giao không thành công | Kết quả |
|---|---|---|---|
| "Giao không thành công" | "Giao không thành công" | Đạt giới hạn (TBD, xem C-3) | Bước 4: Admin chuyển đơn sang "Đang hoàn hàng" (T7) rồi ghi kết quả |
| "Giao không thành công" | "Giao không thành công" | Chưa đạt giới hạn (TBD, xem C-3) | Bước 5: ghi kết quả; Admin yêu cầu chuyển trả lại thì 7.0.E1 từ chối |
| "Giao không thành công" | Không còn là "Giao không thành công" (ví dụ đã giao lại, T6) | Bất kỳ | Bước 5: ghi kết quả |
| "Hàng hỏng" hoặc "Thất lạc" | Bất kỳ | Bất kỳ | Bước 5: ghi kết quả |

Giá trị biên của BR-06 (giới hạn là TBD, xem C-3): đơn giao không thành công ở lần thứ giới hạn − 1 (T6 hợp lệ, Admin chuyển trả lại bị 7.0.E1 từ chối), ở lần thứ giới hạn (T6 bị từ chối, T7 hợp lệ), và thử gửi thẳng T6 khi đã quá giới hạn (phải bị từ chối). Số lần đếm bằng số sự cố loại "Giao không thành công" đã ghi cho đơn. Biên thời hạn hoàn hàng ở BR-03 (hạn là TBD, xem C-4, gồm cả việc mốc hết hạn có được tính hay không) kiểm trong vòng đời hoàn hàng bên dưới.

(d) Năm vòng đời đầu-cuối, mỗi vòng chạy từ đầu tới trạng thái kết thúc và kiểm lịch sử trạng thái ở mỗi bước:

1. Giao thành công: T1, T2, T3, T4.
2. Giao lại rồi thành công: T1, T2, T3, T5, T6, T4, với số lần giao không thành công thấp hơn giới hạn.
3. Trả lại: T1, T2, T3, T5 lặp tới khi đạt giới hạn (có T6 giữa các lần), rồi T7 và T8.
4. Hỏng hoặc thất lạc khi giao: T3 rồi T9 do Shipper; T3 rồi T10 do Shipper; T3 rồi T10 do Admin xác nhận thất lạc.
5. Hoàn hàng: đơn tới "Đã giao" (T4), Customer gửi yêu cầu (R1), Admin chấp nhận (R2) với từng lý do của BR-05 (lý do "Hàng lỗi / hư hỏng" đi T11, lý do "Chưa nhận được hàng" đi T12), rồi ghi nhận hoàn tất (R4). Nhánh khác: Admin từ chối (R3). Thử gửi yêu cầu ngay trước và ngay sau mốc hết hạn (BR-03).

(e) Quy tắc nghiệp vụ và nơi kiểm:

| Quy tắc | Kiểm ở đâu |
|---|---|
| BR-01 | Hai ma trận (a), (b): mọi ô "chặn"; mọi vòng đời |
| BR-02 | Vòng đời 5; thử gửi yêu cầu hoàn hàng với đơn ở 8 trạng thái còn lại (ma trận a, hàng khác "Đã giao") |
| BR-03 | Vòng đời 5, biên hạn hoàn hàng; TBD (xem C-4) |
| BR-04 | Vòng đời 5, hai lý do bắt buộc; gửi không chọn lý do; lý do khác TBD (xem C-5) |
| BR-05 | Bảng quyết định UC-06; vòng đời 5 |
| BR-06 | Bảng quyết định UC-07 và giá trị biên; vòng đời 2 và 3; TBD (xem C-3) |
| BR-07 | Mọi vòng đời: không có thao tác hay trường nào xử lý tiền, chỉ ghi nhận kết quả xử lý (vòng đời 3, 4, 5) |

**Tiêu chí hoàn thành:** Mọi ô của hai ma trận có kết quả đúng ma trận (ô hợp lệ chạy được, ô "chặn" bị từ chối cả qua giao diện lẫn request trực tiếp); cả hai bảng quyết định có ít nhất một ca cho mỗi dòng; năm vòng đời chạy `Pass`; mỗi quy tắc BR-01 đến BR-07 có ít nhất một test case `Pass`. Ô và dòng ghi TBD không tính cho tới khi nhóm chốt vấn đề tương ứng.

**Lưu ý đặc biệt:** Phụ thuộc vào kết quả chốt C-3 (giới hạn BR-06), C-4 (hạn BR-03), C-5 (lý do khác), C-11 (báo sự cố ngoài "Đang giao") và C-12. Vòng đời 3 cần đưa đơn qua nhiều lần giao không thành công nên dùng dữ liệu seed hoặc script dựng sẵn trạng thái. Vòng đời dùng tài khoản của cả ba vai trò, nên chỉ chạy đủ được sau khi TV3, TV4 xong A59, A60, A62.

#### 3.1.3 User Interface Testing

**Mục tiêu:** Bảo đảm giao diện đúng với mockup đã duyệt và dùng được cho từng vai trò: điều hướng giữa các màn hình, nhập liệu, hiển thị trạng thái, thông báo lỗi.

**Kỹ thuật:** Đối chiếu từng màn hình ở UI-1 với mockup của TV3: Đăng nhập (A8), Đăng ký (A9), Bảng điều khiển Admin (A10), Trang chủ Customer (A11), Tạo đơn hàng (A12), Chi tiết đơn hàng (A13), Yêu cầu hoàn hàng (A14), Theo dõi vận chuyển (A15), Màn hình giao hàng của Shipper (A16). Với mỗi màn hình, TV2 mở màn hình bằng đúng vai trò, so bố cục, nhãn, trường nhập và nút với mockup, rồi thử điều hướng sang màn hình kế. Việc so mockup làm bằng tay (§3.3); test Playwright chỉ kiểm sự có mặt và hoạt động của các phần tử chính.

**Tiêu chí hoàn thành:** Mọi màn hình ở UI-1 khớp mockup tương ứng. Chỗ lệch được ghi Issue mức Thấp hoặc Trung bình (§1.4) và chỉ chấp nhận được khi Issue còn mở có mức Thấp.

**Lưu ý đặc biệt:** Mockup làm ở giai đoạn 2 (A8 đến A16), nên test giao diện chi tiết viết sau khi TV3 có mockup. Ngôn ngữ giao diện là TBD (xem C-9) và trình duyệt hỗ trợ là TBD (xem C-8); hai chỗ này ảnh hưởng nhãn cần so và nơi chạy test.

#### 3.1.4 Data and Database Integrity Testing

**Mục tiêu:** Bảo đảm dữ liệu đơn hàng, yêu cầu hoàn hàng, sự cố và lịch sử trạng thái được lưu đúng, không mất, không bị sửa, và giao dịch tạo đơn hoàn tác đủ khi lỗi.

**Kỹ thuật:** Sau mỗi thao tác đổi trạng thái, đọc lại cơ sở dữ liệu và kiểm bản ghi lịch sử: người đổi, thời điểm, trạng thái cũ, trạng thái mới (Track.Update.History); bản ghi đầu của đơn có trạng thái cũ để trống (T1). Kiểm mã đơn hàng, mã vận đơn, mã yêu cầu hoàn hàng và mã sự cố là duy nhất khi tạo nhiều bản ghi liên tiếp. Ép lỗi giữa chừng khi lưu đơn và kiểm rollback: không còn đơn, không còn bản ghi lịch sử, Customer nhận lý do (Order.Done.Failure, Order.Done.Reason). Gửi request sửa hoặc xóa bản ghi lịch sử, phải bị từ chối và cơ sở dữ liệu không đổi (DI-1).

**Tiêu chí hoàn thành:** Mọi thao tác đổi trạng thái ở vòng đời 1 đến 5 (§3.1.2) để lại đúng một bản ghi lịch sử với bốn trường đúng; không có mã trùng; rollback không để lại dữ liệu; DI-1 bị từ chối ở mọi lần thử.

**Lưu ý đặc biệt:** Công nghệ cơ sở dữ liệu chưa chốt (§1.5), nên cách đọc dữ liệu ghi ở giai đoạn 2 khi biết công nghệ. Ép lỗi giữa chừng cần cách giả lỗi do TV4 cung cấp. Chiều sắp xếp khi hiển thị lịch sử là TBD (xem C-13); kiểm lưu trữ không phụ thuộc điều đó.

#### 3.1.5 Security and Access Control Testing

**Mục tiêu:** Bảo đảm mỗi vai trò chỉ làm được thao tác được phép và chỉ thấy dữ liệu của mình (SEC-1 đến SEC-9), kể cả khi gửi request thẳng tới server mà không qua giao diện.

**Kỹ thuật:** Lập ma trận vai trò × thao tác. Vai trò: Chưa đăng nhập, Customer chủ đơn, Customer khác, Shipper được phân công, Shipper khác, Admin. Thao tác: các thao tác của SEC-1 đến SEC-9 (đăng nhập và đăng ký, tạo và xem đơn, gửi yêu cầu hoàn hàng, xem và cập nhật đơn giao, tạo vận đơn và phân công, duyệt, từ chối và hoàn tất yêu cầu hoàn hàng, báo và xử lý sự cố, đăng xuất). Mỗi ô thử hai cách: qua giao diện (nút có hiện hay không) và qua request trực tiếp (server phải từ chối hoặc cho phép đúng). Với ô cho phép, kiểm kết quả đúng; với ô cấm, kiểm dữ liệu không đổi. Thêm kiểm sau đăng xuất: quay lại trang cũ phải bị chuyển về đăng nhập (SEC-9). Kiểm cập nhật real-time không lọt sang Customer khác ở §3.1.1.

**Tiêu chí hoàn thành:** Mọi ô của ma trận có kết quả đúng ở cả hai cách thử. Không còn Issue mức Nghiêm trọng về phân quyền.

**Lưu ý đặc biệt:** Mọi sai phân quyền là mức Nghiêm trọng (§1.4), nên gặp một ô sai thì TV2 báo ngay cho TV4, không chờ hết bộ test. Cách đăng nhập và thông tin tài khoản là TBD (xem C-10), nên cách dựng phiên đăng nhập trong test chốt sau.

#### 3.1.6 Regression Testing

**Mục tiêu:** Bảo đảm thay đổi mới (sửa lỗi, tích hợp thêm) không làm hỏng chỗ đã chạy đúng.

**Kỹ thuật:** Toàn bộ bộ test Playwright chạy lại trên GitHub Actions ở mỗi PR vào `main` và một lần trước buổi demo (task A84). TV2 so kết quả với lần chạy trước và với cột Result của test case; ca nào trước đó `Pass` nay `Fail` thì mở Issue mới, gắn nhãn `bug`, ghi số vào Bug#.

**Tiêu chí hoàn thành:** Không có ca nào trước đó `Pass` chuyển sang `Fail` ở lần chạy cuối trước demo.

**Lưu ý đặc biệt:** Chỉ chạy lại được phần đã viết thành test tự động; phần so mockup làm bằng tay (§3.1.3) nên TV2 chạy lại bằng tay trước demo. Chưa có hạn cuối kỳ (§1.5), nên ngày chạy cuối chưa xác định.

### 3.2 Giai đoạn kiểm thử

Bốn giai đoạn theo slide, chọn theo task trong backlog (`docs/plan/04_backlog_assignment.md`).

| Giai đoạn | Task backlog | Ai làm | Cách thực hiện |
|---|---|---|---|
| Unit test | A73, A74, A76, A77, A79 | TV3, TV4, mỗi người test code của mình | Test từng hàm và module bằng thư viện unit test nhóm chọn ở giai đoạn 2 (§3.3). TV2 không làm giai đoạn này |
| Integration test | A59, A60, A62 (các task "Integrate …") | TV2 | TV2 kiểm chỗ nối sau khi TV3, TV4 xong A59, A60, A62: Admin với đơn hàng, Admin với sự cố giao hàng, quản lý đơn với quản lý hoàn hàng |
| System test | A80, A81, A83 | TV2 | Chạy trọn các loại ở §3.1 trên hệ thống đã ghép: real-time (A80), Shipper và ngoại lệ (A81), toàn hệ thống (A83), bằng Playwright |
| Acceptance test | Không có trong backlog | Cả nhóm | Nhóm không có khách hàng thật, nên buổi demo với giảng viên được coi là nghiệm thu (giả định ở §1.4) |

Test case cho giai đoạn system do TV2 chuẩn bị ở task A69. Regression Testing (A84) chạy lại bộ test của giai đoạn system.

### 3.3 Công cụ kiểm thử

Xếp theo các nhóm công cụ của slide.

| Nhóm công cụ | Dùng gì |
|---|---|
| Ghi lỗi | GitHub Issues, nhãn `bug` |
| Unit test | Jest hoặc Vitest; thư viện nhóm chốt ở giai đoạn 2 |
| Function test | Playwright |
| Real-time | Playwright, 2 browser context (hai phiên song song, thêm phiên thứ ba cho Customer khác) |
| Chạy lại bộ test | GitHub Actions |
| Load / Performance test | Không dùng (lý do ở §1.4) |
| Sinh dữ liệu test | Script seed dữ liệu của dự án |
| Kiểm giao diện | So với mockup bằng tay |

### 3.4 Định dạng test case

Test case viết trong `docs/templates/test-case.xlsx` (bản sao nguyên vẹn của `testcase.xlsx`, liệt kê là sản phẩm bàn giao ở §6), mỗi sheet một module, giữ nguyên cột của mẫu. Module Code và tiền tố ID:

| Module Code | Phạm vi | ID |
|---|---|---|
| ORD | FE-1 Tạo đơn hàng | `TC-ORD-001` … |
| TRK | FE-2 Theo dõi vận chuyển | `TC-TRK-001` … |
| RET | FE-3 Hoàn hàng | `TC-RET-001` … |
| ISS | FE-4 Xử lý ngoại lệ | `TC-ISS-001` … |
| NFR | RT, SEC, ROB, UI, CI, DI, OE, CO | `TC-NFR-001` … |

Quy ước cột:

- **Test Case Description:** ghi hành vi và ID SRS được kiểm. Truy vết nằm ở tài liệu test, không nằm trong mã test.
- **Pre-Condition:** ghi vai trò đăng nhập và trạng thái đơn ban đầu.
- **Test Case Procedure:** đánh số từng bước.
- **Expected Output:** dùng đúng tên trạng thái ở Hình A.2.
- **Result:** chỉ một trong `Pass`, `Fail`, `Untest`, `N/A`.
- **Bug#:** số GitHub Issue.
- **Note:** ghi "TBD (xem C-x)" khi chưa viết được kết quả mong đợi.

Mỗi dòng ở §2 có ít nhất một test case. Ngoại lệ và bước chuyển "chặn" có ít nhất một ca âm. Tên test Playwright mô tả hành vi và không chứa ID SRS (theo `AGENTS.md`); ID SRS chỉ nằm ở cột Test Case Description của file Excel.

## 4 Tài nguyên

### 4.1 Nhân lực

| Vai trò | Người | Trách nhiệm |
|---|---|---|
| Test Leader, Tester | TV2 | Viết Test Plan; viết test case hệ thống (A69); chạy Real-time, Shipper và ngoại lệ, System, Regression test (A80, A81, A83, A84); kiểm chỗ nối sau khi TV3, TV4 xong A59, A60, A62 |
| Unit test và sửa lỗi | TV3, TV4 | Unit test phần code mình viết (A73 đến A79); sửa lỗi Authentication, Admin, Order, Return và Delivery do TV2 báo (A75, A78, A82) |
| Cập nhật SRS | TV1 | Sửa SRS khi lỗi do yêu cầu sai hoặc SRS lệch code (A43, A71) |

### 4.2 Hệ thống

| Thành phần | Cấu hình |
|---|---|
| Server | Chưa chốt công nghệ, cập nhật ở giai đoạn 2 |
| Client | Chưa chốt công nghệ, cập nhật ở giai đoạn 2. Trình duyệt hỗ trợ là TBD (xem C-8) |
| Database server | Chưa chốt công nghệ, cập nhật ở giai đoạn 2 |
| Môi trường CI | GitHub Actions, chạy lại bộ test (§3.3) |

## 5 Mốc kiểm thử và ước lượng

Người ước lượng: TV2. Phương pháp: expert-based (slide 30), TV2 dựa vào kinh nghiệm để ước lượng công cho một dòng ở mỗi mức độ phức tạp, gồm đọc yêu cầu, viết test case và chuẩn bị dữ liệu. Số dòng lấy từ cột "Độ phức tạp" của §2 (79 dòng). Công unit test do TV3, TV4 ước lượng ở giai đoạn 2.

| Độ phức tạp | Số dòng | Công mỗi dòng (person-day) | Tổng (person-day) |
|---|---|---|---|
| Đơn giản | 13 | chờ TV2 ước lượng | chờ TV2 ước lượng |
| Trung bình | 40 | chờ TV2 ước lượng | chờ TV2 ước lượng |
| Phức tạp | 26 | chờ TV2 ước lượng | chờ TV2 ước lượng |
| Cộng | 79 | Không áp dụng | chờ TV2 ước lượng |

Các mốc (slide 33):

| Mốc | Công (person-day) | Bắt đầu | Kết thúc |
|---|---|---|---|
| Test planning | chờ TV2 ước lượng | 28/10/2026 | 06/11/2026 |
| Test design (viết test case) | chờ TV2 ước lượng | Chưa xác định | Chưa xác định |
| Test execution | chờ TV2 ước lượng | Chưa xác định | Chưa xác định |
| Test evaluation (Test Report) | chờ TV2 ước lượng | Chưa xác định | Chưa xác định |

Chưa có hạn cuối kỳ, nên các mốc sau Test planning chưa có ngày. Khi có hạn, Test Plan cập nhật lên v1.1.

## 6 Sản phẩm bàn giao

| Sản phẩm | Ngày | Người giao | Người nhận |
|---|---|---|---|
| Test Plan | 06/11/2026 | TV2 | Giảng viên |
| Test Cases (theo `docs/templates/test-case.xlsx`) | Chưa xác định | TV2 | Giảng viên |
| Test Report | Chưa xác định | TV2 | Giảng viên |

Lưu ý về mẫu `test-case.xlsx`: công thức đếm của mẫu lệch một dòng. Test case đầu tiên (`TC001`) nằm ở dòng 6, nhưng các ô đếm Pass, Fail, Untested, N/A dùng vùng `$F$7:$F$942` nên bỏ sót dòng 6; ô "Number of cases" đếm từ `$A$6`, còn "Percent Complete" đếm từ `$A$7`. "Percent Complete" chia số Pass cho (số ca × 5 trừ số N/A), tức coi mỗi ca có 5 lần chạy. Tệp trong repo giữ nguyên bản gốc. Nhóm cần thống nhất cách sửa công thức, hoặc đối chiếu bằng cách đếm tay, trước khi dùng số liệu này trong Test Report.
