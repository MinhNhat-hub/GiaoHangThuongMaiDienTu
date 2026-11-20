# Quy ước đặt tên data-testid cho Kiểm thử tự động (Frontend)

Tài liệu này chuẩn hóa toàn bộ các thuộc tính `data-testid` trên giao diện người dùng, phục vụ công tác viết kịch bản kiểm thử tự động (Playwright / System Test của TV2) và Unit Test Component của TV3.

---

## 1. Nguyên tắc chung

- **Không chứa mã ID SRS**: Tuyệt đối không chứa `UC-`, `BR-`, `UI-`, `SEC-` trong `data-testid` để tránh phụ thuộc vào mã tài liệu.
- **Cấu trúc phân cấp**: `<module>-<submodule_or_context>-<action_or_element>` (ví dụ: `auth-login-submit-btn`, `order-create-btn`).
- **Thành phần dùng chung**: Tiền tố `common-` (ví dụ: `common-status-badge`, `common-confirm-dialog`).
- **Nguồn sự thật trong mã nguồn**: Được quản lý tập trung tại `src/constants/test-ids.ts`.

---

## 2. Bảng mã tra cứu data-testid

### 2.1 Thành phần dùng chung (Common Components)

| data-testid | Mô tả phần tử | Vị trí xuất hiện |
|---|---|---|
| `common-status-badge` | Huy hiệu hiển thị trạng thái (có kèm thuộc tính `data-status="<CODE>"`) | Danh sách đơn, chi tiết đơn, dashboard Admin |
| `common-confirm-dialog` | Hộp thoại xác nhận thao tác quan trọng | Modal xác nhận |
| `common-confirm-dialog-confirm` | Nút xác nhận thực hiện thao tác | Trong hộp thoại xác nhận |
| `common-confirm-dialog-cancel` | Nút hủy bỏ / xem lại | Trong hộp thoại xác nhận |
| `common-error-banner` | Banner hiển thị thông báo lỗi | Phía trên form hoặc đầu trang |
| `common-error-banner-trace` | Dòng hiển thị mã lỗi và mã truy vết `trace_id` | Dưới banner lỗi |
| `common-offline-banner` | Banner cảnh báo mất kết nối thời gian thực | Đầu trang khi mất kết nối |
| `common-offline-reconnect-btn` | Nút bấm kết nối lại thủ công | Trên banner mất kết nối |
| `common-loading-skeleton` | Khung xương tải dữ liệu | Khi đang chờ API trả về |
| `common-empty-state` | Khung hiển thị khi danh sách không có dữ liệu | Khi bảng hoặc danh sách rỗng |

### 2.2 Xác thực người dùng (Auth)

| data-testid | Mô tả phần tử |
|---|---|
| `auth-login-email-input` | Ô nhập email đăng nhập |
| `auth-login-password-input` | Ô nhập mật khẩu đăng nhập |
| `auth-login-submit-btn` | Nút bấm Đăng nhập |
| `auth-register-fullname-input` | Ô nhập họ tên đăng ký (Customer) |
| `auth-register-phone-input` | Ô nhập số điện thoại đăng ký |
| `auth-register-email-input` | Ô nhập email đăng ký |
| `auth-register-password-input` | Ô nhập mật khẩu đăng ký |
| `auth-register-submit-btn` | Nút bấm Đăng ký |
| `auth-logout-btn` | Nút bấm Đăng xuất |

### 2.3 Quản lý đơn hàng (Orders)

| data-testid | Mô tả phần tử |
|---|---|
| `order-create-btn` | Nút điều hướng tới trang Tạo đơn hàng |
| `order-step-product` | Khung bước 1: Chọn sản phẩm và số lượng |
| `order-step-recipient` | Khung bước 2: Thông tin người nhận |
| `order-step-confirm` | Khung bước 3: Xem lại và xác nhận đơn |
| `order-product-select` | Dropdown hoặc danh sách chọn sản phẩm mẫu |
| `order-quantity-input` | Ô nhập số lượng sản phẩm |
| `order-recipient-name-input` | Ô nhập họ tên người nhận |
| `order-recipient-phone-input` | Ô nhập số điện thoại người nhận |
| `order-delivery-address-input` | Ô nhập địa chỉ giao hàng |
| `order-submit-btn` | Nút bấm hoàn tất tạo đơn hàng |
| `order-cancel-creation-btn` | Nút hủy bỏ quá trình tạo đơn hàng |
| `order-list-item` | Thẻ hoặc dòng đại diện cho một đơn hàng trong danh sách |
| `order-details-container` | Khung hiển thị chi tiết đơn hàng |
| `order-status-timeline` | Danh sách lịch sử thay đổi trạng thái (cũ nhất lên đầu, theo thứ tự thời gian) |
| `order-tab-details` | Tab chuyển sang Chi tiết đơn hàng |
| `order-tab-tracking` | Tab chuyển sang Theo dõi vận chuyển |

### 2.4 Quản trị viên (Admin)

| data-testid | Mô tả phần tử |
|---|---|
| `admin-dashboard-table` | Bảng quản lý đơn hàng chờ xác nhận |
| `admin-assign-shipper-dialog` | Hộp thoại chọn Shipper để phân công |
| `admin-shipper-select` | Dropdown chọn Shipper |
| `admin-confirm-assign-btn` | Nút xác nhận phân công vận đơn |
| `admin-issues-tab` | Tab xem danh sách sự cố chưa giải quyết |
| `admin-resolve-issue-btn` | Nút bấm ghi nhận giải quyết sự cố |
| `admin-returns-tab` | Tab quản lý yêu cầu hoàn hàng |
| `admin-approve-return-btn` | Nút chấp nhận hoàn hàng |
| `admin-reject-return-btn` | Nút từ chối hoàn hàng |
| `admin-reject-reason-input` | Ô nhập lý do từ chối hoàn hàng |

### 2.5 Nhân viên giao hàng (Shipper)

| data-testid | Mô tả phần tử |
|---|---|
| `shipper-assigned-list` | Danh sách các đơn hàng được phân công cho Shipper |
| `shipper-shipment-card` | Thẻ đơn hàng trên giao diện mobile |
| `shipper-pickup-btn` | Nút bấm "Lấy hàng" (chuyển sang Đang giao) |
| `shipper-deliver-success-btn` | Nút bấm "Giao thành công" (chuyển sang Đã giao) |
| `shipper-report-issue-btn` | Nút mở modal báo cáo sự cố |
| `shipper-issue-type-select` | Chọn loại sự cố (Giao không thành công, Hàng hỏng, Thất lạc) |
| `shipper-issue-notes-input` | Ô nhập ghi chú sự cố |
| `shipper-submit-issue-btn` | Nút gửi báo cáo sự cố |

### 2.6 Yêu cầu hoàn hàng (Customer Returns)

| data-testid | Mô tả phần tử |
|---|---|
| `return-request-form` | Form gửi yêu cầu hoàn hàng cho đơn Đã giao |
| `return-reason-select` | Lựa chọn lý do hoàn hàng |
| `return-notes-input` | Ghi chú thêm lý do hoàn hàng |
| `return-submit-btn` | Nút gửi yêu cầu hoàn hàng |

