# Theo dõi test case và code test so với Test Plan

Ngày rà lần đầu: 28/11/2026. Người soạn: TV2.

Tệp này ghi ID nào của SRS đã có TC hệ thống, đã có unit test, và còn thiếu gì so với Test Plan. Ai thêm hoặc sửa code test thì cập nhật cột Unit test và mục 5.2 trong cùng PR.

## 1. Phạm vi và cách rà

- Code: `origin/main` tại `d4273fb` (đã merge PR #36). Đọc qua `git archive`/`git show`, không checkout.
- ID yêu cầu lấy từ `docs/srs/SRS.md`: 58 FR con (Order, Track, Return, Issue, Account), 13 ngoại lệ `x.0.Ey`, 18 NFR (RT, SEC, ROB, DI, UI, CI), 4 ràng buộc OE/CO và 7 BR. AS-1 đến AS-5, FE-1 đến FE-4 là giả định và tên tính năng nên không đưa vào bảng.
- TC hệ thống: `docs/testing/system-test-cases.xlsx`, 423 TC ở 7 sheet. ID được tính là "có TC" khi tên TC nhắc ID đó.
- Unit test: `docs/testing/unit-test-report.md` và 13 tệp trong `tests/unit/`. Cột Unit ghi tên tệp viết tắt:
  - S-api = `server-api-endpoints.test.ts`, S-br = `server-business-rules.test.ts`, S-sm = `server-order-statemachine.test.ts`, S-ri = `server-ret-iss-system-execution.test.ts`, S-seed = `server-seed-and-failure-injection.test.ts`
  - F-ord = `customer-orders.test.tsx`, F-adm = `admin-dashboard.test.tsx`, F-shp = `shipper-delivery.test.tsx`, F-ret = `customer-returns-realtime.test.tsx`, F-login = `auth-login.test.tsx`, F-reg = `auth-register.test.tsx`, F-rt = `realtime-session.test.ts`, F-val = `validation-and-date.test.ts`
- Đường dẫn code: `R` = `src/server/router.ts`, `St` = `src/server/storage.ts`, các tệp khác ghi đủ đường dẫn dưới `src/`.
- Người phụ trách lấy theo sheet By Module của `test-assignment.xlsx`: ORD TV3, TRK TV2, RET TV4, ISS TV4, ACC TV1, NFR TV1, BCT TV2. Unit test phía frontend là TV3, phía server là TV4 (By Member dòng 19 và 30).

## 2. Ba điều cần biết trước khi đọc bảng

1. Về thiết kế thì TC hệ thống đã phủ đủ: ID nào trong SRS cũng có ít nhất một TC. Nhưng cả 423 TC đều còn `Untested`, và sheet Test Report ghi 0 Pass, 0 Fail. Cột Note của TC trỏ tới `tests/e2e/*.spec.ts`, mà `origin/main` chưa có thư mục `tests/e2e` hay workflow `.github` nào (PR #31 chưa merge). Vì vậy "có TC" ở đây chỉ có nghĩa là TC đã được viết ra, chưa có nghĩa là đã kiểm.
2. Khoảng trống thật nằm ở unit test, nhất là phía server: phân quyền (SEC-2 đến SEC-8), các nhánh từ chối của máy trạng thái và luồng real-time phía server (`src/server/events.ts` chưa có test nào).
3. `unit-test-report.md` đã cũ so với code. Báo cáo ghi 70 test trong 12 tệp, nhưng main có 13 tệp. Dòng 22 của báo cáo ghi duyệt hoàn hàng thì đơn sang `RETURNING`, còn code (`St:591-615`) và test hiện tại (S-br:81) đưa đơn sang `DAMAGED`/`LOST` theo BR-05.

## 3. Bảng đối chiếu

Ký hiệu ở cột Khoảng trống: "Đủ" nghĩa là đã có TC hệ thống và có unit test chạm đúng hành vi. "Thiếu unit" nghĩa là chưa có unit test nào. "Lệch" nghĩa là code khác SRS; cách xử lý từng chỗ ở mục 5.3.

### 3.1 Tạo đơn hàng (ORD, TV3)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| Order.Create.Product | Chọn sản phẩm, không trùng dòng | `features/orders/CreateOrderPage.tsx:76-102`, `St:161-166`, `R:319` | TC-ORD-001..004 | F-ord:115, F-val:81, S-api:89 (`/products`) | Lệch: server không kiểm `productId` có trong danh mục (`St:178-185` gán tên "Sản phẩm"). Thiếu unit server cho dòng trùng |
| Order.Create.Quantity | Số nguyên ≥ 1 | `utils/validation.ts:112`, `St:167` | TC-ORD-005..007 | F-val:81, F-ord:115 | Thiếu unit server (`St:167`) |
| Order.Create.Receiver | Tên người nhận | `utils/validation.ts:143`, `R:348` | TC-ORD-008..010 | F-val:101, F-ord:115 | Thiếu unit server |
| Order.Create.Phone | 10 số, bắt đầu 0 | `utils/validation.ts:143`, `R:351` | TC-ORD-011..012 | F-val:101 | Thiếu unit server |
| Order.Create.Address | Địa chỉ tự do | `utils/validation.ts:143`, `R:354` | TC-ORD-013..015 | F-val:101 | Thiếu unit server |
| Order.Create.Required | Đủ trường, chỉ khoảng trắng là thiếu | `CreateOrderPage.tsx:94-113`, `R:347-364` | TC-ORD-016..022 | F-val:101, F-ord:115 | Thiếu unit server cho lỗi 400 `VALIDATION_FAILED` kèm `details` |
| Order.Create.Format | Chỉ ra trường sai định dạng | `R:347-364`, `St:167-169` | TC-ORD-023..030 | F-val:81, F-val:101 | Lệch: số lượng sai bị `St:168` ném lỗi, router trả `ORDER_CREATION_FAILED` mà không có `field` (`R:384`) |
| Order.Confirm.Display | Hiện lại đơn trước khi lưu | `CreateOrderPage.tsx:401-457` | TC-ORD-031..032 | F-ord:156 | Đủ |
| Order.Confirm.Prompt | Xác nhận, sửa, hủy | `CreateOrderPage.tsx:165-172, 385, 457` | TC-ORD-033..036 | F-ord:156 | Đủ |
| Order.Done.Store | Mã đơn duy nhất, "Chờ xác nhận" | `St:172-226` | TC-ORD-037..043 | S-seed:116 | Thiếu unit kiểm mã đơn không trùng khi tạo nhiều đơn liên tiếp |
| Order.Done.History | Bản ghi lịch sử đầu tiên | `St:188-199` | TC-ORD-040..044 | S-seed:116 | Đủ |
| Order.Done.Success | Báo thành công kèm mã | `CreateOrderPage.tsx:116-134` | TC-ORD-042, 045 | F-ord:156 | Đủ |
| Order.Done.Failure | Rollback | `St:218-234`, `server/failureInjection.ts` | TC-ORD-043..045 | S-seed:74, S-seed:95, S-api:119 | Đủ |
| Order.Done.Reason | Báo lỗi kèm lý do | `R:379-385`, `CreateOrderPage.tsx:116` | TC-ORD-046..047 | S-api:119 (mã 500) | Thiếu unit frontend: màn hình hiện lý do khi API trả 500 |
| 1.0.E1 | Thiếu trường hoặc sai định dạng | như Required, Format | TC-ORD-048..053 | F-ord:115 | Như Order.Create.Format |
| 1.0.E2 | Lưu đơn thất bại | `St:218-234` | TC-ORD-054..055 | S-seed:74, 95 | Đủ |

### 3.2 Theo dõi vận chuyển (TRK, TV2)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| Track.Assign.List | DS đơn "Chờ xác nhận" | `features/admin/AdminDashboardPage.tsx:80, 182` | TC-TRK-001..002 | F-adm:54 | Lệch: client gọi `listOrders()` không có `limit`, server mặc định 20 (`R:402`). Đơn thứ 21 trở đi không hiện (xem 5.3) |
| Track.Assign.Shipment | Tạo vận đơn, mã duy nhất | `St:240-267` | TC-TRK-003..004 | S-sm:26, S-api:160 | Lệch: mã `TRK-<ngày>-<4 ký tự cuối id đơn>` (`St:256`) có thể trùng giữa hai đơn. Thiếu unit kiểm mã không trùng |
| Track.Assign.Shipper | Chọn Shipper | `AdminDashboardPage.tsx:215-242`, `R:303-317`, `St:249-252` | TC-TRK-005..006 | F-adm:54 | Thiếu unit server: chọn user không phải Shipper |
| Track.Assign.Status | Sang "Chờ lấy hàng" | `St:269-283` | TC-TRK-007..008 | S-sm:26 | Đủ |
| Track.Update.List | DS đơn của chính Shipper | `St:344-350`, `features/shipments/ShipperDeliveryPage.tsx:63` | TC-TRK-009..010 | F-shp:79 | Lệch nhẹ: server chỉ trả đơn ở 3 trạng thái WAITING_PICKUP, DELIVERING, FAILED_DELIVERY, còn SRS nói "danh sách đơn được phân công". Cần TV1 xác nhận. Thiếu unit server |
| Track.Update.Next | Chỉ chọn T3, T4, T6 | `ShipperDeliveryPage.tsx:258-360` | TC-TRK-011..016 | F-shp:79 | Đủ phía UI |
| Track.Update.Confirm | Hỏi xác nhận trước khi lưu | `ShipperDeliveryPage.tsx:188, 468` | TC-TRK-017..020 | F-shp:127 | Đủ |
| Track.Update.Status | Lưu trạng thái đã chọn | `St:289-341`, `R:497-529` | TC-TRK-021..024 | S-sm:37, 46, 81 | Đủ |
| Track.Update.Valid | Từ chối bước chuyển ngoài Hình A.2 | `St:309-324`, `R:526` | TC-TRK-025..032, BCT | S-sm:55, F-shp:218 | Lệch: `action` thiếu hoặc lạ thì `St:307` giữ nguyên trạng thái nhưng vẫn ghi lịch sử và trả 200. Thiếu unit cho trường hợp này |
| Track.Update.History | Lưu người đổi, thời điểm, trạng thái cũ và mới | `St:274, 329, 455, 606`, `R:593, 643` | TC-TRK-028.., TC-RET-051 | S-sm (gián tiếp) | Thiếu unit kiểm đủ 4 trường ở mọi lối chuyển (nhất là `R:593`, `R:643`, `St:606` vốn không ghi `changedByEmail`) |
| Track.View.List | DS đơn của chính Customer | `features/orders/CustomerHomePage.tsx:28`, `R:404` | TC-TRK-033..035 | F-ord:93 | Lệch: giới hạn 20 đơn như Track.Assign.List. Thiếu unit server lọc theo `customerId` |
| Track.View.Current | Trạng thái hiện tại | `features/orders/OrderDetailPage.tsx:45`, `features/shipments/ShipmentTrackingPage.tsx:34` | TC-TRK-036..037 | F-ord:221 | Đủ |
| Track.View.History | Lịch sử từ cũ đến mới | `utils/order.ts:63`, `components/common/OrderStatusTimeline.tsx:19` | TC-TRK-038..040 | F-ord:221, F-shp:198 | Đủ |
| Track.Admin.List | Admin xem mọi đơn | `AdminDashboardPage.tsx:96`, `R:389-408` | TC-TRK-041.., TC-NFR-004 | F-adm:114 | Lệch: giới hạn 20 đơn, không có phân trang trên UI |
| 2.0.E1 | Đơn không còn "Chờ xác nhận" | `St:245-247` | TC-TRK-043..045 | không có | Thiếu unit server |
| 4.0.E1 | Mất kết nối khi theo dõi | `realtime/event-client.ts:197, 263-286` | TC-TRK-046..048 | F-ret:233 | Đủ phía UI |

### 3.3 Hoàn hàng (RET, TV4)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| Return.Request.Eligible | Chỉ đơn "Đã giao", chưa có yêu cầu | `St:540, 551`, `features/returns/ReturnRequestPage.tsx:24-46` | TC-RET-001..002 | S-br:40, 72, S-ri:41, 74, F-ret:77 | Đủ |
| Return.Request.Window | Trong 15 ngày | `St:544-549`, `utils/date.ts:36` | TC-RET-003..006 | S-br:54, S-ri:56, F-val:23 | Lệch: server tính từ `order.updatedAt` (`St:544`), frontend tính từ bản ghi DELIVERED trong lịch sử (`utils/order.ts:48`). Hai mốc này lệch nhau nếu đơn có thay đổi khác sau khi giao |
| Return.Request.Reason | Bắt buộc lý do, "Khác" cần mô tả | `St:526`, `R:678`, `ReturnRequestPage.tsx:105-131` | TC-RET-007..013 | F-ret:140 | Lệch: server không kiểm `reason` thuộc 3 giá trị của BR-04. Thiếu unit server cho "Khác" không mô tả |
| Return.Request.Store | Lưu "Chờ duyệt" kèm thời điểm | `St:556-575` | TC-RET-014..017 | S-br:40 | Đủ |
| Return.View.Status | Customer xem yêu cầu và lý do từ chối | `features/returns/CustomerReturnsPage.tsx:28`, `R:701-713` | TC-RET-018..027 | F-ret:190 | Thiếu unit server lọc theo `customerId` |
| Return.Review.List | Admin xem "Chờ duyệt" và "Đã chấp nhận" | `AdminDashboardPage.tsx:112, 189` | TC-RET-028..035 | F-adm:272 | Đủ phía UI |
| Return.Review.Approve | Sang "Đã chấp nhận" | `St:591-592` | TC-RET-036..038 | S-br:81, S-api:220, F-adm:272 | Đủ |
| Return.Review.Reject | Sang "Bị từ chối", bắt buộc lý do | `St:617-627` | TC-RET-039..046 | S-br:93, F-adm:272 | Đủ |
| Return.Review.OrderStatus | Đơn sang "Hư hỏng"/"Thất lạc" | `St:593-615` | TC-RET-047..052 | S-br:81, S-ri:80 | Thiếu kiểm sự kiện real-time: `R:741` chỉ phát `return.status_changed`, không phát `order.status_changed` (xem RT-1) |
| Return.Review.Complete | Ghi "Hoàn tất" | `St:634-647` | TC-RET-053..056 | S-ri:97, F-adm:272 | Đủ |
| Return.Review.Valid | Từ chối bước chuyển yêu cầu sai | `St:584, 639` | TC-RET-057..066, BCT | không có | Thiếu unit server: duyệt lại yêu cầu đã xử lý, hoàn tất yêu cầu chưa chấp nhận |
| 5.0.E1 | Đơn chưa "Đã giao" | `St:540` | TC-RET-067..076 | S-ri:41, F-ret:77 | Đủ |
| 5.0.E2 | Quá hạn | `St:547` | TC-RET-077..079 | S-br:54, F-ret:77 | Đủ |
| 5.0.E3 | Thiếu lý do hoặc mô tả | `St:526`, `R:678` | TC-RET-080..086 | F-ret:140 | Thiếu unit server |
| 5.0.E4 | Đơn đã có yêu cầu | `St:551-554` | TC-RET-087..094 | S-br:72, S-ri:74, F-ret:77 | Đủ |
| 6.0.E1 | Yêu cầu không còn "Chờ duyệt" | `St:584-586` | TC-RET-095..100 | không có | Thiếu unit server |

### 3.4 Xử lý ngoại lệ (ISS, TV4)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| Issue.Report.Type | 3 loại sự cố cho đơn "Đang giao" | `St:397-406`, `ShipperDeliveryPage.tsx:153-201` | TC-ISS-001..005 | S-br:147, F-shp:127 | Thiếu unit server cho loại không hợp lệ |
| Issue.Report.Store | Lưu đơn, loại, người báo, thời điểm | `St:418-436, 466` | TC-ISS-006..010 | S-ri:131 | Đủ |
| Issue.Report.Status | T5, T9, T10 | `St:438-464` | TC-ISS-011.., TC-BCT-030 | S-sm:65, S-ri:108, 131 | Thiếu kiểm sự kiện: `R:807` chỉ gửi `issue.reported` cho Admin. Customer không nhận `order.status_changed` |
| Issue.Resolve.List | DS sự cố chưa xử lý | `AdminDashboardPage.tsx:95`, `R:822-841` | TC-ISS-028..032 | F-adm:150 | Lệch: client không truyền `limit`, server mặc định 10 (`R:836`). Sự cố thứ 11 trở đi không hiện |
| Issue.Resolve.Return | T7 khi đủ 3 lần | `R:559-614`, `AdminDashboardPage.tsx:270-301` | TC-ISS-033.., TC-BCT-028 | S-api:279, S-ri:145, F-adm:150, 358 | Đủ |
| Issue.Resolve.Returned | T8 | `R:616-664`, `OrderDetailPage.tsx:143-150` | TC-ISS-037..042 | S-sm:90 (gọi thẳng storage), F-ord:318 | Thiếu unit cho route `R:616` (403 với vai trò khác, 409 khi đơn chưa RETURNING) |
| Issue.Resolve.Lost | Admin xác nhận thất lạc đơn "Đang giao" | `St:407-413`, `OrderDetailPage.tsx:119-126` | TC-ISS-043..047 | S-br:147 (chỉ nhánh lỗi), F-ord:291 | Thiếu unit cho trường hợp Admin xác nhận thành công |
| Issue.Resolve.LostStore | Ghi sự cố, người báo là Admin | `St:423-436` | TC-ISS-048..050 | không có | Thiếu unit |
| Issue.Resolve.LostStatus | T10 | `St:448-452` | TC-ISS-051.., TC-BCT-031 | S-br:147 (đường Shipper) | Thiếu unit cho đường Admin |
| Issue.Resolve.Result | Ghi kết quả, trừ trường hợp đã đủ 3 lần | `St:471-503`, `R:843-871`, `AdminDashboardPage.tsx:311-351` | TC-ISS-053..066 | S-br:113, S-ri:139, 154, F-adm:150 | Thiếu unit server cho nhánh `St:481-486` (đủ 3 lần, chưa RETURNING) |
| 3.0.E1 | Hàng hỏng | `St:446` | TC-ISS-014..017 | S-ri:131 | Đủ |
| 3.0.E2 | Giao không thành công | `St:441-445`, `St:309-314` | TC-ISS-018..023 | S-sm:65, 81, S-ri:108 | Đủ |
| 3.0.E3 | Thất lạc | `St:448` | TC-ISS-024..027 | S-br:147 | Đủ |
| 7.0.E1 | Chuyển trả khi chưa đủ 3 lần | `R:578-587` | TC-ISS-067..070 | S-api:279, S-ri:145, F-adm:150 | Đủ |

### 3.5 Tài khoản (ACC, TV1)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| Account.Register.Fields | Họ tên, email, mật khẩu, SĐT | `features/auth/RegisterPage.tsx:25-42`, `R:207-257` | TC-ACC-001..003 | F-reg:33, S-api:25 | Đủ |
| Account.Register.Required | Đủ 4 trường | `utils/validation.ts:70`, `R:219-237` | TC-ACC-004..014 | F-reg:85, F-val:45 | Thiếu unit server |
| Account.Register.Email | Email theo chuẩn HTML | `R:224`, `constants/config.ts` | TC-ACC-015..018 | F-val:45, F-reg:108 | Thiếu unit server |
| Account.Register.Unique | Email không trùng, bỏ khoảng trắng và không phân biệt hoa thường | `R:215, 239-243`, `St:50-53` | TC-ACC-019..025 | F-reg:146 (giả API) | Thiếu unit server: 409 khi trùng, kể cả khác chữ hoa hoặc có khoảng trắng |
| Account.Register.Password | 8 đến 64 ký tự | `R:227` | TC-ACC-026..030 | F-val:45, F-reg:108 | Thiếu unit server |
| Account.Register.Phone | Như Order.Create.Phone | `R:230` | TC-ACC-031..036 | F-val:45 | Thiếu unit server |
| Account.Register.Role | Luôn là Customer | `R:251` | TC-ACC-037..039 | S-api:25 | Đủ |
| Account.Login.Credentials | Email và mật khẩu, so khớp email như trên | `R:259-281`, `features/auth/LoginPage.tsx:22-34` | TC-ACC-040..045 | F-login:42, S-api:25 | Thiếu unit server cho email khác chữ hoa |
| Account.Login.Fail | Báo lỗi theo SEC-11 | `R:264-273` | TC-ACC-046..050 | S-api:63, F-login:89 | Đủ |

### 3.6 Thuộc tính chất lượng, dữ liệu, giao diện (NFR, TV1)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| RT-1 | Customer thấy trạng thái mới không cần tải lại | `OrderDetailPage.tsx:69`, `ShipmentTrackingPage.tsx:54`, `R:465, 514, 603, 653` | TC-NFR-001..003 | F-ret:233 | Lệch: T5, T9, T10 (báo sự cố, `R:807`) và T11, T12 (duyệt hoàn, `R:741`) không phát `order.status_changed` cho Customer. Chưa có TC nào nêu riêng các bước chuyển này |
| RT-2 | Admin thấy trạng thái mới | `AdminDashboardPage.tsx:126-170`, `server/events.ts:62-70` | TC-NFR-004..005 | F-adm:114 | Thiếu unit cho `server/events.ts` (lọc theo vai trò và theo user) |
| SEC-1 | Bắt buộc đăng nhập | `R:44-51`, `routes/guards.tsx:42-82` | TC-NFR-006..008 | S-api:79, F-login:146 | Lệch: `R:23-29` tạo sẵn token dạng `token_<userId>` cho mọi user mẫu và token này không bao giờ hết hạn. Ai đoán được id là vào được. Chưa có TC |
| SEC-2 | Customer chỉ thấy đơn và yêu cầu của mình | `R:404, 425, 546, 709` | TC-NFR-009..011 | không có | Thiếu unit server (403 khi xem đơn của Customer khác) |
| SEC-3 | Chỉ hoàn hàng đơn của mình | `St:537` | TC-NFR-012..014 | S-br:63, S-ri:68 | Đủ |
| SEC-4 | Shipper chỉ thấy đơn được giao | `R:395, 429, 550`, `St:301` | TC-NFR-015..017 | không có | Thiếu unit server |
| SEC-5 | Chỉ Admin tạo vận đơn | `R:444` | TC-NFR-018..020 | S-api:79 | Thiếu unit cho vai trò Shipper |
| SEC-6 | Chỉ Admin duyệt, từ chối, hoàn tất | `R:722, 762` | TC-NFR-021..023 | không có | Thiếu unit server |
| SEC-7 | Chỉ Admin xử lý sự cố | `R:566, 623, 828, 850` | TC-NFR-024..028 | S-api:79 (chỉ POST `/issues`) | Thiếu unit cho các route `R:566, 623, 850` |
| SEC-8 | Chỉ Shipper được giao mới cập nhật và báo sự cố | `St:301, 401` | TC-NFR-027..029 | không có | Thiếu unit server với một Shipper khác |
| SEC-9 | Đăng xuất | `R:283-291`, `components/layout/AppHeader.tsx:25` | TC-NFR-030..032 | F-login:189, F-rt:66 | Thiếu unit server: sau logout, token cũ phải bị trả 401 |
| SEC-10 | Băm mật khẩu thích ứng | `server/auth.ts` (scrypt) | TC-NFR-033..034 | không có | Thiếu unit cho `hashPassword`, `verifyPassword` |
| SEC-11 | Một thông báo chung khi đăng nhập sai | `R:265, 271` | TC-NFR-035 | S-api:63, F-login:89 | Đủ |
| ROB-1 | Kết nối lại thì hiện trạng thái mới nhất | `realtime/event-client.ts:184-286`, các trang nghe `realtime:reconnected` | TC-TRK-046.., TC-NFR-036..037 | F-ret:233, F-rt | Đủ phía UI |
| DI-1 | Lịch sử chỉ được thêm | không có API sửa/xóa, chỉ `push` | TC-NFR-051..054 | không có | Thiếu unit (có thể kiểm không có route PATCH/DELETE lịch sử) |
| DI-2 | Từ chối chuỗi quá dài | `R:221-232, 348-355`, `St:492, 529, 622`, `utils/validation.ts` | TC-ORD-010.., TC-NFR-055..056 | F-val:45, 101, S-br:129 | Thiếu unit server cho họ tên, email, tên người nhận, địa chỉ |
| UI-1 | Đủ các màn hình | `routes/index.tsx:37-133` | TC-NFR-038..046 (UI), và các TC khác | F-login:16, F-reg:19, F-ord:93 | Màn hình đã có. Cần mockup A8 đến A16 mới chạy được UI test |
| CI-1 | Thông báo ở mọi màn hình cho Customer | `components/layout/RealtimeNotificationBar.tsx:76` | TC-NFR-047..050 | F-ret:233 | Cùng lỗ với RT-1: không có thông báo khi báo sự cố hoặc duyệt hoàn |
| OE-1, OE-2 | Môi trường chạy | `vite.config.ts`, `package.json` | TC-NFR-057, 058 | không áp dụng | Thủ công |
| CO-1, CO-2 | Ràng buộc thiết kế | toàn bộ | TC-NFR-059..066 | không áp dụng | Thủ công |

### 3.7 Quy tắc nghiệp vụ (BCT, TV2)

| ID | Mô tả ngắn | Code | TC hệ thống | Unit test | Khoảng trống |
|---|---|---|---|---|---|
| BR-01 | Chỉ chuyển theo Hình A.2 | `St:309-324, 584, 639`, `R:578, 634` | TC-BCT-026..034 và các TC Valid | S-sm:55 | Xem Track.Update.Valid và Return.Review.Valid |
| BR-02 | Chỉ hoàn đơn "Đã giao" | `St:540` | TC-RET-002, 067.. | S-ri:41 | Đủ |
| BR-03 | 15 ngày | `St:544-549`, `utils/date.ts:36` | TC-RET-003..006 | S-ri:56, F-val:23 | Xem Return.Request.Window |
| BR-04 | 3 lý do, "Khác" cần mô tả | `constants/status-map.ts`, `St:526` | TC-RET-013, 080.. | F-ret:140 | Server không kiểm danh sách lý do |
| BR-05 | Lý do quyết định trạng thái đơn | `St:596-600` | TC-RET-049, TC-BCT-032..033 | S-br:81, S-ri:80 | Đủ |
| BR-06 | 3 lần giao không thành công | `St:309-314, 441-445`, `R:578` | TC-TRK-015, TC-ISS-010.., TC-BCT-027..028 | S-sm:65, 81, S-ri:108, 145 | Đủ |
| BR-07 | Không xử lý tiền | không có trường tiền | TC-BCT-026..033 | F-ord:93 | Đủ |

## 4. Code không truy về ID nào trong SRS

| Chức năng | Code | Ghi chú cho test |
|---|---|---|
| Token phiên dựng sẵn `token_<userId>` | `R:22-29` | Tiện cho test nhưng nằm trong code chạy thật. Rủi ro SEC-1. Nên báo TV4 tách ra chỉ dùng khi test |
| Header `X-Simulate-Failure` để giả lỗi | `R:366-367`, `server/failureInjection.ts` | Cũng chạy được ở bản thật. Có điểm `DELIVERY_STORE` không nơi nào dùng |
| Tra cứu đơn bằng mã đơn hoặc mã vận đơn | `R:531-557`, `St:353-361`, `ShipmentTrackingPage.tsx:101-110` | SRS không có chức năng tìm kiếm. Chưa có TC hay unit |
| `GET /auth/me` | `R:293-301` | Chưa có unit |
| `GET /users?role=` cho Admin | `R:303-317` | Admin truyền `role=Customer` là lấy được danh sách Customer. Rộng hơn Track.Assign.Shipper cần |
| Phân trang `page`, `limit` | `R:400-405, 835-838`, `St:119-123` | UI không dùng, gây ra lỗi giới hạn 20 đơn và 10 sự cố ở mục 3 |
| SSE `order.created` cho Admin, `shipment.assigned` cho Shipper | `R:371, 457`, `ShipperDeliveryPage.tsx:82` | Real-time cho Admin khi có đơn mới và cho Shipper khi được giao đơn, ngoài RT-1, RT-2. Chưa có TC |
| CORS theo danh sách origin | `R:15-20, 158-173` | Chưa có test |
| Ghi chú tự do khi cập nhật trạng thái | `R:510-522`, `St:337` | Có giới hạn 500 ký tự ở UI, server không kiểm độ dài `notes` này (DI-2) |
| Mã nghiệp vụ `ORD-`, `TRK-`, `RET-`, `ISS-` và nút sao chép | `St:176, 256, 559, 421`, `components/common/CopyButton.tsx` | Chưa có unit |
| Dải báo mất mạng | `components/common/OfflineBanner.tsx`, `event-client.ts:95, 198` | Gần ROB-1 nhưng SRS không yêu cầu banner |
| Bộ nhớ đệm mã đơn cho thông báo | `utils/order.ts:78-102` | Chưa có unit |

## 5. Việc cần làm tiếp

Nguyên tắc chốt ngày 28/11/2026: mỗi test case đã duyệt trong Test Plan (§2.1, §2.2) đều phải có. Code lệch SRS mà việc test nó không quan trọng thì không mở thêm TC.

### 5.1 TC hệ thống theo Test Plan

Không cần viết thêm TC hệ thống. Mọi ID mà Test Plan §2.1, §2.2 yêu cầu kiểm đều đã có TC trong workbook (mục 3). Việc còn lại là chạy chúng:

1. Merge PR #31 (Playwright, `tests/e2e`) để các TC tự động có code chạy.
2. Chạy 423 TC theo phân công, ghi Result, Test date, Bug # vào workbook.

### 5.2 Unit test còn thiếu

Test Plan §3.1.1 ghi rõ Function Testing ở system test không thay unit test của TV3, TV4. Phần dưới đây xếp theo mức ảnh hưởng, lỗi phân quyền đứng đầu vì là mức Nghiêm trọng (Test Plan §3.1.5).

1. Phân quyền phía server (TV4): SEC-2, SEC-4, SEC-6, SEC-7, SEC-8, và SEC-5 với vai trò Shipper. Route trả 401 khi chưa đăng nhập, 403 khi sai vai trò hoặc sai chủ. SEC-9: token đã đăng xuất phải bị trả 401.
2. Ngoại lệ và bước chuyển bị chặn phía server (TV4): 2.0.E1, 6.0.E1, Return.Review.Valid, 5.0.E3, Issue.Resolve.Result ở nhánh đủ 3 lần, Issue.Resolve.Lost, LostStore, LostStatus theo đường Admin, route `confirm-returned`.
3. Đăng ký và đăng nhập phía server (TV4): Required, Email, Unique (409, kể cả khác chữ hoa), Password, Phone, đăng nhập với email khác chữ hoa. SEC-10: `hashPassword`, `verifyPassword`.
4. Lọc sự kiện real-time trong `server/events.ts` (TV4): `adminOnly` và `targetUserId`.
5. Cập nhật `unit-test-report.md` (TV4): số tệp, số test, sửa dòng 22 cho khớp BR-05.

### 5.3 Code lệch SRS: không mở thêm TC

Lệch nào đã có TC sẵn bắt được thì để TC đó báo lỗi khi chạy. Lệch nào không có TC bắt và không quan trọng thì bỏ qua.

| Chỗ lệch | TC sẵn có sẽ bắt | Xử lý |
|---|---|---|
| Server nhận lý do hoàn hàng ngoài BR-04 | TC-RET-013 | Chạy TC, Fail thì mở Issue bug |
| Mốc 15 ngày tính từ `updatedAt` thay vì lúc sang "Đã giao" | TC-RET-006 | Như trên |
| Mã vận đơn có thể trùng | TC-TRK-004 | Như trên |
| Lịch sử thiếu email người đổi ở một số lối chuyển | TC-TRK-031, TC-TRK-032 | Như trên (chỉ Fail nếu TC đòi email) |
| `action` thiếu hoặc lạ vẫn trả 200 | TC-TRK-025, 026 gần nhất, không trùng hẳn | Không thêm TC. Ghi vào review cho TV4 |
| Token `token_<userId>` dựng sẵn, không hết hạn | Không có (TC-NFR-008 chỉ gửi request không có token) | Không thêm TC. Báo TV4 ngay vì thuộc phân quyền |
| T5, T9, T10, T11, T12 không đẩy real-time cho Customer | Không có (TC-NFR-001..003, 047..050 chỉ dùng T2, T3, T4) | Không thêm TC. Báo TV4 |
| Danh sách dừng ở 20 đơn, 10 sự cố | Không có | Bỏ qua. Dữ liệu seed và lúc demo ít hơn mức này |
| Server không kiểm `productId` có trong danh mục | Không có | Bỏ qua. UI chỉ cho chọn từ danh mục |
| Order.Create.Format không trả `field` khi số lượng sai | Không có | Bỏ qua. UI đã chặn trước |
| Track.Update.List ẩn đơn đã giao xong | Không có | Bỏ qua |
| Server không kiểm độ dài `notes` khi cập nhật trạng thái | Không có | Bỏ qua. UI giới hạn 500 ký tự |

### 5.4 Code ngoài SRS: không viết TC

Các mục ở mục 4 không có ID trong SRS nên không có TC đã duyệt. Tra cứu đơn theo mã còn thuộc mục "tìm kiếm đơn hàng đã lưu", mà Test Plan §2.3 xếp vào phần không kiểm thử. Riêng `GET /users?role=` và header `X-Simulate-Failure` chạy được ở bản thật nên ghi vào review cho TV4, không viết TC.
