# DateTimeChecker

Bài tập lab SE113, nhóm 10. Đây không thuộc đồ án lớn "Quản lý Dịch vụ Giao hàng Thương mại điện tử".

Ứng dụng kiểm tra ngày hợp lệ và số ngày trong tháng. Lớp `DateChecker` trong `DateTimeChecker/` là phần lõi, còn `DateTimeChecker.Tests/` chứa bộ test NUnit (Lab3).

## Cấu trúc

- `DateTimeChecker/`: thư viện lõi (`DateChecker.DaysInMonth`, `DateChecker.CheckDate`).
- `DateTimeChecker.Tests/`: bộ test NUnit.
- `DateTimeChecker.App/`: form WinForms (`DateTimeChecker.exe`).
- `DateTimeCheckerApp.slnx`: solution gồm các project trên.

## Lệnh

Chạy từ thư mục gốc của repo:

```bash
dotnet build DateTimeCheckerApp.slnx
dotnet test DateTimeCheckerApp.slnx
dotnet run --project DateTimeChecker.App
```

## Lưu ý về phiên bản .NET

Đề bài yêu cầu .NET Framework 2.0 (Visual Studio 2005-2008). Bài này dùng .NET 10, giống Lab3, vì máy hiện chỉ có .NET SDK 10.

## Đóng gói

Chạy từ thư mục gốc của repo:

```bash
dotnet publish DateTimeChecker.App -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:DebugType=none -o publish
```

Lệnh trên tự đổi tên `DateTimeChecker.App.exe` thành `publish/DateTimeChecker.exe` (không có tệp `.pdb`). Giữ thư mục `publish/Resources/` (có `logo.png`) cạnh exe, rồi nén cả thư mục thành `DateTimeChecker-win-x64.zip` ở thư mục gốc. Cả `publish/` lẫn tệp zip đều không đưa vào git. Kết quả test và checklist Lab1 nằm ở `docs/test-results.md`.
