# AGENTS Quick Guide (hub-parent-template)

Tài liệu này là **entry point ngắn gọn** cho agent. Chi tiết đầy đủ nằm trong `docs/admin-pattern/` và các step docs ở root.

## Quy trình bắt buộc trước khi code

Trước khi sửa bất kỳ file code nào, agent phải đọc và làm theo:

1. `docs/admin-pattern/PRE_CODE_PROTOCOL.md`
2. Các tài liệu liên quan được liệt kê trong protocol đó

Nếu task liên quan admin page trong `apps/backend`, phải đọc `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md` trước khi sửa source.

> Lưu ý: `docs/steps/*.md` là lộ trình chính cho agent. Dùng `docs/admin-pattern/` và `docs/pages/` làm tài liệu bổ trợ.

## Đọc trước khi sửa

1. `docs/admin-pattern/README.md`
2. `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
3. `docs/admin-pattern/AGENTS_GUIDE.md`
4. `docs/admin-pattern/FRONTEND_UX.md` (khi chỉnh `apps/frontend`)
5. `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` (khi triển khai page admin trong `apps/backend`)
6. `.graphify/markdown/SUMMARY_FOR_AI.md` (chỉ mục monorepo + link tới từng app)
7. `packages/.graphify/markdown/SUMMARY_FOR_AI.md` (danh sách workspace packages)
8. `apps/frontend/.graphify/markdown/SUMMARY_FOR_AI.md`
9. `apps/backend/.graphify/markdown/SUMMARY_FOR_AI.md`
10. `apps/api/.graphify/markdown/SUMMARY_FOR_AI.md`

Sau `.graphify/markdown/SUMMARY_FOR_AI.md`, dùng mục **Chỉ dẫn theo chủ đề** trong cùng file để chọn đúng `FOLDER_TREE.md` / `GRAPH_STATS.md` / `API_DOMAIN_IMPORTS.md` / `WORKSPACE_DEPS.md` (cùng thư mục `markdown/` của từng scope) theo việc cần làm.

### Tài liệu bổ trợ theo package

Khi task liên quan tới một package cụ thể, đọc thêm:
- **`@workspace/ui`** (`packages/ui/`): `docs/ui-pattern/README.md` + `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`
- **`@workspace/api-client`** (`packages/api-client/`): `docs/api-client-pattern/README.md`
- **`@thangph2146/lexical-editor`** (`packages/editor/`): `packages/editor/README.md`
- **`@workspace/logger`** (`packages/logger/`): `docs/logger-pattern/README.md`
- **`@workspace/query-client`** (`packages/query-client/`): `docs/query-client-pattern/README.md`
- **`@workspace/eslint-config`** (`packages/eslint-config/`): config files, không cần doc riêng
- **`@workspace/typescript-config`** (`packages/typescript-config/`): config files, không cần doc riêng

### Step-by-step docs cho agent
- `docs/steps/step1_system_overview.md`
- `docs/steps/step2_clean_code_guidelines.md`
- `docs/steps/step3_admin_pattern_docs.md`
- `docs/steps/step4_graphify_reading.md`
- `docs/steps/step5_feature_implementation_guides.md`
- `docs/steps/step6_code_execution_and_change_tracking.md`
- `docs/steps/step7_review_pr_and_system_memory.md`
- `docs/steps/step8_architecture_maintenance.md`
- `docs/steps/step9_follow_up_rollback_legacy_tracking.md`
- `docs/steps/step10_agent_task_automation.md`

Lưu ý: chỉ mở `apps/*/.graphify/snapshot/context.json` khi cần trích đoạn cụ thể (file lớn, nhúng full source). Sau refactor kiến trúc: chạy `node scripts/graphify-update.cjs apps/<app>` cho app đổi cây file → `pnpm graphify:ai-summary`, rồi đối chiếu checklist trong `.graphify/README.md`. Skill Cursor (tùy chọn): `.cursor/skills/hub-graphify-standardize-loop/SKILL.md` — vòng chuẩn hóa → kiểm tra → làm mới graph → đọc lại markdown.

## Lệnh chuẩn bắt buộc

```bash
pnpm check
```

Nếu có thay đổi kiến trúc/module/routes: chạy `node scripts/graphify-update.cjs apps/<app>` cho từng app bị ảnh hưởng, rồi:

```bash
pnpm check:full
```

(`check:full` = `pnpm check` + `pnpm graphify:ai-summary`; không tự chạy `update.cjs` — xem checklist `.graphify/README.md`.)

## PM2 production — 2 composition

Factory chung: `ecosystem.shared.cjs`. Hai file stack:

| # | Composition (3 app) | File PM2 | Alias |
|---|---|---|---|
| **1** | `apps/api` + `apps/backend` + `apps/frontend` | `ecosystem.main.cjs` | `ecosystem.config.cjs` |
| **2** | `apps/api` + `apps/backend` + `apps/hub-event-checkin-frontend` | `ecosystem.checkin.cjs` | — |

**Không chạy đồng thời** compo 1 và compo 2 trên cùng máy — trùng port 3000 / 3001 / 3002.

### Compo 1 — site chính (`ecosystem.main.cjs`)

| Thư mục | Package | Tên PM2 | Port |
|---|---|---|---|
| `apps/api` | `@api` | `hub-parent-api` | 3002 |
| `apps/backend` | `@backend` | `hub-parent-backend` | 3001 |
| `apps/frontend` | `@frontend` | `hub-parent-frontend` | 3000 |

```bash
pnpm pm2:start
# pm2 start ecosystem.main.cjs
# pm2 start ecosystem.config.cjs
pnpm pm2:reload      # zero-downtime (sau pull code)
pnpm pm2:restart     # stop + start lại toàn stack
pnpm pm2:stop
```

### Compo 2 — check-in sự kiện (`ecosystem.checkin.cjs`)

| Thư mục | Package | Tên PM2 | Port |
|---|---|---|---|
| `apps/api` | `@api` | `hub-checkin-api` | 3002 |
| `apps/backend` | `@backend` | `hub-checkin-backend` | 3001 |
| `apps/hub-event-checkin-frontend` | `@hub-event-checkin-frontend` | `hub-checkin-frontend` | 3000 |

```bash
pnpm pm2:start:checkin
# pm2 start ecosystem.checkin.cjs
pnpm pm2:reload:checkin
pnpm pm2:restart:checkin
pnpm pm2:stop:checkin
```

### Chuẩn bị trước khi start (production)

```bash
pnpm install
pnpm --filter @api run build
pnpm --filter @backend run build
pnpm --filter @frontend run build
# stack check-in: pnpm --filter @hub-event-checkin-frontend run build
pnpm db -- migration:up   # khi có migration mới
```

### Chạy riêng một app trong compo

```bash
pm2 start ecosystem.main.cjs --only hub-parent-api
pm2 start ecosystem.main.cjs --only hub-parent-backend
pm2 start ecosystem.main.cjs --only hub-parent-frontend

pm2 start ecosystem.checkin.cjs --only hub-checkin-api
pm2 start ecosystem.checkin.cjs --only hub-checkin-backend
pm2 start ecosystem.checkin.cjs --only hub-checkin-frontend
```

### Vận hành thường dùng

```bash
pm2 status
pm2 logs hub-parent-api
pm2 logs hub-checkin-api --lines 100
pnpm pm2:delete:checkin    # gỡ toàn bộ process compo 2
pnpm pm2:delete            # gỡ toàn bộ process compo 1
pm2 save                   # giữ process list sau reboot
pm2 startup                # tạo systemd (chạy một lần trên server)
```

Script `scripts/pm2-stack.cjs` ghi `.pm2-ecosystem-<stack>.json` rồi gọi PM2 — tránh lỗi một số bản PM2 chạy file `.cjs` như script (`ecosystem.checkin` fork 1 instance).

### Xóa đúng process (quan trọng)

`pm2 delete ecosystem.checkin` **chỉ** xóa process tên `ecosystem.checkin` (lỗi PM2 parse `.cjs`). **Không** xóa `hub-parent-*` hay `hub-checkin-*`.

| Muốn dừng stack | Lệnh |
|---|---|
| Compo 1 — `hub-parent-api`, `hub-parent-backend`, `hub-parent-frontend` | `pnpm pm2:delete` (tự bỏ qua nếu không tìm thấy; dọn cả tên cũ `hub-main-*`) hoặc `pm2 delete hub-parent-api hub-parent-backend hub-parent-frontend` |
| Compo 2 — `hub-checkin-api`, `hub-checkin-backend`, `hub-checkin-frontend` | `pnpm pm2:delete:checkin` hoặc `pm2 delete hub-checkin-api hub-checkin-backend hub-checkin-frontend` |
| Process lỗi `ecosystem.checkin` | `pm2 delete ecosystem.checkin` |

### Chuyển compo (ví dụ: site chính → check-in)

```bash
pnpm pm2:delete              # dừng hub-parent-* (3 process đang chạy)
pm2 delete ecosystem.checkin   # nếu còn process lỗi
git pull
pnpm pm2:start:checkin
pm2 status                     # phải thấy hub-checkin-* (3 process)
pm2 save
```

Chi tiết deploy server: `README.md` (mục PM2).

## Nguyên tắc microservice

- Không import chéo source giữa các app trong `apps/*`.
- Frontend/Backend giao tiếp với API qua HTTP + `@workspace/api-client`.
- Logic dùng chung đặt ở `packages/*` khi thật sự còn được sử dụng.
- **Admin components PHẢI từ `@ui`** — không tạo local trong `apps/backend/src/components/` hay `apps/backend/src/app/**/_components/`. Nếu thiếu, thêm vào `packages/ui/src/components/admin/`.
- **API Client** PHẢI qua `@workspace/api-client` — không tự viết fetch trực tiếp tới `apps/api`.
- Khi sửa API (`apps/api`): đọc `docs/api-pattern/README.md`.
- Khi sửa API client (`packages/api-client`) hoặc gọi API từ app: đọc `docs/api-client-pattern/README.md`.
- Ranh giới được kiểm soát bởi:
  - `packages/eslint-config/service-boundaries.js`
  - `scripts/verify-service-boundaries.mjs`
