# TV4 (@prime-2k12) – Backend
Server, cơ sở dữ liệu, xác thực/phân quyền, real-time.

## Bạn sở hữu
- **Trước 06/11:** không có việc phải nộp. SRS và Test Plan là việc của TV1, TV2.
- **Sau 06/11 (giai đoạn 2):**
  - 5 sơ đồ thiết kế: class diagram (A7) và 4 sequence diagram (A25, A28, A40, A50).
  - Phần server của 28 task chức năng. Mỗi task này làm chung với TV3: bạn làm server, TV3 làm giao diện.
  - Unit test và sửa lỗi phần server: 8 task chung với TV3 (A73–A79, A82).
  - Tổng cộng: 5 task riêng + 36 task chung (28 task chức năng + 8 task test/sửa lỗi), khớp file 04.
- Danh sách task đầy đủ: [04_backlog_assignment.md](04_backlog_assignment.md), lọc cột "Người" có TV4.

## Review
- Mọi thay đổi code đi qua pull request trên GitHub. Ai trong nhóm cũng review được; có ít nhất một người không phải tác giả duyệt rồi mới gộp vào nhánh chính.
- Bạn review pull request của bất kỳ ai, theo `docs/templates/review-pr.md`.

## Đọc trước khi vào giai đoạn 2
| Tài liệu | Phần | Để làm gì |
|---|---|---|
| SRS bản cuối (TV1, 05/11) | §3 Yêu cầu chức năng | Mỗi FR là một việc server phải làm |
| SRS bản cuối | §4 ERD và từ điển dữ liệu | Thiết kế cơ sở dữ liệu |
| SRS bản cuối | Phụ lục A.2 Sơ đồ trạng thái, §7 Quy tắc nghiệp vụ | Chuyển trạng thái nào hợp lệ; luật nào server phải chặn |
| SRS bản cuối | §6.1 Real-time, §6.2 Bảo mật, §6.3 ROB | Đẩy trạng thái theo sự kiện; phân quyền theo vai trò; xử lý khi client kết nối lại |
| Test Plan bản cuối (TV2) | §3.1.4 Data and Database Integrity, §3.1.5 Security and Access Control | Server sẽ được kiểm những gì |
| File tổng quan | Mục 7 | Công cụ đề xuất cho backend |

Không bắt buộc: đọc SRS bản nháp ngày 02/11 để nắm sớm.

## Bước đầu giai đoạn 2
| # | Việc | Đầu ra |
|---|---|---|
| 1 | Viết danh sách API và sự kiện real-time, thống nhất với TV3 | Đặc tả API dùng chung |
| 2 | Vẽ class diagram và 4 sequence diagram | 5 sơ đồ (A7, A25, A28, A40, A50) |
| 3 | Làm server từng chức năng theo đặc tả API | Pull request, có người review |

Hạn của giai đoạn 2 chốt khi có hạn cuối kỳ (file tổng quan, mục 6.1).

## Phụ thuộc
- **Bạn cần:** SRS bản cuối (TV1, 05/11).
- **Người khác cần bạn:** TV3 cần đặc tả API ngay đầu giai đoạn 2; TV2 cần server chạy được để chạy system test.
