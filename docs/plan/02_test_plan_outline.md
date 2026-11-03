# Đề cương Test Plan
**Toàn bộ Test Plan do TV2 viết, ai trong nhóm cũng review được** (file tổng quan, mục 5).

Nguồn: slide `4_Test-Plan_v1.0.pdf` của giảng viên. Cấu trúc 6 mục lấy từ **slide 8**, nội dung từng mục lấy từ slide 9–34 (số slide ghi trong ngoặc).

Viết bằng tiếng Việt. Tên các loại kiểm thử giữ tiếng Anh như trong slide.

**Test Plan để làm gì** (slide 5): xác định phạm vi kiểm thử, rủi ro, tiêu chí chấp nhận, sản phẩm bàn giao, chiến lược kiểm thử và trách nhiệm từng người; quyết định sớm phần nào kiểm tự động và đo bằng số liệu gì.

**Đầu vào** (slide 7): kế hoạch dự án, SRS và tiêu chí chấp nhận. Vì vậy Test Plan §2 lấy đúng ID yêu cầu từ SRS.

---

## 1. Từng mục Test Plan

| Mục | Nội dung (slide) | Phụ thuộc SRS? |
|---|---|---|
| Trang bìa + Lịch sử sửa đổi | | Không |
| **1 Giới thiệu** | (9) | |
| 1.1 Mục đích | Mục đích và cách tổ chức tài liệu | Không |
| 1.2 Thông tin nền | Tóm tắt dự án: trỏ tới SRS §1.3, không viết lại | Có |
| 1.3 Tài liệu tham chiếu | SRS v1.0, slide Test Plan, backlog | Không |
| 1.4 Phạm vi kiểm thử | Giai đoạn kiểm thử, loại kiểm thử (bảng ở mục 2), giả định, quản lý lỗi ("Plan defects") | Không |
| 1.5 Ràng buộc | Môi trường, nhân lực, lịch, công cụ | Không |
| 1.6 Rủi ro | Những gì có thể ảnh hưởng tới việc thiết kế hoặc chạy test | Không |
| **2 Yêu cầu cần kiểm thử** | (11–13) | |
| 2.1 Yêu cầu chức năng | Bảng ở mục 3 bên dưới | Có |
| 2.2 Yêu cầu phi chức năng | Bảng giống 2.1 | Có |
| 2.3 Tính năng không kiểm thử | Mỗi mục kèm lý do | Có |
| **3 Chiến lược kiểm thử** | (14–26) | |
| 3.1 Các loại kiểm thử | 6 loại ở mục 2, đánh số 3.1.1–3.1.6 theo cột "Làm?" của bảng đó; mỗi loại viết 4 ý (slide 14) | Không |
| 3.2 Giai đoạn kiểm thử | (10) Gợi ý ở mục 6 | Không |
| 3.3 Công cụ kiểm thử | (26) Gợi ý ở mục 6 | Không |
| **4 Tài nguyên** | (27) 4.1 Nhân lực · 4.2 Hệ thống (Server, Client, Database server) | Không |
| **5 Mốc kiểm thử và ước lượng** | (28–33) Cách làm ở mục 4 | Có (đếm dòng §2) |
| **6 Sản phẩm bàn giao** | (34) Bảng ở mục 5 | Không |

Cột "Phụ thuộc SRS?" cho biết mục nào viết được ngay (trước 31/10), mục nào phải chờ TV1: §2 và §5 chờ danh sách ID (31/10); §1.2 và §2.3 chờ SRS nháp (02/11).

**"Plan defects" (slide 9):** slide chỉ ghi đúng 2 chữ này. Nhóm hiểu là kế hoạch quản lý lỗi: ghi lỗi ở đâu (GitHub Issues), phân mức nghiêm trọng, ai xử lý. Giảng viên không có template (đã xác minh 28/10), nên nhóm dùng cách hiểu này.

**§4.1 Nhân lực:** TV2 phụ trách kiểm thử (slide 27 gọi là Test Leader / Tester). TV3, TV4 tự unit test phần code của mình. TV1 cập nhật SRS khi có lỗi do yêu cầu sai.

---

## 2. Chọn loại kiểm thử

