# DateTimeChecker App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng ứng dụng WinForms DateTimeChecker đúng giao diện và hành vi trong ProjectIntroduction, để nhóm chạy test case Lab1 (thủ công) và Lab2/Lab3 (NUnit) rồi ghi kết quả nộp bài.

**Architecture:** Một solution gồm ba project. `DateTimeChecker` là thư viện logic: thuật toán `DaysInMonth`/`CheckDate` lấy nguyên từ Lab3, cộng thêm `InputValidator` kiểm tra dữ liệu chuỗi từ textbox. Mọi câu thông báo đều nằm trong thư viện này để test được. `DateTimeChecker.App` là form WinForms mỏng, chỉ đọc textbox và hiện MessageBox theo kết quả thư viện trả về. `DateTimeChecker.Tests` là NUnit, gồm 32 test của Lab3 cộng test mới cho `InputValidator`.

**Tech Stack:** C#, .NET SDK 10.0.400 (`net10.0` cho thư viện và test, `net10.0-windows` cho WinForms), NUnit 5.0.0, NUnit3TestAdapter 6.3.1, Microsoft.NET.Test.Sdk 18.11.0 (giống csproj Lab3 đã chạy được 32/32).

**Spec:** `D:\SE113-Project\Project\DateTimeCheckerApp\docs\ProjectIntroduction.docx` (bản sao của `D:\Download\ProjectIntroduction (3).docx`). Test case đối chiếu: Lab1 `lab1-team10.xlsx`, Lab2 `lab2-team10.xls`, Lab3 `docs/Labs/Lab3/...` trong PR #17 (`MinhNhat-hub/GiaoHangThuongMaiDienTu`, nhánh `add-labs-documents`).

## Global Constraints

- Đây là bài tập lab, **không** thuộc đồ án lớn. Toàn bộ code nằm ở `D:\SE113-Project\Project\DateTimeCheckerApp\`, là repo git riêng, chỉ commit cục bộ. Không đụng vào `GiaoHangThuongMaiDienTu/`.
- Ngôn ngữ C#, theo C# coding convention (PascalCase cho kiểu và phương thức, camelCase cho biến cục bộ).
- Spec yêu cầu ".NET Framework 2.0 / VS2005–2008". Máy chỉ có .NET SDK 10, nên dùng .NET 10 WinForms giống Lab3. Ghi rõ điểm lệch này trong README.
- Form: không có Maximize box và Minimize box; tiêu đề "Date Time Checker" chữ `Color.Blue`, font `Arial` cỡ `26`; nhãn "Day", "Month", "Year" căn trái; 3 textbox; 2 nút "Clear", "Check"; PictureBox logo ở góc trên bên trái.
- Logo: dùng ảnh logo của nhóm hoặc trường, đặt ở `DateTimeChecker.App/Resources/logo.png`. Không nhúng logo FPT trong ảnh chụp của spec.
- Miền giá trị: Day `1–31`, Month `1–12`, Year `1000–3000`.
- Câu thông báo (giữ nguyên chữ, kể cả dấu `!`), với `{Field}` là `Day`, `Month` hoặc `Year`:
  - Sai định dạng: title `Error`, icon Error, `Input data for {Field} is incorrect format!`
  - Ngoài miền: title `Error`, icon Error, `Input data for {Field} is out of range!`
  - Ngày đúng: title `Message`, icon Information, `{dd/mm/yyyy} is correct date time!`
  - Ngày sai: title `Message`, icon Information, `{dd/mm/yyyy} is NOT correct date time!`
  - Đóng form: title `Confirm`, icon Information, nút Yes/No, `Are you sure to exit?`
- `dd/mm/yyyy` in có số 0 đứng trước, ví dụ `29/02/2020`, `01/01/1000` (khớp Expected Output của Lab1 Module3).
- Thuật toán phải đúng lưu đồ Figure 3 (`DaysInMonth`: kiểm tra chia hết 400 → 100 → 4) và Figure 4 (`IsValidDate`). Trong code tên hàm là `CheckDate`, giống Lab3 và đề Lab2/Lab3.
- Kết quả hiện ra trong vòng 1 giây sau khi bấm Check. Ứng dụng không được crash với bất kỳ dữ liệu nhập nào.
- Commit theo quy ước nhóm: `[feat]`/`[fix]`/`[docs]`/`[tests]`/`[chores]`: mô tả ngắn.

## Review Focus

1. Ô nhập để trống: phải báo `incorrect format!`, không crash.
2. Có khoảng trắng hai đầu (`" 12 "`): cắt khoảng trắng rồi chấp nhận như `12`.
3. Chuỗi toàn chữ số nhưng tràn `int` (`"99999999999"`): phải báo `out of range!`, không báo sai định dạng và không crash.
4. Số âm (`"-1"`): là một số, nên báo `out of range!`.
5. Số thập phân hoặc chữ số không phải ASCII (`"1.5"`, `"١٢"`, `"１２"`): báo `incorrect format!`. Lưu ý `\d` trong .NET khớp cả chữ số Unicode, nên phải dùng `[0-9]`.

Cả năm trường hợp này đều có test ở Task 2.

---

## File Structure

```
DateTimeCheckerApp/
├── DateTimeCheckerApp.slnx
├── README.md                          # cách build/chạy/test, ghi chú lệch .NET 2.0
├── docs/ProjectIntroduction.docx
├── docs/plans/2026-11-07-datetimechecker-app.md
├── DateTimeChecker/                   # thư viện logic (net10.0)
│   ├── DateTimeChecker.csproj
│   ├── DateTimeChecker.cs             # DateChecker.DaysInMonth / CheckDate (từ Lab3)
│   ├── CheckResult.cs                 # CheckStatus enum + CheckResult record
│   └── InputValidator.cs              # kiểm tra chuỗi nhập + tạo câu thông báo
├── DateTimeChecker.App/               # WinForms (net10.0-windows)
│   ├── DateTimeChecker.App.csproj
│   ├── Program.cs
│   ├── MainForm.cs                    # xử lý sự kiện
│   ├── MainForm.Designer.cs           # bố cục control
│   └── Resources/logo.png
└── DateTimeChecker.Tests/             # NUnit (net10.0)
    ├── DateTimeChecker.Tests.csproj
    ├── DaysInMonthTests.cs            # 17 test, từ Lab3
    ├── CheckDateTests.cs              # 15 test, từ Lab3
    └── InputValidatorTests.cs         # test mới
