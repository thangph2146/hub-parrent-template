# Thống kê graph — apps/hub-event/api (Graphify)

> **Sinh tự động:** `2026-06-12T13:00:06.626Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 208 |
| `directory` | 41 |
| `json` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 675 |
| `contains` | 249 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/mikro-orm/orm-entities.ts` | 46 |
| `src/app.module.ts` | 33 |
| `src/public/public.controller.ts` | 16 |
| `src/public/public.module.ts` | 16 |
| `src/common/resolve-relation-filters.ts` | 14 |
| `src/entities/user.entity.ts` | 13 |
| `src/page-contents/page-contents.controller.ts` | 11 |
| `src/users/users.controller.ts` | 11 |
| `src/sessions/sessions.controller.ts` | 10 |
| `src/comments/comments.controller.ts` | 9 |
| `src/posts/posts.controller.ts` | 9 |
| `src/event-registrations/event-registrations.controller.ts` | 8 |
| `src/events/events.controller.ts` | 8 |
| `src/face-data/face-data.controller.ts` | 8 |
| `src/accounts/accounts.controller.ts` | 7 |
| `src/cameras/cameras.controller.ts` | 7 |
| `src/categories/categories.controller.ts` | 7 |
| `src/event-checkins/event-checkins.controller.ts` | 7 |
| `src/event-speakers/event-speakers.controller.ts` | 7 |
| `src/locations/locations.controller.ts` | 7 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/config/constants.ts` | 37 |
| `src/entities/user.entity.ts` | 36 |
| `src/entities/base.entity.ts` | 31 |
| `src/common/api-response.ts` | 29 |
| `src/common/permissions.decorator.ts` | 27 |
| `src/config/permissions.ts` | 26 |
| `src/common/bulk-actions.ts` | 15 |
| `src/entities/event.entity.ts` | 14 |
| `src/entities/user-role.entity.ts` | 12 |
| `src/entities/role.entity.ts` | 12 |
| `src/entities/notification.entity.ts` | 11 |
| `src/common/admin-list-params.ts` | 10 |
| `src/common/entity-id.ts` | 10 |
| `src/common/parse-list-query.ts` | 10 |
| `src/notifications/notifications.module.ts` | 9 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-event/api` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
