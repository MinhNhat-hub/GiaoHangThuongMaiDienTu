# Đề cương SRS
**Toàn bộ SRS do TV1 viết, ai trong nhóm cũng review được** (file tổng quan, mục 5).

**SRS để làm gì:** mô tả yêu cầu chức năng và phi chức năng của hệ thống. Người làm web dựa vào đó để làm, người kiểm thử dựa vào đó để kiểm (COS SRS §1.1). Test Plan §2 cũng lấy yêu cầu từ SRS.

**Bộ mẫu có 5 tài liệu. Nhóm mình gộp lại thành 1 file SRS:**

| Tài liệu mẫu | Nhiệm vụ của tài liệu (theo nội dung file mẫu) | Nhóm mình đặt ở đâu |
|---|---|---|
| `COS Vision and Scope.docx` | Yêu cầu nghiệp vụ: bối cảnh, mục tiêu, tính năng chính, phạm vi và giới hạn | SRS §1.3. Không làm file riêng (YAGNI) |
| `COS Use Cases.docx` | Yêu cầu người dùng: tác nhân nào làm việc gì với hệ thống | SRS §3, mỗi tính năng kèm UC của nó |
| `COS Business Rules.docx` | Quy tắc nghiệp vụ mà yêu cầu phải tuân theo | SRS §7 |
| `COS SRS.docx` | Yêu cầu phần mềm: chức năng, dữ liệu, giao tiếp, chất lượng | Khung chính của file nộp |
| `PearlsFromSand.com SRS Example.docx` | Ví dụ SRS gom Use Case (§3) và Business Rules (mục 6) vào cùng 1 file | Mẫu cho cách gộp |

Khung theo `COS SRS.docx`. Use Case đặt ngay trong §3, học theo `PearlsFromSand.com SRS Example.docx`, để chỉ phải nộp **1 file**. Bảng Business Rules để thành 1 mục riêng trong SRS (Pearls mục 6).

Số từ ghi trong ngoặc là số đo trong mẫu COS, dùng để biết mục đó dài cỡ nào.

---

## 0. Quy ước chung (đây cũng là nội dung §1.2 của SRS)

| Loại | Format | Ví dụ |
|---|---|---|
| Use Case | `UC-xx`, đánh số liên tục | UC-01 |
| Yêu cầu chức năng | `Nhóm.Việc.ChiTiết` (như COS). Nhóm: `Order` (3.1), `Track` (3.2), `Return` (3.3), `Issue.Report` (3.4.1), `Issue.Resolve` (3.4.2) | `Order.Create.Receiver` |
| Ngoại lệ trong UC | `x.0.Ey` (như COS) | `3.0.E2` |
| Quy tắc nghiệp vụ | `BR-xx`, đánh số liên tục | BR-01 |
| Yêu cầu phi chức năng | `RT-x`, `SEC-x`, `ROB-x` | RT-1 |
| Giao diện | `UI-x`, `SI-x`, `CI-x` | CI-1 |
| Môi trường / Ràng buộc / Giả định / Phụ thuộc | `OE-x`, `CO-x`, `AS-x`, `DE-x` | AS-1 |
| Dữ liệu | `DI-x` | DI-1 |

**Luật viết:**
- Câu yêu cầu viết "Hệ thống phải …" (dịch từ "shall"). Mỗi câu chỉ chứa 1 yêu cầu.
- Thuật ngữ dùng đúng Phụ lục B. Lần đầu xuất hiện có thể ghi kèm tiếng Anh trong ngoặc.
- Tham chiếu chứ không chép lại: "(xem BR-12)", "(xem Hình A.2)".
- Không tự đặt số liệu. Chưa có thì ghi "chưa có số liệu".

---

## 1. Từng mục SRS

