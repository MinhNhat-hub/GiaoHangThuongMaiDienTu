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

(Viết ở bước sau.)

## 3 Chiến lược kiểm thử

(Viết ở bước sau.)

## 4 Tài nguyên

(Viết ở bước sau.)

## 5 Mốc kiểm thử và ước lượng

(Viết ở bước sau.)

## 6 Sản phẩm bàn giao

(Viết ở bước sau.)
