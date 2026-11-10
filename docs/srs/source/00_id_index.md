# Khung ID của SRS (cập nhật 10/11/2026)

`docs/srs/SRS.md` là bản gốc của SRS. File này ghi **nguồn** của từng ID, trạng thái, BR và vấn đề mở trong SRS.md. Thêm, đổi hay bỏ ID trong SRS.md thì sửa file này và chương tương ứng trong `source/` trong cùng PR. Không tự thêm ID, trạng thái, BR hay con số khi chưa có nguồn. Bản đầu của file này là **danh sách ID gửi TV2** (mốc M1 31/10, kế hoạch mục 4).

## 0. Mã nguồn dùng trong file này

| Mã | Nguồn |
|---|---|
| ĐB | Đề bài 20 "Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử" (`DetaiGiaoHangThuongMaiDienTu.png`): FR tạo đơn hàng, theo dõi tình trạng vận chuyển, hoàn hàng; NFR cập nhật trạng thái real-time; ngoại lệ hỏng, trả lại, thất lạc |
| KH | `srs_test_plan_assignment.md` v4 (29/10/2026), số sau là mục |
| 01 | `docs/plan/01_srs_outline.md`, số sau là mục |
| 03 | `docs/plan/03_shopee_reference.md`, số sau là mục. Nhóm đã chốt mục 3–4 của file này (xác nhận 31/10/2026). Riêng "1 cửa hàng" chốt ngày 28/10/2026 (03 §3.2) |
| A-xx | Dòng backlog `BackLogPlan.xlsx`, ánh xạ ở `docs/plan/04_backlog_assignment.md` |
| S1–S8 | Nguồn tham khảo bên ngoài. S1–S5: Shopee/SPX, danh sách ở 03 §1. S6–S8: thêm ngày 10/11/2026 (GHN, GHTK, Quyết định 798/QĐ-BTTTT), danh sách ở SRS §1.4 |
| COS | Bộ mẫu `COS_Document_Example` (học format, không phải nguồn nghiệp vụ) |
| PL-C | Quyết định nhóm ngày 10/11/2026 khi chốt Phụ lục C; mã C-x sau PL-C là vấn đề được chốt, kết quả và nguồn tham khảo ở mục 9 |

Cột "Nguồn" của BR ghi đúng luật 01 §1: "Đề bài", hoặc "Quyết định nhóm ngày …", kèm mã S nếu lấy ý từ Shopee/SPX.

**TBD** = nhóm chưa chốt, không có nguồn. Mỗi TBD trỏ tới 1 dòng ở Phụ lục C (mục 9 bên dưới). Không được thay TBD bằng con số hay lựa chọn tự đặt. Từ 10/11/2026 không còn TBD; mục 9 ghi kết quả chốt.

---

## 1. Tác nhân (SRS §2.2) — nguồn 03 §3.1, §3.2; KH 1.1

| Tác nhân | Là ai | Việc trong hệ thống |
|---|---|---|
| Customer | Người mua của cửa hàng (như người mua trên Shopee) | Tạo đơn hàng, theo dõi đơn, yêu cầu hoàn hàng |
| Admin | Nhân viên cửa hàng, gộp vai trò người bán + sàn của Shopee. Có thể nhiều tài khoản, cùng 1 cửa hàng | Tạo vận đơn và phân công Shipper; duyệt / từ chối yêu cầu hoàn hàng; xử lý sự cố |
| Shipper | Nhân viên giao hàng (như nhân viên SPX) | Lấy hàng, giao hàng, cập nhật trạng thái, báo sự cố |

Số lượng người dùng: chưa có số liệu. Customer và Shipper không giới hạn số lượng (03 §3.2).

## 2. Tính năng (SRS §1.3) — nguồn ĐB, 01 §1

| ID | Tính năng | Mục SRS | UC |
|---|---|---|---|
| FE-1 | Tạo đơn hàng | 3.1 | UC-01 |
| FE-2 | Theo dõi tình trạng vận chuyển | 3.2 | UC-02, UC-03, UC-04 |
| FE-3 | Hoàn hàng | 3.3 | UC-05, UC-06 |
| FE-4 | Xử lý ngoại lệ (hỏng, trả lại, thất lạc) | 3.4 | UC-03 (báo), UC-07 (xử lý) |

Độ ưu tiên: cả 4 là **Cao**, vì đề bài bắt buộc cả 4.

**Ngoài phạm vi** (01 §1, KH 1.1, 1.4, 03 §3.5): nhiều cửa hàng; báo cáo thống kê (A41, A54–A57, A70); quản lý tài khoản người dùng / Shipper (A33, A34); sửa / hủy / tìm kiếm đơn đã lưu (A35–A37); thanh toán, phí, hoàn tiền, bồi thường (chỉ ghi nhận kết quả, xem BR-07); danh mục sản phẩm, đánh giá sản phẩm, kho trung chuyển; hoàn hàng hoặc báo sự cố cho từng sản phẩm trong đơn (PL-C, C-7); báo sự cố khi đơn không ở `Đang giao` (PL-C, C-11). Đăng ký / đăng nhập / đăng xuất không viết thành tính năng ở §3, chỉ xuất hiện ở SEC-1 và PRE-1 của UC (KH 1.1).

## 3. Trạng thái (SRS Phụ lục A.2, Hình A.2) — nguồn 03 §4, §3.3, §3.4; KH 1.1, 1.2

Trạng thái **chỉ định nghĩa ở Hình A.2**. Mọi mục khác (từ điển dữ liệu, UC, FR) chép đúng tên dưới đây.

