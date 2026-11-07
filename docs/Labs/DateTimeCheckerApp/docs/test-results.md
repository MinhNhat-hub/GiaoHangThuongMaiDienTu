# Kết quả test DateTimeChecker

Nhóm 10, lab SE113. Tài liệu này gồm kết quả chạy NUnit (Lab2/Lab3), danh sách kiểm Lab1 cho `DateTimeChecker.exe`, và các ảnh minh chứng còn thiếu.

## 1. Kết quả NUnit (Lab2, Lab3)

- Ngày chạy: 07/11/2026.
- Lệnh:

```bash
dotnet test DateTimeCheckerApp.slnx --filter "FullyQualifiedName~DaysInMonthTests|FullyQualifiedName~CheckDateTests" --logger "trx;LogFileName=lab3.trx"
```

- Kết quả: `Passed: 32, Failed: 0, Skipped: 0, Total: 32`. Tệp trx nằm ở `DateTimeChecker.Tests/TestResults/lab3.trx` (không commit).
- Sau khi điền kết quả vào `lab2-team10.xls`, mở sheet "Test Report" và xác nhận ô Test coverage hiện 100%.
- Lab2 gọi hàm là `IsValidDate`, còn trong mã là `DateChecker.CheckDate`. Hai tên chỉ cùng một hàm.
- Thứ tự tham số trong mã: `CheckDate(year, month, day)` và `DaysInMonth(year, month)`. Cột Input bên dưới ghi theo thứ tự đó.
- Cột P là kết quả NUnit thật của lần chạy trên. Có thể chép sang dòng Passed/Failed của hai sheet trong `lab2-team10.xls`.

| Hàm | Passed | Failed | Total |
|---|---|---|---|
| IsValidDate (CheckDate) | 15 | 0 | 15 |
| DaysInMonth | 17 | 0 | 17 |
| Tổng | 32 | 0 | 32 |

### 1.1 IsValidDate (`CheckDate(year, month, day)`)

| UTCID | Input (year, month, day) | Expected | NUnit |
|---|---|---|---|
| UTCID01 | 2024, 1, 15 | True | P |
| UTCID02 | 2024, 1, 1 | True | P |
| UTCID03 | 2024, 1, 31 | True | P |
| UTCID04 | 2024, 1, 32 | False | P |
| UTCID05 | 2024, 4, 30 | True | P |
| UTCID06 | 2024, 4, 31 | False | P |
| UTCID07 | 2023, 2, 28 | True | P |
| UTCID08 | 2023, 2, 29 | False | P |
| UTCID09 | 2024, 2, 29 | True | P |
| UTCID10 | 2024, 2, 30 | False | P |
| UTCID11 | 2000, 2, 29 | True | P |
| UTCID12 | 1900, 2, 29 | False | P |
| UTCID13 | 2024, 0, 15 | False | P |
| UTCID14 | 2024, 13, 15 | False | P |
| UTCID15 | 2024, 12, 0 | False | P |

### 1.2 DaysInMonth (`DaysInMonth(year, month)`)

| UTCID | Input (year, month) | Expected | NUnit |
|---|---|---|---|
| UTCID01 | 2024, 1 | 31 | P |
| UTCID02 | 2024, 3 | 31 | P |
| UTCID03 | 2024, 5 | 31 | P |
| UTCID04 | 2024, 7 | 31 | P |
| UTCID05 | 2024, 8 | 31 | P |
| UTCID06 | 2024, 10 | 31 | P |
| UTCID07 | 2024, 12 | 31 | P |
| UTCID08 | 2024, 4 | 30 | P |
| UTCID09 | 2024, 6 | 30 | P |
| UTCID10 | 2000, 2 | 29 | P |
| UTCID11 | 1900, 2 | 28 | P |
| UTCID12 | 2024, 2 | 29 | P |
| UTCID13 | 2023, 2 | 28 | P |
| UTCID14 | 2024, 0 | 0 | P |
| UTCID15 | 2024, 13 | 0 | P |
| UTCID16 | 2024, 9 | 30 | P |
| UTCID17 | 2024, 11 | 30 | P |

