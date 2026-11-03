# Sơ đồ

Sơ đồ thiết kế (giai đoạn 2) viết bằng **Mermaid**, đuôi `.mmd`, không bọc trong ```mermaid. Sơ đồ của SRS nằm ở `docs/srs/diagrams/` (draw.io).

## Tên tệp

| Tệp | Loại Mermaid |
|---|---|
| `use-case.mmd` | `flowchart` (Mermaid chưa có use case chuẩn, xem quy ước bên dưới) |
| `seq-*.mmd` | `sequenceDiagram` |
| `class.mmd` | `classDiagram` |
| `state.mmd` | `stateDiagram-v2` |
| `c4-context.mmd`, `c4-container.mmd` | `C4Context`, `C4Container` |

## Quy ước use case bằng flowchart

```
flowchart LR
  Customer([Customer])
  Admin([Admin])
  subgraph System[Delivery management]
    UC1(Create order)
    UC2(Assign shipper)
    UC3(Sign in)
  end
  Customer --> UC1
  Admin --> UC2
  UC1 -. include .-> UC3
```

Tác nhân dùng `([ ])`, use case dùng `( )`, include dùng mũi tên đứt `-. include .->`.

## Quy ước đặt tên

- Tên lớp, phương thức, participant bằng tiếng Anh, khớp với tên trong `src/`.
- Tên lớp trong `seq-*.mmd`: `participant ClassName`, **dùng đúng tên lớp** trong `class.mmd`, không đặt biệt danh.
- Phương thức gọi trong sequence: `A->>B: methodName(...)`, và `methodName` phải có trong lớp `B`.
- Đổi tên lớp trong `class.mmd` thì sửa luôn các `seq-*.mmd` dùng lớp đó.

## Xem trước

VS Code thì cài extension "Markdown Preview Mermaid Support", hoặc dán thẳng vào `mermaid.live`.

Trước khi push, kiểm cú pháp ở máy mình: `npx -y @mermaid-js/mermaid-cli -i diagrams/class.mmd -o /tmp/x.svg`
