# 7 repo công cụ AI và đề tài "AI-Assisted Unit Test Review"

Tài liệu này xét xem 7 repo trong [repo-summaries.md](repo-summaries.md) giúp được gì cho:

1. Đề tài nghiên cứu của nhóm 10: *AI-Assisted Unit Test Review: Can AI improve the quality of human-written unit tests?* Khoảng trống: sinh test bằng AI đã được nghiên cứu nhiều hơn review test bằng AI. Phương pháp dự kiến: AI reviewer + quality rubric + human evaluation. Hội nghị tham khảo: ICST, ESEM, APSEC.
2. Dự án nền: web Quản lý Dịch vụ Giao hàng TMĐT (Customer, Admin, Shipper; đơn hàng, vận đơn, hoàn hàng, sự cố, cập nhật real-time). Đây là nơi lấy unit test do người viết để AI review.

Các phần sau dựa trên README của repo và tài liệu trong kho (SRS §7, kế hoạch RES-01…RES-16). Chỗ nào là suy luận của người viết thì ghi rõ "đề xuất".

## 1. Kết luận ngắn

- Không repo nào review được unit test. Cả 7 đều là công cụ tìm, đọc và tổng hợp tài liệu. Vì vậy không dùng chúng làm AI reviewer chính, và cũng không cần thêm chúng vào mã của dự án.
- Chúng có ích ở hai chỗ:
  - Hỗ trợ quá trình nghiên cứu (khảo sát tài liệu, chuẩn bị context): gpt-researcher, STORM, paper-qa, MinerU, Vane, khoj.
  - Làm mẫu thiết kế cho AI reviewer của nhóm: AI-Scientist (reviewer chấm theo rubric, ensemble, reflection, đối chiếu với người), STORM (hỏi theo nhiều góc nhìn), paper-qa (mỗi nhận xét phải có bằng chứng trích dẫn), gpt-researcher (planner/executor).
- Thứ tự ưu tiên đề xuất: AI-Scientist (mẫu reviewer), paper-qa (khảo sát và mẫu "nhận xét có bằng chứng"), MinerU (chuẩn bị context), STORM, gpt-researcher, rồi Vane hoặc khoj.

## 2. Bảng đánh giá mức hỗ trợ

Thang: ●●● nhiều, ●● vừa, ● ít, - không.

| Repo | Khảo sát tài liệu (RES-02) | Chuẩn bị context / schema (RES-07) | Thiết kế reviewer + rubric (RES-03, RES-09) | Đánh giá & so với người (RES-14, RES-15) | Dùng trực tiếp cho dự án giao hàng |
|---|---|---|---|---|---|
| gpt-researcher | ●●● | ● | ● (mẫu planner/executor) | - | - |
| STORM | ●● | - | ●● (hỏi theo nhiều góc nhìn) | - | - |
| paper-qa | ●●● | ●● (đọc được cả code) | ●● (nhận xét gắn bằng chứng) | ● | ● (hỏi đáp trên SRS) |
| AI-Scientist | ● | ● | ●●● (LLM reviewer theo rubric) | ●●● (so reviewer với quyết định người) | - |
| Vane (Perplexica) | ●● | - | - | - | - |
| MinerU | ● | ●●● (PDF/DOCX → Markdown) | - | - | ● (chuyển SRS.docx, tài liệu ISTQB) |
| khoj | ●● | ●● (kho tri thức chung) | - | - | ● (hỏi đáp trên tài liệu nhóm) |

## 3. Phân tích từng repo

### 3.1 AI-Scientist: gần đề tài nhất về phương pháp

AI-Scientist có một automated reviewer: LLM đọc bài báo, chấm theo mẫu review NeurIPS (điểm từng tiêu chí, điểm mạnh/yếu, quyết định), lặp nhiều lần (ensemble) và tự xem lại (reflection). Tác giả đo độ khớp giữa reviewer này và quyết định của người trên dữ liệu ICLR.

Đổi "bài báo" thành "unit test" thì được thiết kế khá gần với của nhóm:

| AI-Scientist | Đề tài của nhóm (đề xuất) |
|---|---|
| Mẫu review NeurIPS (tiêu chí + thang điểm) | Quality rubric v1 cho unit test (RES-03): tên test mô tả hành vi, assert đủ mạnh, phủ biên/lỗi, phủ luật nghiệp vụ, độc lập, không I/O thật… |
| Output là dict JSON cố định | Schema kết quả review (RES-07): mỗi nhận xét có tiêu chí, mức độ, vị trí, đề xuất sửa |
| Ensemble N lần review rồi gộp | Chạy reviewer nhiều lần, đo độ ổn định giữa các lần (bổ sung cho RES-15) |
| Reflection | Bước tự kiểm trong workflow review có giới hạn số vòng (RES-09) |
| So với quyết định của reviewer người trên OpenReview | Human evaluation độc lập (RES-14): người chấm nhận xét của AI là đúng/sai/hữu ích |