| Loại (slide) | Làm? | Lý do |
|---|---|---|
| Function Testing (15–16) | Có → §3.1.1 | Kiểm mọi yêu cầu chức năng của 3.1–3.4 |
| Business Cycle Testing (19) | Có → §3.1.2 | Slide 19 yêu cầu "mỗi business rule được áp dụng đúng". Nhóm áp vào bằng cách chạy trọn vòng đời đơn (tạo → phân công → giao → hoàn hàng / sự cố) và kiểm từng BR ở SRS §7. Riêng phần "chức năng chạy theo lịch định kỳ" của slide 19 thì không áp dụng, vì hệ thống chạy theo sự kiện |
| User Interface Testing (17) | Có → §3.1.3 | Ứng dụng web có giao diện. Tiêu chí hoàn thành là khớp mockup (TV3 làm ở giai đoạn 2) |
| Data and Database Integrity Testing (18) | Có → §3.1.4 | Dữ liệu đơn và lịch sử trạng thái phải được lưu đúng. Đây là cơ sở để theo dõi đơn và giải quyết thất lạc |
| Security and Access Control Testing (24) | Có → §3.1.5 | Phân quyền theo vai trò (SEC-x) |
| Regression Testing (25) | Có → §3.1.6 | Backlog A84 |
| Performance Profiling (20) | Không | SRS không có yêu cầu thời gian (real-time theo sự kiện) |
| Load Testing (21) | Không | Không có yêu cầu số người dùng đồng thời |
| Stress Testing (22) | Không | Như trên |
| Volume Testing (23) | Không | Không có yêu cầu về khối lượng dữ liệu |

Bảng này đưa vào Test Plan §1.4 (phạm vi kiểm thử: các loại kiểm thử, slide 9). Loại "Không" ghi kèm lý do ngay ở đó, không đưa vào §2.3, vì §2.3 dành cho *tính năng* không kiểm thử (slide 11).

Mỗi loại "Có" viết đủ **4 ý theo slide 14**:
- **Mục tiêu:** cần bảo đảm điều gì.
- **Kỹ thuật:** test cái gì, khi chạy làm những gì, đánh giá kết quả bằng cách nào.
- **Tiêu chí hoàn thành.**
- **Lưu ý đặc biệt:** phụ thuộc, điều kiện dừng test.

Slide 15–25 có sẵn câu mẫu cho từng loại. Dịch ra, rồi gắn vào hệ thống của nhóm. Không chép nguyên văn tiếng Anh.

**Real-time** thuộc Function Testing, vì đây là kiểm *hành vi*: mở 2 phiên, Shipper xác nhận, Customer thấy trạng thái mới mà không cần tải lại trang. Cách kiểm ghi ở dòng RT của §2.2. Mục 3.1.1 không lặp lại.

---

## 3. Bảng §2.1 / §2.2: Yêu cầu cần kiểm thử

| Mã yêu cầu (SRS) | Tên ngắn | Loại kiểm thử | Kỹ thuật thiết kế | Độ phức tạp |
|---|---|---|---|---|
| `Order.Create.Receiver` | Nhập thông tin người nhận | Function | Phân vùng tương đương + Giá trị biên | Đơn giản |
| `3.0.E1` | Báo hàng hỏng | Function, Business Cycle | Chuyển trạng thái | Trung bình |
| `RT-1` | Trạng thái tự hiện khi Shipper xác nhận | Function | 2 phiên trình duyệt song song | … |

(3 dòng trên chỉ để minh họa.)

- **Luật phủ:** mỗi yêu cầu có ID trong SRS phải có ít nhất 1 dòng. Gồm: FR, ngoại lệ `x.0.Ey`, RT / SEC / ROB, UI / SI / CI, DI, OE / CO. Yêu cầu nào không kiểm thì đưa vào §2.3 kèm lý do.
  - Giả định AS / DE không cần dòng, vì không phải yêu cầu.
  - BR không cần dòng riêng. Mỗi BR phải được ít nhất 1 FR hoặc UC tham chiếu, và §3.1.2 Business Cycle Testing kiểm từng BR (slide 19).
- **Bảng này chính là ma trận truy vết**, không làm thêm bảng riêng (DRY).
- Kỹ thuật thiết kế gợi ý theo tính năng:
  - Tạo đơn (3.1): phân vùng tương đương + giá trị biên cho các trường của form.
  - Theo dõi và báo sự cố (3.2, 3.4.1): kiểm thử chuyển trạng thái trên Hình A.2, kể cả các bước chuyển **không hợp lệ** phải bị chặn (vd từ "Đã giao" quay về "Đang giao").
  - Hoàn hàng và xử lý sự cố (3.3, 3.4.2): bảng quyết định cho điều kiện duyệt / xử lý.
