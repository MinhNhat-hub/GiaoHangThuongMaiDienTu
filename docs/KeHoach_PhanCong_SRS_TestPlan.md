# Kế hoạch SRS + Test Plan (v4)
**Đề tài 20 – Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử**

Hạn nộp: **Thứ Sáu 06/11/2026** (file .docx) · Chốt nội bộ: **Thứ Năm 05/11** · Bắt đầu: Thứ Tư 28/10

| File | Ai đọc | Nội dung |
|---|---|---|
| File này | Cả nhóm | Quyết định đã chốt, phân công, lịch, review, việc còn mở |
| [KeHoach/01_DeCuong_SRS.md](KeHoach/01_DeCuong_SRS.md) | N10-A viết, N10-B review | Từng mục SRS: viết gì, học mẫu nào. **Quy ước ID nằm ở đây** |
| [KeHoach/02_DeCuong_TestPlan.md](KeHoach/02_DeCuong_TestPlan.md) | N10-B viết, N10-A review | Từng mục Test Plan theo slide giảng viên |
| [KeHoach/03_ThamKhao_Shopee.md](KeHoach/03_ThamKhao_Shopee.md) | Cả nhóm | Quy trình Shopee/SPX có nguồn → Customer là ai, hoàn hàng / trả lại, trạng thái |
| [KeHoach/04_Backlog_PhanCong.md](KeHoach/04_Backlog_PhanCong.md) | Cả nhóm | Đủ 79 task backlog: giai đoạn nào, ai làm |
| [KeHoach/N10-A_SRS.md](KeHoach/N10-A_SRS.md) | N10-A | Việc của người viết SRS |
| [KeHoach/N10-B_TestPlan.md](KeHoach/N10-B_TestPlan.md) | N10-B | Việc của người viết Test Plan |
| [KeHoach/N10-C_Frontend.md](KeHoach/N10-C_Frontend.md) | N10-C | Việc của người làm frontend |
| [KeHoach/N10-D_Backend.md](KeHoach/N10-D_Backend.md) | N10-D | Việc của người làm backend |

Mỗi file của từng thành viên chia thành các bước có đầu ra riêng. Bước của N10-A, N10-B có hạn cụ thể; bước của N10-C, N10-D chờ hạn cuối kỳ (mục 6.1). Sau này mỗi bước tách được thành 1 issue GitHub (bàn sau).

**Lịch sử thay đổi:**
- v1 (28/10): bản đầu, Test Plan theo IEEE 829.
- v2 (28/10): Test Plan theo slide giảng viên; real-time theo sự kiện; chia việc theo số liệu mẫu COS.
- v3 (28/10): tra theo Shopee: Customer là người mua, phân biệt hoàn hàng / trả lại (file 03); web cho 1 cửa hàng; chưa có hạn cuối kỳ; giảng viên không có template.
- v4 (29/10): chia theo vai trò: N10-A SRS, N10-B Test Plan, N10-C Frontend, N10-D Backend (phương án A). Review chéo N10-A ↔ N10-B, N10-C ↔ N10-D. Không phân trưởng nhóm. Use case đánh số lại UC-01 đến UC-07.

---

## 1. Quyết định đã chốt

| # | Câu hỏi | Trả lời | Hệ quả |
|---|---|---|---|
| 1 | Mẫu Test Plan | Slide `4_Test-Plan_v1.0.pdf` của giảng viên | Test Plan theo **6 mục của slide 8**, bỏ IEEE 829 (dùng ở bản v1) |
| 2 | Admin / Report / Auth | Admin là tác nhân, Report và Auth chưa rõ | Xem 1.1 |
| 3 | Real-time | Theo sự kiện: Shipper xác nhận thì trạng thái đổi luôn, không tải lại theo chu kỳ | Xem 1.2 |
| 4 | Cách chia việc | Theo vai trò, 4 người ngang nhau, không phân trưởng nhóm (phương án A) | Mục 2 |
| 5 | Ngôn ngữ | Tiếng Việt | Tên mục SRS đã dịch sẵn trong [01_DeCuong_SRS.md](KeHoach/01_DeCuong_SRS.md) |
| 6 | Định dạng nộp | .docx | Xem 1.3 |
| 7 | Hạn cuối kỳ | Chưa có | Các mốc sau 06/11 ghi "Chưa xác định" (mục 6.1) |
| 8 | Template / Checklist Test Plan của giảng viên | Không có | Giữ cấu trúc slide 8 + checklist tự rút từ slide (mục 6.1) |
| 9 | Customer là ai, hoàn hàng / trả lại | Dựa theo Shopee | Customer = người mua (mục 6.2, file 03) |
| 10 | 1 cửa hàng hay nhiều cửa hàng | 1 cửa hàng | Web của riêng một cửa hàng; Customer và Shipper không giới hạn số lượng (file 03 mục 3.2) |
| 11 | Review | SRS ↔ Test Plan; Frontend ↔ Backend | Mục 5 |