Lưu ý: AI-Scientist chạy code do LLM sinh ra, phải chạy trong container. Reviewer của nhóm chỉ đọc test như dữ liệu nên không cần cơ chế này. License riêng có điều khoản ghi rõ khi nội dung do AI tạo; nếu mượn prompt/mẫu thì ghi nguồn.

### 3.2 paper-qa: khảo sát tài liệu và nguyên tắc "nhận xét phải có bằng chứng"

- RES-02: nạp các bài báo liên quan (test smell, test quality, LLM code review, LLM test generation, mutation testing) vào một thư mục, hỏi những câu như "Có nghiên cứu nào dùng LLM để review test do người viết không?", "Rubric nào đã được dùng để đánh giá chất lượng test?". Câu trả lời trỏ tới đoạn cụ thể trong bài nên kiểm lại được.
- Mẫu thiết kế: quy trình chọn bằng chứng rồi mới trả lời (RCS) gợi ý reviewer của nhóm nên bắt buộc mỗi nhận xét trích dòng test và mục SRS liên quan. Ví dụ: test hoàn hàng thiếu trường hợp đúng ngày thứ 15 → trích BR-03 (thời hạn 15 × 24 giờ tính từ lúc "Đã giao"). Nhận xét không có bằng chứng thì loại, giảm nhận xét bịa.
- paper-qa đọc được file code (.ts, .py…) và .docx, nên cũng dùng được để hỏi đáp trên SRS và test của dự án khi viết báo cáo.

### 3.3 MinerU: chuẩn bị context cho reviewer

Reviewer cần context: SRS, bảng luật nghiệp vụ, sơ đồ trạng thái, Test Specification. Một số tài liệu của nhóm ở dạng .docx/.pdf (SRS.docx, TestSpecification.docx, sách ISTQB, các bài báo khảo sát).

- Kho đã có `SRS.md` và `test-specification.md` làm bản gốc, nên dùng luôn bản .md, không chuyển lại từ .docx.
- MinerU có ích cho tài liệu ngoài chỉ có PDF: bài báo khảo sát, chương ISTQB về kỹ thuật thiết kế test (dùng để viết rubric). Bảng được xuất ra HTML, giữ được bảng tiêu chí.
- Cần GPU để chạy nhanh; với vài chục tài liệu có thể dùng bản online hoặc CPU.

### 3.4 STORM: reviewer theo nhiều góc nhìn

STORM đặt câu hỏi từ nhiều "góc nhìn" khác nhau để phủ chủ đề rộng hơn hỏi thẳng. Áp vào review test (đề xuất):

- Góc kỹ thuật thiết kế test: phân hoạch tương đương, giá trị biên (ví dụ BR-06: giao thất bại lần 2 so với lần 3).
- Góc luật nghiệp vụ và máy trạng thái: chuyển trạng thái không hợp lệ có bị chặn không (BR-01, BR-02).
- Góc phân quyền: Customer A có xem được đơn của Customer B không.
- Góc test smell: assert yếu, test phụ thuộc thứ tự, dùng đồng hồ thật.

Mỗi góc nhìn là một lượt review hẹp, sau đó gộp. Đây là biến thể có thể đưa vào thiết kế thực nghiệm (một prompt chung so với nhiều góc nhìn), nhưng phải khoá trước khi chạy pilot (RES-12), không đổi giữa các lần chạy.

Với RES-02, STORM/Co-STORM có thể sinh bản tổng quan ban đầu về "LLM for software testing" để nhóm có dàn ý, rồi đọc kỹ bài gốc.

### 3.5 gpt-researcher: khảo sát nhanh có nguồn

- Chạy chế độ deep research với câu hỏi như "LLM-based review of human-written unit tests, rubric, empirical evaluation" để có danh sách nguồn ban đầu và báo cáo tổng hợp (RES-02).
- Mẫu planner/executor có thể tham khảo cho workflow review: planner chia file test thành các nhóm (theo module Orders/Shipments/Returns), executor review từng nhóm. Tuy vậy với số lượng test của một đồ án môn học, một workflow tuần tự đơn giản là đủ.

### 3.6 Vane (Perplexica) và khoj: tra cứu và kho tri thức nhóm

- Vane: tra cứu web có nguồn, tự host bằng một lệnh Docker; chế độ "academic" hữu ích khi tìm bài báo. Chỉ là công cụ hỏi đáp, không có dữ liệu đầu ra có cấu trúc.
- khoj: nạp toàn bộ `docs/` (SRS, Test Plan, Test Specification) để cả nhóm hỏi đáp chung, ví dụ "luật nào chặn hoàn hàng sau 15 ngày?". License AGPL-3.0; chỉ dùng nội bộ, không sửa và phát hành lại thì không ảnh hưởng.
- Hai công cụ làm việc gần giống nhau, chọn một là đủ.

