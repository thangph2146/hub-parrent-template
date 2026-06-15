# Hub parent template — bản đồ monorepo cho AI (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.761Z` — chỉ mục dẫn đường; chi tiết module nằm ở từng app/package bên dưới.

## Chỉ dẫn theo chủ đề (đọc trước khi mở sâu)

Bảng dưới giúp agent mở **đúng file Graphify** trước khi đào `snapshot/context.json` (file nặng).

| Mục tiêu | Mở đầu tiên | Tiếp theo |
|------------|-------------|-----------|
| Bản đồ monorepo | **File này** (`SUMMARY_FOR_AI.md`) | [`../../packages/.graphify/markdown/SUMMARY_FOR_AI.md`](../../packages/.graphify/markdown/SUMMARY_FOR_AI.md), [`../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`](../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| Ranh giới service / check | [`../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`](../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) | [`../../AGENTS.md`](../../AGENTS.md), `pnpm verify:bounds` |
| Cây `src/` một app | [`../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md`](../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md) (đổi sang app tương ứng) | `SUMMARY_FOR_AI.md` cùng app |
| Quy mô graph, điểm nóng import | [`../../apps/main/api/.graphify/markdown/GRAPH_STATS.md`](../../apps/main/api/.graphify/markdown/GRAPH_STATS.md) | `FOLDER_TREE.md`, `snapshot/context.json` (khi cần) |
| **Endpoint Nest (@api main)** | [`../../apps/main/api/.graphify/markdown/API_ENDPOINTS.md`](../../apps/main/api/.graphify/markdown/API_ENDPOINTS.md) | [`ROUTE_SURFACE.md`](ROUTE_SURFACE.md), `pnpm verify:main-api-endpoint-parity` |
| **Endpoint Nest (check-in)** | [`../../apps/hub-event/api/.graphify/markdown/API_ENDPOINTS.md`](../../apps/hub-event/api/.graphify/markdown/API_ENDPOINTS.md) | `pnpm api:render:checkin`, `pnpm verify:checkin-api` |
| Domain Nest import lẫn nhau | [`../../apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md`](../../apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md) | `GRAPH_STATS.md`, bảng controller trong `SUMMARY` |
| Phụ thuộc `workspace:*` | [`../../packages/.graphify/markdown/WORKSPACE_DEPS.md`](../../packages/.graphify/markdown/WORKSPACE_DEPS.md) | [`../../packages/.graphify/README.md`](../../packages/.graphify/README.md), `SUMMARY_FOR_AI.md` packages |
| UX storefront (Next công khai) | [`../../docs/admin-pattern/FRONTEND_UX.md`](../../docs/admin-pattern/FRONTEND_UX.md) | [`../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| Admin Next (dev) | [`../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`](../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) | [`../../docs/admin-pattern/ADMIN_PAGE_PATTERN.md`](../../docs/admin-pattern/ADMIN_PAGE_PATTERN.md) |
| Quy trình agent (đọc thứ tự) | [`../../docs/admin-pattern/AGENTS_GUIDE.md`](../../docs/admin-pattern/AGENTS_GUIDE.md) | [`../../AGENTS.md`](../../AGENTS.md) |
| Kiểm tra ranh giới tự động | [`../../script-system/verify/verify-service-boundaries.cjs`](../../script-system/verify/verify-service-boundaries.cjs) | `pnpm verify:bounds`, ESLint `service-boundaries` |
| Vòng chuẩn hóa → check → graph | [`../README.md`](../README.md) (checklist) | [`../../.cursor/skills/hub-graphify-standardize-loop/SKILL.md`](../../.cursor/skills/hub-graphify-standardize-loop/SKILL.md) |
| Task → file cụ thể | [`TASK_INDEX.md`](TASK_INDEX.md) | `pnpm graphify:brief --task "..."`, [`../../AGENTS.md`](../../AGENTS.md) mục 3.1 |
| Sửa file shared / helper | [`../../apps/main/api/.graphify/markdown/IMPACT_RADIUS.md`](../../apps/main/api/.graphify/markdown/IMPACT_RADIUS.md) | `GRAPH_STATS.md`, grep importer |
| Bootstrap / route / generated | [`../../apps/main/backend/.graphify/markdown/ENTRY_POINTS.md`](../../apps/main/backend/.graphify/markdown/ENTRY_POINTS.md) (đổi app) | `FOLDER_TREE.md` |
| Main ↔ check-in API sync | [`SYNC_DELTA.md`](SYNC_DELTA.md) | [`TASK_INDEX.md`](TASK_INDEX.md), `pnpm pull:checkin` |
| Admin URL ↔ API ↔ client | [`ROUTE_SURFACE.md`](ROUTE_SURFACE.md) | `TASK_INDEX.md`, controller + api-client resource |
| Boilerplate lặp (loading, re-export) | [`../../apps/main/backend/.graphify/markdown/PATTERN_CLUSTERS.md`](../../apps/main/backend/.graphify/markdown/PATTERN_CLUSTERS.md) | `packages/admin-app`, `@ui` |
| Package workspace (graph) | [`../../packages/.graphify/markdown/PACKAGE_INDEX.md`](../../packages/.graphify/markdown/PACKAGE_INDEX.md) | `packages/*/.graphify/markdown/` |

## Dịch vụ (`apps/*`)

| Package | Vai trò | Graphify |
|---------|---------|----------|
| `@api` | API Nest (main) | `apps/main/api/.graphify/` (`markdown/`, `snapshot/`) |
| `@backend` | Admin Next (main) | `apps/main/backend/.graphify/` (`markdown/`, `snapshot/`) |
| `@hub-parent/api` | API Nest (hub-parent) | `apps/hub-parent/api/.graphify/` (`markdown/`, `snapshot/`) |
| `@frontend` | Next frontend (hub-parent) | `apps/hub-parent/hub-parent-frontend/.graphify/` (`markdown/`, `snapshot/`) |
| `@hub-event/api` | API Nest (hub-event) | `apps/hub-event/api/.graphify/` (`markdown/`, `snapshot/`) |
| `@hub-event-checkin-frontend` | Next frontend (hub-event) | `apps/hub-event/hub-event-checkin-frontend/.graphify/` (`markdown/`, `snapshot/`) |
| `@store-sync/api` | API Nest (store-sync) | `apps/store-sync/api/.graphify/` (`markdown/`, `snapshot/`) |
| `@store-sync-frontend` | Next frontend (store-sync) | `apps/store-sync/store-sync-frontend/.graphify/` (`markdown/`, `snapshot/`) |

## Ranh giới (microservice)

- **Không** import chéo source giữa các app trong `apps/*` (ví dụ `@frontend` ↔ `@store-sync-frontend`, `@backend` ↔ `@frontend`).
- Next ↔ API: **HTTP**; SDK chính `@workspace/api-client` (`createStoreSyncSdk`). Public storefront có thể dùng thêm `fetch` trong `lib/public-posts.ts` (envelope JSON).
- Kiểm tra: `pnpm verify:bounds` + ESLint `packages/eslint-config/service-boundaries.js`.

## Ma trận artefact (clean scope)

| Phạm vi | Markdown (AI, `pnpm graphify:ai-summary`) | Snapshot JSON (`node script-system/graphify/graphify-update.cjs`) |
|----------|---------------------------------------------|----------------------------------------|
| **Root** `.graphify/` | `SUMMARY_FOR_AI.md`, `TASK_INDEX.md`, `SYNC_DELTA.md`, `ROUTE_SURFACE.md` | `.graphify/snapshot/` (tùy chọn) |
| **`packages/`** | `packages/.graphify/markdown/*.md` | — |
| **Mỗi app** `apps/<x>/` | `apps/<x>/.graphify/markdown/*.md` | `apps/<x>/.graphify/snapshot/context.json` + `graph.json` |

## Góc tìm nhanh (nhiệm vụ → đọc gì)

| Nhiệm vụ | Mở trước |
|----------|----------|
| Đổi route / page / layout Next | `apps/<app>/.graphify/markdown/SUMMARY` + `FOLDER_TREE` |
| Đổi module Nest / import domain | `apps/main/api/.../SUMMARY` (hoặc app API deploy) + `API_DOMAIN_IMPORTS` + `GRAPH_STATS` |
| Thêm/sửa package workspace | `packages/.../SUMMARY` + `WORKSPACE_DEPS` + `verify:bounds` |
| Chuẩn hóa sau refactor | `.graphify/README.md` (checklist) + skill `hub-graphify-standardize-loop` |
| Module admin/API cụ thể | `.graphify/markdown/TASK_INDEX.md` hoặc `pnpm graphify:brief --task "..."` |
| Main vs check-in API | `.graphify/markdown/SYNC_DELTA.md` | `pnpm pull:checkin` sau sửa main API |
| Sửa helper/shared | `apps/<app>/.graphify/markdown/IMPACT_RADIUS.md` | `ENTRY_POINTS.md` nếu đụng bootstrap/generated |

## `packages/*` (chia sẻ workspace)

- Bản tóm riêng: **`packages/.graphify/markdown/SUMMARY_FOR_AI.md`** (cùng script root).

## Trạng thái snapshot Graphify (`snapshot/context.json`)

| App | Files trong context | generatedAt (context) | SUMMARY |
|-----|--------------------|------------------------|---------|
| `@api` | 515 | 2026-06-15T03:40:50.667Z | [`apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@backend` | 202 | 2026-06-15T03:40:50.754Z | [`apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@hub-parent/api` | 538 | 2026-06-15T03:40:51.288Z | [`apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@frontend` | 128 | 2026-06-15T03:40:51.372Z | [`apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@hub-event/api` | 537 | 2026-06-15T03:40:51.917Z | [`apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@hub-event-checkin-frontend` | 278 | 2026-06-15T03:40:52.041Z | [`apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@store-sync/api` | 538 | 2026-06-15T03:40:52.591Z | [`apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@store-sync-frontend` | 189 | 2026-06-15T03:40:52.675Z | [`apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |

## Artefact từ `snapshot/graph.json` / package scan (`pnpm graphify:ai-summary`)

- Mỗi app: **`FOLDER_TREE`**, **`GRAPH_STATS`**, **`IMPACT_RADIUS`**, **`ENTRY_POINTS`**, **`PATTERN_CLUSTERS`**.
- Root: **`SYNC_DELTA.md`**, **`ROUTE_SURFACE.md`** — sync check-in + bản đồ route admin/API/client.
- **`apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md`** (và app API deploy tương ứng) — domain `src/<tên>/`, inbound, sơ đồ Mermaid.
- **`packages/.graphify/README.md`** — mô tả layout Graphify packages (`markdown/`).
- **`packages/.graphify/markdown/WORKSPACE_DEPS.md`** — cạnh `workspace:*` giữa package và app.

## Quy trình làm mới toàn bộ đồ thị

```bash
# Từng app (cập nhật snapshot/context.json + snapshot/graph.json)
pnpm graphify:update
# hoặc từng app (đường dẫn thật):
node script-system/graphify/graphify-update.cjs apps/main/api
node script-system/graphify/graphify-update.cjs apps/main/backend
node script-system/graphify/graphify-update.cjs apps/hub-parent/api
node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend
node script-system/graphify/graphify-update.cjs apps/hub-event/api
node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend
node script-system/graphify/graphify-update.cjs apps/store-sync/api
node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend
# (Tùy) snapshot graph cấp monorepo — ít node nếu không scan deep
# node script-system/graphify/graphify-update.cjs .
pnpm graphify:ai-summary
# gộp update + summary: pnpm graphify:refresh
```

## Đọc thêm

- `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
- `docs/admin-pattern/AGENTS_GUIDE.md`
- `docs/admin-pattern/FRONTEND_UX.md` (storefront / UI)
- `AGENTS.md` (entry agent)
