# Quy ước đặt tên data-testid cho Kiểm thử tự động (Frontend)

Tài liệu này chuẩn hóa toàn bộ các thuộc tính `data-testid` trên giao diện người dùng, phục vụ công tác viết kịch bản kiểm thử tự động (Playwright / System Test của TV2) và Unit Test Component của TV3.

---

## 1. Nguyên tắc chung

- **Không chứa mã ID đặc tả**: Tuyệt đối không chứa mã định danh yêu cầu hay quy tắc nghiệp vụ trong `data-testid` để tránh phụ thuộc vào mã tài liệu.
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
| `common-account-fullname` | Họ tên tài khoản đang đăng nhập trên thanh đầu trang | Thanh đầu trang |
| `common-account-email` | Địa chỉ email tài khoản đang đăng nhập | Thanh đầu trang |
| `common-account-phone` | Số điện thoại tài khoản đang đăng nhập | Thanh đầu trang |
| `common-nav-order-list-link` | Liên kết tới danh sách đơn hàng của Customer | Thanh đầu trang |
| `common-nav-return-list-link` | Liên kết tới danh sách yêu cầu hoàn hàng của Customer | Thanh đầu trang |
| `common-notification` | Thông báo trong ứng dụng khi trạng thái đơn thay đổi | Toàn bộ màn hình Customer |
| `common-screen-title` | Tiêu đề chính của màn hình hiện tại | Đầu mỗi màn hình |
| `common-loading-skeleton` | Khung xương tải dữ liệu | Khi đang chờ API trả về |
| `common-empty-state` | Khung hiển thị khi danh sách không có dữ liệu | Khi bảng hoặc danh sách rỗng |

### 2.2 Xác thực người dùng (Auth)

| data-testid | Mô tả phần tử |
|---|---|
| `auth-login-email-input` | Ô nhập email đăng nhập |
| `auth-login-password-input` | Ô nhập mật khẩu đăng nhập |
| `auth-login-submit-btn` | Nút bấm Đăng nhập |
| `auth-login-email-error` | Thông báo lỗi trường email đăng nhập |
| `auth-login-password-error` | Thông báo lỗi trường mật khẩu đăng nhập |
| `auth-login-register-link` | Liên kết chuyển từ trang Đăng nhập sang Đăng ký |
| `auth-register-fullname-input` | Ô nhập họ tên đăng ký (Customer) |
| `auth-register-phone-input` | Ô nhập số điện thoại đăng ký |
| `auth-register-email-input` | Ô nhập email đăng ký |
| `auth-register-password-input` | Ô nhập mật khẩu đăng ký |
| `auth-register-submit-btn` | Nút bấm Đăng ký |
| `auth-register-fullname-error` | Thông báo lỗi trường họ tên đăng ký |
| `auth-register-email-error` | Thông báo lỗi trường email đăng ký |
| `auth-register-password-error` | Thông báo lỗi trường mật khẩu đăng ký |
| `auth-register-phone-error` | Thông báo lỗi trường số điện thoại đăng ký |
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
| `order-add-line-btn` | Nút thêm dòng sản phẩm mới khi tạo đơn |
| `order-next-step-btn` | Nút chuyển sang bước tiếp theo khi tạo đơn |
| `order-edit-btn` | Nút quay lại chỉnh sửa thông tin đơn trước khi gửi |
| `order-recipient-name-input` | Ô nhập họ tên người nhận |
| `order-recipient-phone-input` | Ô nhập số điện thoại người nhận |
| `order-delivery-address-input` | Ô nhập địa chỉ giao hàng |
| `order-product-error` | Thông báo lỗi lựa chọn sản phẩm hoặc sản phẩm trùng |
| `order-quantity-error` | Thông báo lỗi số lượng sản phẩm không hợp lệ |
| `order-recipient-name-error` | Thông báo lỗi họ tên người nhận |
| `order-recipient-phone-error` | Thông báo lỗi số điện thoại người nhận |
| `order-delivery-address-error` | Thông báo lỗi địa chỉ giao hàng |
| `order-submit-btn` | Nút bấm hoàn tất tạo đơn hàng |
| `order-cancel-creation-btn` | Nút hủy bỏ quá trình tạo đơn hàng |
| `order-success-message` | Thông báo tạo đơn hàng thành công |
| `order-success-code` | Mã đơn hàng vừa tạo thành công |
| `order-list-item` | Thẻ hoặc dòng đại diện cho một đơn hàng trong danh sách |
| `order-details-container` | Khung hiển thị chi tiết đơn hàng |
| `order-details-code` | Mã đơn hàng trên màn hình chi tiết đơn |
| `order-details-customer` | Thông tin khách hàng đặt đơn trên màn hình chi tiết |
| `order-details-line` | Dòng sản phẩm và số lượng trong chi tiết đơn hàng |
| `order-status-timeline` | Danh sách lịch sử thay đổi trạng thái (từ cũ đến mới) |
| `order-status-timeline-entry` | Một mục lịch sử chuyển trạng thái trong timeline |
| `order-status-timeline-actor` | Người thực hiện thay đổi trạng thái trong mục timeline |
| `order-status-timeline-time` | Thời điểm thay đổi trạng thái trong mục timeline |
| `order-status-timeline-old-status` | Trạng thái cũ trong mục timeline |
| `order-status-timeline-new-status` | Trạng thái mới trong mục timeline |
| `order-request-return-btn` | Nút mở màn hình yêu cầu hoàn hàng từ chi tiết đơn |
| `order-tab-details` | Tab chuyển sang Chi tiết đơn hàng |
| `order-tab-tracking` | Tab chuyển sang Theo dõi vận chuyển |

