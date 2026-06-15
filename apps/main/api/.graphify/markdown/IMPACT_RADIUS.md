# Bán kính ảnh hưởng import — apps/main/api (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.225Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/config/constants.ts` | 78 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/auth/auth.controller.ts`, `src/cameras/cameras.controller.ts`, `src/carts/carts.controller.ts` |
| `src/config/permissions.ts` | 55 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts` |
| `src/entities/user.entity.ts` | 43 | `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/app/dev-login-options.ts`, `src/entities/account.entity.ts`, `src/entities/comment.entity.ts` |
| `src/common/index.ts` | 34 | `src/common/module-bases/accounts/accounts.controller.ts`, `src/common/module-bases/admission-results/admission-result.service.ts`, `src/common/module-bases/auth/auth.controller.ts`, `src/common/module-bases/auth/auth.service.ts`, `src/common/module-bases/auth/public-auth.controller.ts`, `src/common/module-bases/carts/carts.controller.ts` |
| `src/common/permissions.decorator.ts` | 33 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/cameras/cameras.controller.ts`, `src/comments/comments.controller.ts`, `src/common/crud/base-crud.controller.ts`, `src/common/index.ts` |
| `src/entities/base.entity.ts` | 31 | `src/entities/account.entity.ts`, `src/entities/admission-result.entity.ts`, `src/entities/camera.entity.ts`, `src/entities/category.entity.ts`, `src/entities/comment.entity.ts`, `src/entities/contact-request.entity.ts` |
| `src/common/entity-id.ts` | 22 | `src/common/bulk-actions.ts`, `src/common/crud/base-crud.controller.ts`, `src/common/crud/base-crud.service.ts`, `src/common/crud/base-standard-admin-crud.service.ts`, `src/common/index.ts`, `src/common/module-bases/accounts/accounts.service.ts` |
| `src/common/admin/filter-configs.ts` | 14 | `src/academic-years/academic-years.service.ts`, `src/cameras/cameras.service.ts`, `src/common/admin/index.ts`, `src/courses/courses.service.ts`, `src/departments/departments.service.ts`, `src/events/events.service.ts` |
| `src/entities/role.entity.ts` | 13 | `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/app/dev-login-options.ts`, `src/entities/user-role.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/public/public-auth.service.ts` |
| `src/entities/user-role.entity.ts` | 13 | `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/app/dev-login-options.ts`, `src/entities/role.entity.ts`, `src/entities/user.entity.ts` |
| `src/notifications/notifications.module.ts` | 13 | `src/admission-results/admission-results.module.ts`, `src/app.module.ts`, `src/categories/categories.module.ts`, `src/comments/comments.module.ts`, `src/contact-requests/contact-requests.module.ts`, `src/groups/groups.module.ts` |
| `src/entities/event.entity.ts` | 12 | `src/entities/camera.entity.ts`, `src/entities/event-checkin.entity.ts`, `src/entities/event-registration.entity.ts`, `src/entities/event-speaker.entity.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/event-registrations/event-registrations.service.ts` |
| `src/common/crud/crud-apply-column-filters.ts` | 11 | `src/common/admin/filter-configs.ts`, `src/common/crud/base-crud.service.ts`, `src/common/crud/base-standard-admin-crud.service.ts`, `src/common/module-bases/events/events-column-filters.ts`, `src/common/module-bases/events/events.service.ts`, `src/common/module-bases/orders/order-column-filters.ts` |
| `src/common/pagination.ts` | 11 | `src/common/crud/base-crud.service.ts`, `src/common/crud/base-standard-admin-crud.service.ts`, `src/common/index.ts`, `src/common/module-bases/comments/comments.service.ts`, `src/common/module-bases/event-checkins/event-checkins.service.ts`, `src/common/module-bases/event-registrations/event-registrations.service.ts` |
| `src/socket/socket.gateway.ts` | 11 | `src/common/admin/realtime/broadcast.service.ts`, `src/common/admin/realtime/interceptor.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/groups/groups.controller.ts`, `src/messages/conversations.controller.ts`, `src/messages/messages.controller.ts` |
| `src/socket/socket.module.ts` | 11 | `src/app.module.ts`, `src/contact-requests/contact-requests.module.ts`, `src/event-registrations/event-registrations.module.ts`, `src/groups/groups.module.ts`, `src/messages/messages.module.ts`, `src/notifications/notifications.module.ts` |
| `src/common/bulk-actions.ts` | 10 | `src/common/crud/base-admin-crud.controller.ts`, `src/common/crud/base-crud.controller.ts`, `src/common/crud/base-crud.service.ts`, `src/common/crud/base-standard-admin-crud.service.ts`, `src/common/index.ts`, `src/common/module-bases/event-checkins/event-checkins.service.ts` |
| `src/common/commerce/product-types.ts` | 10 | `src/common/commerce/cart-types.ts`, `src/common/commerce/gift-rules.ts`, `src/common/commerce/index.ts`, `src/common/commerce/product-units.ts`, `src/common/commerce/unit-pricing.ts`, `src/common/module-bases/orders/order-checkout.ts` |
| `src/common/date-utils.ts` | 10 | `src/common/crud/crud-date.ts`, `src/common/index.ts`, `src/common/module-bases/accounts/accounts.service.ts`, `src/common/module-bases/comments/comments.service.ts`, `src/common/module-bases/event-checkins/event-checkins.service.ts`, `src/common/module-bases/event-registrations/event-registrations.service.ts` |
| `src/entities/category.entity.ts` | 10 | `src/categories/categories.service.spec.ts`, `src/categories/categories.service.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/post-category.entity.ts`, `src/mikro-orm/orm-entities.ts`, `src/posts/posts.service.ts` |
| `src/entities/notification.entity.ts` | 10 | `src/admission-results/admission-results.controller.ts`, `src/categories/categories.controller.ts`, `src/entities/user.entity.ts`, `src/groups/groups.controller.ts`, `src/mikro-orm/orm-entities.ts`, `src/notifications/notifications.service.spec.ts` |
| `src/common/crud/base-admin-http.controller.ts` | 9 | `src/common/crud/base-admin-crud.controller.ts`, `src/common/crud/index.ts`, `src/common/module-bases/accounts/accounts.controller.ts`, `src/common/module-bases/event-checkins/event-checkins.controller.ts`, `src/common/module-bases/event-registrations/event-registrations.controller.ts`, `src/common/module-bases/event-speakers/event-speakers.controller.ts` |
| `src/entities/event-registration.entity.ts` | 9 | `src/entities/event-checkin.entity.ts`, `src/entities/event.entity.ts`, `src/event-checkins/event-checkins.service.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/event-registrations/event-registrations.service.ts`, `src/hanet/hanet-webhook.service.ts` |
| `src/entities/message.entity.ts` | 9 | `src/entities/group.entity.ts`, `src/entities/message-read.entity.ts`, `src/entities/user.entity.ts`, `src/groups/groups.service.ts`, `src/messages/conversations.controller.ts`, `src/messages/messages.controller.ts` |
| `src/entities/group.entity.ts` | 8 | `src/entities/group-member.entity.ts`, `src/entities/message.entity.ts`, `src/entities/user.entity.ts`, `src/groups/groups.service.spec.ts`, `src/groups/groups.service.ts`, `src/messages/messages.controller.ts` |