### 1.1 Admin, Auth, Report

**Admin (tác nhân).** Gộp vai trò người bán + sàn của Shopee (file 03, mục 3.2). Trong phạm vi đề, Admin làm 3 việc, lấy từ backlog:
- Tạo vận đơn và phân công đơn cho Shipper (A26, A27)
- Duyệt / từ chối yêu cầu hoàn hàng (A48)
- Xử lý sự cố giao hàng: hỏng, thất lạc, giao thất bại (A46)

Quản lý tài khoản người dùng / shipper (A33, A34) không thuộc đề. Bản này không đặc tả, chỉ ghi giả định "tài khoản Admin và Shipper đã có sẵn; Customer tự đăng ký".

**Auth gồm 2 việc khác nhau:**
- **Xác thực (Authentication)**: hệ thống biết *bạn là ai*. Gồm đăng ký, đăng nhập, đăng xuất (A19–A21).
- **Phân quyền (Authorization)**: hệ thống biết *bạn được làm gì* (A22 Role-based Authorization). Ví dụ: Shipper chỉ cập nhật đơn được giao cho mình; Customer chỉ xem đơn của mình; chỉ Admin được duyệt hoàn hàng.

Cách đưa vào SRS: **không viết thành tính năng riêng ở §3**, vì đề không hỏi. Làm đúng như mẫu COS:
- SRS mẫu COS không có mục "Đăng nhập" trong §3. Đăng nhập chỉ xuất hiện ở 2 loại chỗ: yêu cầu bảo mật **SEC-2** ("phải đăng nhập cho mọi thao tác trừ xem menu") và tiền điều kiện **PRE-1** của các use case (UC-1, UC-5: "Patron is logged into COS").
- Nhóm mình làm y vậy. Mỗi UC ghi `PRE-1: Người dùng đã đăng nhập với vai trò …`. Quyền theo vai trò ghi ở §6.2 (SEC-x).
- Test Plan kiểm phần này bằng loại **Security and Access Control Testing** (slide 24: kiểm tra người dùng chỉ truy cập được chức năng/dữ liệu mình có quyền).

**Report = báo cáo thống kê cho Admin** (A41, A54–A57, A70): tổng số đơn, đơn giao thành công, đơn hoàn, đơn hỏng/thất lạc.
- Đề không yêu cầu → **ngoài phạm vi bản SRS này** (YAGNI). Chỉ ghi 1 dòng ở §1.3 và §4.3 là "không thuộc phiên bản này". Test Plan §2.3 ghi "không kiểm thử".
- Bớt được bao nhiêu: mẫu COS viết 1 báo cáo (COS-RPT-1) mất **261 từ**, vậy 4 báo cáo ≈ 1.000 từ không phải viết.
- Backlog đã có sẵn A43 "Update SRS based on implemented functions". Nếu sau này làm report thì bổ sung SRS lúc đó.

### 1.2 Real-time theo sự kiện: viết và kiểm thế nào

