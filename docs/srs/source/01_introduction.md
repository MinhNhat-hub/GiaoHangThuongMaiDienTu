# 1 Giới thiệu

## 1.1 Mục đích

Tài liệu này đặc tả yêu cầu phần mềm (Software Requirements Specification, SRS) cho phiên bản 1.0 của Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử. Tài liệu mô tả các yêu cầu chức năng và phi chức năng của hệ thống.

Người dùng tài liệu gồm người phát triển web, người kiểm thử và giảng viên. Người phát triển web dựa vào tài liệu để xây dựng hệ thống. Người kiểm thử dựa vào tài liệu để kiểm tra hệ thống hoạt động đúng. Test Plan §2 lấy ID yêu cầu từ tài liệu này.

## 1.2 Quy ước tài liệu

| Loại | Định dạng | Ví dụ |
|---|---|---|
| Tính năng | FE-x (như bộ mẫu COS [3]) | FE-1 |
| Use Case | UC-xx, đánh số liên tục | UC-01 |
| Yêu cầu chức năng | Nhóm.Việc.ChiTiết (như bộ mẫu COS [3]). Nhóm: Order (3.1), Track (3.2), Return (3.3), Issue.Report (3.4.1), Issue.Resolve (3.4.2), Account (3.5) | Order.Create.Receiver |
| Ngoại lệ trong UC | x.0.Ey (như bộ mẫu COS [3]) | 3.0.E2 |
| Quy tắc nghiệp vụ | BR-xx, đánh số liên tục | BR-01 |
| Yêu cầu phi chức năng | RT-x, SEC-x, ROB-x | RT-1 |
| Giao diện | UI-x, SI-x, CI-x | CI-1 |
| Môi trường / Ràng buộc / Giả định / Phụ thuộc | OE-x, CO-x, AS-x, DE-x | AS-1 |
| Dữ liệu | DI-x | DI-1 |

Yêu cầu chức năng là các mã dạng Nhóm.Việc.ChiTiết ở mục 3. Yêu cầu phi chức năng gồm các mã OE, CO, UI, SI, CI, DI, RT, SEC, ROB. Mã AS, DE là giả định và phụ thuộc, không phải yêu cầu.

Luật viết:

- Câu yêu cầu viết "Hệ thống phải …" (dịch từ "shall"). Mỗi câu chỉ chứa 1 yêu cầu.
- Thuật ngữ dùng đúng Phụ lục B. Lần đầu xuất hiện có thể ghi kèm tiếng Anh trong ngoặc.
- Tham chiếu chứ không chép lại: "(xem BR-03)", "(xem Hình A.2)".
- Không tự đặt số liệu. Chưa có thì ghi "chưa có số liệu".

Chỗ nhóm chưa chốt ghi TBD (xem C-x); mọi vấn đề này được liệt kê ở Phụ lục C. Phiên bản này không còn chỗ TBD.

## 1.3 Phạm vi dự án và tính năng

Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử là web riêng của một cửa hàng, không phải sàn có nhiều người bán. Customer (người mua) tạo đơn hàng, theo dõi tình trạng vận chuyển và yêu cầu hoàn hàng; Admin (nhân viên cửa hàng) tạo vận đơn, phân công Shipper, duyệt yêu cầu hoàn hàng và xử lý sự cố; Shipper giao hàng và cập nhật trạng thái. Trạng thái đơn hàng được cập nhật theo sự kiện (real-time) trên màn hình người dùng đang mở, không cần tải lại trang (xem RT-1).

Phiên bản 1.0 gồm 4 tính năng. Cả 4 có độ ưu tiên Cao, vì đề bài [1] bắt buộc cả 4.

- **FE-1:** Tạo đơn hàng (xem 3.1).
- **FE-2:** Theo dõi tình trạng vận chuyển (xem 3.2).
- **FE-3:** Hoàn hàng (xem 3.3).
- **FE-4:** Xử lý ngoại lệ: hỏng, trả lại, thất lạc (xem 3.4).

Ngoài phạm vi phiên bản 1.0 (mã trong ngoặc là dòng backlog, xem [2]):