## `src/common/` — tiện ích dùng chung

- `src/common/index.ts` — 34 importer
- `src/common/permissions.decorator.ts` — 33 importer
- `src/common/entity-id.ts` — 22 importer
- `src/common/admin/filter-configs.ts` — 14 importer
- `src/common/crud/crud-apply-column-filters.ts` — 11 importer
- `src/common/pagination.ts` — 11 importer
- `src/common/bulk-actions.ts` — 10 importer
- `src/common/commerce/product-types.ts` — 10 importer
- `src/common/date-utils.ts` — 10 importer
- `src/common/crud/base-admin-http.controller.ts` — 9 importer
- `src/common/module-bases/auth/auth.service.ts` — 6 importer
- `src/common/module-bases/event-registrations/event-registrations.service.ts` — 6 importer
- `src/common/admin/realtime/broadcast.service.ts` — 5 importer
- `src/common/column-filter-builders.ts` — 5 importer
- `src/common/commerce/product-units.ts` — 5 importer

## Entity / types (`**/entities/**`)

- `src/entities/user.entity.ts` — 43 importer
- `src/entities/base.entity.ts` — 31 importer
- `src/entities/role.entity.ts` — 13 importer
- `src/entities/user-role.entity.ts` — 13 importer
- `src/entities/event.entity.ts` — 12 importer
- `src/entities/category.entity.ts` — 10 importer
- `src/entities/notification.entity.ts` — 10 importer
- `src/entities/event-registration.entity.ts` — 9 importer
- `src/entities/message.entity.ts` — 9 importer
- `src/entities/group.entity.ts` — 8 importer
- `src/entities/post.entity.ts` — 8 importer
- `src/entities/product.entity.ts` — 8 importer
- `src/entities/setting.entity.ts` — 8 importer
- `src/entities/group-member.entity.ts` — 7 importer
- `src/entities/post-category.entity.ts` — 7 importer

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/main/api` → `pnpm graphify:ai-summary`.