- **Nghĩa:** Shipper bấm xác nhận (vd chuyển đơn sang "Đang giao") thì trạng thái đổi ngay lúc đó. Màn hình Customer/Admin đang mở tự hiện trạng thái mới. Không có cơ chế "cứ N giây tải lại".
- **Viết trong SRS (§6.1, N10-A):** mô tả bằng *sự kiện* và *kết quả nhìn thấy được*. Ví dụ format: "Khi Shipper xác nhận thay đổi trạng thái, hệ thống phải lưu trạng thái mới và hiển thị trạng thái đó trên màn hình theo dõi đang mở của Customer mà không cần người dùng tải lại trang."
- **Tránh** các chữ "nhanh", "ngay lập tức" đứng một mình, vì tester không đo được. Tiêu chí kiểm là **có/không**: trạng thái mới có xuất hiện mà không phải tải lại trang hay không.
- **Hệ quả cho Test Plan:** không làm Performance / Load / Stress / Volume test (slide 20–23), vì SRS không có yêu cầu nào về thời gian hay khối lượng. Ghi ở Test Plan §1.4 (phạm vi: loại kiểm thử nào làm, loại nào không) kèm lý do.
- **Thêm 1 yêu cầu ROB** (học theo COS ROB-1): người xem mất kết nối rồi vào lại phải thấy trạng thái mới nhất. Lý do: cập nhật theo sự kiện thì sự kiện xảy ra lúc mất mạng sẽ bị lỡ.

### 1.3 Làm việc trên .docx

- Chỉ có **1 file `SRS.docx` + 1 file `TestPlan.docx`**, đặt trên OneDrive (thư mục đồ án đang nằm trong OneDrive).
- `SRS.docx`: N10-A sửa, N10-B chỉ góp ý bằng **Comment**. `TestPlan.docx`: N10-B sửa, N10-A chỉ góp ý bằng Comment.
- Dùng style Heading 1/2/3 có sẵn của Word để mục lục tự sinh. Hình chèn kèm Caption ("Hình x").
- Sơ đồ vẽ bằng draw.io, lưu file nguồn `.drawio` cạnh file docx để sau sửa lại được (DRY: mỗi sơ đồ chỉ có 1 nguồn).

### 1.4 Việc dời sang giai đoạn 2 (sau 06/11)

| Việc (dòng backlog) | Vì sao chưa làm bây giờ |
|---|---|
| Mockup A8–A16 | Đề không yêu cầu. SRS mẫu COS §5.1 chỉ có yêu cầu giao diện dạng chữ (UI-1..3), không có hình màn hình |
| Sequence diagram A25, A28, A40, A50 | Luồng chính đã viết trong Normal Flow của UC. Vẽ thêm sơ đồ cho cùng luồng là lặp (DRY). Sequence diagram có giá trị thật ở khâu thiết kế web |
| Class diagram A7 | Thuộc thiết kế, không phải yêu cầu |
| Test case chi tiết A69 | Slide 34 tách Test Plan, Test Cases, Test Report thành 3 sản phẩm bàn giao riêng; slide 33 có mốc *Test design* riêng, sau Test planning. Hạn 06/11 chỉ cần Test Plan |
| Report A41, A54–A57, A70 | Ngoài phạm vi (mục 1.1) |

Nếu giảng viên yêu cầu khác thì người nhận task đó trong [04_Backlog_PhanCong.md](KeHoach/04_Backlog_PhanCong.md) làm sớm.

---

## 2. Phân công

4 người ngang nhau, không phân trưởng nhóm. Mỗi người chịu trách nhiệm đúng vai trò của mình.

| Người | Vai trò | Trước 06/11 | Sau 06/11 (giai đoạn 2) | Review chéo |
|---|---|---|---|---|
| **N10-A** | SRS | Toàn bộ SRS, gồm 4 sơ đồ (ngữ cảnh, ERD, Use Case, trạng thái) | Cập nhật SRS, hướng dẫn sử dụng, báo cáo cuối (5 task) | Với N10-B |
| **N10-B** | Test Plan | Toàn bộ Test Plan | Viết test case, chạy system / regression test (5 task: A69, A80, A81, A83, A84). Kiểm thêm chỗ nối sau khi N10-C, N10-D làm xong A59, A60, A62 (mục 6 của [02_DeCuong_TestPlan.md](KeHoach/02_DeCuong_TestPlan.md)) | Với N10-A |
| **N10-C** | Frontend | Không có việc phải nộp | 9 mockup + phần giao diện của 36 task chung với N10-D | Với N10-D |
| **N10-D** | Backend | Không có việc phải nộp | 5 sơ đồ thiết kế + phần server của 36 task chung với N10-C | Với N10-C |

