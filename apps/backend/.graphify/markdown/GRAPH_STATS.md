# Thống kê graph — backend (Graphify)

> **Sinh tự động:** `2026-06-07T17:33:28.128Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 257 |
| `directory` | 229 |
| `tsx` | 128 |
| `page` | 88 |
| `loading` | 59 |
| `api-route` | 1 |
| `error` | 1 |
| `layout` | 1 |
| `template` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 1175 |
| `contains` | 763 |
| `renders` | 1 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
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
| `src/app/screens/_component/index.ts` | 8 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/api.ts` | 121 |
| `src/lib/admin-navigation.ts` | 77 |
| `src/hooks/use-admin-mutation.ts` | 64 |
| `src/providers/auth-provider.tsx` | 53 |
| `src/lib/admin-row-action-handlers.ts` | 35 |
| `src/hooks/use-debounced-value.ts` | 22 |
| `src/lib/admin-table-columns.tsx` | 22 |
| `src/lib/admin-detail-query.ts` | 18 |
| `src/lib/fetch-all-admin-list.ts` | 17 |
| `src/hooks/use-table-filters.ts` | 16 |
| `src/lib/admin-trash-export.ts` | 14 |
| `src/hooks/queries.ts` | 12 |
| `src/app/posts/_component/types.ts` | 12 |
| `src/app/guides/_component/types.ts` | 11 |
| `src/lib/auth-session.ts` | 10 |

## Làm mới

Chạy `node scripts/graphify-update.cjs apps/backend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
