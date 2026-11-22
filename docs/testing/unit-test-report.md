# Báo cáo Kiểm thử Đơn vị (Unit Test Report) - Lab 2
**Môn học**: Nhập môn Công nghệ Phần mềm (SE113)  
**Đề tài**: Hệ thống Quản lý Giao hàng Thương mại Điện tử  
**Người thực hiện**: TV4 (`@prime-2k12` - Backend & System Testing)  
**Phạm vi**: Mã nguồn máy chủ và các dịch vụ xử lý nghiệp vụ trung tâm  
**Framework**: Vitest v2.1.9 | Node.js v20+ | TypeScript 5.6  

---

## 1. Mục tiêu và Phạm vi Kiểm thử

Báo cáo này tổng hợp kết quả thực thi các bài kiểm thử đơn vị (Unit Test) cho các module backend và API máy chủ theo phân công trong Backlog Giai đoạn 2:
- **A73**: Unit Test – Authentication & User Profiles
- **A74**: Unit Test – Admin Operations & Issue Resolution
- **A76**: Unit Test – Order Management & Failure Rollback Simulation
- **A77**: Unit Test – Return Management & Timeframe Eligibility
- **A79**: Unit Test – Shipment Management & State Machine Transitions

---

## 2. Thống kê Tổng quan Kết quả Thực thi

| Tổng số tệp kiểm thử | Tổng số Test Cases | Số lượng Đạt (Passed) | Số lượng Lỗi (Failed) | Tỷ lệ Đạt (%) | Thời gian thực thi |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **12 tệp** | **70 tests** | **70** | **0** | **100%** | **~13.5 giây** |

*(Gồm 42 test cases frontend do TV3 phụ trách và 28 test cases backend / server do TV4 trực tiếp xây dựng và kiểm thử)*.

---

## 3. Ma trận Chi tiết Các Bài Kiểm Thử Backend (TV4 Phụ trách)

### 3.1. Phân hệ Xác thực & Quản lý Người dùng (Khớp A73)
*Tệp kiểm thử: `tests/unit/server-api-endpoints.test.ts`*

| STT | Tên ca kiểm thử | Hành vi nghiệp vụ được kiểm tra | Kết quả |
| :--- | :--- | :--- | :---: |
| 1 | `test_registers_customer_and_logs_in_with_events_cookie` | Đăng ký tài khoản tự động gán vai trò Customer, đăng nhập thành công cấp token và gắn cookie sự kiện SSE | **PASS** |
| 2 | `test_returns_unauthorized_when_credentials_do_not_match` | Trả về mã lỗi 401 với thông điệp đồng nhất khi sai email hoặc mật khẩu | **PASS** |

### 3.2. Phân hệ Quản lý Đơn hàng & Cơ chế Rollback (Khớp A76)
*Tệp kiểm thử: `tests/unit/server-seed-and-failure-injection.test.ts` & `tests/unit/server-api-endpoints.test.ts`*

| STT | Tên ca kiểm thử | Hành vi nghiệp vụ được kiểm tra | Kết quả |
| :--- | :--- | :--- | :---: |
| 3 | `test_seed_dataset_contains_all_required_roles_products_and_order_states` | Xác thực tính toàn vẹn của dữ liệu mẫu: đủ vai trò, sản phẩm AS-2, AS-3, đủ các trạng thái đơn hàng | **PASS** |
| 4 | `test_order_creation_rolls_back_when_order_storage_fails` | Giả lập lỗi ở bước lưu trữ đơn hàng: giao dịch rollback hoàn toàn, không tạo bản ghi rác | **PASS** |
| 5 | `test_order_creation_rolls_back_when_history_storage_fails` | Giả lập lỗi ở bước ghi lịch sử: hoàn tác bản ghi đơn hàng đã tạo tạm | **PASS** |
| 6 | `test_order_creation_succeeds_and_persists_when_no_failure_injected` | Tạo đơn hàng thành công khi không có lỗi mô phỏng, trạng thái khởi tạo PENDING_CONFIRMATION | **PASS** |
| 7 | `test_resolves_failure_point_from_header_values` | Trích xuất chính xác điểm giả lập lỗi từ header `X-Simulate-Failure` | **PASS** |
| 8 | `test_resets_storage_to_clean_seed_dataset` | Đưa trạng thái bộ nhớ về dữ liệu mẫu ban đầu phục vụ các kịch bản kiểm thử độc lập | **PASS** |
| 9 | `test_creates_order_and_handles_storage_failure_simulation` | Kiểm thử tích hợp qua HTTP POST `/api/v1/orders` kích hoạt mô phỏng lỗi qua header trả về 500 | **PASS** |

### 3.3. Phân hệ Vận chuyển & Máy trạng thái Giao hàng (Khớp A79)
*Tệp kiểm thử: `tests/unit/server-order-statemachine.test.ts` & `tests/unit/server-api-endpoints.test.ts`*

