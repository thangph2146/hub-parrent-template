# Thống kê graph — api (Graphify)

> **Sinh tự động:** `2026-06-04T07:32:10.133Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 227 |
| `directory` | 53 |
| `json` | 2 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 794 |
| `contains` | 281 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app.module.ts` | 45 |
| `src/mikro-orm/orm-entities.ts` | 41 |
| `src/seed-full-export.ts` | 24 |
| `src/system/system.service.ts` | 19 |
| `src/public/public.module.ts` | 14 |
| `src/common/resolve-relation-filters.ts` | 13 |
| `src/entities/user.entity.ts` | 13 |
| `src/public/public.controller.ts` | 13 |
| `src/dashboard/dashboard.service.ts` | 12 |
| `src/posts/posts.service.ts` | 10 |
| `src/messages/messages.controller.ts` | 8 |
| `src/users/users.controller.ts` | 8 |
| `src/groups/groups.controller.ts` | 7 |
| `src/page-contents/page-contents.controller.ts` | 7 |
| `src/public/public-events.service.ts` | 7 |
| `src/roles/roles.controller.ts` | 7 |
| `src/sessions/sessions.controller.ts` | 7 |
| `src/sessions/sessions.service.ts` | 7 |
| `src/users/users.service.ts` | 7 |
| `src/admission-results/admission-results.controller.ts` | 6 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/config/constants.ts` | 51 |
| `src/common/api-response.ts` | 43 |
| `src/entities/user.entity.ts` | 43 |
| `src/common/pagination.ts` | 32 |
| `src/entities/base.entity.ts` | 30 |
| `src/entities/notification.entity.ts` | 21 |
| `src/entities/role.entity.ts` | 17 |
| `src/entities/user-role.entity.ts` | 15 |
| `src/notifications/notifications.service.ts` | 15 |
| `src/entities/event.entity.ts` | 15 |
| `src/config/permissions.ts` | 13 |
| `src/notifications/notifications.module.ts` | 13 |
| `src/entities/category.entity.ts` | 13 |
| `src/entities/message.entity.ts` | 12 |
| `src/entities/post.entity.ts` | 12 |

## Làm mới

Chạy `node apps/api/.graphify/update.cjs` rồi `pnpm graphify:ai-summary`.
