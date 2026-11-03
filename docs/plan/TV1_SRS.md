# TV1 (@MinhNhat-hub) – SRS
"Viết gì" của từng mục xem trong [01_srs_outline.md](01_srs_outline.md). File này chỉ nói: làm theo thứ tự nào, hạn nào, nộp ra cái gì, ai review.

## Bạn sở hữu
- **Toàn bộ SRS:** §1–§7, Phụ lục A (sơ đồ Use Case, sơ đồ trạng thái), Phụ lục B (thuật ngữ), Phụ lục C (vấn đề mở).
- **4 sơ đồ:** sơ đồ ngữ cảnh (§2.1), ERD (§4.1), sơ đồ Use Case (A.1), sơ đồ trạng thái (A.2).
- **Backlog giai đoạn 1:** A4, A5, A6, A17, A29, A30, A31. Giai đoạn 2: xem [04_backlog_assignment.md](04_backlog_assignment.md), lọc cột "Người" có TV1.

## Review
- Ai trong nhóm cũng review được SRS của bạn: bạn gửi bản nháp cho nhóm ngày 02/11, người review trả Comment chậm nhất 03/11.
- Bạn cũng review được Test Plan và việc của người khác. Test Plan nháp có ngày 03/11, Comment trả trong 03/11 – 04/11.
- Review theo checklist ở mục 5 của file tổng quan. Góp ý bằng Comment trong Word, không sửa thẳng file của người kia.

## Đọc trước (xong trước buổi họp 29/10)
| Tài liệu | Phần | Học gì |
|---|---|---|
| `COS SRS.docx` | Toàn bộ | Khung chính của SRS nhóm mình |
| `COS Use Cases.docx` | UC-1 (đầy đủ), UC-5 (đơn giản) | Mẫu viết use case |
| `COS Business Rules.docx` | Cả file | Bảng 5 cột của quy tắc nghiệp vụ |
| `COS Vision and Scope.docx` | 2.1 Major Features, 2.3 Limitations and Exclusions | Cách viết §1.3 |
| `PearlsFromSand.com SRS Example.docx` | §3 (UC trong SRS), mục 6 (BR), Appendix B (Issues List) | Cách gộp nhiều tài liệu vào 1 SRS |
| [03_shopee_reference.md](03_shopee_reference.md) | Toàn bộ | Tác nhân, hoàn hàng / trả lại, trạng thái |
| File tổng quan | Mục 1.1, 1.2 | Auth, Report, cách viết real-time |

## Các bước
| # | Việc | Hạn | Đầu ra |
|---|---|---|---|
| 1 | Họp cả nhóm: xác nhận 3 điểm theo Shopee, chốt các trường của đơn hàng, kênh thông báo, thuật ngữ bản đầu. Bạn ghi biên bản (dùng làm nguồn cho BR) | T5 29/10 | Biên bản + thuật ngữ v0 |
| 2 | Vẽ sơ đồ trạng thái và sơ đồ Use Case. Lập danh sách ID khung: 7 UC, các ngoại lệ (`x.0.Ey`), các nhóm FR, các NFR. Có SRS nháp thì bổ sung đủ. **Gửi danh sách ID cho TV2** để TV2 viết Test Plan §2 song song | T7 31/10 | 2 sơ đồ `.drawio` + PNG; danh sách ID |
| 3 | Viết SRS nháp đủ mọi mục, kể cả sơ đồ ngữ cảnh và ERD. Gửi nhóm review | T2 02/11 | `SRS.docx` bản nháp |
| 4 | Review Test Plan nháp cùng nhóm | T3 03/11 – T4 04/11 | Comment trong `TestPlan.docx` |
| 5 | Sửa SRS theo Comment của TV2. Đổi ID nào thì báo TV2 ngay | T4 04/11 | Comment đã xử lý |
| 6 | Chốt: lịch sử sửa đổi, mục lục, đánh số hình | T5 05/11 | `SRS.docx` bản cuối |
| 7 | Nộp SRS | T6 06/11 | Đã nộp |

## Phụ thuộc
- **Bạn cần:** kết luận buổi họp 29/10; Comment của TV2 (03/11).
- **Người khác cần bạn:**
  - TV2 cần danh sách ID (31/10) và SRS nháp (02/11).
  - TV3, TV4 cần SRS bản cuối (05/11) để làm web ở giai đoạn 2.

## Rủi ro phải biết
- Một người viết toàn bộ SRS: khoảng 7.672 từ quy đổi theo mẫu COS, cộng 4 sơ đồ (file tổng quan, mục 3).
- Ngày 31/10 là mốc kiểm tra. Nếu chưa xong sơ đồ trạng thái và danh sách ID thì báo cả nhóm ngay, vì Test Plan của TV2 đang chờ.

## Xong khi
- [ ] Mỗi FR là 1 câu "Hệ thống phải…", có ID, kiểm được.
- [ ] 7 UC theo mẫu ở mục 2 của [01_srs_outline.md](01_srs_outline.md). UC-01, UC-03, UC-05 là UC đầy đủ; UC-02, UC-04, UC-06, UC-07 là UC đơn giản. Mỗi UC có PRE-1 về đăng nhập.
- [ ] 3 ngoại lệ của đề (hỏng, trả lại, thất lạc) đủ 4 ý: điều kiện phát hiện, ai phát hiện, hệ thống làm gì, chuyển sang trạng thái nào.
- [ ] Trạng thái chỉ định nghĩa ở sơ đồ A.2. Từ điển dữ liệu chép đúng tên từ sơ đồ. Hai ngả phát hiện hỏng / thất lạc về cùng trạng thái.
- [ ] RT viết theo sự kiện, kiểm được kiểu có/không; có ROB cho tình huống mất kết nối. SEC phủ quyền của cả 3 vai trò.
- [ ] Mỗi BR đủ 5 cột, cột nguồn đúng luật ở [01_srs_outline.md](01_srs_outline.md), và được ít nhất 1 FR hoặc UC tham chiếu.
- [ ] Thuật ngữ: mỗi khái niệm 1 tên. Có định nghĩa "Hoàn hàng" và "Trả lại".
- [ ] ERD có tối thiểu: người dùng (3 vai trò), sản phẩm, đơn hàng, lịch sử trạng thái, yêu cầu hoàn hàng, sự cố. Không có thực thể Cửa hàng.
- [ ] Mọi Comment của TV2 đã xử lý.
