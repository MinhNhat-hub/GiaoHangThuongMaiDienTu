# Kế hoạch kiểm thử cho Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử, phiên bản 1.0

Soạn bởi TV2

Nhóm 10 – SE113 Kiểm chứng phần mềm

28/11/2026

## Lịch sử sửa đổi

| **Tên** | **Ngày** | **Lý do thay đổi** | **Phiên bản** |
|---|---|---|---|
| TV2 | 06/11/2026 | Bản đầu tiên | 1.0 |
| TV1 | 13/11/2026 | Đồng bộ với SRS 1.0 (93 ID, bỏ TBD); đổi mẫu sang Lab1, Lab2; phân công test theo module; thêm module ACC, BCT | 1.1 |
| TV2 | 28/11/2026 | Rà lại trước khi nộp: dựa trên SRS 1.0.1; ghi server, Vitest và hệ thống đã có từ PR #36; ghi số TC thật; sửa các tệp chưa lên `main`; chốt lưu dữ liệu trong bộ nhớ; đóng mốc Test design, ước lượng công Test execution | 1.1 |

## 1 Giới thiệu

### 1.1 Mục đích

Tài liệu này là kế hoạch kiểm thử (Test Plan) cho phiên bản 1.0 của Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử. Nó xác định phạm vi kiểm thử, rủi ro, tiêu chí hoàn thành, sản phẩm bàn giao, chiến lược kiểm thử và trách nhiệm của từng người, đồng thời chọn sớm phần nào kiểm thử tự động.

Người đọc gồm các thành viên nhóm (TV1 đến TV4) và giảng viên. TV3 và TV4 dựa vào tài liệu để biết phần unit test của mình. TV1 dựa vào tài liệu để biết lỗi nào đến từ yêu cầu sai và cần sửa SRS.

Tài liệu gồm sáu mục theo cấu trúc của slide Test Plan (tài liệu 2 ở §1.3). Mục 1 là phần giới thiệu này. Mục 2 liệt kê các yêu cầu cần kiểm thử, lấy ID từ SRS. Mục 3 nêu chiến lược: các loại kiểm thử, giai đoạn và công cụ. Mục 4 nêu tài nguyên. Mục 5 nêu mốc kiểm thử và ước lượng công. Mục 6 liệt kê sản phẩm bàn giao.

### 1.2 Thông tin nền

Tóm tắt dự án, các vai trò người dùng và 4 tính năng của phiên bản 1.0 nằm ở SRS §1.3, tài liệu này không viết lại. Test Plan dựa trên bản SRS 1.0.1 ngày 16/11/2026. Bản 1.0.1 giữ nguyên 93 ID của bản 1.0, chỉ thêm các vấn đề C-16 đến C-37 vào Phụ lục C.

### 1.3 Tài liệu tham chiếu

1. Nhóm 10. Đặc tả yêu cầu phần mềm (SRS) v1.0.1, `docs/srs/SRS.md`. Nguồn của mọi ID ở §2.
2. Giảng viên. Test Plan, slide bài giảng môn SE113 (`4_Test-Plan_v1.0.pdf`), cập nhật 03/2014. Đây là tài liệu [4] của SRS và là nguồn của cấu trúc sáu mục.
3. Nhóm 10. Backlog dự án (`BackLogPlan.xlsx`) và bản phân công theo backlog, `docs/plan/04_backlog_assignment.md`.
4. Giảng viên. Mẫu `Template_Test Case.xls` (Lab1), dùng cho test case hệ thống, và mẫu `Template_Unit Test Case.xls` (Lab2), dùng cho unit test case.
5. Nhóm 10. Test Specification 1.0, `docs/testing/test-specification.md`. Nguồn của mọi test case và của bảng giá trị biên.

### 1.4 Phạm vi kiểm thử

**Giai đoạn kiểm thử.** Dự án kiểm thử qua bốn giai đoạn: unit test, integration test, system test và acceptance test. Người làm, task trong backlog và cách thực hiện từng giai đoạn ở §3.2.

**Loại kiểm thử.** Nhóm làm 6 trong 10 loại ở slide. Bốn loại còn lại không làm, vì SRS không có yêu cầu tương ứng.

| Loại kiểm thử | Làm? | Lý do |
|---|---|---|
| Function Testing | Có (§3.1.1) | Kiểm mọi yêu cầu chức năng ở SRS §3.1 đến §3.5 |
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

- Ghi lỗi trên GitHub Issues của repo, gắn nhãn `bug`. Số Issue ghi ở cột Note của test case (`Bug #n`) và ở dòng Defect ID của unit test case.
- Bốn mức nghiêm trọng:

| Mức | Dấu hiệu |
|---|---|
| Nghiêm trọng | Chặn một luồng chính của UC, hoặc sai phân quyền |
| Cao | Sai bước chuyển trạng thái, hoặc sai dữ liệu lưu |
| Trung bình | Sai thông báo hoặc sai hiển thị nhưng vẫn đi tiếp được |
| Thấp | Chính tả, bố cục |

- Người viết code phần đó sửa lỗi: TV3 với giao diện, TV4 với server. Người test module đó (§4.1) kiểm lại và đóng Issue. Nếu nguyên nhân là yêu cầu sai thì TV1 sửa SRS.

### 1.5 Ràng buộc

- **Môi trường.** Server có từ PR #36 (27/11/2026), cấu hình ở §4.2. Server giữ dữ liệu trong bộ nhớ, không có database server, nên dữ liệu mất khi server khởi động lại và được nạp lại từ dữ liệu seed. Nhóm chốt cách lưu này cho phiên bản 1.0 (28/11/2026). Trình duyệt là Chrome cho máy tính (OE-2). Mọi test thiết kế từ SRS; mã sẽ sửa theo SRS.
- **Nhân lực.** Cả 4 thành viên tham gia kiểm thử, chia theo module (§4.1).
- **Lịch.** Test design chạy từ 13/11/2026 đến 27/11/2026. Chưa có hạn cuối kỳ cho giai đoạn 2, nên ngày kết thúc của Test execution và Test evaluation ở §5 ghi "Chưa xác định". Khi có hạn, Test Plan cập nhật tiếp.
- **Công cụ.** Danh sách công cụ ở §3.3. Unit test dùng Vitest. Kịch bản Playwright còn ở PR #31, chưa merge, và trên `main` chưa có workflow GitHub Actions (28/11/2026).

### 1.6 Rủi ro

