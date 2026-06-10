# Thống kê graph — api (Graphify)

> **Sinh tự động:** `2026-06-09T08:29:02.323Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 297 |
| `directory` | 56 |
| `json` | 2 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 1140 |
| `contains` | 354 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app.module.ts` | 49 |
| `src/mikro-orm/orm-entities.ts` | 45 |
| `src/seed-full-export.ts` | 24 |
| `src/system/system.service.ts` | 20 |
| `src/public/public.module.ts` | 17 |
| `src/uploads/uploads.service.ts` | 17 |
| `src/public/public.controller.ts` | 16 |
| `src/common/resolve-relation-filters.ts` | 13 |
| `src/entities/user.entity.ts` | 13 |
| `src/dashboard/dashboard.service.ts` | 12 |
| `src/messages/messages.controller.ts` | 10 |
| `src/orders/orders.service.ts` | 10 |
| `src/page-contents/page-contents.controller.ts` | 10 |
| `src/posts/posts.service.ts` | 10 |
| `src/users/users.controller.ts` | 10 |
| `src/contact-requests/contact-requests.controller.ts` | 9 |
| `src/groups/groups.controller.ts` | 9 |
| `src/roles/roles.controller.ts` | 9 |
| `src/sessions/sessions.controller.ts` | 9 |
| `src/academic-years/academic-years.controller.ts` | 8 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/config/constants.ts` | 58 |
| `src/common/api-response.ts` | 48 |
| `src/entities/user.entity.ts` | 47 |
| `src/common/permissions.decorator.ts` | 44 |
| `src/config/permissions.ts` | 43 |
| `src/common/bulk-actions.ts` | 38 |
| `src/common/pagination.ts` | 37 |
| `src/common/parse-list-query.ts` | 36 |
| `src/entities/base.entity.ts` | 31 |
| `src/entities/notification.entity.ts` | 21 |
| `src/entities/role.entity.ts` | 17 |
| `src/common/apply-column-filters.ts` | 16 |
| `src/common/parse-column-filters.ts` | 15 |
| `src/common/admin-filter-configs.ts` | 15 |
| `src/entities/user-role.entity.ts` | 15 |

## Làm mới

Chạy `node script-system/graphify-update.cjs apps/api` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
