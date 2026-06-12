# Bán kính ảnh hưởng import — apps/hub-event/api (Graphify)

> **Sinh tự động:** `2026-06-12T14:20:21.185Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/config/constants.ts` | 37 | `src/accounts/accounts.controller.ts`, `src/auth/auth-admin.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/common/api-access.middleware.ts` |
| `src/entities/user.entity.ts` | 36 | `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/common/resolve-relation-filters.ts`, `src/entities/account.entity.ts` |
| `src/entities/base.entity.ts` | 31 | `src/entities/account.entity.ts`, `src/entities/admission-result.entity.ts`, `src/entities/camera.entity.ts`, `src/entities/category.entity.ts`, `src/entities/comment.entity.ts`, `src/entities/contact-request.entity.ts` |
| `src/common/api-response.ts` | 29 | `src/accounts/accounts.controller.ts`, `src/auth/auth-admin.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/common/database-http-exception.filter.ts` |
| `src/common/permissions.decorator.ts` | 27 | `src/accounts/accounts.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/common/permissions.guard.ts`, `src/dashboard/dashboard.controller.ts` |
| `src/config/permissions.ts` | 26 | `src/accounts/accounts.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/dashboard/dashboard.controller.ts`, `src/event-checkins/event-checkins.controller.ts` |
| `src/common/bulk-actions.ts` | 15 | `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/event-checkins/event-checkins.controller.ts`, `src/event-registrations/event-registrations.controller.ts`, `src/event-speakers/event-speakers.controller.ts`, `src/events/events.controller.ts` |
| `src/entities/event.entity.ts` | 14 | `src/entities/camera.entity.ts`, `src/entities/event-checkin.entity.ts`, `src/entities/event-registration.entity.ts`, `src/entities/event-speaker.entity.ts`, `src/event-checkins/event-checkins.service.ts`, `src/event-registrations/event-registration-attendance.service.ts` |
| `src/entities/role.entity.ts` | 12 | `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/common/resolve-relation-filters.ts`, `src/entities/user-role.entity.ts`, `src/mikro-orm/orm-entities.ts` |
| `src/entities/user-role.entity.ts` | 12 | `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/entities/role.entity.ts`, `src/entities/user.entity.ts` |
| `src/entities/notification.entity.ts` | 11 | `src/comments/comments.controller.ts`, `src/common/resolve-relation-filters.ts`, `src/entities/user.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/notifications/notifications.service.spec.ts`, `src/notifications/notifications.service.ts` |
| `src/common/admin-list-params.ts` | 10 | `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/face-data/face-data.controller.ts`, `src/locations/locations.controller.ts`, `src/roles/roles.controller.ts`, `src/screens/screens.controller.ts` |
| `src/common/entity-id.ts` | 10 | `src/comments/comments.controller.ts`, `src/common/bulk-actions.ts`, `src/common/resolve-relation-filters.ts`, `src/face-data/face-data.controller.ts`, `src/notifications/notifications.controller.ts`, `src/page-contents/page-contents.controller.ts` |
| `src/common/parse-list-query.ts` | 10 | `src/comments/comments.controller.ts`, `src/event-checkins/event-checkins.controller.ts`, `src/event-checkouts/event-checkouts.controller.ts`, `src/event-registrations/event-registrations.controller.ts`, `src/event-speakers/event-speakers.controller.ts`, `src/events/events.controller.ts` |
| `src/entities/category.entity.ts` | 9 | `src/categories/categories.service.ts`, `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/post-category.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/posts/posts.service.ts` |
| `src/entities/event-registration.entity.ts` | 9 | `src/entities/event-checkin.entity.ts`, `src/entities/event.entity.ts`, `src/event-checkins/event-checkins.service.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/event-registrations/event-registrations.service.ts`, `src/hanet/hanet-webhook.service.ts` |
| `src/entities/post.entity.ts` | 9 | `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/comment.entity.ts`, `src/entities/post-category.entity.ts`, `src/entities/post-tag.entity.ts`, `src/entities/user.entity.ts` |
| `src/notifications/notifications.module.ts` | 9 | `src/app.module.ts`, `src/categories/categories.module.ts`, `src/comments/comments.module.ts`, `src/page-contents/page-contents.module.ts`, `src/posts/posts.module.ts`, `src/roles/roles.module.ts` |
| `src/auth/auth.service.ts` | 8 | `src/auth/auth-admin.controller.ts`, `src/auth/auth.module.ts`, `src/auth/auth.service.spec.ts`, `src/common/permissions.guard.ts`, `src/page-contents/page-contents.controller.ts`, `src/public/public-auth.service.ts` |
| `src/notifications/notifications.service.ts` | 8 | `src/comments/comments.controller.ts`, `src/notifications/notifications.controller.ts`, `src/notifications/notifications.module.ts`, `src/notifications/notifications.service.spec.ts`, `src/page-contents/page-contents.controller.ts`, `src/posts/posts.controller.ts` |
| `src/socket/socket.gateway.ts` | 8 | `src/common/admin-realtime-broadcast.service.ts`, `src/common/admin-realtime.interceptor.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/notifications/notifications.service.spec.ts`, `src/notifications/notifications.service.ts`, `src/sessions/sessions.controller.ts` |
| `src/common/admin-filter-configs.ts` | 7 | `src/cameras/cameras.service.ts`, `src/categories/categories.service.ts`, `src/locations/locations.service.ts`, `src/screens/screens.service.ts`, `src/seo-metas/seo-metas.service.ts`, `src/speakers/speakers.service.ts` |
| `src/entities/setting.entity.ts` | 7 | `src/auth/auth.service.ts`, `src/common/resolve-relation-filters.ts`, `src/mikro-orm/orm-entities.ts`, `src/public/public-auth.service.ts`, `src/public/public-posts.service.ts`, `src/settings/settings.service.ts` |
| `src/socket/socket.module.ts` | 7 | `src/app.module.ts`, `src/event-registrations/event-registrations.module.ts`, `src/notifications/notifications.module.ts`, `src/public/public.module.ts`, `src/roles/roles.module.ts`, `src/sessions/sessions.module.ts` |
| `src/common/public.decorator.ts` | 6 | `src/auth/auth-admin.controller.ts`, `src/common/permissions.guard.ts`, `src/hanet/hanet-webhook.controller.ts`, `src/proxy-image/proxy-image.controller.ts`, `src/public/public.controller.ts`, `src/uploads/public-uploads.controller.ts` |

