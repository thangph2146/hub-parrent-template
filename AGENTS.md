# AGENTS Quick Guide (hub-parent-template)

Tài liệu này là **entry point ngắn gọn** cho agent. Chi tiết đầy đủ nằm trong `docs/admin-pattern/` và các step docs ở root.

## Quy trình bắt buộc trước khi code

Trước khi sửa bất kỳ file code nào, agent phải đọc và làm theo:

1. `docs/admin-pattern/PRE_CODE_PROTOCOL.md`
2. Các tài liệu liên quan được liệt kê trong protocol đó

Nếu task liên quan admin page trong `apps/main/backend`, phải đọc `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md` trước khi sửa source.

Cấu trúc product line: `docs/MONOREPO_STRUCTURE.md` · quy tắc `apps/`: `apps/README.md` (chỉ sửa `apps/main/` khi dev; line deploy qua sync) · env: `docs/env/README.md` (`pnpm env:init`, `pnpm verify:env`).

> Lưu ý: `docs/steps/*.md` là lộ trình chính cho agent. Dùng `docs/admin-pattern/` và `docs/pages/` làm tài liệu bổ trợ.

## Đọc trước khi sửa

1. `docs/admin-pattern/README.md`
2. `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
3. `docs/admin-pattern/AGENTS_GUIDE.md`
4. `docs/admin-pattern/FRONTEND_UX.md` (khi chỉnh `apps/frontend`)
5. `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` (khi triển khai page admin trong `apps/backend`)
6. `.graphify/markdown/SUMMARY_FOR_AI.md` (chỉ mục monorepo + link tới từng app)
7. `packages/.graphify/markdown/SUMMARY_FOR_AI.md` (danh sách workspace packages)
8. `apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`
9. `apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`
10. `apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`

Sau `.graphify/markdown/SUMMARY_FOR_AI.md`, dùng mục **Chỉ dẫn theo chủ đề** trong cùng file để chọn đúng `FOLDER_TREE.md` / `GRAPH_STATS.md` / `API_DOMAIN_IMPORTS.md` / `WORKSPACE_DEPS.md` (cùng thư mục `markdown/` của từng scope) theo việc cần làm.

### Tài liệu bổ trợ theo package

Khi task liên quan tới một package cụ thể, đọc thêm:

- **`@workspace/ui`** (`packages/ui/`): `docs/ui-pattern/README.md` + `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`
- **`@workspace/api-client`** (`packages/api-client/`): `docs/api-client-pattern/README.md`
- **`@workspace/api-server`** (`packages/api-server/`): `packages/api-server/README.md` + `docs/api-pattern/README.md`
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

Lưu ý: chỉ mở `apps/*/.graphify/snapshot/context.json` khi cần trích đoạn cụ thể (file lớn, nhúng full source). Sau refactor kiến trúc: `pnpm graphify:refresh` (hoặc `node script-system/graphify/graphify-update.cjs apps/<app>` → `pnpm graphify:ai-summary`), rồi đối chiếu checklist trong `.graphify/README.md`. Skill Cursor: `.cursor/skills/hub-graphify-standardize-loop/SKILL.md` — vòng chuẩn hóa → kiểm tra → làm mới graph → đọc lại markdown.

## Lệnh chuẩn bắt buộc

```bash
pnpm check
```

Nếu có thay đổi kiến trúc/module/routes: chạy `node script-system/graphify/graphify-update.cjs apps/<app>` cho từng app bị ảnh hưởng, rồi:

```bash
pnpm check:full
```

(`check:full` = `pnpm check` + `pnpm graphify:ai-summary`; không tự chạy `graphify-update` — xem checklist `.graphify/README.md`. Gộp snapshot + summary: `pnpm graphify:refresh`.)

## PM2 production — 2 composition

Factory chung: `ecosystem.shared.cjs`. Hai file stack:

| #     | Composition (3 app)                                             | File PM2                | Alias                  |
| ----- | --------------------------------------------------------------- | ----------------------- | ---------------------- |
| **1** | `hub-parent/api` + `main/backend` + `hub-parent-frontend` | `ecosystem.main.cjs`    | `ecosystem.config.cjs` |
| **2** | `hub-event/api` + `hub-event-checkin-frontend` (2 app)    | `ecosystem.checkin.cjs` | —                      |

**Không chạy đồng thời** compo 1 và compo 2 trên cùng máy — trùng port 3000 / 3001 / 3002.

### Compo 1 — site chính (`ecosystem.main.cjs`)

| Thư mục         | Package     | Tên PM2               | Port |
| --------------- | ----------- | --------------------- | ---- |
| `apps/hub-parent/api` | `@hub-parent/api` | `hub-parent-api`      | 3002 |
| `apps/main/backend`   | `@backend`        | `hub-parent-backend`  | 3001 |
| `apps/hub-parent/hub-parent-frontend` | `@frontend` | `hub-parent-frontend` | 3000 |

```bash
pnpm pm2:start
# pm2 start ecosystem.main.cjs
# pm2 start ecosystem.config.cjs
pnpm pm2:reload      # zero-downtime (sau pull code)
pnpm pm2:restart     # stop + start lại toàn stack
pnpm pm2:stop
```

### Compo 2 — check-in sự kiện (`ecosystem.checkin.cjs`)

| Thư mục                           | Package                       | Tên PM2                | Port |
| --------------------------------- | ----------------------------- | ---------------------- | ---- |
| `apps/hub-event/api` | `@hub-event/api` | `hub-checkin-api`      | 3002 |
| `apps/hub-event/hub-event-checkin-frontend` | `@hub-event-checkin-frontend` | `hub-checkin-frontend` | 3000 |

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

Script `script-system/pm2-stack.cjs` ghi `.pm2-ecosystem-<stack>.json` rồi gọi PM2 — tránh lỗi một số bản PM2 chạy file `.cjs` như script (`ecosystem.checkin` fork 1 instance).

### Xóa đúng process (quan trọng)

`pm2 delete ecosystem.checkin` **chỉ** xóa process tên `ecosystem.checkin` (lỗi PM2 parse `.cjs`). **Không** xóa `hub-parent-*` hay `hub-checkin-*`.

| Muốn dừng stack                                                            | Lệnh                                                                                                                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compo 1 — `hub-parent-api`, `hub-parent-backend`, `hub-parent-frontend`    | `pnpm pm2:delete` (tự bỏ qua nếu không tìm thấy; dọn cả tên cũ `hub-main-*`) hoặc `pm2 delete hub-parent-api hub-parent-backend hub-parent-frontend` |
| Compo 2 — `hub-checkin-api`, `hub-checkin-backend`, `hub-checkin-frontend` | `pnpm pm2:delete:checkin` hoặc `pm2 delete hub-checkin-api hub-checkin-backend hub-checkin-frontend`                                                 |
| Process lỗi `ecosystem.checkin`                                            | `pm2 delete ecosystem.checkin`                                                                                                                       |

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

### Admin dùng chung (`@workspace/admin-app`)

Module CRUD admin nằm trong **`packages/admin-app`** — app chỉ khai báo `admin.app.config.json` + generate route. Chi tiết: `docs/admin-pattern/ADMIN_APP_PACKAGE.md`.

```bash
pnpm admin:migrate              # rewrite import package; không ghi đè module AUTO-GENERATED từ app
pnpm admin:generate:checkin     # sinh page re-export + menu
pnpm admin:generate:main
pnpm verify:main-admin          # kiểm tra generate + lib/hooks host
pnpm verify:checkin-admin
```

### Sync check-in từ main (deploy line)

Dev hàng ngày: `pnpm dev:main:checkin` (sửa `apps/main` + `packages/admin-app`, không cần sync copy admin).

Sau `git pull`, cập nhật `hub-event`: **`pnpm pull:checkin`** (API subset + migrate `@workspace/admin-app` + generate routes). Chi tiết: `docs/admin-pattern/ADMIN_APP_PACKAGE.md`, `docs/MONOREPO_STRUCTURE.md`.

## Import alias chuẩn (toàn monorepo)

Nguồn sự thật: `script-system/lib/import-alias-rules.cjs` · kiểm tra: `pnpm verify:imports` · ESLint: `forbidWorkspaceUiImports` trong `packages/eslint-config/service-boundaries.js`.

### App Next.js (`apps/*/…-frontend`, `apps/main/backend`)

Mỗi app Next **bắt buộc** có `tsconfig.json` → `paths`: `@ui/globals.css`, `@ui/components/*`, `@ui/*` trỏ `packages/ui/src`.

| Nhu cầu | Import đúng | Không dùng |
| -------- | ------------- | ---------- |
| UI (`packages/ui`) | `@ui/components/...`, `@ui/hooks/...`, `@ui/lib/...` | `@workspace/ui`, `packages/ui/src/...`, relative `../../../packages/ui` |
| API HTTP / types | `@workspace/api-client` | `fetch` thẳng API, `sdk.http` từ app |
| React Query hub | `@workspace/query-client` | Setup query client riêng (trừ doc cho phép) |
| Site config / promo / editor | `@workspace/site-config`, `@workspace/promo-codes`, `@thangph2146/lexical-editor` | Import chéo `apps/*` |
| Code riêng app | `@/lib/...`, `@/hooks/...`, `@/components/...` | Copy logic đã có trong `packages/*` |
| Lib native check-in (`hub-event`) | `@/lib/event-detail-content`, `@/lib/public-events`, … | `@/lib/admin/...` (chỉ file sync từ main) |

```ts
import { Button } from "@ui/components/button"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { api } from "@/lib/api"
import { PERMISSION_CODES } from "@workspace/api-client"
```

### Package `packages/*` (không phải app)

- Dùng tên npm `@workspace/<package>` trong `package.json` dependencies.
- **Không** dùng alias `@ui` (chỉ app Next map `@ui` → `packages/ui`).
- **Không** import `apps/*`.

### API Nest (`apps/*/api`)

- `@workspace/*` cho package dùng chung; **không** `@ui`, React, Next.
- **Logic CRUD dùng chung** → implement/extend trong `@workspace/api-server` trước, rồi app chỉ subclass service (`getEm()`, `getEntity()`, override `mapRow` / column filters nếu cần).
- **Controller + auth envelope** (`@Res()`, `X-User-Id`, `createSuccessResponse`) giữ local trong app — không dùng `BaseModule.forRoot()` nếu sẽ inject controller trùng route.
- Deploy line pilot: `apps/hub-event/api` — module đã migrate: `templates`, `event-checkouts`. Import subpath: `@workspace/api-server/modules/templates`, `@workspace/api-server/modules/event-checkouts`, `@workspace/api-server/common`. `tsconfig` hub-event dùng `moduleResolution: bundler` để resolve package workspace. Sau `pnpm pull:checkin`, tiếp tục CRUD scaffold (`cameras`, `screens`, `locations`, …).

Chi tiết: `docs/ui-pattern/README.md` · admin: `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` · API: `packages/api-server/README.md`.

### Admin dùng chung (`@workspace/admin-app`)

- CRUD admin: **`packages/admin-app`** — sửa một nơi, app chỉ **generate** page re-export.
- Main: `apps/main/backend/admin.app.config.json` + `pnpm admin:generate:main` + `pnpm verify:main-admin`.
- Check-in: `admin.app.config.json` + `pnpm admin:generate:checkin` + `pnpm verify:checkin-admin`.
- Deploy line: **`pnpm pull:checkin`** (migrate package + generate + verify). **Không** copy module `main` → check-in nữa.

File native giữ local (check-in: events shell, `dang-nhap`, `dang-ky`, profile, …; main: layout, login, register, profile, graph, database-schema).

## Nguyên tắc microservice

- Không import chéo source giữa các app trong `apps/*`.
- Frontend/Backend giao tiếp với API qua HTTP + `@workspace/api-client`.
- Logic dùng chung đặt ở `packages/*` khi thật sự còn được sử dụng.
- **Admin components PHẢI từ `@ui/components/...`** — không tạo local trong `apps/backend/src/components/` hay `apps/backend/src/app/**/_components/`. Nếu thiếu, thêm vào `packages/ui/src/components/admin/`.
- **API Client** PHẢI qua `@workspace/api-client` — không `fetch` trực tiếp tới `apps/api`, không gọi `api.http` / `sdk.http` từ app Next (dùng `api.users`, `api.public`, …).
- Khi sửa API (`apps/api`): đọc `docs/api-pattern/README.md`.
- Khi sửa API client (`packages/api-client`) hoặc gọi API từ app: đọc `docs/api-client-pattern/README.md`.
- Ranh giới được kiểm soát bởi:
  - `packages/eslint-config/service-boundaries.js` (import boundaries + ESLint cấm `sdk.http`)
  - `script-system/verify/verify-service-boundaries.mjs` (`pnpm verify:bounds`)
  - `script-system/verify/verify-no-sdk-http.mjs` (`pnpm verify:sdk-http`)

## Pattern coding — agent phải tuân thủ

### Toast admin (mutation + realtime)

- Mutation CRUD: **`useAdminMutation`** (`packages/ui`) — loading → success/error sau response 2xx; **không** gọi `toast.success`/`toast.error` thủ công trong `onSuccess`/`onError`.
- Socket trùng toast: `packages/api-client/src/realtime/toast-coordinator.ts` + `useAdminRealtimeSync` (`apps/backend`).
- Chi tiết: `docs/api-client-pattern/REALTIME.md`, `packages/ui/src/hooks/use-admin-mutation.ts`.

### Import dữ liệu (`/admin/data`)

- Client chunk + timing: `apps/backend/src/app/data/_component/import-chunked.ts`, `import-timing.ts`.
- API config + insert: `apps/api/src/system/system.service.ts` (`getImportConfig`, `insertSanitizedModel`).
- `post` mặc định **1 lô**, pivot (`postCategory`/`postTag`) **request riêng**; `post` **không** song song (`modelParallelConcurrency.post = 1`).
- Env API (tùy chọn): `SYSTEM_IMPORT_CLIENT_CHUNK_POST`, `SYSTEM_IMPORT_PARALLEL_CHUNKS`, `SYSTEM_IMPORT_JSON_BATCH_SIZE`.

## `@workspace/api-server` — Test & Coverage

**Status: FULLY COVERED** (4453 tests / 308 suites).

- Mọi module trong `packages/api-server/src/modules/` đã có: `*.service.spec.ts`, `*.controller.spec.ts`, `index.barrel.spec.ts`, `*.module-meta.spec.ts`, `*.service.integration.spec.ts`
- `bases/`: `base-crud.controller.spec.ts`, `base-crud.service.spec.ts`, `base-service.class.spec.ts`, `base-controller.class.spec.ts`, `crud-factory.spec.ts`, `index.barrel.spec.ts`
- `common/`: utilities (api-response, pagination, bulk-actions, parse-list-query, apply-column-filters, entity-id)
- `data-test/`: fixture loader + in-memory FakeEntityManager (47MB production fixture)
- `utils/`: date-utils, entity-id, pagination

Khi thêm module mới vào api-server, PHẢI tạo đủ 5 spec files theo pattern của `academic-years/`.

Chạy test & verify contract:
```bash
pnpm test:api-server          # alias: pnpm --filter @workspace/api-server test
pnpm verify:api-contract      # đối chiếu route api-client ↔ ADMIN_ROUTES/PUBLIC_ROUTES
pnpm --filter @workspace/api-server test:cov
```

Quy trình khi sửa endpoint API:
1. Sửa `packages/api-server` (base service/controller) + bổ sung spec theo pattern `academic-years/`.
2. Chạy `pnpm test:api-server` và `pnpm verify:api-contract`.
3. Subclass trong `apps/main/api` hoặc `apps/hub-event/api` (deploy line) — xóa duplicate logic, giữ entity + controller local.
4. `pnpm check` (và `graphify:refresh` nếu đổi module/routes).

## `@workspace/api-server` — khai báo như admin-app

Pattern song song `admin.app.config.json` + `@workspace/admin-app`:

| Admin (frontend) | API (Nest) |
| ---------------- | ---------- |
| `admin.app.config.json` → `scaffoldModules` | `api.app.config.json` → `scaffoldModules` |
| `pnpm admin:generate:checkin` | `pnpm api:generate:checkin` |
| Page AUTO-GENERATED re-export package | Service AUTO-GENERATED extend `Base*Service` |
| Controller/layout native (`X-User-Id`, envelope) | Controller native (`@Res()`, permissions) |

**Hub-event check-in:** `apps/hub-event/api/api.app.config.json` — khai báo module scaffold; chạy `pnpm api:generate:checkin` sinh `*.service.ts` từ `script-system/api/api-module-registry.cjs`. Verify: `pnpm verify:checkin-api`.

**Scaffold hiện tại (8):** `templates`, `event-checkouts`, `locations`, `speakers`, `seo-metas`, `screens`, `cameras`, `face-data`.

**Thêm module mới:** bổ sung registry + thêm id vào `scaffoldModules` trong `api.app.config.json` → `pnpm api:generate:checkin`.

**Rich / native** (giữ service local): `events`, `users`, `posts`, `categories`, `comments`, `tags`, `dashboard`, `system`, `hanet`, `public/*`, …

Sau `git pull` trên server check-in: `pnpm pull:checkin` (sync API subset + admin generate + api generate).
