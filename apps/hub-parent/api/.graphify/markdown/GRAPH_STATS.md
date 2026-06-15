# Thống kê graph — apps/hub-parent/api (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.316Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 541 |
| `directory` | 111 |
| `gz` | 1 |
| `json` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 1467 |
| `contains` | 652 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app.module.ts` | 51 |
| `src/mikro-orm/orm-entities.ts` | 46 |
| `src/seed-full-export.ts` | 26 |
| `src/common/index.ts` | 22 |
| `src/public/public.module.ts` | 17 |
| `src/public/public.controller.ts` | 16 |
| `src/uploads/uploads.service.ts` | 15 |
| `src/entities/user.entity.ts` | 13 |
| `src/messages/messages.controller.ts` | 9 |
| `src/notifications/notifications.service.ts` | 8 |
| `src/orders/orders.controller.ts` | 8 |
| `src/common/crud/index.ts` | 7 |
| `src/common/module-bases/event-registrations/event-registrations.controller.ts` | 7 |
| `src/common/module-bases/events/events.service.ts` | 7 |
| `src/common/module-bases/orders/order.service.ts` | 7 |
| `src/common/module-bases/sessions/sessions.controller.ts` | 7 |
| `src/event-registrations/event-registration-attendance.service.ts` | 7 |
| `src/groups/groups.controller.ts` | 7 |
| `src/hanet/hanet-webhook.service.ts` | 7 |
| `src/orders/orders.service.ts` | 7 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/config/constants.ts` | 81 |
| `src/config/permissions.ts` | 55 |
| `src/entities/user.entity.ts` | 43 |
| `src/common/index.ts` | 34 |
| `src/common/permissions.decorator.ts` | 33 |
| `src/entities/base.entity.ts` | 31 |
| `src/common/entity-id.ts` | 22 |
| `src/common/admin/filter-configs.ts` | 14 |
| `src/entities/user-role.entity.ts` | 13 |
| `src/notifications/notifications.module.ts` | 13 |
| `src/entities/role.entity.ts` | 13 |
| `src/common/crud/crud-apply-column-filters.ts` | 12 |
| `src/entities/event.entity.ts` | 12 |
| `src/socket/socket.module.ts` | 11 |
| `src/socket/socket.gateway.ts` | 11 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-parent/api` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