Chi tiết từng task: [04_Backlog_PhanCong.md](KeHoach/04_Backlog_PhanCong.md). Cách làm từng người: các file của từng thành viên.

---

## 3. Số liệu tải

**Phương pháp:** ước lượng theo số liệu dự án cũ (metrics-based estimation, slide 29). "Dự án cũ" ở đây là bộ mẫu COS. Mình đếm số từ từng mục trong `COS SRS.docx`, `COS Use Cases.docx`, `COS Business Rules.docx` bằng script:

| Khối trong mẫu COS | Số từ đo được |
|---|---|
| §1 Introduction | 183 |
| §2 Overall Description | 550 |
| 1 tính năng: mô tả + yêu cầu chức năng (§3.1) | 838 |
| 1 UC đầy đủ (UC-1 Order a Meal) | 669 |
| 1 UC đơn giản (UC-5 Register for Payroll Deduction) | 243 |
| §4 không tính báo cáo (4.1 + 4.2 + 4.4) | 619 |
| 1 báo cáo (COS-RPT-1) | 261 |
| §5.1–5.3 / §5.4 | 280 / 60 |
| Nhóm yêu cầu SEC / PER / ROB | 72 / 108 / 40 |
| 10 Business Rules | 267 |

**SRS của nhóm quy ra ≈ 7.672 từ:** §1 183 + §2 550 + 3 khối FR 2.514 + 3 UC đầy đủ 2.007 + 4 UC đơn giản 972 + §4 619 + §5 340 + SEC/RT/ROB 220 + BR 267. Đây là tỷ lệ để so sánh, không phải số từ phải viết. Tiếng Việt đếm theo âm tiết nên số thật sẽ cao hơn.

**Tải theo phương án A:**

| Người | Trước 06/11 | Sau 06/11 (60 task backlog) |
|---|---|---|
| N10-A SRS | 100% SRS (≈ 7.672 từ) + 4 sơ đồ. Gấp 3,4 lần mức cao nhất ở cách chia trước (2.260 từ) | 5 task |
| N10-B Test Plan | 100% Test Plan (không có mẫu để đo). §2 phải chờ danh sách ID của N10-A | 5 task. A69 (viết test case cho mọi chức năng) là việc lớn |
| N10-C Frontend | Không có | 9 task riêng + 36 task chung |
| N10-D Backend | Không có | 5 task riêng + 36 task chung |

Nhóm đã chọn phương án A dù biết tải lệch: trước 06/11 dồn vào N10-A, N10-B; sau 06/11 dồn vào N10-C, N10-D. Cách giảm rủi ro:
- N10-A gửi danh sách ID cho N10-B ngày 31/10, để N10-B viết §2 song song chứ không phải chờ SRS nháp.
- Ngày 31/10 là mốc kiểm tra: chưa có sơ đồ trạng thái và danh sách ID thì báo cả nhóm ngay.
- Review chéo giúp bắt lỗi sớm trong cả 2 giai đoạn.

---

## 4. Lịch (dãn, có dự phòng)

| Mốc | Hạn | Việc | Ai |
|---|---|---|---|
| M0 Họp nhóm | T5 29/10 | Mỗi người đọc phần "Đọc trước" trong file của mình. Họp cả nhóm: xác nhận 3 điểm ở mục 6.2, chốt các trường của đơn hàng, kênh thông báo, thuật ngữ bản đầu. N10-A ghi biên bản | Cả nhóm |
| M1 Nền móng | T7 31/10 | N10-A: sơ đồ trạng thái, sơ đồ Use Case, **danh sách ID gửi N10-B**. N10-B: khung Test Plan (các mục không phụ thuộc SRS) | N10-A, N10-B |
| M2 Nháp SRS | T2 02/11 | N10-A: SRS nháp đủ mục, gửi N10-B review. N10-B: viết §2 theo danh sách ID | N10-A, N10-B |
| M3 Nháp Test Plan | T3 03/11 | N10-B: trả Comment cho SRS; Test Plan nháp đủ mục, gửi N10-A review | N10-B |
| M4 Sửa | T4 04/11 | N10-A trả Comment cho Test Plan. Cả hai sửa theo review của nhau | N10-A, N10-B |
| M5 Chốt | T5 05/11 | N10-A chốt SRS, N10-B chốt Test Plan | N10-A, N10-B |
| Nộp | T6 06/11 | Dự phòng, chỉ sửa lỗi phát sinh. N10-A nộp SRS, N10-B nộp Test Plan | N10-A, N10-B |
| Giai đoạn 2 | Sau 06/11 | N10-C, N10-D bắt đầu làm web; N10-A, N10-B làm task giai đoạn 2 của mình. Hạn chốt khi có hạn cuối kỳ | Cả nhóm |

