# Bán kính ảnh hưởng import — apps/main/backend (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.146Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/providers/auth-provider.tsx` | 4 | `src/app/layout.tsx`, `src/providers/admin-realtime-sync.tsx`, `src/providers/admin-runtime-bridge.tsx`, `src/providers/backend-admin-layout.tsx` |
| `src/lib/auth-session.ts` | 3 | `src/config/admin-layout-static.ts`, `src/lib/api.ts`, `src/providers/auth-provider.tsx` |
| `src/config/admin-menu-tree.items.ts` | 2 | `src/config/admin-menu-icons.ts`, `src/config/admin-menu-tree.tsx` |
| `src/features/auth/auth-api.ts` | 2 | `src/features/auth/session.ts`, `src/providers/auth-provider.tsx` |
| `src/lib/api.ts` | 2 | `src/providers/admin-runtime-bridge.tsx`, `src/providers/backend-admin-layout.tsx` |
| `src/lib/auth-routes.ts` | 2 | `src/config/admin-layout-static.ts`, `src/providers/auth-provider.tsx` |
| `src/config/admin-layout-static.ts` | 1 | `src/providers/backend-admin-layout.tsx` |
| `src/config/admin-menu-icons.ts` | 1 | `src/config/admin-menu-tree.tsx` |
| `src/config/admin-menu-tree.tsx` | 1 | `src/config/admin-layout-static.ts` |
| `src/features/auth/register-form.tsx` | 1 | `src/features/auth/index.ts` |
| `src/features/auth/sign-in-form.tsx` | 1 | `src/features/auth/index.ts` |
| `src/hooks/use-admin-edit-form-hydration.ts` | 1 | `src/hooks/index.ts` |
| `src/hooks/use-admin-mutation.ts` | 1 | `src/providers/query-provider.tsx` |
| `src/hooks/use-admin-realtime-sync.ts` | 1 | `src/providers/admin-realtime-sync.tsx` |
| `src/hooks/use-admin-table-state.ts` | 1 | `src/hooks/index.ts` |
| `src/hooks/use-debounced-value.ts` | 1 | `src/hooks/index.ts` |
| `src/lib/api-base-url.ts` | 1 | `src/lib/api.ts` |
| `src/providers/admin-realtime-sync.tsx` | 1 | `src/providers/backend-admin-layout.tsx` |
| `src/providers/admin-runtime-bridge.tsx` | 1 | `src/app/layout.tsx` |
| `src/providers/backend-admin-layout.tsx` | 1 | `src/app/layout.tsx` |
| `src/providers/query-provider.tsx` | 1 | `src/app/layout.tsx` |

## `src/common/` — tiện ích dùng chung

- (không có file common in-degree ≥ 2)

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/main/backend` → `pnpm graphify:ai-summary`.
