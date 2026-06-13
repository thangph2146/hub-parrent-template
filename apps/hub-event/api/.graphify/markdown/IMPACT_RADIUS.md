# Bán kính ảnh hưởng import — apps/hub-event/api (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.059Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/entities/user.entity.ts` | 37 | `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/common/resolve-relation-filters.ts`, `src/entities/account.entity.ts` |
| `src/entities/base.entity.ts` | 31 | `src/entities/account.entity.ts`, `src/entities/admission-result.entity.ts`, `src/entities/camera.entity.ts`, `src/entities/category.entity.ts`, `src/entities/comment.entity.ts`, `src/entities/contact-request.entity.ts` |
| `src/config/constants.ts` | 21 | `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/common/api-access.middleware.ts`, `src/common/logging.interceptor.ts`, `src/common/permissions.guard.ts`, `src/config/app.config.ts` |
| `src/entities/event.entity.ts` | 14 | `src/entities/camera.entity.ts`, `src/entities/event-checkin.entity.ts`, `src/entities/event-registration.entity.ts`, `src/entities/event-speaker.entity.ts`, `src/event-checkins/event-checkins.service.ts`, `src/event-registrations/event-registration-attendance.service.ts` |
| `src/common/permissions.decorator.ts` | 13 | `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/common/permissions.guard.ts`, `src/dashboard/dashboard.controller.ts`, `src/event-checkouts/event-checkouts.controller.ts`, `src/locations/locations.controller.ts` |
| `src/entities/role.entity.ts` | 13 | `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/common/resolve-relation-filters.ts`, `src/entities/user-role.entity.ts`, `src/mikro-orm/orm-entities.ts` |
| `src/entities/user-role.entity.ts` | 13 | `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/entities/role.entity.ts`, `src/entities/user.entity.ts` |
| `src/config/permissions.ts` | 12 | `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/dashboard/dashboard.controller.ts`, `src/event-checkouts/event-checkouts.controller.ts`, `src/locations/locations.controller.ts`, `src/roles/roles.controller.ts` |
| `src/entities/category.entity.ts` | 10 | `src/categories/categories.service.ts`, `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/post-category.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/posts/posts.service.ts` |
| `src/entities/post.entity.ts` | 10 | `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/comment.entity.ts`, `src/entities/post-category.entity.ts`, `src/entities/post-tag.entity.ts`, `src/entities/user.entity.ts` |
| `src/entities/event-registration.entity.ts` | 9 | `src/entities/event-checkin.entity.ts`, `src/entities/event.entity.ts`, `src/event-checkins/event-checkins.service.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/event-registrations/event-registrations.service.ts`, `src/hanet/hanet-webhook.service.ts` |
| `src/notifications/notifications.module.ts` | 9 | `src/app.module.ts`, `src/categories/categories.module.ts`, `src/comments/comments.module.ts`, `src/page-contents/page-contents.module.ts`, `src/posts/posts.module.ts`, `src/roles/roles.module.ts` |
| `src/entities/setting.entity.ts` | 8 | `src/auth/auth.service.ts`, `src/common/resolve-relation-filters.ts`, `src/mikro-orm/orm-entities.ts`, `src/public/public-auth.service.ts`, `src/public/public-posts.service.ts`, `src/seed-full-export.ts` |
| `src/auth/auth.service.ts` | 7 | `src/auth/auth.controller.ts`, `src/auth/auth.module.ts`, `src/auth/auth.service.spec.ts`, `src/common/permissions.guard.ts`, `src/public/public-auth.service.ts`, `src/public/public.controller.ts` |
| `src/common/admin-filter-configs.ts` | 7 | `src/cameras/cameras.service.ts`, `src/categories/categories.service.ts`, `src/locations/locations.service.ts`, `src/screens/screens.service.ts`, `src/seo-metas/seo-metas.service.ts`, `src/speakers/speakers.service.ts` |
| `src/entities/message.entity.ts` | 7 | `src/common/resolve-relation-filters.ts`, `src/entities/group.entity.ts`, `src/entities/message-read.entity.ts`, `src/entities/user.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/notifications/notifications.service.ts` |
| `src/entities/notification.entity.ts` | 7 | `src/common/resolve-relation-filters.ts`, `src/entities/user.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/notifications/notifications.service.spec.ts`, `src/notifications/notifications.service.ts`, `src/seed-full-export.ts` |
| `src/entities/tag.entity.ts` | 7 | `src/common/resolve-relation-filters.ts`, `src/entities/post-tag.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/posts/posts.service.ts`, `src/public/public-posts.service.ts`, `src/seed-full-export.ts` |
| `src/socket/socket.gateway.ts` | 7 | `src/common/admin-realtime-broadcast.service.ts`, `src/common/admin-realtime.interceptor.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/notifications/notifications.service.spec.ts`, `src/notifications/notifications.service.ts`, `src/sessions/sessions.controller.ts` |
| `src/socket/socket.module.ts` | 7 | `src/app.module.ts`, `src/event-registrations/event-registrations.module.ts`, `src/notifications/notifications.module.ts`, `src/public/public.module.ts`, `src/roles/roles.module.ts`, `src/sessions/sessions.module.ts` |
| `src/common/product-types.ts` | 6 | `src/common/cart-types.ts`, `src/common/gift-rules.ts`, `src/common/product-units.ts`, `src/common/unit-pricing.ts`, `src/entities/order.entity.ts`, `src/entities/product.entity.ts` |
| `src/entities/camera.entity.ts` | 6 | `src/cameras/cameras.service.ts`, `src/entities/event.entity.ts`, `src/entities/screen.entity.ts`, `src/events/events.service.ts`, `src/hanet/hanet-webhook.service.ts`, `src/mikro-orm/orm-entities.ts` |
| `src/entities/contact-request.entity.ts` | 6 | `src/common/resolve-relation-filters.ts`, `src/entities/user.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/notifications/notifications.service.ts`, `src/public/public-contact-requests.service.ts`, `src/seed-full-export.ts` |
| `src/entities/group.entity.ts` | 6 | `src/common/resolve-relation-filters.ts`, `src/entities/group-member.entity.ts`, `src/entities/message.entity.ts`, `src/entities/user.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/seed-full-export.ts` |
| `src/entities/page-content.entity.ts` | 6 | `src/mikro-orm/orm-entities.ts`, `src/page-contents/page-contents.service.ts`, `src/seed-full-export.ts`, `src/seed-guides.ts`, `src/seed-superadmin.ts`, `src/seeds/superadmin-bootstrap.runner.ts` |

