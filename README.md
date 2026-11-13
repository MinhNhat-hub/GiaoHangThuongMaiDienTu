# Quản lý Dịch vụ Giao hàng Thương mại điện tử — SE113 · Nhóm 10

Web riêng của một cửa hàng (không phải sàn nhiều người bán), phục vụ ba lớp người dùng:

- **Customer**: tạo đơn hàng, theo dõi tình trạng vận chuyển, yêu cầu hoàn hàng.
- **Admin**: tạo vận đơn, phân công Shipper, duyệt hoặc từ chối hoàn hàng, xử lý sự cố.
- **Shipper**: lấy hàng, giao hàng, cập nhật trạng thái, báo sự cố.

Trạng thái đơn cập nhật theo sự kiện trên màn hình đang mở, không cần tải lại trang. Chi tiết yêu cầu ở `docs/srs/`.

## Thành viên

Xem `MEMBERS.md`. Phân công công việc ở `docs/plan/04_backlog_assignment.md`.

## Cấu trúc kho

```
docs/srs/         SRS: SRS.md (bản gốc), SRS.docx (xuất từ SRS.md, chỉ để đọc và nộp), bản chia theo chương, giữ khớp với SRS.md (source/), nguồn của từng ID (source/00_id_index.md), sơ đồ draw.io (diagrams/)
docs/plan/        kế hoạch SRS, Test Plan, phân công theo backlog
docs/test-plan/   Test Plan: test_plan.md (bản gốc), TestPlan.docx (xuất từ test_plan.md, chỉ để đọc và nộp)
docs/testing/     Test Specification: test-specification.md (thiết kế test, nguồn của mọi test case), quy ước data-testid
docs/templates/   mẫu mô tả PR, mẫu review / comment và mẫu test case
diagrams/         sơ đồ Mermaid (.mmd) cho thiết kế
src/              mã nguồn (giai đoạn 2)
tests/            test (giai đoạn 2)
AGENTS.md         quy tắc cho agent lập trình
MEMBERS.md        danh sách thành viên và tài khoản GitHub
```

## Giai đoạn

1. **SRS + Test Plan** (hạn 06/11).
2. **Làm web** theo backlog trong `docs/plan/04_backlog_assignment.md`.

## Quy trình làm việc

- Mỗi việc làm trên một nhánh riêng, mở PR vào `main`. Không dùng Issues để giao việc.
- Mô tả PR theo `docs/templates/pull-request.md`.
- Ai cũng review được PR của người khác, không phân cặp cố định. PR cần ít nhất một người không phải tác giả duyệt trước khi merge. Review theo `docs/templates/review-pr.md`. Comment trên dòng mã cũng dùng mẫu này.
- Mô tả PR, bản review và comment: chạy bản cuối qua `humanizer:humanizer` trước khi đăng.
- Không commit khoá API, mật khẩu, tệp `.env`.

## Ngôn ngữ

- **Code dùng tiếng Anh**: tên biến, hàm, lớp, tệp, comment trong code, thông báo log.
- **Mô tả commit, thân PR, review, comment** viết tiếng Việt được.
- **Thuật ngữ kỹ thuật giữ tiếng Anh**, không dịch: nhãn commit (`[feat]`, `[fix]`…), tên vai trò (Customer, Admin, Shipper), các từ như merge, branch, deploy, endpoint.

## Comment trong code

- **Không truy vết trong code.** Code, comment, tên test không chứa ID SRS (`UC-`, `FR-`, `NFR-`, `BR-`…). Truy vết ghi trong mô tả PR.
- Comment chỉ mô tả code **làm gì**.
- **Không comment trong thân hàm.** Cần giải thích thì viết comment ngắn ngay trên hàm.
- **Header của file** chỉ chứa danh sách TODO còn cần bổ sung. Không còn TODO thì bỏ header.

```ts
// TODO: validate receiver phone number format
// TODO: handle shop closing hours

// Creates an order and notifies the admin dashboard.
function createOrder(input: CreateOrderInput): Order {
  const order = Order.from(input);
  orders.save(order);
  events.publish("order.created", order.id);
  return order;
}
```

## Quy ước commit

```
[loại]: <mô tả ngắn>
```

| Loại | Dùng khi |
|---|---|
| `[feat]` | Thêm chức năng |
| `[fix]` | Sửa lỗi |
| `[docs]` | Sửa tài liệu (SRS, Test Plan, README, sơ đồ) |
| `[refactor]` | Đổi cấu trúc mã, không đổi hành vi |
| `[tests]` | Thêm hoặc sửa test |
| `[chores]` | Việc lặt vặt: cấu hình, dọn tệp, cập nhật thư viện |

- Mô tả là **một câu, dưới 20 từ**, nói thay đổi này để làm gì.
- Viết tự nhiên như người viết, chạy qua `humanizer:humanizer` trước khi commit: không câu sáo rỗng, không phóng đại, không liệt kê ba ý cho đủ.

Ví dụ:

```
[docs]: Bỏ quy trình gói và kiểm PR của môn, giữ lại SRS và kế hoạch
[feat]: Customer tạo được đơn hàng mới từ trang chủ
[fix]: Shipper không còn đổi được trạng thái đơn đã giao
```

## Chạy và kiểm thử

Test hệ thống tự động (Playwright) nằm trong `tests/e2e/`. Chạy bằng:

```
npm run test:e2e
```

Bộ test chỉ chạy khi đã có server: Playwright dùng server đang chạy ở `http://localhost:5173`, nếu chưa có thì mở bằng `npm run dev`. Test dùng Chrome đã cài trên máy, không cần chạy `playwright install`.

Tài khoản dùng khi test đặt qua biến môi trường, thiếu biến nào thì test báo lỗi ngay. Chỉ ghi tên biến ở đây, giá trị đặt trên máy chạy test, không commit:

- `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`
- `E2E_ADMIN_2_EMAIL`, `E2E_ADMIN_2_PASSWORD`
- `E2E_SHIPPER_EMAIL`, `E2E_SHIPPER_PASSWORD`
- `E2E_SHIPPER_2_EMAIL`, `E2E_SHIPPER_2_PASSWORD`
- `E2E_SHIPPER_3_EMAIL`, `E2E_SHIPPER_3_PASSWORD` (Shipper chưa từng được phân công đơn, chỉ dùng cho test kiểm danh sách rỗng)
- `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`

Hai test gắn thẻ `@isolated` xóa hết danh sách sự cố hoặc yêu cầu hoàn hàng đang chờ, nên lần chạy mặc định bỏ qua. Muốn chạy thì dùng cơ sở dữ liệu sạch, không chạy cùng test khác:

```
npx playwright test --grep @isolated
```

<!-- Ghi lệnh cài đặt, chạy và test khi đã chọn công nghệ ở giai đoạn 2. -->
