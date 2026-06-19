# Phụ thuộc workspace (`workspace:*`)

> **Sinh tự động:** `2026-06-19T01:42:38.694Z` — quét `package.json` trong `packages/*` và `apps/*` (chỉ liên kết nội bộ monorepo).

## `packages/*`

| Package (from) | Phụ thuộc workspace | spec | Thư mục |
|------------------|---------------------|------|---------|
| `@thangph2146/lexical-editor` | `@workspace/eslint-config` | `workspace:*` | `packages/editor/` |
| `@thangph2146/lexical-editor` | `@workspace/typescript-config` | `workspace:*` | `packages/editor/` |
| `@workspace/admin-app` | `@thangph2146/lexical-editor` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/api-client` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/eslint-config` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/logger` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/query-client` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/site-config` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/typescript-config` | `workspace:*` | `packages/admin-app/` |
| `@workspace/admin-app` | `@workspace/ui` | `workspace:*` | `packages/admin-app/` |
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
| `@api` | `@workspace/api-client` | `workspace:*` | `apps/main/api/` |
| `@api` | `@workspace/api-server` | `workspace:*` | `apps/main/api/` |
| `@api` | `@workspace/eslint-config` | `workspace:*` | `apps/main/api/` |
| `@backend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/admin-app` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/api-client` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/eslint-config` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/logger` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/query-client` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/site-config` | `workspace:*` | `apps/main/backend/` |
| `@backend` | `@workspace/ui` | `workspace:*` | `apps/main/backend/` |
| `@frontend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/admin-app` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/api-client` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/dealer-support` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/eslint-config` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/promo-codes` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/query-client` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/site-config` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@frontend` | `@workspace/ui` | `workspace:*` | `apps/hub-parent/hub-parent-frontend/` |
| `@hub-checkin/frontend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/admin-app` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/api-client` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/eslint-config` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/logger` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/query-client` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/site-config` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/frontend` | `@workspace/ui` | `workspace:*` | `apps/hub-checkin/hub-checkin-frontend/` |
| `@hub-checkin/api` | `@workspace/api-client` | `workspace:*` | `apps/hub-checkin/api/` |
| `@hub-checkin/api` | `@workspace/api-server` | `workspace:*` | `apps/hub-checkin/api/` |
| `@hub-checkin/api` | `@workspace/eslint-config` | `workspace:*` | `apps/hub-checkin/api/` |
| `@hub-parent/api` | `@workspace/api-client` | `workspace:*` | `apps/hub-parent/api/` |
| `@hub-parent/api` | `@workspace/api-server` | `workspace:*` | `apps/hub-parent/api/` |
| `@hub-parent/api` | `@workspace/eslint-config` | `workspace:*` | `apps/hub-parent/api/` |
| `@store-sync-frontend` | `@thangph2146/lexical-editor` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/admin-app` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/api-client` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/dealer-support` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/eslint-config` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/promo-codes` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/query-client` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/site-config` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync-frontend` | `@workspace/ui` | `workspace:*` | `apps/store-sync/store-sync-frontend/` |
| `@store-sync/api` | `@workspace/api-client` | `workspace:*` | `apps/store-sync/api/` |
| `@store-sync/api` | `@workspace/api-server` | `workspace:*` | `apps/store-sync/api/` |
| `@store-sync/api` | `@workspace/eslint-config` | `workspace:*` | `apps/store-sync/api/` |

## Làm mới

Chạy `pnpm graphify:ai-summary` từ root (script quét lại `package.json`).