## `src/common/` — tiện ích dùng chung

- `src/common/permissions.decorator.ts` — 13 importer
- `src/common/admin-filter-configs.ts` — 7 importer
- `src/common/product-types.ts` — 6 importer
- `src/common/entity-id.ts` — 4 importer
- `src/common/public.decorator.ts` — 4 importer
- `src/common/get-options.ts` — 3 importer
- `src/common/request-id.middleware.ts` — 3 importer
- `src/common/admin-realtime-broadcast.service.ts` — 2 importer
- `src/common/api-response.ts` — 2 importer
- `src/common/product-units.ts` — 2 importer

## Entity / types (`**/entities/**`)

- `src/entities/user.entity.ts` — 37 importer
- `src/entities/base.entity.ts` — 31 importer
- `src/entities/event.entity.ts` — 14 importer
- `src/entities/role.entity.ts` — 13 importer
- `src/entities/user-role.entity.ts` — 13 importer
- `src/entities/category.entity.ts` — 10 importer
- `src/entities/post.entity.ts` — 10 importer
- `src/entities/event-registration.entity.ts` — 9 importer
- `src/entities/setting.entity.ts` — 8 importer
- `src/entities/message.entity.ts` — 7 importer
- `src/entities/notification.entity.ts` — 7 importer
- `src/entities/tag.entity.ts` — 7 importer
- `src/entities/camera.entity.ts` — 6 importer
- `src/entities/contact-request.entity.ts` — 6 importer
- `src/entities/group.entity.ts` — 6 importer

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-event/api` → `pnpm graphify:ai-summary`.
