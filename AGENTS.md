# AGENTS — mono-repo-template

Repo này là **feature-template upstream**. Nó không chứa product apps.

## Vai trò
- `packages/`: source dùng chung cho UI, admin app, API client, API server, query/logger/config/editor.
- `packages/api-server/deploy/config/product-line-profiles.cjs`: cấu hình tính năng theo product line: API modules, admin modules, permissions, target paths.
- `script-system/`: chỉ giữ generic tooling tối thiểu để downstream pull template, render/generate và verify shared boundary.
- `docs/`: mô tả pattern dùng chung.

`apps/`, deploy scripts, PM2, env runtime, db bootstrap và script vận hành product thuộc từng downstream repo. Không thêm lại `apps/` vào template.

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
