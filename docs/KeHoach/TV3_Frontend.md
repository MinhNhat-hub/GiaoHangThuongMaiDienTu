# TV3 – Frontend
Giao diện web cho 3 vai trò: Customer, Shipper, Admin.

## Bạn sở hữu
- **Trước 06/11:** không có việc phải nộp. SRS và Test Plan là việc của TV1, TV2.
- **Sau 06/11 (giai đoạn 2):**
  - 9 mockup (A8–A16).
  - Phần giao diện của 28 task chức năng. Mỗi task này làm chung với TV4: bạn làm giao diện, TV4 làm server.
  - Unit test và sửa lỗi phần giao diện: 8 task chung với TV4 (A73–A79, A82).
  - Tổng cộng: 9 task riêng + 36 task chung (28 task chức năng + 8 task test/sửa lỗi), khớp file 04.
- Danh sách task đầy đủ: [04_Backlog_PhanCong.md](04_Backlog_PhanCong.md), lọc cột "Người" có TV3.

## Review chéo với TV4
- Mọi thay đổi code đi qua pull request trên GitHub. TV4 review rồi mới được gộp vào nhánh chính.
- Bạn review pull request của TV4 theo cách tương tự.

## Đọc trước khi vào giai đoạn 2
| Tài liệu | Phần | Để làm gì |
|---|---|---|
| SRS bản cuối (TV1, 05/11) | §3: 7 use case | Mỗi luồng use case là một chuỗi màn hình |
| SRS bản cuối | §5.1 Giao diện người dùng, §5.4 Thông báo | Yêu cầu riêng cho giao diện |
| SRS bản cuối | §6.1 Real-time, §6.3 ROB | Trạng thái tự đổi trên màn hình, không cần tải lại; mất kết nối thì vào lại phải thấy trạng thái mới nhất |
| SRS bản cuối | Phụ lục A.2 Sơ đồ trạng thái | Tên trạng thái hiển thị cho người dùng |
| Test Plan bản cuối (TV2) | §3.1.3 User Interface Testing | Giao diện được kiểm bằng cách so với mockup |
| File tổng quan | Mục 7 | Công cụ đề xuất cho frontend |

Không bắt buộc: đọc SRS bản nháp ngày 02/11 để nắm sớm.

## Bước đầu giai đoạn 2
| # | Việc | Đầu ra |
|---|---|---|
| 1 | Thống nhất với TV4 danh sách API và sự kiện real-time (TV4 viết, bạn góp ý) | Đặc tả API dùng chung |
| 2 | Làm mockup theo use case | 9 mockup (A8–A16) |
| 3 | Làm giao diện từng chức năng theo đặc tả API | Pull request, có TV4 review |

Hạn của giai đoạn 2 chốt khi có hạn cuối kỳ (file tổng quan, mục 6.1).

## Phụ thuộc
- **Bạn cần:** SRS bản cuối (TV1, 05/11); đặc tả API (TV4, đầu giai đoạn 2).
- **Người khác cần bạn:** TV2 cần giao diện chạy được để chạy system test.
