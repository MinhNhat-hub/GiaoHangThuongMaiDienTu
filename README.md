# Quản lý Dịch vụ Giao hàng Thương mại điện tử — SE113 · Nhóm 10

Web riêng của một cửa hàng (không phải sàn nhiều người bán), phục vụ ba lớp người dùng:

- **Customer**: tạo đơn hàng, theo dõi tình trạng vận chuyển, yêu cầu hoàn hàng.
- **Admin**: tạo vận đơn, phân công Shipper, duyệt hoặc từ chối hoàn hàng, xử lý sự cố.
- **Shipper**: lấy hàng, giao hàng, cập nhật trạng thái, báo sự cố.

Trạng thái đơn cập nhật theo sự kiện trên màn hình đang mở, không cần tải lại trang. Chi tiết yêu cầu ở `docs/SRS/`.

## Thành viên

Xem `THANH-VIEN.md`. Phân công công việc ở `docs/KeHoach/04_Backlog_PhanCong.md`.

## Cấu trúc kho

```
docs/SRS/         SRS: nguồn Markdown theo chương (nguon/), sơ đồ draw.io (so-do/), bản SRS.docx
docs/KeHoach/     kế hoạch SRS, Test Plan, phân công theo backlog
diagrams/         sơ đồ Mermaid (.mmd) cho thiết kế
src/              mã nguồn (giai đoạn 2)
tests/            test
AGENTS.md         quy tắc cho agent lập trình
THANH-VIEN.md     danh sách thành viên
```

## Giai đoạn

1. **SRS + Test Plan** (hạn 06/11).
2. **Làm web** theo backlog trong `docs/KeHoach/04_Backlog_PhanCong.md`.

## Quy trình làm việc

- Mỗi việc làm trên một nhánh riêng, mở PR vào `main`.
- Một thành viên khác người làm review PR trước khi merge.
- Không commit khoá API, mật khẩu, tệp `.env`.

## Chạy và kiểm thử

<!-- Ghi lệnh cài đặt, chạy và test khi đã chọn công nghệ ở giai đoạn 2. -->
