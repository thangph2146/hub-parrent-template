# AGENTS — mono-repo-template

Repo này là **feature-template upstream**. Nó không chứa product apps.

## 0. Ponytail mode — lazy senior dev

Luôn chọn cách đơn giản nhất chạy được. “Lazy” nghĩa là hiệu quả, không cẩu thả: code tốt nhất là code không cần viết.

Trước khi viết code, dừng ở nấc đầu tiên đủ dùng:

1. Có thật sự cần build không? YAGNI.
2. Standard library đã có chưa? Dùng nó.
3. Native platform feature đã cover chưa? Dùng nó.
4. Dependency đã cài sẵn có giải quyết được không? Dùng nó.
5. Có thể là một dòng không? Làm một dòng.
6. Sau cùng mới viết lượng code tối thiểu chạy được.

Quy tắc:

- Không thêm abstraction nếu không được yêu cầu rõ.
- Không thêm dependency mới nếu có thể tránh.
- Không viết boilerplate không ai hỏi.
- Ưu tiên xóa hơn thêm. Boring hơn clever. Ít file nhất có thể.
- Với request phức tạp, hỏi lại: “Có thật sự cần X không, hay Y đã đủ cover?”
- Nếu hai cách standard library ngắn tương đương, chọn cách đúng edge-case hơn; lazy là ít code, không phải thuật toán yếu hơn.
- Đánh dấu shortcut có chủ đích bằng comment `ponytail:`. Nếu shortcut có trần đã biết như global lock, scan O(n²), heuristic đơn giản, comment phải nêu trần và hướng nâng cấp.

Không được lazy với: validation ở trust boundary, error handling tránh mất dữ liệu, security, accessibility, calibration với phần cứng thật, và bất cứ điều gì user yêu cầu rõ. Logic không tầm thường phải để lại đúng **một** runnable check nhỏ nhất có thể fail khi logic hỏng: assert demo/self-check hoặc một test nhỏ, không thêm framework/fixture. One-liner tầm thường không cần test.

---

## Vai trò
- `packages/`: source dùng chung cho UI, admin app, API client, API server, query/logger/config/editor.
- `packages/api-server/deploy/config/product-line-profiles.cjs`: cấu hình tính năng theo product line: API modules, admin modules, permissions, target paths.
- `script-system/`: chỉ giữ generic tooling tối thiểu để downstream pull template, render/generate và verify shared boundary.
- `docs/`: mô tả pattern dùng chung.

Repo này **không chạy app** — không có `apps/`, `data/`, Docker, PM2, dev stack hay env runtime.

## Cấu trúc Chuẩn

```text
monorepo-template/
├── packages/
├── script-system/
├── docs/
├── template.manifest.json
├── package.json
└── pnpm-workspace.yaml
```

Workspace upstream chỉ include `packages/*`.

## Quy Tắc Làm Việc

- Tính năng dùng chung sửa trong `packages/*`.
- Cấu hình bật/tắt theo product sửa trong product-line profiles.
- Generator dùng chung nằm trong `script-system/admin` hoặc `packages/api-server/deploy/cli`.
- Không copy code từ product app về template.
- Không tạo script sync app, PM2, db, env, dev stack trong template.
- Nếu downstream cần vận hành riêng, cấu hình trong repo product rồi pull template để lấy packages/config mới.

## Sync Flow

```text
mono-repo-template
  pnpm check
  pnpm push -- "feat: ..."

downstream product
  pnpm pull:template
  pnpm post-pull:downstream
```

`pull:template` chỉ kéo shared packages, docs, generic script-system và feature profiles. Product apps luôn giữ local ở downstream.

## Lệnh Chính

```bash
pnpm check
pnpm build
pnpm lint
pnpm typecheck
pnpm pull:template --dry-run
pnpm push -- "feat: mô tả"
```

## Ranh Giới

- Không import chéo từ `apps/*` vì upstream không có `apps`.
- Không đưa entity/runtime deploy-specific vào `packages/` nếu chỉ thuộc một product.
- Không phục hồi `script-system/dev`, `script-system/db`, `script-system/env`, `script-system/graphify`, `script-system/sync/products` trong template.
- Downstream có thể giữ scripts riêng, nhưng không yêu cầu upstream sync các scripts đó.

## Tài Liệu

- `docs/TEMPLATE_MONOREPO.md`: flow pull template.
- `docs/MONOREPO_STRUCTURE.md`: kiến trúc feature-template.
- `packages/README.md`: catalog packages.
- `packages/api-server/README.md`: API server generator/template.
