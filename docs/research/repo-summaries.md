# Tóm tắt 7 repo công cụ AI hỗ trợ nghiên cứu

Số liệu lấy từ GitHub API ngày 21/11/2026 (sao, ngôn ngữ, license, lần push gần nhất). Nội dung tính năng dựa trên README của từng repo tại thời điểm đó; phiên bản có thể đổi, cần kiểm lại trước khi trích dẫn.

## Bảng tổng quan

| Repo | Loại công cụ | Ngôn ngữ | License | Sao | Push gần nhất |
|---|---|---|---|---|---|
| [assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher) | Agent nghiên cứu sâu, xuất báo cáo | Python | Apache-2.0 | ~30.8k | 12/11/2026 |
| [stanford-oval/storm](https://github.com/stanford-oval/storm) | Sinh bài tổng quan kiểu Wikipedia có trích dẫn | Python | MIT | ~31.9k | 30/09/2025 |
| [Future-House/paper-qa](https://github.com/Future-House/paper-qa) | RAG hỏi đáp trên tài liệu khoa học | Python | Apache-2.0 | ~9.6k | 16/11/2026 |
| [SakanaAI/AI-Scientist](https://github.com/SakanaAI/AI-Scientist) | Tự động hoá vòng nghiên cứu: ý tưởng, thí nghiệm, viết bài, review | Python/Jupyter | License riêng (không phải OSI) | ~15k | 19/12/2025 |
| [ItzCrazyKns/Perplexica](https://github.com/ItzCrazyKns/Perplexica), nay là Vane | Answer engine tự host (thay Perplexity) | TypeScript | MIT | ~38.3k | 01/09/2026 |
| [opendatalab/MinerU](https://github.com/opendatalab/MinerU) | Chuyển PDF/Office sang Markdown/JSON cho LLM | Python | License riêng (xem repo) | ~84k | 20/11/2026 |
| [khoj-ai/khoj](https://github.com/khoj-ai/khoj) | "Second brain" tự host: chat trên tài liệu, web, agent, automation | Python | AGPL-3.0 | ~38.2k | 02/08/2026 |

Nhóm lại theo việc chúng làm:

- Tìm và tổng hợp tài liệu từ web: gpt-researcher, STORM, Vane (Perplexica), khoj.
- Hỏi đáp có trích dẫn trên tài liệu của mình: paper-qa, khoj.
- Chuẩn bị tài liệu thành dữ liệu cho LLM: MinerU.
- Tự động hoá cả quy trình nghiên cứu, kèm reviewer bằng LLM: AI-Scientist.


## 1. GPT Researcher

Mục đích: Agent tự động nghiên cứu một câu hỏi trên web hoặc trên tài liệu cục bộ, rồi viết báo cáo có nguồn.

Cách hoạt động:
- Kiến trúc planner/executor: agent lập kế hoạch sinh ra các câu hỏi con; các agent thực thi chạy song song, mỗi agent tìm nguồn, đọc, tóm tắt và lọc theo độ liên quan; planner gộp lại thành báo cáo.
- Chế độ "deep research" đi theo cây (độ rộng × độ sâu) để đào sâu chủ đề.
- Nguồn: web (nhiều search engine), tài liệu cục bộ (PDF, Markdown, Word, Excel…), MCP server.
- Xuất báo cáo dài (thường >2.000 từ) ra Markdown, PDF, Word; có frontend web, có thể dùng như thư viện Python.
- Hỗ trợ nhiều nhà cung cấp LLM (OpenAI, Anthropic, model cục bộ…).

Điểm mạnh: Nhanh có bản tổng quan có trích nguồn; tách planner/executor rõ ràng; dễ nhúng vào script.

Giới hạn: Chất lượng phụ thuộc search engine và model; vẫn có thể trích sai hoặc bịa; mỗi lần chạy tốn nhiều lượt gọi model.

## 2. STORM / Co-STORM (Stanford OVAL)

Mục đích: Viết bài tổng quan dài kiểu Wikipedia, có trích dẫn, từ một chủ đề.

Cách hoạt động:
- Giai đoạn *pre-writing*: tìm các góc nhìn (perspective) khác nhau về chủ đề, rồi mô phỏng hội thoại giữa "người viết mang góc nhìn đó" và "chuyên gia có quyền tra web" để đặt câu hỏi sâu hơn so với hỏi thẳng.
- Từ hội thoại sinh dàn ý, sau đó viết từng mục kèm trích dẫn.
- Co-STORM: người dùng cùng tham gia cuộc thảo luận của các agent, kết quả được tổ chức thành "mind map" động.
- Có gói `knowledge-storm` trên PyPI; module hoá (retriever, LM cho từng bước thay được).

Điểm mạnh: Kỹ thuật hỏi theo nhiều góc nhìn có công bố (NAACL 2024, EMNLP 2024), giúp phủ chủ đề rộng hơn.

Giới hạn: Repo ít cập nhật từ 2025; bài sinh ra chưa đạt chất lượng xuất bản, chính tác giả lưu ý điều này.

## 3. PaperQA2 (FutureHouse)

Mục đích: RAG độ chính xác cao để trả lời câu hỏi trên tập tài liệu khoa học, có trích dẫn tới đoạn cụ thể.

Cách hoạt động:
- Đọc PDF, txt, md, html, docx, xlsx, pptx và cả mã nguồn (.py, .ts, .yaml…).
- Quy trình agentic: tìm tài liệu → thu thập bằng chứng (chia đoạn, dùng LLM chấm điểm và tóm tắt từng đoạn theo câu hỏi, gọi là RCS: re-rank & contextual summarization) → sinh câu trả lời chỉ từ bằng chứng đã chọn.
- Tự lấy metadata (số trích dẫn, retraction) qua Crossref/Semantic Scholar.
- Dùng được qua CLI (`pqa ask ...`) hoặc thư viện Python; chọn model qua LiteLLM. Từ 12/2025 đánh phiên bản theo CalVer.

Điểm mạnh: Báo cáo của tác giả: đạt hoặc vượt chuyên gia trong một số tác vụ tra cứu khoa học; mỗi câu trả lời gắn nguồn kiểm được.

Giới hạn: Chỉ trả lời tốt khi tài liệu đã có trong tập; tốn token cho bước chấm từng đoạn.

## 4. The AI Scientist (Sakana AI)

Mục đích: Thử tự động hoá trọn vòng nghiên cứu ML: sinh ý tưởng, kiểm tính mới, viết code thí nghiệm, chạy, vẽ biểu đồ, viết bài LaTeX và tự review bài.

Cách hoạt động:
- Chạy trên các *template* (NanoGPT, 2D Diffusion, Grokking…); mỗi template là một codebase thí nghiệm gốc.
- Dùng Aider để sửa code thí nghiệm, Semantic Scholar/OpenAlex để kiểm tính mới.
- Automated reviewer: LLM đọc bài và chấm theo mẫu review NeurIPS (điểm từng tiêu chí, điểm mạnh/yếu, quyết định accept/reject); dùng *ensemble* nhiều lần review và *reflection* (tự xem lại) để ổn định kết quả. Tác giả có so khớp reviewer này với quyết định của người trên dữ liệu ICLR (OpenReview).
- Có bản tiếp theo AI-Scientist-v2 (repo riêng) dùng tìm kiếm dạng cây.

Điểm mạnh: Mẫu thiết kế "LLM reviewer chấm theo rubric + đối chiếu với người" rất gần đề tài của nhóm.

Giới hạn: Chạy code do LLM sinh ra nên tác giả yêu cầu chạy trong sandbox/container; tốn chi phí; license riêng có điều khoản sử dụng có trách nhiệm (phải công bố khi bài viết do AI tạo).

## 5. Perplexica (nay là Vane)

Mục đích: Answer engine mã nguồn mở, tự host, thay cho Perplexity AI. Repo đã đổi tên thành Vane (link cũ vẫn chuyển hướng).

Cách hoạt động:
- Tìm web qua SearxNG (meta search engine tự host, giữ riêng tư), sau đó LLM tổng hợp câu trả lời có nguồn.
- Nhiều chế độ tập trung (web, học thuật, video, Reddit…), tải file lên để hỏi, lịch sử hội thoại.
- Chạy bằng một lệnh Docker (image kèm sẵn SearxNG), giao diện web cổng 3000; dùng được model cục bộ (Ollama) hoặc API.
- Stack Next.js/TypeScript.

Điểm mạnh: Cài nhanh, không gửi truy vấn tìm kiếm qua bên thứ ba nếu dùng model cục bộ.

Giới hạn: Chủ yếu là công cụ hỏi đáp tương tác, không có pipeline đánh giá hay xuất dữ liệu có cấu trúc.

## 6. MinerU (OpenDataLab)

Mục đích: Chuyển tài liệu phức tạp (PDF, ảnh scan, Office) thành Markdown/JSON sạch, giữ cấu trúc để đưa vào LLM hay pipeline RAG.

Cách hoạt động:
- Phân tích bố cục: tách tiêu đề, đoạn, bảng (xuất HTML), công thức (xuất LaTeX), hình; bỏ header/footer/số trang; giữ thứ tự đọc cả với bố cục nhiều cột.
- OCR đa ngôn ngữ cho tài liệu scan.
- Nhiều backend (pipeline truyền thống và VLM), chạy CPU hoặc GPU; có CLI, Python SDK, API, Docker, và từ bản 4.x có hướng dẫn riêng cho agent ("Agent Guide").
- Phiên bản hiện tại 4.x (có trang hướng dẫn nâng cấp từ 3.x).

Điểm mạnh: Chất lượng chuyển bảng và công thức cao; repo phát triển rất nhanh.

Giới hạn: Model nặng, chạy tốt nhất với GPU NVIDIA; license riêng, cần đọc kỹ trước khi dùng ngoài mục đích học tập.

## 7. Khoj

Mục đích: Trợ lý AI "second brain" tự host: chat trên tài liệu cá nhân và web, tạo agent riêng, lên lịch automation, deep research.

Cách hoạt động:
- Đánh chỉ mục tài liệu (PDF, Markdown, Org-mode, Word, Notion, GitHub…) để tìm kiếm ngữ nghĩa và chat có trích nguồn.
- Dùng được nhiều model (GPT, Claude, Gemini, Llama, Qwen, Mistral; cục bộ hoặc API).
- Truy cập qua web, desktop, Obsidian, Emacs, WhatsApp; tạo agent với persona, tri thức và công cụ riêng; automation gửi kết quả theo lịch.
- Có bản cloud và bản tự host (Docker).

Điểm mạnh: Gom tài liệu nhóm thành một kho hỏi đáp chung; nhiều cổng truy cập.

Giới hạn: AGPL-3.0: nếu sửa và cung cấp qua mạng thì phải công khai mã; cài đặt tự host nặng hơn Vane.


## Ghi chú chung

- Cả 7 repo là công cụ hỗ trợ tìm và đọc tài liệu; không repo nào sinh hay review unit test. Mức liên quan tới đề tài của nhóm phân tích ở [ai-assisted-test-review-relevance.md](ai-assisted-test-review-relevance.md).
- Mọi công cụ dùng LLM đều có thể trích sai nguồn; kết quả dùng trong báo cáo phải kiểm lại bằng tài liệu gốc.