### 3a. Trạng thái đơn hàng (9 trạng thái)

`Chờ xác nhận` · `Chờ lấy hàng` · `Đang giao` · `Đã giao` · `Giao không thành công` · `Đang hoàn hàng` · `Đã hoàn về người bán` · `Hư hỏng` · `Thất lạc`

Không có "Đã hủy" (hủy đơn ngoài phạm vi, 03 §4). Không có trạng thái kho, "Đánh giá" (03 §4).

| # | Từ | Sang | Ai / sự kiện kích hoạt | UC | Nguồn |
|---|---|---|---|---|---|
| T1 | (bắt đầu) | Chờ xác nhận | Customer tạo đơn thành công | UC-01 | 03 §4 (S2), A23 |
| T2 | Chờ xác nhận | Chờ lấy hàng | Admin tạo vận đơn và phân công Shipper | UC-02 | 03 §4 (S2, S5), KH 1.1, A26, A27 |
| T3 | Chờ lấy hàng | Đang giao | Shipper xác nhận đã lấy hàng, bắt đầu giao | UC-03 | KH 1.2, 03 §4, A64 |
| T4 | Đang giao | Đã giao | Shipper xác nhận giao thành công | UC-03 | 03 §4 (S2, S5), A64 |
| T5 | Đang giao | Giao không thành công | Shipper báo sự cố loại "Giao không thành công" | UC-03 (3.0.E2) | 03 §3.3, §4 (S5), A65, A68 |
| T6 | Giao không thành công | Đang giao | Shipper giao lại, khi số lần giao không thành công **chưa đạt** giới hạn ở BR-06 | UC-03 (3.1) | 01 §4.2; S3 mục 4 ("lần giao cuối cùng không thành công") |
| T7 | Giao không thành công | Đang hoàn hàng | Admin chuyển đơn sang trả lại, khi số lần giao không thành công **đạt** giới hạn ở BR-06 | UC-07 | 03 §3.3, §4 (S5), KH 1.1, A61, A68 |
| T8 | Đang hoàn hàng | Đã hoàn về người bán | Admin (người bán) xác nhận đã nhận lại hàng | UC-07 (7.2) | 03 §4 (S5, S3 mục 4; tên trạng thái kết thúc do nhóm đặt), 03 §3.2 |
| T9 | Đang giao | Hư hỏng | Shipper báo sự cố loại "Hàng hỏng" | UC-03 (3.0.E1) | 03 §3.4, §4 (S3), A65, A66 |
| T10 | Đang giao | Thất lạc | Shipper báo sự cố loại "Thất lạc", hoặc Admin xác nhận thất lạc | UC-03 (3.0.E3), UC-07 (7.1) | 03 §3.4, §4 (S3), A65, A67 |
| T11 | Đã giao | Hư hỏng | Admin chấp nhận yêu cầu hoàn hàng có lý do "Hàng lỗi / hư hỏng" (BR-05) | UC-06 | 03 §3.4 (S1) |
| T12 | Đã giao | Thất lạc | Admin chấp nhận yêu cầu hoàn hàng có lý do "Chưa nhận được hàng" (BR-05) | UC-06 | 03 §3.4 (S1) |

- **Trạng thái kết thúc:** `Đã hoàn về người bán`, `Hư hỏng`, `Thất lạc`. `Đã giao` kết thúc luồng bình thường; vẫn có thể sang `Hư hỏng` / `Thất lạc` qua T11, T12.
- **Hai ngả phát hiện hỏng / thất lạc về cùng trạng thái** (03 §3.4): hỏng qua T9 (Shipper) hoặc T11 (người mua); thất lạc qua T10 (Shipper / Admin) hoặc T12 (người mua).
- Sự cố chỉ báo được khi đơn ở `Đang giao` (T5, T9, T10). Sự cố ở trạng thái khác: ngoài phạm vi (PL-C, C-11).

### 3b. Trạng thái yêu cầu hoàn hàng (4 trạng thái) — nguồn 03 §4 (S1), A47–A49

`Chờ duyệt` · `Đã chấp nhận` · `Bị từ chối` · `Hoàn tất`

| # | Từ | Sang | Ai / sự kiện | UC |
|---|---|---|---|---|
| R1 | (bắt đầu) | Chờ duyệt | Customer gửi yêu cầu hoàn hàng | UC-05 |
| R2 | Chờ duyệt | Đã chấp nhận | Admin chấp nhận | UC-06 |
| R3 | Chờ duyệt | Bị từ chối | Admin từ chối | UC-06 (6.1) |
| R4 | Đã chấp nhận | Hoàn tất | Admin ghi nhận đã hoàn tất hoàn hàng (không xử lý tiền, BR-07) | UC-06 (6.2) |

Trạng thái kết thúc: `Bị từ chối`, `Hoàn tất`.

## 4. Use Case (SRS §3, Phụ lục A.1) — nguồn 01 §1, §2; TV1_SRS "Xong khi"

Mỗi UC có `PRE-1: Người dùng đã đăng nhập với vai trò …`. Người tạo: **TV1**. Ngày tạo: **31/10/2026**. Độ ưu tiên: **Cao** (mục 2). Tần suất sử dụng: **Chưa có số liệu** (01 §2).

