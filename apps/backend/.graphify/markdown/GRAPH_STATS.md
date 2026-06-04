# Thống kê graph — backend (Graphify)

> **Sinh tự động:** `2026-06-04T07:32:10.121Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `directory` | 219 |
| `ts` | 217 |
| `tsx` | 110 |
| `page` | 87 |
| `loading` | 3 |
| `api-route` | 1 |
| `layout` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 780 |
| `contains` | 636 |
| `renders` | 1 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/cameras/_component/index.ts` | 8 |
| `src/app/categories/_component/index.ts` | 8 |
| `src/app/events/[id]/page.tsx` | 8 |
| `src/app/events/_component/index.ts` | 8 |
| `src/app/guides/_component/index.ts` | 8 |
| `src/app/parent-students/page.tsx` | 8 |
| `src/app/posts/page.tsx` | 8 |
| `src/app/screens/_component/index.ts` | 8 |
| `src/app/staff/_component/index.ts` | 8 |
| `src/app/tags/_component/index.ts` | 8 |
| `src/app/templates/_component/index.ts` | 8 |
| `src/app/academic-years/_component/index.ts` | 7 |
| `src/app/contact-requests/page.tsx` | 7 |
| `src/app/courses/_component/index.ts` | 7 |
| `src/app/departments/_component/index.ts` | 7 |
| `src/app/events/_component/_live/event-live-monitor-tab.tsx` | 7 |
| `src/app/locations/_component/index.ts` | 7 |
| `src/app/majors/_component/index.ts` | 7 |
| `src/app/speakers/_component/index.ts` | 7 |
| `src/app/training-levels/_component/index.ts` | 7 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/api.ts` | 93 |
| `src/providers/auth-provider.tsx` | 51 |
| `src/hooks/use-debounced-value.ts` | 22 |
| `src/hooks/use-table-filters.ts` | 16 |
| `src/app/posts/_component/types.ts` | 12 |
| `src/app/guides/_component/types.ts` | 11 |
| `src/hooks/queries.ts` | 9 |
| `src/app/events/_component/types.ts` | 9 |
| `src/app/categories/_component/types.ts` | 8 |
| `src/lib/auth-session.ts` | 8 |
| `src/app/tags/_component/types.ts` | 8 |
| `src/app/academic-years/_component/types.ts` | 7 |
| `src/app/cameras/_component/types.ts` | 7 |
| `src/app/contact-requests/_component/types.ts` | 7 |
| `src/app/courses/_component/types.ts` | 7 |

## Làm mới

Chạy `node apps/backend/.graphify/update.cjs` rồi `pnpm graphify:ai-summary`.