## `src/common/` — tiện ích dùng chung

- `src/common/api-response.ts` — 29 importer
- `src/common/permissions.decorator.ts` — 27 importer
- `src/common/bulk-actions.ts` — 15 importer
- `src/common/admin-list-params.ts` — 10 importer
- `src/common/entity-id.ts` — 10 importer
- `src/common/parse-list-query.ts` — 10 importer
- `src/common/admin-filter-configs.ts` — 7 importer
- `src/common/public.decorator.ts` — 6 importer
- `src/common/get-options.ts` — 3 importer
- `src/common/product-types.ts` — 3 importer
- `src/common/request-id.middleware.ts` — 3 importer
- `src/common/admin-realtime-broadcast.service.ts` — 2 importer
- `src/common/parse-column-filters.ts` — 2 importer

## Entity / types (`**/entities/**`)

- `src/entities/user.entity.ts` — 36 importer
- `src/entities/base.entity.ts` — 31 importer
- `src/entities/event.entity.ts` — 14 importer
- `src/entities/role.entity.ts` — 12 importer
- `src/entities/user-role.entity.ts` — 12 importer
- `src/entities/notification.entity.ts` — 11 importer
- `src/entities/category.entity.ts` — 9 importer
- `src/entities/event-registration.entity.ts` — 9 importer
- `src/entities/post.entity.ts` — 9 importer
- `src/entities/setting.entity.ts` — 7 importer
- `src/entities/camera.entity.ts` — 6 importer
- `src/entities/message.entity.ts` — 6 importer
- `src/entities/tag.entity.ts` — 6 importer
- `src/entities/contact-request.entity.ts` — 5 importer
- `src/entities/group.entity.ts` — 5 importer

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-event/api` → `pnpm graphify:ai-summary`.