| Mục (tên tiếng Việt dùng y nguyên) | Viết gì | Mẫu để học |
|---|---|---|
| Trang bìa + Lịch sử sửa đổi | Tên đề tài, phiên bản, tên nhóm, ngày. Bảng Tên / Ngày / Lý do thay đổi / Phiên bản | Trang đầu COS |
| **1 Giới thiệu** | | |
| 1.1 Mục đích | SRS cho phiên bản nào; ai dùng tài liệu (người phát triển, người kiểm thử, giảng viên) | COS 1.1 (57) |
| 1.2 Quy ước tài liệu | Chép mục 0 ở trên | COS 1.2 |
| 1.3 Phạm vi dự án và tính năng | 2–3 câu tầm nhìn. Tính năng FE-1 Tạo đơn hàng, FE-2 Theo dõi vận chuyển, FE-3 Hoàn hàng, FE-4 Xử lý ngoại lệ. Danh sách ngoài phạm vi: nhiều cửa hàng, báo cáo, quản lý tài khoản, sửa/hủy/tìm đơn | COS 1.3 (53) + COS Vision & Scope 2.1 "Major Features", 2.3 "Limitations and Exclusions" |
| 1.4 Tài liệu tham khảo | Đề bài, backlog, bộ mẫu COS, slide Test Plan, nguồn Shopee/SPX S1–S5 (file 03 mục 1) | COS 1.4 (64) |
| **2 Mô tả tổng quan** | | |
| 2.1 Bối cảnh sản phẩm | Sơ đồ ngữ cảnh: hệ thống ở giữa, Customer / Shipper / Admin xung quanh, mũi tên ghi dữ liệu trao đổi | COS 2.1 + Figure 1 (88) |
| 2.2 Các lớp người dùng | Bảng 3 dòng: Customer = người mua, Admin = người bán + quản trị sàn, Shipper = nhân viên giao hàng (file 03 mục 3.2). Mỗi dòng: là ai, làm gì trong hệ thống. Số lượng người dùng: "chưa có số liệu" | COS 2.2 (238) |
| 2.3 Môi trường hoạt động | OE-x: ứng dụng web, trình duyệt hỗ trợ | COS 2.3 (90) |
| 2.4 Ràng buộc thiết kế và cài đặt | CO-x: ví dụ giao diện tiếng Việt | COS 2.4 (52) |
| 2.5 Giả định và phụ thuộc | AS-x / DE-x: hệ thống phục vụ một cửa hàng (file 03 mục 3.2); tài khoản Admin và Shipper đã có sẵn, Customer tự đăng ký; danh sách sản phẩm có sẵn dưới dạng dữ liệu mẫu; thanh toán ngoài phạm vi (file 03 mục 3.5) | COS 2.5 (82) |
| **3 Tính năng hệ thống** | 3.1–3.3 mỗi mục gồm: x.1 Mô tả và độ ưu tiên · x.2 Use Case · x.3 Yêu cầu chức năng. Riêng 3.4 chia 2 phần: 3.4.1 báo sự cố, 3.4.2 xử lý sự cố; mỗi phần có mô tả ngắn, UC (nếu có) và FR | |
| 3.1 Tạo đơn hàng | UC-01 Tạo đơn hàng (Customer là người mua đặt hàng, file 03 mục 3.1; UC đầy đủ). FR nhóm `Order.*` | COS 3.1 (838) + UC-1 (669) |
| 3.2 Theo dõi tình trạng vận chuyển | UC-02 Phân công đơn cho Shipper (Admin, đơn giản; gồm tạo vận đơn A26 và phân công A27). UC-03 Cập nhật trạng thái giao hàng (Shipper, đầy đủ; **ngoại lệ hỏng / thất lạc / giao thất bại nằm ở UC này**). UC-04 Theo dõi đơn hàng (Customer, đơn giản). FR nhóm `Track.*` | COS 3.1 + UC-1; UC-5 (243) cho UC đơn giản |
| 3.3 Hoàn hàng | Theo luồng "Trả hàng / Hoàn tiền" của Shopee (file 03 mục 2.3). UC-05 Yêu cầu hoàn hàng (Customer, đầy đủ). UC-06 Duyệt / từ chối yêu cầu hoàn (Admin, đơn giản). FR nhóm `Return.*` | Như 3.2 |
| 3.4 Xử lý ngoại lệ | Chỉ 2–3 câu mở đầu: liệt kê 3 ngoại lệ của đề, trỏ tới 3.4.1 và 3.4.2 | — |
| 3.4.1 Báo sự cố khi giao hàng | FR nhóm `Issue.Report.*`. Trỏ tới ngoại lệ trong UC-03, không viết lại | Phần Exceptions của COS UC-1 |
| 3.4.2 Xử lý sự cố và trả lại hàng | UC-07 Xử lý sự cố (Admin, đơn giản). FR nhóm `Issue.Resolve.*` | COS SI-2.5 (hoàn tiền khi bữa ăn không giao được) để lấy ý |
| **4 Yêu cầu dữ liệu** | | |
| 4.1 Mô hình dữ liệu logic | ERD | COS Figure 2 |
| 4.2 Từ điển dữ liệu | Bảng 5 cột như COS: Phần tử dữ liệu / Mô tả / Kiểu hoặc thành phần / Độ dài / Giá trị. **Giá trị trạng thái chép từ Hình A.2** | COS 4.2 (569) |
| 4.3 Báo cáo | 1 câu: "Không thuộc phiên bản này" | — |
| 4.4 Toàn vẹn, lưu giữ và hủy dữ liệu | DI-x, ví dụ: lịch sử trạng thái chỉ được thêm, không được sửa hay xóa. Việc *ghi* lịch sử là FR `Track.Update.History` ở §3.2, ở đây không viết lại. Không tự đặt thời hạn lưu khi không có nguồn | COS 4.4 (35) |
| **5 Yêu cầu giao tiếp bên ngoài** | | |
| 5.1 Giao diện người dùng | UI-x | COS 5.1 (71) |
| 5.2 Giao diện phần mềm | SI-x. Không có hệ thống ngoài thì ghi "Không có" | COS 5.2 (202) |
| 5.3 Giao diện phần cứng | Thường là "Không có" | COS 5.3 (7) |
| 5.4 Giao diện truyền thông | CI-x: thông báo cho Customer khi trạng thái đổi (A53) | COS 5.4 (60) |
| **6 Thuộc tính chất lượng** | | |
| 6.1 Cập nhật trạng thái thời gian thực | RT-x viết theo sự kiện (file tổng quan, mục 1.2) | Cách viết PER của COS 6.2 (108) |
| 6.2 Bảo mật | SEC-x: bắt buộc đăng nhập; quyền theo vai trò (Customer chỉ xem/tạo đơn của mình; Shipper chỉ cập nhật đơn được phân cho mình; chỉ Admin phân công, duyệt hoàn, xử lý sự cố) | COS 6.3 (72) |
| 6.3 Độ bền vững | ROB-x: mất kết nối rồi vào lại vẫn thấy trạng thái mới nhất | COS 6.6 ROB-1 (40) |
| Dòng cuối §6 | 1 câu: các thuộc tính khác chưa có yêu cầu đo được ở phiên bản này | — |
| **7 Quy tắc nghiệp vụ** | Bảng 5 cột như COS: Mã / Định nghĩa / Loại (Dữ kiện, Ràng buộc, Tính toán: dịch từ Fact, Constraint, Computation) / Tĩnh hay động / Nguồn | COS BR (267 từ / 10 luật) + Pearls mục 6 |
| **Phụ lục A Mô hình phân tích** | A.1 Sơ đồ Use Case · A.2 Sơ đồ trạng thái đơn hàng | COS Appendix A, Figure 3 |
| **Phụ lục B Thuật ngữ** | Bảng: Thuật ngữ / Tiếng Anh / Từ Shopee tương ứng / Định nghĩa. Bắt buộc có định nghĩa "Hoàn hàng" và "Trả lại" theo file 03 mục 3.3 | — |
| **Phụ lục C Danh sách vấn đề mở** | Việc chưa chốt, ai chốt, hạn | Pearls "Appendix B: Issues List" |

