# Thống kê graph — apps/hub-event/api (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.059Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `ts` | 219 |
| `directory` | 42 |
| `json` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 584 |
| `contains` | 261 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/mikro-orm/orm-entities.ts` | 46 |
| `src/app.module.ts` | 33 |
| `src/seed-full-export.ts` | 24 |
| `src/public/public.controller.ts` | 16 |
| `src/public/public.module.ts` | 16 |
| `src/common/resolve-relation-filters.ts` | 14 |
| `src/entities/user.entity.ts` | 13 |
| `src/notifications/notifications.service.ts` | 7 |
| `src/socket/socket.gateway.ts` | 7 |
| `src/entities/event.entity.ts` | 6 |
| `src/main.ts` | 6 |
| `src/posts/posts.service.ts` | 6 |
| `src/seeds/checkin-demo.runner.ts` | 6 |
| `src/users/users.service.ts` | 6 |
| `src/entities/post.entity.ts` | 5 |
| `src/public/public-auth.service.ts` | 5 |
| `src/seed-superadmin.ts` | 5 |
| `src/seeds/superadmin-bootstrap.runner.ts` | 5 |
| `src/sessions/sessions.service.ts` | 5 |
| `src/users/users.module.ts` | 5 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/entities/user.entity.ts` | 37 |
| `src/entities/base.entity.ts` | 31 |
| `src/config/constants.ts` | 21 |
| `src/entities/event.entity.ts` | 14 |
| `src/entities/user-role.entity.ts` | 13 |
| `src/entities/role.entity.ts` | 13 |
| `src/common/permissions.decorator.ts` | 13 |
| `src/config/permissions.ts` | 12 |
| `src/entities/category.entity.ts` | 10 |
| `src/entities/post.entity.ts` | 10 |
| `src/notifications/notifications.module.ts` | 9 |
| `src/entities/event-registration.entity.ts` | 9 |
| `src/entities/setting.entity.ts` | 8 |
| `src/socket/socket.module.ts` | 7 |
| `src/auth/auth.service.ts` | 7 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-event/api` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
