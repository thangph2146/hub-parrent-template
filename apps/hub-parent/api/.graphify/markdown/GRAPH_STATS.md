# Thống kê graph — apps/hub-parent/api (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.384Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 318 |
| `directory` | 57 |
| `json` | 2 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 1268 |
| `contains` | 376 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app.module.ts` | 50 |
| `src/mikro-orm/orm-entities.ts` | 46 |
| `src/seed-full-export.ts` | 25 |
| `src/system/system.service.ts` | 25 |
| `src/uploads/uploads.service.ts` | 19 |
| `src/public/public.controller.ts` | 17 |
| `src/public/public.module.ts` | 17 |
| `src/common/resolve-relation-filters.ts` | 14 |
| `src/dashboard/dashboard.service.ts` | 13 |
| `src/entities/user.entity.ts` | 13 |
| `src/orders/orders.service.ts` | 13 |
| `src/messages/messages.controller.ts` | 11 |
| `src/page-contents/page-contents.controller.ts` | 11 |
| `src/posts/posts.service.ts` | 11 |
| `src/users/users.controller.ts` | 11 |
| `src/contact-requests/contact-requests.controller.ts` | 10 |
| `src/groups/groups.controller.ts` | 10 |
| `src/roles/roles.controller.ts` | 10 |
| `src/sessions/sessions.controller.ts` | 10 |
| `src/users/users.service.ts` | 10 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/common/entity-id.ts` | 69 |
| `src/config/constants.ts` | 60 |
| `src/entities/user.entity.ts` | 52 |
| `src/common/api-response.ts` | 50 |
| `src/common/permissions.decorator.ts` | 44 |
| `src/config/permissions.ts` | 43 |
| `src/common/bulk-actions.ts` | 38 |
| `src/common/pagination.ts` | 37 |
| `src/common/parse-list-query.ts` | 36 |
| `src/entities/base.entity.ts` | 31 |
| `src/entities/notification.entity.ts` | 21 |
| `src/common/apply-column-filters.ts` | 18 |
| `src/entities/role.entity.ts` | 18 |
| `src/common/parse-column-filters.ts` | 17 |
| `src/common/admin-filter-configs.ts` | 17 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-parent/api` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