Thứ tự phụ thuộc: **danh sách ID của N10-A (31/10)** là mốc quan trọng nhất trước 06/11, vì Test Plan §2 cần nó.

---

## 5. Review

| Cặp | Review cái gì | Cách làm |
|---|---|---|
| N10-A ↔ N10-B | SRS và Test Plan (giai đoạn 1) | Comment trong Word. N10-B review SRS theo checklist bên dưới; N10-A review Test Plan theo checklist ở mục 7 của [02_DeCuong_TestPlan.md](KeHoach/02_DeCuong_TestPlan.md) |
| N10-C ↔ N10-D | Code (giai đoạn 2) | Mọi thay đổi đi qua pull request trên GitHub; người kia duyệt rồi mới gộp vào nhánh chính. Checklist review code chốt khi bắt đầu giai đoạn 2 (YAGNI) |

Checklist review SRS (N10-B dùng):
- [ ] Mỗi yêu cầu chức năng là 1 câu "Hệ thống phải…", có ID, kiểm được.
- [ ] Không chép lại nội dung BR / trạng thái / thuật ngữ, chỉ ghi ID hoặc tham chiếu.
- [ ] Mỗi UC đủ các trường của mẫu COS. UC đơn giản được bỏ 2 trường như COS UC-5 (danh sách ở mục 2 của [01_DeCuong_SRS.md](KeHoach/01_DeCuong_SRS.md)).
- [ ] Mỗi ngoại lệ của đề (hỏng, trả lại, thất lạc) đủ 4 ý: điều kiện phát hiện, ai phát hiện, hệ thống làm gì, chuyển sang trạng thái nào.
- [ ] Mỗi yêu cầu có ID đều kiểm được, để Test Plan §2 có dòng cho nó (luật phủ ở mục 3 của [02_DeCuong_TestPlan.md](KeHoach/02_DeCuong_TestPlan.md)).
- [ ] Không có số liệu tự đặt ra (tần suất dùng, số người dùng…). Chưa có thì ghi "chưa có số liệu".
- [ ] Không có nội dung ngoài phạm vi (mục 1.1, 1.4).

---

## 6. Việc còn mở

### 6.1 Đã xác minh (28/10)
- **Hạn cuối kỳ: chưa có.**
  - Test Plan §5 chỉ ghi ngày cho mốc Test planning; các mốc sau ghi "Chưa xác định".
  - N10-B ghi điều này vào Test Plan §1.5 Ràng buộc và §1.6 Rủi ro.
  - Khi có hạn thì nâng Test Plan lên v1.1 và chốt hạn cho giai đoạn 2.
- **Giảng viên không có `Template_Test Plan.doc` và `Checklist_Test plan review.xls`.** Giữ cấu trúc slide 8 và checklist tự rút từ slide 9–34 (mục 7 của [02_DeCuong_TestPlan.md](KeHoach/02_DeCuong_TestPlan.md)).

### 6.2 Tác nhân và hoàn hàng / trả lại: chốt theo Shopee
Chi tiết, nguồn và lý do nằm ở [KeHoach/03_ThamKhao_Shopee.md](KeHoach/03_ThamKhao_Shopee.md). Tóm tắt:
1. **Tác nhân:**
   - **Customer = người mua**, giống người mua trên Shopee: tạo đơn, theo dõi, yêu cầu hoàn hàng.
   - **Admin = người bán + sàn**, gộp làm một.
   - **Shipper = nhân viên giao hàng**, giống nhân viên SPX.
