# Phụ thuộc workspace (`workspace:*`)

> **Sinh tự động:** `2026-06-12T13:00:06.656Z` — quét `package.json` trong `packages/*` và `apps/*` (chỉ liên kết nội bộ monorepo).

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
| — | — | — | — |

## Làm mới

Chạy `pnpm graphify:ai-summary` từ root (script quét lại `package.json`).