| UC | Tên | Tác nhân chính | Loại | Mục | Backlog |
|---|---|---|---|---|---|
| UC-01 | Tạo đơn hàng | Customer | Đầy đủ | 3.1 | A23 |
| UC-02 | Phân công đơn cho Shipper (gồm tạo vận đơn) | Admin | Đơn giản | 3.2 | A26, A27, A45 |
| UC-03 | Cập nhật trạng thái giao hàng | Shipper | Đầy đủ | 3.2 (ngoại lệ dùng ở 3.4.1) | A38, A63, A64, A65 |
| UC-04 | Theo dõi đơn hàng | Customer | Đơn giản | 3.2 | A24, A39, A52 |
| UC-05 | Yêu cầu hoàn hàng | Customer | Đầy đủ | 3.3 | A47, A49 |
| UC-06 | Duyệt / từ chối yêu cầu hoàn hàng | Admin | Đơn giản | 3.3 | A48, A49 |
| UC-07 | Xử lý sự cố | Admin | Đơn giản | 3.4.2 | A46, A61, A66, A67, A68 |

**UC đầy đủ** viết như COS UC-1 (đủ mọi trường, ngoại lệ có các bước). **UC đơn giản** viết như COS UC-5 (luồng ngắn, ngoại lệ chỉ ghi tên; bỏ trường Tần suất sử dụng và Giả định).

### Luồng và ngoại lệ (ID cố định)

| UC | Luồng chính | Luồng thay thế | Ngoại lệ |
|---|---|---|---|
| UC-01 | 1.0 Tạo đơn hàng | 1.1 Sửa đơn trước khi xác nhận | 1.0.E1 Thiếu trường bắt buộc hoặc sai định dạng · 1.0.E2 Lưu đơn thất bại |
| UC-02 | 2.0 Phân công đơn cho Shipper | Không có | 2.0.E1 Đơn không còn ở trạng thái Chờ xác nhận (BR-01) |
| UC-03 | 3.0 Cập nhật trạng thái giao hàng | 3.1 Giao lại sau khi giao không thành công (T6, BR-06) · 3.2 Tiếp tục giao đơn đang giao | 3.0.E1 Hàng bị hỏng khi giao (T9) · 3.0.E2 Giao không thành công (T5, dẫn tới trả lại) · 3.0.E3 Hàng thất lạc (T10) |
| UC-04 | 4.0 Theo dõi đơn hàng | Không có | 4.0.E1 Mất kết nối khi đang theo dõi (ROB-1) |
| UC-05 | 5.0 Gửi yêu cầu hoàn hàng | 5.1 Xem trạng thái yêu cầu hoàn hàng | 5.0.E1 Đơn chưa ở trạng thái Đã giao (BR-02) · 5.0.E2 Quá thời hạn yêu cầu hoàn hàng (BR-03) · 5.0.E3 Chưa chọn lý do hoàn hàng, hoặc chọn "Khác" mà chưa nhập mô tả (BR-04) · 5.0.E4 Đơn đã có yêu cầu hoàn hàng (Return.Request.Eligible) |
| UC-06 | 6.0 Chấp nhận yêu cầu hoàn hàng | 6.1 Từ chối yêu cầu · 6.2 Ghi nhận hoàn tất | 6.0.E1 Yêu cầu không còn ở trạng thái Chờ duyệt (BR-01) |
| UC-07 | 7.0 Xử lý sự cố | 7.1 Admin xác nhận thất lạc (T10) · 7.2 Admin xác nhận đã nhận lại hàng (T8) | 7.0.E1 Admin yêu cầu chuyển trả lại khi chưa đạt số lần giao không thành công ở BR-06 (Issue.Resolve.Return, Track.Update.Valid) |

**Ba ngoại lệ của đề, mỗi cái đủ 4 ý** (TV1_SRS "Xong khi"):

| Ngoại lệ (ĐB) | Điều kiện phát hiện | Ai phát hiện | Hệ thống làm gì | Trạng thái đơn |
|---|---|---|---|---|
| Hỏng — 3.0.E1 | Shipper thấy hàng hư hỏng khi đơn đang ở `Đang giao` | Shipper | Ghi sự cố loại "Hàng hỏng" (Issue.Report.*), đổi trạng thái, hiển thị cho Admin (RT-2) | `Hư hỏng` (T9). Ngả người mua: T11 |
| Trả lại — 3.0.E2 + UC-07 | Shipper không giao được cho người nhận khi đơn ở `Đang giao` | Shipper | Ghi sự cố loại "Giao không thành công"; nếu chưa đạt BR-06 thì cho giao lại (3.1); nếu đạt thì Admin chuyển trả lại (UC-07) | `Giao không thành công` (T5) → `Đang giao` (T6) hoặc `Đang hoàn hàng` (T7) → `Đã hoàn về người bán` (T8) |
| Thất lạc — 3.0.E3 + 7.1 | Không tìm thấy hàng khi đơn ở `Đang giao` | Shipper, hoặc Admin | Ghi sự cố loại "Thất lạc", đổi trạng thái, hiển thị cho Admin (RT-2) | `Thất lạc` (T10). Ngả người mua: T12 |

## 5. Yêu cầu chức năng (SRS §3) — format `Nhóm.Việc.ChiTiết` (01 §0, §3)

Mỗi dòng con = 1 câu "Hệ thống phải…". Cột "Ý" là nội dung phải viết, không phải câu cuối cùng.

### 3.1 Tạo đơn hàng — UC-01

