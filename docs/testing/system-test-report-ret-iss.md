# Báo cáo Kiểm thử Hệ thống (System Test Execution Report) - Module RET & ISS
**Môn học**: Nhập môn Công nghệ Phần mềm (SE113)  
**Đề tài**: Hệ thống Quản lý Giao hàng Thương mại Điện tử  
**Người thực hiện**: TV4 (`@prime-2k12` - Backend & System Testing)  
**Phạm vi**: 170 Test Cases thuộc Module RET (Hoàn hàng) và Module ISS (Xử lý Ngoại lệ)  
**Ngày thực hiện**: 22/11/2026  

---

## 1. Tổng quan Phạm vi Kiểm thử

Theo bảng phân công kiểm thử [test-assignment.xlsx](file:///e:/CODE%20BAI%20TAP/se113-TV04/docs/testing/test-assignment.xlsx) và đặc tả [test-specification.md](file:///e:/CODE%20BAI%20TAP/se113-TV04/docs/testing/test-specification.md), TV4 chịu trách nhiệm thực thi toàn bộ:
1. **Module RET (Return Management)**: **100 Test Cases** (`TC-RET-001` đến `TC-RET-100`).
2. **Module ISS (Delivery Exceptions & Issues)**: **70 Test Cases** (`TC-ISS-001` đến `TC-ISS-070`).

---

## 2. Thống kê Kết quả Thực thi

| Phân hệ (Module) | Số lượng Test Cases | Số lượng Đạt (Pass) | Số lượng Hỏng (Fail) | Tỷ lệ Đạt | Tình trạng |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **RET** (Hoàn hàng) | **100** | **100** | **0** | **100%** | **Hoàn thành** |
| **ISS** (Sự cố giao hàng) | **70** | **70** | **0** | **100%** | **Hoàn thành** |
| **Tổng cộng (TV4)** | **170** | **170** | **0** | **100%** | **Hoàn thành** |

---

## 3. Chi tiết Đánh giá Nghiệp vụ Từng Phân hệ

### 3.1. Phân hệ Hoàn hàng (Module RET - 100 Test Cases)
- **Kiểm tra tính hợp lệ của đơn hàng (Return.Request.Eligible)**:
  - Chỉ cho phép tạo yêu cầu hoàn trả đối với đơn hàng ở trạng thái `DELIVERED`.
  - Chặn các yêu cầu gửi trực tiếp tới máy chủ khi đơn hàng đang ở trạng thái `DELIVERING`, `WAITING_PICKUP`, `PENDING_CONFIRMATION` (trả về mã lỗi 400).
- **Kiểm tra thời hạn hoàn hàng 15 ngày (Return.Request.Window)**:
  - Cho phép gửi yêu cầu khi đơn hàng được giao cách đây dưới 15 ngày (ví dụ đơn mẫu `ord_4`).
  - Chặn và báo lỗi rõ ràng khi đơn hàng đã giao quá 15 ngày (đơn mẫu `ord_5`).
- **Quyền sở hữu và giới hạn yêu cầu (Return.Request.Ownership & ActiveLimit)**:
  - Ngăn chặn khách hàng gửi yêu cầu đổi trả cho đơn hàng của tài khoản khác (trả về mã 403 Forbidden).
  - Đảm bảo mỗi đơn hàng chỉ có tối đa 1 yêu cầu đổi trả đang trong trạng thái xử lý (`PENDING_APPROVAL` hoặc `ACCEPTED`).
- **Phê duyệt của Quản trị viên (Return.Review.OrderStatus & Reason)**:
  - Khi Admin duyệt (`APPROVE`): Đơn hàng chuyển sang trạng thái `RETURNING`, yêu cầu sang `ACCEPTED`.
  - Khi Admin từ chối (`REJECT`): Bắt buộc nhập lý do từ chối, đơn hàng giữ nguyên trạng thái `DELIVERED`.
  - Khi kho nhận lại hàng hoàn: Đơn hàng chuyển sang `RETURNED_TO_SELLER`, yêu cầu sang `COMPLETED`.

### 3.2. Phân hệ Xử lý Ngoại lệ (Module ISS - 70 Test Cases)
- **Ghi nhận sự cố giao hàng không thành công (Issue.Report.FailedDelivery)**:
  - Shipper ghi nhận giao hàng thất bại (lần 1, 2, 3), hệ thống tự động tăng biến đếm `failedAttempts`.
  - Khi `failedAttempts < 3`, Shipper được phép tiếp tục bắt đầu giao lại (`START_DELIVERY`).
- **Ghi nhận hàng hư hỏng và thất lạc (Issue.Report.Damaged & Lost)**:
  - Cập nhật tức thời trạng thái đơn hàng sang `DAMAGED` hoặc `LOST`, phát thông báo thời gian thực lên Dashboard của Admin.
- **Quy tắc giải quyết sự cố của Quản trị viên (Issue.Resolve.Admin & Notes)**:
  - Bắt buộc Admin phải nhập nội dung xử lý sự cố (`resolutionNotes`), không được để trống hoặc chỉ chứa khoảng trắng, giới hạn tối đa 500 ký tự.
- **Ràng buộc ngưỡng 3 lần giao thất bại (Issue.Resolve.ThreeAttemptsThreshold)**:
  - Chặn Admin chuyển trạng thái sang `RETURNING` khi đơn hàng chưa đạt đủ 3 lần giao thất bại (trả về lỗi 409 Conflict với mã `RETURN_THRESHOLD_NOT_REACHED`).
  - Cho phép chuyển sang `RETURNING` khi đã ghi nhận đủ 3 lần giao thất bại (đơn mẫu `ord_8`).

---

## 4. Lỗi Phát hiện và Khắc phục (Bug Fixing)

Trong quá trình thực thi kiểm thử hệ thống, TV4 đã phát hiện 1 lỗi phía server và đã khắc phục triệt để:
- **Mã lỗi**: `BUG-ISS-01`
- **Mô tả**: Hàm `storage.resolveIssue` chỉ kiểm tra tính hợp lệ của `resolutionNotes` ở tầng HTTP router mà thiếu kiểm tra ràng buộc không được để trống ở tầng core storage service, dẫn đến trường hợp chuỗi chỉ có khoảng trắng vẫn được cập nhật `resolved: true`.
- **Khắc phục**: Bổ sung kiểm tra bắt buộc `resolutionNotes` không được rỗng sau khi trim và không vượt quá 500 ký tự trong `src/server/storage.ts`.
- **Xác nhận**: Test case `test_iss_enforces_mandatory_non_empty_resolution_notes_on_resolve` đã pass 100%.

---

## 5. Cập nhật Tài liệu

1. Toàn bộ 170 dòng tương ứng trong file [system-test-cases.xlsx](file:///e:/CODE%20BAI%20TAP/se113-TV04/docs/testing/system-test-cases.xlsx) (sheets `RET` và `ISS`) đã được điền:
   - Cột **Result**: `Pass`
   - Cột **Test date**: `2026-11-22`
   - Sheet **Test Report**: Cập nhật số lượng đạt 100 TCs cho RET và 70 TCs cho ISS.
2. File phân công kiểm thử [test-assignment.xlsx](file:///e:/CODE%20BAI%20TAP/se113-TV04/docs/testing/test-assignment.xlsx) đã được cập nhật trạng thái **Xong** cho toàn bộ 9 đầu việc của TV4.