2. **Hai khái niệm dễ nhầm:**
   - **Hoàn hàng** (chức năng): người mua đã nhận hàng rồi yêu cầu trả. Shopee gọi là "Trả hàng / Hoàn tiền".
   - **Trả lại** (ngoại lệ): giao không thành công, hàng quay về người bán. SPX gọi là "Đang hoàn hàng".
   - Từ của đề dùng ngược với Shopee, nên Phụ lục B phải định nghĩa rõ.
3. **Danh sách trạng thái** gợi ý: mục 4 của file 03. Đã đối chiếu tên trạng thái của Shopee/SPX với backlog.

Ba điểm trên chỉ cần **xác nhận** ở buổi họp 29/10, không phải bàn lại từ đầu. Không còn việc nào phải hỏi giảng viên.

### 6.3 Rủi ro của phương án A
- N10-A gánh toàn bộ SRS. Mốc kiểm tra 31/10 (mục 4).
- N10-B phụ thuộc SRS. Danh sách ID gửi sớm 31/10 để giảm chờ.
- N10-C, N10-D đến giai đoạn 2 mới vào việc. Nên đọc SRS bản nháp ngày 02/11 (không bắt buộc) để không phải đọc từ đầu khi bắt đầu code.

---

## 7. Công cụ cho giai đoạn làm web (sau 06/11)

Tiêu chí: hiệu quả và dùng được lâu dài quan trọng hơn chi phí; KISS (ít ngôn ngữ, ít thành phần). Stack chốt khi bắt đầu code, bây giờ chưa cần (YAGNI).

| Nhu cầu | Đề xuất | Ai dùng | Lý do |
|---|---|---|---|
| Ngôn ngữ | TypeScript cho cả frontend và backend | N10-C, N10-D | 1 ngôn ngữ cho cả hệ thống; kiểu tĩnh giúp bảo trì lâu dài |
| Frontend | React (qua Next.js hoặc Vite) | N10-C | Hệ sinh thái và tài liệu lớn |
| Backend | Node.js + NestJS (hoặc Express nếu muốn tối giản) | N10-D | NestJS chia module rõ ràng, có sẵn module WebSocket |
| Real-time | WebSocket qua Socket.IO | N10-D (server), N10-C (client) | Đúng kiểu **theo sự kiện** (câu trả lời #3): khi Shipper xác nhận, server *đẩy* trạng thái mới xuống trình duyệt. Trình duyệt không phải hỏi lại mỗi N giây |
| Database | PostgreSQL + Prisma | N10-D | Đơn hàng, vận chuyển, hoàn hàng, sự cố quan hệ chặt với nhau nên hợp CSDL quan hệ; mã nguồn mở |
| Unit / Integration test | Jest (hoặc Vitest) + Supertest | N10-C, N10-D | Khớp backlog A73–A79 |
| Function / UI / Real-time test | Playwright | N10-B | Khớp A80, A83, A84. Một bài test mở được 2 phiên trình duyệt (Shipper bấm, Customer thấy) nên kiểm được real-time |
| Ghi lỗi + quản lý việc | GitHub Issues + Projects | Cả nhóm | Slide 26 có nhóm "công cụ ghi lỗi" trong danh sách công cụ kiểm thử; nhóm đã định dùng GitHub |
| Review code | Pull request trên GitHub | N10-C, N10-D | Cách review chéo ở mục 5 |
| Chạy test tự động | GitHub Actions | N10-B | Chạy lại bộ test mỗi lần có thay đổi, tức là Regression (A84) |
| Sơ đồ / Mockup | draw.io / Figma | N10-A (sơ đồ SRS), N10-D (sơ đồ thiết kế), N10-C (mockup) | draw.io miễn phí, mã nguồn mở |

So với bản trước, **bỏ k6** (công cụ đo tải): SRS không còn yêu cầu nào về thời gian hay khối lượng (mục 1.2), giữ lại là YAGNI.

Phương án thay thế để bớt code: **Supabase** (có sẵn PostgreSQL + Auth + Realtime, mã nguồn mở, tự host được). Đổi lại sẽ phụ thuộc vào 1 nền tảng.