```

---

### Task 1: Dựng solution và chuyển code, test Lab3 sang

**Files:**
- Create: `DateTimeCheckerApp.slnx`, `.gitignore`, `README.md`
- Create: `DateTimeChecker/DateTimeChecker.csproj`, `DateTimeChecker/DateTimeChecker.cs`
- Create: `DateTimeChecker.Tests/DateTimeChecker.Tests.csproj`, `DaysInMonthTests.cs`, `CheckDateTests.cs`

**Interfaces:**
- Produces: `namespace DateTimeChecker; public class DateChecker { public static int DaysInMonth(int year, int month); public static bool CheckDate(int year, int month, int day); }`. `DaysInMonth` trả về `0` khi tháng không hợp lệ.

- [ ] **Step 1: Khởi tạo repo và lấy tệp Lab3 từ PR #17**

```bash
cd /d/SE113-Project/Project/DateTimeCheckerApp && git init
git -C /d/SE113-Project/Project/GiaoHangThuongMaiDienTu fetch origin pull/17/head
L=docs/Labs/Lab3/DateTimeChecker
G="git -C /d/SE113-Project/Project/GiaoHangThuongMaiDienTu show FETCH_HEAD"
mkdir -p DateTimeChecker DateTimeChecker.Tests
$G:$L/DateTimeChecker/DateTimeChecker.cs        > DateTimeChecker/DateTimeChecker.cs
$G:$L/DateTimeChecker/DateTimeChecker.csproj    > DateTimeChecker/DateTimeChecker.csproj
$G:$L/DateTimeChecker.Tests/DaysInMonthTests.cs > DateTimeChecker.Tests/DaysInMonthTests.cs
$G:$L/DateTimeChecker.Tests/CheckDateTests.cs   > DateTimeChecker.Tests/CheckDateTests.cs
$G:$L/DateTimeChecker.Tests/DateTimeChecker.Tests.csproj > DateTimeChecker.Tests/DateTimeChecker.Tests.csproj
```

Không sửa nội dung các tệp này. Chúng là bài Lab3 đã nộp.

- [ ] **Step 2: Tạo solution, `.gitignore`, README**

```bash
dotnet new sln --format slnx -n DateTimeCheckerApp
dotnet sln add DateTimeChecker/DateTimeChecker.csproj DateTimeChecker.Tests/DateTimeChecker.Tests.csproj
dotnet new gitignore
```

README ghi: mục đích (bài tập lab SE113, nhóm 10), lệnh build/test/chạy app, và điểm lệch .NET 10 so với ".NET 2.0" của spec.

- [ ] **Step 3: Chạy test**

Run: `dotnet test DateTimeCheckerApp.slnx`
Expected: `Passed!  - Failed: 0, Passed: 32`

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "[chores]: Dựng solution và chép code, test của Lab3"
```