- Nhiều cửa hàng (xem AS-1).
- Báo cáo thống kê (A41, A54–A57, A70).
- Quản lý tài khoản người dùng / Shipper (A33, A34).
- Sửa / hủy / tìm kiếm đơn hàng đã lưu (A35–A37).
- Thanh toán, phí, hoàn tiền, bồi thường. Hệ thống chỉ ghi nhận kết quả xử lý (xem BR-07).
- Danh mục sản phẩm, đánh giá sản phẩm, kho trung chuyển.
- Hoàn hàng hoặc báo sự cố cho từng sản phẩm trong đơn hàng. Yêu cầu hoàn hàng và sự cố áp dụng cho cả đơn hàng.
- Báo sự cố khi đơn hàng không ở trạng thái "Đang giao", ví dụ hàng hỏng hoặc thất lạc lúc đơn ở "Đang hoàn hàng" (xem Hình A.2).

Đăng ký, đăng nhập, đăng xuất không thuộc 4 tính năng của đề bài. Yêu cầu của chúng nằm ở mục 3.5 (Tài khoản), SEC-1, SEC-9 đến SEC-11 và PRE-1 của các Use Case.

## 1.4 Tài liệu tham khảo

1. Đề tài 20: Ứng dụng Quản lý Dịch vụ Giao hàng Thương mại điện tử. Đề đồ án cuối kỳ, môn SE113 Kiểm chứng phần mềm, Trường Đại học Công nghệ Thông tin.
2. Nhóm 10. Backlog dự án (BackLogPlan.xlsx), Bài tập 1, môn SE113 Kiểm chứng phần mềm, 09/2026.
3. Wiegers, Karl. Cafeteria Ordering System, Release 1.0: Vision and Scope Document, Use Cases, Software Requirements Specification (Version 1.0 approved) và Business Rules. Process Impact, 2013. Kèm ví dụ cùng tác giả: Software Requirements Specification for PearlsFromSand.com, Version 1.1 approved, 2013.
4. Giảng viên. Test Plan, slide bài giảng môn SE113 Kiểm chứng phần mềm, Trường Đại học Công nghệ Thông tin, cập nhật 03/2014.
5. (S1) Shopee Blog – Cách trả hàng hoàn tiền trên Shopee. https://shopee.vn/blog/cach-tra-hang-hoan-tien-tren-shopee/
6. (S2) Shopee Blog – Kiểm tra đơn hàng Shopee. https://shopee.vn/blog/kiem-tra-don-hang-shopee/
7. (S3) Công ty TNHH Shopee Express – Điều khoản sử dụng SPX Express. https://spx.vn/T&C.pdf
8. (S4) VnExpress 13/3/2024 – Shopee cập nhật chính sách đổi trả hàng. https://vnexpress.net/shopee-cap-nhat-chinh-sach-doi-tra-hang-4721617.html
9. (S5) BigSeller 16/07/2026 – SPX Express là gì? Tra cứu đơn hàng. https://www.bigseller.com/blog/articleDetails/spx-express-la-gi-tra-cuu-don-hang.4760.htm
10. (S6) GHN – Chính sách bồi thường của GHN (Mới), áp dụng cho đơn hàng tạo từ 20/05/2026. https://ghn.vn/pages/chinh-sach-boi-thuong-cua-ghn-moi
11. (S7) GHTK Blog 13/10/2025 – Đơn hàng giao lại tối đa mấy lần? Chi tiết chính sách giao lại tại GHTK. https://ghtk.vn/blog/giao-lai/
12. (S8) LuatVietnam 04/06/2018 – Đã cập nhật Quyết định chuyển thuê bao 11 số sang 10 số (Quyết định 798/QĐ-BTTTT). https://luatvietnam.vn/tin-van-ban-moi/da-cap-nhat-quyet-dinh-chuyen-thue-bao-11-so-sang-10-so-186-16629-article.html
13. (S9) WHATWG – HTML Living Standard, mục 4.10.5 The input element (định nghĩa valid e-mail address). https://html.spec.whatwg.org/multipage/input.html
14. (S10) OWASP Cheat Sheet Series – Authentication Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
15. (S11) OWASP Cheat Sheet Series – Password Storage Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
16. (S12) IETF – RFC 5321 Simple Mail Transfer Protocol, mục 4.5.3.1.3 (độ dài đường dẫn 256 octet), và errata 1690 của RFC 3696 (địa chỉ email tối đa 254 ký tự). https://www.rfc-editor.org/rfc/rfc5321 ; https://www.rfc-editor.org/errata/eid1690

Các nguồn S1–S12 chỉ dùng để tham khảo nghiệp vụ và kỹ thuật. Mọi con số trong tài liệu là quyết định của nhóm; nguồn tham khảo của con số ghi ở cột Nguồn của quy tắc nghiệp vụ (xem mục 7) hoặc ở từ điển dữ liệu (xem mục 4.2).
