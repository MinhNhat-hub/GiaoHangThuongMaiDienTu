# TV2 – Test Plan
"Viết gì" của từng mục xem trong [02_DeCuong_TestPlan.md](02_DeCuong_TestPlan.md). File này chỉ nói: làm theo thứ tự nào, hạn nào, nộp ra cái gì, ai review.

## Bạn sở hữu
- **Toàn bộ Test Plan:** 6 mục theo slide 8, kể cả §2 (dòng kiểm thử cho mọi yêu cầu có ID trong SRS).
- **Backlog giai đoạn 1:** A42. Viết Test Plan không có trong backlog nhưng là việc chính của bạn. Giai đoạn 2: xem [04_Backlog_PhanCong.md](04_Backlog_PhanCong.md), lọc cột "Người" có TV2.

## Review chéo với TV1
- Bạn review SRS của TV1: nhận bản nháp ngày 02/11, trả Comment chậm nhất 03/11.
- TV1 review Test Plan của bạn: bạn gửi bản nháp ngày 03/11.
- Review theo checklist ở mục 5 của file tổng quan. Góp ý bằng Comment trong Word, không sửa thẳng file của người kia.

## Đọc trước (xong trước buổi họp 29/10)
| Tài liệu | Phần | Học gì |
|---|---|---|
| `4_Test-Plan_v1.0.pdf` | Slide 5–34 | Toàn bộ khung Test Plan |
| `COS SRS.docx` | §3.1 (FR), §6 (NFR) | Yêu cầu viết thế nào, để biết lấy ID nào vào §2 |
| `COS Use Cases.docx` | UC-1, phần Exceptions | Mỗi ngoại lệ là ít nhất 1 dòng kiểm thử |
| [03_ThamKhao_Shopee.md](03_ThamKhao_Shopee.md) | Mục 3.3, 3.4, 4 | Trạng thái và các ngả ngoại lệ, để thiết kế kiểm thử chuyển trạng thái |
| File tổng quan | Mục 1.2 | Real-time kiểm kiểu có/không |

## Các bước
| # | Việc | Hạn | Đầu ra |
|---|---|---|---|
| 1 | Họp cả nhóm (TV1 ghi biên bản) | T5 29/10 | — |
| 2 | Viết các mục **không phụ thuộc SRS**: §1 (trừ 1.2, mục này trỏ tới SRS §1.3), §3 (6 loại kiểm thử, giai đoạn, công cụ), §4, §6. Nhận danh sách ID từ TV1 | T7 31/10 | Khung Test Plan |
| 3 | Viết §2 theo danh sách ID. Nhận SRS nháp, review SRS | T2 02/11 – T3 03/11 | §2 nháp; Comment trong `SRS.docx` |
| 4 | Viết xong §2 cho mọi ID, §2.3, ước lượng ở §5. Gửi TV1 review | T3 03/11 | `TestPlan.docx` bản nháp |
| 5 | Sửa theo Comment của TV1. Cập nhật §2 nếu SRS đổi ID | T4 04/11 | Comment đã xử lý |
| 6 | Chốt: đối chiếu §2 với ID trong SRS bản cuối | T5 05/11 | `TestPlan.docx` bản cuối |
| 7 | Nộp Test Plan | T6 06/11 | Đã nộp |

## Phụ thuộc
- **Bạn cần:** danh sách ID (31/10), SRS nháp (02/11), SRS bản cuối (05/11) của TV1.
- **Người khác cần bạn:**
  - TV1 cần Comment review SRS (03/11).
  - TV3, TV4 cần Test Plan bản cuối để biết phần unit test của mình (giai đoạn 2).

## Rủi ro phải biết
- §2 phụ thuộc SRS. Danh sách ID gửi sớm ngày 31/10 là để bạn không phải chờ tới 02/11. Nếu 31/10 chưa có danh sách thì làm tiếp các mục ở bước 2 và báo cả nhóm.

## Xong khi
- [ ] Qua hết checklist ở mục 7 của [02_DeCuong_TestPlan.md](02_DeCuong_TestPlan.md).
- [ ] Mọi ID trong SRS bản cuối có dòng ở §2, hoặc có lý do ở §2.3 (luật phủ ở mục 3 của [02_DeCuong_TestPlan.md](02_DeCuong_TestPlan.md)).
- [ ] Kiểm thử chuyển trạng thái có cả các bước chuyển **không hợp lệ**. Real-time kiểm bằng 2 phiên trình duyệt song song.
- [ ] Số ước lượng ở §5 do bạn ước lượng (slide 30), không lấy số của nhóm khác.
- [ ] Mọi Comment của TV1 đã xử lý.
