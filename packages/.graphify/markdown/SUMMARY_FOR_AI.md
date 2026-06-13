# `packages/*` — tóm tắt workspace cho AI (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.472Z` — liệt kê package trong `packages/` (không nhúng source).

## Vai trò trong kiến trúc microservice

- Package **không** thay cho `@api`; app Next gọi API qua HTTP + `@workspace/api-client` hoặc `fetch` public.
- **Không import** source `apps/*` từ package (kiểm soát bởi ESLint `sharedTsPackageBoundary`).

## Package (12)

| Package | Thư mục | Ghi chú |
|---------|----------|---------|
| `@thangph2146/lexical-editor` | `packages/editor/` | Editor Lexical workspace; tiêu thụ bởi Next apps + có thể tái xuất UI. |
| `@workspace/admin-app` | `packages/admin-app/` · [graphify](../../admin-app/.graphify/markdown/SUMMARY_FOR_AI.md) | — |
| `@workspace/api-client` | `packages/api-client/` · [graphify](../../api-client/.graphify/markdown/SUMMARY_FOR_AI.md) | SDK HTTP tới `@api`; không import app Nest/Next. |
| `@workspace/api-server` | `packages/api-server/` · [graphify](../../api-server/.graphify/markdown/SUMMARY_FOR_AI.md) | — |
| `@workspace/dealer-support` | `packages/dealer-support/` | — |
| `@workspace/eslint-config` | `packages/eslint-config/` | ESLint flat + `service-boundaries` (ranh giới import). |
| `@workspace/logger` | `packages/logger/` | — |
| `@workspace/promo-codes` | `packages/promo-codes/` | — |
| `@workspace/query-client` | `packages/query-client/` | `QueryClient` + retry/stale mặc định TanStack Query (dùng chung Next apps). |
| `@workspace/site-config` | `packages/site-config/` | — |
| `@workspace/typescript-config` | `packages/typescript-config/` | tsconfig cơ sở cho package/app. |
| `@workspace/ui` | `packages/ui/` · [graphify](../../ui/.graphify/markdown/SUMMARY_FOR_AI.md) | — |

## File Markdown trong `packages/.graphify/markdown/`

Artefact Graphify cho **workspace packages** nằm dưới `packages/.graphify/markdown/` (tách biệt `apps/*`).

- **`SUMMARY_FOR_AI.md`** — file này.
- **[`PACKAGE_INDEX.md`](PACKAGE_INDEX.md)** — graphify per-package (`ui`, `admin-app`, `api-client`, `api-server`).
- **[`WORKSPACE_DEPS.md`](WORKSPACE_DEPS.md)** — cạnh `workspace:*` (xem mục dưới).
- **[`../README.md`](../README.md)** — giải thích scope thư mục Graphify packages.

## Phụ thuộc workspace (`workspace:*`)

- Bảng **from → dep** cho `packages/*` và `apps/*`: [`WORKSPACE_DEPS.md`](WORKSPACE_DEPS.md).

## Graphify — tóm tắt theo từng app (markdown)

Định vị **runtime** từng dịch vụ (không import chéo source giữa `apps/*`):

- [@api — SUMMARY](../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@backend — SUMMARY](../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@hub-parent/api — SUMMARY](../../apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@frontend — SUMMARY](../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@hub-event/api — SUMMARY](../../apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@hub-event-checkin-frontend — SUMMARY](../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@store-sync/api — SUMMARY](../../apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md)
- [@store-sync-frontend — SUMMARY](../../apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md)
- [Chỉ mục monorepo](../../.graphify/markdown/SUMMARY_FOR_AI.md)

## Làm mới

- Khi thêm/xóa package: chạy lại `pnpm graphify:ai-summary` từ root (script quét lại `packages/`).
