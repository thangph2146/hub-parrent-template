# Hub parent template — bản đồ monorepo cho AI (Graphify)

> **Sinh tự động:** `2026-06-12T13:00:06.660Z` — chỉ mục dẫn đường; chi tiết module nằm ở từng app/package bên dưới.

## Chỉ dẫn theo chủ đề (đọc trước khi mở sâu)

Bảng dưới giúp agent mở **đúng file Graphify** trước khi đào `snapshot/context.json` (file nặng).

| Mục tiêu | Mở đầu tiên | Tiếp theo |
|------------|-------------|-----------|
| Bản đồ monorepo | **File này** (`SUMMARY_FOR_AI.md`) | [`../../packages/.graphify/markdown/SUMMARY_FOR_AI.md`](../../packages/.graphify/markdown/SUMMARY_FOR_AI.md), [`../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`](../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| Ranh giới service / check | [`../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`](../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) | [`../../AGENTS.md`](../../AGENTS.md), `pnpm verify:bounds` |
| Cây `src/` một app | [`../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md`](../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md) (đổi sang app tương ứng) | `SUMMARY_FOR_AI.md` cùng app |
| Quy mô graph, điểm nóng import | [`../../apps/main/api/.graphify/markdown/GRAPH_STATS.md`](../../apps/main/api/.graphify/markdown/GRAPH_STATS.md) | `FOLDER_TREE.md`, `snapshot/context.json` (khi cần) |
| Domain Nest import lẫn nhau | [`../../apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md`](../../apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md) | `GRAPH_STATS.md`, bảng controller trong `SUMMARY` |
| Phụ thuộc `workspace:*` | [`../../packages/.graphify/markdown/WORKSPACE_DEPS.md`](../../packages/.graphify/markdown/WORKSPACE_DEPS.md) | [`../../packages/.graphify/README.md`](../../packages/.graphify/README.md), `SUMMARY_FOR_AI.md` packages |
| UX storefront (Next công khai) | [`../../docs/admin-pattern/FRONTEND_UX.md`](../../docs/admin-pattern/FRONTEND_UX.md) | [`../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| Admin Next (dev) | [`../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`](../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) | [`../../docs/admin-pattern/ADMIN_PAGE_PATTERN.md`](../../docs/admin-pattern/ADMIN_PAGE_PATTERN.md) |
| Quy trình agent (đọc thứ tự) | [`../../docs/admin-pattern/AGENTS_GUIDE.md`](../../docs/admin-pattern/AGENTS_GUIDE.md) | [`../../AGENTS.md`](../../AGENTS.md) |
| Kiểm tra ranh giới tự động | [`../../script-system/verify/verify-service-boundaries.mjs`](../../script-system/verify/verify-service-boundaries.mjs) | `pnpm verify:bounds`, ESLint `service-boundaries` |
| Vòng chuẩn hóa → check → graph | [`../README.md`](../README.md) (checklist) | [`../../.cursor/skills/hub-graphify-standardize-loop/SKILL.md`](../../.cursor/skills/hub-graphify-standardize-loop/SKILL.md) |

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
| **Root** `.graphify/` | `.graphify/markdown/SUMMARY_FOR_AI.md` | `.graphify/snapshot/` (tùy chọn, `node script-system/graphify/graphify-update.cjs .`) |
| **`packages/`** | `packages/.graphify/markdown/*.md` | — |
| **Mỗi app** `apps/<x>/` | `apps/<x>/.graphify/markdown/*.md` | `apps/<x>/.graphify/snapshot/context.json` + `graph.json` |

## Góc tìm nhanh (nhiệm vụ → đọc gì)

| Nhiệm vụ | Mở trước |
|----------|----------|
| Đổi route / page / layout Next | `apps/<app>/.graphify/markdown/SUMMARY` + `FOLDER_TREE` |
| Đổi module Nest / import domain | `apps/main/api/.../SUMMARY` (hoặc app API deploy) + `API_DOMAIN_IMPORTS` + `GRAPH_STATS` |
| Thêm/sửa package workspace | `packages/.../SUMMARY` + `WORKSPACE_DEPS` + `verify:bounds` |
| Chuẩn hóa sau refactor | `.graphify/README.md` (checklist) + skill `hub-graphify-standardize-loop` |

## `packages/*` (chia sẻ workspace)

- Bản tóm riêng: **`packages/.graphify/markdown/SUMMARY_FOR_AI.md`** (cùng script root).

## Trạng thái snapshot Graphify (`snapshot/context.json`)

| App | Files trong context | generatedAt (context) | SUMMARY |
|-----|--------------------|------------------------|---------|
| `@api` | 342 | 2026-06-12T12:59:23.678Z | [`apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@backend` | 202 | 2026-06-12T12:59:23.774Z | [`apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@hub-parent/api` | 315 | 2026-06-12T12:59:24.010Z | [`apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@frontend` | 128 | 2026-06-12T12:59:24.112Z | [`apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@hub-event/api` | 208 | 2026-06-12T12:59:24.214Z | [`apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@hub-event-checkin-frontend` | 288 | 2026-06-12T12:59:24.344Z | [`apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@store-sync/api` | 315 | 2026-06-12T12:59:24.640Z | [`apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md) |
| `@store-sync-frontend` | 110 | 2026-06-12T12:59:24.736Z | [`apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md`](apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) |

## Artefact từ `snapshot/graph.json` / package scan (`pnpm graphify:ai-summary`)

- Mỗi app: **`apps/<app>/.graphify/markdown/FOLDER_TREE.md`**, **`GRAPH_STATS.md`** — cây `src/` + thống kê graph / điểm nóng import.
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