| ID | Ý | Nguồn |
|---|---|---|
| Order.Create | Customer tạo đơn hàng | ĐB, A23 |
| .Product | Cho Customer chọn một hoặc nhiều sản phẩm từ danh sách sản phẩm của cửa hàng (AS-3), mỗi sản phẩm một dòng, không trùng | 01 §4.1; PL-C (C-7) |
| .Quantity | Cho nhập số lượng cho mỗi sản phẩm đã chọn: số nguyên ≥ 1 | 01 §4.1; PL-C (C-1) |
| .Receiver | Cho nhập tên người nhận | 01 §4.1 |
| .Phone | Cho nhập số điện thoại người nhận: đúng 10 chữ số, bắt đầu bằng 0 | 01 §4.1; PL-C (C-1), S8 |
| .Address | Cho nhập địa chỉ giao: chuỗi tự do | 01 §4.1; PL-C (C-1) |
| .Required | Kiểm tra đủ các trường bắt buộc (ít nhất một dòng sản phẩm, số lượng, tên và số điện thoại người nhận, địa chỉ giao) và chỉ ra trường còn thiếu | 01 §4.1; PL-C (C-1) |
| .Format | Kiểm tra định dạng số lượng và số điện thoại người nhận (theo .Quantity, .Phone) và chỉ ra trường sai | 01 §4.1; PL-C (C-1) |
| Order.Confirm | Xác nhận đơn | COS Order.Confirm |
| .Display | Hiển thị lại sản phẩm, số lượng, người nhận, địa chỉ giao trước khi lưu | COS Order.Confirm.Display |
| .Prompt | Yêu cầu Customer xác nhận, sửa (luồng 1.1 của UC-01) hoặc hủy thao tác tạo đơn | COS Order.Confirm.Prompt |
| Order.Done | Khi Customer xác nhận, hệ thống làm các bước sau như 1 giao dịch | COS Order.Done |
| .Store | Gán mã đơn hàng duy nhất và lưu đơn với trạng thái `Chờ xác nhận` (Hình A.2) | 03 §4, T1 |
| .History | Ghi bản ghi đầu tiên vào lịch sử trạng thái của đơn (xem Track.Update.History) | 01 §3 |
| .Success | Hiển thị thông báo tạo đơn thành công kèm mã đơn hàng | COS Order.Pay.OK |
| .Failure | Nếu bước nào của Order.Done lỗi: hoàn tác (rollback) giao dịch | 01 §4.1, COS Order.Done.Failure |
| .Reason | Khi Order.Done.Failure xảy ra: báo Customer tạo đơn không thành công kèm lý do | 01 §4.1, COS Order.Done.Failure |

### 3.2 Theo dõi tình trạng vận chuyển — UC-02, UC-03, UC-04

| ID | Ý | Nguồn |
|---|---|---|
| Track.Assign | Admin tạo vận đơn và phân công đơn cho Shipper (UC-02) | A26, A27 |
| .List | Hiển thị cho Admin danh sách đơn ở trạng thái `Chờ xác nhận` | A45 |
| .Shipment | Tạo vận đơn có mã vận đơn duy nhất cho đơn Admin chọn | A26 |
| .Shipper | Cho Admin chọn một Shipper để phân công cho đơn | A27 |
| .Status | Khi lưu phân công, chuyển đơn sang `Chờ lấy hàng` (T2) | 03 §4 |
| Track.Update | Shipper cập nhật trạng thái giao hàng (UC-03) | A38, A64 |
| .List | Hiển thị cho Shipper danh sách đơn được phân công cho chính Shipper đó | A63 |
| .Next | Chỉ cho Shipper chọn trạng thái kế tiếp theo các bước chuyển T3, T4, T6 trên Hình A.2 (BR-01; T6 chỉ khi chưa đạt BR-06). T5, T9, T10 chỉ qua Issue.Report | 03 §4 |
| .Confirm | Yêu cầu Shipper xác nhận trước khi lưu trạng thái mới | 01 §3 |
| .Status | Khi Shipper xác nhận, chuyển đơn sang trạng thái Shipper đã chọn (T3, T4, T6) | 03 §4, A64 |
| .Valid | Từ chối mọi thao tác chuyển trạng thái đơn hàng không có trên Hình A.2 và báo lý do (BR-01) | 03 §4 |
| .History | Mỗi lần trạng thái đơn thay đổi (bởi bất kỳ ai), lưu: người đổi, thời điểm, trạng thái cũ, trạng thái mới | 01 §3, §1 (4.4) |
| Track.View | Customer theo dõi đơn hàng (UC-04) | A24, A39, A52 |
| .List | Hiển thị cho Customer danh sách đơn của chính Customer đó | A24 |
| .Current | Hiển thị trạng thái hiện tại của đơn được chọn | A52 |
| .History | Hiển thị lịch sử trạng thái của đơn được chọn theo thứ tự thời gian, từ cũ đến mới | A39; PL-C (C-13) |
| Track.Admin | Admin theo dõi đơn hàng (dùng ở UC-07 luồng 7.1, 7.2; RT-2) | A10, KH 1.2 |
| .List | Hiển thị cho Admin danh sách đơn hàng ở mọi trạng thái, kèm trạng thái hiện tại của mỗi đơn | A10 (danh sách đơn cho Admin), 03 §3.4 |

### 3.3 Hoàn hàng — UC-05, UC-06

