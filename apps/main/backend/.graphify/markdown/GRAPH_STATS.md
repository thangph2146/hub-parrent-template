# Thống kê graph — apps/main/backend (Graphify)

> **Sinh tự động:** `2026-06-12T14:01:01.027Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `directory` | 111 |
| `page` | 99 |
| `loading` | 59 |
| `ts` | 28 |
| `tsx` | 8 |
| `api-route` | 1 |
| `error` | 1 |
| `layout` | 1 |
| `template` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `contains` | 307 |
| `imports` | 30 |
| `renders` | 1 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/layout.tsx` | 4 |
| `src/providers/backend-admin-layout.tsx` | 4 |
| `src/config/admin-layout-static.ts` | 3 |
| `src/hooks/index.ts` | 3 |
| `src/providers/auth-provider.tsx` | 3 |
| `src/config/admin-menu-tree.tsx` | 2 |
| `src/features/auth/index.ts` | 2 |
| `src/lib/api.ts` | 2 |
| `src/providers/admin-realtime-sync.tsx` | 2 |
| `src/providers/admin-runtime-bridge.tsx` | 2 |
| `src/config/admin-menu-icons.ts` | 1 |
| `src/features/auth/session.ts` | 1 |
| `src/providers/query-provider.tsx` | 1 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/providers/auth-provider.tsx` | 4 |
| `src/lib/auth-session.ts` | 3 |
| `src/lib/auth-routes.ts` | 2 |
| `src/config/admin-menu-tree.items.ts` | 2 |
| `src/features/auth/auth-api.ts` | 2 |
| `src/lib/api.ts` | 2 |
| `src/providers/query-provider.tsx` | 1 |
| `src/providers/admin-runtime-bridge.tsx` | 1 |
| `src/providers/backend-admin-layout.tsx` | 1 |
| `src/config/admin-menu-tree.tsx` | 1 |
| `src/config/admin-menu-icons.ts` | 1 |
| `src/features/auth/sign-in-form.tsx` | 1 |
| `src/features/auth/register-form.tsx` | 1 |
| `src/hooks/use-debounced-value.ts` | 1 |
| `src/hooks/use-admin-edit-form-hydration.ts` | 1 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/main/backend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