### 2.4 Theo dõi vận chuyển (Shipment Tracking)

| data-testid | Mô tả phần tử |
|---|---|
| `shipment-tracking-input` | Ô nhập mã đơn hàng hoặc mã vận đơn để tra cứu |
| `shipment-tracking-search-btn` | Nút tra cứu trạng thái vận chuyển |
| `shipment-timeline-container` | Khung hiển thị thông tin vận đơn và lộ trình trạng thái |
| `shipment-code` | Mã vận đơn |
| `shipment-shipper` | Thông tin Shipper phụ trách vận đơn |
| `shipment-created-at` | Thời điểm phân công / tạo vận đơn |

### 2.5 Quản trị viên (Admin)

| data-testid | Mô tả phần tử |
|---|---|
| `admin-dashboard-table` | Bảng quản lý đơn hàng chờ phân công Shipper |
| `admin-assign-btn` | Nút mở hộp thoại tạo vận đơn và phân công Shipper cho đơn |
| `admin-assignment-tab` | Tab Chờ phân công Shipper |
| `admin-tracking-tab` | Tab Theo dõi tất cả đơn hàng |
| `admin-tracking-table` | Danh sách theo dõi toàn bộ đơn hàng của cửa hàng |
| `admin-assign-shipper-dialog` | Hộp thoại chọn Shipper để phân công |
| `admin-shipper-select` | Dropdown chọn Shipper |
| `admin-confirm-assign-btn` | Nút xác nhận phân công vận đơn |
| `admin-confirm-lost-btn` | Nút xác nhận kiện hàng thất lạc trên chi tiết đơn |
| `admin-confirm-returned-btn` | Nút xác nhận đã nhận lại hàng hoàn trên chi tiết đơn |
| `admin-issues-tab` | Tab xem danh sách sự cố chưa giải quyết |
| `admin-issues-list` | Danh sách sự cố giao hàng cần xử lý |
| `admin-issue-item` | Thẻ đại diện cho một sự cố giao hàng |
| `admin-issue-code` | Mã sự cố giao hàng |
| `admin-issue-type` | Nhãn loại sự cố giao hàng |
| `admin-issue-reporter` | Người báo cáo sự cố giao hàng |
| `admin-issue-reported-at` | Thời điểm báo cáo sự cố giao hàng |
| `admin-issue-result-input` | Ô nhập kết quả xử lý sự cố |
| `admin-issue-result-save-btn` | Nút lưu kết quả xử lý sự cố |
| `admin-issue-result-text` | Nội dung kết quả xử lý sự cố đã lưu |
| `admin-issue-result-error` | Thông báo lỗi khi nhập kết quả xử lý sự cố |
| `admin-issue-return-btn` | Nút chuyển đơn giao thất bại đủ ngưỡng sang Đang hoàn hàng |
| `admin-resolve-issue-btn` | Nút bấm ghi nhận giải quyết sự cố |
| `admin-returns-tab` | Tab quản lý yêu cầu hoàn hàng |
| `admin-returns-list` | Danh sách yêu cầu hoàn hàng cần xử lý |
| `admin-return-item` | Thẻ đại diện cho một yêu cầu hoàn hàng |
| `admin-return-reason` | Lý do hoàn hàng của yêu cầu |
| `admin-approve-return-btn` | Nút chấp nhận hoàn hàng |
| `admin-reject-return-btn` | Nút mở ô nhập lý do từ chối hoàn hàng |
| `admin-reject-reason-input` | Ô nhập lý do từ chối hoàn hàng |
| `admin-reject-return-confirm-btn` | Nút xác nhận từ chối yêu cầu hoàn hàng |
| `admin-reject-reason-error` | Thông báo lỗi khi lý do từ chối không hợp lệ |
| `admin-return-complete-form` | Khung xác nhận hoàn tất xử lý hoàn hàng |
| `admin-return-complete-btn` | Nút xác nhận hoàn tất hoàn hàng |

