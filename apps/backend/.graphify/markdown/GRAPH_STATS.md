# Thống kê graph — backend (Graphify)

> **Sinh tự động:** `2026-06-08T08:15:50.804Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 265 |
| `directory` | 240 |
| `tsx` | 146 |
| `page` | 97 |
| `loading` | 59 |
| `api-route` | 1 |
| `error` | 1 |
| `layout` | 1 |
| `template` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 1292 |
| `contains` | 809 |
| `renders` | 1 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/file-storage/_component/index.ts` | 16 |
| `src/app/my-students/_component/index.ts` | 10 |
| `src/app/rbac/page.tsx` | 10 |
| `src/app/events/[id]/page.tsx` | 9 |
| `src/app/posts/page.tsx` | 9 |
| `src/app/academic-years/page.tsx` | 8 |
| `src/app/cameras/page.tsx` | 8 |
| `src/app/cameras/_component/index.ts` | 8 |
| `src/app/categories/page.tsx` | 8 |
| `src/app/categories/_component/index.ts` | 8 |
| `src/app/contact-requests/page.tsx` | 8 |
| `src/app/courses/page.tsx` | 8 |
| `src/app/departments/page.tsx` | 8 |
| `src/app/events/page.tsx` | 8 |
| `src/app/events/_component/index.ts` | 8 |
| `src/app/guides/_component/index.ts` | 8 |
| `src/app/locations/page.tsx` | 8 |
| `src/app/majors/page.tsx` | 8 |
| `src/app/parent-students/page.tsx` | 8 |
| `src/app/screens/page.tsx` | 8 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/api.ts` | 131 |
| `src/lib/admin-navigation.ts` | 86 |
| `src/hooks/use-admin-mutation.ts` | 70 |
| `src/providers/auth-provider.tsx` | 56 |
| `src/lib/admin-row-action-handlers.ts` | 37 |
| `src/hooks/use-debounced-value.ts` | 26 |
| `src/lib/admin-table-columns.tsx` | 23 |
| `src/lib/admin-detail-query.ts` | 20 |
| `src/lib/fetch-all-admin-list.ts` | 18 |
| `src/app/file-storage/_component/types.ts` | 17 |
| `src/hooks/use-table-filters.ts` | 16 |
| `src/lib/admin-trash-export.ts` | 14 |
| `src/app/file-storage/_component/utils.ts` | 14 |
| `src/hooks/queries.ts` | 12 |
| `src/app/posts/_component/types.ts` | 12 |

## Làm mới

Chạy `node scripts/graphify-update.cjs apps/backend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
