# Đặc tả kiểm thử cho Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử, phiên bản 1.0

Soạn bởi TV1

Nhóm 10 – SE113 Kiểm chứng phần mềm

13/11/2026

## Lịch sử sửa đổi

| **Tên** | **Ngày** | **Lý do thay đổi** | **Phiên bản** |
|---|---|---|---|
| TV1 | 13/11/2026 | Bản đầu tiên | 1.0 |

## 1 Giới thiệu

### 1.1 Mục đích

Tài liệu này là thiết kế test (Test Specification) cho phiên bản 1.0 của Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử. Với mỗi yêu cầu cần kiểm thử, tài liệu nêu điều kiện test, dữ liệu, kết quả mong đợi và kỹ thuật thiết kế. Mỗi dòng bảng ở mục 3 là đúng một test case (TC); workbook `docs/testing/system-test-cases.xlsx`, kịch bản Playwright và bảng phân công đều lấy danh sách TC từ đây. Bảng giá trị biên ở mục 2.2 là nguồn duy nhất của mọi giá trị biên; các tài liệu khác chỉ dẫn tới bảng này.

Người đọc gồm các thành viên nhóm (TV1 đến TV4) và giảng viên. Người test dựa vào tài liệu để biết chạy gì, với dữ liệu nào, mong đợi gì.

### 1.2 Phạm vi

Tài liệu phủ 93 ID của SRS 1.0: 58 yêu cầu chức năng, 13 ngoại lệ và 22 yêu cầu phi chức năng hoặc ràng buộc, đúng danh sách ở mục 2 của Test Plan. Mọi điều kiện, dữ liệu và kết quả mong đợi lấy từ SRS, không lấy từ mã nguồn. Khi SRS không nêu một kết quả, dòng test chỉ ghi phần SRS đã nêu và không đặt thêm quy tắc. Các chỗ đó và TC bị ảnh hưởng: xem mục 5.

### 1.3 Tài liệu tham chiếu

1. Nhóm 10. Đặc tả yêu cầu phần mềm (SRS) phiên bản 1.0.1, `docs/srs/SRS.md`. Nguồn của ID, tên trạng thái (Hình A.2), quy tắc BR-01 đến BR-07, độ dài ở mục 4.2 và các chỗ SRS chưa rõ ở Phụ lục C.
2. Nhóm 10. Kế hoạch kiểm thử (Test Plan) phiên bản 1.1, `docs/test-plan/test_plan.md`. Nguồn của danh sách yêu cầu (mục 2), ma trận và bảng quyết định (mục 3.1.2), ma trận vai trò (mục 3.1.5), mã module và định dạng mã TC (mục 3.4).

### 1.4 Cách đọc

Mỗi module ở mục 3 là một bảng sáu cột `| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |`.

- **TC:** mã cố định dạng `TC-<MODULE>-<NNN>` (Test Plan mục 3.4), đánh số liên tục trong từng module.
- **Mã SRS:** đúng một ID SRS cho mỗi dòng. Nếu một điều kiện chạm hai ID, dòng ghi ID chính và nêu ID còn lại trong cột Điều kiện test, dạng "(cũng thuộc DI-2)". Chọn ID chính theo quy tắc sau:
  - giá trị để trống hoặc chỉ gồm khoảng trắng: `*.Required` của tính năng;
  - giá trị sai định dạng: `*.Format`, hoặc ID định dạng của trường (ví dụ `Account.Register.Email`);
  - giá trị vượt độ dài ở mục 4.2: ID của trường, kèm "(cũng thuộc DI-2)";
  - giá trị hợp lệ: ID của trường.
- **Điều kiện test:** việc cần làm. Dòng bắt đầu bằng `[Âm]` là test case âm (đầu vào hoặc thao tác mà SRS yêu cầu từ chối). Mỗi ngoại lệ có ít nhất một dòng `[Âm]`.
- **Dữ liệu:** dữ liệu vào, xem mục 2. Giá trị biên chỉ ghi tên dòng của bảng biên và vị trí của giá trị, không chép lại giá trị.
- **Kết quả mong đợi:** chỉ nêu điều SRS đã nêu. Tên trạng thái chép đúng nguyên văn Hình A.2, đặt trong ngoặc kép.
- **Kỹ thuật:** kỹ thuật thiết kế của dòng (phân vùng tương đương, giá trị biên, chuyển trạng thái, bảng quyết định, và các cách dựng đặc biệt).

## 2 Dữ liệu dùng chung

### 2.1 Vai trò, tài khoản và dữ liệu mẫu

Admin và Shipper có sẵn nhờ dữ liệu seed của dự án (AS-2); Customer tự đăng ký. Tài liệu này không ghi mật khẩu. Tài khoản cho test tự động đọc từ biến môi trường.

| Tên dùng trong tài liệu | Vai trò | Nguồn |
|---|---|---|
| Admin 1, Admin 2 | Admin | Seed (AS-2); cùng một cửa hàng (AS-1) |
| Shipper A, Shipper B | Shipper | Seed (AS-2) |
| Customer A, Customer B, Customer C | Customer | Đăng ký (Account.Register) hoặc seed của dự án; Customer C chưa có đơn nào |

- **Sản phẩm:** lấy từ dữ liệu mẫu sản phẩm (AS-3).
- **Đơn cơ sở:** đơn dùng làm nền cho các dòng kiểm từng trường. Đơn có một dòng sản phẩm, và mỗi trường dùng giá trị hợp lệ đầu tiên của dòng tương ứng ở bảng biên: «dòng sản phẩm» · hợp lệ #1, «số lượng» · hợp lệ #1, «họ tên, tên người nhận» · hợp lệ #1, «số điện thoại (cả hai loại)» · hợp lệ #1, «địa chỉ giao» · hợp lệ #1. Dòng kiểm một trường chỉ đổi trường đó, các trường khác giữ như đơn cơ sở.
- **Đơn D1, D2:** đơn có sẵn ở trạng thái ghi trong cột Dữ liệu, dựng bằng dữ liệu seed hoặc bằng thao tác của ca trước. Trạng thái ghi theo tên ở Hình A.2.
- **Giả lỗi lưu:** cách làm cho một bước lưu đơn bị lỗi, do TV4 cung cấp (Test Plan mục 3.1.4).
- **Request trực tiếp:** gửi request thẳng tới server, không qua giao diện (Test Plan mục 3.1.5).

### 2.2 Bảng giá trị biên

Bảng dưới đây là nguồn duy nhất của giá trị biên.

| Trường | Hợp lệ (biên) | Không hợp lệ (biên) | Nguồn SRS |
|---|---|---|---|
| email (đăng ký) | đúng dạng WHATWG; 254 ký tự | 255 ký tự; thiếu `@`; chỉ khoảng trắng | Account.Register.Email, DI-2, §4.2 |
| so khớp email | `"  An@Gmail.com "` trùng `an@gmail.com` | | Account.Register.Unique, Account.Login.Credentials |
| mật khẩu | 8 và 64 ký tự | 7 và 65 ký tự | Account.Register.Password |
| họ tên, tên người nhận | 1 và 100 ký tự | rỗng; chỉ khoảng trắng; 101 ký tự | Account.Register.Required, Order.Create.Required, DI-2 |
| số điện thoại (cả hai loại) | `0123456789`, `0912345678` | 9 chữ số; 11 chữ số; `1912345678`; `09123a5678`; rỗng | Order.Create.Phone, Account.Register.Phone |
| địa chỉ giao | 1 và 255 ký tự | rỗng; chỉ khoảng trắng; 256 ký tự | Order.Create.Address, Order.Create.Required, DI-2 |
| số lượng | 1; 2; 1000 | 0; -1; 1.5; chữ; rỗng | Order.Create.Quantity |
| dòng sản phẩm | 1 dòng; 2 dòng khác sản phẩm | 0 dòng; 2 dòng cùng sản phẩm | Order.Create.Product, Order.Create.Required |
| mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý | 1 và 500 ký tự | rỗng; chỉ khoảng trắng; 501 ký tự | Return.Request.Reason, Return.Review.Reject, Issue.Resolve.Result, DI-2 |
| thời hạn hoàn hàng | lúc "Đã giao" + 15×24 giờ − 1 phút; đúng + 15×24 giờ | + 15×24 giờ + 1 phút | BR-03 |
| số lần giao không thành công | sau sự cố thứ 1 và thứ 2: T6 hợp lệ | sau sự cố thứ 3: T6 bị chặn, T7 hợp lệ; khi mới có 2 lần: T7 bị 7.0.E1 | BR-06 |
| số yêu cầu hoàn hàng của một đơn | yêu cầu đầu tiên | yêu cầu thứ hai (5.0.E4) | Return.Request.Eligible |

**Cách tham chiếu từ cột Dữ liệu.** Dòng test ghi `Biên «<tên dòng>» · hợp lệ #n` hoặc `Biên «<tên dòng>» · không hợp lệ #n`.

- Tên dòng là chữ ở cột "Trường".
- `#n` là thứ tự của giá trị trong ô tương ứng, đếm từ 1 theo thứ tự trái sang phải. Các giá trị trong một ô cách nhau bằng dấu chấm phẩy hoặc chữ "và".
- Ví dụ về cách đếm: ô "1 và 100 ký tự" có hai giá trị (#1, #2); ô của «số điện thoại (cả hai loại)» ở cột không hợp lệ có năm giá trị (#1 đến #5).

### 2.3 Quy ước thời gian

Thời điểm hiển thị theo dạng dd/MM/yyyy HH:mm, giờ Việt Nam (UTC+7), như ở mục 4.2 của SRS. Mốc thời hạn hoàn hàng tính từ thời điểm đơn chuyển sang "Đã giao" (BR-03).

## 3 Thiết kế theo module

Mỗi module là một bảng, mỗi dòng là một TC.

### 3.1 ORD – Tạo đơn hàng (FE-1)

Phạm vi: 16 ID ở Test Plan mục 2.1.1 (`Order.*`, `1.0.E1`, `1.0.E2`).

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-ORD-001 | `Order.Create.Product` | Customer A mở màn hình Tạo đơn hàng và xem danh sách sản phẩm | Dữ liệu mẫu sản phẩm (AS-3) | Hệ thống hiển thị danh sách sản phẩm của cửa hàng; Customer chọn được sản phẩm từ danh sách này | Phân vùng tương đương |
| TC-ORD-002 | `Order.Create.Product` | Đơn một dòng sản phẩm; các trường khác như đơn cơ sở | Biên «dòng sản phẩm» · hợp lệ #1 | Hệ thống chấp nhận dòng sản phẩm: bước kiểm tra (bước 6) qua và hệ thống hiển thị lại đơn (bước 7) | Giá trị biên |
| TC-ORD-003 | `Order.Create.Product` | Đơn hai dòng, hai sản phẩm khác nhau; các trường khác như đơn cơ sở | Biên «dòng sản phẩm» · hợp lệ #2 | Hệ thống chấp nhận cả hai dòng, mỗi sản phẩm một dòng; bước 6 qua và hệ thống hiển thị lại đơn gồm hai dòng | Giá trị biên |
| TC-ORD-004 | `Order.Create.Product` | [Âm] Đơn hai dòng cùng một sản phẩm; các trường khác như đơn cơ sở | Biên «dòng sản phẩm» · không hợp lệ #2 | Hệ thống không cho đơn có hai dòng cùng một sản phẩm; đơn chưa được lưu | Giá trị biên |
| TC-ORD-005 | `Order.Create.Quantity` | Nhập số lượng cho dòng sản phẩm; các trường khác như đơn cơ sở | Biên «số lượng» · hợp lệ #1 | Hệ thống chấp nhận số lượng là số nguyên lớn hơn hoặc bằng 1; hiển thị lại đơn với số lượng đã nhập | Giá trị biên |
| TC-ORD-006 | `Order.Create.Quantity` | Nhập số lượng cho dòng sản phẩm; các trường khác như đơn cơ sở | Biên «số lượng» · hợp lệ #2 | Hệ thống chấp nhận số lượng; hiển thị lại đơn với số lượng đã nhập | Giá trị biên |
| TC-ORD-007 | `Order.Create.Quantity` | Nhập số lượng cho dòng sản phẩm, không có giới hạn trên; các trường khác như đơn cơ sở | Biên «số lượng» · hợp lệ #3 | Hệ thống chấp nhận số lượng; hiển thị lại đơn với số lượng đã nhập | Giá trị biên |
| TC-ORD-008 | `Order.Create.Receiver` | Nhập tên người nhận; các trường khác như đơn cơ sở | Biên «họ tên, tên người nhận» · hợp lệ #1 | Hệ thống chấp nhận tên người nhận; hiển thị lại đơn với tên đã nhập | Giá trị biên |
| TC-ORD-009 | `Order.Create.Receiver` | Nhập tên người nhận; các trường khác như đơn cơ sở | Biên «họ tên, tên người nhận» · hợp lệ #2 | Hệ thống chấp nhận tên người nhận; hiển thị lại đơn với tên đã nhập | Giá trị biên |
| TC-ORD-010 | `Order.Create.Receiver` | [Âm] Nhập tên người nhận dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2); các trường khác như đơn cơ sở | Biên «họ tên, tên người nhận» · không hợp lệ #3 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 và chỉ ra trường tên người nhận vượt độ dài; đơn chưa được lưu | Giá trị biên |
| TC-ORD-011 | `Order.Create.Phone` | Nhập số điện thoại người nhận; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · hợp lệ #1 | Hệ thống chấp nhận số điện thoại (đúng 10 chữ số, bắt đầu bằng chữ số 0); hiển thị lại đơn | Giá trị biên |
| TC-ORD-012 | `Order.Create.Phone` | Nhập số điện thoại người nhận; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · hợp lệ #2 | Hệ thống chấp nhận số điện thoại; hiển thị lại đơn | Giá trị biên |
| TC-ORD-013 | `Order.Create.Address` | Nhập địa chỉ giao, chuỗi văn bản tự do; các trường khác như đơn cơ sở | Biên «địa chỉ giao» · hợp lệ #1 | Hệ thống chấp nhận địa chỉ giao; hiển thị lại đơn với địa chỉ đã nhập | Giá trị biên |
| TC-ORD-014 | `Order.Create.Address` | Nhập địa chỉ giao, chuỗi văn bản tự do; các trường khác như đơn cơ sở | Biên «địa chỉ giao» · hợp lệ #2 | Hệ thống chấp nhận địa chỉ giao; hiển thị lại đơn với địa chỉ đã nhập | Giá trị biên |
| TC-ORD-015 | `Order.Create.Address` | [Âm] Nhập địa chỉ giao dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2); các trường khác như đơn cơ sở | Biên «địa chỉ giao» · không hợp lệ #3 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 và chỉ ra trường địa chỉ giao vượt độ dài; đơn chưa được lưu | Giá trị biên |
| TC-ORD-016 | `Order.Create.Required` | [Âm] Đơn không có dòng sản phẩm nào; các trường khác như đơn cơ sở | Biên «dòng sản phẩm» · không hợp lệ #1 | Hệ thống chỉ ra trường còn thiếu: dòng sản phẩm; đơn chưa được lưu | Giá trị biên |
| TC-ORD-017 | `Order.Create.Required` | [Âm] Để trống số lượng của dòng sản phẩm; các trường khác như đơn cơ sở | Biên «số lượng» · không hợp lệ #5 | Hệ thống chỉ ra trường còn thiếu: số lượng; đơn chưa được lưu | Giá trị biên |
| TC-ORD-018 | `Order.Create.Required` | [Âm] Để trống tên người nhận; các trường khác như đơn cơ sở | Biên «họ tên, tên người nhận» · không hợp lệ #1 | Hệ thống chỉ ra trường còn thiếu: tên người nhận; đơn chưa được lưu | Giá trị biên |
| TC-ORD-019 | `Order.Create.Required` | [Âm] Tên người nhận chỉ gồm khoảng trắng; các trường khác như đơn cơ sở | Biên «họ tên, tên người nhận» · không hợp lệ #2 | Hệ thống coi trường là còn thiếu và chỉ ra trường tên người nhận; đơn chưa được lưu | Giá trị biên |
| TC-ORD-020 | `Order.Create.Required` | [Âm] Để trống số điện thoại người nhận; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #5 | Hệ thống chỉ ra trường còn thiếu: số điện thoại người nhận; đơn chưa được lưu | Giá trị biên |
| TC-ORD-021 | `Order.Create.Required` | [Âm] Để trống địa chỉ giao; các trường khác như đơn cơ sở | Biên «địa chỉ giao» · không hợp lệ #1 | Hệ thống chỉ ra trường còn thiếu: địa chỉ giao; đơn chưa được lưu | Giá trị biên |
| TC-ORD-022 | `Order.Create.Required` | [Âm] Địa chỉ giao chỉ gồm khoảng trắng; các trường khác như đơn cơ sở | Biên «địa chỉ giao» · không hợp lệ #2 | Hệ thống coi trường là còn thiếu và chỉ ra trường địa chỉ giao; đơn chưa được lưu | Giá trị biên |
| TC-ORD-023 | `Order.Create.Format` | [Âm] Nhập số lượng sai ràng buộc; các trường khác như đơn cơ sở | Biên «số lượng» · không hợp lệ #1 | Hệ thống chỉ ra trường số lượng sai định dạng (số nguyên lớn hơn hoặc bằng 1); đơn chưa được lưu | Giá trị biên |
| TC-ORD-024 | `Order.Create.Format` | [Âm] Nhập số lượng sai ràng buộc; các trường khác như đơn cơ sở | Biên «số lượng» · không hợp lệ #2 | Hệ thống chỉ ra trường số lượng sai định dạng (số nguyên lớn hơn hoặc bằng 1); đơn chưa được lưu | Giá trị biên |
| TC-ORD-025 | `Order.Create.Format` | [Âm] Nhập số lượng sai ràng buộc; các trường khác như đơn cơ sở | Biên «số lượng» · không hợp lệ #3 | Hệ thống chỉ ra trường số lượng sai định dạng (số nguyên lớn hơn hoặc bằng 1); đơn chưa được lưu | Giá trị biên |
| TC-ORD-026 | `Order.Create.Format` | [Âm] Nhập số lượng sai ràng buộc; các trường khác như đơn cơ sở | Biên «số lượng» · không hợp lệ #4 | Hệ thống chỉ ra trường số lượng sai định dạng (số nguyên lớn hơn hoặc bằng 1); đơn chưa được lưu | Giá trị biên |
| TC-ORD-027 | `Order.Create.Format` | [Âm] Nhập số điện thoại người nhận sai định dạng; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #1 | Hệ thống chỉ ra trường số điện thoại người nhận sai định dạng (đúng 10 chữ số, bắt đầu bằng chữ số 0); đơn chưa được lưu | Giá trị biên |
| TC-ORD-028 | `Order.Create.Format` | [Âm] Nhập số điện thoại người nhận sai định dạng; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #2 | Hệ thống chỉ ra trường số điện thoại người nhận sai định dạng (đúng 10 chữ số, bắt đầu bằng chữ số 0); đơn chưa được lưu | Giá trị biên |
| TC-ORD-029 | `Order.Create.Format` | [Âm] Nhập số điện thoại người nhận sai định dạng; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #3 | Hệ thống chỉ ra trường số điện thoại người nhận sai định dạng (đúng 10 chữ số, bắt đầu bằng chữ số 0); đơn chưa được lưu | Giá trị biên |
| TC-ORD-030 | `Order.Create.Format` | [Âm] Nhập số điện thoại người nhận sai định dạng; các trường khác như đơn cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #4 | Hệ thống chỉ ra trường số điện thoại người nhận sai định dạng (đúng 10 chữ số, bắt đầu bằng chữ số 0); đơn chưa được lưu | Giá trị biên |
| TC-ORD-031 | `Order.Confirm.Display` | Customer nhập đơn hai dòng và cho biết đã nhập xong (bước 5) | Biên «dòng sản phẩm» · hợp lệ #2; các trường khác như đơn cơ sở | Trước khi lưu đơn, hệ thống hiển thị lại sản phẩm, số lượng, người nhận và địa chỉ giao đúng như đã nhập (bước 7) | Phân vùng tương đương |
| TC-ORD-032 | `Order.Confirm.Display` | Customer nhập tên người nhận và địa chỉ giao ở độ dài lớn nhất cho phép | Biên «họ tên, tên người nhận» · hợp lệ #2; Biên «địa chỉ giao» · hợp lệ #2 | Hệ thống hiển thị lại tên người nhận và địa chỉ giao đúng như đã nhập, trước khi lưu đơn | Giá trị biên |
| TC-ORD-033 | `Order.Confirm.Prompt` | Customer ở bước 8, sau khi hệ thống hiển thị lại đơn | Đơn cơ sở | Hệ thống yêu cầu Customer chọn một trong ba việc: xác nhận đơn, sửa đơn hoặc hủy thao tác tạo đơn | Bảng quyết định |
| TC-ORD-034 | `Order.Confirm.Prompt` | Customer chọn xác nhận đơn | Đơn cơ sở | Luồng chính tiếp tục sang bước 9: hệ thống gán mã đơn hàng duy nhất và lưu đơn | Bảng quyết định |
| TC-ORD-035 | `Order.Confirm.Prompt` | Customer chọn sửa đơn (luồng 1.1), đổi số lượng rồi cho biết đã nhập xong | Số lượng đổi từ «số lượng» · hợp lệ #1 sang «số lượng» · hợp lệ #2; các trường khác như đơn cơ sở | Hệ thống hiển thị thông tin đơn đã nhập để sửa; sau khi Customer nhập xong, hệ thống kiểm tra lại các trường (bước 6) và hiển thị lại đơn với số lượng đã sửa (bước 7) | Bảng quyết định |
| TC-ORD-036 | `Order.Confirm.Prompt` | [Âm] Customer chọn hủy thao tác tạo đơn | Đơn cơ sở | Hệ thống kết thúc UC; đơn không được lưu và không có trong danh sách đơn của Customer A | Bảng quyết định |
| TC-ORD-037 | `Order.Done.Store` | Customer xác nhận đơn cơ sở | Đơn cơ sở | Hệ thống gán mã đơn hàng duy nhất và lưu đơn với trạng thái "Chờ xác nhận" (T1) | Chuyển trạng thái |
| TC-ORD-038 | `Order.Done.Store` | Customer xác nhận đơn hai dòng | Biên «dòng sản phẩm» · hợp lệ #2; các trường khác như đơn cơ sở | Hệ thống lưu đơn gồm hai dòng sản phẩm, người nhận và địa chỉ giao, với trạng thái "Chờ xác nhận" (T1) | Chuyển trạng thái |
| TC-ORD-039 | `Order.Done.Store` | Customer A xác nhận hai đơn cơ sở liên tiếp | Hai đơn cơ sở | Hai đơn có hai mã đơn hàng khác nhau | Phân vùng tương đương |
| TC-ORD-040 | `Order.Done.History` | Customer A xác nhận đơn cơ sở, rồi xem lịch sử trạng thái của đơn | Đơn cơ sở | Lịch sử có đúng một bản ghi: người đổi là Customer A, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ để trống, trạng thái mới "Chờ xác nhận" | Chuyển trạng thái |
| TC-ORD-041 | `Order.Done.History` | Customer B xác nhận đơn cơ sở, rồi xem lịch sử trạng thái của đơn | Đơn cơ sở | Bản ghi đầu tiên có người đổi là Customer B, trạng thái cũ để trống, trạng thái mới "Chờ xác nhận" | Phân vùng tương đương |
| TC-ORD-042 | `Order.Done.Success` | Customer xác nhận đơn cơ sở | Đơn cơ sở | Hệ thống hiển thị thông báo tạo đơn thành công kèm mã đơn hàng; mã này trùng mã của đơn vừa lưu | Phân vùng tương đương |
| TC-ORD-043 | `Order.Done.Failure` | [Âm] Customer xác nhận đơn cơ sở; giả lỗi ở bước lưu đơn (Order.Done.Store) | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống hoàn tác (rollback) giao dịch: không có bản ghi đơn và không có bản ghi lịch sử trạng thái | Giả lỗi lưu |
| TC-ORD-044 | `Order.Done.Failure` | [Âm] Customer xác nhận đơn cơ sở; giả lỗi ở bước ghi lịch sử (Order.Done.History) sau khi lưu đơn | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống hoàn tác giao dịch: không còn bản ghi đơn và không có bản ghi lịch sử trạng thái | Giả lỗi lưu |
| TC-ORD-045 | `Order.Done.Failure` | [Âm] Customer xác nhận đơn cơ sở; giả lỗi ở bước hiển thị thông báo thành công (Order.Done.Success) | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống hoàn tác giao dịch vì một bước của Order.Done lỗi: không còn bản ghi đơn và không có bản ghi lịch sử trạng thái | Giả lỗi lưu |
| TC-ORD-046 | `Order.Done.Reason` | [Âm] Customer xác nhận đơn cơ sở; giả lỗi ở bước lưu đơn | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống báo Customer tạo đơn không thành công kèm lý do | Giả lỗi lưu |
| TC-ORD-047 | `Order.Done.Reason` | [Âm] Customer xác nhận đơn cơ sở; giả lỗi ở bước ghi lịch sử | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống báo Customer tạo đơn không thành công kèm lý do | Giả lỗi lưu |
| TC-ORD-048 | `1.0.E1` | [Âm] Thiếu trường bắt buộc: để trống tên người nhận (bước 1) | Biên «họ tên, tên người nhận» · không hợp lệ #1; các trường khác như đơn cơ sở | Hệ thống chỉ ra trường bắt buộc còn thiếu: tên người nhận | Phân vùng tương đương |
| TC-ORD-049 | `1.0.E1` | [Âm] Sai định dạng: số điện thoại thiếu một chữ số | Biên «số điện thoại (cả hai loại)» · không hợp lệ #1; các trường khác như đơn cơ sở | Hệ thống chỉ ra trường số điện thoại người nhận sai định dạng | Phân vùng tương đương |
| TC-ORD-050 | `1.0.E1` | [Âm] Số lượng sai ràng buộc (bước 1) | Biên «số lượng» · không hợp lệ #1; các trường khác như đơn cơ sở | Hệ thống chỉ ra trường số lượng sai ràng buộc (Order.Create.Quantity) | Phân vùng tương đương |
| TC-ORD-051 | `1.0.E1` | [Âm] Sau khi hệ thống báo thiếu tên người nhận, Customer bổ sung tên hợp lệ (bước 2a) | Ban đầu Biên «họ tên, tên người nhận» · không hợp lệ #1, sau đó Biên «họ tên, tên người nhận» · hợp lệ #1 | Luồng quay lại bước 6: hệ thống kiểm tra lại các trường, không còn báo lỗi và hiển thị lại đơn (bước 7) | Chuyển trạng thái |
| TC-ORD-052 | `1.0.E1` | [Âm] Sau khi hệ thống báo lỗi, Customer sửa nhưng số điện thoại vẫn sai định dạng (bước 2a) | Ban đầu Biên «số điện thoại (cả hai loại)» · không hợp lệ #1, sau đó Biên «số điện thoại (cả hai loại)» · không hợp lệ #2 | Hệ thống kiểm tra lại ở bước 6 và vẫn chỉ ra trường số điện thoại người nhận sai định dạng; đơn chưa được lưu | Chuyển trạng thái |
| TC-ORD-053 | `1.0.E1` | [Âm] Sau khi hệ thống báo lỗi, Customer hủy thao tác tạo đơn (bước 2b) | Biên «họ tên, tên người nhận» · không hợp lệ #1; các trường khác như đơn cơ sở | Hệ thống kết thúc UC; đơn không được lưu | Chuyển trạng thái |
| TC-ORD-054 | `1.0.E2` | [Âm] Lưu đơn thất bại ở bước lưu đơn | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống hoàn tác mọi bước đã làm, báo Customer tạo đơn không thành công kèm lý do và kết thúc UC; đơn không được lưu | Giả lỗi lưu |
| TC-ORD-055 | `1.0.E2` | [Âm] Lưu đơn thất bại ở bước ghi lịch sử, sau khi lưu đơn | Đơn cơ sở; giả lỗi do TV4 cung cấp | Hệ thống hoàn tác mọi bước đã làm, báo Customer tạo đơn không thành công kèm lý do và kết thúc UC; đơn không được lưu, không có trong danh sách đơn của Customer A | Giả lỗi lưu |