### 2.6 Nhân viên giao hàng (Shipper)

| data-testid | Mô tả phần tử |
|---|---|
| `shipper-nav-assigned-link` | Liên kết tới danh sách đơn hàng được phân công trên thanh điều hướng |
| `shipper-assigned-list` | Danh sách các đơn hàng được phân công cho Shipper |
| `shipper-shipment-card` | Thẻ đơn hàng trên giao diện Shipper |
| `shipper-pickup-btn` | Nút bấm "Nhận hàng & Giao" / "Giao lại hàng" (chuyển sang Đang giao) |
| `shipper-deliver-success-btn` | Nút bấm "Giao thành công" (chuyển sang Đã giao) |
| `shipper-report-issue-btn` | Nút mở biểu mẫu báo cáo sự cố |
| `shipper-shipment-history-btn` | Nút mở hộp thoại lịch sử trạng thái của đơn hàng |
| `shipper-issue-type-select` | Chọn loại sự cố (Hàng hỏng, Giao không thành công, Thất lạc) |
| `shipper-issue-notes-input` | Ô nhập ghi chú sự cố |
| `shipper-submit-issue-btn` | Nút gửi báo cáo sự cố |

### 2.7 Yêu cầu hoàn hàng (Customer Returns)

| data-testid | Mô tả phần tử |
|---|---|
| `return-request-form` | Form gửi yêu cầu hoàn hàng cho đơn Đã giao |
| `return-reason-select` | Lựa chọn lý do hoàn hàng |
| `return-notes-input` | Ghi chú thêm lý do hoàn hàng |
| `return-submit-btn` | Nút gửi yêu cầu hoàn hàng |
| `return-cancel-btn` | Nút hủy tạo yêu cầu hoàn hàng và quay lại |
| `return-reason-error` | Thông báo lỗi khi chưa chọn lý do hoàn hàng |
| `return-notes-error` | Thông báo lỗi ghi chú hoàn hàng không hợp lệ |
| `return-success-message` | Thông báo gửi yêu cầu hoàn hàng thành công |
| `return-list` | Danh sách các yêu cầu hoàn hàng của Customer |
| `return-list-item` | Thẻ đại diện cho một yêu cầu hoàn hàng trong danh sách |
| `return-item-code` | Mã yêu cầu hoàn hàng |
| `return-item-reason` | Lý do hoàn hàng hiển thị trên thẻ yêu cầu |
| `return-item-notes` | Ghi chú hoàn hàng hiển thị trên thẻ yêu cầu |
| `return-item-submitted-at` | Thời điểm gửi yêu cầu hoàn hàng |
| `return-item-reject-reason` | Lý do từ chối hiển thị khi yêu cầu bị từ chối |

