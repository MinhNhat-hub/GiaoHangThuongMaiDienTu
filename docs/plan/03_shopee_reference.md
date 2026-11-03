# Tham khảo Shopee / SPX Express
Mục đích: dựa vào quy trình thật của Shopee để chốt **Customer là ai** và nghiệp vụ **hoàn hàng / trả lại / hỏng / thất lạc**.

Mục 1–2 chỉ ghi điều có nguồn. Đề xuất của nhóm nằm riêng ở mục 3–4. Đây là **nơi duy nhất** lưu kết quả tra cứu; các file khác chỉ trỏ tới đây.

---

## 1. Nguồn

| Mã | Nguồn | Loại | Dùng cho |
|---|---|---|---|
| S1 | [Shopee Blog – Cách trả hàng hoàn tiền trên Shopee](https://shopee.vn/blog/cach-tra-hang-hoan-tien-tren-shopee/) | Chính thức (Shopee) | Trả hàng / hoàn tiền |
| S2 | [Shopee Blog – Kiểm tra đơn hàng Shopee](https://shopee.vn/blog/kiem-tra-don-hang-shopee/) | Chính thức (Shopee) | Trạng thái đơn phía người mua |
| S3 | [Điều khoản sử dụng SPX Express](https://spx.vn/T&C.pdf) | Chính thức (Công ty TNHH Shopee Express) | Tạo đơn, hoàn trả hàng, bồi thường, khiếu nại |
| S4 | [VnExpress 13/3/2024 – Shopee cập nhật chính sách đổi trả hàng](https://vnexpress.net/shopee-cap-nhat-chinh-sach-doi-tra-hang-4721617.html) | Báo chí | Mốc 15 ngày, ai quyết định |
| S5 | [BigSeller 16/07/2026 – SPX Express là gì? Tra cứu đơn hàng](https://www.bigseller.com/blog/articleDetails/spx-express-la-gi-tra-cuu-don-hang.4760.htm) | Bên thứ ba | Trạng thái vận chuyển chi tiết của SPX |

Chính sách Shopee thay đổi theo thời gian. Metadata của file S3 ghi năm 2021. Nhóm chỉ dùng các nguồn này để **tham khảo nghiệp vụ**, không bê nguyên con số vào SRS.

---

## 2. Shopee làm thế nào (chỉ ghi điều có nguồn)

### 2.1 Các bên
- **Sàn Shopee.** Người mua đặt hàng, đơn hiện trong mục "Đơn mua" của người mua (S2). "Chờ lấy hàng" nghĩa là người bán đã nhận đơn và đang chuẩn bị giao cho đơn vị vận chuyển (S2).
- **SPX Express** (dịch vụ giao hàng của Shopee):
  - Khách hàng đăng nhập spx.vn và tạo đơn hàng; nhân viên SPX đến địa chỉ người gửi lấy hàng, giao cho người nhận và thu hộ COD nếu có (S3, mục 2).
  - Theo S5, ở trạng thái "Chờ lấy hàng", **shop** là bên đã tạo đơn vận chuyển.
- **Tóm lại:** có 4 bên: người mua, người bán, sàn, đơn vị giao hàng.

### 2.2 Trạng thái đơn
- **Người mua thấy (S2):** Chờ xác nhận → Chờ lấy hàng → Đang giao → Đã giao → Đánh giá. Ngoài ra có Đã hủy và Trả hàng.
- **Vận chuyển SPX (S5):** Chờ lấy hàng → Đã lấy hàng → Đã đến kho phân loại → Đang trung chuyển → Đã đến kho giao hàng → Đang giao hàng → Giao hàng thành công / Giao hàng không thành công → Đang hoàn hàng (đơn đang được trả về người bán).

### 2.3 Trả hàng / Hoàn tiền (người mua chủ động)
- **Ai gửi yêu cầu:** người mua (S1).
- **Thời hạn (S1):** 15 ngày kể từ khi đơn ở trạng thái "Giao hàng thành công". Thực phẩm tươi sống / đông lạnh: 24 giờ. Trước tháng 3/2024 là 3–7 ngày (S4).
- **Lý do được trả (S1):** chưa nhận được hàng, thiếu hàng, gửi sai hàng, hàng lỗi / không hoạt động, khác mô tả, hàng giả / nhái. "Không còn nhu cầu" chỉ áp dụng cho một số trường hợp.
- **Ai quyết định:** Shopee làm trung gian giữa người mua và người bán. Người bán được khiếu nại nếu không đồng ý (S4).
- **Gửi hàng trả về:** đơn vị vận chuyển đến lấy, gửi tại bưu cục, hoặc tự sắp xếp (S1).
- **Hoàn tiền:** 1–14 ngày làm việc, tùy phương thức thanh toán (S1).

### 2.4 Giao không thành công → hàng hoàn về người gửi (S3, mục 4 "Chính sách hoàn trả hàng")
- Phí trả hàng bằng 50% cước giao.
- Thời gian hoàn trả: 5 ngày làm việc (nội tỉnh), 5–10 ngày (các tuyến khác), tính từ lần giao cuối cùng không thành công.
- Phải giao bao nhiêu lần rồi mới hoàn: **S3 không ghi con số**.
- Khi giao trả cho người gửi: nếu người gửi từ chối nhận lại, hoặc không liên lạc được sau ít nhất 3 lần giao trả, SPX được miễn trách nhiệm (S3, mục 10).

### 2.5 Mất / thất lạc / hư hỏng (S3)
- **Phạm vi:** mất hàng, thất lạc, bị tráo đổi, hư hỏng toàn bộ hoặc một phần đều được bồi thường theo mục 7 và 8.
- **Mức bồi thường:**
  - Có COD hoặc bảo hiểm: 100% giá trị hàng, tối đa 20.000.000đ.
  - Không có: 4 lần cước.
  - Hư hỏng một phần: tính theo tỷ lệ hư hại.
- **Không bồi thường** khi lỗi do bên gửi, ví dụ đóng gói không đảm bảo.
- **Thời hiệu khiếu nại (mục 10.4):** mất bưu gửi 6 tháng; hư hỏng 1 tháng kể từ ngày phát.
- **Quy trình khiếu nại (mục 10.7):** tiếp nhận (kèm hình ảnh, tài liệu) → xác minh và giải quyết (không quá 1 tháng) → thông báo kết quả.

---

## 3. Áp vào đề tài (đề xuất, nhóm xác nhận ở buổi họp 29/10)

### 3.1 Customer là **người mua**
Đối chiếu từng việc Customer làm trong backlog với người làm đúng việc đó trên Shopee:

| Việc của Customer trong backlog | Trên Shopee ai làm | Nguồn |
|---|---|---|
| Tạo đơn hàng (A12, A23) | Người mua đặt hàng; đơn nằm ở "Đơn mua" với trạng thái "Chờ xác nhận" | S2 |
| Theo dõi vận chuyển (A15, A52) | Người mua theo dõi trong "Đơn mua" | S2 |
| Tạo yêu cầu hoàn hàng (A14, A47) | Người mua gửi yêu cầu Trả hàng / Hoàn tiền | S1, S4 |

Thêm 2 dẫn chứng:
- Backlog có A48 "Approve / Reject Return Request". Trên Shopee, việc này thuộc về người bán và sàn (S4). Trong điều khoản SPX dành cho bên gửi hàng không có bước "duyệt yêu cầu hoàn" nào (S3). Vậy backlog khớp với mô hình **người mua**.
- Backlog tách A23 "Create Order" (Customer) với A26 "Create Shipment" (Admin). Shopee cũng vậy: người mua đặt đơn (S2), còn shop mới là bên tạo đơn vận chuyển (S5).

> **Đổi so với bản v2:** bản v2 đề xuất Customer là người gửi (shop). Đối chiếu với Shopee và backlog như trên thì người mua khớp hơn, nên đổi.

### 3.2 Gộp vai trò cho vừa 3 tác nhân của backlog

| Shopee | Đề tài | Lý do |
|---|---|---|
| Người mua | **Customer** | Mục 3.1 |
| Người bán + Sàn | **Admin** | Backlog chỉ có 3 vai trò. Admin làm việc của người bán (tạo vận đơn A26, phân công A27) và việc của sàn (duyệt trả hàng A48, xử lý sự cố A46). KISS: chỉ 1 cửa hàng, không làm đa người bán |
| Nhân viên SPX | **Shipper** | Lấy hàng, giao, cập nhật trạng thái, báo sự cố (S3 mục 2; A63–A65) |

**"1 cửa hàng" nghĩa là gì** (nhóm chốt ngày 28/10):
- Hệ thống là web riêng của **một** cửa hàng, không phải sàn có nhiều người bán. Mọi sản phẩm và mọi đơn hàng đều thuộc về cửa hàng đó.
- Thứ bị giới hạn là **số người bán**, không phải số người dùng:
  - Customer và Shipper: bao nhiêu cũng được.
  - Admin: có thể nhiều tài khoản, nhưng tất cả là nhân viên của cùng cửa hàng.
- Cửa hàng khác muốn dùng thì cài một bản riêng, với dữ liệu riêng. Hai cửa hàng không thấy đơn của nhau.
- Lý do chọn:
  - Đề không nhắc tới nhiều người bán.
  - Backlog chỉ có 3 vai trò và không có task nào về người bán hay cửa hàng. A33, A34 chỉ là quản lý người dùng và quản lý shipper.

### 3.3 Từ ngữ của đề dùng ngược với Shopee: phải định nghĩa trong Phụ lục B

| Khái niệm | Từ của đề | Từ của Shopee / SPX | Ai kích hoạt | Mục SRS |
|---|---|---|---|---|
| Người mua đã nhận hàng, muốn trả lại | **Hoàn hàng** (chức năng) | "Trả hàng / Hoàn tiền" (S1) | Customer | 3.3 |
| Giao không thành công, hàng quay về người bán | **Trả lại** (ngoại lệ) | "Giao hàng không thành công" → "Đang hoàn hàng" (S5); "hoàn trả hàng" (S3) | Shipper báo | 3.4 (3.4.1 báo, 3.4.2 xử lý) |

SRS giữ từ của đề, vì đề là thứ được chấm. Nhưng Phụ lục B phải định nghĩa đúng như bảng trên, kèm từ Shopee tương ứng, để người đọc không nhầm.

### 3.4 Hỏng và thất lạc có 2 điểm phát hiện

| Ngoại lệ | Phát hiện trong lúc giao | Phát hiện sau đó, phía người mua |
|---|---|---|
| Hỏng | Shipper báo sự cố (3.4.1) → Admin xử lý (3.4.2) | Người mua yêu cầu hoàn hàng với lý do hàng lỗi / hư hỏng (3.3). S1 có lý do "Hàng lỗi" |
| Thất lạc | Shipper hoặc Admin xác nhận mất (3.4.1 → 3.4.2) | Người mua yêu cầu với lý do "Chưa nhận được hàng" (S1) |

Hai ngả phải dẫn về cùng trạng thái trên Hình A.2. Đây là chỗ TV2 phải kiểm kỹ khi review SRS.

### 3.5 Những gì của Shopee không làm (YAGNI)
- **Tiền:** thanh toán, phí giao, phí hoàn, mức bồi thường. Đề và backlog đều không có. Hệ thống chỉ ghi nhận kết quả xử lý (vd "đã chấp nhận hoàn tiền"), không xử lý tiền.
- **Đa người bán, danh mục sản phẩm, đánh giá sản phẩm, kho trung chuyển:** không làm. Ghi giả định ở SRS §2.5: danh sách sản phẩm có sẵn dưới dạng dữ liệu mẫu.
- **Con số của Shopee** (15 ngày, 24 giờ, 50%…): chỉ để tham khảo. Nhóm muốn dùng số nào thì ghi thành BR, cột Nguồn ghi: "Quyết định nhóm ngày …, tham khảo S1/S3".

---

## 4. Danh sách trạng thái gợi ý (cho sơ đồ trạng thái, SRS Phụ lục A.2)

| Trạng thái (đề xuất) | Tên tương ứng trên Shopee / SPX | Nguồn | Backlog |
|---|---|---|---|
| Chờ xác nhận | Chờ xác nhận | S2 | A23 |
| Chờ lấy hàng | Chờ lấy hàng | S2, S5 | A26, A27 |
| Đang giao | Đang giao / Đang giao hàng | S2, S5 | A64 |
| Đã giao | Đã giao / Giao hàng thành công | S2, S5 | A64 |
| Giao không thành công | Giao hàng không thành công | S5 | A68 |
| Đang hoàn hàng → Đã hoàn về người bán | Đang hoàn hàng (S5 không có trạng thái kết thúc; tên kết thúc là nhóm đặt) | S5, S3 mục 4 | A61 |
| Hư hỏng | Sự cố được bồi thường | S3 | A66 |
| Thất lạc | Sự cố được bồi thường | S3 | A67 |
| Yêu cầu hoàn hàng: Chờ duyệt → Đã chấp nhận / Bị từ chối → Hoàn tất | Trả hàng / Hoàn tiền (các mốc: được tiếp nhận, đang xử lý, đã hoàn tất hoàn tiền) | S1 | A47–A49 |
| Đã hủy | Đã hủy | S2 | A36. Ngoài phạm vi, chỉ thêm nếu nhóm làm hủy đơn |

Không đưa vào: các trạng thái kho của SPX (kho phân loại, trung chuyển, kho giao hàng) và "Đánh giá". Hệ thống của nhóm không quản lý kho và không làm đánh giá (YAGNI).
