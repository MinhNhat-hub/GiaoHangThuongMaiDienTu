# Phân công theo backlog
Đủ **79 task** trong `BackLogPlan.xlsx` (thư mục "Bài tập 1"), mỗi task đúng 1 dòng. Đây là **nơi duy nhất** ghi task nào thuộc giai đoạn nào, ai làm. Các file khác chỉ trỏ tới đây.

- **Giai đoạn 1:** SRS + Test Plan, hạn 06/11.
- **Giai đoạn 2:** làm web. Phân công giai đoạn này là **đề xuất**, chốt khi bắt đầu làm web.
- **Ngoài phạm vi:** đề không yêu cầu (lý do ở file tổng quan, mục 1.1 và 1.4).
- **Task ghi "TV3, TV4":** mỗi chức năng cần cả giao diện lẫn server. TV3 làm giao diện, TV4 làm server. Với unit test và sửa lỗi: ai viết code phần nào thì làm phần đó.

| Dòng | Task (giữ nguyên tên trong backlog) | Giai đoạn | Người | Ghi chú |
|---|---|---|---|---|
| A4 | Requirement Analysis | 1 | TV1 | Phân tích yêu cầu để viết SRS; họp nhóm 29/10 |
| A5 | Draw Use Case Diagram | 1 | TV1 | SRS Phụ lục A.1 |
| A6 | Draw ERD | 1 | TV1 | SRS §4.1 |
| A7 | Draw Class Diagram | 2 | TV4 | Thiết kế, không phải yêu cầu |
| A8 | UI Mockup – Login Screen | 2 | TV3 |  |
| A9 | UI Mockup – Register Screen | 2 | TV3 |  |
| A10 | UI Mockup – Admin Dashboard | 2 | TV3 | Danh sách đơn cho Admin |
| A11 | UI Mockup – Customer Home Screen | 2 | TV3 |  |
| A12 | UI Mockup – Create Order Screen | 2 | TV3 |  |
| A13 | UI Mockup – Order Detail Screen | 2 | TV3 |  |
| A14 | UI Mockup – Return Request Screen | 2 | TV3 |  |
| A15 | UI Mockup – Shipment Tracking Screen | 2 | TV3 |  |
| A16 | UI Mockup – Shipper Delivery Screen | 2 | TV3 |  |
| A17 | Define Shipment Status Flow | 1 | TV1 | SRS Phụ lục A.2 |
| A19 | Implement Register | 2 | TV3, TV4 | Auth |
| A20 | Implement Login | 2 | TV3, TV4 | Auth |
| A21 | Implement Logout | 2 | TV3, TV4 | Auth |
| A22 | Implement Role-based Authorization | 2 | TV3, TV4 | SEC-x |
| A23 | Implement Create Order | 2 | TV3, TV4 | UC-01 |
| A24 | Implement View Order | 2 | TV3, TV4 | UC-04 |
| A25 | Draw Sequence Diagram – Create Order | 2 | TV4 |  |
| A26 | Implement Create Shipment | 2 | TV3, TV4 | UC-02 |
| A27 | Implement Assign Order to Shipper | 2 | TV3, TV4 | UC-02 |
| A28 | Draw Sequence Diagram – Track Shipment | 2 | TV4 |  |
| A29 | Write SRS Document – System Overview | 1 | TV1 | SRS §1, §2 |
| A30 | Write SRS – Functional Requirements | 1 | TV1 | SRS §3 |
| A31 | Write SRS – Non-functional Requirements | 1 | TV1 | SRS §6 |
| A33 | Admin – Manage Users | Ngoài phạm vi | — | Giả định: tài khoản Admin, Shipper có sẵn |
| A34 | Admin – Manage Shippers | Ngoài phạm vi | — | Như trên |
| A35 | Implement Update Order | Ngoài phạm vi | — | SRS §1.3: sửa / hủy / tìm đơn |
| A36 | Implement Cancel Order | Ngoài phạm vi | — | Như trên |
| A37 | Implement Search and Filter Orders | Ngoài phạm vi | — | Như trên |
| A38 | Implement Update Shipment Status | 2 | TV3, TV4 | UC-03 |
| A39 | Implement View Shipment History | 2 | TV3, TV4 | UC-04 |
| A40 | Draw Sequence Diagram – Update Delivery Status | 2 | TV4 |  |
| A41 | Prepare Report & Statistics Structure | Ngoài phạm vi | — | Report |
| A42 | Define Testing Scenarios | 1 | TV2 | Toàn bộ dòng Test Plan §2 |
| A43 | Update SRS based on implemented functions | 2 | TV1 | Sửa SRS theo code thực tế |
| A45 | Admin – Manage Orders | 2 | TV3, TV4 | Chỉ phần xem danh sách đơn để phân công |
| A46 | Admin – Manage Delivery Issues | 2 | TV3, TV4 | UC-07 |
| A47 | Implement Create Return Request | 2 | TV3, TV4 | UC-05 |
| A48 | Implement Approve / Reject Return Request | 2 | TV3, TV4 | UC-06 |
| A49 | Implement Update Return Status | 2 | TV3, TV4 | UC-05, UC-06 |
| A50 | Draw Sequence Diagram – Return Order | 2 | TV4 |  |
| A51 | Implement Real-time Order Status Update | 2 | TV3, TV4 | RT-x |
| A52 | Display Current Delivery Status | 2 | TV3, TV4 | UC-04 |
| A53 | Notify Customer when Status Changes | 2 | TV3, TV4 | CI-x |
| A54 | Implement Total Orders Report | Ngoài phạm vi | — | Report |
| A55 | Implement Successful Delivery Report | Ngoài phạm vi | — | Report |
| A56 | Implement Returned Order Report | Ngoài phạm vi | — | Report |
| A57 | Implement Lost / Damaged Order Report | Ngoài phạm vi | — | Report |
| A59 | Integrate Admin Management with Orders | 2 | TV3, TV4 |  |
| A60 | Integrate Admin Management with Delivery Issues | 2 | TV3, TV4 |  |
| A61 | Implement Returned Order Exception | 2 | TV3, TV4 | Ngoại lệ "trả lại" |
| A62 | Integrate Order Management with Return Management | 2 | TV3, TV4 |  |
| A63 | Shipper – View Assigned Orders | 2 | TV3, TV4 | UC-03 |
| A64 | Shipper – Update Delivery Status | 2 | TV3, TV4 | UC-03 |
| A65 | Shipper – Report Delivery Issue | 2 | TV3, TV4 | SRS 3.4.1 |
| A66 | Handle Damaged Order | 2 | TV3, TV4 | SRS 3.4.2 |
| A67 | Handle Lost Order | 2 | TV3, TV4 | SRS 3.4.2 |
| A68 | Handle Failed Delivery | 2 | TV3, TV4 | SRS 3.4.2 |
| A69 | Prepare System Test Cases | 2 | TV2 | Mốc Test design (slide 33) |
| A70 | Verify Report & Statistics | Ngoài phạm vi | — | Report |
| A71 | Update SRS Exception Scenarios | 2 | TV1 | Bản đầu viết ở giai đoạn 1; đây là sửa lại sau khi code |
| A73 | Unit Test – Authentication | 2 | TV3, TV4 |  |
| A74 | Unit Test – Admin Management | 2 | TV3, TV4 | Chỉ phần Admin trong phạm vi |
| A75 | Fix Authentication / Admin Bugs | 2 | TV3, TV4 |  |
| A76 | Unit Test – Order Management | 2 | TV3, TV4 |  |
| A77 | Unit Test – Return Management | 2 | TV3, TV4 |  |
| A78 | Fix Order / Return Bugs | 2 | TV3, TV4 | Ai viết code phần nào sửa phần đó |
| A79 | Unit Test – Shipment Management | 2 | TV3, TV4 |  |
| A80 | Test Real-time Tracking | 2 | TV2 |  |
| A81 | Test Shipper & Exception Handling | 2 | TV2 |  |
| A82 | Fix Delivery-related Bugs | 2 | TV3, TV4 |  |
| A83 | System Testing | 2 | TV2 |  |
| A84 | Regression Testing | 2 | TV2 |  |
| A85 | User Manual | 2 | TV1 | Hướng dẫn sử dụng |
| A86 | Final Project Report | 2 | TV1 |  |
| A87 | Final SRS Review | 2 | TV1 | Review cuối, sau A43 |

## Việc giai đoạn 1 không có trong backlog
Backlog không có các việc sau, nhưng giai đoạn 1 phải làm. Khi tạo issue GitHub thì thêm vào.

| Việc | Người |
|---|---|
| Viết Test Plan | TV2 |
| Bảng Business Rules (SRS §7) | TV1 |
| Thuật ngữ (SRS Phụ lục B) | TV1 |
| Danh sách vấn đề mở (SRS Phụ lục C) | TV1 |

## Số task mỗi người (phương án A, nhóm đã chọn)

| Người | Vai trò | Giai đoạn 1 (task backlog) | Giai đoạn 2 (task backlog) |
|---|---|---|---|
| TV1 | SRS | 7 + 3 việc ngoài backlog | 5 |
| TV2 | Test Plan | 1 + viết Test Plan | 5 |
| TV3 | Frontend | 0 | 9 riêng + 36 chung với TV4 |
| TV4 | Backend | 0 | 5 riêng + 36 chung với TV3 |

Lệch tải này đã biết trước khi chọn phương án A: giai đoạn 1 dồn vào TV1, TV2; giai đoạn 2 dồn vào TV3, TV4 (số liệu ở file tổng quan, mục 3). Bù lại bằng việc ai cũng review được cho nhau.