---

### Task 2: `InputValidator`: kiểm tra dữ liệu nhập và tạo câu thông báo

**Files:**
- Create: `DateTimeChecker/CheckResult.cs`
- Create: `DateTimeChecker/InputValidator.cs`
- Test: `DateTimeChecker.Tests/InputValidatorTests.cs`

**Interfaces:**
- Consumes: `DateChecker.CheckDate(int year, int month, int day)` (Task 1).
- Produces:
  - `public enum CheckStatus { FormatError, RangeError, ValidDate, InvalidDate }`
  - `public sealed record CheckResult(CheckStatus Status, string Title, string Message);`
  - `public static class InputValidator { public static CheckResult Check(string? dayText, string? monthText, string? yearText); }`
  - Thứ tự kiểm: Day (định dạng → miền) → Month (định dạng → miền) → Year (định dạng → miền) → `CheckDate`. Gặp lỗi đầu tiên thì trả về ngay.

- [ ] **Step 1: Viết test (đang fail)**

`InputValidatorTests.cs`, `[TestFixture] public class InputValidatorTests`, dùng `[TestCase]`. Mỗi ca assert cả ba trường `Status`, `Title`, `Message`:

```csharp
// Định dạng: Title "Error"
[TestCase("ab", "6", "2023", "Day")]
[TestCase("15", "xy", "2023", "Month")]
[TestCase("15", "6", "abcd", "Year")]
[TestCase("", "6", "2023", "Day")]          // Review Focus 1
[TestCase(null, "6", "2023", "Day")]
[TestCase("1.5", "6", "2023", "Day")]       // Review Focus 5
[TestCase("١٢", "6", "2023", "Day")]        // Review Focus 5 (Arabic-Indic)
[TestCase("１２", "6", "2023", "Day")]       // Review Focus 5 (full-width)
public void FormatError(string? d, string? m, string? y, string field) =>
    Assert.That(InputValidator.Check(d, m, y), Is.EqualTo(new CheckResult(
        CheckStatus.FormatError, "Error", $"Input data for {field} is incorrect format!")));

// Ngoài miền: Title "Error"
[TestCase("0", "6", "2023", "Day")]
[TestCase("32", "6", "2023", "Day")]
[TestCase("-1", "6", "2023", "Day")]        // Review Focus 4
[TestCase("99999999999", "6", "2023", "Day")] // Review Focus 3
[TestCase("15", "0", "2023", "Month")]
[TestCase("15", "13", "2023", "Month")]
[TestCase("15", "6", "999", "Year")]
[TestCase("15", "6", "3001", "Year")]
public void RangeError(...)  // Message $"Input data for {field} is out of range!"

// Ưu tiên: Day lỗi thì không xét tiếp Month
[Test] public void DayCheckedBeforeMonth() =>
    Assert.That(InputValidator.Check("ab", "xy", "abcd").Message,
        Is.EqualTo("Input data for Day is incorrect format!"));

// Ngày đúng / sai: Title "Message", có số 0 đứng trước
[TestCase("29", "2", "2020", "29/02/2020 is correct date time!")]
[TestCase("29", "2", "2000", "29/02/2000 is correct date time!")]
[TestCase("1", "1", "1000", "01/01/1000 is correct date time!")]
[TestCase("31", "12", "3000", "31/12/3000 is correct date time!")]
[TestCase(" 15 ", " 6 ", " 2023 ", "15/06/2023 is correct date time!")] // Review Focus 2
public void ValidDate(...)   // Status ValidDate

[TestCase("29", "2", "2019", "29/02/2019 is NOT correct date time!")]
[TestCase("29", "2", "1900", "29/02/1900 is NOT correct date time!")]
[TestCase("31", "4", "2021", "31/04/2021 is NOT correct date time!")]
public void InvalidDate(...) // Status InvalidDate
```

