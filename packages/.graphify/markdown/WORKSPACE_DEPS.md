# Phụ thuộc workspace (`workspace:*`)

> **Sinh tự động:** `2026-06-09T06:28:52.321Z` — quét `package.json` trong `packages/*` và `apps/*` (chỉ liên kết nội bộ monorepo).

## `packages/*`

| Package (from) | Phụ thuộc workspace | spec | Thư mục |
|------------------|---------------------|------|---------|
| `@thangph2146/lexical-editor` | `@workspace/eslint-config` | `workspace:*` | `packages/editor/` |
| `@thangph2146/lexical-editor` | `@workspace/typescript-config` | `workspace:*` | `packages/editor/` |
| `@workspace/api-client` | `@workspace/eslint-config` | `workspace:*` | `packages/api-client/` |
| `@workspace/api-client` | `@workspace/logger` | `workspace:*` | `packages/api-client/` |
| `@workspace/api-client` | `@workspace/typescript-config` | `workspace:*` | `packages/api-client/` |
| `@workspace/dealer-support` | `@workspace/eslint-config` | `workspace:*` | `packages/dealer-support/` |
| `@workspace/dealer-support` | `@workspace/typescript-config` | `workspace:*` | `packages/dealer-support/` |
| `@workspace/logger` | `@workspace/eslint-config` | `workspace:*` | `packages/logger/` |
| `@workspace/logger` | `@workspace/typescript-config` | `workspace:*` | `packages/logger/` |
| `@workspace/promo-codes` | `@workspace/eslint-config` | `workspace:*` | `packages/promo-codes/` |
| `@workspace/promo-codes` | `@workspace/typescript-config` | `workspace:*` | `packages/promo-codes/` |
| `@workspace/query-client` | `@workspace/eslint-config` | `workspace:*` | `packages/query-client/` |
| `@workspace/query-client` | `@workspace/typescript-config` | `workspace:*` | `packages/query-client/` |
| `@workspace/site-config` | `@workspace/eslint-config` | `workspace:*` | `packages/site-config/` |
| `@workspace/site-config` | `@workspace/typescript-config` | `workspace:*` | `packages/site-config/` |
| `@workspace/ui` | `@workspace/api-client` | `workspace:*` | `packages/ui/` |
| `@workspace/ui` | `@workspace/eslint-config` | `workspace:*` | `packages/ui/` |
| `@workspace/ui` | `@workspace/typescript-config` | `workspace:*` | `packages/ui/` |

## `apps/*`

| App (from) | Phụ thuộc workspace | spec | Thư mục |
|------------|---------------------|------|---------|
| `@api` | `@workspace/eslint-config` | `workspace:*` | `apps/api/` |
| `@backend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/backend/` |
| `@backend` | `@workspace/api-client` | `workspace:*` | `apps/backend/` |
| `@backend` | `@workspace/eslint-config` | `workspace:*` | `apps/backend/` |
| `@backend` | `@workspace/logger` | `workspace:*` | `apps/backend/` |
| `@backend` | `@workspace/query-client` | `workspace:*` | `apps/backend/` |
| `@backend` | `@workspace/site-config` | `workspace:*` | `apps/backend/` |
| `@backend` | `@workspace/ui` | `workspace:*` | `apps/backend/` |
| `@frontend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/api-client` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/dealer-support` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/eslint-config` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/promo-codes` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/query-client` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/site-config` | `workspace:*` | `apps/frontend/` |
| `@frontend` | `@workspace/ui` | `workspace:*` | `apps/frontend/` |
| `@hub-event-checkin-frontend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/hub-event-checkin-frontend/` |
| `@hub-event-checkin-frontend` | `@workspace/api-client` | `workspace:*` | `apps/hub-event-checkin-frontend/` |
| `@hub-event-checkin-frontend` | `@workspace/eslint-config` | `workspace:*` | `apps/hub-event-checkin-frontend/` |
| `@hub-event-checkin-frontend` | `@workspace/ui` | `workspace:*` | `apps/hub-event-checkin-frontend/` |
| `@store-sync-frontend` | `@workspace/api-client` | `workspace:*` | `apps/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/dealer-support` | `workspace:*` | `apps/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/eslint-config` | `workspace:*` | `apps/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/promo-codes` | `workspace:*` | `apps/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/query-client` | `workspace:*` | `apps/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/ui` | `workspace:*` | `apps/store-sync-frontend/` |

## Làm mới

Chạy `pnpm graphify:ai-summary` từ root (script quét lại `package.json`).