### 3.2 TRK – Theo dõi tình trạng vận chuyển (FE-2)

Phạm vi: 16 ID ở Test Plan mục 2.1.2 (`Track.*`, `2.0.E1`, `4.0.E1`).

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-TRK-001 | `Track.Assign.List` | Admin 1 mở danh sách đơn; hệ thống có đơn ở đủ 9 trạng thái | Dữ liệu seed: đơn ở 9 trạng thái | Danh sách chỉ gồm đơn ở trạng thái "Chờ xác nhận" | Phân vùng tương đương |
| TC-TRK-002 | `Track.Assign.List` | Admin 1 lưu phân công cho đơn D1, rồi mở lại danh sách | D1 "Chờ xác nhận"; Shipper A | Đơn D1 không còn trong danh sách (đơn đã sang "Chờ lấy hàng") | Chuyển trạng thái |
| TC-TRK-003 | `Track.Assign.Shipment` | Admin 1 lưu phân công đơn D1 cho Shipper A | D1 "Chờ xác nhận"; Shipper A | Hệ thống tạo vận đơn có mã vận đơn duy nhất cho D1, gồm Shipper A và thời điểm tạo vận đơn dạng dd/MM/yyyy HH:mm giờ UTC+7 | Phân vùng tương đương |
| TC-TRK-004 | `Track.Assign.Shipment` | Admin 1 lưu phân công hai đơn khác nhau liên tiếp | D1 và D2 "Chờ xác nhận"; Shipper A | Hai vận đơn có hai mã vận đơn khác nhau | Phân vùng tương đương |
| TC-TRK-005 | `Track.Assign.Shipper` | Admin 1 chọn đơn D1 và mở bước chọn Shipper | D1 "Chờ xác nhận"; Shipper A, Shipper B có sẵn (AS-2) | Hệ thống cho Admin chọn một Shipper để phân công cho đơn | Phân vùng tương đương |
| TC-TRK-006 | `Track.Assign.Shipper` | Admin 1 chọn Shipper A cho đơn D1 và lưu | D1 "Chờ xác nhận"; Shipper A, Shipper B | Vận đơn gồm Shipper A; D1 có trong danh sách đơn được phân công của Shipper A và không có trong danh sách của Shipper B | Phân vùng tương đương |
| TC-TRK-007 | `Track.Assign.Status` | Admin 1 lưu phân công đơn D1 | D1 "Chờ xác nhận"; Shipper A | Hệ thống chuyển D1 sang trạng thái "Chờ lấy hàng" (T2) | Chuyển trạng thái |
| TC-TRK-008 | `Track.Assign.Status` | [Âm] Admin 1 chọn Shipper A cho D1 nhưng chưa lưu phân công | D1 "Chờ xác nhận"; Shipper A | D1 vẫn ở trạng thái "Chờ xác nhận" cho đến khi Admin lưu phân công | Chuyển trạng thái |
| TC-TRK-009 | `Track.Update.List` | Shipper A mở danh sách đơn được phân công; D1 phân công cho Shipper A, D2 cho Shipper B | D1, D2 "Chờ lấy hàng"; Shipper A, Shipper B | Danh sách của Shipper A chỉ gồm đơn D1, không có D2 | Phân vùng tương đương |
| TC-TRK-010 | `Track.Update.List` | Shipper B mở danh sách khi chưa được phân công đơn nào | Shipper B không có đơn | Danh sách đơn được phân công của Shipper B không có đơn nào | Phân vùng tương đương |
| TC-TRK-011 | `Track.Update.Next` | Shipper A chọn một đơn "Chờ lấy hàng" được phân công cho mình | D1 "Chờ lấy hàng"; Shipper A | Hệ thống chỉ cho chọn trạng thái kế tiếp "Đang giao" (T3) | Chuyển trạng thái |
| TC-TRK-012 | `Track.Update.Next` | Shipper A chọn một đơn "Đang giao" được phân công cho mình | D1 "Đang giao"; Shipper A | Hệ thống chỉ cho chọn trạng thái kế tiếp "Đã giao" (T4); không có lựa chọn "Giao không thành công", "Hư hỏng" hay "Thất lạc", vì T5, T9, T10 chỉ thực hiện qua báo sự cố | Chuyển trạng thái |
| TC-TRK-013 | `Track.Update.Next` | Shipper A chọn đơn "Giao không thành công" sau sự cố thứ nhất | Biên «số lần giao không thành công» · hợp lệ #1 | Hệ thống cho chọn trạng thái kế tiếp "Đang giao" (T6) | Giá trị biên |
| TC-TRK-014 | `Track.Update.Next` | Shipper A chọn đơn "Giao không thành công" sau sự cố thứ hai | Biên «số lần giao không thành công» · hợp lệ #2 | Hệ thống cho chọn trạng thái kế tiếp "Đang giao" (T6) | Giá trị biên |
| TC-TRK-015 | `Track.Update.Next` | [Âm] Shipper A chọn đơn "Giao không thành công" sau sự cố thứ ba | Biên «số lần giao không thành công» · không hợp lệ #1 | Hệ thống không cho chọn trạng thái "Đang giao" (T6 bị chặn vì số lần giao không thành công đã đạt giới hạn ở BR-06) | Giá trị biên |
| TC-TRK-016 | `Track.Update.Next` | [Âm] Shipper A chọn một đơn "Đã giao" được phân công cho mình | D1 "Đã giao"; Shipper A | Hệ thống không có trạng thái kế tiếp nào cho Shipper chọn, vì chỉ có các bước T3, T4, T6 | Chuyển trạng thái |
| TC-TRK-017 | `Track.Update.Confirm` | Shipper A chọn trạng thái "Đang giao" cho đơn "Chờ lấy hàng" | D1 "Chờ lấy hàng"; Shipper A | Hệ thống yêu cầu Shipper xác nhận; trước khi xác nhận, đơn vẫn ở trạng thái "Chờ lấy hàng" | Chuyển trạng thái |
| TC-TRK-018 | `Track.Update.Confirm` | Shipper A chọn trạng thái "Đã giao" cho đơn "Đang giao" | D1 "Đang giao"; Shipper A | Hệ thống yêu cầu Shipper xác nhận; trước khi xác nhận, đơn vẫn ở trạng thái "Đang giao" | Chuyển trạng thái |
| TC-TRK-019 | `Track.Update.Confirm` | Shipper A chọn trạng thái "Đang giao" cho đơn "Giao không thành công" sau sự cố thứ nhất | Biên «số lần giao không thành công» · hợp lệ #1 | Hệ thống yêu cầu Shipper xác nhận; trước khi xác nhận, đơn vẫn ở trạng thái "Giao không thành công" | Chuyển trạng thái |
| TC-TRK-020 | `Track.Update.Confirm` | [Âm] Shipper A chọn trạng thái "Đang giao" rồi không xác nhận (đóng hộp xác nhận) | D1 "Chờ lấy hàng"; Shipper A | Hệ thống không lưu trạng thái mới: đơn vẫn ở "Chờ lấy hàng" và lịch sử trạng thái không thêm bản ghi | Chuyển trạng thái |
| TC-TRK-021 | `Track.Update.Status` | Shipper A chọn "Đang giao" và xác nhận (T3) | D1 "Chờ lấy hàng"; Shipper A | Hệ thống chuyển đơn sang trạng thái "Đang giao" | Chuyển trạng thái |
| TC-TRK-022 | `Track.Update.Status` | Shipper A chọn "Đã giao" và xác nhận (T4) | D1 "Đang giao"; Shipper A | Hệ thống chuyển đơn sang trạng thái "Đã giao" | Chuyển trạng thái |
| TC-TRK-023 | `Track.Update.Status` | Shipper A chọn "Đang giao" và xác nhận sau sự cố thứ nhất (T6) | Biên «số lần giao không thành công» · hợp lệ #1 | Hệ thống chuyển đơn từ "Giao không thành công" sang "Đang giao" | Giá trị biên |
| TC-TRK-024 | `Track.Update.Status` | Shipper A chọn "Đang giao" và xác nhận sau sự cố thứ hai (T6) | Biên «số lần giao không thành công» · hợp lệ #2 | Hệ thống chuyển đơn từ "Giao không thành công" sang "Đang giao" | Giá trị biên |
| TC-TRK-025 | `Track.Update.Valid` | [Âm] Shipper A gửi request trực tiếp chuyển đơn từ "Đã giao" về "Đang giao" | D1 "Đã giao"; Shipper A | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; đơn vẫn ở "Đã giao" | Request trực tiếp |
| TC-TRK-026 | `Track.Update.Valid` | [Âm] Shipper A gửi request trực tiếp chuyển đơn từ "Chờ lấy hàng" sang "Đã giao", bỏ qua "Đang giao" | D1 "Chờ lấy hàng"; Shipper A | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; đơn vẫn ở "Chờ lấy hàng" | Request trực tiếp |
| TC-TRK-027 | `Track.Update.Valid` | [Âm] Shipper A gửi request trực tiếp chuyển đơn "Giao không thành công" sang "Đang giao" khi đã đủ số lần giao không thành công | Biên «số lần giao không thành công» · không hợp lệ #1 | Hệ thống từ chối bước chuyển và báo lý do (xem BR-06); đơn vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-TRK-028 | `Track.Update.History` | Admin 1 phân công đơn D1 (T2), rồi xem lịch sử trạng thái | D1 "Chờ xác nhận"; Admin 1; Shipper A | Lịch sử có thêm bản ghi: người đổi là Admin 1, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Chờ xác nhận", trạng thái mới "Chờ lấy hàng" | Chuyển trạng thái |
| TC-TRK-029 | `Track.Update.History` | Shipper A chuyển D1 sang "Đang giao" (T3), rồi xem lịch sử | D1 "Chờ lấy hàng"; Shipper A | Lịch sử có thêm bản ghi: người đổi là Shipper A, trạng thái cũ "Chờ lấy hàng", trạng thái mới "Đang giao" | Chuyển trạng thái |
| TC-TRK-030 | `Track.Update.History` | Shipper A chuyển D1 sang "Đã giao" (T4), rồi xem lịch sử | D1 "Đang giao"; Shipper A | Lịch sử có thêm bản ghi: người đổi là Shipper A, trạng thái cũ "Đang giao", trạng thái mới "Đã giao" | Chuyển trạng thái |
| TC-TRK-031 | `Track.Update.History` | Admin 1 xác nhận thất lạc đơn "Đang giao" (luồng 7.1, T10), rồi xem lịch sử | D1 "Đang giao"; Admin 1 | Lịch sử có thêm bản ghi: người đổi là Admin 1, trạng thái cũ "Đang giao", trạng thái mới "Thất lạc" | Chuyển trạng thái |
| TC-TRK-032 | `Track.Update.History` | Shipper A chuyển D1 sang "Đang giao" rồi sang "Đã giao" liên tiếp | D1 "Chờ lấy hàng"; Shipper A | Mỗi lần đổi có một bản ghi riêng; trạng thái cũ của bản ghi sau là trạng thái mới của bản ghi trước | Chuyển trạng thái |
| TC-TRK-033 | `Track.View.List` | Customer A mở danh sách đơn; Customer A có 2 đơn, Customer B có 1 đơn | Customer A, Customer B | Danh sách chỉ gồm 2 đơn của Customer A, không có đơn của Customer B | Phân vùng tương đương |
| TC-TRK-034 | `Track.View.List` | Customer A tạo đơn mới rồi mở danh sách | Đơn cơ sở | Đơn mới có trong danh sách của Customer A với trạng thái "Chờ xác nhận" | Chuyển trạng thái |
| TC-TRK-035 | `Track.View.List` | Customer C vừa đăng ký, chưa tạo đơn, mở danh sách | Customer C | Danh sách đơn của Customer C không có đơn nào | Phân vùng tương đương |
| TC-TRK-036 | `Track.View.Current` | Customer A chọn đơn vừa tạo | D1 "Chờ xác nhận" | Hệ thống hiển thị trạng thái hiện tại "Chờ xác nhận" | Chuyển trạng thái |
| TC-TRK-037 | `Track.View.Current` | Customer A chọn đơn đã đi qua T2, T3, T4 | D1 "Đã giao" | Hệ thống hiển thị trạng thái hiện tại "Đã giao", không phải trạng thái cũ | Chuyển trạng thái |
| TC-TRK-038 | `Track.View.History` | Customer A chọn đơn mới tạo, chưa đổi trạng thái | D1 "Chờ xác nhận" | Lịch sử có một bản ghi, trạng thái cũ để trống, trạng thái mới "Chờ xác nhận" | Giá trị biên |
| TC-TRK-039 | `Track.View.History` | Customer A chọn đơn đã đi qua T2, T3, T4 | D1 "Đã giao" | Lịch sử theo thứ tự thời gian từ cũ đến mới: "Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao"; mỗi bản ghi có thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7 | Phân vùng tương đương |
| TC-TRK-040 | `Track.View.History` | Customer A chọn đơn có giao không thành công rồi giao lại (T5, T6) | D1 "Đã giao" sau một lần giao không thành công | Lịch sử theo thứ tự từ cũ đến mới, mỗi lần đổi trạng thái là một bản ghi, kể cả khi "Đang giao" xuất hiện hai lần | Phân vùng tương đương |
| TC-TRK-041 | `Track.Admin.List` | Admin 1 mở danh sách đơn hàng; có đơn của nhiều Customer ở đủ 9 trạng thái | Dữ liệu seed: đơn ở 9 trạng thái | Danh sách gồm đơn ở mọi trạng thái, mỗi đơn kèm trạng thái hiện tại | Phân vùng tương đương |
| TC-TRK-042 | `Track.Admin.List` | Shipper A chuyển D1 sang "Đang giao"; Admin 1 mở lại danh sách | D1 "Chờ lấy hàng"; Shipper A; Admin 1 | Đơn D1 hiển thị với trạng thái hiện tại "Đang giao" | Chuyển trạng thái |
| TC-TRK-043 | `2.0.E1` | [Âm] Admin 1 và Admin 2 cùng mở đơn D1; Admin 1 lưu phân công cho Shipper A, sau đó Admin 2 lưu phân công cho Shipper B | D1 "Chờ xác nhận"; Admin 1, Admin 2; Shipper A, Shipper B | Hệ thống từ chối lần lưu của Admin 2 và báo lý do (xem BR-01, Track.Update.Valid); D1 vẫn ở "Chờ lấy hàng" | Hai phiên song song |
| TC-TRK-044 | `2.0.E1` | [Âm] Admin 1 gửi request trực tiếp phân công đơn đã ở "Chờ lấy hàng" | D1 "Chờ lấy hàng"; Admin 1; Shipper B | Hệ thống từ chối và báo lý do; D1 vẫn ở "Chờ lấy hàng" | Request trực tiếp |
| TC-TRK-045 | `2.0.E1` | [Âm] Admin 1 gửi request trực tiếp phân công đơn đã ở "Đã giao" | D1 "Đã giao"; Admin 1; Shipper A | Hệ thống từ chối và báo lý do; D1 vẫn ở "Đã giao" | Request trực tiếp |
| TC-TRK-046 | `4.0.E1` | [Âm] Customer A đang mở màn hình Theo dõi vận chuyển, mất kết nối; trong lúc đó Shipper A chuyển D1 sang "Đang giao"; Customer A kết nối lại (xem ROB-1) | D1 "Chờ lấy hàng"; Customer A; Shipper A | Màn hình hiển thị trạng thái mới nhất "Đang giao" | Ngắt rồi nối lại kết nối |
| TC-TRK-047 | `4.0.E1` | [Âm] Customer A mất kết nối; trong lúc đó Shipper A đổi D1 hai lần, sang "Đang giao" rồi "Đã giao"; Customer A kết nối lại | D1 "Chờ lấy hàng"; Customer A; Shipper A | Màn hình hiển thị trạng thái mới nhất "Đã giao", kể cả thay đổi xảy ra lúc mất kết nối | Ngắt rồi nối lại kết nối |
| TC-TRK-048 | `4.0.E1` | [Âm] Customer A mất kết nối rồi kết nối lại, không có thay đổi nào trong lúc mất kết nối | D1 "Đang giao"; Customer A | Màn hình hiển thị trạng thái hiện tại "Đang giao", không đổi | Ngắt rồi nối lại kết nối |

### 3.3 RET – Hoàn hàng (FE-3)