Các giá trị lấy từ Expected Output của Lab1 Module2 và Module3.

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `dotnet test DateTimeCheckerApp.slnx`
Expected: lỗi build `The name 'InputValidator' does not exist`

- [ ] **Step 3: Viết `CheckResult.cs` và `InputValidator.Check`**

Mỗi trường đi qua một hàm private `ParseField(string? text, string field, int min, int max)`, theo các bước:
- `Trim()` chuỗi nhập.
- Không khớp `^[+-]?[0-9]+$`: trả về `FormatError`.
- `int.TryParse` thất bại (tràn số) hoặc giá trị nằm ngoài `[min, max]`: trả về `RangeError`.
- Còn lại: trả về giá trị số.

Định dạng ngày dùng `$"{day:00}/{month:00}/{year:0000}"`.

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `dotnet test DateTimeCheckerApp.slnx`
Expected: `Failed: 0`. Tổng = 32 + số `[TestCase]` của Step 1.

- [ ] **Step 5: Commit**

```bash
git add DateTimeChecker DateTimeChecker.Tests && git commit -m "[feat]: Thêm InputValidator kiểm tra dữ liệu nhập và câu thông báo"
```

---

### Task 3: Form WinForms: bố cục, Clear, Check, Close

**Files:**
- Create: `DateTimeChecker.App/DateTimeChecker.App.csproj` (`<OutputType>WinExe</OutputType>`, `<TargetFramework>net10.0-windows</TargetFramework>`, `<UseWindowsForms>true</UseWindowsForms>`, `<AssemblyName>DateTimeChecker</AssemblyName>`, ProjectReference tới `..\DateTimeChecker\DateTimeChecker.csproj`, `logo.png` để `CopyToOutputDirectory=PreserveNewest`)
- Create: `Program.cs`, `MainForm.cs`, `MainForm.Designer.cs`, `Resources/logo.png`
- Modify: `DateTimeCheckerApp.slnx` (thêm project)

**Interfaces:**
- Consumes: `InputValidator.Check(...)`, `CheckResult`, `CheckStatus` (Task 2).
- Produces: `DateTimeChecker.exe`, dùng cho Task 4.

Tạo project bằng `dotnet new winforms -n DateTimeChecker.App -f net10.0`, rồi sửa các thuộc tính trên.

- [ ] **Step 1: Bố cục trong `MainForm.Designer.cs`** (kích thước khoảng 410×320, theo Figure 1)

| Control | Name | Thuộc tính chốt |
|---|---|---|
| Form | `MainForm` | `Text="Date Time Checker"`, `MaximizeBox=false`, `MinimizeBox=false`, `FormBorderStyle=FixedSingle`, `StartPosition=CenterScreen`, `AcceptButton=btnCheck` |
| PictureBox | `picLogo` | góc trên bên trái (12,12), `SizeMode=Zoom`, nạp `Resources/logo.png` nếu tệp tồn tại |
| Label | `lblTitle` | `Text="Date Time Checker"`, `ForeColor=Color.Blue`, `Font=new Font("Arial", 26F)` |
| Label ×3 | `lblDay`, `lblMonth`, `lblYear` | `TextAlign=MiddleLeft`, cùng toạ độ X |
| TextBox ×3 | `txtDay`, `txtMonth`, `txtYear` | `TabIndex` theo thứ tự 0, 1, 2 |
| Button | `btnClear` | `Text="Clear"`, `TabIndex=3` |
| Button | `btnCheck` | `Text="Check"`, `TabIndex=4` |