| Rủi ro | Ảnh hưởng | Cách giảm |
|---|---|---|
| Server đã có nhưng giao diện chưa nối xong với server (PR #39 đang mở) và kịch bản Playwright chưa merge (PR #31) | System test chưa chạy được trên hệ thống đã ghép; lỗi ở chỗ nối chỉ lộ khi chạy | Chạy system test khi PR #31, #39 merge; trong lúc chờ, người test module chạy thử trên API của server |
| Unit test case mẫu Lab2 chưa lên `main` (PR #30 merge vào nhánh trung gian) | Unit Test Report (`docs/testing/unit-test-report.md`) có kết quả chạy Vitest nhưng chưa đối chiếu được với unit test case | Đưa `docs/testing/unit-test-cases.xlsx` lên `main` trước khi nộp Unit Test Report |
| SRS có thể đổi ID sau 06/11/2026 (task A43, A71 sửa SRS theo code thực tế) | Dòng ở §2 bị lệch ID so với SRS | Trước mỗi lần xuất, kiểm lại rằng mọi ID của SRS đều có một dòng ở §2 hoặc lý do ở §2.3; khi SRS đổi thì cập nhật §2 và nâng phiên bản Test Plan |
| Mockup chưa lên `main` (9 mockup ở PR #39, đang mở) | Chưa chạy được test giao diện chi tiết (UI-1) | Ghi tiêu chí "khớp mockup" ở §3.1.3; chạy test giao diện sau khi PR #39 merge |
| Server giữ dữ liệu trong bộ nhớ, không có database server | Các ca đọc lại dữ liệu đã lưu (Track.Update.History, DI-1, DI-2, SEC-10) chỉ đọc được qua API hoặc qua đối tượng lưu trữ trong test server; dữ liệu mất khi server khởi động lại | Nhóm chốt giữ cách lưu này (28/11/2026). Mỗi lượt test bắt đầu từ dữ liệu seed; các ca đọc lại dữ liệu chạy trong cùng một lần chạy server với thao tác tạo ra dữ liệu đó (§3.1.4) |
| Bốn người cùng viết test case và chạy test, chia theo module | Cách ghi test case, ID và dữ liệu có thể lệch giữa các module | Dùng chung mẫu Lab1, ID `TC-<MODULE>-<NNN>` và bảng biên chung; TV2 là trưởng test rà soát; ưu tiên test tự động bằng Playwright và chạy lại qua GitHub Actions |
| Chưa có hạn cuối kỳ | Không đặt được ngày kết thúc cho test execution, evaluation | Ghi "Chưa xác định" ở §5; cập nhật Test Plan khi có hạn |

## 2 Yêu cầu cần kiểm thử

Bảng ở mục này là ma trận truy vết: mỗi ID trong SRS có ít nhất một dòng, gồm 58 yêu cầu chức năng, 13 ngoại lệ, 22 yêu cầu phi chức năng hoặc ràng buộc, tổng 93 ID. Cột "Loại kiểm thử" dùng đúng 6 loại "Có" ở §1.4. Regression Testing chạy lại cả bộ test (§3.1.6) nên không ghi ở từng dòng. Giá trị biên cụ thể nằm ở bảng biên trong `docs/testing/test-specification.md`; cột "Kỹ thuật thiết kế" và "Ghi chú" nêu các giá trị đã chốt trong SRS.

### 2.1 Yêu cầu chức năng

Mỗi ngoại lệ của Use Case nằm ở tính năng chứa Use Case đó (UC-01 ở FE-1; UC-02, UC-04 ở FE-2; UC-05, UC-06 ở FE-3; UC-07 ở FE-4), trừ 3.0.E1, 3.0.E2, 3.0.E3 của UC-03 là ngoại lệ báo sự cố nên nằm ở FE-4 theo SRS §3.4.1.

#### 2.1.1 FE-1 Tạo đơn hàng

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Order.Create.Product` | Chọn một hoặc nhiều sản phẩm từ danh sách, không trùng dòng | Function Testing | Phân vùng tương đương + giá trị biên cho số dòng sản phẩm mỗi đơn (0 dòng; 1 dòng; 2 dòng khác sản phẩm; 2 dòng cùng sản phẩm) | Trung bình | Nhiều sản phẩm, không trùng dòng |
| `Order.Create.Quantity` | Nhập số lượng mỗi sản phẩm | Function Testing | Phân vùng tương đương + giá trị biên (0; 1; 2; 1000; -1; 1.5; chữ; rỗng) | Trung bình | Số nguyên ≥ 1, không giới hạn trên |
| `Order.Create.Receiver` | Nhập tên người nhận | Function Testing | Phân vùng tương đương + giá trị biên (rỗng; chỉ khoảng trắng; 1, 100, 101 ký tự) | Trung bình | Trường chỉ có khoảng trắng coi là thiếu |
| `Order.Create.Phone` | Nhập số điện thoại người nhận | Function Testing | Phân vùng tương đương + giá trị biên (0123456789, 0912345678; 9 chữ số; 11 chữ số; 1912345678; 09123a5678; rỗng) | Trung bình | 10 chữ số, bắt đầu bằng 0 |
| `Order.Create.Address` | Nhập địa chỉ giao | Function Testing | Phân vùng tương đương + giá trị biên (rỗng; chỉ khoảng trắng; 1, 255, 256 ký tự) | Trung bình | Trường chỉ có khoảng trắng coi là thiếu |
| `Order.Create.Required` | Kiểm trường bắt buộc | Function Testing | Phân vùng tương đương + giá trị biên (từng trường bắt buộc để trống hoặc chỉ có khoảng trắng; 0 dòng sản phẩm) | Trung bình | Trường chỉ có khoảng trắng coi là thiếu |
| `Order.Create.Format` | Kiểm định dạng từng trường | Function Testing | Phân vùng tương đương + giá trị biên (số lượng và số điện thoại như hai dòng trên) | Trung bình | Số lượng nguyên ≥ 1; số điện thoại 10 chữ số, bắt đầu bằng 0 |
| `Order.Confirm.Display` | Hiển thị lại đơn trước khi lưu | Function Testing, User Interface Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Order.Confirm.Prompt` | Chọn xác nhận, sửa hoặc hủy tạo đơn | Function Testing | Bảng quyết định (3 lựa chọn, hủy thì đơn không được lưu) | Trung bình |  |
| `Order.Done.Store` | Gán mã đơn và lưu trạng thái Chờ xác nhận | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái (T1) | Trung bình |  |
| `Order.Done.History` | Ghi bản ghi đầu tiên vào lịch sử | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái (T1) | Trung bình |  |
| `Order.Done.Success` | Thông báo tạo đơn thành công kèm mã | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Order.Done.Failure` | Hoàn tác giao dịch khi một bước lỗi | Function Testing, Data and Database Integrity Testing | Giả lỗi lưu ở bước bất kỳ, kiểm không còn bản ghi đơn và lịch sử | Phức tạp | Giao dịch có rollback |
| `Order.Done.Reason` | Báo lý do tạo đơn không thành công | Function Testing | Giả lỗi lưu ở bước bất kỳ, kiểm thông báo lý do | Trung bình |  |
| `1.0.E1` | Thiếu trường bắt buộc hoặc sai định dạng | Function Testing | Phân vùng tương đương + giá trị biên (như Order.Create.Required và Order.Create.Format) | Trung bình | Trường chỉ có khoảng trắng coi là thiếu |
| `1.0.E2` | Lưu đơn thất bại | Function Testing, Data and Database Integrity Testing | Giả lỗi lưu ở bước bất kỳ, kiểm không còn bản ghi đơn và lịch sử | Phức tạp | Giao dịch có rollback |

#### 2.1.2 FE-2 Theo dõi tình trạng vận chuyển

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Track.Assign.List` | Admin xem đơn Chờ xác nhận | Function Testing | Chuyển trạng thái | Đơn giản |  |
| `Track.Assign.Shipment` | Tạo vận đơn có mã duy nhất | Function Testing | Phân vùng tương đương + giá trị biên | Trung bình |  |
| `Track.Assign.Shipper` | Chọn Shipper để phân công | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Track.Assign.Status` | Chuyển đơn sang Chờ lấy hàng | Function Testing, Business Cycle Testing | Chuyển trạng thái (T2) | Trung bình |  |
| `Track.Update.List` | Shipper xem đơn được phân công | Function Testing, Security and Access Control Testing | Phân vùng tương đương + giá trị biên | Phức tạp | Phân quyền xem SEC-4 |
| `Track.Update.Next` | Chỉ hiện trạng thái kế tiếp T3, T4, T6 | Function Testing, Business Cycle Testing | Chuyển trạng thái; giá trị biên của BR-06: sau sự cố thứ 2 (T6 hợp lệ), sau sự cố thứ 3 (T6 bị chặn) | Phức tạp | Phụ thuộc đếm theo BR-06; giới hạn 3, biên 2 và 3 |
| `Track.Update.Confirm` | Yêu cầu Shipper xác nhận | Function Testing | Chuyển trạng thái | Đơn giản |  |
| `Track.Update.Status` | Chuyển sang trạng thái Shipper chọn | Function Testing, Business Cycle Testing | Chuyển trạng thái (T3, T4, T6) | Trung bình |  |
| `Track.Update.Valid` | Từ chối bước chuyển không có trên Hình A.2 | Function Testing, Business Cycle Testing, Security and Access Control Testing | Chuyển trạng thái (bước không hợp lệ) + gửi request trực tiếp tới server | Trung bình | Ví dụ Đã giao quay về Đang giao |
| `Track.Update.History` | Lưu người đổi, thời điểm, trạng thái cũ và mới | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái, kiểm bản ghi sau thay đổi do mỗi vai trò | Phức tạp | Bất kể ai thay đổi |
| `Track.View.List` | Customer xem đơn của mình | Function Testing, Security and Access Control Testing | Phân vùng tương đương + giá trị biên | Phức tạp | Phân quyền xem SEC-2 |
| `Track.View.Current` | Xem trạng thái hiện tại của đơn | Function Testing | Chuyển trạng thái | Đơn giản |  |
| `Track.View.History` | Xem lịch sử trạng thái theo thời gian, từ cũ đến mới | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản | Từ cũ đến mới |
| `Track.Admin.List` | Admin xem đơn mọi trạng thái | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `2.0.E1` | Đơn không còn ở Chờ xác nhận | Function Testing | 2 phiên song song (hai Admin cùng phân công một đơn); chuyển trạng thái | Phức tạp | Người thứ hai bị từ chối kèm lý do |
| `4.0.E1` | Mất kết nối khi đang theo dõi | Function Testing | Ngắt rồi nối lại kết nối phiên Customer, kiểm trạng thái mới nhất (xem ROB-1) | Phức tạp | Cần phiên khác đổi trạng thái lúc mất kết nối |

#### 2.1.3 FE-3 Hoàn hàng

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Return.Request.Eligible` | Chỉ gửi yêu cầu khi đơn Đã giao và chưa có yêu cầu hoàn hàng nào | Function Testing, Business Cycle Testing | Bảng quyết định (trạng thái đơn) | Trung bình |  |
| `Return.Request.Window` | Chỉ gửi yêu cầu khi còn thời hạn | Function Testing, Business Cycle Testing | Giá trị biên quanh mốc hết hạn: lúc "Đã giao" + 15 × 24 giờ − 1 phút, đúng + 15 × 24 giờ, + 15 × 24 giờ + 1 phút | Trung bình | 15 × 24 giờ, tính cả đúng mốc |
| `Return.Request.Reason` | Bắt buộc chọn lý do hoàn hàng; chọn "Khác" thì nhập mô tả | Function Testing | Phân vùng tương đương + giá trị biên (3 lý do; mô tả của "Khác": rỗng, chỉ khoảng trắng, 1, 500, 501 ký tự) | Trung bình | 3 lý do; "Khác" phải có mô tả |
| `Return.Request.Store` | Lưu yêu cầu Chờ duyệt kèm thời điểm gửi | Function Testing, Data and Database Integrity Testing | Chuyển trạng thái (R1) | Trung bình | Một yêu cầu cho mỗi đơn |
| `Return.View.Status` | Customer xem trạng thái yêu cầu của mình, kèm lý do từ chối | Function Testing, Security and Access Control Testing | Phân vùng tương đương + giá trị biên | Phức tạp |  |
| `Return.Review.List` | Admin xem yêu cầu Chờ duyệt và Đã chấp nhận | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Return.Review.Approve` | Chấp nhận yêu cầu | Function Testing | Chuyển trạng thái (R2) | Trung bình |  |
| `Return.Review.Reject` | Từ chối yêu cầu, chỉ khi đã nhập lý do từ chối | Function Testing | Chuyển trạng thái (R3); lý do từ chối: rỗng, chỉ khoảng trắng, 1, 500, 501 ký tự | Trung bình | Lý do từ chối bắt buộc |
| `Return.Review.OrderStatus` | Chuyển đơn sang Hư hỏng hoặc Thất lạc theo lý do | Function Testing, Business Cycle Testing | Bảng quyết định (lý do × trạng thái đơn, T11, T12) | Trung bình | Một yêu cầu cho mỗi đơn |
| `Return.Review.Complete` | Ghi nhận Hoàn tất cho yêu cầu Đã chấp nhận | Function Testing | Chuyển trạng thái (R4) | Trung bình |  |
| `Return.Review.Valid` | Từ chối bước chuyển yêu cầu không có trên Hình A.2 | Function Testing, Business Cycle Testing, Security and Access Control Testing | Chuyển trạng thái (bước không hợp lệ) + gửi request trực tiếp tới server | Trung bình |  |
| `5.0.E1` | Đơn chưa ở trạng thái Đã giao | Function Testing | Bảng quyết định (trạng thái đơn) | Trung bình |  |
| `5.0.E2` | Quá thời hạn yêu cầu hoàn hàng | Function Testing | Giá trị biên quanh mốc hết hạn: + 15 × 24 giờ (hợp lệ), + 15 × 24 giờ + 1 phút (quá hạn) | Trung bình | 15 × 24 giờ, tính cả đúng mốc |
| `5.0.E3` | Chưa chọn lý do hoàn hàng, hoặc chọn "Khác" mà chưa nhập mô tả | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `5.0.E4` | Đơn đã có yêu cầu hoàn hàng | Function Testing, Business Cycle Testing | Bảng quyết định (số yêu cầu đã có của đơn: yêu cầu đầu tiên hợp lệ, yêu cầu thứ hai bị từ chối) | Trung bình | Một yêu cầu cho mỗi đơn |
| `6.0.E1` | Yêu cầu không còn ở Chờ duyệt | Function Testing | 2 phiên song song (hai Admin cùng duyệt một yêu cầu); chuyển trạng thái | Phức tạp | Người thứ hai bị từ chối kèm lý do |

#### 2.1.4 FE-4 Xử lý ngoại lệ

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Issue.Report.Type` | Chọn loại sự cố khi đơn Đang giao | Function Testing | Bảng quyết định (loại sự cố × trạng thái đơn) | Trung bình | Chỉ khi "Đang giao" |
| `Issue.Report.Store` | Lưu sự cố: đơn, loại, người báo, thời điểm | Function Testing, Data and Database Integrity Testing | Phân vùng tương đương + giá trị biên | Trung bình |  |
| `Issue.Report.Status` | Chuyển đơn theo loại sự cố (T9, T5, T10) | Function Testing, Business Cycle Testing | Chuyển trạng thái | Trung bình |  |
| `3.0.E1` | Hàng bị hỏng khi giao | Function Testing, Business Cycle Testing | Chuyển trạng thái (T9) | Trung bình |  |
| `3.0.E2` | Giao không thành công | Function Testing, Business Cycle Testing | Chuyển trạng thái (T5); giá trị biên của BR-06: sự cố thứ 2 và thứ 3 | Phức tạp | Phụ thuộc đếm theo BR-06; giới hạn 3, biên 2 và 3 |
| `3.0.E3` | Hàng thất lạc | Function Testing, Business Cycle Testing | Chuyển trạng thái (T10) | Trung bình |  |
| `Issue.Resolve.List` | Admin xem sự cố chưa có kết quả | Function Testing | Phân vùng tương đương + giá trị biên | Đơn giản |  |
| `Issue.Resolve.Return` | Chuyển đơn sang Đang hoàn hàng khi đạt giới hạn | Function Testing, Business Cycle Testing | Giá trị biên của BR-06: mới có 2 lần (T7 bị từ chối), đủ 3 lần (T7 hợp lệ) | Phức tạp | Phụ thuộc đếm theo BR-06; giới hạn 3, biên 2 và 3 |
| `Issue.Resolve.Returned` | Xác nhận đã nhận lại hàng | Function Testing, Business Cycle Testing | Chuyển trạng thái (T8) | Trung bình |  |
| `Issue.Resolve.Lost` | Admin xác nhận thất lạc đơn Đang giao | Function Testing | Chuyển trạng thái | Trung bình | Chỉ khi "Đang giao" |
| `Issue.Resolve.LostStore` | Ghi sự cố Thất lạc, người báo là Admin | Function Testing, Data and Database Integrity Testing | Phân vùng tương đương + giá trị biên | Trung bình |  |
| `Issue.Resolve.LostStatus` | Chuyển đơn sang Thất lạc | Function Testing, Business Cycle Testing | Chuyển trạng thái (T10) | Trung bình |  |
| `Issue.Resolve.Result` | Ghi kết quả xử lý sự cố (bắt buộc, không rỗng) | Function Testing | Bảng quyết định (loại sự cố × số lần × trạng thái đơn); kết quả xử lý: rỗng, chỉ khoảng trắng, 1, 500, 501 ký tự | Phức tạp | Phụ thuộc đếm theo BR-06; kết quả bắt buộc |
| `7.0.E1` | Chuyển trả lại khi chưa đạt giới hạn | Function Testing | Giá trị biên của BR-06: mới có 2 lần (T7 bị 7.0.E1 từ chối), đủ 3 lần (T7 hợp lệ) | Phức tạp | Phụ thuộc đếm theo BR-06; giới hạn 3, biên 2 và 3 |

#### 2.1.5 Tài khoản

Yêu cầu ở SRS mục 3.5; đăng ký và đăng nhập không thuộc 4 tính năng của đề bài (SRS §1.3).

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `Account.Register.Fields` | Đăng ký bằng họ tên, email, mật khẩu, số điện thoại | Function Testing | Phân vùng tương đương (đủ bốn trường hợp lệ thì tạo tài khoản) | Trung bình |  |
| `Account.Register.Required` | Kiểm đủ bốn trường | Function Testing | Phân vùng tương đương + giá trị biên (từng trường: rỗng, chỉ khoảng trắng; họ tên 1, 100, 101 ký tự) | Trung bình | Trường chỉ có khoảng trắng coi là thiếu |
| `Account.Register.Email` | Kiểm định dạng email | Function Testing | Phân vùng tương đương + giá trị biên (đúng dạng WHATWG, 254 ký tự; 255 ký tự; thiếu @; chỉ khoảng trắng) | Trung bình | Theo định nghĩa "valid e-mail address" của chuẩn HTML |
| `Account.Register.Unique` | Từ chối email đã có tài khoản | Function Testing, Security and Access Control Testing | Phân vùng tương đương (email mới; email đã có; `"  An@Gmail.com "` trùng `an@gmail.com`) | Trung bình | So khớp sau khi bỏ khoảng trắng hai đầu, không phân biệt chữ hoa, chữ thường |
| `Account.Register.Password` | Kiểm độ dài mật khẩu | Function Testing | Giá trị biên (7, 8, 64, 65 ký tự) | Trung bình | Từ 8 đến 64 ký tự |
| `Account.Register.Phone` | Kiểm số điện thoại | Function Testing | Phân vùng tương đương + giá trị biên (như Order.Create.Phone) | Trung bình | 10 chữ số, bắt đầu bằng 0 |
| `Account.Register.Role` | Gán vai trò Customer cho tài khoản đăng ký | Function Testing | Phân vùng tương đương (tài khoản tạo qua đăng ký có vai trò Customer) | Đơn giản |  |
| `Account.Login.Credentials` | Đăng nhập bằng email và mật khẩu | Function Testing | Phân vùng tương đương + giá trị biên (email đúng; email khác chữ hoa, chữ thường hoặc thừa khoảng trắng hai đầu; mật khẩu 8 và 64 ký tự) | Trung bình | Email so khớp như Account.Register.Unique |
| `Account.Login.Fail` | Báo đăng nhập không thành công | Function Testing, Security and Access Control Testing | Phân vùng tương đương (sai email; sai mật khẩu; tài khoản không tồn tại) | Trung bình | Cùng một thông báo (SEC-11) |

**Quy tắc độ phức tạp** (dùng để đối chiếu khi review và để ước lượng ở §5):

- Đơn giản: hiển thị hoặc nhập một trường, một vai trò, không đổi trạng thái.
- Trung bình: kiểm hợp lệ có nhiều phân vùng, hoặc một bước chuyển trạng thái của một vai trò.
- Phức tạp: nhiều vai trò hoặc nhiều phiên, giao dịch có rollback, hoặc phụ thuộc đếm theo BR-06.

### 2.2 Yêu cầu phi chức năng

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp | Ghi chú |
|---|---|---|---|---|---|
| `RT-1` | Customer thấy trạng thái mới không tải lại | Function Testing, Security and Access Control Testing | Phiên Customer chủ đơn mở sẵn màn hình đơn; phiên khác đổi trạng thái, Customer thấy trạng thái mới không tải lại trang. Làm hai lần: do Shipper xác nhận (T3, T4) và do Admin xác nhận (ví dụ T2, T8, T10, T11 hoặc T12). Thêm phiên Customer khác, phải không nhận cập nhật | Phức tạp | Kèm SEC-2; SRS: do Shipper hoặc Admin xác nhận |
| `RT-2` | Admin thấy trạng thái mới không tải lại | Function Testing | Phiên Admin mở sẵn Bảng điều khiển (danh sách đơn Track.Admin.List); phiên khác đổi trạng thái, danh sách cập nhật không tải lại trang. Làm hai lần: do Shipper xác nhận và do Admin khác xác nhận (ví dụ T2) | Phức tạp | SRS: do Shipper hoặc Admin xác nhận |
| `SEC-1` | Đăng nhập cho mọi thao tác, trừ đăng ký và đăng nhập | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-2` | Customer chỉ tạo đơn đứng tên mình, chỉ xem đơn và yêu cầu hoàn hàng của mình | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp | Có phiên Customer thứ hai |
| `SEC-3` | Customer chỉ hoàn hàng cho đơn của mình | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-4` | Shipper chỉ xem, cập nhật đơn được phân công | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-5` | Chỉ Admin tạo vận đơn, phân công | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-6` | Chỉ Admin duyệt, từ chối, hoàn tất yêu cầu hoàn hàng | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-7` | Chỉ Admin xử lý sự cố | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-8` | Chỉ Shipper được phân công cập nhật và báo sự cố | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-9` | Đăng xuất và đăng nhập lại | Security and Access Control Testing | Ma trận vai trò × thao tác, mỗi ô thử qua giao diện và qua request trực tiếp | Phức tạp |  |
| `SEC-10` | Mật khẩu lưu dạng băm | Data and Database Integrity Testing, Security and Access Control Testing | Đọc cơ sở dữ liệu sau khi đăng ký: không có mật khẩu đọc lại được; mật khẩu 64 ký tự vẫn đăng nhập được | Trung bình | Không cắt bớt mật khẩu dài tới 64 ký tự |
| `SEC-11` | Thông báo chung khi đăng nhập không thành công | Security and Access Control Testing | Phân vùng tương đương (sai email; sai mật khẩu; tài khoản không tồn tại), so ba thông báo | Trung bình | Cùng một thông báo cho cả ba trường hợp |
| `ROB-1` | Hiển thị trạng thái mới nhất sau mất kết nối | Function Testing | Ngắt mạng phiên Customer, đổi trạng thái 2 lần, nối lại, kiểm trạng thái hiện tại và lịch sử | Phức tạp |  |
| `UI-1` | Các màn hình của hệ thống | User Interface Testing | Đối chiếu danh sách màn hình ở SRS và mockup | Đơn giản | Bố cục chi tiết theo mockup ở giai đoạn 2 |
| `CI-1` | Thông báo cho Customer khi trạng thái đổi | Function Testing | Đổi trạng thái đơn, kiểm Customer nhận thông báo | Trung bình | Thông báo trong ứng dụng |
| `DI-1` | Lịch sử trạng thái chỉ thêm, không sửa, không xóa | Data and Database Integrity Testing | Gửi request sửa / xóa bản ghi lịch sử, phải bị từ chối; kiểm cơ sở dữ liệu không đổi | Trung bình |  |
| `DI-2` | Từ chối lưu chuỗi dài hơn độ dài ở §4.2 của SRS | Function Testing, Data and Database Integrity Testing | Phân vùng tương đương + giá trị biên độ dài theo bảng biên chung: email 254/255; họ tên, tên người nhận 100/101; địa chỉ 255/256; mô tả lý do, lý do từ chối, kết quả xử lý 500/501; mật khẩu 64/65 | Trung bình | Chỉ ra trường vượt độ dài; cơ sở dữ liệu không lưu chuỗi đó |
| `OE-1` | Ứng dụng web truy cập qua trình duyệt | Function Testing | Mở các màn hình chính trên trình duyệt | Đơn giản |  |
| `OE-2` | Chạy đúng trên Chrome cho máy tính | Function Testing | Chạy bộ test trên Chrome cho máy tính, bản ổn định mới nhất | Trung bình | Chrome cho máy tính |
| `CO-1` | Cập nhật theo sự kiện, không tự tải lại theo chu kỳ | Function Testing | Theo dõi request mạng, không có request tải lại theo chu kỳ | Trung bình |  |
| `CO-2` | Giao diện bằng tiếng Việt, đúng tên trong SRS | User Interface Testing | Đối chiếu nhãn, tên trạng thái, lý do hoàn hàng, loại sự cố, tên màn hình với SRS (Hình A.2, BR-04, Issue.Report.Type, UI-1) | Đơn giản | Cùng mức với UI-1 |

Quy tắc độ phức tạp ở cuối §2.1 áp dụng cho cả bảng này.

### 2.3 Tính năng không kiểm thử

| Tính năng | Lý do |
|---|---|
| Báo cáo thống kê | Ngoài phạm vi phiên bản 1.0 (SRS §1.3, §4.3) |
| Quản lý tài khoản Admin, Shipper; xóa dữ liệu cá nhân (AS-2, AS-5) | Ngoài phạm vi; tài khoản Admin và Shipper có sẵn nhờ dữ liệu seed (AS-2). Đăng ký và đăng nhập nay đã thuộc phạm vi (§2.1.5) |
| Sửa, hủy, tìm kiếm đơn hàng đã lưu | Ngoài phạm vi phiên bản 1.0 (SRS §1.3) |
| Thanh toán, phí, hoàn tiền, bồi thường | Hệ thống không xử lý tiền, chỉ ghi nhận kết quả xử lý (BR-07) |
| Danh mục sản phẩm, đánh giá sản phẩm, kho trung chuyển | Ngoài phạm vi phiên bản 1.0 (SRS §1.3) |
| Nhiều cửa hàng | Ngoài phạm vi; hệ thống chỉ phục vụ một cửa hàng (AS-1, SRS §1.3) |
| Giao diện phần mềm và giao diện phần cứng | SRS §5.2 và §5.3 ghi "Không có" |

Giả định AS-x và quy tắc BR-xx không có dòng riêng ở §2; BR được kiểm ở §3.1.2.

## 3 Chiến lược kiểm thử

Mục này nêu cách kiểm thử: các loại kiểm thử và kỹ thuật cho từng loại (§3.1), bốn giai đoạn kiểm thử (§3.2), công cụ (§3.3) và định dạng test case (§3.4). Mỗi loại kiểm thử "Có" ở §1.4 được viết đủ bốn ý theo slide Test Plan (tài liệu 2 ở §1.3): mục tiêu, kỹ thuật, tiêu chí hoàn thành, lưu ý đặc biệt.

### 3.1 Các loại kiểm thử

#### 3.1.1 Function Testing

**Mục tiêu:** Bảo đảm mỗi yêu cầu chức năng ở SRS §3.1 đến §3.5 chạy đúng với dữ liệu hợp lệ, và bị từ chối kèm lý do với dữ liệu không hợp lệ hay thao tác không được phép. Loại này gồm cả kiểm cập nhật real-time (RT-1, RT-2, ROB-1) vì đó là kiểm hành vi có hay không.

**Kỹ thuật:** Với mỗi dòng ở §2.1 và §2.2 thuộc loại này, mỗi thành viên viết test case của module mình (§4.1) cho đường chính, đường thay thế và từng ngoại lệ, dùng phân vùng tương đương và giá trị biên cho trường nhập. Mỗi ngoại lệ và mỗi bước chuyển trạng thái "chặn" có ít nhất một ca âm. Test case chạy bằng Playwright; kết quả mong đợi là trạng thái đơn, thông báo lỗi hoặc dữ liệu hiển thị đúng theo SRS. Real-time kiểm theo kiểu có/không bằng các phiên trình duyệt chạy song song (các browser context của Playwright). SRS nói thay đổi do Shipper hoặc Admin xác nhận, nên làm cả hai: phiên Shipper xác nhận đổi trạng thái (T3, T4), và phiên Admin xác nhận đổi trạng thái (ví dụ T2, T8, T10, T11 hoặc T12); phiên Customer chủ đơn phải thấy trạng thái mới mà không tải lại trang (RT-1). Phiên Admin đang mở Bảng điều khiển (Track.Admin.List) phải cập nhật khi Shipper hoặc Admin khác đổi trạng thái (RT-2). Thêm một Customer khác đang mở màn hình đơn của mình, phiên này không được nhận cập nhật của đơn kia (RT-1 cộng SEC-2). Hai phiên Admin thao tác cùng một đơn hoặc cùng một yêu cầu dùng để kiểm 2.0.E1 và 6.0.E1.

**Tiêu chí hoàn thành:** Mọi test case của các dòng §2 loại Function Testing có Result `Pass`, hoặc `Fail` kèm Issue mức Thấp còn mở (mức độ ở §1.4).

**Lưu ý đặc biệt:** Unit test (Vitest, §3.3) là của TV3, TV4; phần Function Testing ở system test không thay unit test của họ. Trình duyệt chạy test là Chrome cho máy tính (OE-2).

#### 3.1.2 Business Cycle Testing

**Mục tiêu:** Bảo đảm mỗi quy tắc nghiệp vụ BR-01 đến BR-07 được áp dụng đúng trên toàn vòng đời đơn hàng và yêu cầu hoàn hàng: chỉ chuyển trạng thái theo các bước T1 đến T12 và R1 đến R4 của Hình A.2, không có bước nào khác. Phần "chức năng chạy theo lịch định kỳ" của slide không áp dụng, vì hệ thống chạy theo sự kiện (CO-1).

**Kỹ thuật:** Dùng năm công cụ dưới đây. Mã Tn, Rn lấy từ bảng ở Phụ lục A.2 của SRS. Hàng là trạng thái hiện tại, cột là trạng thái đích.

(a) Ma trận chuyển trạng thái đơn 9 × 9. Số ở tiêu đề cột là thứ tự trạng thái, cùng thứ tự với cột "Từ" từ trên xuống. Ô hợp lệ ghi mã bước chuyển kèm vai trò kích hoạt; mọi ô còn lại, kể cả đường chéo (đơn "chuyển" sang chính trạng thái đang có), là "chặn". Mỗi ô "chặn" thử hai lần: qua giao diện (không có nút) và qua request gửi thẳng tới server (phải bị từ chối kèm lý do, Track.Update.Valid). T1 không có trạng thái nguồn nên ghi ở dòng "(bắt đầu)".

| Từ \\ Sang | 1. Chờ xác nhận | 2. Chờ lấy hàng | 3. Đang giao | 4. Đã giao | 5. Giao không thành công | 6. Đang hoàn hàng | 7. Đã hoàn về người bán | 8. Hư hỏng | 9. Thất lạc |
|---|---|---|---|---|---|---|---|---|---|
| (bắt đầu) | T1 (Customer) | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Chờ xác nhận | chặn | T2 (Admin) | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Chờ lấy hàng | chặn | chặn | T3 (Shipper) | chặn | chặn | chặn | chặn | chặn | chặn |
| Đang giao | chặn | chặn | chặn | T4 (Shipper) | T5 (Shipper) | chặn | chặn | T9 (Shipper) | T10 (Shipper hoặc Admin) |
| Đã giao | chặn | chặn | chặn | chặn | chặn | chặn | chặn | T11 (Admin) | T12 (Admin) |
| Giao không thành công | chặn | chặn | T6 (Shipper, chưa đạt giới hạn BR-06) | chặn | chặn | T7 (Admin, đạt giới hạn BR-06) | chặn | chặn | chặn |
| Đang hoàn hàng | chặn | chặn | chặn | chặn | chặn | chặn | T8 (Admin) | chặn | chặn |
| Đã hoàn về người bán | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Hư hỏng | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |
| Thất lạc | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn | chặn |

Sự cố chỉ báo được khi đơn ở "Đang giao" (SRS Phụ lục A.2). Ba hàng trạng thái kết thúc ("Đã hoàn về người bán", "Hư hỏng", "Thất lạc") ghi "chặn" vì SRS gọi là trạng thái kết thúc.

(b) Ma trận yêu cầu hoàn hàng 4 × 4, cùng quy ước. Trạng thái yêu cầu: 1. "Chờ duyệt", 2. "Đã chấp nhận", 3. "Bị từ chối", 4. "Hoàn tất".

| Từ \\ Sang | 1. Chờ duyệt | 2. Đã chấp nhận | 3. Bị từ chối | 4. Hoàn tất |
|---|---|---|---|---|
| (bắt đầu) | R1 (Customer) | chặn | chặn | chặn |
| Chờ duyệt | chặn | R2 (Admin) | R3 (Admin) | chặn |
| Đã chấp nhận | chặn | chặn | chặn | R4 (Admin) |
| Bị từ chối | chặn | chặn | chặn | chặn |
| Hoàn tất | chặn | chặn | chặn | chặn |

Mỗi ô "chặn" cũng thử qua giao diện và qua request trực tiếp (Return.Review.Valid). Hai Admin cùng duyệt một yêu cầu: người thứ hai bị từ chối (6.0.E1). Số yêu cầu mà một đơn được gửi: tối đa một (5.0.E4).

(c) Hai bảng quyết định. Bảng thứ nhất là UC-06, chỉ dùng điều kiện và kết quả SRS đã nêu (BR-05, UC-06).

| Lý do hoàn hàng | Hành động của Admin | Trạng thái yêu cầu sau đó | Trạng thái đơn sau đó |
|---|---|---|---|
| "Hàng lỗi / hư hỏng" | Chấp nhận (yêu cầu "Chờ duyệt") | "Đã chấp nhận" (R2) | "Đã giao" sang "Hư hỏng" (T11) |
| "Chưa nhận được hàng" | Chấp nhận (yêu cầu "Chờ duyệt") | "Đã chấp nhận" (R2) | "Đã giao" sang "Thất lạc" (T12) |
| "Khác" (kèm mô tả) | Chấp nhận (yêu cầu "Chờ duyệt") | "Đã chấp nhận" (R2) | Không đổi ("Đã giao"): UC-06 bước 4 chỉ đổi trạng thái đơn khi lý do thuộc BR-05 (BR-01) |
| Bất kỳ lý do | Từ chối (yêu cầu "Chờ duyệt") | "Bị từ chối" (R3) | Không đổi ("Đã giao") |
| Bất kỳ lý do | Ghi nhận hoàn tất (yêu cầu "Đã chấp nhận") | "Hoàn tất" (R4) | Không đổi |
| Bất kỳ lý do | Chấp nhận, từ chối hoặc hoàn tất khi yêu cầu không ở trạng thái tương ứng | Không đổi, báo lý do (6.0.E1 cho yêu cầu không còn ở "Chờ duyệt"; Return.Review.Valid cho bước không có trên Hình A.2, ví dụ hoàn tất yêu cầu chưa ở "Đã chấp nhận") | Không đổi |

Bảng thứ hai là bước 3 của UC-07: loại sự cố, trạng thái đơn và việc số lần giao không thành công đã đạt giới hạn (BR-06; giới hạn 3 lần) quyết định đi bước 4, bước 5 hay ngoại lệ 7.0.E1.

| Loại sự cố | Trạng thái đơn | Số lần giao không thành công | Kết quả |
|---|---|---|---|
| "Giao không thành công" | "Giao không thành công" | Đạt giới hạn, 3 lần (BR-06) | Bước 4: Admin chuyển đơn sang "Đang hoàn hàng" (T7) rồi ghi kết quả |
| "Giao không thành công" | "Giao không thành công", chưa sang "Đang hoàn hàng" | Đạt giới hạn, 3 lần (BR-06) | Ghi kết quả (Issue.Resolve.Result) bị từ chối: Admin phải chuyển đơn sang "Đang hoàn hàng" (T7) trước |
| "Giao không thành công" | "Giao không thành công" | Chưa đạt giới hạn, dưới 3 lần (BR-06) | Bước 5: ghi kết quả; Admin yêu cầu chuyển trả lại thì 7.0.E1 từ chối |
| "Giao không thành công" | Không còn là "Giao không thành công" (ví dụ đã giao lại, T6) | Bất kỳ | Bước 5: ghi kết quả |
| "Hàng hỏng" hoặc "Thất lạc" | Bất kỳ | Bất kỳ | Bước 5: ghi kết quả |

Giá trị biên của BR-06 (giới hạn 3 lần): đơn giao không thành công ở lần thứ 2 (T6 hợp lệ, T7 bị 7.0.E1 từ chối), ở lần thứ 3 (T6 bị chặn, T7 hợp lệ), và thử gửi thẳng T6 khi đã đủ 3 lần (phải bị từ chối; dựng bằng dữ liệu seed). Số lần đếm bằng số sự cố loại "Giao không thành công" đã ghi cho đơn. Biên thời hạn hoàn hàng ở BR-03 (15 × 24 giờ, đúng mốc vẫn hợp lệ) kiểm trong vòng đời hoàn hàng bên dưới.

(d) Năm vòng đời đầu-cuối, mỗi vòng chạy từ đầu tới trạng thái kết thúc và kiểm lịch sử trạng thái của đơn ở mỗi bước đổi trạng thái đơn (T1 đến T12):

1. Giao thành công: T1, T2, T3, T4.
2. Giao lại rồi thành công: T1, T2, T3, T5, T6, T4, giao lại tối đa 2 lần.
3. Trả lại: T1, T2, T3, T5 lặp tới khi đạt giới hạn (có T6 giữa các lần), rồi T7 và T8.
4. Hỏng hoặc thất lạc khi giao: T1, T2, T3 rồi T9 do Shipper; T1, T2, T3 rồi T10 do Shipper; T1, T2, T3 rồi T10 do Admin xác nhận thất lạc.
5. Hoàn hàng: đơn tới "Đã giao" (T4), Customer gửi yêu cầu (R1), Admin chấp nhận (R2) với từng lý do của BR-05 (lý do "Hàng lỗi / hư hỏng" đi T11, lý do "Chưa nhận được hàng" đi T12), rồi ghi nhận hoàn tất (R4). Nhánh khác: Admin từ chối (R3). Thử gửi yêu cầu ngay trước và ngay sau mốc hết hạn (BR-03).

(e) Quy tắc nghiệp vụ và nơi kiểm:

| Quy tắc | Kiểm ở đâu |
|---|---|
| BR-01 | Hai ma trận (a), (b): mọi ô "chặn"; mọi vòng đời |
| BR-02 | Vòng đời 5; thử gửi yêu cầu hoàn hàng với đơn ở 8 trạng thái còn lại (ma trận a, hàng khác "Đã giao") |
| BR-03 | Vòng đời 5, biên hạn hoàn hàng: 15 × 24 giờ, đúng mốc vẫn hợp lệ |
| BR-04 | Vòng đời 5, đủ 3 lý do ("Hàng lỗi / hư hỏng", "Chưa nhận được hàng", "Khác" kèm mô tả); gửi không chọn lý do; chọn "Khác" mà không có mô tả |
| BR-05 | Bảng quyết định UC-06; vòng đời 5 |
| BR-06 | Bảng quyết định UC-07 và giá trị biên; vòng đời 2 và 3 |
| BR-07 | Mọi vòng đời: không có thao tác hay trường nào xử lý tiền, chỉ ghi nhận kết quả xử lý (vòng đời 3, 4, 5) |

**Tiêu chí hoàn thành:** Mọi ô của hai ma trận có kết quả đúng ma trận (ô hợp lệ chạy được, ô "chặn" bị từ chối cả qua giao diện lẫn request trực tiếp); cả hai bảng quyết định có ít nhất một ca cho mỗi dòng; năm vòng đời chạy `Pass`; mỗi quy tắc BR-01 đến BR-07 có ít nhất một test case `Pass`.

**Lưu ý đặc biệt:** Vòng đời 3 cần đưa đơn qua nhiều lần giao không thành công nên dùng dữ liệu seed hoặc script dựng sẵn trạng thái. Vòng đời dùng tài khoản của cả ba vai trò, nên chỉ chạy đủ được sau khi TV3, TV4 xong A59, A60, A62.

#### 3.1.3 User Interface Testing

**Mục tiêu:** Bảo đảm giao diện đúng với mockup đã duyệt và dùng được cho từng vai trò: điều hướng giữa các màn hình, nhập liệu, hiển thị trạng thái, thông báo lỗi.

**Kỹ thuật:** Đối chiếu từng màn hình ở UI-1 với mockup của TV3: Đăng nhập (A8), Đăng ký (A9), Bảng điều khiển Admin (A10), Trang chủ Customer (A11), Tạo đơn hàng (A12), Chi tiết đơn hàng (A13), Yêu cầu hoàn hàng (A14), Theo dõi vận chuyển (A15), Màn hình giao hàng của Shipper (A16). Với mỗi màn hình, người test module đó (§4.1) mở màn hình bằng đúng vai trò, so bố cục, nhãn, trường nhập và nút với mockup, rồi thử điều hướng sang màn hình kế. Việc so mockup làm bằng tay (§3.3); test Playwright chỉ kiểm sự có mặt và hoạt động của các phần tử chính.

**Tiêu chí hoàn thành:** Mọi màn hình ở UI-1 khớp mockup tương ứng. Chỗ lệch được ghi Issue mức Thấp hoặc Trung bình (§1.4) và chỉ chấp nhận được khi Issue còn mở có mức Thấp.

**Lưu ý đặc biệt:** Mockup làm ở giai đoạn 2 (A8 đến A16), nên test giao diện chi tiết viết sau khi TV3 có mockup. 9 mockup đang ở PR #39, chưa merge (28/11/2026). Ngôn ngữ giao diện là tiếng Việt (CO-2) và trình duyệt là Chrome cho máy tính (OE-2).

#### 3.1.4 Data and Database Integrity Testing

**Mục tiêu:** Bảo đảm dữ liệu đơn hàng, yêu cầu hoàn hàng, sự cố và lịch sử trạng thái được lưu đúng, không mất, không bị sửa, và giao dịch tạo đơn hoàn tác đủ khi lỗi.

**Kỹ thuật:** Sau mỗi thao tác đổi trạng thái đơn (T1 đến T12), đọc lại cơ sở dữ liệu và kiểm bản ghi lịch sử: người đổi, thời điểm, trạng thái cũ, trạng thái mới (Track.Update.History); bản ghi đầu của đơn có trạng thái cũ để trống (T1). Kiểm mã đơn hàng, mã vận đơn, mã yêu cầu hoàn hàng và mã sự cố là duy nhất khi tạo nhiều bản ghi liên tiếp. Ép lỗi giữa chừng khi lưu đơn và kiểm rollback: không còn đơn, không còn bản ghi lịch sử, Customer nhận lý do (Order.Done.Failure, Order.Done.Reason). Gửi request sửa hoặc xóa bản ghi lịch sử, phải bị từ chối và cơ sở dữ liệu không đổi (DI-1). Kiểm SEC-10: không có mật khẩu đọc lại được trong cơ sở dữ liệu; mật khẩu 64 ký tự vẫn đăng nhập được.

**Tiêu chí hoàn thành:** Mọi thao tác đổi trạng thái đơn (T1 đến T12) ở vòng đời 1 đến 5 (§3.1.2) để lại đúng một bản ghi lịch sử với bốn trường đúng; không có mã trùng; rollback không để lại dữ liệu; DI-1 bị từ chối ở mọi lần thử; SEC-10 đạt (không có mật khẩu đọc lại được, mật khẩu 64 ký tự đăng nhập được).

**Lưu ý đặc biệt:** Server giữ dữ liệu trong bộ nhớ, không có database server (§1.5, §4.2), nên "đọc lại cơ sở dữ liệu" nghĩa là đọc qua API hoặc qua đối tượng lưu trữ của server trong test. Ép lỗi giữa chừng dùng header `X-Simulate-Failure` của server, với ba điểm lỗi `ORDER_STORE`, `ORDER_HISTORY`, `DELIVERY_STORE` (TV4 làm). Lịch sử hiển thị theo thứ tự từ cũ đến mới (Track.View.History); kiểm lưu trữ không phụ thuộc điều đó.

#### 3.1.5 Security and Access Control Testing

**Mục tiêu:** Bảo đảm mỗi vai trò chỉ làm được thao tác được phép và chỉ thấy dữ liệu của mình (SEC-1 đến SEC-11; SEC-10 kiểm cùng cơ sở dữ liệu ở §3.1.4), kể cả khi gửi request thẳng tới server mà không qua giao diện.

**Kỹ thuật:** Lập ma trận vai trò × thao tác. Vai trò: Chưa đăng nhập, Customer chủ đơn, Customer khác, Shipper được phân công, Shipper khác, Admin. Thao tác: các thao tác của SEC-1 đến SEC-9 và SEC-11 (đăng nhập và đăng ký, tạo và xem đơn, tạo đơn đứng tên Customer khác (SEC-2), gửi yêu cầu hoàn hàng, xem yêu cầu hoàn hàng, xem và cập nhật đơn giao, tạo vận đơn và phân công, duyệt, từ chối và hoàn tất yêu cầu hoàn hàng, báo và xử lý sự cố, đăng xuất). Mỗi ô thử hai cách: qua giao diện (nút có hiện hay không) và qua request trực tiếp (server phải từ chối hoặc cho phép đúng). Với ô cho phép, kiểm kết quả đúng; với ô cấm, kiểm dữ liệu không đổi. Thêm kiểm sau đăng xuất: quay lại trang cũ phải bị chuyển về đăng nhập (SEC-9). Kiểm cập nhật real-time không lọt sang Customer khác ở §3.1.1. Kiểm SEC-11: cùng một thông báo cho các trường hợp sai email, sai mật khẩu, tài khoản không tồn tại.

**Tiêu chí hoàn thành:** Mọi ô của ma trận có kết quả đúng ở cả hai cách thử. SEC-11 cho cùng một thông báo ở cả ba trường hợp. Không còn Issue mức Nghiêm trọng về phân quyền.

**Lưu ý đặc biệt:** Mọi sai phân quyền là mức Nghiêm trọng (§1.4), nên gặp một ô sai thì người test báo ngay cho TV4, không chờ hết bộ test. Đăng nhập bằng email và mật khẩu (Account.Login.Credentials).

#### 3.1.6 Regression Testing

**Mục tiêu:** Bảo đảm thay đổi mới (sửa lỗi, tích hợp thêm) không làm hỏng chỗ đã chạy đúng.

**Kỹ thuật:** Toàn bộ bộ test Playwright chạy lại trên GitHub Actions ở mỗi PR vào `main` và một lần trước buổi demo (task A84). TV2 (trưởng test) so kết quả với lần chạy trước và với cột Result của test case; ca nào trước đó `Pass` nay `Fail` thì mở Issue mới, gắn nhãn `bug`, ghi số vào cột Note (`Bug #n`).

**Tiêu chí hoàn thành:** Không có ca nào trước đó `Pass` chuyển sang `Fail` ở lần chạy cuối trước demo.

**Lưu ý đặc biệt:** Chỉ chạy lại được phần đã viết thành test tự động; phần so mockup làm bằng tay (§3.1.3) nên người test từng module (§4.1) chạy lại bằng tay trước demo. Chưa có hạn cuối kỳ (§1.5), nên ngày chạy cuối chưa xác định.

### 3.2 Giai đoạn kiểm thử

Bốn giai đoạn theo slide, chọn theo task trong backlog (`docs/plan/04_backlog_assignment.md`).

| Giai đoạn | Task backlog | Ai làm | Cách thực hiện |
|---|---|---|---|
| Unit test | A73, A74, A76, A77, A79 | TV3 (frontend), TV4 (server) | Unit test case viết theo quy tắc SRS (mẫu Lab2); code test ở `tests/unit/`. Test từng hàm và module bằng Vitest (§3.3), chạy bằng `npm test`. TV2 không làm giai đoạn này |
| Integration test | A59, A60, A62 (các task "Integrate …") | Cả 4 thành viên theo module (§4.1) | Người test module liên quan (§4.1) kiểm chỗ nối sau khi TV3, TV4 xong A59, A60, A62: Admin với đơn hàng, Admin với sự cố giao hàng, quản lý đơn với quản lý hoàn hàng |
| System test | A80, A81, A83 | Cả 4 thành viên theo module (§4.1) | Chạy trọn các loại ở §3.1 trên hệ thống đã ghép: real-time (A80, TV1), Shipper và ngoại lệ (A81, TV2 và TV4), toàn hệ thống (A83, TV2), bằng Playwright |
| Acceptance test | Không có trong backlog | Cả nhóm | Nhóm không có khách hàng thật, nên buổi demo với giảng viên được coi là nghiệm thu (giả định ở §1.4) |

Test case cho giai đoạn system do cả 4 thành viên viết theo module (§4.1); TV2 điều phối ở task A69. Regression Testing (A84) chạy lại bộ test của giai đoạn system.

### 3.3 Công cụ kiểm thử

Xếp theo các nhóm công cụ của slide.

| Nhóm công cụ | Dùng gì |
|---|---|
| Ghi lỗi | GitHub Issues, nhãn `bug` |
| Unit test | Vitest 2.1.9, môi trường jsdom, Testing Library cho component (`vitest.config.ts`, chạy bằng `npm test`) |
| Function test | Playwright (cấu hình và kịch bản ở PR #31, chưa merge) |
| Real-time | Playwright, nhiều browser context (phiên Customer, phiên Shipper hoặc Admin đổi trạng thái, phiên Bảng điều khiển Admin, thêm phiên Customer khác); server đẩy cập nhật qua SSE ở `/api/v1/events` |
| Chạy lại bộ test | GitHub Actions (chưa có workflow trên `main`, 28/11/2026) |
| Load / Performance test | Không dùng (lý do ở §1.4) |
| Sinh dữ liệu test | Dữ liệu seed của server (`src/server/seedData.ts`) |
| Giả lỗi | Header `X-Simulate-Failure` của server (`src/server/failureInjection.ts`) |
| Kiểm giao diện | So với mockup bằng tay |
| Mẫu tài liệu test | Lab1, Lab2 của môn |

### 3.4 Định dạng test case

Test case hệ thống ở workbook `docs/testing/system-test-cases.xlsx`, dựng từ mẫu `Template_Test Case.xls` (Lab1), gồm các sheet Cover, Test case List, ORD, TRK, RET, ISS, ACC, NFR, BCT, Test Report. Mỗi module một sheet, giữ nguyên cột của mẫu. Ngày 28/11/2026 workbook có 423 TC: ORD 55, TRK 48, RET 100, ISS 70, ACC 50, NFR 66, BCT 34. Unit test case ở `docs/testing/unit-test-cases.xlsx`, theo mẫu `Template_Unit Test Case.xls` (Lab2), chưa lên `main`; kết quả chạy unit test ở `docs/testing/unit-test-report.md`. Thiết kế test (kỹ thuật, dữ liệu, bảng biên) ở `docs/testing/test-specification.md`.

ID test case là chuỗi cố định dạng `TC-<MODULE>-<NNN>`, không dùng công thức đánh số của mẫu, vì công thức đó tự đổi số khi chèn dòng và làm gãy liên kết tới script và Issue. Module Code và tiền tố ID:

| Module Code | Phạm vi | ID |
|---|---|---|
| ORD | FE-1 Tạo đơn hàng | `TC-ORD-001` … |
| TRK | FE-2 Theo dõi vận chuyển | `TC-TRK-001` … |
| RET | FE-3 Hoàn hàng | `TC-RET-001` … |
| ISS | FE-4 Xử lý ngoại lệ | `TC-ISS-001` … |
| ACC | Tài khoản (Account.*) | `TC-ACC-001` … |
| NFR | RT, SEC, ROB, UI, CI, DI, OE, CO | `TC-NFR-001` … |
| BCT | Business Cycle Testing (§3.1.2) | `TC-BCT-001` … |

Các cột của mẫu Lab1 và nội dung ghi vào:

| Cột | Ghi gì |
|---|---|
| Description | hành vi và ID SRS |
| Procedure | các bước, có đánh số |
| Expected | kết quả, dùng tên trạng thái của Hình A.2 |
| Inter-test case Dependence | vai trò, trạng thái ban đầu, ca phải chạy trước |
| Result | `Pass`, `Fail` hoặc `N/A`; để trống nghĩa là chưa test |
| Note | `Bug #n` và đường dẫn script tự động |

Mỗi dòng ở §2 có ít nhất một test case. Ngoại lệ và bước chuyển "chặn" có ít nhất một ca âm. DI-2 xếp vào module NFR. Tên test Playwright mô tả hành vi và không chứa ID SRS (theo `AGENTS.md`); ID SRS chỉ nằm ở cột Description của file Excel.

## 4 Tài nguyên

### 4.1 Nhân lực

Cả 4 thành viên tham gia kiểm thử, chia theo module (§3.4).

| Vai trò | Người | Trách nhiệm |
|---|---|---|
| Tester (ACC, NFR); cập nhật SRS | TV1 | Test case hệ thống và chạy test của module ACC, NFR; chạy Real-time test (A80); sửa SRS khi lỗi do yêu cầu sai hoặc SRS lệch code (A43, A71) và review cuối SRS (A87) |
| Test Leader, Tester (TRK, BCT) | TV2 | Viết Test Plan; test case hệ thống và chạy test của module TRK, BCT; điều phối test case hệ thống (A69); chạy System test (A83) và Regression test (A84); viết workflow GitHub Actions chạy lại bộ test (A84); viết Test Report; cùng TV4 chạy Shipper và ngoại lệ (A81) với phần luồng Shipper của TRK |
| Tester (ORD); unit test frontend | TV3 | Test case hệ thống và chạy test của module ORD; unit test phía frontend (A73, A74, A76, A77, A79); sửa lỗi giao diện (A75, A78, A82); dựng nền Playwright |
| Tester (RET, ISS); unit test server | TV4 | Test case hệ thống và chạy test của module RET, ISS; chạy Shipper và ngoại lệ (A81) với phần ISS; unit test phía server (A73, A74, A76, A77, A79); dữ liệu seed và cách giả lỗi lưu đơn cho test; sửa lỗi server (A75, A78, A82) |

Danh sách việc test của từng người (test gì, ai test, đã xong chưa, ghi chú) ở `docs/testing/test-assignment.xlsx`.

### 4.2 Hệ thống

| Thành phần | Cấu hình |
|---|---|
| Server | Node.js, module `http`, TypeScript, mã ở `src/server/` (PR #36). Chạy bằng `npm run server` (vite-node), cổng 3000. API REST ở `/api/v1`, cập nhật real-time qua SSE ở `/api/v1/events`. Mật khẩu băm bằng scrypt (SEC-10) |
| Client | React 18, Vite 5, TypeScript 5, Tailwind CSS 3 (theo `package.json`). Trình duyệt: Chrome cho máy tính, bản ổn định mới nhất (OE-2) |
| Database server | Không có. Server giữ dữ liệu trong bộ nhớ và nạp lại từ dữ liệu seed khi khởi động; nhóm chốt cách lưu này cho phiên bản 1.0 (§1.5, §1.6) |
| Môi trường CI | GitHub Actions, chạy lại bộ test (§3.3); chưa có workflow trên `main` (28/11/2026) |

## 5 Mốc kiểm thử và ước lượng

Người ước lượng: TV2. Phương pháp: expert-based (slide 30), TV2 dựa vào kinh nghiệm để ước lượng công cho một dòng ở mỗi mức độ phức tạp, gồm đọc yêu cầu, viết test case và chuẩn bị dữ liệu. Số dòng lấy từ cột "Độ phức tạp" của §2 (93 dòng). 14 dòng thêm ngày 13/11/2026 (9 `Account.*`, `5.0.E4`, `CO-2`, `SEC-10`, `SEC-11`, `DI-2`) áp dụng quy tắc độ phức tạp của TV2 ở cuối §2.1. Công unit test do TV3, TV4 ước lượng ở giai đoạn 2. Một person-day tính là 8 giờ làm việc.

| Độ phức tạp | Số dòng | Công mỗi dòng (person-day) | Tổng (person-day) |
|---|---|---|---|
| Đơn giản | 15 | 0,25 (2 giờ) | 3,75 |
| Trung bình | 52 | 0,5 (4 giờ) | 26 |
| Phức tạp | 26 | 1,5 (12 giờ) | 39 |
| Cộng | 93 | Không áp dụng | 68,75 |

Công Test execution do TV2 ước lượng cùng phương pháp, nhưng tính theo test case vì đã có 423 TC (§3.4). Số TC tự động (332) và thủ công (91) lấy từ cột Note của workbook ở PR #31, chưa merge nên có thể đổi. Một TC tự động tính 0,05 person-day (24 phút: chạy, đọc kết quả, ghi Result, mở Issue nếu `Fail`); một TC thủ công tính 0,125 person-day (1 giờ). Lượt regression trước demo (A84) chạy lại các TC tự động trên GitHub Actions, nên chỉ tính 1 person-day để đọc và so kết quả với lượt trước.

| Lượt chạy | Số TC | Công mỗi TC (person-day) | Tổng (person-day) |
|---|---|---|---|
| Lượt đầu, tự động | 332 | 0,05 (24 phút) | 16,6 |
| Lượt đầu, thủ công | 91 | 0,125 (1 giờ) | 11,375 |
| Regression trước demo, tự động | 332 | Không áp dụng | 1 |
| Regression trước demo, thủ công | 91 | 0,125 (1 giờ) | 11,375 |
| Cộng | 423 | Không áp dụng | 40,35 |

Các mốc (slide 33):

| Mốc | Công (person-day) | Bắt đầu | Kết thúc |
|---|---|---|---|
| Test planning | 1 | 28/10/2026 | 06/11/2026 |
| Test design (viết test case) | 68,75 (bằng dòng Cộng ở bảng độ phức tạp) | 13/11/2026 | 27/11/2026 |
| Test execution | 40,35 (bằng dòng Cộng ở bảng lượt chạy) | 27/11/2026 | Chưa xác định |
| Test evaluation (Test Report) | 1 | Chưa xác định | Chưa xác định |

Test design kết thúc 27/11/2026, ngày 423 TC lên `main` (PR #36); Test execution bắt đầu cùng ngày. Chưa có hạn cuối kỳ, nên ngày kết thúc của Test execution và Test evaluation chưa xác định. Khi có hạn, Test Plan cập nhật tiếp.

## 6 Sản phẩm bàn giao

| Sản phẩm | Ngày | Người giao | Người nhận |
|---|---|---|---|
| Test Plan | 06/11/2026 | TV2 | Giảng viên |
| Test Plan 1.1 | Chưa xác định | TV2 | Giảng viên |
| Test Specification (`docs/testing/test-specification.md`) | Chưa xác định | Cả nhóm (§4.1) | Giảng viên |
| System Test Cases (`docs/testing/system-test-cases.xlsx`, mẫu Lab1) | Chưa xác định | Cả nhóm (§4.1) | Giảng viên |
| Unit Test Cases (`docs/testing/unit-test-cases.xlsx`, mẫu Lab2, chưa lên `main`) kèm Unit Test Report (`docs/testing/unit-test-report.md`) | Chưa xác định | TV3, TV4 | Giảng viên |
| Kịch bản test tự động (`tests/e2e`) | Chưa xác định | Cả nhóm (§4.1) | Giảng viên |
| Bảng phân công (`docs/testing/test-assignment.xlsx`) | Chưa xác định | TV2 | Giảng viên |
| Test Report | Chưa xác định | TV2 | Giảng viên |

Lưu ý về mẫu Lab1 (`Template_Test Case.xls`) khi dựng workbook test case hệ thống:

- Untested = tổng − Pass − Fail − N/A.
- Danh sách chọn của cột Result có lỗi chính tả "Untesed"; không chọn giá trị này, để trống nghĩa là chưa test.
- Dải SUM ở sheet Test Report phải phủ mọi dòng module.