| ID | Ý | Nguồn |
|---|---|---|
| Return.Request | Customer gửi yêu cầu hoàn hàng (UC-05) | ĐB, A47 |
| .Eligible | Chỉ cho gửi yêu cầu với đơn ở trạng thái `Đã giao` (BR-02) và chưa có yêu cầu hoàn hàng nào. Đơn phải do chính Customer tạo: xem SEC-3 | 03 §4 (S1); PL-C (C-12) |
| .Window | Chỉ cho gửi yêu cầu khi còn trong thời hạn (BR-03) | 03 §4 (S1) |
| .Reason | Bắt buộc Customer chọn một lý do từ danh sách ở BR-04; lý do "Khác" phải kèm mô tả | 03 §3.4 (S1); PL-C (C-5) |
| .Store | Lưu yêu cầu với trạng thái `Chờ duyệt` và thời điểm gửi (R1) | 03 §4 |
| Return.View | Customer xem yêu cầu hoàn hàng | A49 |
| .Status | Hiển thị cho Customer trạng thái hiện tại của các yêu cầu hoàn hàng do chính Customer gửi, kèm lý do từ chối với yêu cầu bị từ chối | 03 §4 (S1); PL-C (C-6) |
| Return.Review | Admin duyệt / từ chối yêu cầu hoàn hàng (UC-06) | A48, A49 |
| .List | Hiển thị cho Admin danh sách yêu cầu ở trạng thái `Chờ duyệt` và `Đã chấp nhận`, kèm đơn hàng và lý do | A48, A49 |
| .Approve | Khi Admin chấp nhận, chuyển yêu cầu sang `Đã chấp nhận` (R2) | A48 |
| .Reject | Khi Admin từ chối, chuyển yêu cầu sang `Bị từ chối` (R3); bắt buộc ghi lý do từ chối | A48; PL-C (C-6) |
| .OrderStatus | Khi Admin chấp nhận yêu cầu có lý do thuộc BR-05, chuyển đơn sang `Hư hỏng` hoặc `Thất lạc` (T11, T12) | 03 §3.4 |
| .Complete | Cho Admin ghi nhận `Hoàn tất` với yêu cầu `Đã chấp nhận` (R4); không xử lý tiền (BR-07) | 03 §3.5, A49 |
| .Valid | Từ chối mọi thao tác chuyển trạng thái yêu cầu hoàn hàng không có trên Hình A.2 và báo lý do (BR-01) | 03 §4 |

### 3.4.1 Báo sự cố khi giao hàng — ngoại lệ của UC-03

| ID | Ý | Nguồn |
|---|---|---|
| Issue.Report | Shipper báo sự cố khi giao hàng | ĐB, A65 |
| .Type | Cho Shipper chọn loại sự cố: "Hàng hỏng", "Giao không thành công", "Thất lạc", với đơn ở `Đang giao` | 03 §3.3, §3.4 |
| .Store | Lưu sự cố gồm: đơn hàng, loại sự cố, người báo, thời điểm báo | 03 §3.4 |
| .Status | Chuyển đơn sang trạng thái tương ứng loại sự cố theo Hình A.2 (T5, T9, T10) | 03 §4 |

### 3.4.2 Xử lý sự cố và trả lại hàng — UC-07

| ID | Ý | Nguồn |
|---|---|---|
| Issue.Resolve | Admin xử lý sự cố (UC-07) | A46 |
| .List | Hiển thị cho Admin danh sách sự cố chưa có kết quả xử lý | A46, A60 |
| .Return | Cho Admin chuyển đơn `Giao không thành công` sang `Đang hoàn hàng` khi đạt giới hạn ở BR-06 (T7) | A61, A68 |
| .Returned | Cho Admin xác nhận đã nhận lại hàng, chuyển đơn `Đang hoàn hàng` sang `Đã hoàn về người bán` (T8) | A61 |
| .Lost | Cho Admin xác nhận thất lạc một đơn ở `Đang giao` | 03 §3.4, A67 |
| .LostStore | Khi Admin xác nhận thất lạc: ghi sự cố loại "Thất lạc" với người báo là Admin | 03 §3.4, A67 |
| .LostStatus | Khi Admin xác nhận thất lạc: chuyển đơn sang `Thất lạc` (T10) | 03 §3.4, A67 |
| .Result | Cho Admin ghi kết quả xử lý của một sự cố, trừ sự cố "Giao không thành công" của đơn đã đạt giới hạn BR-06 mà đơn chưa sang `Đang hoàn hàng`; bắt buộc nhập, không được rỗng; chỉ ghi nhận, không xử lý tiền (BR-07) | 03 §3.5, A66–A68; PL-C (C-14) |

## 6. Yêu cầu phi chức năng và yêu cầu khác (SRS §2, §4, §5, §6)

