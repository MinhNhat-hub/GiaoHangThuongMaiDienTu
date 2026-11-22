# Báo cáo Kiểm thử Đơn vị & API Máy chủ Trước Tích hợp (Server Unit & API Pre-Integration Report) - Module RET & ISS
**Môn học**: Nhập môn Công nghệ Phần mềm (SE113)  
**Đề tài**: Hệ thống Quản lý Giao hàng Thương mại Điện tử  
**Người thực hiện**: TV4 (`@prime-2k12` - Backend & System Testing)  
**Phạm vi**: Khảo sát nghiệp vụ và kiểm thử đơn vị / API máy chủ cho 170 Test Cases thuộc Module RET (Hoàn hàng) và Module ISS (Xử lý Ngoại lệ) trước tích hợp  
**Ngày thực hiện**: 22/11/2026  

---

## 1. Tổng quan Phạm vi Kiểm thử

Theo bảng phân công kiểm thử [test-assignment.xlsx](./test-assignment.xlsx) và đặc tả [test-specification.md](./test-specification.md), TV4 phụ trách triển khai máy chủ và kiểm thử nghiệp vụ cho hai phân hệ:
1. **Module RET (Return Management)**: **100 Test Cases** (`TC-RET-001` đến `TC-RET-100`).
2. **Module ISS (Delivery Exceptions & Issues)**: **70 Test Cases** (`TC-ISS-001` đến `TC-ISS-070`).

> [!NOTE]
> Báo cáo này ghi nhận kết quả kiểm thử **unit & API phía server trước tích hợp**. Workbook [system-test-cases.xlsx](./system-test-cases.xlsx) hiện đã được đưa về trạng thái sạch sẽ `Untested` để sẵn sàng cho đợt kiểm thử tích hợp hệ thống toàn diện (chạy cả Playwright E2E và test thủ công) trên nhánh mới sau khi PR #36 và PR #31 được merge lên `main`.

---

## 2. Thống kê Kết quả Thực thi Máy chủ Trước Tích hợp

| Phân hệ (Module) | Số lượng Test Cases khảo sát | Kiểm thử Đơn vị & API Server | Tình trạng Server Backend |
| :--- | :---: | :---: | :---: |
| **RET** (Hoàn hàng) | **100** | 100% Passed (đáp ứng đúng luồng BR-05, T11, T12, R4, giới hạn độ dài DI-2) | **Sẵn sàng tích hợp** |
| **ISS** (Sự cố giao hàng) | **70** | 100% Passed (đáp ứng đúng BR-06, C-28, ngưỡng 3 lần, phân quyền Shipper/Admin) | **Sẵn sàng tích hợp** |
| **Tổng cộng (TV4)** | **170** | Đã bao phủ toàn bộ chuyển trạng thái, bảo mật và luật nghiệp vụ | **Hoàn thành đợt 1** |

---

## 3. Chi tiết Quy tắc Nghiệp vụ Đã Chuẩn Hóa Phía Máy Chủ

### 3.1. Phân hệ Hoàn hàng (Module RET - 100 Test Cases)
- **Điều kiện gửi yêu cầu hoàn hàng**:
  - Chỉ đơn hàng ở trạng thái `DELIVERED` mới được phép yêu cầu hoàn hàng.
  - Phải trong thời hạn 15 ngày kể từ thời điểm giao hàng thành công.
  - Mỗi đơn hàng chỉ được phép gửi duy nhất 1 yêu cầu hoàn hàng trong toàn bộ vòng đời đơn.
  - Khi lý do là `OTHER`, bắt buộc phải nhập mô tả chi tiết (`notes`).
  - Ghi chú `notes` không được vượt quá `APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH` (500 ký tự).