- Cột **Độ phức tạp** (Đơn giản / Trung bình / Phức tạp) dùng luôn cho ước lượng ở §5 (slide 31). Một bảng dùng cho 2 việc.

---

## 4. §5 Mốc kiểm thử và ước lượng

Cách ước lượng (slide 30–31):
1. Đếm số dòng ở §2 theo 3 mức độ phức tạp.
2. Với mỗi mức, TV2 ước lượng công cho từng việc: đọc yêu cầu, viết test case, chuẩn bị dữ liệu… (expert-based, slide 30). Công unit test do TV3, TV4 ước lượng khi vào giai đoạn 2.
3. Cộng thêm công viết Test Plan.

Mỗi con số trong bảng phải có người ước lượng đứng tên. Không lấy số của nhóm khác, không tự đặt.

| Mốc (slide 33) | Công (person-day) | Bắt đầu | Kết thúc |
|---|---|---|---|
| Test planning | (TV2 ước lượng) | 28/10/2026 | 06/11/2026 |
| Test design (viết test case) | | Chưa xác định | Chưa xác định |
| Test execution | | Chưa xác định | Chưa xác định |
| Test evaluation (Test Report) | | Chưa xác định | Chưa xác định |

Chưa có hạn cuối kỳ (đã xác minh 28/10), nên các mốc sau Test planning ghi "Chưa xác định". Nêu điều này ở §1.5 Ràng buộc và §1.6 Rủi ro. Có hạn thì cập nhật Test Plan lên v1.1.

---

## 5. §6 Sản phẩm bàn giao (slide 34)

| Sản phẩm | Ngày | Người giao | Người nhận |
|---|---|---|---|
| Test Plan | 06/11/2026 | TV2 | Giảng viên |
| Test Cases | Chưa xác định | TV2 | Giảng viên |
| Test Report | Chưa xác định | TV2 | Giảng viên |

---

## 6. Gợi ý cho §3.2 và §3.3

**Giai đoạn kiểm thử (slide 10)**, dẫn chứng từ backlog:

| Giai đoạn | Dẫn chứng backlog | Ai làm |
|---|---|---|
| Unit test | A73, A74, A76, A77, A79 | TV3, TV4, mỗi người test code của mình |
| Integration test | A59, A60, A62 (các task "Integrate …") | TV2 |
| System test | A80, A81, A83 | TV2 |
| Acceptance test | Không có trong backlog | Nhóm không có khách hàng thật. Đề xuất coi buổi demo với giảng viên là nghiệm thu; ghi vào giả định ở §1.4 |

**Công cụ**, xếp theo đúng các nhóm ở slide 26:

| Nhóm công cụ | Dùng gì |
|---|---|
| Ghi lỗi | GitHub Issues |
| Unit test | Jest hoặc Vitest |
| Function test | Playwright |
| Load / Performance test | Không dùng (xem mục 2) |
| Sinh dữ liệu test | Script seed dữ liệu của dự án |
| Kiểm giao diện | So với mockup bằng tay |

---

## 7. Checklist tự review Test Plan

Giảng viên không có file `Checklist_Test plan review.xls` (slide 35–36; đã xác minh 28/10), nên nhóm dùng checklist rút từ slide 9–34. Người review Test Plan cũng dùng checklist này:
- [ ] §1 đủ 6 ý của slide 9: mục đích, thông tin nền, tài liệu tham chiếu, phạm vi (giai đoạn, loại test, giả định, quản lý lỗi), ràng buộc, rủi ro.
- [ ] §2 có đủ yêu cầu chức năng, phi chức năng và danh sách không kiểm thử (slide 11).
- [ ] Mỗi loại kiểm thử đủ Mục tiêu / Kỹ thuật / Tiêu chí hoàn thành / Lưu ý đặc biệt (slide 14).
- [ ] Có danh sách công cụ (slide 26).
- [ ] Tài nguyên có cả nhân lực (vai trò, trách nhiệm) và hệ thống (server, client, database server) (slide 27).
- [ ] Mỗi mốc có công (person-day), ngày bắt đầu, ngày kết thúc (slide 33).
- [ ] Sản phẩm bàn giao có tên, ngày, người giao, người nhận (slide 34).
- [ ] Mỗi yêu cầu trong SRS có dòng ở §2, hoặc có lý do ở §2.3.