## 4. Đặt vào quy trình RES của nhóm

| Task | Công cụ đề xuất | Cách dùng |
|---|---|---|
| RES-01 Chốt câu hỏi nghiên cứu | gpt-researcher, Vane | Kiểm khoảng trống "AI review test ít hơn AI sinh test" bằng tìm kiếm có nguồn |
| RES-02 Khảo sát nghiên cứu | paper-qa (+ MinerU để đọc PDF), STORM | Hỏi đáp có trích dẫn trên tập bài báo; dàn ý tổng quan |
| RES-03 Quality rubric v1 | AI-Scientist (mẫu review), paper-qa | Mượn cấu trúc "tiêu chí + thang điểm + lý do"; tìm rubric đã có trong tài liệu |
| RES-07 Context và schema | MinerU, AI-Scientist | Chuẩn hoá tài liệu ngoài thành Markdown; schema JSON cố định cho kết quả |
| RES-09 Workflow review có giới hạn | AI-Scientist (reflection), STORM (góc nhìn), paper-qa (bằng chứng) | Giới hạn số vòng reflection; mỗi nhận xét bắt buộc có bằng chứng |
| RES-14, RES-15 Đánh giá và phân tích | AI-Scientist | Cách đo độ khớp giữa reviewer AI và người (accuracy, F1, độ ổn định giữa các lần chạy) |
| RES-04, 05, 06, 08, 10 đến 13, 16 | không | Không có repo nào trực tiếp giúp |

## 5. Liên hệ với dự án giao hàng

Unit test cần review nằm ở phần nghiệp vụ của dự án; luật trong SRS §7 là nơi AI reviewer dễ tìm thiếu sót nhất:

| Luật | Điểm test hay thiếu (ví dụ để rubric bám vào) |
|---|---|
| BR-01 Chuyển trạng thái theo sơ đồ A.2 | Chỉ test bước hợp lệ, không test bước bị cấm (ví dụ "Đã giao" quay lại trạng thái trước) |
| BR-02 Chỉ hoàn hàng khi "Đã giao" | Thiếu test yêu cầu hoàn hàng ở các trạng thái khác |
| BR-03 Hạn hoàn hàng 15 × 24 giờ | Thiếu giá trị biên đúng mốc 15 ngày; dùng đồng hồ thật thay vì giả lập thời gian |
| BR-04 Lý do "Khác" phải kèm mô tả | Thiếu test "Khác" với mô tả rỗng |
| BR-05 Kết quả chấp nhận hoàn hàng theo lý do | Chỉ test một nhánh lý do |
| BR-06 Giao thất bại đủ 3 lần thì trả lại | Thiếu biên lần 2 / lần 3 |
| BR-07 Không xử lý tiền | Test vô tình kiểm số tiền, ngoài phạm vi |

Những câu hỏi trên lấy từ SRS, không phải luật mới. Các repo trong tài liệu này không giúp viết test cho dự án; chúng chỉ hỗ trợ việc nghiên cứu và gợi ý cách thiết kế reviewer. Unit test của dự án vẫn do người viết, theo Test Specification.

## 6. Rủi ro và ràng buộc khi dùng

- Không trộn baseline: test hay gợi ý do bất kỳ công cụ AI nào sinh ra không được đưa vào bộ baseline human-only; nếu dùng thì ghi nguồn.
- Tái lập: mỗi lần chạy công cụ cho khảo sát hay thực nghiệm, ghi phiên bản (commit SHA), model, prompt và lưu kết quả thô. Không đổi model/prompt/rubric giữa các lần chạy đã khoá.
- Trích dẫn sai: các công cụ tổng hợp (gpt-researcher, STORM, Vane, khoj) đều có thể bịa hoặc trích sai; mọi bài báo đưa vào báo cáo phải mở bản gốc để kiểm.
- Chi phí: deep research và ensemble review tốn nhiều lượt gọi model; ghi chi phí để dùng cho RES-15.
- License: khoj (AGPL-3.0), AI-Scientist và MinerU (license riêng) chỉ dùng như công cụ bên ngoài, không nhúng mã vào dự án. Muốn thêm thư viện vào kho phải đi qua quy trình của nhóm.
- Bảo mật: không nạp khoá API, `.env` hay dữ liệu cá nhân vào các kho tri thức (khoj, paper-qa). Dịch vụ cloud của các công cụ gửi tài liệu ra ngoài; ưu tiên chạy cục bộ nếu có dữ liệu nhạy cảm.