- **Phê duyệt của Quản trị viên (Khớp BR-05 & T11/T12)**:
  - Khi Admin duyệt (`APPROVE`):
    - Nếu lý do là `DAMAGED_OR_DEFECTIVE`: Đơn hàng chuyển sang trạng thái `DAMAGED`.
    - Nếu lý do là `ITEM_NOT_RECEIVED`: Đơn hàng chuyển sang trạng thái `LOST`.
    - Nếu lý do là `OTHER`: Đơn hàng giữ nguyên trạng thái `DELIVERED`.
    - Trạng thái yêu cầu hoàn hàng chuyển sang `ACCEPTED`.
  - Khi Admin từ chối (`REJECT`): Bắt buộc nhập lý do từ chối (`rejectionReason`), độ dài $\le 500$ ký tự, đơn hàng giữ nguyên trạng thái `DELIVERED`.
- **Hoàn tất xử lý hoàn hàng (Khớp R4 / UC-06)**:
  - Hàm `completeReturn` chuyển trạng thái yêu cầu hoàn hàng sang `COMPLETED`, không tự ý đổi trạng thái đơn hàng.

### 3.2. Phân hệ Xử lý Ngoại lệ (Module ISS - 70 Test Cases)
- **Báo cáo sự cố giao hàng**:
  - Shipper chỉ được báo cáo sự cố khi đơn đang ở trạng thái `DELIVERING` và đơn đó do chính mình phụ trách.
  - Shipper được phép báo cáo 3 loại sự cố: `FAILED_DELIVERY`, `DAMAGED`, hoặc `LOST` khi đơn đang giao.
  - Admin được quyền xác nhận sự cố `LOST` khi đơn hàng đang ở trạng thái `DELIVERING`.
  - Mỗi lần báo `FAILED_DELIVERY`, biến đếm số lần giao thất bại (`failedAttempts`) tăng thêm 1.
  - Khi `failedAttempts < 3`, Shipper được phép tiếp tục giao lại (`START_DELIVERY`). Khi đạt đủ 3 lần, hệ thống khóa không cho giao tiếp.
- **Xử lý sự cố và chuyển hoàn**:
  - Bắt buộc Admin nhập nội dung xử lý (`resolutionNotes`), tối đa 500 ký tự.
  - Chặn giải quyết lại sự cố đã xong (`resolved === true`).
  - Đơn hàng giao thất bại 3 lần bắt buộc phải chuyển trạng thái hoàn hàng (`RETURNING`) trước khi được giải quyết sự cố.
  - Chặn Admin chuyển sang `RETURNING` nếu đơn chưa đủ 3 lần giao thất bại (409 Conflict).

---

## 4. Nhật ký Sửa lỗi theo Đóng góp của Reviewer

1. **Chuẩn hóa máy trạng thái hoàn hàng**: Sửa `reviewReturn` chuyển sang `DAMAGED`/`LOST`/giữ nguyên `DELIVERED` thay vì ép sang `RETURNING`; sửa `completeReturn` không làm sai lệch trạng thái đơn; kiểm tra giới hạn 500 ký tự cho `notes` và `rejectionReason`.
2. **Khắc phục lỗ hổng xác thực & bảo mật**:
   - Tách biệt xác thực Bearer token cho REST API và cookie `events_token` cho SSE.
   - Bỏ cơ chế fallback `startsWith` để ngăn chặn giả mạo tài khoản.
   - Băm mật khẩu bằng thuật toán thích ứng `scrypt` với muối ngẫu nhiên 16 bytes thay vì lưu plaintext.
   - Thêm phân quyền chặt chẽ trên toàn bộ endpoints: Tách bạch rõ mã lỗi `401 UNAUTHORIZED` khi chưa đăng nhập và `403 FORBIDDEN` khi không đúng vai trò cho tất cả các route nghiệp vụ.
   - Phân luồng sự kiện SSE: Thêm cơ chế lọc vai trò `adminOnly` cho các sự kiện của ban quản trị (`order.created`, `issue.reported`), ngăn chặn rò rỉ sự kiện tới Customer và Shipper; hỗ trợ `targetUserId` để định tuyến sự kiện cá nhân.
3. **Validate dữ liệu đầu vào**: Áp dụng đầy đủ quy chuẩn email HTML5, SĐT Việt Nam, độ dài chuỗi tên và mật khẩu, kiểm tra trùng lặp sản phẩm trong đơn.