| STT | Tên ca kiểm thử | Hành vi nghiệp vụ được kiểm tra | Kết quả |
| :--- | :--- | :--- | :---: |
| 10 | `test_transitions_pending_order_to_waiting_pickup_when_admin_creates_shipment` | Admin tạo vận đơn chuyển đơn hàng sang WAITING_PICKUP và gán mã Shipper | **PASS** |
| 11 | `test_transitions_waiting_pickup_order_to_delivering_when_shipper_starts_delivery` | Shipper xác nhận lấy hàng chuyển trạng thái đơn sang DELIVERING | **PASS** |
| 12 | `test_transitions_delivering_order_to_delivered_when_shipper_confirms_delivery` | Shipper xác nhận giao hàng thành công chuyển trạng thái sang DELIVERED | **PASS** |
| 13 | `test_rejects_confirming_delivery_when_order_is_not_in_delivering_state` | Chặn cập nhật DELIVERED nếu đơn hàng chưa trong trạng thái DELIVERING | **PASS** |
| 14 | `test_increments_failed_attempts_counter_when_shipper_reports_failed_delivery` | Shipper báo sự cố không giao được: tăng biến đếm số lần giao thất bại | **PASS** |
| 15 | `test_allows_restarting_delivery_from_failed_state_when_under_max_attempts` | Cho phép giao lại từ trạng thái FAILED_DELIVERY khi số lần thất bại < 3 | **PASS** |
| 16 | `test_transitions_returning_order_to_returned_to_seller_on_warehouse_receipt` | Kho xác nhận nhận lại hàng chuyển trạng thái từ RETURNING sang RETURNED_TO_SELLER | **PASS** |
| 17 | `test_executes_shipment_assignment_and_status_transitions` | Kiểm thử tích hợp toàn bộ chu trình phân công, lấy hàng và giao hàng qua REST API | **PASS** |

### 3.4. Phân hệ Đổi trả Hàng hóa (Khớp A77)
*Tệp kiểm thử: `tests/unit/server-business-rules.test.ts` & `tests/unit/server-api-endpoints.test.ts`*

| STT | Tên ca kiểm thử | Hành vi nghiệp vụ được kiểm tra | Kết quả |
| :--- | :--- | :--- | :---: |
| 18 | `test_allows_return_submission_only_for_delivered_order_within_timeframe` | Chỉ cho phép gửi yêu cầu đổi trả đối với đơn hàng DELIVERED | **PASS** |
| 19 | `test_rejects_return_request_when_delivered_order_exceeds_window` | Từ chối yêu cầu đổi trả đối với đơn hàng đã giao quá thời hạn 15 ngày | **PASS** |
| 20 | `test_blocks_customer_from_submitting_return_for_another_customers_order` | Ngăn chặn khách hàng gửi yêu cầu trả hàng cho đơn của khách hàng khác | **PASS** |
| 21 | `test_prevents_duplicate_active_return_requests_for_same_order` | Chặn tạo nhiều hơn 1 yêu cầu đổi trả đang xử lý trên cùng một đơn hàng | **PASS** |
| 22 | `test_approving_return_request_transitions_order_status_to_returning` | Admin duyệt yêu cầu đổi trả: chuyển trạng thái đơn hàng sang RETURNING | **PASS** |
| 23 | `test_rejecting_return_request_records_reason_and_preserves_order_status` | Admin từ chối đổi trả: lưu lý do từ chối và giữ nguyên trạng thái DELIVERED của đơn | **PASS** |
| 24 | `test_executes_return_request_submission_and_admin_review` | Kiểm thử tích hợp quy trình gửi và duyệt yêu cầu hoàn trả qua HTTP API | **PASS** |

### 3.5. Phân hệ Quản trị & Xử lý Sự cố (Khớp A74)
*Tệp kiểm thử: `tests/unit/server-business-rules.test.ts` & `tests/unit/server-api-endpoints.test.ts`*

| STT | Tên ca kiểm thử | Hành vi nghiệp vụ được kiểm tra | Kết quả |
| :--- | :--- | :--- | :---: |
| 25 | `test_admin_resolves_delivery_issue_with_recorded_timestamp_and_actor` | Admin giải quyết sự cố giao hàng: ghi nhận thời điểm và mã nhân viên xử lý | **PASS** |
| 26 | `test_executes_issue_reporting_and_admin_resolution` | Kiểm thử tích hợp shipper báo cáo sự cố và Admin xử lý sự cố qua API | **PASS** |
| 27 | `test_enforces_three_attempt_threshold_before_processing_return_to_seller` | Chặn Admin chuyển trạng thái hoàn trả nếu chưa đủ 3 lần giao thất bại (409 Conflict) | **PASS** |
| 28 | `test_retrieves_product_catalog_with_preloaded_items` | Lấy danh mục sản phẩm mẫu phục vụ khách hàng chọn mặt hàng | **PASS** |

---

## 4. Kết luận Đánh giá Chất lượng

1. **Tuân thủ AGENTS.md**:
   - 100% mã nguồn và tên test sử dụng tiếng Anh, mô tả hành vi nghiệp vụ rõ ràng.
   - Hoàn toàn không chứa các ký hiệu mã SRS (`UC-`, `FR-`, `BR-`, `TC-`) trong mã nguồn kiểm thử.
2. **Khả năng kiểm soát lỗi**:
   - Máy trạng thái đơn hàng được bảo vệ chặt chẽ, các bước chuyển không hợp lệ đều bị chặn và trả về mã lỗi thích hợp.
   - Cơ chế Transaction Staging và Rollback hoạt động hoàn hảo khi có lỗi giả lập lưu trữ.
3. **Sẵn sàng cho Kiểm thử Hệ thống (System Test)**:
   - Toàn bộ 18 endpoints RESTful và kênh SSE phục vụ đầy đủ yêu cầu cho các kịch bản kiểm thử E2E tự động của TV1 (PR #31) và việc thực thi 170 Test Cases cho module RET và ISS ở Giai đoạn 4.
