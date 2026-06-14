# Bán kính ảnh hưởng import — apps/main/api (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.317Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/common/entity-id.ts` | 66 | `src/academic-years/academic-years.service.ts`, `src/accounts/accounts.service.ts`, `src/admission-results/admission-results.controller.ts`, `src/admission-results/admission-results.service.ts`, `src/cameras/cameras.service.ts`, `src/categories/categories.controller.ts` |
| `src/config/constants.ts` | 57 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/cameras/cameras.controller.ts`, `src/carts/public-carts.controller.ts`, `src/categories/categories.controller.ts` |
| `src/entities/user.entity.ts` | 51 | `src/accounts/accounts.service.spec.ts`, `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/common/resolve-relation-filters.ts` |
| `src/common/api-response.ts` | 48 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/cameras/cameras.controller.ts`, `src/carts/public-carts.controller.ts`, `src/categories/categories.controller.ts` |
| `src/common/permissions.decorator.ts` | 43 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts` |
| `src/config/permissions.ts` | 42 | `src/academic-years/academic-years.controller.ts`, `src/accounts/accounts.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts` |
| `src/common/bulk-actions.ts` | 38 | `src/academic-years/academic-years.controller.ts`, `src/academic-years/academic-years.service.ts`, `src/cameras/cameras.controller.ts`, `src/cameras/cameras.service.ts`, `src/courses/courses.controller.ts`, `src/courses/courses.service.ts` |
| `src/common/pagination.ts` | 37 | `src/academic-years/academic-years.service.ts`, `src/admission-results/admission-results.service.ts`, `src/cameras/cameras.service.ts`, `src/categories/categories.service.ts`, `src/comments/comments.service.ts`, `src/common/parse-list-query.ts` |
| `src/common/parse-list-query.ts` | 36 | `src/academic-years/academic-years.controller.ts`, `src/admission-results/admission-results.controller.ts`, `src/cameras/cameras.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/contact-requests/contact-requests.controller.ts` |
| `src/entities/base.entity.ts` | 31 | `src/entities/account.entity.ts`, `src/entities/admission-result.entity.ts`, `src/entities/camera.entity.ts`, `src/entities/category.entity.ts`, `src/entities/comment.entity.ts`, `src/entities/contact-request.entity.ts` |
| `src/entities/notification.entity.ts` | 20 | `src/admission-results/admission-results.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/common/resolve-relation-filters.ts`, `src/contact-requests/contact-requests.controller.ts`, `src/dashboard/dashboard.service.ts` |
| `src/common/apply-column-filters.ts` | 18 | `src/academic-years/academic-years.service.ts`, `src/cameras/cameras.service.ts`, `src/common/admin-filter-configs.ts`, `src/courses/courses.service.ts`, `src/departments/departments.service.ts`, `src/events/events.service.ts` |
| `src/common/admin-filter-configs.ts` | 17 | `src/academic-years/academic-years.service.ts`, `src/cameras/cameras.service.ts`, `src/courses/courses.service.ts`, `src/departments/departments.service.ts`, `src/events/events.service.ts`, `src/locations/locations.service.ts` |
| `src/common/parse-column-filters.ts` | 17 | `src/academic-years/academic-years.controller.ts`, `src/cameras/cameras.controller.ts`, `src/courses/courses.controller.ts`, `src/departments/departments.controller.ts`, `src/events/events.controller.ts`, `src/locations/locations.controller.ts` |
| `src/entities/role.entity.ts` | 17 | `src/accounts/accounts.service.spec.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts` |
| `src/entities/event.entity.ts` | 15 | `src/cameras/cameras.service.ts`, `src/entities/camera.entity.ts`, `src/entities/event-checkin.entity.ts`, `src/entities/event-registration.entity.ts`, `src/entities/event-speaker.entity.ts`, `src/event-checkins/event-checkins.service.ts` |
| `src/entities/user-role.entity.ts` | 15 | `src/accounts/accounts.service.spec.ts`, `src/accounts/accounts.service.ts`, `src/auth/auth.service.spec.ts`, `src/auth/auth.service.ts`, `src/common/dev-login-options.ts`, `src/entities/role.entity.ts` |
| `src/notifications/notifications.service.ts` | 15 | `src/admission-results/admission-results.controller.ts`, `src/categories/categories.controller.ts`, `src/comments/comments.controller.ts`, `src/contact-requests/contact-requests.controller.ts`, `src/groups/groups.controller.ts`, `src/notifications/notifications.controller.ts` |
| `src/notifications/notifications.module.ts` | 13 | `src/admission-results/admission-results.module.ts`, `src/app.module.ts`, `src/categories/categories.module.ts`, `src/comments/comments.module.ts`, `src/contact-requests/contact-requests.module.ts`, `src/groups/groups.module.ts` |
| `src/entities/category.entity.ts` | 12 | `src/categories/categories.service.spec.ts`, `src/categories/categories.service.ts`, `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/post-category.entity.ts`, `src/mikro-orm/orm-entities.ts` |
| `src/socket/socket.gateway.ts` | 12 | `src/common/admin-realtime-broadcast.service.ts`, `src/common/admin-realtime.interceptor.ts`, `src/event-registrations/event-registration-attendance.service.ts`, `src/groups/groups.controller.ts`, `src/messages/conversations.controller.ts`, `src/messages/messages.controller.ts` |
| `src/entities/message.entity.ts` | 11 | `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/group.entity.ts`, `src/entities/message-read.entity.ts`, `src/entities/user.entity.ts`, `src/groups/groups.service.ts` |
| `src/entities/post.entity.ts` | 11 | `src/common/resolve-relation-filters.ts`, `src/dashboard/dashboard.service.ts`, `src/entities/comment.entity.ts`, `src/entities/post-category.entity.ts`, `src/entities/post-tag.entity.ts`, `src/entities/user.entity.ts` |
| `src/entities/product.entity.ts` | 11 | `src/common/gift-rules.spec.ts`, `src/common/gift-rules.ts`, `src/common/product-units.spec.ts`, `src/common/product-units.ts`, `src/mikro-orm/orm-entities.ts`, `src/orders/order-checkout.spec.ts` |
| `src/socket/socket.module.ts` | 11 | `src/app.module.ts`, `src/contact-requests/contact-requests.module.ts`, `src/event-registrations/event-registrations.module.ts`, `src/groups/groups.module.ts`, `src/messages/messages.module.ts`, `src/notifications/notifications.module.ts` |

## `src/common/` — tiện ích dùng chung

- `src/common/entity-id.ts` — 66 importer
- `src/common/api-response.ts` — 48 importer
- `src/common/permissions.decorator.ts` — 43 importer
- `src/common/bulk-actions.ts` — 38 importer
- `src/common/pagination.ts` — 37 importer
- `src/common/parse-list-query.ts` — 36 importer
- `src/common/apply-column-filters.ts` — 18 importer
- `src/common/admin-filter-configs.ts` — 17 importer
- `src/common/parse-column-filters.ts` — 17 importer
- `src/common/product-types.ts` — 9 importer
- `src/common/public.decorator.ts` — 9 importer
- `src/common/get-options.ts` — 5 importer
- `src/common/legacy-audit-timestamps.ts` — 5 importer
- `src/common/admin-realtime-broadcast.service.ts` — 4 importer
- `src/common/date-utils.ts` — 4 importer

## Entity / types (`**/entities/**`)

- `src/entities/user.entity.ts` — 51 importer
- `src/entities/base.entity.ts` — 31 importer
- `src/entities/notification.entity.ts` — 20 importer
- `src/entities/role.entity.ts` — 17 importer
- `src/entities/event.entity.ts` — 15 importer
- `src/entities/user-role.entity.ts` — 15 importer
- `src/entities/category.entity.ts` — 12 importer
- `src/entities/message.entity.ts` — 11 importer
- `src/entities/post.entity.ts` — 11 importer
- `src/entities/product.entity.ts` — 11 importer
- `src/entities/event-registration.entity.ts` — 10 importer
- `src/entities/tag.entity.ts` — 10 importer
- `src/entities/contact-request.entity.ts` — 9 importer
- `src/entities/group.entity.ts` — 9 importer
- `src/entities/setting.entity.ts` — 9 importer

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/main/api` → `pnpm graphify:ai-summary`.
