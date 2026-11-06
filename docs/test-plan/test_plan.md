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

(Viết ở bước sau.)

## 4 Tài nguyên

(Viết ở bước sau.)

## 5 Mốc kiểm thử và ước lượng

(Viết ở bước sau.)

## 6 Sản phẩm bàn giao

(Viết ở bước sau.)