Phạm vi: 16 ID ở Test Plan mục 2.1.3 (`Return.*`, `5.0.E1` đến `5.0.E4`, `6.0.E1`).

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-RET-001 | `Return.Request.Eligible` | Customer A gửi yêu cầu hoàn hàng cho đơn D1 là đơn của chính mình, chưa có yêu cầu hoàn hàng nào | D1 "Đã giao", còn trong thời hạn; Customer A; Biên «số yêu cầu hoàn hàng của một đơn» · hợp lệ #1 | Hệ thống cho gửi yêu cầu: bước kiểm tra (bước 2) qua và hệ thống hiển thị danh sách lý do hoàn hàng (bước 3) | Bảng quyết định |
| TC-RET-002 | `Return.Request.Eligible` | [Âm] Customer A gửi thẳng request yêu cầu hoàn hàng cho đơn D1 đang "Đang giao" | D1 "Đang giao"; Customer A; lý do "Hàng lỗi / hư hỏng" | Hệ thống không nhận yêu cầu vì đơn chưa ở "Đã giao" (BR-02); không có yêu cầu hoàn hàng nào được lưu cho D1 | Request trực tiếp |
| TC-RET-003 | `Return.Request.Window` | Customer A gửi yêu cầu cho đơn D1 vào lúc ngay trước mốc hết hạn | D1 "Đã giao" dựng bằng dữ liệu seed; Biên «thời hạn hoàn hàng» · hợp lệ #1; Customer A | Hệ thống cho gửi yêu cầu vì còn trong thời hạn (BR-03): bước 2 qua và hệ thống hiển thị danh sách lý do hoàn hàng | Giá trị biên |
| TC-RET-004 | `Return.Request.Window` | Customer A gửi yêu cầu cho đơn D1 vào đúng thời điểm hết hạn | D1 "Đã giao" dựng bằng dữ liệu seed; Biên «thời hạn hoàn hàng» · hợp lệ #2; Customer A | Hệ thống cho gửi yêu cầu, vì yêu cầu gửi đúng tại thời điểm hết hạn vẫn hợp lệ (BR-03): bước 2 qua và hệ thống hiển thị danh sách lý do hoàn hàng | Giá trị biên |
| TC-RET-005 | `Return.Request.Window` | [Âm] Customer A gửi thẳng request yêu cầu hoàn hàng cho đơn D1 sau thời điểm hết hạn | D1 "Đã giao" dựng bằng dữ liệu seed; Biên «thời hạn hoàn hàng» · không hợp lệ #1; Customer A; lý do "Hàng lỗi / hư hỏng" | Hệ thống không nhận yêu cầu vì quá thời hạn (BR-03); không có yêu cầu hoàn hàng nào được lưu cho D1 | Request trực tiếp |
| TC-RET-006 | `Return.Request.Window` | Customer A gửi yêu cầu cho đơn D2 có thời điểm tạo đơn đã quá thời hạn nhưng thời điểm chuyển sang "Đã giao" còn trong thời hạn | D2 "Đã giao" dựng bằng dữ liệu seed: thời điểm tạo đơn cách thời điểm gửi hơn 15 × 24 giờ, thời điểm sang "Đã giao" cách thời điểm gửi ít hơn 15 × 24 giờ; Customer A | Hệ thống cho gửi yêu cầu, vì thời hạn tính từ lúc đơn chuyển sang "Đã giao" (BR-03) chứ không tính từ lúc tạo đơn | Phân vùng tương đương |
| TC-RET-007 | `Return.Request.Reason` | Customer A chọn gửi yêu cầu hoàn hàng cho đơn D1 (bước 3) | D1 "Đã giao", còn trong thời hạn; Customer A | Hệ thống hiển thị danh sách lý do hoàn hàng gồm đúng ba lý do: "Hàng lỗi / hư hỏng", "Chưa nhận được hàng", "Khác" | Phân vùng tương đương |
| TC-RET-008 | `Return.Request.Reason` | Customer A chọn lý do "Hàng lỗi / hư hỏng", không nhập mô tả, rồi gửi | D1 "Đã giao", còn trong thời hạn; lý do "Hàng lỗi / hư hỏng" | Hệ thống chấp nhận lý do mà không đòi mô tả (bước 4 qua); yêu cầu được lưu (xem Return.Request.Store) | Phân vùng tương đương |
| TC-RET-009 | `Return.Request.Reason` | Customer A chọn lý do "Chưa nhận được hàng", không nhập mô tả, rồi gửi | D1 "Đã giao", còn trong thời hạn; lý do "Chưa nhận được hàng" | Hệ thống chấp nhận lý do mà không đòi mô tả (bước 4 qua); yêu cầu được lưu (xem Return.Request.Store) | Phân vùng tương đương |
| TC-RET-010 | `Return.Request.Reason` | Customer A chọn lý do "Khác", nhập mô tả rồi gửi | D1 "Đã giao", còn trong thời hạn; lý do "Khác"; mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống chấp nhận lý do kèm mô tả (bước 4 qua); yêu cầu được lưu (xem Return.Request.Store) | Giá trị biên |
| TC-RET-011 | `Return.Request.Reason` | Customer A chọn lý do "Khác", nhập mô tả rồi gửi | D1 "Đã giao", còn trong thời hạn; lý do "Khác"; mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #2 | Hệ thống chấp nhận lý do kèm mô tả (bước 4 qua); yêu cầu được lưu (xem Return.Request.Store) | Giá trị biên |
| TC-RET-012 | `Return.Request.Reason` | [Âm] Customer A chọn lý do "Khác" và nhập mô tả dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2) | D1 "Đã giao", còn trong thời hạn; lý do "Khác"; mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #3 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 (DI-2) và chỉ ra trường mô tả lý do vượt độ dài; yêu cầu chưa được lưu | Giá trị biên |
| TC-RET-013 | `Return.Request.Reason` | [Âm] Customer A gửi thẳng request với lý do không thuộc danh sách ở BR-04 | D1 "Đã giao", còn trong thời hạn; lý do là một chuỗi không thuộc ba lý do của BR-04 | Hệ thống không lưu yêu cầu, vì lý do phải được chọn từ danh sách ở BR-04 | Request trực tiếp |
| TC-RET-014 | `Return.Request.Store` | Customer A gửi yêu cầu hoàn hàng cho đơn D1, rồi xem yêu cầu vừa gửi | D1 "Đã giao", còn trong thời hạn; lý do "Hàng lỗi / hư hỏng" | Hệ thống lưu yêu cầu với trạng thái "Chờ duyệt" (R1) và thời điểm gửi dạng dd/MM/yyyy HH:mm giờ UTC+7 | Chuyển trạng thái |
| TC-RET-015 | `Return.Request.Store` | Customer A gửi yêu cầu cho đơn D1 với lý do "Khác" và mô tả ở độ dài lớn nhất cho phép | D1 "Đã giao", còn trong thời hạn; lý do "Khác"; mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #2 | Hệ thống lưu yêu cầu "Chờ duyệt" (R1) kèm lý do "Khác" và mô tả đúng như đã nhập, cùng thời điểm gửi | Giá trị biên |
| TC-RET-016 | `Return.Request.Store` | Customer A gửi yêu cầu cho đơn D1, rồi xem lại trạng thái đơn D1 | D1 "Đã giao", còn trong thời hạn; lý do "Hàng lỗi / hư hỏng" | Trạng thái đơn D1 vẫn là "Đã giao" (POST-2): việc gửi yêu cầu không đổi trạng thái đơn | Chuyển trạng thái |
| TC-RET-017 | `Return.Request.Store` | Customer A gửi yêu cầu cho hai đơn khác nhau liên tiếp | D1 và D2 "Đã giao", còn trong thời hạn; lý do "Hàng lỗi / hư hỏng" | Hai yêu cầu hoàn hàng có hai mã yêu cầu khác nhau, mỗi yêu cầu ở trạng thái "Chờ duyệt" | Phân vùng tương đương |
| TC-RET-018 | `Return.View.Status` | Customer A chọn xem các yêu cầu hoàn hàng đã gửi (luồng 5.1), khi yêu cầu của D1 đang "Chờ duyệt" | D1 "Đã giao", yêu cầu "Chờ duyệt"; Customer A | Hệ thống hiển thị yêu cầu của D1 với trạng thái hiện tại "Chờ duyệt" | Chuyển trạng thái |
| TC-RET-019 | `Return.View.Status` | Customer A xem yêu cầu của D1 sau khi Admin 1 chấp nhận | D1 "Đã giao", yêu cầu "Đã chấp nhận" (lý do "Khác"); Customer A | Hệ thống hiển thị trạng thái hiện tại "Đã chấp nhận", không phải trạng thái cũ | Chuyển trạng thái |
| TC-RET-020 | `Return.View.Status` | Customer A xem yêu cầu của D1 sau khi Admin 1 ghi nhận hoàn tất | Yêu cầu "Hoàn tất" (lý do "Khác"); Customer A | Hệ thống hiển thị trạng thái hiện tại "Hoàn tất" | Chuyển trạng thái |
| TC-RET-021 | `Return.View.Status` | Customer A xem yêu cầu bị Admin 1 từ chối | Yêu cầu "Bị từ chối" với lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Customer A | Hệ thống hiển thị trạng thái "Bị từ chối" kèm lý do từ chối đúng như Admin 1 đã nhập | Giá trị biên |
| TC-RET-022 | `Return.View.Status` | Customer A xem yêu cầu bị Admin 1 từ chối với lý do từ chối ở độ dài lớn nhất cho phép | Yêu cầu "Bị từ chối" với lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #2; Customer A | Hệ thống hiển thị trạng thái "Bị từ chối" kèm toàn bộ lý do từ chối đúng như đã nhập | Giá trị biên |
| TC-RET-023 | `Return.View.Status` | Customer A xem danh sách khi có bốn yêu cầu của mình ở bốn trạng thái, mỗi yêu cầu một đơn | Bốn yêu cầu của Customer A: "Chờ duyệt", "Đã chấp nhận", "Bị từ chối", "Hoàn tất" | Hệ thống hiển thị trạng thái hiện tại của từng yêu cầu; lý do từ chối chỉ đi kèm yêu cầu ở "Bị từ chối" | Phân vùng tương đương |
| TC-RET-024 | `Return.View.Status` | [Âm] Customer B, có một yêu cầu hoàn hàng riêng, xem các yêu cầu hoàn hàng đã gửi; Customer A cũng có yêu cầu | Customer A và Customer B mỗi người một yêu cầu | Danh sách của Customer B chỉ gồm yêu cầu của Customer B, không có yêu cầu của Customer A (SEC-2) | Phân vùng tương đương |
| TC-RET-025 | `Return.View.Status` | Customer C chưa gửi yêu cầu hoàn hàng nào, xem các yêu cầu hoàn hàng đã gửi | Customer C | Danh sách yêu cầu hoàn hàng của Customer C không có yêu cầu nào | Phân vùng tương đương |
| TC-RET-026 | `Return.View.Status` | [Âm] Customer B gửi thẳng request xem yêu cầu hoàn hàng của Customer A theo mã yêu cầu | Yêu cầu của Customer A; Customer B | Hệ thống không trả dữ liệu yêu cầu của Customer A cho Customer B (SEC-2) | Request trực tiếp |
| TC-RET-027 | `Return.View.Status` | Customer A xem yêu cầu "Chờ duyệt", Admin 1 chấp nhận, rồi Customer A xem lại | Yêu cầu "Chờ duyệt" của Customer A; Admin 1 | Lần xem sau hiển thị trạng thái hiện tại "Đã chấp nhận" | Chuyển trạng thái |
| TC-RET-028 | `Return.Review.List` | Admin 1 mở danh sách yêu cầu hoàn hàng khi hệ thống có bốn yêu cầu ở bốn trạng thái | Bốn yêu cầu: "Chờ duyệt", "Đã chấp nhận", "Bị từ chối", "Hoàn tất" | Danh sách chỉ gồm các yêu cầu ở "Chờ duyệt" và "Đã chấp nhận"; không có yêu cầu "Bị từ chối" hay "Hoàn tất" | Phân vùng tương đương |
| TC-RET-029 | `Return.Review.List` | Admin 1 mở danh sách khi có ba yêu cầu "Chờ duyệt", mỗi yêu cầu một lý do | Ba yêu cầu với lý do "Hàng lỗi / hư hỏng", "Chưa nhận được hàng", "Khác" | Mỗi yêu cầu hiển thị kèm đơn hàng và lý do hoàn hàng của chính yêu cầu đó | Phân vùng tương đương |
| TC-RET-030 | `Return.Review.List` | Admin 1 mở danh sách khi yêu cầu của Customer A và yêu cầu của Customer B đều "Chờ duyệt" | Hai yêu cầu của Customer A và Customer B | Danh sách gồm cả hai yêu cầu, mỗi yêu cầu kèm đơn hàng và lý do hoàn hàng | Phân vùng tương đương |
| TC-RET-031 | `Return.Review.List` | Customer A gửi yêu cầu mới; Admin 1 mở danh sách | Đơn D1 "Đã giao"; yêu cầu mới của Customer A | Yêu cầu mới có trong danh sách với trạng thái "Chờ duyệt" | Chuyển trạng thái |
| TC-RET-032 | `Return.Review.List` | Admin 1 chấp nhận một yêu cầu "Chờ duyệt", rồi mở lại danh sách | Yêu cầu "Chờ duyệt" (lý do "Khác") | Yêu cầu vẫn có trong danh sách, với trạng thái "Đã chấp nhận" | Chuyển trạng thái |
| TC-RET-033 | `Return.Review.List` | Admin 1 từ chối một yêu cầu "Chờ duyệt", rồi mở lại danh sách | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Yêu cầu "Bị từ chối" không còn trong danh sách | Chuyển trạng thái |
| TC-RET-034 | `Return.Review.List` | Admin 1 ghi nhận hoàn tất một yêu cầu "Đã chấp nhận", rồi mở lại danh sách | Yêu cầu "Đã chấp nhận" (lý do "Khác") | Yêu cầu "Hoàn tất" không còn trong danh sách | Chuyển trạng thái |
| TC-RET-035 | `Return.Review.List` | Admin 1 mở danh sách khi hệ thống không có yêu cầu nào ở "Chờ duyệt" hay "Đã chấp nhận" | Mọi yêu cầu (nếu có) ở "Bị từ chối" hoặc "Hoàn tất" | Danh sách yêu cầu hoàn hàng không có yêu cầu nào | Phân vùng tương đương |
| TC-RET-036 | `Return.Review.Approve` | Admin 1 chọn yêu cầu "Chờ duyệt" có lý do "Hàng lỗi / hư hỏng" và chấp nhận | Yêu cầu "Chờ duyệt", lý do "Hàng lỗi / hư hỏng"; Admin 1 | Hệ thống chuyển yêu cầu sang trạng thái "Đã chấp nhận" (R2) | Chuyển trạng thái |
| TC-RET-037 | `Return.Review.Approve` | Admin 1 chọn yêu cầu "Chờ duyệt" có lý do "Chưa nhận được hàng" và chấp nhận | Yêu cầu "Chờ duyệt", lý do "Chưa nhận được hàng"; Admin 1 | Hệ thống chuyển yêu cầu sang trạng thái "Đã chấp nhận" (R2) | Chuyển trạng thái |
| TC-RET-038 | `Return.Review.Approve` | Admin 1 chọn yêu cầu "Chờ duyệt" có lý do "Khác" và chấp nhận | Yêu cầu "Chờ duyệt", lý do "Khác" kèm mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Admin 1 | Hệ thống chuyển yêu cầu sang trạng thái "Đã chấp nhận" (R2) | Chuyển trạng thái |
| TC-RET-039 | `Return.Review.Reject` | Admin 1 từ chối yêu cầu "Chờ duyệt" và nhập lý do từ chối | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống chuyển yêu cầu sang "Bị từ chối" (R3) và lưu lý do từ chối đúng như đã nhập; trạng thái đơn không đổi ("Đã giao") | Giá trị biên |
| TC-RET-040 | `Return.Review.Reject` | Admin 1 từ chối yêu cầu "Chờ duyệt" và nhập lý do từ chối ở độ dài lớn nhất cho phép | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #2 | Hệ thống chuyển yêu cầu sang "Bị từ chối" (R3) và lưu toàn bộ lý do từ chối; trạng thái đơn không đổi | Giá trị biên |
| TC-RET-041 | `Return.Review.Reject` | [Âm] Admin 1 chọn từ chối yêu cầu "Chờ duyệt" nhưng để trống lý do từ chối | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #1 | Hệ thống không chuyển yêu cầu sang "Bị từ chối"; yêu cầu vẫn ở "Chờ duyệt", vì từ chối chỉ được khi đã nhập lý do | Giá trị biên |
| TC-RET-042 | `Return.Review.Reject` | [Âm] Admin 1 chọn từ chối yêu cầu "Chờ duyệt" nhưng lý do từ chối chỉ gồm khoảng trắng | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #2 | Hệ thống coi lý do từ chối là rỗng, không chuyển yêu cầu sang "Bị từ chối"; yêu cầu vẫn ở "Chờ duyệt" | Giá trị biên |
| TC-RET-043 | `Return.Review.Reject` | [Âm] Admin 1 nhập lý do từ chối dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2) | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #3 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 (DI-2) và chỉ ra trường lý do từ chối vượt độ dài; yêu cầu vẫn ở "Chờ duyệt" | Giá trị biên |
| TC-RET-044 | `Return.Review.Reject` | [Âm] Admin 1 gửi thẳng request từ chối yêu cầu "Chờ duyệt" mà không có lý do từ chối | Yêu cầu "Chờ duyệt"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #1; Admin 1 | Hệ thống không chuyển yêu cầu sang "Bị từ chối"; yêu cầu vẫn ở "Chờ duyệt" | Request trực tiếp |
| TC-RET-045 | `Return.Review.Reject` | Admin 1 từ chối yêu cầu "Chờ duyệt" có lý do "Hàng lỗi / hư hỏng" | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Hàng lỗi / hư hỏng"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Yêu cầu sang "Bị từ chối" (R3); đơn D1 vẫn ở "Đã giao", vì chỉ chấp nhận mới đổi trạng thái đơn | Bảng quyết định |
| TC-RET-046 | `Return.Review.Reject` | Admin 1 từ chối yêu cầu "Chờ duyệt" có lý do "Chưa nhận được hàng" | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Chưa nhận được hàng"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Yêu cầu sang "Bị từ chối" (R3); đơn D1 vẫn ở "Đã giao", vì chỉ chấp nhận mới đổi trạng thái đơn | Bảng quyết định |
| TC-RET-047 | `Return.Review.OrderStatus` | Admin 1 chấp nhận yêu cầu "Chờ duyệt" của đơn D1 có lý do "Hàng lỗi / hư hỏng" | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Hàng lỗi / hư hỏng" | Yêu cầu sang "Đã chấp nhận" (R2); hệ thống chuyển D1 từ "Đã giao" sang "Hư hỏng" (T11) | Bảng quyết định |
| TC-RET-048 | `Return.Review.OrderStatus` | Admin 1 chấp nhận yêu cầu "Chờ duyệt" của đơn D1 có lý do "Chưa nhận được hàng" | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Chưa nhận được hàng" | Yêu cầu sang "Đã chấp nhận" (R2); hệ thống chuyển D1 từ "Đã giao" sang "Thất lạc" (T12) | Bảng quyết định |
| TC-RET-049 | `Return.Review.OrderStatus` | Admin 1 chấp nhận yêu cầu "Chờ duyệt" của đơn D1 có lý do "Khác", rồi xem trạng thái và lịch sử của D1 | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Khác" kèm mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Yêu cầu sang "Đã chấp nhận" (R2); D1 vẫn ở "Đã giao" và lịch sử trạng thái của D1 không có bản ghi mới, vì lý do "Khác" không thuộc BR-05 | Bảng quyết định |
| TC-RET-050 | `Return.Review.OrderStatus` | (cũng thuộc Track.Update.History) Admin 1 chấp nhận yêu cầu có lý do "Hàng lỗi / hư hỏng" (T11), rồi xem lịch sử trạng thái của D1 | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Hàng lỗi / hư hỏng"; Admin 1 | Lịch sử có thêm bản ghi: người đổi là Admin 1, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Đã giao", trạng thái mới "Hư hỏng" | Chuyển trạng thái |
| TC-RET-051 | `Return.Review.OrderStatus` | (cũng thuộc Track.Update.History) Admin 1 chấp nhận yêu cầu có lý do "Chưa nhận được hàng" (T12), rồi xem lịch sử trạng thái của D1 | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Chưa nhận được hàng"; Admin 1 | Lịch sử có thêm bản ghi: người đổi là Admin 1, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Đã giao", trạng thái mới "Thất lạc" | Chuyển trạng thái |
| TC-RET-052 | `Return.Review.OrderStatus` | Customer A xem trạng thái đơn D1 sau khi Admin 1 chấp nhận yêu cầu có lý do "Hàng lỗi / hư hỏng" | D1 "Hư hỏng" sau T11; Customer A | Hệ thống hiển thị trạng thái hiện tại của D1 là "Hư hỏng" (Track.View.Current) | Chuyển trạng thái |
| TC-RET-053 | `Return.Review.Complete` | Admin 1 chọn yêu cầu "Đã chấp nhận" có lý do "Khác" và ghi nhận hoàn tất | Yêu cầu "Đã chấp nhận", lý do "Khác"; đơn "Đã giao"; Admin 1 | Hệ thống chuyển yêu cầu sang "Hoàn tất" (R4); đơn vẫn ở "Đã giao" | Chuyển trạng thái |
| TC-RET-054 | `Return.Review.Complete` | Admin 1 chọn yêu cầu "Đã chấp nhận" có lý do "Hàng lỗi / hư hỏng" và ghi nhận hoàn tất | Yêu cầu "Đã chấp nhận", lý do "Hàng lỗi / hư hỏng"; đơn "Hư hỏng"; Admin 1 | Hệ thống chuyển yêu cầu sang "Hoàn tất" (R4); đơn vẫn ở "Hư hỏng" | Chuyển trạng thái |
| TC-RET-055 | `Return.Review.Complete` | Admin 1 chọn yêu cầu "Đã chấp nhận" có lý do "Chưa nhận được hàng" và ghi nhận hoàn tất | Yêu cầu "Đã chấp nhận", lý do "Chưa nhận được hàng"; đơn "Thất lạc"; Admin 1 | Hệ thống chuyển yêu cầu sang "Hoàn tất" (R4); đơn vẫn ở "Thất lạc" | Chuyển trạng thái |
| TC-RET-056 | `Return.Review.Complete` | Admin 1 mở màn hình ghi nhận hoàn tất của yêu cầu "Đã chấp nhận" và ghi nhận hoàn tất | Yêu cầu "Đã chấp nhận"; Admin 1 | Hệ thống chỉ ghi nhận "Hoàn tất" (R4); màn hình và thao tác không có trường hay chức năng nào xử lý tiền (BR-07) | Phân vùng tương đương |
| TC-RET-057 | `Return.Review.Valid` | [Âm] Admin 1 xem yêu cầu "Chờ duyệt" trong danh sách (giao diện) | Yêu cầu "Chờ duyệt"; Admin 1 | Giao diện chỉ có thao tác chấp nhận (R2) và từ chối (R3); không có thao tác ghi nhận "Hoàn tất" | Chuyển trạng thái |
| TC-RET-058 | `Return.Review.Valid` | [Âm] Admin 1 xem yêu cầu "Đã chấp nhận" trong danh sách (giao diện) | Yêu cầu "Đã chấp nhận"; Admin 1 | Giao diện chỉ có thao tác ghi nhận "Hoàn tất" (R4); không có thao tác chấp nhận hay từ chối | Chuyển trạng thái |
| TC-RET-059 | `Return.Review.Valid` | [Âm] Admin 1 tìm yêu cầu "Bị từ chối" để thao tác (giao diện) | Yêu cầu "Bị từ chối"; Admin 1 | Yêu cầu "Bị từ chối" không có trong danh sách của Admin (Return.Review.List), nên không có thao tác nào để chuyển trạng thái | Chuyển trạng thái |
| TC-RET-060 | `Return.Review.Valid` | [Âm] Admin 1 tìm yêu cầu "Hoàn tất" để thao tác (giao diện) | Yêu cầu "Hoàn tất"; Admin 1 | Yêu cầu "Hoàn tất" không có trong danh sách của Admin (Return.Review.List), nên không có thao tác nào để chuyển trạng thái | Chuyển trạng thái |
| TC-RET-061 | `Return.Review.Valid` | [Âm] Admin 1 gửi thẳng request chuyển yêu cầu từ "Chờ duyệt" sang "Hoàn tất" | Yêu cầu "Chờ duyệt"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; yêu cầu vẫn ở "Chờ duyệt" | Request trực tiếp |
| TC-RET-062 | `Return.Review.Valid` | [Âm] Admin 1 gửi thẳng request chuyển yêu cầu từ "Bị từ chối" sang "Hoàn tất" | Yêu cầu "Bị từ chối"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; yêu cầu vẫn ở "Bị từ chối" | Request trực tiếp |
| TC-RET-063 | `Return.Review.Valid` | [Âm] Admin 1 gửi thẳng request chuyển yêu cầu từ "Hoàn tất" sang "Hoàn tất" | Yêu cầu "Hoàn tất"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; yêu cầu vẫn ở "Hoàn tất" | Request trực tiếp |
| TC-RET-064 | `Return.Review.Valid` | [Âm] Admin 1 gửi thẳng request chuyển yêu cầu từ "Đã chấp nhận" sang "Chờ duyệt" | Yêu cầu "Đã chấp nhận"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; yêu cầu vẫn ở "Đã chấp nhận" | Request trực tiếp |
| TC-RET-065 | `Return.Review.Valid` | [Âm] Admin 1 gửi thẳng request chuyển yêu cầu từ "Bị từ chối" sang "Chờ duyệt" | Yêu cầu "Bị từ chối"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; yêu cầu vẫn ở "Bị từ chối" | Request trực tiếp |
| TC-RET-066 | `Return.Review.Valid` | [Âm] Admin 1 gửi thẳng request chuyển yêu cầu từ "Hoàn tất" sang "Chờ duyệt" | Yêu cầu "Hoàn tất"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; yêu cầu vẫn ở "Hoàn tất" | Request trực tiếp |
| TC-RET-067 | `5.0.E1` | [Âm] Customer A chọn đơn "Chờ xác nhận" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Chờ xác nhận" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-068 | `5.0.E1` | [Âm] Customer A chọn đơn "Chờ lấy hàng" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Chờ lấy hàng" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-069 | `5.0.E1` | [Âm] Customer A chọn đơn "Đang giao" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Đang giao" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-070 | `5.0.E1` | [Âm] Customer A chọn đơn "Giao không thành công" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Giao không thành công" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-071 | `5.0.E1` | [Âm] Customer A chọn đơn "Đang hoàn hàng" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Đang hoàn hàng" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-072 | `5.0.E1` | [Âm] Customer A chọn đơn "Đã hoàn về người bán" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Đã hoàn về người bán" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-073 | `5.0.E1` | [Âm] Customer A chọn đơn "Hư hỏng" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Hư hỏng" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-074 | `5.0.E1` | [Âm] Customer A chọn đơn "Thất lạc" của mình và chọn gửi yêu cầu hoàn hàng | D1 "Thất lạc" dựng bằng dữ liệu seed, chưa có yêu cầu hoàn hàng; Customer A | Hệ thống báo Customer chỉ được yêu cầu hoàn hàng cho đơn ở trạng thái "Đã giao" (BR-02); không có yêu cầu nào được lưu | Bảng quyết định |
| TC-RET-075 | `5.0.E1` | [Âm] Sau khi hệ thống báo đơn chưa ở "Đã giao", Customer A chọn đơn khác đang "Đã giao" (bước 2a) | D1 "Đang giao"; D2 "Đã giao", còn trong thời hạn; Customer A | Luồng quay lại bước 2: hệ thống kiểm tra D2 và qua, rồi hiển thị danh sách lý do hoàn hàng (bước 3) | Chuyển trạng thái |
| TC-RET-076 | `5.0.E1` | [Âm] Sau khi hệ thống báo đơn chưa ở "Đã giao", Customer A hủy thao tác (bước 2b) | D1 "Đang giao"; Customer A | Hệ thống kết thúc UC; không có yêu cầu hoàn hàng nào được lưu cho D1 | Chuyển trạng thái |
| TC-RET-077 | `5.0.E2` | [Âm] Customer A chọn đơn D1 đã quá thời hạn và chọn gửi yêu cầu hoàn hàng | D1 "Đã giao" dựng bằng dữ liệu seed; Biên «thời hạn hoàn hàng» · không hợp lệ #1; Customer A | Hệ thống báo Customer đơn đã quá thời hạn yêu cầu hoàn hàng (BR-03); không có yêu cầu nào được lưu | Giá trị biên |
| TC-RET-078 | `5.0.E2` | [Âm] Sau khi hệ thống báo quá thời hạn, Customer A chọn đơn khác còn trong thời hạn (bước 2a) | D1 "Đã giao" quá thời hạn (Biên «thời hạn hoàn hàng» · không hợp lệ #1); D2 "Đã giao" còn trong thời hạn; Customer A | Luồng quay lại bước 2: hệ thống kiểm tra D2 và qua, rồi hiển thị danh sách lý do hoàn hàng (bước 3) | Chuyển trạng thái |
| TC-RET-079 | `5.0.E2` | [Âm] Sau khi hệ thống báo quá thời hạn, Customer A hủy thao tác (bước 2b) | D1 "Đã giao" quá thời hạn (Biên «thời hạn hoàn hàng» · không hợp lệ #1); Customer A | Hệ thống kết thúc UC; không có yêu cầu hoàn hàng nào được lưu cho D1 | Chuyển trạng thái |
| TC-RET-080 | `5.0.E3` | [Âm] Customer A không chọn lý do nào rồi gửi (bước 4) | D1 "Đã giao", còn trong thời hạn; không chọn lý do | Hệ thống báo Customer phải chọn một lý do hoàn hàng (BR-04); yêu cầu chưa được lưu | Phân vùng tương đương |
| TC-RET-081 | `5.0.E3` | [Âm] Customer A chọn lý do "Khác", để trống mô tả rồi gửi | D1 "Đã giao", còn trong thời hạn; lý do "Khác"; mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #1 | Hệ thống báo Customer phải nhập mô tả khi chọn lý do "Khác" (BR-04); yêu cầu chưa được lưu | Giá trị biên |
| TC-RET-082 | `5.0.E3` | [Âm] Customer A chọn lý do "Khác", mô tả chỉ gồm khoảng trắng rồi gửi | D1 "Đã giao", còn trong thời hạn; lý do "Khác"; mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #2 | Hệ thống coi mô tả là rỗng và báo Customer phải nhập mô tả khi chọn lý do "Khác"; yêu cầu chưa được lưu | Giá trị biên |
| TC-RET-083 | `5.0.E3` | [Âm] Sau khi hệ thống báo thiếu mô tả của lý do "Khác", Customer A nhập mô tả hợp lệ (bước 2a) | Ban đầu mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #1, sau đó mô tả Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; lý do "Khác" | Luồng quay lại bước 4: hệ thống chấp nhận và lưu yêu cầu "Chờ duyệt" (R1) | Chuyển trạng thái |
| TC-RET-084 | `5.0.E3` | [Âm] Sau khi hệ thống báo chưa chọn lý do, Customer A chọn lý do "Chưa nhận được hàng" (bước 2a) | D1 "Đã giao", còn trong thời hạn; ban đầu không chọn lý do, sau đó "Chưa nhận được hàng" | Luồng quay lại bước 4: hệ thống chấp nhận và lưu yêu cầu "Chờ duyệt" (R1) | Chuyển trạng thái |
| TC-RET-085 | `5.0.E3` | [Âm] Sau khi hệ thống báo lỗi, Customer A hủy thao tác (bước 2b) | D1 "Đã giao", còn trong thời hạn; không chọn lý do | Hệ thống kết thúc UC; không có yêu cầu hoàn hàng nào được lưu cho D1 | Chuyển trạng thái |
| TC-RET-086 | `5.0.E3` | [Âm] Customer A gửi thẳng request không có lý do hoàn hàng | D1 "Đã giao", còn trong thời hạn; request không có trường lý do | Hệ thống không lưu yêu cầu; không có yêu cầu hoàn hàng nào được lưu cho D1 | Request trực tiếp |
| TC-RET-087 | `5.0.E4` | [Âm] Customer A gửi yêu cầu thứ hai cho đơn D1 đang có yêu cầu "Chờ duyệt" | D1 "Đã giao", còn trong thời hạn, đã có yêu cầu "Chờ duyệt"; Biên «số yêu cầu hoàn hàng của một đơn» · không hợp lệ #1 | Hệ thống báo Customer mỗi đơn hàng chỉ được gửi một yêu cầu hoàn hàng (Return.Request.Eligible); D1 vẫn chỉ có một yêu cầu | Bảng quyết định |
| TC-RET-088 | `5.0.E4` | [Âm] Customer A gửi yêu cầu thứ hai cho đơn D1 có yêu cầu đã "Bị từ chối" | D1 "Đã giao", còn trong thời hạn, yêu cầu "Bị từ chối"; Biên «số yêu cầu hoàn hàng của một đơn» · không hợp lệ #1 | Hệ thống báo mỗi đơn hàng chỉ được gửi một yêu cầu hoàn hàng; D1 vẫn chỉ có một yêu cầu | Bảng quyết định |
| TC-RET-089 | `5.0.E4` | [Âm] Customer A gửi yêu cầu thứ hai cho đơn D1 có yêu cầu "Đã chấp nhận" lý do "Khác" (đơn vẫn "Đã giao") | D1 "Đã giao", còn trong thời hạn, yêu cầu "Đã chấp nhận" lý do "Khác"; Biên «số yêu cầu hoàn hàng của một đơn» · không hợp lệ #1 | Hệ thống báo mỗi đơn hàng chỉ được gửi một yêu cầu hoàn hàng; D1 vẫn chỉ có một yêu cầu | Bảng quyết định |
| TC-RET-090 | `5.0.E4` | [Âm] Customer A gửi yêu cầu thứ hai cho đơn D1 có yêu cầu "Hoàn tất" lý do "Khác" (đơn vẫn "Đã giao") | D1 "Đã giao", còn trong thời hạn, yêu cầu "Hoàn tất" lý do "Khác"; Biên «số yêu cầu hoàn hàng của một đơn» · không hợp lệ #1 | Hệ thống báo mỗi đơn hàng chỉ được gửi một yêu cầu hoàn hàng; D1 vẫn chỉ có một yêu cầu | Bảng quyết định |
| TC-RET-091 | `5.0.E4` | [Âm] Customer A gửi thẳng request yêu cầu hoàn hàng thứ hai cho đơn D1 đang có yêu cầu "Chờ duyệt" | D1 "Đã giao", còn trong thời hạn, đã có yêu cầu "Chờ duyệt"; Biên «số yêu cầu hoàn hàng của một đơn» · không hợp lệ #1 | Hệ thống từ chối yêu cầu thứ hai; D1 vẫn chỉ có một yêu cầu, vẫn ở "Chờ duyệt" | Request trực tiếp |
| TC-RET-092 | `5.0.E4` | [Âm] Customer A bấm gửi hai lần liên tiếp thật nhanh, hoặc gửi hai request cùng lúc, cho cùng một đơn chưa có yêu cầu | D1 "Đã giao", còn trong thời hạn, chưa có yêu cầu; Biên «số yêu cầu hoàn hàng của một đơn» · hợp lệ #1 rồi Biên «số yêu cầu hoàn hàng của một đơn» · không hợp lệ #1 | Chỉ một yêu cầu được lưu cho D1; request còn lại bị từ chối vì mỗi đơn chỉ có một yêu cầu | Hai phiên song song |
| TC-RET-093 | `5.0.E4` | [Âm] Sau khi hệ thống báo đơn đã có yêu cầu, Customer A chọn đơn khác chưa có yêu cầu (bước 2a) | D1 "Đã giao" đã có yêu cầu; D2 "Đã giao", còn trong thời hạn, chưa có yêu cầu; Customer A | Luồng quay lại bước 2: hệ thống kiểm tra D2 và qua, rồi hiển thị danh sách lý do hoàn hàng (bước 3) | Chuyển trạng thái |
| TC-RET-094 | `5.0.E4` | [Âm] Sau khi hệ thống báo đơn đã có yêu cầu, Customer A hủy thao tác (bước 2b) | D1 "Đã giao" đã có yêu cầu; Customer A | Hệ thống kết thúc UC; D1 vẫn chỉ có một yêu cầu | Chuyển trạng thái |
| TC-RET-095 | `6.0.E1` | [Âm] Admin 1 và Admin 2 cùng mở yêu cầu "Chờ duyệt" có lý do "Hàng lỗi / hư hỏng"; Admin 1 chấp nhận, sau đó Admin 2 chấp nhận | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Hàng lỗi / hư hỏng"; Admin 1, Admin 2 | Hệ thống từ chối lần chấp nhận của Admin 2 và báo lý do (xem BR-01, Return.Review.Valid); yêu cầu ở "Đã chấp nhận"; D1 ở "Hư hỏng" và lịch sử của D1 chỉ có một bản ghi cho T11 | Hai phiên song song |
| TC-RET-096 | `6.0.E1` | [Âm] Admin 1 và Admin 2 cùng mở yêu cầu "Chờ duyệt"; Admin 1 chấp nhận, sau đó Admin 2 từ chối với lý do từ chối hợp lệ | Yêu cầu "Chờ duyệt" (lý do "Khác"); lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Admin 1, Admin 2 | Hệ thống từ chối thao tác của Admin 2 và báo lý do; yêu cầu vẫn ở "Đã chấp nhận" | Hai phiên song song |
| TC-RET-097 | `6.0.E1` | [Âm] Admin 1 và Admin 2 cùng mở yêu cầu "Chờ duyệt" có lý do "Hàng lỗi / hư hỏng"; Admin 1 từ chối, sau đó Admin 2 chấp nhận | D1 "Đã giao", yêu cầu "Chờ duyệt", lý do "Hàng lỗi / hư hỏng"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Admin 1, Admin 2 | Hệ thống từ chối thao tác của Admin 2 và báo lý do; yêu cầu vẫn ở "Bị từ chối"; D1 vẫn ở "Đã giao" | Hai phiên song song |
| TC-RET-098 | `6.0.E1` | [Âm] Admin 1 gửi thẳng request chấp nhận yêu cầu đang "Đã chấp nhận" | Yêu cầu "Đã chấp nhận"; Admin 1 | Hệ thống từ chối và báo lý do (xem BR-01, Return.Review.Valid); yêu cầu vẫn ở "Đã chấp nhận" | Request trực tiếp |
| TC-RET-099 | `6.0.E1` | [Âm] Admin 1 gửi thẳng request từ chối yêu cầu đang "Hoàn tất", kèm lý do từ chối hợp lệ | Yêu cầu "Hoàn tất"; lý do từ chối Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Admin 1 | Hệ thống từ chối và báo lý do; yêu cầu vẫn ở "Hoàn tất" | Request trực tiếp |
| TC-RET-100 | `6.0.E1` | [Âm] Admin 1 gửi thẳng request chấp nhận yêu cầu đang "Bị từ chối" có lý do "Hàng lỗi / hư hỏng" | D1 "Đã giao", yêu cầu "Bị từ chối", lý do "Hàng lỗi / hư hỏng"; Admin 1 | Hệ thống từ chối và báo lý do; yêu cầu vẫn ở "Bị từ chối"; D1 vẫn ở "Đã giao" | Request trực tiếp |

### 3.4 ISS – Xử lý ngoại lệ (FE-4)

Phạm vi: 14 ID ở Test Plan mục 2.1.4 (`Issue.*`, `3.0.E1` đến `3.0.E3`, `7.0.E1`). Các dòng nói về việc Admin xác nhận thất lạc phải khớp TC-TRK-031 ở mục 3.2: TC-TRK-031 kiểm lịch sử trạng thái của luồng 7.1 ở góc Track.Update.History, còn các dòng ở đây kiểm cùng luồng đó ở góc FE-4.

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-ISS-001 | `Issue.Report.Type` | Shipper A mở báo sự cố cho đơn D1 được phân công cho mình | D1 "Đang giao"; Shipper A | Hệ thống cho Shipper chọn một trong đúng ba loại sự cố: "Hàng hỏng", "Giao không thành công", "Thất lạc" | Bảng quyết định |
| TC-ISS-002 | `Issue.Report.Type` | [Âm] Shipper A thử báo sự cố cho đơn D1 đang "Chờ lấy hàng" (ngoài phạm vi báo sự cố, mục 1.3 của SRS) | D1 "Chờ lấy hàng" được phân công cho Shipper A; Shipper A | Hệ thống không cho báo loại sự cố nào khi đơn không ở "Đang giao"; không có sự cố nào được lưu và D1 vẫn ở "Chờ lấy hàng" | Bảng quyết định |
| TC-ISS-003 | `Issue.Report.Type` | [Âm] Shipper A thử báo sự cố cho đơn D1 đang "Giao không thành công" (ngoài phạm vi báo sự cố, mục 1.3 của SRS) | D1 "Giao không thành công" được phân công cho Shipper A; Shipper A | Hệ thống không cho báo loại sự cố nào khi đơn không ở "Đang giao"; không có sự cố nào được lưu và D1 vẫn ở "Giao không thành công" | Bảng quyết định |
| TC-ISS-004 | `Issue.Report.Type` | [Âm] Shipper A thử báo sự cố cho đơn D1 đang "Đã giao" (ngoài phạm vi báo sự cố, mục 1.3 của SRS) | D1 "Đã giao" được phân công cho Shipper A; Shipper A | Hệ thống không cho báo loại sự cố nào khi đơn không ở "Đang giao"; không có sự cố nào được lưu và D1 vẫn ở "Đã giao" | Bảng quyết định |
| TC-ISS-005 | `Issue.Report.Type` | [Âm] Shipper A gửi thẳng request báo sự cố cho đơn "Đang giao" với loại sự cố không thuộc ba loại của SRS | D1 "Đang giao"; Shipper A; loại sự cố là một chuỗi không thuộc ba loại | Hệ thống không lưu sự cố và không đổi trạng thái D1; D1 vẫn ở "Đang giao" | Request trực tiếp |
| TC-ISS-006 | `Issue.Report.Store` | Shipper A báo sự cố loại "Hàng hỏng" cho đơn D1 và xác nhận | D1 "Đang giao"; Shipper A | Hệ thống lưu sự cố gồm đơn D1, loại "Hàng hỏng", người báo là Shipper A và thời điểm báo dạng dd/MM/yyyy HH:mm giờ UTC+7 | Phân vùng tương đương |
| TC-ISS-007 | `Issue.Report.Store` | Shipper A báo sự cố loại "Giao không thành công" cho đơn D1 và xác nhận | D1 "Đang giao"; Shipper A | Hệ thống lưu sự cố gồm đơn D1, loại "Giao không thành công", người báo là Shipper A và thời điểm báo dạng dd/MM/yyyy HH:mm giờ UTC+7 | Phân vùng tương đương |
| TC-ISS-008 | `Issue.Report.Store` | Shipper A báo sự cố loại "Thất lạc" cho đơn D1 và xác nhận | D1 "Đang giao"; Shipper A | Hệ thống lưu sự cố gồm đơn D1, loại "Thất lạc", người báo là Shipper A và thời điểm báo dạng dd/MM/yyyy HH:mm giờ UTC+7 | Phân vùng tương đương |
| TC-ISS-009 | `Issue.Report.Store` | Shipper A báo hai sự cố cho hai đơn khác nhau liên tiếp | D1 và D2 "Đang giao"; Shipper A | Hai sự cố có hai mã sự cố khác nhau; mỗi sự cố ghi đúng đơn của mình | Phân vùng tương đương |
| TC-ISS-010 | `Issue.Report.Store` | Shipper A báo thêm một sự cố "Giao không thành công" cho D1 đã có một sự cố cùng loại | D1 "Đang giao" đã có 1 sự cố "Giao không thành công" (Biên «số lần giao không thành công» · hợp lệ #1); Shipper A | Số lần giao không thành công của D1 bằng số sự cố loại "Giao không thành công" đã ghi cho D1, tức là 2 sau khi sự cố mới được lưu (BR-06) | Giá trị biên |
| TC-ISS-011 | `Issue.Report.Status` | Shipper A báo sự cố loại "Hàng hỏng" cho D1 và xác nhận | D1 "Đang giao"; Shipper A | Hệ thống chuyển D1 từ "Đang giao" sang "Hư hỏng" (T9) | Chuyển trạng thái |
| TC-ISS-012 | `Issue.Report.Status` | Shipper A báo sự cố loại "Giao không thành công" cho D1 và xác nhận | D1 "Đang giao"; Shipper A | Hệ thống chuyển D1 từ "Đang giao" sang "Giao không thành công" (T5) | Chuyển trạng thái |
| TC-ISS-013 | `Issue.Report.Status` | Shipper A báo sự cố loại "Thất lạc" cho D1 và xác nhận | D1 "Đang giao"; Shipper A | Hệ thống chuyển D1 từ "Đang giao" sang "Thất lạc" (T10) | Chuyển trạng thái |
| TC-ISS-014 | `3.0.E1` | Shipper A phát hiện hàng hỏng, chọn báo sự cố loại "Hàng hỏng" (bước 2) và xác nhận (bước 3) | D1 "Đang giao"; Shipper A | Hệ thống lưu sự cố (Issue.Report.Store) và chuyển D1 sang "Hư hỏng" (bước 5, T9); hệ thống kết thúc UC (bước 6), Admin xử lý sự cố ở UC-07 | Chuyển trạng thái |
| TC-ISS-015 | `3.0.E1` | Shipper A báo "Hàng hỏng" cho D1 và xác nhận, rồi xem lịch sử trạng thái của D1 | D1 "Đang giao"; Shipper A | Lịch sử có thêm bản ghi: người đổi là Shipper A, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Đang giao", trạng thái mới "Hư hỏng" | Chuyển trạng thái |
| TC-ISS-016 | `3.0.E1` | [Âm] Shipper A chọn loại "Hàng hỏng" nhưng không xác nhận (đóng hộp xác nhận) | D1 "Đang giao"; Shipper A | Hệ thống không lưu sự cố và không đổi trạng thái: D1 vẫn ở "Đang giao" | Chuyển trạng thái |
| TC-ISS-017 | `3.0.E1` | [Âm] Shipper A gửi thẳng request báo sự cố loại "Hàng hỏng" cho đơn đã "Đã giao" | D1 "Đã giao"; Shipper A | Hệ thống không lưu sự cố và không chuyển D1 sang "Hư hỏng" qua T9; D1 vẫn ở "Đã giao". Hàng hỏng sau khi giao được xử lý qua yêu cầu hoàn hàng (xem UC-05) | Request trực tiếp |
| TC-ISS-018 | `3.0.E2` | Shipper A báo "Giao không thành công" lần đầu cho D1, rồi xác nhận (bước 2 đến 5) | D1 "Đang giao" chưa có sự cố "Giao không thành công" nào; Shipper A; Biên «số lần giao không thành công» · hợp lệ #1 | Hệ thống lưu sự cố và chuyển D1 sang "Giao không thành công" (T5); số lần giao không thành công là 1, chưa đạt giới hạn ở BR-06 nên Shipper giao lại theo luồng 3.1 (xem TC-TRK-013) | Giá trị biên |
| TC-ISS-019 | `3.0.E2` | Shipper A báo "Giao không thành công" lần thứ hai cho D1 (D1 đã giao lại một lần), rồi xác nhận | D1 "Đang giao" đã có 1 sự cố "Giao không thành công"; Shipper A; Biên «số lần giao không thành công» · hợp lệ #2 | Hệ thống lưu sự cố và chuyển D1 sang "Giao không thành công" (T5); số lần là 2, chưa đạt giới hạn nên Shipper giao lại theo luồng 3.1 (xem TC-TRK-014) | Giá trị biên |
| TC-ISS-020 | `3.0.E2` | [Âm] Shipper A báo "Giao không thành công" lần thứ ba cho D1, rồi xác nhận (bước 7b) | D1 "Đang giao" đã có 2 sự cố "Giao không thành công"; Shipper A; Biên «số lần giao không thành công» · không hợp lệ #1 | Hệ thống lưu sự cố và chuyển D1 sang "Giao không thành công" (T5); số lần là 3, đạt giới hạn ở BR-06 nên Shipper không được giao lại (T6 bị chặn, xem TC-TRK-015); Admin chuyển D1 sang "Đang hoàn hàng" ở UC-07 (xem Issue.Resolve.Return) | Giá trị biên |
| TC-ISS-021 | `3.0.E2` | Shipper A báo "Giao không thành công" cho D1 và xác nhận, rồi xem lịch sử trạng thái của D1 | D1 "Đang giao"; Shipper A | Lịch sử có thêm bản ghi: người đổi là Shipper A, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Đang giao", trạng thái mới "Giao không thành công" | Chuyển trạng thái |
| TC-ISS-022 | `3.0.E2` | [Âm] Shipper A chọn loại "Giao không thành công" nhưng không xác nhận | D1 "Đang giao"; Shipper A | Hệ thống không lưu sự cố và không đổi trạng thái: D1 vẫn ở "Đang giao"; số lần giao không thành công không tăng | Chuyển trạng thái |
| TC-ISS-023 | `3.0.E2` | [Âm] Shipper A gửi thẳng request báo sự cố loại "Giao không thành công" cho đơn đang "Giao không thành công" | D1 "Giao không thành công" đã có 1 sự cố loại "Giao không thành công"; Shipper A; Biên «số lần giao không thành công» · hợp lệ #1 | Hệ thống không lưu sự cố thêm (sự cố chỉ báo được khi đơn ở "Đang giao"); số lần giao không thành công của D1 vẫn là 1; D1 vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-ISS-024 | `3.0.E3` | Shipper A không tìm thấy hàng, chọn báo sự cố loại "Thất lạc" (bước 2) và xác nhận (bước 3) | D1 "Đang giao"; Shipper A | Hệ thống lưu sự cố (Issue.Report.Store) và chuyển D1 sang "Thất lạc" (bước 5, T10) | Chuyển trạng thái |
| TC-ISS-025 | `3.0.E3` | Shipper A báo "Thất lạc" cho D1 và xác nhận, rồi xem lịch sử trạng thái của D1 | D1 "Đang giao"; Shipper A | Lịch sử có thêm bản ghi: người đổi là Shipper A, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Đang giao", trạng thái mới "Thất lạc" | Chuyển trạng thái |
| TC-ISS-026 | `3.0.E3` | [Âm] Shipper A chọn loại "Thất lạc" nhưng không xác nhận | D1 "Đang giao"; Shipper A | Hệ thống không lưu sự cố và không đổi trạng thái: D1 vẫn ở "Đang giao" | Chuyển trạng thái |
| TC-ISS-027 | `3.0.E3` | [Âm] Shipper A gửi thẳng request báo sự cố loại "Thất lạc" cho đơn đã "Đã giao" | D1 "Đã giao"; Shipper A | Hệ thống không lưu sự cố và không chuyển D1 sang "Thất lạc" qua T10; D1 vẫn ở "Đã giao". Hàng thất lạc sau khi giao được xử lý qua yêu cầu hoàn hàng (xem UC-05) | Request trực tiếp |
| TC-ISS-028 | `Issue.Resolve.List` | Admin 1 mở danh sách sự cố sau khi Shipper A vừa báo một sự cố loại "Hàng hỏng" | Một sự cố "Hàng hỏng" chưa có kết quả xử lý; Admin 1 | Sự cố có trong danh sách sự cố chưa có kết quả xử lý | Phân vùng tương đương |
| TC-ISS-029 | `Issue.Resolve.List` | Admin 1 mở danh sách khi có ba sự cố chưa có kết quả, mỗi loại một sự cố | Ba sự cố: "Hàng hỏng", "Giao không thành công", "Thất lạc" | Danh sách gồm cả ba sự cố | Phân vùng tương đương |
| TC-ISS-030 | `Issue.Resolve.List` | Admin 1 ghi kết quả xử lý cho một sự cố, rồi mở lại danh sách | Một sự cố chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Sự cố đã có kết quả không còn trong danh sách; các sự cố còn lại vẫn có trong danh sách | Chuyển trạng thái |
| TC-ISS-031 | `Issue.Resolve.List` | Admin 1 mở danh sách khi mọi sự cố đều đã có kết quả xử lý | Mọi sự cố có kết quả xử lý | Danh sách sự cố chưa có kết quả không có sự cố nào | Phân vùng tương đương |
| TC-ISS-032 | `Issue.Resolve.List` | Admin 1 xác nhận thất lạc một đơn "Đang giao" (luồng 7.1), rồi xem danh sách | D1 "Đang giao"; Admin 1 | Sự cố loại "Thất lạc" vừa ghi (người báo là Admin 1) có trong danh sách sự cố chưa có kết quả (quay lại bước 1) | Chuyển trạng thái |
| TC-ISS-033 | `Issue.Resolve.Return` | Admin 1 chọn sự cố "Giao không thành công" của đơn D1 và chuyển D1 sang trả lại, khi D1 đã đủ số lần giao không thành công | D1 "Giao không thành công" có 3 sự cố "Giao không thành công"; Admin 1; Biên «số lần giao không thành công» · không hợp lệ #1 (phần T7 hợp lệ) | Hệ thống chuyển D1 từ "Giao không thành công" sang "Đang hoàn hàng" (T7) | Giá trị biên |
| TC-ISS-034 | `Issue.Resolve.Return` | Admin 1 chuyển D1 sang "Đang hoàn hàng" (T7), rồi xem lịch sử trạng thái của D1 | D1 "Giao không thành công" có 3 sự cố "Giao không thành công"; Admin 1 | Lịch sử có thêm bản ghi: người đổi là Admin 1, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Giao không thành công", trạng thái mới "Đang hoàn hàng" | Chuyển trạng thái |
| TC-ISS-035 | `Issue.Resolve.Return` | [Âm] Admin 1 gửi thẳng request chuyển D1 sang "Đang hoàn hàng" khi D1 mới có 2 sự cố "Giao không thành công" | D1 "Giao không thành công" có 2 sự cố "Giao không thành công"; Admin 1; Biên «số lần giao không thành công» · không hợp lệ #2 | Hệ thống từ chối bước chuyển và báo lý do (xem BR-06, Track.Update.Valid); D1 vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-ISS-036 | `Issue.Resolve.Return` | [Âm] Admin 1 gửi thẳng request chuyển sang "Đang hoàn hàng" cho đơn đã giao lại, đang "Đang giao" | D1 "Đang giao" sau T6, dựng bằng dữ liệu seed (có 2 sự cố "Giao không thành công"); Admin 1 | Hệ thống từ chối bước chuyển (T7 chỉ đi từ "Giao không thành công") và báo lý do; D1 vẫn ở "Đang giao" | Request trực tiếp |
| TC-ISS-037 | `Issue.Resolve.Returned` | Admin 1 chọn đơn "Đang hoàn hàng" trong danh sách đơn hàng và xác nhận đã nhận lại hàng (luồng 7.2) | D1 "Đang hoàn hàng"; Admin 1 | Hệ thống chuyển D1 từ "Đang hoàn hàng" sang "Đã hoàn về người bán" (T8) và kết thúc UC | Chuyển trạng thái |
| TC-ISS-038 | `Issue.Resolve.Returned` | Admin 1 xác nhận đã nhận lại hàng của D1, rồi xem lịch sử trạng thái của D1 | D1 "Đang hoàn hàng"; Admin 1 | Lịch sử có thêm bản ghi: người đổi là Admin 1, thời điểm dạng dd/MM/yyyy HH:mm giờ UTC+7, trạng thái cũ "Đang hoàn hàng", trạng thái mới "Đã hoàn về người bán" | Chuyển trạng thái |
| TC-ISS-039 | `Issue.Resolve.Returned` | [Âm] Admin 1 chọn đơn "Đang hoàn hàng" nhưng không xác nhận (chưa nhận lại hàng) | D1 "Đang hoàn hàng"; Admin 1 | Hệ thống không đổi trạng thái: D1 vẫn ở "Đang hoàn hàng" | Chuyển trạng thái |
| TC-ISS-040 | `Issue.Resolve.Returned` | [Âm] Admin 1 gửi thẳng request xác nhận đã nhận lại hàng cho đơn đang "Giao không thành công" | D1 "Giao không thành công"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; D1 vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-ISS-041 | `Issue.Resolve.Returned` | [Âm] Admin 1 gửi thẳng request xác nhận đã nhận lại hàng cho đơn đang "Đang giao" | D1 "Đang giao"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; D1 vẫn ở "Đang giao" | Request trực tiếp |
| TC-ISS-042 | `Issue.Resolve.Returned` | [Âm] Admin 1 gửi thẳng request xác nhận đã nhận lại hàng cho đơn đang "Đã hoàn về người bán" | D1 "Đã hoàn về người bán"; Admin 1 | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do; D1 vẫn ở "Đã hoàn về người bán" | Request trực tiếp |
| TC-ISS-043 | `Issue.Resolve.Lost` | Admin 1 chọn đơn "Đang giao" trong danh sách đơn hàng (Track.Admin.List) và xác nhận thất lạc (luồng 7.1) | D1 "Đang giao"; Admin 1 | Hệ thống cho Admin xác nhận thất lạc cho đơn "Đang giao"; luồng 7.1 chạy tiếp tới bước ghi sự cố và chuyển đơn (xem Issue.Resolve.LostStore, Issue.Resolve.LostStatus) | Chuyển trạng thái |
| TC-ISS-044 | `Issue.Resolve.Lost` | [Âm] Admin 1 chọn đơn "Đã giao" và tìm cách xác nhận thất lạc (giao diện) | D1 "Đã giao"; Admin 1 | Hệ thống không cho Admin xác nhận thất lạc cho đơn không ở "Đang giao"; D1 vẫn ở "Đã giao" | Chuyển trạng thái |
| TC-ISS-045 | `Issue.Resolve.Lost` | [Âm] Admin 1 gửi thẳng request xác nhận thất lạc cho đơn đang "Chờ lấy hàng" | D1 "Chờ lấy hàng"; Admin 1 | Hệ thống từ chối và báo lý do; không ghi sự cố "Thất lạc" và D1 vẫn ở "Chờ lấy hàng" | Request trực tiếp |
| TC-ISS-046 | `Issue.Resolve.Lost` | [Âm] Admin 1 gửi thẳng request xác nhận thất lạc cho đơn đang "Giao không thành công" | D1 "Giao không thành công"; Admin 1 | Hệ thống từ chối và báo lý do; không ghi sự cố "Thất lạc" và D1 vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-ISS-047 | `Issue.Resolve.Lost` | [Âm] Admin 1 gửi thẳng request xác nhận thất lạc cho đơn đang "Đã giao" | D1 "Đã giao"; Admin 1 | Hệ thống từ chối và báo lý do; không ghi sự cố "Thất lạc" và D1 vẫn ở "Đã giao" | Request trực tiếp |
| TC-ISS-048 | `Issue.Resolve.LostStore` | Admin 1 xác nhận thất lạc đơn D1 "Đang giao" | D1 "Đang giao"; Admin 1 | Hệ thống ghi sự cố loại "Thất lạc" cho D1 với người báo là Admin 1 (không phải Shipper được phân công) và thời điểm báo dạng dd/MM/yyyy HH:mm giờ UTC+7 | Phân vùng tương đương |
| TC-ISS-049 | `Issue.Resolve.LostStore` | Admin 2 xác nhận thất lạc một đơn khác | D2 "Đang giao"; Admin 2 | Sự cố "Thất lạc" của D2 có người báo là Admin 2; mã sự cố khác mã sự cố của D1 | Phân vùng tương đương |
| TC-ISS-050 | `Issue.Resolve.LostStore` | Admin 1 xác nhận thất lạc D1; so với sự cố "Thất lạc" do Shipper A báo cho đơn khác | D1 và D3 "Đang giao"; Admin 1 xác nhận D1, Shipper A báo D3 | Sự cố của D1 có người báo là Admin 1; sự cố của D3 có người báo là Shipper A | Phân vùng tương đương |
| TC-ISS-051 | `Issue.Resolve.LostStatus` | Admin 1 xác nhận thất lạc đơn D1 "Đang giao" | D1 "Đang giao"; Admin 1 | Hệ thống chuyển D1 từ "Đang giao" sang "Thất lạc" (T10) | Chuyển trạng thái |
| TC-ISS-052 | `Issue.Resolve.LostStatus` | Admin 1 xác nhận thất lạc đơn D1, rồi Customer A xem trạng thái đơn | D1 "Đang giao"; Admin 1; Customer A | Trạng thái hiện tại của D1 mà Customer A thấy là "Thất lạc"; lịch sử có bản ghi người đổi Admin 1, trạng thái cũ "Đang giao", trạng thái mới "Thất lạc" (cùng nội dung với TC-TRK-031) | Chuyển trạng thái |
| TC-ISS-053 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Hàng hỏng" của D1 | D1 "Hư hỏng"; sự cố "Hàng hỏng" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống lưu kết quả đúng như đã nhập, chỉ ghi nhận, không xử lý tiền (BR-07); sự cố không còn trong danh sách sự cố chưa có kết quả | Giá trị biên |
| TC-ISS-054 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Hàng hỏng" của D1 | D1 "Hư hỏng"; sự cố "Hàng hỏng" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #2 | Hệ thống lưu toàn bộ kết quả đúng như đã nhập, chỉ ghi nhận, không xử lý tiền (BR-07) | Giá trị biên |
| TC-ISS-055 | `Issue.Resolve.Result` | [Âm] Admin 1 để trống kết quả xử lý cho sự cố "Hàng hỏng" của D1 | D1 "Hư hỏng"; sự cố "Hàng hỏng" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #1 | Hệ thống không lưu kết quả vì kết quả bắt buộc và không được rỗng; sự cố vẫn trong danh sách sự cố chưa có kết quả | Giá trị biên |
| TC-ISS-056 | `Issue.Resolve.Result` | [Âm] Admin 1 nhập kết quả xử lý chỉ gồm khoảng trắng cho sự cố "Hàng hỏng" của D1 | D1 "Hư hỏng"; sự cố "Hàng hỏng" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #2 | Hệ thống coi kết quả là rỗng và không lưu; sự cố vẫn trong danh sách | Giá trị biên |
| TC-ISS-057 | `Issue.Resolve.Result` | [Âm] Admin 1 nhập kết quả xử lý dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2) cho sự cố "Hàng hỏng" của D1 | D1 "Hư hỏng"; sự cố "Hàng hỏng" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #3 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 (DI-2) và chỉ ra trường kết quả xử lý vượt độ dài; sự cố vẫn trong danh sách | Giá trị biên |
| TC-ISS-058 | `Issue.Resolve.Result` | [Âm] Admin 1 gửi thẳng request ghi kết quả rỗng cho sự cố "Hàng hỏng" của D1 | D1 "Hư hỏng"; sự cố "Hàng hỏng" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #1; Admin 1 | Hệ thống không lưu kết quả; sự cố vẫn chưa có kết quả | Request trực tiếp |
| TC-ISS-059 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Thất lạc" của đơn D1 do Shipper A báo | D1 "Thất lạc"; sự cố "Thất lạc" chưa có kết quả; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống lưu kết quả (bước 5), không cần chuyển trạng thái đơn trước | Bảng quyết định |
| TC-ISS-060 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Thất lạc" do chính Admin 1 xác nhận (luồng 7.1) | D1 "Thất lạc"; sự cố "Thất lạc" người báo là Admin 1; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống lưu kết quả; sự cố không còn trong danh sách | Bảng quyết định |
| TC-ISS-061 | `Issue.Resolve.Result` | [Âm] Admin 1 ghi kết quả cho sự cố "Giao không thành công" của đơn đã đủ số lần nhưng chưa chuyển sang "Đang hoàn hàng" | D1 "Giao không thành công" có 3 sự cố "Giao không thành công"; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Biên «số lần giao không thành công» · không hợp lệ #1 | Hệ thống từ chối ghi kết quả: Admin phải chuyển D1 sang "Đang hoàn hàng" (T7) trước (BR-06); sự cố vẫn chưa có kết quả | Bảng quyết định |
| TC-ISS-062 | `Issue.Resolve.Result` | [Âm] Admin 1 gửi thẳng request ghi kết quả cho sự cố "Giao không thành công" của đơn đã đủ số lần nhưng chưa chuyển sang "Đang hoàn hàng" | D1 "Giao không thành công" có 3 sự cố "Giao không thành công"; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Admin 1; Biên «số lần giao không thành công» · không hợp lệ #1 | Hệ thống từ chối ghi kết quả; sự cố vẫn chưa có kết quả; D1 vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-ISS-063 | `Issue.Resolve.Result` | Admin 1 chuyển D1 sang "Đang hoàn hàng" (bước 4, T7) rồi ghi kết quả xử lý cho sự cố "Giao không thành công" của D1 | D1 "Giao không thành công" có 3 sự cố "Giao không thành công"; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Biên «số lần giao không thành công» · không hợp lệ #1 (phần T7 hợp lệ) | D1 sang "Đang hoàn hàng" (T7); hệ thống lưu kết quả và sự cố không còn trong danh sách | Bảng quyết định |
| TC-ISS-064 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Giao không thành công" khi D1 mới có 2 sự cố | D1 "Giao không thành công" có 2 sự cố "Giao không thành công"; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1; Biên «số lần giao không thành công» · không hợp lệ #2 | Hệ thống lưu kết quả (bước 5); D1 vẫn ở "Giao không thành công" | Bảng quyết định |
| TC-ISS-065 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Giao không thành công" của đơn Shipper đã giao lại | D1 "Đang giao" sau T6 (đã có 1 sự cố "Giao không thành công"); kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống lưu kết quả (bước 5), vì đơn không còn ở "Giao không thành công" | Bảng quyết định |
| TC-ISS-066 | `Issue.Resolve.Result` | Admin 1 ghi kết quả xử lý cho sự cố "Giao không thành công" của đơn đã nhận lại hàng | D1 "Đã hoàn về người bán" (đã có 3 sự cố "Giao không thành công"); kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống lưu kết quả (bước 5), vì đơn không còn ở "Giao không thành công" | Bảng quyết định |
| TC-ISS-067 | `7.0.E1` | [Âm] Admin 1 chọn sự cố "Giao không thành công" của D1 và yêu cầu chuyển trả lại khi D1 mới có 2 sự cố | D1 "Giao không thành công" có 2 sự cố "Giao không thành công"; Admin 1; Biên «số lần giao không thành công» · không hợp lệ #2 | Hệ thống từ chối chuyển trả lại và báo lý do (xem Issue.Resolve.Return, Track.Update.Valid); D1 vẫn ở "Giao không thành công" | Giá trị biên |
| TC-ISS-068 | `7.0.E1` | [Âm] Admin 1 gửi thẳng request chuyển D1 sang "Đang hoàn hàng" khi D1 mới có 2 sự cố | D1 "Giao không thành công" có 2 sự cố "Giao không thành công"; Admin 1; Biên «số lần giao không thành công» · không hợp lệ #2 | Hệ thống từ chối và báo lý do; D1 vẫn ở "Giao không thành công" và lịch sử của D1 không có bản ghi mới | Request trực tiếp |
| TC-ISS-069 | `7.0.E1` | Sau khi 7.0.E1 từ chối, Admin 1 ghi kết quả xử lý cho sự cố (bước 5) | D1 "Giao không thành công" có 2 sự cố "Giao không thành công"; kết quả xử lý Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · hợp lệ #1 | Hệ thống lưu kết quả; D1 vẫn ở "Giao không thành công" | Chuyển trạng thái |
| TC-ISS-070 | `7.0.E1` | Admin 1 yêu cầu chuyển trả lại khi D1 đã đủ 3 sự cố (không còn là ngoại lệ) | D1 "Giao không thành công" có 3 sự cố "Giao không thành công"; Admin 1; Biên «số lần giao không thành công» · không hợp lệ #1 (phần T7 hợp lệ) | Hệ thống không báo 7.0.E1: D1 sang "Đang hoàn hàng" (T7) | Giá trị biên |

### 3.5 ACC – Tài khoản

Phạm vi: 9 ID ở Test Plan mục 2.1.5 (`Account.*`). **Đăng ký cơ sở** là một lần đăng ký mà mỗi trường dùng giá trị hợp lệ đầu tiên của dòng tương ứng ở bảng biên: «họ tên, tên người nhận» · hợp lệ #1, «email (đăng ký)» · hợp lệ #1, «mật khẩu» · hợp lệ #1, «số điện thoại (cả hai loại)» · hợp lệ #1, với email chưa có tài khoản nào. Dòng kiểm một trường chỉ đổi trường đó. Các giá trị không nằm trong bảng biên (email rỗng, mật khẩu rỗng, số điện thoại chỉ gồm khoảng trắng) được mô tả ngay ở cột Dữ liệu.

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-ACC-001 | `Account.Register.Fields` | Người chưa có tài khoản đăng ký bằng họ tên, email, mật khẩu và số điện thoại hợp lệ (đăng ký cơ sở) | Biên «họ tên, tên người nhận» · hợp lệ #1; Biên «email (đăng ký)» · hợp lệ #1; Biên «mật khẩu» · hợp lệ #1; Biên «số điện thoại (cả hai loại)» · hợp lệ #1 | Hệ thống tạo tài khoản Customer với họ tên, email, số điện thoại đã nhập | Phân vùng tương đương |
| TC-ACC-002 | `Account.Register.Fields` | Đăng ký với bốn trường ở độ dài lớn nhất cho phép | Biên «họ tên, tên người nhận» · hợp lệ #2; Biên «email (đăng ký)» · hợp lệ #2; Biên «mật khẩu» · hợp lệ #2; Biên «số điện thoại (cả hai loại)» · hợp lệ #2 | Hệ thống tạo tài khoản Customer; họ tên và email lưu đủ, không bị cắt | Giá trị biên |
| TC-ACC-003 | `Account.Register.Fields` | Customer vừa đăng ký đăng nhập bằng email và mật khẩu đã đăng ký | Tài khoản vừa tạo từ đăng ký cơ sở; Biên «mật khẩu» · hợp lệ #1 | Hệ thống cho đăng nhập (xem Account.Login.Credentials) | Phân vùng tương đương |
| TC-ACC-004 | `Account.Register.Required` | Đăng ký với họ tên có độ dài nhỏ nhất hợp lệ; các trường khác như đăng ký cơ sở | Biên «họ tên, tên người nhận» · hợp lệ #1 | Hệ thống chấp nhận họ tên và tạo tài khoản | Giá trị biên |
| TC-ACC-005 | `Account.Register.Required` | Đăng ký với họ tên có độ dài lớn nhất cho phép; các trường khác như đăng ký cơ sở | Biên «họ tên, tên người nhận» · hợp lệ #2 | Hệ thống chấp nhận họ tên và tạo tài khoản | Giá trị biên |
| TC-ACC-006 | `Account.Register.Required` | [Âm] Đăng ký với họ tên dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2); các trường khác như đăng ký cơ sở | Biên «họ tên, tên người nhận» · không hợp lệ #3 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 (DI-2) và chỉ ra trường họ tên vượt độ dài; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-007 | `Account.Register.Required` | [Âm] Để trống họ tên; các trường khác như đăng ký cơ sở | Biên «họ tên, tên người nhận» · không hợp lệ #1 | Hệ thống chỉ ra trường còn thiếu: họ tên; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-008 | `Account.Register.Required` | [Âm] Họ tên chỉ gồm khoảng trắng; các trường khác như đăng ký cơ sở | Biên «họ tên, tên người nhận» · không hợp lệ #2 | Hệ thống coi họ tên là còn thiếu và chỉ ra trường họ tên; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-009 | `Account.Register.Required` | [Âm] Để trống email; các trường khác như đăng ký cơ sở | Email là chuỗi rỗng | Hệ thống chỉ ra trường còn thiếu: email; tài khoản chưa được tạo | Phân vùng tương đương |
| TC-ACC-010 | `Account.Register.Required` | [Âm] Email chỉ gồm khoảng trắng; các trường khác như đăng ký cơ sở | Biên «email (đăng ký)» · không hợp lệ #3 | Hệ thống coi email là còn thiếu và chỉ ra trường email; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-011 | `Account.Register.Required` | [Âm] Để trống mật khẩu; các trường khác như đăng ký cơ sở | Mật khẩu là chuỗi rỗng | Hệ thống chỉ ra trường còn thiếu: mật khẩu; tài khoản chưa được tạo | Phân vùng tương đương |
| TC-ACC-012 | `Account.Register.Required` | [Âm] Mật khẩu chỉ gồm khoảng trắng (đủ độ dài tối thiểu); các trường khác như đăng ký cơ sở | Mật khẩu gồm toàn khoảng trắng với độ dài của Biên «mật khẩu» · hợp lệ #1 | Hệ thống coi mật khẩu là còn thiếu (Account.Register.Required: trường chỉ gồm khoảng trắng được coi là còn thiếu) và chỉ ra trường mật khẩu; tài khoản chưa được tạo | Phân vùng tương đương |
| TC-ACC-013 | `Account.Register.Required` | [Âm] Để trống số điện thoại; các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #5 | Hệ thống chỉ ra trường còn thiếu: số điện thoại; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-014 | `Account.Register.Required` | [Âm] Số điện thoại chỉ gồm khoảng trắng; các trường khác như đăng ký cơ sở | Số điện thoại gồm toàn khoảng trắng | Hệ thống coi số điện thoại là còn thiếu và chỉ ra trường số điện thoại; tài khoản chưa được tạo | Phân vùng tương đương |
| TC-ACC-015 | `Account.Register.Email` | Đăng ký với email đúng dạng "valid e-mail address" của chuẩn HTML (WHATWG); các trường khác như đăng ký cơ sở | Biên «email (đăng ký)» · hợp lệ #1 | Hệ thống chấp nhận email và tạo tài khoản | Giá trị biên |
| TC-ACC-016 | `Account.Register.Email` | Đăng ký với email đúng dạng và dài nhất cho phép; các trường khác như đăng ký cơ sở | Biên «email (đăng ký)» · hợp lệ #2 | Hệ thống chấp nhận email và tạo tài khoản; email lưu đủ, không bị cắt | Giá trị biên |
| TC-ACC-017 | `Account.Register.Email` | [Âm] Đăng ký với email dài hơn độ dài ở mục 4.2 của SRS (cũng thuộc DI-2); các trường khác như đăng ký cơ sở | Biên «email (đăng ký)» · không hợp lệ #1 | Hệ thống từ chối lưu chuỗi dài hơn độ dài ở mục 4.2 (DI-2) và chỉ ra trường email vượt độ dài; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-018 | `Account.Register.Email` | [Âm] Đăng ký với email thiếu ký tự "@"; các trường khác như đăng ký cơ sở | Biên «email (đăng ký)» · không hợp lệ #2 | Hệ thống từ chối email vì không đúng định nghĩa "valid e-mail address" của chuẩn HTML và chỉ ra trường email; tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-019 | `Account.Register.Unique` | Đăng ký bằng email chưa thuộc tài khoản nào; các trường khác như đăng ký cơ sở | Biên «email (đăng ký)» · hợp lệ #1; chưa có tài khoản dùng email này | Hệ thống chấp nhận và tạo tài khoản | Phân vùng tương đương |
| TC-ACC-020 | `Account.Register.Unique` | [Âm] Đăng ký bằng đúng email đã thuộc một tài khoản Customer khác | Email giống hệt email của Customer A | Hệ thống từ chối đăng ký và báo lý do (email đã thuộc một tài khoản khác); không tạo tài khoản mới | Phân vùng tương đương |
| TC-ACC-021 | `Account.Register.Unique` | [Âm] Đăng ký bằng email có khoảng trắng hai đầu và khác chữ hoa, chữ thường so với email đã có | Biên «so khớp email» · hợp lệ #1: tài khoản đã có email viết thường, đăng ký bằng chuỗi có khoảng trắng hai đầu và chữ hoa | Hệ thống từ chối đăng ký và báo lý do (email đã thuộc một tài khoản khác), vì email được so khớp sau khi bỏ khoảng trắng hai đầu và không phân biệt chữ hoa, chữ thường; không tạo tài khoản mới | Giá trị biên |
| TC-ACC-022 | `Account.Register.Unique` | [Âm] Đăng ký bằng email chỉ khác email đã có ở chữ hoa, chữ thường | Email của Customer A viết toàn chữ hoa | Hệ thống từ chối đăng ký và báo lý do (email đã thuộc một tài khoản khác) | Phân vùng tương đương |
| TC-ACC-023 | `Account.Register.Unique` | [Âm] Đăng ký bằng email của tài khoản Admin 1 (có sẵn nhờ seed) | Email của Admin 1 | Hệ thống từ chối đăng ký và báo lý do (email đã thuộc một tài khoản khác) | Phân vùng tương đương |
| TC-ACC-024 | `Account.Register.Unique` | [Âm] Hai người cùng lúc đăng ký bằng cùng một email chưa có tài khoản | Biên «email (đăng ký)» · hợp lệ #1; hai phiên đăng ký song song | Chỉ một tài khoản được tạo; lần đăng ký còn lại bị từ chối và báo lý do (mỗi email chỉ thuộc một tài khoản) | Hai phiên song song |
| TC-ACC-025 | `Account.Register.Unique` | [Âm] Đăng ký bị từ chối vì trùng email, rồi chủ tài khoản đã có đăng nhập bằng mật khẩu cũ | Email của Customer A với mật khẩu khác; sau đó đăng nhập bằng mật khẩu cũ của Customer A | Customer A vẫn đăng nhập được bằng mật khẩu cũ; mật khẩu của tài khoản không bị đổi | Phân vùng tương đương |
| TC-ACC-026 | `Account.Register.Password` | Đăng ký với mật khẩu ở độ dài tối thiểu; các trường khác như đăng ký cơ sở | Biên «mật khẩu» · hợp lệ #1 | Hệ thống chấp nhận mật khẩu và tạo tài khoản | Giá trị biên |
| TC-ACC-027 | `Account.Register.Password` | Đăng ký với mật khẩu ở độ dài tối đa; các trường khác như đăng ký cơ sở | Biên «mật khẩu» · hợp lệ #2 | Hệ thống chấp nhận mật khẩu và tạo tài khoản | Giá trị biên |
| TC-ACC-028 | `Account.Register.Password` | [Âm] Đăng ký với mật khẩu ngắn hơn độ dài tối thiểu; các trường khác như đăng ký cơ sở | Biên «mật khẩu» · không hợp lệ #1 | Hệ thống chỉ ra mật khẩu sai độ dài (từ 8 đến 64 ký tự); tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-029 | `Account.Register.Password` | [Âm] Đăng ký với mật khẩu dài hơn độ dài tối đa (cũng thuộc DI-2); các trường khác như đăng ký cơ sở | Biên «mật khẩu» · không hợp lệ #2 | Hệ thống chỉ ra mật khẩu sai độ dài (từ 8 đến 64 ký tự); tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-030 | `Account.Register.Password` | Đăng ký với mật khẩu ở độ dài tối thiểu chỉ gồm chữ thường, không có chữ hoa, chữ số hay ký tự đặc biệt | Mật khẩu chỉ gồm chữ cái thường, độ dài của Biên «mật khẩu» · hợp lệ #1 | Hệ thống chấp nhận mật khẩu vì SRS cho phép mọi ký tự và không bắt buộc chữ hoa, số hay ký tự đặc biệt; tài khoản được tạo | Phân vùng tương đương |
| TC-ACC-031 | `Account.Register.Phone` | Đăng ký với số điện thoại đúng quy tắc (10 chữ số, bắt đầu bằng 0); các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · hợp lệ #1 | Hệ thống chấp nhận số điện thoại và tạo tài khoản | Giá trị biên |
| TC-ACC-032 | `Account.Register.Phone` | Đăng ký với số điện thoại đúng quy tắc (10 chữ số, bắt đầu bằng 0); các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · hợp lệ #2 | Hệ thống chấp nhận số điện thoại và tạo tài khoản | Giá trị biên |
| TC-ACC-033 | `Account.Register.Phone` | [Âm] Đăng ký với số điện thoại sai quy tắc; các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #1 | Hệ thống chỉ ra trường số điện thoại sai quy tắc (đúng 10 chữ số, bắt đầu bằng chữ số 0); tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-034 | `Account.Register.Phone` | [Âm] Đăng ký với số điện thoại sai quy tắc; các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #2 | Hệ thống chỉ ra trường số điện thoại sai quy tắc (đúng 10 chữ số, bắt đầu bằng chữ số 0); tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-035 | `Account.Register.Phone` | [Âm] Đăng ký với số điện thoại sai quy tắc; các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #3 | Hệ thống chỉ ra trường số điện thoại sai quy tắc (đúng 10 chữ số, bắt đầu bằng chữ số 0); tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-036 | `Account.Register.Phone` | [Âm] Đăng ký với số điện thoại sai quy tắc; các trường khác như đăng ký cơ sở | Biên «số điện thoại (cả hai loại)» · không hợp lệ #4 | Hệ thống chỉ ra trường số điện thoại sai quy tắc (đúng 10 chữ số, bắt đầu bằng chữ số 0); tài khoản chưa được tạo | Giá trị biên |
| TC-ACC-037 | `Account.Register.Role` | Người dùng đăng ký bằng đăng ký cơ sở, rồi đăng nhập | Tài khoản vừa tạo từ đăng ký cơ sở | Tài khoản có vai trò Customer: người dùng thấy các màn hình và thao tác của Customer, không thấy của Admin hay Shipper | Phân vùng tương đương |
| TC-ACC-038 | `Account.Register.Role` | [Âm] Gửi thẳng request đăng ký kèm trường vai trò là Admin | Đăng ký cơ sở và thêm trường vai trò "Admin" vào request | Nếu hệ thống tạo tài khoản thì tài khoản có vai trò Customer (mọi tài khoản tạo qua đăng ký có vai trò Customer); không có tài khoản Admin nào được tạo | Request trực tiếp |
| TC-ACC-039 | `Account.Register.Role` | [Âm] Gửi thẳng request đăng ký kèm trường vai trò là Shipper | Đăng ký cơ sở và thêm trường vai trò "Shipper" vào request | Nếu hệ thống tạo tài khoản thì tài khoản có vai trò Customer; không có tài khoản Shipper nào được tạo | Request trực tiếp |
| TC-ACC-040 | `Account.Login.Credentials` | Customer A đăng nhập bằng email và mật khẩu đúng | Customer A đăng ký với Biên «mật khẩu» · hợp lệ #1; email và mật khẩu đúng | Hệ thống cho Customer A đăng nhập với vai trò Customer | Phân vùng tương đương |
| TC-ACC-041 | `Account.Login.Credentials` | Customer B đăng nhập bằng email và mật khẩu đúng, mật khẩu ở độ dài tối đa | Customer B đăng ký với Biên «mật khẩu» · hợp lệ #2; mật khẩu nhập đủ độ dài đó | Hệ thống cho Customer B đăng nhập (mật khẩu dài tối đa không bị cắt bớt, xem SEC-10) | Giá trị biên |
| TC-ACC-042 | `Account.Login.Credentials` | Customer A đăng nhập bằng email viết khác chữ hoa, chữ thường so với lúc đăng ký | Email của Customer A viết toàn chữ hoa; mật khẩu đúng | Hệ thống cho Customer A đăng nhập, vì email so khớp không phân biệt chữ hoa, chữ thường | Phân vùng tương đương |
| TC-ACC-043 | `Account.Login.Credentials` | Customer A đăng nhập bằng email có khoảng trắng hai đầu và khác chữ hoa, chữ thường | Biên «so khớp email» · hợp lệ #1: tài khoản có email viết thường, nhập chuỗi có khoảng trắng hai đầu và chữ hoa; mật khẩu đúng | Hệ thống cho đăng nhập, vì email được so khớp sau khi bỏ khoảng trắng hai đầu và không phân biệt chữ hoa, chữ thường | Giá trị biên |
| TC-ACC-044 | `Account.Login.Credentials` | Admin 1 đăng nhập bằng email và mật khẩu của tài khoản seed | Tài khoản Admin 1 (AS-2); mật khẩu từ biến môi trường | Hệ thống cho Admin 1 đăng nhập với vai trò Admin | Phân vùng tương đương |
| TC-ACC-045 | `Account.Login.Credentials` | Shipper A đăng nhập bằng email và mật khẩu của tài khoản seed | Tài khoản Shipper A (AS-2); mật khẩu từ biến môi trường | Hệ thống cho Shipper A đăng nhập với vai trò Shipper | Phân vùng tương đương |
| TC-ACC-046 | `Account.Login.Fail` | [Âm] Đăng nhập bằng email chưa có tài khoản và một mật khẩu bất kỳ | Email không thuộc tài khoản nào | Hệ thống báo đăng nhập không thành công bằng thông báo chung của SEC-11; người dùng chưa đăng nhập | Phân vùng tương đương |
| TC-ACC-047 | `Account.Login.Fail` | [Âm] Đăng nhập bằng email của Customer A và mật khẩu sai | Email đúng của Customer A; mật khẩu sai | Hệ thống báo đăng nhập không thành công bằng thông báo chung của SEC-11; người dùng chưa đăng nhập | Phân vùng tương đương |
| TC-ACC-048 | `Account.Login.Fail` | [Âm] Đăng nhập bằng email sai nhưng mật khẩu đúng của Customer A | Email thuộc tài khoản khác hoặc không tồn tại; mật khẩu của Customer A | Hệ thống báo đăng nhập không thành công bằng thông báo chung của SEC-11; người dùng chưa đăng nhập | Phân vùng tương đương |
| TC-ACC-049 | `Account.Login.Fail` | [Âm] So sánh thông báo của ba lần đăng nhập thất bại: email không tồn tại, đúng email sai mật khẩu, sai cả hai | Ba lần thử ở ba dòng trên | Ba thông báo giống nhau từng chữ; không thông báo nào cho biết sai email hay sai mật khẩu, hay tài khoản có tồn tại hay không (SEC-11) | Phân vùng tương đương |
| TC-ACC-050 | `Account.Login.Fail` | [Âm] Sau khi đăng nhập thất bại, mở thẳng một màn hình cần đăng nhập | Phiên chưa đăng nhập sau lần thử thất bại | Hệ thống không cho vào màn hình đó và yêu cầu đăng nhập (SEC-1) | Phân vùng tương đương |

### 3.6 NFR – Yêu cầu phi chức năng

Phạm vi: 22 ID ở Test Plan mục 2.2 (`RT-1`, `RT-2`, `SEC-1` đến `SEC-11`, `ROB-1`, `UI-1`, `CI-1`, `DI-1`, `DI-2`, `OE-1`, `OE-2`, `CO-1`, `CO-2`). Dòng nào ghi "phiên song song" dùng nhiều phiên trình duyệt chạy cùng lúc (các browser context của Playwright); "Request trực tiếp" là request gửi thẳng tới server (mục 2.1). SRS không nêu thông báo hay mã lỗi cho các lần từ chối; kết quả mong đợi chỉ ghi "từ chối" và dữ liệu không đổi (Test Plan mục 3.1.5).

**SEC-1 đến SEC-9.** Mỗi SEC có đúng ba dòng, theo thứ tự: một dòng dương qua giao diện với vai trò được phép; một dòng âm qua giao diện, thử lần lượt các vai trò bị cấm; một dòng âm bằng request gửi thẳng tới server. Vai trò lấy từ Test Plan mục 3.1.5 (Chưa đăng nhập, Customer chủ đơn, Customer khác, Shipper được phân công, Shipper khác, Admin). Bảng dưới là các vai trò bị thử ở hai dòng âm của từng SEC.

| Yêu cầu | Vai trò được phép (dòng dương) | Vai trò bị thử (hai dòng âm) |
|---|---|---|
| SEC-1 | Chưa đăng nhập (chỉ đăng ký và đăng nhập) | Chưa đăng nhập, với mọi thao tác còn lại |
| SEC-2 | Customer chủ đơn | Customer khác; Shipper; Admin (tạo đơn); Chưa đăng nhập |
| SEC-3 | Customer chủ đơn | Customer khác; Shipper; Admin; Chưa đăng nhập |
| SEC-4 | Shipper được phân công | Shipper khác; Customer; Chưa đăng nhập |
| SEC-5 | Admin | Customer; Shipper; Chưa đăng nhập |
| SEC-6 | Admin | Customer; Shipper; Chưa đăng nhập |
| SEC-7 | Admin | Customer; Shipper; Chưa đăng nhập |
| SEC-8 | Shipper được phân công | Shipper khác; Admin; Customer; Chưa đăng nhập |
| SEC-9 | Người dùng đã đăng nhập (Customer, Shipper, Admin) | Customer, Shipper, Admin sau khi đăng xuất |

**DI-2.** Các dòng ở module khác đã thử chuỗi vượt độ dài cho từng trường và ghi "(cũng thuộc DI-2)". Hai dòng DI-2 dưới đây kiểm quy tắc chung (từ chối, chỉ ra trường vượt độ dài, không lưu) ở chỗ các dòng đó chưa kiểm: request gửi thẳng và chuỗi dài hơn nhiều lần độ dài. Bảng sau chỉ các TC đã phủ từng trường, không chép lại giá trị.

| Trường (độ dài ở mục 4.2) | TC đã phủ chuỗi vượt độ dài |
|---|---|
| email | TC-ACC-017 |
| họ tên | TC-ACC-006 |
| tên người nhận | TC-ORD-010 |
| địa chỉ giao | TC-ORD-015 |
| mô tả lý do | TC-RET-012 |
| lý do từ chối | TC-RET-043 |
| kết quả xử lý | TC-ISS-057 |
| mật khẩu | TC-ACC-029 |

**UI-1, CO-2.** Mockup A8 đến A16 do TV3 làm ở giai đoạn 2 (Test Plan mục 3.1.3); việc so bố cục với mockup làm bằng tay, test tự động chỉ kiểm các phần tử chính có mặt.

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-NFR-001 | `RT-1` | Customer A mở sẵn màn hình Theo dõi vận chuyển của đơn D1; ở một phiên khác, Shipper A chuyển D1 sang "Đang giao" (T3) rồi sang "Đã giao" (T4) và xác nhận mỗi lần; Customer A không tải lại trang | D1 "Chờ lấy hàng" phân công cho Shipper A; hai phiên trình duyệt chạy song song | Sau mỗi lần Shipper xác nhận, màn hình của Customer A hiển thị trạng thái mới ("Đang giao", rồi "Đã giao") mà không cần tải lại trang | Phiên song song |
| TC-NFR-002 | `RT-1` | Customer A mở sẵn màn hình Chi tiết đơn hàng của đơn D1; ở một phiên khác, Admin 1 phân công D1 (T2) và xác nhận; Customer A không tải lại trang | D1 "Chờ xác nhận"; Admin 1; Shipper A; hai phiên trình duyệt chạy song song | Màn hình của Customer A hiển thị trạng thái mới "Chờ lấy hàng" mà không cần tải lại trang (thay đổi do Admin xác nhận) | Phiên song song |
| TC-NFR-003 | `RT-1` | [Âm] Customer B mở sẵn màn hình đơn của chính mình (đơn D3); ở một phiên khác, Shipper A đổi trạng thái của D1 (đơn của Customer A) | D1 "Chờ lấy hàng" của Customer A, phân công cho Shipper A; D3 của Customer B; ba phiên song song | Màn hình của Customer B không nhận cập nhật nào về D1 và vẫn hiển thị D3 như cũ (SEC-2); Customer A thì nhận cập nhật của D1 | Phiên song song |
| TC-NFR-004 | `RT-2` | Admin 1 mở sẵn Bảng điều khiển (danh sách đơn Track.Admin.List); ở một phiên khác, Shipper A chuyển D1 sang "Đang giao" (T3) và xác nhận; Admin 1 không tải lại trang | D1 "Chờ lấy hàng" phân công cho Shipper A; Admin 1; hai phiên song song | Danh sách trên Bảng điều khiển của Admin 1 hiển thị D1 với trạng thái mới "Đang giao" mà không cần tải lại trang | Phiên song song |
| TC-NFR-005 | `RT-2` | Admin 1 mở sẵn Bảng điều khiển; ở một phiên khác, Admin 2 phân công đơn D2 (T2) và xác nhận; Admin 1 không tải lại trang | D2 "Chờ xác nhận"; Admin 1, Admin 2; Shipper A; hai phiên song song | Danh sách trên Bảng điều khiển của Admin 1 hiển thị D2 với trạng thái mới "Chờ lấy hàng" mà không cần tải lại trang (thay đổi do Admin khác xác nhận) | Phiên song song |
| TC-NFR-006 | `SEC-1` | Người dùng chưa đăng nhập mở màn hình Đăng nhập và màn hình Đăng ký (hai thao tác được miễn đăng nhập), rồi đăng nhập | Vai trò Chưa đăng nhập; Customer A đã có tài khoản | Hai màn hình mở được mà không cần đăng nhập; sau khi đăng nhập đúng, Customer A vào được Trang chủ Customer | Ma trận vai trò × thao tác |
| TC-NFR-007 | `SEC-1` | [Âm] Vai trò Chưa đăng nhập mở thẳng từng màn hình còn lại của UI-1 (Trang chủ Customer, Tạo đơn hàng, Chi tiết đơn hàng, Yêu cầu hoàn hàng, Theo dõi vận chuyển, Bảng điều khiển Admin, Màn hình giao hàng của Shipper) | Chưa đăng nhập; địa chỉ của từng màn hình | Hệ thống không cho vào màn hình nào và yêu cầu người dùng đăng nhập (SEC-1) | Ma trận vai trò × thao tác |
| TC-NFR-008 | `SEC-1` | [Âm] Vai trò Chưa đăng nhập gửi thẳng request cho từng thao tác cần đăng nhập: tạo đơn, xem danh sách đơn, gửi và xem yêu cầu hoàn hàng, phân công, cập nhật trạng thái, báo sự cố, duyệt, từ chối, hoàn tất yêu cầu hoàn hàng, xử lý sự cố | Chưa đăng nhập; D1 "Chờ xác nhận" và một yêu cầu "Chờ duyệt" có sẵn | Hệ thống từ chối mọi request; dữ liệu không đổi (không có đơn, yêu cầu hoàn hàng hay sự cố mới; D1 và yêu cầu giữ nguyên trạng thái) | Request trực tiếp |
| TC-NFR-009 | `SEC-2` | Customer A tạo đơn đứng tên mình, rồi xem danh sách đơn và danh sách yêu cầu hoàn hàng của mình | Customer A; đơn cơ sở; D1 có yêu cầu hoàn hàng của Customer A | Đơn mới có Customer đặt là Customer A; Customer A thấy đơn và yêu cầu hoàn hàng của chính mình | Ma trận vai trò × thao tác |
| TC-NFR-010 | `SEC-2` | [Âm] Lần lượt Customer B (Customer khác) xem danh sách đơn và danh sách yêu cầu hoàn hàng của mình; Shipper A và Admin 1 tìm thao tác tạo đơn; Chưa đăng nhập mở màn hình Tạo đơn hàng | Customer A có D1 và yêu cầu hoàn hàng; Customer B có đơn riêng; Shipper A; Admin 1 | Danh sách của Customer B chỉ gồm đơn và yêu cầu của Customer B; Shipper A và Admin 1 không có thao tác tạo đơn trên giao diện; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-011 | `SEC-2` | [Âm] Customer B gửi thẳng request tạo đơn đứng tên Customer A, request xem đơn D1 của Customer A theo mã đơn; Shipper A và Admin 1 gửi thẳng request tạo đơn | Customer A có D1; Customer B; Shipper A; Admin 1 | Hệ thống từ chối từng request: không có đơn mới đứng tên Customer A; không trả dữ liệu của D1 cho Customer B; không có đơn nào do Shipper A hay Admin 1 tạo (yêu cầu hoàn hàng: xem thêm TC-RET-026) | Request trực tiếp |
| TC-NFR-012 | `SEC-3` | Customer A gửi yêu cầu hoàn hàng cho đơn D1 do chính mình tạo | D1 "Đã giao" của Customer A, còn trong thời hạn; Customer A | Hệ thống lưu yêu cầu "Chờ duyệt" (R1) cho D1 | Ma trận vai trò × thao tác |
| TC-NFR-013 | `SEC-3` | [Âm] Lần lượt Customer B, Shipper A, Admin 1 tìm thao tác gửi yêu cầu hoàn hàng cho D1 của Customer A; Chưa đăng nhập mở màn hình Yêu cầu hoàn hàng | D1 "Đã giao" của Customer A; Customer B; Shipper A; Admin 1 | D1 không có trong danh sách đơn của Customer B nên không có thao tác gửi yêu cầu cho D1; Shipper A và Admin 1 không có thao tác gửi yêu cầu hoàn hàng; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-014 | `SEC-3` | [Âm] Customer B, Shipper A và Admin 1 lần lượt gửi thẳng request yêu cầu hoàn hàng cho D1 của Customer A | D1 "Đã giao" của Customer A, còn trong thời hạn, chưa có yêu cầu | Hệ thống từ chối từng request; không có yêu cầu hoàn hàng nào được lưu cho D1 | Request trực tiếp |
| TC-NFR-015 | `SEC-4` | Shipper A xem danh sách đơn được phân công, chọn D1 và cập nhật sang "Đang giao" (T3) | D1 "Chờ lấy hàng" phân công cho Shipper A | Shipper A thấy D1 và đổi được D1 sang "Đang giao" | Ma trận vai trò × thao tác |
| TC-NFR-016 | `SEC-4` | [Âm] Lần lượt Shipper B (Shipper khác) mở danh sách đơn được phân công; Customer A tìm màn hình giao hàng; Chưa đăng nhập mở Màn hình giao hàng của Shipper | D1 "Chờ lấy hàng" phân công cho Shipper A; Shipper B không có đơn; Customer A | Danh sách của Shipper B không có D1 và không mở được D1; Customer A không có Màn hình giao hàng của Shipper; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-017 | `SEC-4` | [Âm] Shipper B gửi thẳng request xem D1 theo mã đơn và request cập nhật D1 sang "Đang giao" | D1 "Chờ lấy hàng" phân công cho Shipper A; Shipper B | Hệ thống từ chối cả hai request; không trả dữ liệu D1 cho Shipper B; D1 vẫn ở "Chờ lấy hàng"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-NFR-018 | `SEC-5` | Admin 1 tạo vận đơn và phân công D1 cho Shipper A | D1 "Chờ xác nhận"; Admin 1; Shipper A | Hệ thống tạo vận đơn và chuyển D1 sang "Chờ lấy hàng" (T2) | Ma trận vai trò × thao tác |
| TC-NFR-019 | `SEC-5` | [Âm] Lần lượt Customer A, Shipper A tìm thao tác tạo vận đơn và phân công; Chưa đăng nhập mở Bảng điều khiển Admin | D1 "Chờ xác nhận"; Customer A; Shipper A | Customer A và Shipper A không có thao tác tạo vận đơn hay phân công trên giao diện; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-020 | `SEC-5` | [Âm] Customer A và Shipper A lần lượt gửi thẳng request tạo vận đơn và phân công D1 cho Shipper A | D1 "Chờ xác nhận"; Customer A; Shipper A | Hệ thống từ chối từng request; D1 vẫn ở "Chờ xác nhận" và không có vận đơn nào cho D1 | Request trực tiếp |
| TC-NFR-021 | `SEC-6` | Admin 1 lần lượt chấp nhận (R2), từ chối (R3, kèm lý do từ chối) và ghi nhận hoàn tất (R4) ba yêu cầu hoàn hàng khác nhau | Ba yêu cầu: hai "Chờ duyệt", một "Đã chấp nhận"; Admin 1 | Ba yêu cầu sang "Đã chấp nhận", "Bị từ chối" và "Hoàn tất" | Ma trận vai trò × thao tác |
| TC-NFR-022 | `SEC-6` | [Âm] Lần lượt Customer A, Shipper A tìm thao tác duyệt, từ chối, ghi nhận hoàn tất yêu cầu hoàn hàng; Chưa đăng nhập mở Bảng điều khiển Admin | Yêu cầu "Chờ duyệt" và yêu cầu "Đã chấp nhận" có sẵn; Customer A; Shipper A | Customer A và Shipper A không có thao tác duyệt, từ chối hay ghi nhận hoàn tất; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-023 | `SEC-6` | [Âm] Customer A và Shipper A lần lượt gửi thẳng request chấp nhận, từ chối (kèm lý do từ chối hợp lệ) và ghi nhận hoàn tất | Yêu cầu "Chờ duyệt" và yêu cầu "Đã chấp nhận" có sẵn; Customer A; Shipper A | Hệ thống từ chối từng request; trạng thái các yêu cầu không đổi ("Chờ duyệt", "Đã chấp nhận") | Request trực tiếp |
| TC-NFR-024 | `SEC-7` | Admin 1 mở danh sách sự cố chưa có kết quả và ghi kết quả xử lý cho một sự cố | Sự cố "Hàng hỏng" chưa có kết quả; Admin 1 | Admin 1 thấy sự cố trong danh sách và ghi được kết quả; sự cố không còn trong danh sách | Ma trận vai trò × thao tác |
| TC-NFR-025 | `SEC-7` | [Âm] Lần lượt Customer A, Shipper A tìm danh sách sự cố và thao tác xử lý sự cố; Chưa đăng nhập mở Bảng điều khiển Admin | Sự cố chưa có kết quả; Customer A; Shipper A (người báo sự cố) | Customer A và Shipper A không có danh sách sự cố chưa xử lý và không có thao tác xử lý sự cố; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-026 | `SEC-7` | [Âm] Shipper A và Customer A lần lượt gửi thẳng request ghi kết quả xử lý sự cố và request chuyển đơn "Giao không thành công" sang "Đang hoàn hàng" | Sự cố "Giao không thành công" của đơn đã đủ số lần giao không thành công (Biên «số lần giao không thành công» · không hợp lệ #1); Shipper A; Customer A | Hệ thống từ chối từng request; sự cố vẫn chưa có kết quả; đơn vẫn ở "Giao không thành công" | Request trực tiếp |
| TC-NFR-027 | `SEC-8` | Shipper A được phân công cập nhật D1 sang "Đang giao" (T3) và báo sự cố loại "Hàng hỏng" cho D2 đang "Đang giao" | D1 "Chờ lấy hàng" và D2 "Đang giao", cùng phân công cho Shipper A | D1 sang "Đang giao"; sự cố "Hàng hỏng" được lưu cho D2 và D2 sang "Hư hỏng" (T9) | Ma trận vai trò × thao tác |
| TC-NFR-028 | `SEC-8` | [Âm] Lần lượt Shipper B (không được phân công), Admin 1, Customer A tìm thao tác cập nhật trạng thái giao hàng (T3, T4, T6) và báo sự cố của Shipper cho D1; Chưa đăng nhập mở Màn hình giao hàng của Shipper (việc Admin xác nhận thất lạc ở luồng 7.1 thuộc SEC-7, không xét ở đây) | D1 "Chờ lấy hàng" phân công cho Shipper A; Shipper B; Admin 1; Customer A | Shipper B, Admin 1 và Customer A không có thao tác cập nhật trạng thái giao hàng hay báo sự cố cho D1; Chưa đăng nhập bị yêu cầu đăng nhập | Ma trận vai trò × thao tác |
| TC-NFR-029 | `SEC-8` | [Âm] Shipper B, Admin 1 và Customer A lần lượt gửi thẳng request cập nhật D1 sang "Đang giao" và request báo sự cố loại "Hàng hỏng" cho D1 | D1 "Chờ lấy hàng" phân công cho Shipper A; Shipper B; Admin 1; Customer A | Hệ thống từ chối từng request; D1 vẫn ở "Chờ lấy hàng"; không có sự cố nào được lưu; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-NFR-030 | `SEC-9` | Customer A đã đăng nhập chọn đăng xuất, rồi đăng nhập lại bằng email và mật khẩu | Customer A | Hệ thống cho đăng xuất; sau khi đăng nhập lại, Customer A thực hiện được thao tác (xem danh sách đơn) | Ma trận vai trò × thao tác |
| TC-NFR-031 | `SEC-9` | [Âm] Lần lượt Customer A, Shipper A, Admin 1 đăng xuất, rồi quay lại trang cũ bằng nút Quay lại của trình duyệt hoặc mở lại địa chỉ màn hình vừa dùng | Customer A; Shipper A; Admin 1 | Hệ thống không cho vào màn hình và yêu cầu đăng nhập lại (SEC-9, SEC-1) | Ma trận vai trò × thao tác |
| TC-NFR-032 | `SEC-9` | [Âm] Sau khi đăng xuất, gửi thẳng request xem danh sách đơn bằng thông tin đăng nhập (phiên) cũ đã giữ lại từ trước khi đăng xuất | Customer A; thông tin phiên giữ trước khi đăng xuất | Hệ thống từ chối request và không trả dữ liệu; người dùng phải đăng nhập lại | Request trực tiếp |
| TC-NFR-033 | `SEC-10` | Customer đăng ký bằng đăng ký cơ sở, rồi đọc bản ghi tài khoản trong cơ sở dữ liệu | Đăng ký cơ sở (xem mục 3.5); quyền đọc cơ sở dữ liệu | Mật khẩu được lưu ở dạng băm: giá trị lưu khác mật khẩu đã nhập và không có mật khẩu đọc lại được ở bản ghi nào | Phân vùng tương đương |
| TC-NFR-034 | `SEC-10` | [Âm] Customer đăng ký với mật khẩu dài tối đa, rồi đăng nhập bằng phần đầu của mật khẩu đó (ngắn hơn mật khẩu đã đăng ký một ký tự) | Biên «mật khẩu» · hợp lệ #2 khi đăng ký; khi đăng nhập dùng chuỗi ngắn hơn một ký tự (đăng nhập bằng đủ độ dài: TC-ACC-041) | Hệ thống từ chối đăng nhập: mật khẩu không bị cắt bớt khi lưu, nên phần đầu của mật khẩu không khớp (SEC-10, SEC-11) | Giá trị biên |
| TC-NFR-035 | `SEC-11` | [Âm] Gửi thẳng request đăng nhập trong ba trường hợp: email không có tài khoản, email đúng với mật khẩu sai, cả email lẫn mật khẩu sai (qua giao diện: TC-ACC-046 đến TC-ACC-049) | Ba request; email của Customer A | Cả ba phản hồi mang cùng một thông báo chung, không cho biết sai email hay sai mật khẩu, hay tài khoản có tồn tại hay không | Phân vùng tương đương |
| TC-NFR-036 | `ROB-1` | Customer A mở sẵn màn hình Chi tiết đơn hàng của D1 rồi mất kết nối; trong lúc đó Shipper A đổi D1 hai lần, sang "Đang giao" rồi "Đã giao"; Customer A kết nối lại, rồi xem trạng thái hiện tại và lịch sử trạng thái của D1 (phần trạng thái trên màn hình Theo dõi vận chuyển: TC-TRK-046 đến TC-TRK-048) | D1 "Chờ lấy hàng" phân công cho Shipper A; Customer A | Màn hình hiển thị trạng thái mới nhất "Đã giao", kể cả thay đổi xảy ra lúc mất kết nối; lịch sử trạng thái của D1 có đủ hai bản ghi mới | Ngắt rồi nối lại kết nối |
| TC-NFR-037 | `ROB-1` | Admin 1 mở sẵn Bảng điều khiển rồi mất kết nối; trong lúc đó Shipper A chuyển D1 sang "Đang giao" và Admin 2 phân công D2 (T2); Admin 1 kết nối lại | D1 "Chờ lấy hàng" phân công cho Shipper A; D2 "Chờ xác nhận"; Admin 1, Admin 2 | Danh sách trên Bảng điều khiển hiển thị trạng thái mới nhất của hai đơn: D1 "Đang giao" và D2 "Chờ lấy hàng", kể cả thay đổi xảy ra lúc mất kết nối | Ngắt rồi nối lại kết nối |
| TC-NFR-038 | `UI-1` | Chưa đăng nhập mở màn hình Đăng nhập, đối chiếu với mockup A8 và thử điều hướng sang màn hình kế | Vai trò Chưa đăng nhập; mockup A8 | Màn hình Đăng nhập có trong hệ thống, mở được, khớp mockup (bố cục, nhãn, trường nhập, nút) và điều hướng được sang màn hình Đăng ký | Đối chiếu mockup |
| TC-NFR-039 | `UI-1` | Chưa đăng nhập mở màn hình Đăng ký, đối chiếu với mockup A9 và thử điều hướng sang màn hình kế | Vai trò Chưa đăng nhập; mockup A9 | Màn hình Đăng ký có trong hệ thống, mở được, khớp mockup và điều hướng được sang màn hình Đăng nhập | Đối chiếu mockup |
| TC-NFR-040 | `UI-1` | Customer A đăng nhập, mở màn hình Trang chủ Customer, đối chiếu với mockup A11 | Customer A; mockup A11 | Màn hình Trang chủ Customer có trong hệ thống, mở được, khớp mockup và điều hướng được sang các màn hình Customer kế tiếp | Đối chiếu mockup |
| TC-NFR-041 | `UI-1` | Customer A mở màn hình Tạo đơn hàng, đối chiếu với mockup A12 | Customer A; mockup A12 | Màn hình Tạo đơn hàng có trong hệ thống, mở được, khớp mockup (sản phẩm, số lượng, người nhận, địa chỉ giao) | Đối chiếu mockup |
| TC-NFR-042 | `UI-1` | Customer A mở màn hình Chi tiết đơn hàng của D1, đối chiếu với mockup A13 | Customer A; D1; mockup A13 | Màn hình Chi tiết đơn hàng có trong hệ thống, mở được, khớp mockup | Đối chiếu mockup |
| TC-NFR-043 | `UI-1` | Customer A mở màn hình Yêu cầu hoàn hàng, đối chiếu với mockup A14 | Customer A; D1 "Đã giao"; mockup A14 | Màn hình Yêu cầu hoàn hàng có trong hệ thống, mở được, khớp mockup | Đối chiếu mockup |
| TC-NFR-044 | `UI-1` | Customer A mở màn hình Theo dõi vận chuyển của D1, đối chiếu với mockup A15 | Customer A; D1; mockup A15 | Màn hình Theo dõi vận chuyển có trong hệ thống, mở được, khớp mockup | Đối chiếu mockup |
| TC-NFR-045 | `UI-1` | Admin 1 mở Bảng điều khiển Admin, đối chiếu với mockup A10 | Admin 1; mockup A10 | Màn hình Bảng điều khiển Admin có trong hệ thống, mở được, khớp mockup | Đối chiếu mockup |
| TC-NFR-046 | `UI-1` | Shipper A mở Màn hình giao hàng của Shipper, đối chiếu với mockup A16 | Shipper A; D1 phân công cho Shipper A; mockup A16 | Màn hình giao hàng của Shipper có trong hệ thống, mở được, khớp mockup | Đối chiếu mockup |
| TC-NFR-047 | `CI-1` | Customer A đang đăng nhập và đang ở màn hình Trang chủ Customer; Shipper A chuyển D1 sang "Đang giao" và xác nhận | D1 "Chờ lấy hàng" của Customer A, phân công cho Shipper A | Hệ thống hiển thị thông báo trong ứng dụng cho Customer A về thay đổi trạng thái của D1 | Phiên song song |
| TC-NFR-048 | `CI-1` | Customer A đang đăng nhập và đang ở màn hình Tạo đơn hàng (màn hình khác); Admin 1 phân công D1 (T2) | D1 "Chờ xác nhận" của Customer A; Admin 1; Shipper A | Hệ thống hiển thị thông báo trong ứng dụng cho Customer A ngay tại màn hình đang mở (bất kỳ màn hình nào) | Phiên song song |
| TC-NFR-049 | `CI-1` | Customer A đang đăng nhập; Shipper A đổi D1 hai lần liên tiếp, sang "Đang giao" rồi "Đã giao" | D1 "Chờ lấy hàng" của Customer A; Shipper A | Hệ thống hiển thị một thông báo cho mỗi lần đổi, tổng cộng hai thông báo | Phiên song song |
| TC-NFR-050 | `CI-1` | [Âm] Customer B đang đăng nhập; trạng thái D1 của Customer A đổi | D1 của Customer A; Customer B có đơn riêng | Customer B không nhận thông báo nào về D1 | Phiên song song |
| TC-NFR-051 | `DI-1` | [Âm] Customer A, Shipper A và Admin 1 lần lượt xem lịch sử trạng thái của D1 trên các màn hình hiển thị lịch sử và tìm thao tác sửa hoặc xóa bản ghi | D1 đã đi qua T2, T3, T4 (có bốn bản ghi lịch sử) | Không có thao tác sửa hay xóa bản ghi lịch sử ở màn hình nào, vì lịch sử chỉ được thêm (DI-1) | Phân vùng tương đương |
| TC-NFR-052 | `DI-1` | [Âm] Customer A, Shipper A và Admin 1 lần lượt gửi thẳng request sửa một bản ghi lịch sử (người đổi, thời điểm, trạng thái cũ hoặc trạng thái mới) | D1 có bốn bản ghi lịch sử; chụp lại bản ghi trước khi thử | Hệ thống từ chối từng request; bản ghi trong cơ sở dữ liệu không đổi | Request trực tiếp |
| TC-NFR-053 | `DI-1` | [Âm] Customer A, Shipper A và Admin 1 lần lượt gửi thẳng request xóa một bản ghi lịch sử | D1 có bốn bản ghi lịch sử | Hệ thống từ chối từng request; cả bốn bản ghi vẫn còn nguyên trong cơ sở dữ liệu | Request trực tiếp |
| TC-NFR-054 | `DI-1` | Shipper A đổi trạng thái D1 thêm một lần, rồi đọc lại lịch sử | D1 "Chờ lấy hàng" có hai bản ghi; Shipper A | Lịch sử có thêm đúng một bản ghi mới; các bản ghi cũ giữ nguyên nội dung | Chuyển trạng thái |
| TC-NFR-055 | `DI-2` | [Âm] Gửi thẳng request (bỏ qua giới hạn nhập ở giao diện), mỗi lần một trường vượt độ dài ở mục 4.2: email, họ tên, tên người nhận, địa chỉ giao, mô tả lý do, lý do từ chối, kết quả xử lý, mật khẩu; các trường khác hợp lệ | Biên «email (đăng ký)» · không hợp lệ #1; Biên «họ tên, tên người nhận» · không hợp lệ #3; Biên «địa chỉ giao» · không hợp lệ #3; Biên «mô tả lý do ("Khác"), lý do từ chối, kết quả xử lý» · không hợp lệ #3; Biên «mật khẩu» · không hợp lệ #2 | Hệ thống từ chối lưu và chỉ ra trường vượt độ dài; cơ sở dữ liệu không lưu chuỗi đó | Request trực tiếp |
| TC-NFR-056 | `DI-2` | [Âm] Nhập vào một trường (địa chỉ giao) một chuỗi dài hơn nhiều lần độ dài ở mục 4.2, không chỉ vượt một ký tự | Chuỗi dài gấp nhiều lần độ dài của «địa chỉ giao»; các trường khác như đơn cơ sở | Hệ thống từ chối lưu, chỉ ra trường vượt độ dài; không lưu bản cắt bớt của chuỗi trong cơ sở dữ liệu | Phân vùng tương đương |
| TC-NFR-057 | `OE-1` | Mở từng màn hình của UI-1 bằng địa chỉ web trong trình duyệt, không cài thêm phần mềm | Chrome cho máy tính; địa chỉ của hệ thống; chín màn hình ở UI-1 | Mọi màn hình mở và dùng được trong trình duyệt | Phân vùng tương đương |
| TC-NFR-058 | `OE-2` | Chạy bộ test hệ thống (đường chính của Customer, Shipper và Admin) trên Google Chrome cho máy tính, bản ổn định mới nhất tại thời điểm test; ghi số phiên bản Chrome | Chrome ổn định mới nhất; bộ test hệ thống ở mục 3.1 đến 3.5 | Mọi bước chạy đúng kết quả mong đợi ở các module, không có lỗi riêng do trình duyệt | Phân vùng tương đương |
| TC-NFR-059 | `CO-1` | Mở màn hình Chi tiết đơn hàng của Customer A và Bảng điều khiển của Admin 1, bật công cụ theo dõi request mạng của Chrome, không đổi trạng thái đơn nào trong khoảng quan sát | Customer A; Admin 1; D1; khoảng quan sát đủ dài để một chu kỳ tải lại, nếu có, xảy ra ít nhất hai lần | Không có request tải lại trang hay request lấy lại danh sách, trạng thái lặp lại theo chu kỳ | Phân vùng tương đương |
| TC-NFR-060 | `CO-1` | Giữ nguyên theo dõi request mạng ở phiên Customer A; ở phiên khác Shipper A đổi D1 sang "Đang giao" | D1 "Chờ lấy hàng"; Customer A; Shipper A | Màn hình của Customer A cập nhật theo sự kiện của thay đổi; trang không bị tải lại và không có request lặp lại theo chu kỳ | Phiên song song |
| TC-NFR-061 | `CO-2` | Mở các màn hình của ba vai trò, xem nhãn, nút, thông báo thành công và thông báo lỗi | Customer A; Shipper A; Admin 1 | Mọi nhãn, nút và thông báo hiển thị bằng tiếng Việt | Đối chiếu với SRS |
| TC-NFR-062 | `CO-2` | Xem tên trạng thái đơn hàng ở danh sách đơn, Chi tiết đơn hàng và Bảng điều khiển với đơn ở đủ chín trạng thái | Dữ liệu seed: đơn ở 9 trạng thái | Chín tên hiển thị đúng nguyên văn Hình A.2: "Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao", "Giao không thành công", "Đang hoàn hàng", "Đã hoàn về người bán", "Hư hỏng", "Thất lạc" | Đối chiếu với SRS |
| TC-NFR-063 | `CO-2` | Xem tên trạng thái yêu cầu hoàn hàng ở màn hình của Customer và danh sách của Admin, với yêu cầu ở đủ bốn trạng thái | Bốn yêu cầu hoàn hàng ở bốn trạng thái | Các tên trạng thái hiển thị đúng nguyên văn Hình A.2: "Chờ duyệt", "Đã chấp nhận", "Bị từ chối", "Hoàn tất" | Đối chiếu với SRS |
| TC-NFR-064 | `CO-2` | Mở danh sách lý do hoàn hàng ở màn hình Yêu cầu hoàn hàng | Customer A; D1 "Đã giao" | Ba lý do hiển thị đúng nguyên văn BR-04: "Hàng lỗi / hư hỏng", "Chưa nhận được hàng", "Khác" | Đối chiếu với SRS |
| TC-NFR-065 | `CO-2` | Mở danh sách loại sự cố khi Shipper báo sự cố, và xem loại sự cố ở danh sách sự cố của Admin | Shipper A; D1 "Đang giao"; Admin 1 | Ba loại hiển thị đúng nguyên văn Issue.Report.Type: "Hàng hỏng", "Giao không thành công", "Thất lạc" | Đối chiếu với SRS |
| TC-NFR-066 | `CO-2` | Xem tên của chín màn hình ở UI-1 khi mở từng màn hình bằng đúng vai trò | Chưa đăng nhập; Customer A; Admin 1; Shipper A | Tên màn hình hiển thị đúng nguyên văn UI-1: Đăng nhập, Đăng ký, Trang chủ Customer, Tạo đơn hàng, Chi tiết đơn hàng, Yêu cầu hoàn hàng, Theo dõi vận chuyển, Bảng điều khiển Admin, Màn hình giao hàng của Shipper | Đối chiếu với SRS |

### 3.7 BCT – Business Cycle Testing

BCT kiểm quy tắc nghiệp vụ BR-01 đến BR-07 trên toàn vòng đời đơn và yêu cầu hoàn hàng, bằng năm công cụ ở Test Plan mục 3.1.2: (a) ma trận 9 × 9, (b) ma trận 4 × 4, (c) hai bảng quyết định, (d) năm vòng đời, (e) bảng quy tắc nghiệp vụ. Hai ma trận và hai bảng quyết định nằm ở Test Plan mục 3.1.2; tài liệu này chỉ dẫn tới, không chép lại.

**Quy tắc DRY.** Chỉ thêm một dòng BCT cho điều kiện chưa dòng nào ở mục 3.1 đến 3.6 thiết kế. Điều kiện đã có dòng thì ghi tên dòng đó ở các bảng «Dòng đã phủ» bên dưới và không thêm dòng mới.

**Cột Mã SRS.** Công cụ kiểm tra chỉ nhận 93 mã SRS ở cột này, nên dòng BCT ghi mã SRS của bước kiểm (ví dụ `Track.Update.Valid`) và ghi mã quy tắc nghiệp vụ (BR-01, BR-05, BR-06, BR-07) ngay trong cột Điều kiện test.

**Ma trận (a), 10 hàng.** Mỗi hàng trạng thái nguồn có hai dòng: một dòng giao diện (không có nút cho ô «chặn») và một dòng request (request gửi thẳng tới đích «chặn» phải bị từ chối kèm lý do). Dòng request chỉ thử các ô «chặn» chưa có dòng riêng; các ô đã có dòng riêng được ghi ở cột Dữ liệu. Phía Shipper của ba hàng «Chờ lấy hàng», «Đang giao», «Giao không thành công» đã có TC-TRK-011 đến TC-TRK-016, nên dòng giao diện của các hàng này chỉ kiểm phía Admin. Ba hàng cuối là trạng thái kết thúc, nên cả chín ô đều chặn.

**Ma trận (b), 5 hàng.** Dòng giao diện của bốn hàng «Chờ duyệt», «Đã chấp nhận», «Bị từ chối», «Hoàn tất» đã có ở TC-RET-057 đến TC-RET-060. Hàng «(bắt đầu)» chưa có dòng giao diện, nên BCT thêm dòng. Dòng request cũng chỉ thêm cho các ô chưa có dòng; hàng «Đã chấp nhận» đã đủ (bảng bên dưới).

**Vòng đời (d).** Chín dòng: vòng 1, vòng 2, vòng 3, ba nhánh của vòng 4, hai lý do cộng một nhánh từ chối của vòng 5. Hai mốc hạn của vòng 5 nằm ở bảng «Dòng đã phủ». Cách dựng trạng thái nhiều lần giao không thành công là dữ liệu seed hoặc script dựng sẵn (Test Plan mục 3.1.2, lưu ý đặc biệt).

| TC | Mã SRS | Điều kiện test | Dữ liệu | Kết quả mong đợi | Kỹ thuật |
|---|---|---|---|---|---|
| TC-BCT-001 | `Track.Update.Valid` | [Âm] Hàng «(bắt đầu)» của ma trận (a): Customer A mở màn hình Tạo đơn hàng và tạo một đơn | Customer A; đơn cơ sở | Đơn mới vào "Chờ xác nhận" (T1); giao diện không có lựa chọn đặt đơn ở trạng thái đích nào khác trong tám trạng thái còn lại (BR-01) | Chuyển trạng thái |
| TC-BCT-002 | `Track.Update.Valid` | [Âm] Hàng «(bắt đầu)» của ma trận (a): Customer A gửi thẳng request tạo đơn kèm trạng thái đích khác "Chờ xác nhận", lần lượt từng trạng thái trong tám trạng thái còn lại | Customer A; đơn cơ sở; tám request | Hệ thống không lưu đơn ở trạng thái nào ngoài "Chờ xác nhận": từ chối request kèm lý do (Track.Update.Valid), hoặc nếu vẫn tạo đơn thì đơn ở "Chờ xác nhận" (T1) | Request trực tiếp |
| TC-BCT-003 | `Track.Update.Valid` | [Âm] Hàng «Chờ xác nhận» của ma trận (a): Admin 1 mở đơn D1 trong Bảng điều khiển | D1 "Chờ xác nhận"; Admin 1 | Giao diện chỉ có thao tác phân công (T2); không có thao tác nào cho tám ô chặn của hàng (BR-01) | Chuyển trạng thái |
| TC-BCT-004 | `Track.Update.Valid` | [Âm] Hàng «Chờ xác nhận» của ma trận (a): Admin 1 gửi thẳng request chuyển D1 sang từng trạng thái ở tám ô chặn của hàng, kể cả giữ nguyên "Chờ xác nhận" | D1 "Chờ xác nhận"; Admin 1; tám request | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Chờ xác nhận"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-005 | `Track.Update.Valid` | [Âm] Hàng «Chờ lấy hàng» của ma trận (a): Admin 1 mở đơn D1 trong Bảng điều khiển (phía Shipper A: TC-TRK-011) | D1 "Chờ lấy hàng" phân công cho Shipper A; Admin 1 | Admin 1 không có thao tác chuyển trạng thái nào cho D1, vì T3 là bước của Shipper (BR-01) | Chuyển trạng thái |
| TC-BCT-006 | `Track.Update.Valid` | [Âm] Hàng «Chờ lấy hàng» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang các ô chặn chưa có TC riêng: "Chờ xác nhận", "Giao không thành công", "Đang hoàn hàng", "Đã hoàn về người bán", "Hư hỏng" | D1 "Chờ lấy hàng" phân công cho Shipper A; ô đã có TC riêng, không thử lại: "Đã giao" (TC-TRK-026), "Chờ lấy hàng" (TC-TRK-044), "Thất lạc" (TC-ISS-045) | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Chờ lấy hàng"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-007 | `Track.Update.Valid` | [Âm] Hàng «Đang giao» của ma trận (a): Admin 1 mở đơn D1 trong Bảng điều khiển (phía Shipper A: TC-TRK-012) | D1 "Đang giao" phân công cho Shipper A; Admin 1 | Admin 1 chỉ có thao tác xác nhận thất lạc (T10, luồng 7.1); không có thao tác của Shipper (T4, T5, T9) và không có thao tác cho năm ô chặn của hàng (BR-01) | Chuyển trạng thái |
| TC-BCT-008 | `Track.Update.Valid` | [Âm] Hàng «Đang giao» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang các ô chặn chưa có TC riêng: "Chờ xác nhận", "Chờ lấy hàng", giữ nguyên "Đang giao" | D1 "Đang giao" phân công cho Shipper A; ô đã có TC riêng, không thử lại: "Đang hoàn hàng" (TC-ISS-036), "Đã hoàn về người bán" (TC-ISS-041) | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Đang giao"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-009 | `Track.Update.Valid` | [Âm] Hàng «Đã giao» của ma trận (a): Admin 1 mở đơn D1 trong Bảng điều khiển (phía Shipper A: TC-TRK-016) | D1 "Đã giao"; Admin 1 | Admin 1 chỉ có hai bước chuyển T11, T12, và chỉ đi qua việc chấp nhận yêu cầu hoàn hàng; không có thao tác đổi trạng thái trực tiếp cho bảy ô chặn của hàng (BR-01) | Chuyển trạng thái |
| TC-BCT-010 | `Track.Update.Valid` | [Âm] Hàng «Đã giao» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang các ô chặn chưa có TC riêng: "Chờ xác nhận", giữ nguyên "Đã giao", "Giao không thành công", "Đang hoàn hàng", "Đã hoàn về người bán" | D1 "Đã giao"; ô đã có TC riêng, không thử lại: "Chờ lấy hàng" (TC-TRK-045), "Đang giao" (TC-TRK-025) | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Đã giao"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-011 | `Track.Update.Valid` | [Âm] Hàng «Giao không thành công» của ma trận (a): Admin 1 mở đơn D1 đã đủ số lần giao không thành công (phía Shipper A: TC-TRK-013 đến TC-TRK-015) | D1 "Giao không thành công", Biên «số lần giao không thành công» · không hợp lệ #1; Admin 1 | Admin 1 chỉ có thao tác chuyển sang "Đang hoàn hàng" (T7); không có thao tác cho các ô chặn của hàng (BR-01) | Chuyển trạng thái |
| TC-BCT-012 | `Track.Update.Valid` | [Âm] Hàng «Giao không thành công» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang các ô chặn chưa có TC riêng: "Chờ xác nhận", "Chờ lấy hàng", giữ nguyên "Giao không thành công", "Đã giao", "Hư hỏng" | D1 "Giao không thành công" phân công cho Shipper A; ô đã có TC riêng, không thử lại: "Đã hoàn về người bán" (TC-ISS-040), "Thất lạc" (TC-ISS-046) | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Giao không thành công"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-013 | `Track.Update.Valid` | [Âm] Hàng «Đang hoàn hàng» của ma trận (a): Admin 1 và Shipper A lần lượt mở đơn D1 (phần xác nhận đã nhận lại hàng: TC-ISS-037) | D1 "Đang hoàn hàng" phân công cho Shipper A; Admin 1 | Admin 1 chỉ có thao tác xác nhận đã nhận lại hàng (T8); Shipper A không có trạng thái kế tiếp nào cho D1; không có thao tác cho tám ô chặn của hàng (BR-01) | Chuyển trạng thái |
| TC-BCT-014 | `Track.Update.Valid` | [Âm] Hàng «Đang hoàn hàng» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang từng ô chặn: "Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao", "Giao không thành công", giữ nguyên "Đang hoàn hàng", "Hư hỏng", "Thất lạc" | D1 "Đang hoàn hàng" phân công cho Shipper A; tám request cho mỗi vai trò | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Đang hoàn hàng"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-015 | `Track.Update.Valid` | [Âm] Hàng «Đã hoàn về người bán» của ma trận (a): Admin 1, Shipper A và Customer A lần lượt mở đơn D1 | D1 "Đã hoàn về người bán" (trạng thái kết thúc); Admin 1; Shipper A; Customer A | Không vai trò nào có thao tác đổi trạng thái của D1; cả chín ô của hàng đều chặn (BR-01) | Chuyển trạng thái |
| TC-BCT-016 | `Track.Update.Valid` | [Âm] Hàng «Đã hoàn về người bán» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang tám trạng thái khác "Đã hoàn về người bán" | D1 "Đã hoàn về người bán"; ô đã có TC riêng, không thử lại: giữ nguyên "Đã hoàn về người bán" (TC-ISS-042) | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Đã hoàn về người bán"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-017 | `Track.Update.Valid` | [Âm] Hàng «Hư hỏng» của ma trận (a): Admin 1, Shipper A và Customer A lần lượt mở đơn D1 | D1 "Hư hỏng" (trạng thái kết thúc); Admin 1; Shipper A; Customer A | Không vai trò nào có thao tác đổi trạng thái của D1; cả chín ô của hàng đều chặn (BR-01) | Chuyển trạng thái |
| TC-BCT-018 | `Track.Update.Valid` | [Âm] Hàng «Hư hỏng» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang từng trạng thái trong chín trạng thái, kể cả giữ nguyên "Hư hỏng" | D1 "Hư hỏng"; chín request cho mỗi vai trò | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Hư hỏng"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-019 | `Track.Update.Valid` | [Âm] Hàng «Thất lạc» của ma trận (a): Admin 1, Shipper A và Customer A lần lượt mở đơn D1 | D1 "Thất lạc" (trạng thái kết thúc); Admin 1; Shipper A; Customer A | Không vai trò nào có thao tác đổi trạng thái của D1; cả chín ô của hàng đều chặn (BR-01) | Chuyển trạng thái |
| TC-BCT-020 | `Track.Update.Valid` | [Âm] Hàng «Thất lạc» của ma trận (a): Admin 1 và Shipper A lần lượt gửi thẳng request chuyển D1 sang từng trạng thái trong chín trạng thái, kể cả giữ nguyên "Thất lạc" | D1 "Thất lạc"; chín request cho mỗi vai trò | Hệ thống từ chối từng request kèm lý do (Track.Update.Valid); D1 vẫn ở "Thất lạc"; lịch sử không thêm bản ghi | Request trực tiếp |
| TC-BCT-021 | `Return.Review.Valid` | [Âm] Hàng «(bắt đầu)» của ma trận (b): Customer A mở màn hình Yêu cầu hoàn hàng và gửi một yêu cầu mới | D1 "Đã giao" của Customer A, còn trong thời hạn | Yêu cầu mới vào "Chờ duyệt" (R1); giao diện không có lựa chọn đặt yêu cầu mới ở "Đã chấp nhận", "Bị từ chối" hay "Hoàn tất" (BR-01) | Chuyển trạng thái |
| TC-BCT-022 | `Return.Review.Valid` | [Âm] Hàng «(bắt đầu)» của ma trận (b): Customer A gửi thẳng request yêu cầu hoàn hàng kèm trạng thái đích "Đã chấp nhận", "Bị từ chối" hoặc "Hoàn tất", mỗi lần một request | D1 "Đã giao" của Customer A, còn trong thời hạn; ba request | Hệ thống không lưu yêu cầu ở ba trạng thái đó: từ chối kèm lý do (Return.Review.Valid), hoặc nếu vẫn tạo yêu cầu thì yêu cầu ở "Chờ duyệt" (R1) | Request trực tiếp |
| TC-BCT-023 | `Return.Review.Valid` | [Âm] Hàng «Chờ duyệt» của ma trận (b): Admin 1 gửi thẳng request chuyển yêu cầu từ "Chờ duyệt" về "Chờ duyệt" (giao diện của hàng: TC-RET-057) | Yêu cầu "Chờ duyệt"; Admin 1; ô đã có TC riêng, không thử lại: "Hoàn tất" (TC-RET-061) | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do (Return.Review.Valid); yêu cầu vẫn ở "Chờ duyệt" | Request trực tiếp |
| TC-BCT-024 | `Return.Review.Valid` | [Âm] Hàng «Bị từ chối» của ma trận (b): Admin 1 gửi thẳng request chuyển yêu cầu từ "Bị từ chối" về "Bị từ chối", kèm lý do từ chối hợp lệ (giao diện của hàng: TC-RET-059) | Yêu cầu "Bị từ chối"; Admin 1; ô đã có TC riêng, không thử lại: "Hoàn tất" (TC-RET-062), "Chờ duyệt" (TC-RET-065), "Đã chấp nhận" (TC-RET-100) | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do (Return.Review.Valid); yêu cầu vẫn ở "Bị từ chối" | Request trực tiếp |
| TC-BCT-025 | `Return.Review.Valid` | [Âm] Hàng «Hoàn tất» của ma trận (b): Admin 1 gửi thẳng request chuyển yêu cầu từ "Hoàn tất" sang "Đã chấp nhận" (giao diện của hàng: TC-RET-060) | Yêu cầu "Hoàn tất"; Admin 1; ô đã có TC riêng, không thử lại: "Hoàn tất" (TC-RET-063), "Chờ duyệt" (TC-RET-066), "Bị từ chối" (TC-RET-099) | Hệ thống từ chối bước chuyển không có trên Hình A.2 và báo lý do (Return.Review.Valid); yêu cầu vẫn ở "Hoàn tất" | Request trực tiếp |
| TC-BCT-026 | `Track.Update.Valid` | Vòng đời 1 (giao thành công): Customer A tạo đơn (T1); Admin 1 phân công (T2); Shipper A chuyển sang "Đang giao" (T3) rồi "Đã giao" (T4); sau mỗi bước xem lịch sử trạng thái (BR-01, BR-07) | Đơn cơ sở; Customer A; Admin 1; Shipper A | Đơn đi đúng "Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao"; lịch sử có đúng bốn bản ghi (người đổi lần lượt Customer A, Admin 1, Shipper A, Shipper A; trạng thái cũ của bản ghi sau là trạng thái mới của bản ghi trước; bản ghi đầu có trạng thái cũ để trống); không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-027 | `Track.Update.Next` | Vòng đời 2 (giao lại rồi thành công): T1, T2, T3; Shipper A báo "Giao không thành công" (T5) rồi giao lại (T6), hai lần liên tiếp; sau lần giao lại thứ hai Shipper A xác nhận giao thành công (T4); sau mỗi bước xem lịch sử (BR-01, BR-06, BR-07) | Đơn cơ sở; Customer A; Admin 1; Shipper A; Biên «số lần giao không thành công» · hợp lệ #1 và hợp lệ #2 | Đơn đi qua T1, T2, T3, T5, T6, T5, T6, T4 và kết thúc ở "Đã giao"; mỗi lần T6 đều hợp lệ vì số lần giao không thành công chưa đạt giới hạn; lịch sử có đúng tám bản ghi, đúng người đổi, trạng thái cũ và mới; không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-028 | `Issue.Resolve.Return` | Vòng đời 3 (trả lại): T1, T2, T3; Shipper A báo "Giao không thành công" (T5) rồi giao lại (T6) hai lần, rồi báo "Giao không thành công" lần thứ ba (T5); Admin 1 chuyển sang "Đang hoàn hàng" (T7), ghi kết quả xử lý sự cố, rồi xác nhận đã nhận lại hàng (T8); sau mỗi bước xem lịch sử (BR-01, BR-06, BR-07) | Đơn cơ sở; Customer A; Admin 1; Shipper A; Biên «số lần giao không thành công» · hợp lệ #1, hợp lệ #2 rồi không hợp lệ #1 | Đơn đi qua T1, T2, T3, T5, T6, T5, T6, T5, T7, T8 và kết thúc ở "Đã hoàn về người bán"; sau lần thứ ba T6 bị chặn và T7 hợp lệ; lịch sử có đúng mười bản ghi với đúng người đổi, trạng thái cũ và mới; Admin chỉ ghi nhận kết quả xử lý, không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-029 | `Issue.Report.Status` | Vòng đời 4a (hỏng khi giao, do Shipper): T1, T2, T3; Shipper A báo sự cố loại "Hàng hỏng" (T9); xem lịch sử và thử đổi trạng thái tiếp (BR-01, BR-07) | Đơn cơ sở; Customer A; Admin 1; Shipper A | Đơn kết thúc ở "Hư hỏng"; lịch sử có đúng bốn bản ghi (T1, T2, T3, T9) với đúng người đổi, trạng thái cũ và mới; không còn bước chuyển nào từ "Hư hỏng"; không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-030 | `Issue.Report.Status` | Vòng đời 4b (thất lạc khi giao, do Shipper): T1, T2, T3; Shipper A báo sự cố loại "Thất lạc" (T10); xem lịch sử và thử đổi trạng thái tiếp (BR-01, BR-07) | Đơn cơ sở; Customer A; Admin 1; Shipper A | Đơn kết thúc ở "Thất lạc"; lịch sử có đúng bốn bản ghi (T1, T2, T3, T10), người đổi bản ghi cuối là Shipper A; không còn bước chuyển nào từ "Thất lạc"; không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-031 | `Issue.Resolve.LostStatus` | Vòng đời 4c (thất lạc khi giao, do Admin xác nhận): T1, T2, T3; Admin 1 xác nhận thất lạc ở luồng 7.1 (T10); xem lịch sử và thử đổi trạng thái tiếp (BR-01, BR-07) | Đơn cơ sở; Customer A; Admin 1; Shipper A | Đơn kết thúc ở "Thất lạc"; lịch sử có đúng bốn bản ghi (T1, T2, T3, T10), người đổi bản ghi cuối là Admin 1 (khác vòng đời 4b); không còn bước chuyển nào từ "Thất lạc"; không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-032 | `Return.Review.OrderStatus` | Vòng đời 5a (hoàn hàng, lý do "Hàng lỗi / hư hỏng"): đơn đi tới "Đã giao" (T1 đến T4); Customer A gửi yêu cầu (R1); Admin 1 chấp nhận (R2) và đơn sang "Hư hỏng" (T11); Admin 1 ghi nhận hoàn tất (R4); sau mỗi bước xem lịch sử đơn và trạng thái yêu cầu (BR-01, BR-05, BR-07) | Đơn cơ sở đã giao; Customer A; Admin 1; Shipper A; mốc hạn hoàn hàng: xem bảng «Dòng đã phủ» | Yêu cầu đi "Chờ duyệt", "Đã chấp nhận", "Hoàn tất"; đơn kết thúc ở "Hư hỏng"; lịch sử đơn có đúng năm bản ghi (T1, T2, T3, T4, T11), bản ghi cuối do Admin 1; không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-033 | `Return.Review.OrderStatus` | Vòng đời 5b (hoàn hàng, lý do "Chưa nhận được hàng"): đơn đi tới "Đã giao"; Customer A gửi yêu cầu (R1); Admin 1 chấp nhận (R2) và đơn sang "Thất lạc" (T12); Admin 1 ghi nhận hoàn tất (R4); sau mỗi bước xem lịch sử (BR-01, BR-05, BR-07) | Đơn cơ sở đã giao; Customer A; Admin 1; Shipper A | Yêu cầu đi "Chờ duyệt", "Đã chấp nhận", "Hoàn tất"; đơn kết thúc ở "Thất lạc"; lịch sử đơn có đúng năm bản ghi (T1, T2, T3, T4, T12); không có thao tác hay trường nào xử lý tiền | Vòng đời |
| TC-BCT-034 | `Return.Review.Reject` | Vòng đời 5c (hoàn hàng bị từ chối): đơn đi tới "Đã giao"; Customer A gửi yêu cầu (R1); Admin 1 từ chối kèm lý do từ chối (R3); Customer A xem yêu cầu (BR-01, BR-05) | Đơn cơ sở đã giao; Customer A; Admin 1; Shipper A | Yêu cầu đi "Chờ duyệt", "Bị từ chối" kèm lý do từ chối; đơn vẫn ở "Đã giao"; lịch sử đơn chỉ có bốn bản ghi (T1 đến T4), không có bản ghi mới | Vòng đời |

**Quy tắc nghiệp vụ → TC** (thứ tự của Test Plan mục 3.1.2(e); sinh từ các dòng ở mục 3 có nhắc BR-xx, cộng các TC đã được các bảng «Dòng đã phủ» dẫn tới; không sửa tay).

| Quy tắc | TC |
|---|---|
| BR-01 | TC-TRK-025 đến TC-TRK-027, TC-TRK-043 đến TC-TRK-045, TC-RET-057 đến TC-RET-066, TC-RET-095 đến TC-RET-100, TC-ISS-036, TC-ISS-040 đến TC-ISS-042, TC-ISS-045, TC-ISS-046, TC-BCT-001 đến TC-BCT-034 |
| BR-02 | TC-RET-002, TC-RET-067 đến TC-RET-074 |
| BR-03 | TC-RET-003 đến TC-RET-006, TC-RET-077 |
| BR-04 | TC-RET-007 đến TC-RET-011, TC-RET-013, TC-RET-080 đến TC-RET-082, TC-RET-086, TC-NFR-064 |
| BR-05 | TC-RET-036 đến TC-RET-038, TC-RET-045 đến TC-RET-051, TC-BCT-032 đến TC-BCT-034 |
| BR-06 | TC-TRK-013 đến TC-TRK-015, TC-TRK-023, TC-TRK-024, TC-TRK-027, TC-ISS-010, TC-ISS-018 đến TC-ISS-020, TC-ISS-033, TC-ISS-035, TC-ISS-061 đến TC-ISS-070, TC-BCT-027, TC-BCT-028 |
| BR-07 | TC-RET-056, TC-ISS-053, TC-ISS-054, TC-BCT-026 đến TC-BCT-033 |

**Dòng đã phủ: bảng quyết định UC-06** (Test Plan mục 3.1.2(c), bảng thứ nhất).

| Dòng quyết định | TC đã phủ |
|---|---|
| Lý do "Hàng lỗi / hư hỏng", Admin chấp nhận: yêu cầu "Đã chấp nhận" (R2), đơn sang "Hư hỏng" (T11) | TC-RET-036, TC-RET-047, TC-RET-050 |
| Lý do "Chưa nhận được hàng", Admin chấp nhận: R2, đơn sang "Thất lạc" (T12) | TC-RET-037, TC-RET-048, TC-RET-051 |
| Lý do "Khác", Admin chấp nhận: R2, đơn không đổi | TC-RET-038, TC-RET-049 |
| Bất kỳ lý do, Admin từ chối: "Bị từ chối" (R3), đơn không đổi | TC-RET-039, TC-RET-045, TC-RET-046 |
| Bất kỳ lý do, Admin ghi nhận hoàn tất: "Hoàn tất" (R4), đơn không đổi | TC-RET-053, TC-RET-054, TC-RET-055 |
| Chấp nhận, từ chối hoặc hoàn tất khi yêu cầu không ở trạng thái tương ứng: không đổi, báo lý do | TC-RET-061, TC-RET-095 đến TC-RET-100 |

**Dòng đã phủ: bảng quyết định UC-07** (Test Plan mục 3.1.2(c), bảng thứ hai).

| Dòng quyết định | TC đã phủ |
|---|---|
| Sự cố "Giao không thành công", đơn "Giao không thành công", đạt giới hạn: Admin chuyển "Đang hoàn hàng" (T7) rồi ghi kết quả | TC-ISS-033, TC-ISS-063 |
| Như trên nhưng chưa chuyển "Đang hoàn hàng": ghi kết quả bị từ chối | TC-ISS-061, TC-ISS-062 |
| Sự cố "Giao không thành công", chưa đạt giới hạn: ghi kết quả; chuyển trả lại bị 7.0.E1 từ chối | TC-ISS-064, TC-ISS-035, TC-ISS-067 đến TC-ISS-069 |
| Sự cố "Giao không thành công", đơn không còn "Giao không thành công": ghi kết quả | TC-ISS-065, TC-ISS-066 |
| Sự cố "Hàng hỏng" hoặc "Thất lạc": ghi kết quả | TC-ISS-053, TC-ISS-059, TC-ISS-060 |

**Dòng đã phủ: giá trị biên BR-06** (giới hạn 3 lần; bảng biên chung, dòng «số lần giao không thành công»).

| Biên | TC đã phủ |
|---|---|
| Sau sự cố thứ 1: T6 hợp lệ | TC-TRK-013, TC-TRK-023, TC-ISS-018 |
| Sau sự cố thứ 2: T6 hợp lệ | TC-TRK-014, TC-TRK-024, TC-ISS-019 |
| Khi mới có 2 sự cố: T7 bị 7.0.E1 từ chối | TC-ISS-035, TC-ISS-067, TC-ISS-068 |
| Sau sự cố thứ 3: T6 bị chặn | TC-TRK-015, TC-ISS-020 |
| Sau sự cố thứ 3: T7 hợp lệ | TC-ISS-033, TC-ISS-070 |
| Gửi thẳng T6 khi đã đủ 3 lần | TC-TRK-027 |

**Dòng đã phủ: BR-02, BR-03, BR-04 và hai mốc hạn của vòng 5.**

| Quy tắc hoặc mốc | TC đã phủ |
|---|---|
| BR-02: gửi yêu cầu hoàn hàng với đơn ở tám trạng thái khác "Đã giao" | TC-RET-002, TC-RET-067 đến TC-RET-074 |
| BR-03 và vòng 5, ngay trước mốc hết hạn (hợp lệ) | TC-RET-003 |
| BR-03 và vòng 5, đúng mốc hết hạn (hợp lệ) | TC-RET-004 |
| BR-03 và vòng 5, sau mốc hết hạn (bị từ chối) | TC-RET-005, TC-RET-077 |
| BR-04: đủ ba lý do, gửi không chọn lý do, chọn "Khác" mà không có mô tả | TC-RET-007 đến TC-RET-011, TC-RET-080 đến TC-RET-082, TC-RET-086 |
| BR-07: Admin chỉ ghi nhận kết quả, không xử lý tiền | TC-RET-056, TC-ISS-053 (ngoài các dòng vòng đời ở trên) |

**Dòng đã phủ: ma trận (b)** (Test Plan mục 3.1.2(b)).

| Hàng trạng thái nguồn | TC giao diện | TC request cho các ô chặn đã phủ |
|---|---|---|
| Chờ duyệt | TC-RET-057 | TC-RET-061 (sang "Hoàn tất") |
| Đã chấp nhận | TC-RET-058 | TC-RET-064 (về "Chờ duyệt"), TC-RET-098 (giữ nguyên), TC-RET-096 (sang "Bị từ chối") |
| Bị từ chối | TC-RET-059 | TC-RET-062, TC-RET-065, TC-RET-100 |
| Hoàn tất | TC-RET-060 | TC-RET-063, TC-RET-066, TC-RET-099 |

## 4 Ma trận truy vết

Ma trận dưới đây sinh tự động từ các bảng ở mục 3 (mỗi dòng bảng đóng góp mã SRS ở cột 2 và mã TC ở cột 1); không sửa tay. Mã SRS xếp theo thứ tự xuất hiện ở mục 3. Dải liên tiếp ghi dạng "TC-X-001 đến TC-X-004". Ma trận gồm 93 mã SRS, mỗi mã có ít nhất một TC.

Quy tắc nghiệp vụ BR-01 đến BR-07 không có dòng riêng ở bảng dưới (cột Mã SRS chỉ nhận mã SRS); BR → TC: xem bảng ở mục 3.7.

Số TC theo module: ORD 55; TRK 48; RET 100; ISS 70; ACC 50; NFR 66; BCT 34; tổng 423.

| Mã SRS | TC |
|---|---|
| `Order.Create.Product` | TC-ORD-001 đến TC-ORD-004 |
| `Order.Create.Quantity` | TC-ORD-005 đến TC-ORD-007 |
| `Order.Create.Receiver` | TC-ORD-008 đến TC-ORD-010 |
| `Order.Create.Phone` | TC-ORD-011, TC-ORD-012 |
| `Order.Create.Address` | TC-ORD-013 đến TC-ORD-015 |
| `Order.Create.Required` | TC-ORD-016 đến TC-ORD-022 |
| `Order.Create.Format` | TC-ORD-023 đến TC-ORD-030 |
| `Order.Confirm.Display` | TC-ORD-031, TC-ORD-032 |
| `Order.Confirm.Prompt` | TC-ORD-033 đến TC-ORD-036 |
| `Order.Done.Store` | TC-ORD-037 đến TC-ORD-039 |
| `Order.Done.History` | TC-ORD-040, TC-ORD-041 |
| `Order.Done.Success` | TC-ORD-042 |
| `Order.Done.Failure` | TC-ORD-043 đến TC-ORD-045 |
| `Order.Done.Reason` | TC-ORD-046, TC-ORD-047 |
| `1.0.E1` | TC-ORD-048 đến TC-ORD-053 |
| `1.0.E2` | TC-ORD-054, TC-ORD-055 |
| `Track.Assign.List` | TC-TRK-001, TC-TRK-002 |
| `Track.Assign.Shipment` | TC-TRK-003, TC-TRK-004 |
| `Track.Assign.Shipper` | TC-TRK-005, TC-TRK-006 |
| `Track.Assign.Status` | TC-TRK-007, TC-TRK-008 |
| `Track.Update.List` | TC-TRK-009, TC-TRK-010 |
| `Track.Update.Next` | TC-TRK-011 đến TC-TRK-016, TC-BCT-027 |
| `Track.Update.Confirm` | TC-TRK-017 đến TC-TRK-020 |
| `Track.Update.Status` | TC-TRK-021 đến TC-TRK-024 |
| `Track.Update.Valid` | TC-TRK-025 đến TC-TRK-027, TC-BCT-001 đến TC-BCT-020, TC-BCT-026 |
| `Track.Update.History` | TC-TRK-028 đến TC-TRK-032 |
| `Track.View.List` | TC-TRK-033 đến TC-TRK-035 |
| `Track.View.Current` | TC-TRK-036, TC-TRK-037 |
| `Track.View.History` | TC-TRK-038 đến TC-TRK-040 |
| `Track.Admin.List` | TC-TRK-041, TC-TRK-042 |
| `2.0.E1` | TC-TRK-043 đến TC-TRK-045 |
| `4.0.E1` | TC-TRK-046 đến TC-TRK-048 |
| `Return.Request.Eligible` | TC-RET-001, TC-RET-002 |
| `Return.Request.Window` | TC-RET-003 đến TC-RET-006 |
| `Return.Request.Reason` | TC-RET-007 đến TC-RET-013 |
| `Return.Request.Store` | TC-RET-014 đến TC-RET-017 |
| `Return.View.Status` | TC-RET-018 đến TC-RET-027 |
| `Return.Review.List` | TC-RET-028 đến TC-RET-035 |
| `Return.Review.Approve` | TC-RET-036 đến TC-RET-038 |
| `Return.Review.Reject` | TC-RET-039 đến TC-RET-046, TC-BCT-034 |
| `Return.Review.OrderStatus` | TC-RET-047 đến TC-RET-052, TC-BCT-032, TC-BCT-033 |
| `Return.Review.Complete` | TC-RET-053 đến TC-RET-056 |
| `Return.Review.Valid` | TC-RET-057 đến TC-RET-066, TC-BCT-021 đến TC-BCT-025 |
| `5.0.E1` | TC-RET-067 đến TC-RET-076 |
| `5.0.E2` | TC-RET-077 đến TC-RET-079 |
| `5.0.E3` | TC-RET-080 đến TC-RET-086 |
| `5.0.E4` | TC-RET-087 đến TC-RET-094 |
| `6.0.E1` | TC-RET-095 đến TC-RET-100 |
| `Issue.Report.Type` | TC-ISS-001 đến TC-ISS-005 |
| `Issue.Report.Store` | TC-ISS-006 đến TC-ISS-010 |
| `Issue.Report.Status` | TC-ISS-011 đến TC-ISS-013, TC-BCT-029, TC-BCT-030 |
| `3.0.E1` | TC-ISS-014 đến TC-ISS-017 |
| `3.0.E2` | TC-ISS-018 đến TC-ISS-023 |
| `3.0.E3` | TC-ISS-024 đến TC-ISS-027 |
| `Issue.Resolve.List` | TC-ISS-028 đến TC-ISS-032 |
| `Issue.Resolve.Return` | TC-ISS-033 đến TC-ISS-036, TC-BCT-028 |
| `Issue.Resolve.Returned` | TC-ISS-037 đến TC-ISS-042 |
| `Issue.Resolve.Lost` | TC-ISS-043 đến TC-ISS-047 |
| `Issue.Resolve.LostStore` | TC-ISS-048 đến TC-ISS-050 |
| `Issue.Resolve.LostStatus` | TC-ISS-051, TC-ISS-052, TC-BCT-031 |
| `Issue.Resolve.Result` | TC-ISS-053 đến TC-ISS-066 |
| `7.0.E1` | TC-ISS-067 đến TC-ISS-070 |
| `Account.Register.Fields` | TC-ACC-001 đến TC-ACC-003 |
| `Account.Register.Required` | TC-ACC-004 đến TC-ACC-014 |
| `Account.Register.Email` | TC-ACC-015 đến TC-ACC-018 |
| `Account.Register.Unique` | TC-ACC-019 đến TC-ACC-025 |
| `Account.Register.Password` | TC-ACC-026 đến TC-ACC-030 |
| `Account.Register.Phone` | TC-ACC-031 đến TC-ACC-036 |
| `Account.Register.Role` | TC-ACC-037 đến TC-ACC-039 |
| `Account.Login.Credentials` | TC-ACC-040 đến TC-ACC-045 |
| `Account.Login.Fail` | TC-ACC-046 đến TC-ACC-050 |
| `RT-1` | TC-NFR-001 đến TC-NFR-003 |
| `RT-2` | TC-NFR-004, TC-NFR-005 |
| `SEC-1` | TC-NFR-006 đến TC-NFR-008 |
| `SEC-2` | TC-NFR-009 đến TC-NFR-011 |
| `SEC-3` | TC-NFR-012 đến TC-NFR-014 |
| `SEC-4` | TC-NFR-015 đến TC-NFR-017 |
| `SEC-5` | TC-NFR-018 đến TC-NFR-020 |
| `SEC-6` | TC-NFR-021 đến TC-NFR-023 |
| `SEC-7` | TC-NFR-024 đến TC-NFR-026 |
| `SEC-8` | TC-NFR-027 đến TC-NFR-029 |
| `SEC-9` | TC-NFR-030 đến TC-NFR-032 |
| `SEC-10` | TC-NFR-033, TC-NFR-034 |
| `SEC-11` | TC-NFR-035 |
| `ROB-1` | TC-NFR-036, TC-NFR-037 |
| `UI-1` | TC-NFR-038 đến TC-NFR-046 |
| `CI-1` | TC-NFR-047 đến TC-NFR-050 |
| `DI-1` | TC-NFR-051 đến TC-NFR-054 |
| `DI-2` | TC-NFR-055, TC-NFR-056 |
| `OE-1` | TC-NFR-057 |
| `OE-2` | TC-NFR-058 |
| `CO-1` | TC-NFR-059, TC-NFR-060 |
| `CO-2` | TC-NFR-061 đến TC-NFR-066 |

## 5 Chỗ SRS chưa rõ và TC bị ảnh hưởng

Phụ lục C của SRS 1.0.1 liệt kê các chỗ SRS chưa nêu kết quả, mã C-16 đến C-37, kèm hướng xử lý và trạng thái. Cột TC bị ảnh hưởng ghi các TC có kết quả mong đợi phụ thuộc vào mã đó; các TC này chỉ kiểm phần SRS đã nêu. "Chưa có" nghĩa là chưa có TC nào kiểm đúng trường hợp của mã đó. Khi SRS 1.1 chốt một mã, TC tương ứng được sửa hoặc thêm theo.

| Mã | TC bị ảnh hưởng |
|---|---|
| C-16 | TC-ORD-004 |
| C-17 | Chưa có: thiếu nhiều trường bắt buộc cùng lúc |
| C-18 | Chưa có: lưu phân công khi chưa chọn Shipper |
| C-19 | TC-TRK-038 đến TC-TRK-040 |
| C-20 | TC-TRK-020, TC-ISS-016, TC-ISS-022, TC-ISS-026, TC-ISS-039 |
| C-21 | TC-TRK-046 đến TC-TRK-048, TC-NFR-036, TC-NFR-037 |
| C-22 | TC-ACC-012 |
| C-23 | TC-ACC-021 |
| C-24 | Chưa có: đăng nhập bằng mật khẩu khác chữ hoa, chữ thường; đăng nhập khi để trống email hoặc mật khẩu |
| C-25 | Chưa có: yêu cầu hoàn hàng sai nhiều điều kiện cùng lúc |
| C-26 | Chưa có: có mô tả kèm một lý do khác "Khác" |
| C-27 | TC-RET-003 đến TC-RET-005, TC-RET-077 đến TC-RET-079 |
| C-28 | TC-ISS-061 đến TC-ISS-066 |
| C-29 | TC-ACC-038, TC-ACC-039 |
| C-30 | TC-NFR-035 |
| C-31 | TC-NFR-051 đến TC-NFR-053 |
| C-32 | Chưa có: nhiều trường cùng vượt độ dài trong một lần gửi (TC-NFR-055 gửi mỗi lần một trường) |
| C-33 | TC-BCT-002 |
| C-34 | TC-ORD-028, TC-ORD-052, TC-ACC-034 |
| C-35 | TC-ORD-045 |
| C-36 | TC-ORD-009, TC-ORD-010, TC-ORD-014, TC-ORD-015, TC-ORD-032, TC-RET-011, TC-RET-012, TC-RET-015, TC-RET-022, TC-RET-040, TC-RET-043, TC-ISS-054, TC-ISS-057, TC-ACC-001 đến TC-ACC-003, TC-ACC-005, TC-ACC-006, TC-ACC-012, TC-ACC-016, TC-ACC-017, TC-ACC-026 đến TC-ACC-030, TC-ACC-040, TC-ACC-041, TC-NFR-034, TC-NFR-055, TC-NFR-056 |
| C-37 | TC-BCT-022 |