## 2. Danh sách kiểm Lab1 (35 ca, chạy tay trên `DateTimeChecker.exe`)

Cách làm: mở `DateTimeChecker.exe`, làm theo cột Test Case Procedure trong `lab1-team10.xlsx`, rồi điền Result (`Pass`/`Fail`), Tester (TV1 đến TV4) và Test date (dd/mm/yyyy) vào bảng dưới và vào bản xlsx. Hai cột cuối của bảng để trống cho tới khi chạy thật.

Ánh xạ ID: trong xlsx, ID bị thiếu số ở ca đầu mỗi sheet. Bảng này đánh số lại từ 01 cho thống nhất.

| ID trong bảng này | ID trong xlsx |
|---|---|
| Module1-01 | `[Module1 -]` |
| Module1-02 đến Module1-10 | `[Module1 -1]` đến `[Module1 -9]` |
| Module2-01 | `[Module2-]` |
| Module2-02 đến Module2-15 | `[Module2-1]` đến `[Module2-14]` |
| Module3-01 | `[Module3-]` |
| Module3-02 đến Module3-10 | `[Module3-1]` đến `[Module3-9]` |

### 2.1 Module1 (giao diện, đóng form, Clear)

| ID | Mô tả ngắn | Kết quả mong đợi | Result | Tester | Test date |
|---|---|---|---|---|---|
| Module1-01 | Logo FU nằm góc trên bên trái form | The FU Logo picture box is displayed at the top-left corner of the form, as shown in Figure 1. |  |  |  |
| Module1-02 | Tiêu đề "Date Time Checker" màu Blue, font Arial, cỡ 26 | The text "Date Time Checker" is displayed with fore color Blue, font name Arial, size 26. |  |  |  |
| Module1-03 | Nhãn Day, Month, Year canh trái | The three labels "Day", "Month", "Year" are all left-aligned on the form. |  |  |  |
| Module1-04 | Có ba textbox nhập Day, Month, Year | Three separate textboxes are displayed, one each for Day, Month and Year input. |  |  |  |
| Module1-05 | Có hai nút Clear và Check | Two buttons labeled "Clear" and "Check" are displayed on the form. |  |  |  |
| Module1-06 | Form không có nút Maximize, Minimize | Only the Close (X) button is displayed; Maximize and Minimize boxes are not present. |  |  |  |
| Module1-07 | Bấm X hiện hộp thoại xác nhận thoát | A confirmation Message Box is displayed asking the user to confirm exiting the application (Figure 2). |  |  |  |
| Module1-08 | Chọn Yes trên hộp xác nhận thì thoát ứng dụng | The application closes / exits. |  |  |  |
| Module1-09 | Chọn No trên hộp xác nhận thì ứng dụng vẫn chạy | The confirmation message box closes and the application remains running. |  |  |  |
| Module1-10 | Clear xóa trống cả ba textbox | The Day, Month and Year textboxes are all emptied (blank). |  |  |  |

### 2.2 Module2 (kiểm tra dữ liệu nhập)