**Cột "Nguồn" của BR:** trong COS, nguồn là người hoặc văn bản thật (Cafeteria Manager, state tax code). Nhóm mình không có khách hàng thật, nên nguồn chỉ được ghi một trong hai: "Đề bài", hoặc "Quyết định nhóm ngày …" (lấy từ biên bản họp). Không được bịa ra chính sách. Nếu luật lấy ý từ Shopee/SPX thì ghi thêm mã nguồn, ví dụ "Quyết định nhóm ngày …, tham khảo S1".

---

## 2. Mẫu Use Case (trường lấy từ `COS Use Cases.docx`)

| Trường | Ghi gì |
|---|---|
| Mã và tên | UC-03 Cập nhật trạng thái giao hàng |
| Người tạo / Ngày tạo | |
| Tác nhân chính / Tác nhân phụ | |
| Mô tả | 2–3 câu |
| Điều kiện kích hoạt | Sự kiện làm UC bắt đầu |
| Tiền điều kiện | `PRE-1: Người dùng đã đăng nhập với vai trò …` (đây là chỗ Auth xuất hiện) |
| Hậu điều kiện | `POST-x`: hệ thống ở trạng thái nào sau khi UC xong |
| Luồng chính | `x.0 Tên luồng`, các bước đánh số |
| Luồng thay thế | `x.1`, `x.2`, … |
| Ngoại lệ | `x.0.E1`, … (format bên dưới) |
| Độ ưu tiên | Cao / Trung bình / Thấp |
| Tần suất sử dụng | "Chưa có số liệu". COS ghi con số ước tính của bên đặt làm phần mềm (khoảng 300 người dùng, mỗi người 1 lần/ngày). Nhóm mình không có bên đặt hàng thật nên không đặt số |
| Quy tắc nghiệp vụ | Chỉ ghi mã BR |
| Thông tin khác / Giả định | |

- **UC đầy đủ** (UC-01, UC-03, UC-05) viết như COS UC-1 (669 từ): đủ mọi trường, ngoại lệ có các bước xử lý.
- **UC đơn giản** (UC-02, UC-04, UC-06, UC-07) viết như COS UC-5 (243 từ): luồng ngắn, ngoại lệ chỉ cần ghi tên. Được bỏ 2 trường Tần suất sử dụng và Giả định (UC-5 không có 2 trường này).

