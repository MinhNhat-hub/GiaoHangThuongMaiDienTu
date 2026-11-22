# Phased Execution Prompt: TV4 Backend & Testing (SE113)

Tài liệu này chứa nội dung prompt giao việc chuẩn hóa để điều phối agent (hoặc lập trình viên) thực hiện tuần tự 5 giai đoạn cho vị trí **TV4 (`@prime-2k12`)** trong môn **SE113** (`GiaoHangThuongMaiDienTu`).

---

## NỘI DUNG PROMPT GIAO VIỆC (DÙNG ĐỂ CHẠY CÁC GIAI ĐOẠN)

```markdown
Bạn là lập trình viên đảm nhiệm vai trò **TV4 (@prime-2k12 - Backend & Testing)** trong dự án môn SE113 (kho mã: `MinhNhat-hub/GiaoHangThuongMaiDienTu`).

### BỐI CẢNH VÀ NGUYÊN TẮC BẮT BUỘC (TUÂN THỦ AGENTS.MD)
1. **Làm tuần tự từng giai đoạn**:
   - Chỉ thực hiện lần lượt từ Giai đoạn 1 đến Giai đoạn 5.
   - **Bắt buộc**: Hoàn thành giai đoạn nào phải chạy kiểm thử (unit test / integration test / verification script) đạt 100% Pass và tự kiểm tra kỹ lưỡng trước khi chuyển sang giai đoạn tiếp theo.
2. **Không Over-engineering**:
   - Sử dụng giải pháp tinh gọn, tối giản (KISS), bám sát 18 endpoints trong `docs/api-specification.md` và các luồng nghiệp vụ trong `docs/srs/SRS.md`.
   - Không dựng kiến trúc microservices hay tích hợp các thư viện bên ngoài không cần thiết.
3. **Quy chuẩn mã nguồn và kiểm thử**:
   - Toàn bộ code viết bằng **tiếng Anh**: tên biến, tên hàm, tên lớp, tên tệp, comment trên đầu hàm, log.
   - **Tuyệt đối KHÔNG chứa ID của SRS** (`UC-`, `FR-`, `NFR-`, `BR-`, `TC-`) ở bất kỳ đâu trong code hay test (tên hàm, tên biến, mô tả test). Tên test phải mô tả hành vi nghiệp vụ cụ thể (Ví dụ: `test_cannot_cancel_delivered_order`, không dùng `test_BR05_order_cancel`).
   - Test do người viết là đặc tả: không sửa, không xoá, không nới lỏng assert của các test hiện có.
4. **Quy trình Git**:
   - Làm việc trên nhánh riêng (ví dụ: `feat/server-implementation-and-testing`), không đẩy trực tiếp vào `main`.
   - Commit message theo quy chuẩn trong `README.md`, chạy văn phong tự nhiên (humanizer) cho commit và mô tả PR.

---

### CHI TIẾT 5 GIAI ĐOẠN TRIỂN KHAI

#### GIAI ĐOẠN 1: TẠO DỮ LIỆU KIỂM THỬ (SEED DATA) VÀ CƠ CHẾ GIẢ LẬP LỖI (FAILURE INJECTION)
- **Mục tiêu**: Cung cấp dữ liệu mẫu và cơ chế inject lỗi để unblock TV3 (Frontend rollback) và E2E system tests (PR #31).
- **Phạm vi công việc**:
  1. Tạo module dữ liệu mẫu (`src/server/seedData.ts` hoặc script tương ứng):
     - Tài khoản các vai trò: Quản trị viên (`admin`), Shipper (`shipper`), Khách hàng (`customer`).
     - Danh mục hàng hóa mẫu: ít nhất mã AS-2, AS-3 theo SRS.
     - Dữ liệu đơn hàng mẫu bao phủ toàn bộ vòng đời trạng thái: Chờ xử lý (`PENDING`), Đã xác nhận (`CONFIRMED`), Đang giao (`DISPATCHED`), Giao thành công (`DELIVERED`), Giao thất bại lần 1, 2, 3 (`FAILED_DELIVERY`), Yêu cầu trả hàng (`RETURN_REQUESTED`), Duyệt trả hàng (`RETURN_APPROVED`), Từ chối trả hàng (`RETURN_REJECTED`), Đã hoàn tất trả hàng (`RETURNED`).
  2. Xây dựng cơ chế mô phỏng lỗi lưu trữ đơn hàng (Failure Injection):
     - Cho phép kích hoạt lỗi lưu trữ khi tạo đơn hàng (hỗ trợ kiểm thử rollback `TC-ORD-043` đến `047`, `TC-ORD-054`, `055`).
- **Tiêu chí nghiệm thu & Kiểm tra bắt buộc**:
  - Chạy script seed dữ liệu thành công không phát sinh lỗi: `npm run test` (hoặc lệnh test tương ứng) kiểm tra tính toàn vẹn của dữ liệu mẫu.
  - Test mô phỏng injection trả về đúng lỗi lưu trữ và frontend/client xử lý rollback hợp lệ.

---

#### GIAI ĐOẠN 2: TRIỂN KHAI BACKEND API SERVER TỐI GIẢN
- **Mục tiêu**: Hiện thực hóa 18 REST endpoints và Server-Sent Events (SSE) theo `docs/api-specification.md` đã thống nhất với TV3 và phục vụ E2E test của TV1.
- **Phạm vi công việc**:
  1. Tạo server entrypoint (Node/Express, ví dụ `src/server/index.ts` hoặc `server.js`):
     - Nhóm Auth & User: `/auth/login`, `/auth/register`, `/users/profile`.
     - Nhóm Orders & Returns: `/orders`, `/orders/:id`, `/orders/:id/status`, `/returns`, `/returns/:id`.
     - Nhóm Delivery & Issues: `/deliveries`, `/deliveries/:id/attempts`, `/issues`, `/issues/:id/resolve`.
     - Endpoint thời gian thực (SSE): `/api/v1/events` phát sự kiện thay đổi trạng thái đơn và phân công giao hàng.
  2. Tích hợp logic nghiệp vụ:
     - Xử lý khiếu nại/sự cố giao hàng của Admin (A60, khớp 39 test cases module ISS).
     - Xử lý duyệt/từ chối yêu cầu trả hàng của Admin (A62, khớp 6 test cases module RET).
  3. Cấu hình script khởi chạy trong `package.json` (`npm run server` hoặc tích hợp với Vite dev server).
- **Tiêu chí nghiệm thu & Kiểm tra bắt buộc**:
  - Toàn bộ 18 endpoints phản hồi đúng HTTP Status Code, format JSON và header chuẩn theo `docs/api-specification.md`.
  - Frontend (`src/api/client.ts`) kết nối được với server mà không gặp lỗi CORS hoặc sai cấu trúc dữ liệu.
  - Chạy `npm test` hiện có đảm bảo 42/42 tests tiếp tục pass.

---

#### GIAI ĐOẠN 3: VIẾT UNIT TEST SERVER VÀ HOÀN THIỆN BÁO CÁO LAB 2
- **Mục tiêu**: Đảm bảo độ tin cậy của mã nguồn server, hoàn thành các backlog A73, A74, A76, A77, A79.
- **Phạm vi công việc**:
  1. Viết bộ unit test cho server trong `tests/unit/`:
     - Test chuyển trạng thái hợp lệ/bất hợp lệ của đơn hàng (StateMachine transitions).
     - Test quy tắc nghiệp vụ hoàn trả (thời hạn 3 ngày kể từ khi giao hàng thành công, tình trạng hàng).
     - Test phân quyền truy cập (Shipper chỉ cập nhật đơn mình nhận, Customer chỉ xem đơn của mình, Admin quản lý sự cố).
     - Đặt tên test hoàn toàn bằng tiếng Anh mô tả hành vi, không chứa ID SRS.
  2. Thu thập kết quả kiểm thử và lập báo cáo Unit Test Report theo mẫu Lab 2 trong thư mục `docs/testing/`.
- **Tiêu chí nghiệm thu & Kiểm tra bắt buộc**:
  - Chạy toàn bộ unit test với `npm test`, tỷ lệ Pass 100%.
  - Không có cảnh báo unhandled rejection hoặc memory leak.

---

#### GIAI ĐOẠN 4: THỰC THI KIỂM THỬ HỆ THỐNG (SYSTEM TESTING CHO MODULE RET & ISS)
- **Mục tiêu**: Thực thi và đánh giá 170 Test Cases được giao cho TV4 trong `docs/testing/test-assignment.xlsx`.
- **Phạm vi công việc**:
  1. Kiểm thử **Module RET (Return Management - 100 TCs)**:
     - Thực thi các test tự động bằng Playwright (phối hợp kịch bản trong PR #31).
     - Kiểm thử thủ công các trường hợp giao diện biên.
  2. Kiểm thử **Module ISS (Delivery Issues & Exceptions - 70 TCs)**:
     - Kiểm thử quy trình Shipper ghi nhận giao hàng không thành công (lần 1, lần 2, lần 3).
     - Kiểm thử quy trình Admin can thiệp xử lý hủy đơn hoặc điều phối lại.
  3. Ghi nhận kết quả: Điền `Pass` / `Fail`, ngày thực hiện, mã lỗi (nếu có) vào tệp `system-test-cases.xlsx`.
  4. Sửa các lỗi phát sinh phía server (Backlog A75, A78, A82) nếu kiểm thử phát hiện bug.
- **Tiêu chí nghiệm thu & Kiểm tra bắt buộc**:
  - 100% test cases được giao có kết quả rõ ràng, bằng chứng (log hoặc ảnh chụp nếu cần) và mã lỗi tương ứng cho các case Fail.
  - Các lỗi server nghiêm trọng được khắc phục triệt để.

---

#### GIAI ĐOẠN 5: BÁO CÁO TỔNG KẾT VÀ TẠO PULL REQUEST
- **Mục tiêu**: Đóng gói toàn bộ sản phẩm của TV4, cập nhật bảng theo dõi và tạo PR chuẩn chỉnh.
- **Phạm vi công việc**:
  1. Cập nhật trạng thái "Xong" cho toàn bộ các dòng thuộc trách nhiệm của TV4 trong `docs/testing/test-assignment.xlsx`.
  2. Kiểm tra lại toàn bộ quy chuẩn code: không chứa ID SRS, comment đúng chuẩn, tệp định dạng chuẩn.
  3. Tạo nhánh và mở Pull Request theo đúng mẫu `docs/templates/pull-request.md`. Viết mô tả PR chi tiết bằng tiếng Việt với thuật ngữ kỹ thuật tiếng Anh, chạy văn phong tự nhiên.
- **Tiêu chí nghiệm thu & Kiểm tra bắt buộc**:
  - Toàn bộ suite test (`npm test`, E2E test nếu có) đều vượt qua trên nhánh làm việc.
  - `git status` sạch sẽ, không sót file rác, file `.env` hay tệp nhị phân tạm.

---

### HƯỚNG DẪN THỰC HIỆN
Sau khi hoàn thành mỗi giai đoạn, hãy dừng lại báo cáo:
1. Đã tạo/chỉnh sửa những tệp nào.
2. Lệnh kiểm tra đã chạy và kết quả chi tiết.
3. Xác nhận tiêu chí nghiệm thu của giai đoạn đó đã đạt 100% trước khi hỏi ý kiến để bước sang giai đoạn tiếp theo.
```