- [ ] **Step 2: Sự kiện trong `MainForm.cs`**
- `btnClear_Click`: xoá chữ trong ba textbox, rồi focus `txtDay`.
- `btnCheck_Click`: gọi `var r = InputValidator.Check(txtDay.Text, txtMonth.Text, txtYear.Text);` rồi `MessageBox.Show(r.Message, r.Title, MessageBoxButtons.OK, icon)`. `icon` là `MessageBoxIcon.Error` khi `Status` là `FormatError` hoặc `RangeError`, còn lại là `MessageBoxIcon.Information`. Không viết thêm logic kiểm tra nào trong form.
- `MainForm_FormClosing`: chỉ xử lý khi `e.CloseReason == CloseReason.UserClosing`. Hiện `MessageBox.Show("Are you sure to exit?", "Confirm", MessageBoxButtons.YesNo, MessageBoxIcon.Information)`. Chọn No thì đặt `e.Cancel = true`.

- [ ] **Step 3: Build**

Run: `dotnet build DateTimeCheckerApp.slnx`
Expected: `Build succeeded. 0 Warning(s) 0 Error(s)`. Chạy lại `dotnet test` vẫn `Failed: 0`.

- [ ] **Step 4: Chạy app, kiểm thủ công nhanh**

Run: `dotnet run --project DateTimeChecker.App`. Kiểm từng mục:
- Bố cục giống Figure 1, không có nút Maximize/Minimize.
- Nhập `ab` vào Day rồi bấm Check: hiện hộp "Error / Input data for Day is incorrect format!".
- Nhập `29`/`2`/`2020`: hiện "29/02/2020 is correct date time!".
- Bấm Clear: ba ô trống.
- Bấm X chọn No: app vẫn chạy. Bấm X chọn Yes: app thoát và chỉ hỏi một lần.
- Alt+F4 cũng hiện hộp Confirm.

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "[feat]: Thêm form DateTimeChecker theo bố cục và luồng của spec"
```

---

### Task 4: Đóng gói exe, chạy test case Lab1/Lab2, ghi kết quả

**Files:**
- Create: `publish/DateTimeChecker.exe` (không commit, đã có trong `.gitignore`)
- Modify: bản sao làm việc của `lab1-team10.xlsx`, `lab2-team10.xls` (lấy từ PR #17), sửa bằng Excel

**Interfaces:**
- Consumes: exe từ Task 3 và lần chạy NUnit từ Task 2.

- [ ] **Step 1: Đóng gói**

Run: `dotnet publish DateTimeChecker.App -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o publish`
Expected: có `publish/DateTimeChecker.exe`, chạy được trên máy không cài .NET. Đây là bản "installation software" của spec.

- [ ] **Step 2: Chạy 35 test case Lab1 trên exe**

Mở exe, làm theo cột Test Case Procedure của Module1, Module2, Module3. Ở mỗi dòng ghi cột Result (`Pass`/`Fail`), Test date (ngày chạy thật, dạng dd/mm/yyyy) và Tester (TV1–TV4). Nhân tiện sửa ID thiếu số: `[Module1 -]` → `[Module1-0]`… hoặc đánh số lại từ 1, sao cho thống nhất cả ba sheet.

- [ ] **Step 3: Ghi kết quả Lab2 từ NUnit**

Run: `dotnet test DateTimeCheckerApp.slnx --filter "FullyQualifiedName~DaysInMonthTests|FullyQualifiedName~CheckDateTests" --logger "trx;LogFileName=lab3.trx"`
Expected: `Passed: 32`. Điền `P` vào dòng Passed/Failed cho UTCID01–15 (sheet IsValidDate) và UTCID01–17 (sheet DaysInMonth), kèm Executed By và Executed Date. Kiểm sheet Test Report: Test coverage phải ra `100%`.

- [ ] **Step 4: Chụp ảnh minh chứng**

Chụp form chính, hộp Confirm, một hộp Error, hộp correct, hộp NOT correct, và kết quả `dotnet test`. Lưu vào `docs/screenshots/` để đưa vào báo cáo.

- [ ] **Step 5: Commit**

```bash
git add README.md docs && git commit -m "[docs]: Thêm ảnh minh chứng và hướng dẫn chạy test"
```

Tệp xlsx và xls đã điền kết quả thuộc PR #17 của repo nhóm. Gửi cho tác giả PR #17 để cập nhật vào PR. Không commit chúng ở đây.