**Format ngoại lệ** (cấu trúc copy từ `1.0.E1` của COS UC-1; nội dung dưới đây chỉ để minh họa, nhóm tự chốt):
```
3.0.E1 Hàng bị hỏng khi giao
1. Shipper chọn báo sự cố, loại "Hàng hỏng".
2. Hệ thống chuyển đơn sang trạng thái … (xem Hình A.2) và thông báo cho Admin.
3a. Nếu …, thì …
3b. Ngược lại, nếu …, thì …
```

---

## 3. Mẫu yêu cầu chức năng (học theo COS §3.1)

COS viết: `Order.Place.Register: The COS shall confirm that the Patron is registered for payroll deduction.`

Nhóm mình viết (minh họa format, nội dung nhóm tự chốt):
```
Track.Update: Shipper cập nhật trạng thái giao hàng.
  .Confirm:  Hệ thống phải yêu cầu Shipper xác nhận trước khi lưu trạng thái mới.
  .History:  Hệ thống phải lưu mỗi lần đổi trạng thái gồm người đổi, thời điểm, trạng thái cũ và mới.
```
- Dòng đầu là tên nhóm yêu cầu.
- Mỗi dòng con = 1 ID + 1 câu "Hệ thống phải…".
- Mỗi dòng con là 1 yêu cầu kiểm được. Test Plan §2 sẽ trỏ đúng ID này.

---

## 4. Câu hỏi nội dung SRS phải trả lời
Nhóm chốt câu trả lời ở buổi họp 29/10 hoặc khi TV1 viết. Câu trả lời nào là luật thì ghi thành BR. Không tự đặt ra.

### 4.1 UC-01 Tạo đơn hàng
- Một đơn gồm những gì? Gợi ý tối thiểu: sản phẩm chọn từ danh sách có sẵn + số lượng, thông tin người nhận, địa chỉ giao. Thanh toán ngoài phạm vi (file 03 mục 3.5).
- Trường nào bắt buộc? Mỗi trường kiểm định dạng gì (số điện thoại, địa chỉ…)?
- Tạo xong, đơn ở trạng thái nào? Trên Shopee là "Chờ xác nhận" (S2).
- Lưu đơn thất bại thì hệ thống làm gì? Học theo `Order.Done.Failure` của COS: rollback và báo lý do.

### 4.2 Sơ đồ trạng thái (Phụ lục A.2)
- Điểm xuất phát: bảng trạng thái ở mục 4 của file 03.
- Sơ đồ phải trả lời 3 câu: từ trạng thái nào được sang trạng thái nào; ai hoặc sự kiện gì kích hoạt mỗi lần chuyển; trạng thái nào là kết thúc.
- Hỏng và thất lạc có 2 ngả phát hiện: Shipper báo trong UC-03, hoặc người mua báo qua yêu cầu hoàn hàng UC-05 (file 03 mục 3.4). Hai ngả phải về cùng trạng thái.
- Giao thất bại bao nhiêu lần thì chuyển sang "Đang hoàn hàng"? Điều khoản SPX không ghi con số (file 03 mục 2.4). Nhóm tự chốt, ghi thành BR.
- Kênh thông báo cho Customer (trong ứng dụng hay email) chốt ở buổi họp 29/10.

### 4.3 UC-05, UC-06, UC-07: hoàn hàng và xử lý sự cố
Cột "Shopee làm gì" lấy từ file 03 để có điểm xuất phát, không phải để chép con số.

| Câu hỏi | Shopee làm gì (nguồn) |
|---|---|
| Ai được yêu cầu hoàn hàng? Thời hạn tính từ lúc nào? | Người mua; thời hạn tính từ khi đơn "Giao hàng thành công" (S1) |
| Được yêu cầu trong bao lâu? | 15 ngày; thực phẩm tươi sống / đông lạnh 24 giờ (S1, S4). Nhóm có thể chọn số khác |
| Lý do nào được chấp nhận? | Chưa nhận được hàng, thiếu hàng, sai hàng, hàng lỗi, khác mô tả, hàng giả / nhái (S1). Nhóm chọn một phần |
| Ai duyệt / từ chối? Từ chối có phải ghi lý do không? | Shopee làm trung gian giữa người mua và người bán; người bán được khiếu nại (S4). Trong đề tài: Admin duyệt. Có ghi lý do hay không thì nhóm chốt |
| Hàng gửi trả bằng cách nào? Hoàn tiền ra sao? | Đơn vị vận chuyển đến lấy / gửi tại bưu cục / tự gửi; hoàn tiền trong 1–14 ngày làm việc (S1). Trong đề tài: chỉ ghi nhận trạng thái, không xử lý tiền (file 03 mục 3.5) |
| Gặp hỏng, thất lạc, giao thất bại thì Admin xử lý thế nào? Đơn sang trạng thái nào? | SPX: hỏng / mất được bồi thường theo điều khoản; giao thất bại thì hàng hoàn về người gửi (S3). Trạng thái phải khớp Hình A.2 |