| ID | Ý | Nguồn |
|---|---|---|
| OE-1 | Hệ thống là ứng dụng web, người dùng truy cập qua trình duyệt | 03 §3.2, KH v3 |
| OE-2 | Google Chrome dành cho máy tính, bản ổn định mới nhất tại thời điểm kiểm thử | 01 §1 (2.3); PL-C (C-8) |
| CO-1 | Cập nhật trạng thái theo sự kiện; không dùng cơ chế tự tải lại theo chu kỳ | KH §1 (#3), 1.2 |
| CO-2 | Giao diện tiếng Việt; tên trạng thái, lý do hoàn hàng, loại sự cố, tên màn hình dùng đúng tên trong SRS | 01 §1 (2.4); PL-C (C-9) |
| AS-1 | Hệ thống phục vụ 1 cửa hàng; mọi sản phẩm, đơn hàng thuộc cửa hàng đó; Customer, Shipper không giới hạn số lượng; Admin có thể nhiều tài khoản | 03 §3.2 (QĐ 28/10/2026) |
| AS-2 | Tài khoản Admin và Shipper đã có sẵn; Customer tự đăng ký | KH 1.1 |
| AS-3 | Danh sách sản phẩm có sẵn dưới dạng dữ liệu mẫu | 03 §3.5, 01 §1 (2.5) |
| AS-4 | Thanh toán nằm ngoài hệ thống (xem BR-07) | 03 §3.5 |
| DI-1 | Bản ghi lịch sử trạng thái chỉ được thêm, không được sửa hay xóa. Thời hạn lưu: chưa có số liệu | 01 §1 (4.4) |
| UI-1 | Có các màn hình: Đăng nhập, Đăng ký, Trang chủ Customer, Tạo đơn hàng, Chi tiết đơn hàng, Yêu cầu hoàn hàng, Theo dõi vận chuyển, Bảng điều khiển Admin, Màn hình giao hàng của Shipper. Bố cục chi tiết theo mockup ở giai đoạn 2 | A8–A16, KH 1.4 |
| SI | Không có (không kết nối hệ thống ngoài; thông báo nằm trong ứng dụng, xem CI-1) | 01 §1 (5.2); PL-C (C-2) |
| (5.3) | Không có giao diện phần cứng | 01 §1 (5.3) |
| CI-1 | Thông báo trong ứng dụng cho Customer đang đăng nhập, ở bất kỳ màn hình nào, khi trạng thái đơn của Customer thay đổi; không lưu danh sách thông báo | A53, 01 §1 (5.4); PL-C (C-2) |
| RT-1 | Khi trạng thái một đơn hàng thay đổi (Shipper hoặc Admin xác nhận), hệ thống phải hiển thị trạng thái mới trên màn hình Theo dõi vận chuyển hoặc Chi tiết đơn hàng (UI-1) của đơn đó đang mở trên máy Customer, mà không cần người dùng tải lại trang | ĐB, KH 1.2 |
| RT-2 | Như RT-1, cho danh sách đơn (Track.Admin.List) trên màn hình Bảng điều khiển Admin (UI-1) đang mở | KH 1.2 |
| SEC-1 | Người dùng phải đăng nhập cho mọi thao tác, trừ đăng ký tài khoản Customer và đăng nhập | KH 1.1, COS SEC-2 |
| SEC-2 | Customer chỉ tạo đơn hàng đứng tên chính mình, và chỉ xem đơn hàng, yêu cầu hoàn hàng do chính mình tạo | KH 1.1, 01 §1 (6.2) |
| SEC-3 | Customer chỉ gửi được yêu cầu hoàn hàng cho đơn do chính mình tạo | KH 1.1 |
| SEC-4 | Shipper chỉ xem và cập nhật được đơn được phân công cho chính mình | KH 1.1 |
| SEC-5 | Chỉ Admin được tạo vận đơn và phân công đơn cho Shipper | KH 1.1 |
| SEC-6 | Chỉ Admin được duyệt / từ chối / ghi nhận hoàn tất yêu cầu hoàn hàng | KH 1.1 |
| SEC-7 | Chỉ Admin được xử lý sự cố (UC-07) | KH 1.1 |
| SEC-8 | Chỉ Shipper được phân công cho đơn được cập nhật trạng thái giao hàng của đơn đó (T3, T4, T6) và báo sự cố cho đơn đó (Issue.Report) | KH 1.1, review 03/11/2026 |
| SEC-9 | Người dùng đã đăng nhập đăng xuất được; sau khi đăng xuất phải đăng nhập lại để thao tác (SEC-1) | A21, review 03/11/2026 |
| ROB-1 | Người xem (màn hình ở RT-1, RT-2) mất kết nối rồi kết nối lại phải thấy trạng thái mới nhất của các đơn trên màn hình, kể cả thay đổi xảy ra lúc mất kết nối | KH 1.2, COS ROB-1 |

Dòng cuối §6: các thuộc tính chất lượng khác (hiệu năng, khả dụng, an toàn, dễ dùng) chưa có yêu cầu đo được ở phiên bản này. Vì vậy không có PER-x (KH 1.2).

§4.3 Báo cáo: "Không thuộc phiên bản này" (KH 1.1).

## 7. Quy tắc nghiệp vụ (SRS §7) — bảng 5 cột như COS

| ID | Định nghĩa | Loại | Tĩnh / Động | Nguồn | Được tham chiếu bởi |
|---|---|---|---|---|---|
| BR-01 | Trạng thái đơn hàng và trạng thái yêu cầu hoàn hàng chỉ được chuyển theo các bước chuyển trên Hình A.2 | Ràng buộc | Tĩnh | Quyết định nhóm ngày 31/10/2026, tham khảo S1, S2, S5 | Track.Update.Next, Track.Update.Valid, Return.Review.Valid, UC-02, UC-03, UC-06, UC-07 |
| BR-02 | Chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái `Đã giao` | Ràng buộc | Tĩnh | Quyết định nhóm ngày 31/10/2026, tham khảo S1 | Return.Request.Eligible, UC-05 |
| BR-03 | Thời hạn yêu cầu hoàn hàng là 15 ngày (15 × 24 giờ), tính từ thời điểm đơn chuyển sang `Đã giao`; gửi đúng tại mốc hết hạn vẫn hợp lệ | Ràng buộc | Động | Quyết định nhóm ngày 31/10/2026 (mốc tính) và 10/11/2026 (con số), tham khảo S1 | Return.Request.Window, UC-05 |
| BR-04 | Lý do hoàn hàng gồm: "Hàng lỗi / hư hỏng", "Chưa nhận được hàng", "Khác"; lý do "Khác" phải kèm mô tả | Dữ kiện | Động | Quyết định nhóm ngày 31/10/2026 và 10/11/2026, tham khảo S1 | Return.Request.Reason, UC-05 |
| BR-05 | Khi yêu cầu hoàn hàng được chấp nhận: lý do "Hàng lỗi / hư hỏng" thì đơn chuyển sang `Hư hỏng`; lý do "Chưa nhận được hàng" thì đơn chuyển sang `Thất lạc` | Ràng buộc | Tĩnh | Quyết định nhóm ngày 31/10/2026, tham khảo S1 | Return.Review.OrderStatus, UC-06 |
| BR-06 | Đơn giao không thành công đủ 3 lần thì chuyển sang trả lại (`Đang hoàn hàng`); chưa đủ thì được giao lại. Số lần giao không thành công = số sự cố loại "Giao không thành công" đã ghi cho đơn | Ràng buộc | Động | Quyết định nhóm ngày 31/10/2026 (quy tắc) và 10/11/2026 (con số), tham khảo S3, S6, S7 | Issue.Resolve.Return, Track.Update.Next, UC-03 (3.1), UC-07 |
| BR-07 | Hệ thống không xử lý tiền (thanh toán, phí giao, phí hoàn, hoàn tiền, bồi thường); chỉ ghi nhận kết quả xử lý | Dữ kiện | Tĩnh | Quyết định nhóm ngày 31/10/2026, tham khảo S1, S3 | Return.Review.Complete, Issue.Resolve.Result, AS-4, UC-06, UC-07 |

## 8. Dữ liệu (SRS §4) — thực thể tối thiểu theo TV1_SRS "Xong khi"; không có thực thể Cửa hàng

| Phần tử | Thành phần / kiểu | Giá trị / ghi chú |
|---|---|---|
| người dùng | mã người dùng + họ tên + số điện thoại + vai trò + thông tin đăng nhập | Customer đăng ký bằng họ tên, số điện thoại, email, mật khẩu (PL-C, C-10) |
| số điện thoại (của người dùng) | chuỗi | Đúng 10 chữ số, bắt đầu bằng 0, như số điện thoại người nhận (PL-C, C-1, C-10) |
| thông tin đăng nhập | email + mật khẩu | Mỗi email chỉ thuộc một tài khoản (PL-C, C-10) |
| vai trò | chuỗi | Customer, Shipper, Admin |
| sản phẩm | mã sản phẩm + tên sản phẩm | Dữ liệu mẫu (AS-3) |
| đơn hàng | mã đơn hàng + Customer đặt + thời điểm tạo + 1:m{dòng đơn hàng} + người nhận + địa chỉ giao + trạng thái đơn hàng + 0:1{vận đơn} | Ít nhất 1 dòng, không trùng sản phẩm (PL-C, C-7) |
| mã đơn hàng | chuỗi, hệ thống gán | Duy nhất |
| dòng đơn hàng | sản phẩm + số lượng | |
| số lượng | số nguyên | ≥ 1, không có giới hạn trên (PL-C, C-1) |
| người nhận | tên người nhận + số điện thoại người nhận | Cả hai bắt buộc; tên không rỗng; số điện thoại đúng 10 chữ số, bắt đầu bằng 0 (PL-C, C-1) |
| địa chỉ giao | chuỗi | Bắt buộc, chuỗi tự do không rỗng (PL-C, C-1) |
| trạng thái đơn hàng | chuỗi | 9 giá trị ở mục 3a, chép từ Hình A.2 |
| vận đơn | mã vận đơn + Shipper được phân công + thời điểm tạo vận đơn | |
| lịch sử trạng thái | đơn hàng + người đổi + thời điểm + trạng thái cũ + trạng thái mới | Chỉ thêm (DI-1). Bản ghi đầu tiên: trạng thái cũ để trống |
| yêu cầu hoàn hàng | mã yêu cầu + đơn hàng + lý do hoàn hàng + mô tả lý do + trạng thái yêu cầu hoàn hàng + thời điểm gửi + lý do từ chối | Lý do từ chối bắt buộc khi bị từ chối (PL-C, C-6). Mỗi đơn tối đa 1 yêu cầu (PL-C, C-12) |
| lý do hoàn hàng | chuỗi | Giá trị ở BR-04 |
| mô tả lý do | chuỗi | Bắt buộc khi lý do là "Khác" (PL-C, C-5) |
| trạng thái yêu cầu hoàn hàng | chuỗi | 4 giá trị ở mục 3b, chép từ Hình A.2 |
| sự cố | mã sự cố + đơn hàng + loại sự cố + người báo + thời điểm báo + kết quả xử lý | |
| loại sự cố | chuỗi | Hàng hỏng, Giao không thành công, Thất lạc |
| kết quả xử lý | chuỗi do Admin nhập | BR-07. Bắt buộc, không rỗng (PL-C, C-14) |
| số lần giao không thành công | số nguyên, tính ra, không lưu | Theo BR-06 |

Độ dài các phần tử: **chưa có số liệu** (01 §0: không tự đặt số liệu).

**Quan hệ ERD:** NGƯỜI DÙNG (Customer) 1 — 0..n ĐƠN HÀNG (đặt) · NGƯỜI DÙNG (Shipper) 0..1 — 0..n ĐƠN HÀNG (được phân công, thuộc vận đơn) · ĐƠN HÀNG 1 — 1..n DÒNG ĐƠN HÀNG · SẢN PHẨM 1 — 0..n DÒNG ĐƠN HÀNG · ĐƠN HÀNG 1 — 1..n LỊCH SỬ TRẠNG THÁI · NGƯỜI DÙNG 1 — 0..n LỊCH SỬ TRẠNG THÁI (người đổi) · ĐƠN HÀNG 1 — 0..1 YÊU CẦU HOÀN HÀNG · ĐƠN HÀNG 1 — 0..n SỰ CỐ · NGƯỜI DÙNG 1 — 0..n SỰ CỐ (người báo).

## 9. Phụ lục C — vấn đề đã chốt

Nhóm chốt C-1 đến C-14 ngày 10/11/2026 (mã PL-C ở mục 0). C-15 (ngày ghi ở cột Nguồn của BR) đã đóng ở bản 1.0 nháp 3 với "Quyết định nhóm ngày 31/10/2026". SRS §Phụ lục C chỉ còn ghi "không còn vấn đề mở".

| ID | Vấn đề | Kết quả | Nguồn tham khảo |
|---|---|---|---|
| C-1 | Trường của đơn, trường bắt buộc, định dạng, ràng buộc số lượng | Đơn gồm dòng sản phẩm (sản phẩm + số lượng), tên người nhận, số điện thoại người nhận, địa chỉ giao; mọi trường bắt buộc, ít nhất 1 dòng. Số lượng nguyên ≥ 1, không có trần. Tên, địa chỉ không rỗng; địa chỉ là chuỗi tự do. Số điện thoại đúng 10 chữ số, bắt đầu bằng 0 | 01 §4.1; S8; không quản lý kho (03 §3.5) |
| C-2 | Kênh thông báo cho Customer | Thông báo trong ứng dụng cho Customer đang đăng nhập, ở bất kỳ màn hình nào; không lưu danh sách; không có SI | RT-1, CI-1 |
| C-3 | Số lần giao không thành công trước khi trả lại | 3 lần (BR-06) | S6, S7; S3 không ghi con số |
| C-4 | Thời hạn yêu cầu hoàn hàng | 15 ngày (15 × 24 giờ) từ lúc đơn sang `Đã giao`; gửi đúng tại mốc hết hạn vẫn hợp lệ (BR-03) | S1 |
| C-5 | Lý do hoàn hàng khác | Thêm "Khác", bắt buộc kèm mô tả (BR-04) | S1 |
| C-6 | Lý do từ chối | Bắt buộc; Customer xem được (Return.Review.Reject, Return.View.Status) | 01 §4.3 |
| C-7 | Số sản phẩm mỗi đơn | Một hoặc nhiều, mỗi sản phẩm một dòng, không trùng; hoàn hàng và sự cố tính cho cả đơn | §4.2 `1:m`, ERD |
| C-8 | Trình duyệt hỗ trợ | Google Chrome dành cho máy tính, bản ổn định mới nhất tại thời điểm kiểm thử (OE-2) | — |
| C-9 | Ngôn ngữ giao diện | Tiếng Việt, dùng đúng tên trong SRS (CO-2) | 01 §1 (2.4) |
| C-10 | Thông tin tài khoản | Đăng nhập bằng email + mật khẩu; Customer đăng ký bằng họ tên, email, mật khẩu, số điện thoại; mỗi email một tài khoản | AS-2 |
| C-11 | Báo sự cố ngoài `Đang giao` | Không; ngoài phạm vi phiên bản này | 03 §3.4 |
| C-12 | Số yêu cầu hoàn hàng mỗi đơn | Tối đa 1 (Return.Request.Eligible, 5.0.E4) | Hình A.2: `Bị từ chối`, `Hoàn tất` là trạng thái kết thúc |
| C-13 | Thứ tự lịch sử trạng thái | Cũ → mới (Track.View.History) | — |
| C-14 | Kết quả xử lý sự cố có bắt buộc không | Bắt buộc, không rỗng (Issue.Resolve.Result) | UC-07 bước 1 và 5 |

## 10. Thuật ngữ (Phụ lục B) — cột: Thuật ngữ / Tiếng Anh / Từ Shopee tương ứng / Định nghĩa

Bắt buộc: Customer, Admin, Shipper, Đơn hàng, Vận đơn, **Hoàn hàng**, **Trả lại**, Yêu cầu hoàn hàng, Sự cố, Hư hỏng, Thất lạc, Giao không thành công, Lịch sử trạng thái, Cửa hàng, Cập nhật theo sự kiện (real-time), TBD.

- **Hoàn hàng** (chức năng, 3.3): Customer yêu cầu trả hàng / hoàn tiền cho đơn ở `Đã giao` (BR-02, BR-04). Shopee: "Trả hàng / Hoàn tiền" (S1). Customer kích hoạt. Định nghĩa theo trạng thái đơn, vì 03 §3.3 ghi "đã nhận hàng" nhưng 03 §3.4 cho lý do "Chưa nhận được hàng".
- **Trả lại** (ngoại lệ, 3.4): giao không thành công, hàng quay về người bán. SPX: "Giao hàng không thành công" → "Đang hoàn hàng" (S5); "hoàn trả hàng" (S3). Shipper báo, Admin xử lý.
- Lưu ý: tên trạng thái `Đang hoàn hàng` (của SPX) thuộc ngả **Trả lại**, không thuộc chức năng **Hoàn hàng** (03 §3.3).

Tên tiếng Anh lấy từ tên task backlog khi có: Order (A23), Return Order (A50), Shipment (A26), Return Request (A47), Delivery Issue (A46, A65), Damaged Order (A66), Lost Order (A67), Failed Delivery (A68), Returned Order (A61), Shipment History (A39), Real-time Order Status Update (A51).