| ID | Mô tả ngắn | Kết quả mong đợi | Result | Tester | Test date |
|---|---|---|---|---|---|
| Module2-01 | Day không phải số báo lỗi | A Message Box is displayed indicating the Day input is not a number (Figure 5). |  |  |  |
| Module2-02 | Day = 0 báo ngoài khoảng 1-31 | A Message Box is displayed indicating the Day value is out of range 1-31 (Figure 6). |  |  |  |
| Module2-03 | Day = 32 báo ngoài khoảng 1-31 | A Message Box is displayed indicating the Day value is out of range 1-31. |  |  |  |
| Module2-04 | Day = 1 (biên dưới) không báo lỗi khoảng | No range-error message is shown for the Day field; processing continues to date validation. |  |  |  |
| Module2-05 | Day = 31 (biên trên) không báo lỗi khoảng | No range-error message is shown for the Day field; processing continues to date validation. |  |  |  |
| Module2-06 | Month không phải số báo lỗi | A Message Box is displayed indicating the Month input is not a number. |  |  |  |
| Module2-07 | Month = 0 báo ngoài khoảng 1-12 | A Message Box is displayed indicating the Month value is out of range 1-12. |  |  |  |
| Module2-08 | Month = 13 báo ngoài khoảng 1-12 | A Message Box is displayed indicating the Month value is out of range 1-12. |  |  |  |
| Module2-09 | Month = 1 (biên dưới) không báo lỗi khoảng | No range-error message is shown for the Month field; processing continues to date validation. |  |  |  |
| Module2-10 | Month = 12 (biên trên) không báo lỗi khoảng | No range-error message is shown for the Month field; processing continues to date validation. |  |  |  |
| Module2-11 | Year không phải số báo lỗi | A Message Box is displayed indicating the Year input is not a number. |  |  |  |
| Module2-12 | Year = 999 báo ngoài khoảng 1000-3000 | A Message Box is displayed indicating the Year value is out of range 1000-3000. |  |  |  |
| Module2-13 | Year = 3001 báo ngoài khoảng 1000-3000 | A Message Box is displayed indicating the Year value is out of range 1000-3000. |  |  |  |
| Module2-14 | Year = 1000 (biên dưới) không báo lỗi khoảng | No range-error message is shown for the Year field; processing continues to date validation. |  |  |  |
| Module2-15 | Year = 3000 (biên trên) không báo lỗi khoảng | No range-error message is shown for the Year field; processing continues to date validation. |  |  |  |

### 2.3 Module3 (thuật toán ngày)

| ID | Mô tả ngắn | Kết quả mong đợi | Result | Tester | Test date |
|---|---|---|---|---|---|
| Module3-01 | 29/02/2020 (nhuận, chia hết 4) hợp lệ | A Message Box shows the date is valid: "29/02/2020" (Figure 7). |  |  |  |
| Module3-02 | 29/02/2019 (không nhuận) không hợp lệ | A Message Box shows the date is invalid: "29/02/2019". |  |  |  |
| Module3-03 | 29/02/2000 (chia hết 400) hợp lệ | A Message Box shows the date is valid: "29/02/2000". |  |  |  |
| Module3-04 | 29/02/1900 (chia hết 100, không chia hết 400) không hợp lệ | A Message Box shows the date is invalid: "29/02/1900". |  |  |  |
| Module3-05 | 31/04/2021 không hợp lệ (tháng 4 có 30 ngày) | A Message Box shows the date is invalid: "31/04/2021". |  |  |  |
| Module3-06 | 30/04/2021 hợp lệ | A Message Box shows the date is valid: "30/04/2021". |  |  |  |
| Module3-07 | 31/12/2021 hợp lệ | A Message Box shows the date is valid: "31/12/2021". |  |  |  |
| Module3-08 | 01/01/1000 (biên dưới) hợp lệ | A Message Box shows the date is valid: "01/01/1000". |  |  |  |
| Module3-09 | 31/12/3000 (biên trên) hợp lệ | A Message Box shows the date is valid: "31/12/3000". |  |  |  |
| Module3-10 | 15/06/2023 (ngày thường) hợp lệ | A Message Box shows the date is valid: "15/06/2023". |  |  |  |

## 3. Ảnh minh chứng

Đã có:

- `docs/screenshots/main-form.png`: form chính.

Còn thiếu, cần chụp khi chạy `DateTimeChecker.exe` và lưu vào `docs/screenshots/`:

- Hộp Confirm khi bấm X.
- Hộp Error định dạng (ví dụ Day nhập `ab`).
- Hộp Error ngoài khoảng (ví dụ Day nhập `32`).
- Hộp "correct" (ví dụ 29/02/2020).
- Hộp "NOT correct" (ví dụ 29/02/2019).
- Kết quả `dotnet test` (32/32 Passed).
