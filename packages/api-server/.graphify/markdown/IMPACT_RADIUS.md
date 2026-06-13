# Bán kính ảnh hưởng import — packages/api-server (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.382Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/data-test/fixture.ts` | 88 | `src/bases/base-crud.controller.spec.ts`, `src/common/apply-column-filters.spec.ts`, `src/common/bulk-actions.spec.ts`, `src/data-test/fake-em.spec.ts`, `src/data-test/fake-em.ts`, `src/data-test/fixture.spec.ts` |
| `src/data-test/fake-em.ts` | 50 | `src/common/apply-column-filters.spec.ts`, `src/common/bulk-actions.spec.ts`, `src/data-test/fake-em.spec.ts`, `src/modules/academic-years/academic-year.service.integration.spec.ts`, `src/modules/accounts/accounts.service.integration.spec.ts`, `src/modules/admission-results/admission-result.service.integration.spec.ts` |
| `src/common/entity-id.ts` | 22 | `src/common/bulk-actions.ts`, `src/common/entity-id.spec.ts`, `src/common/index.ts`, `src/common/resolve-relation-filters.ts`, `src/modules/accounts/accounts.service.ts`, `src/modules/comments/comments.service.ts` |
| `src/common/pagination.ts` | 15 | `src/common/index.ts`, `src/common/pagination.spec.ts`, `src/common/parse-list-query.ts`, `src/modules/comments/comments.service.ts`, `src/modules/event-checkins/event-checkins.service.ts`, `src/modules/event-registrations/event-registrations.service.ts` |
| `src/common/date-utils.ts` | 11 | `src/common/index.ts`, `src/modules/accounts/accounts.service.ts`, `src/modules/comments/comments.service.ts`, `src/modules/event-checkins/event-checkins.service.ts`, `src/modules/event-registrations/event-registrations.service.ts`, `src/modules/event-speakers/event-speakers.service.ts` |
| `src/bases/base-admin-http.controller.ts` | 9 | `src/bases/base-admin-crud.controller.ts`, `src/bases/index.ts`, `src/modules/accounts/accounts.controller.ts`, `src/modules/event-checkins/event-checkins.controller.ts`, `src/modules/event-registrations/event-registrations.controller.ts`, `src/modules/event-speakers/event-speakers.controller.ts` |
| `src/modules/auth/auth.service.ts` | 8 | `src/modules/auth/auth.controller.ts`, `src/modules/auth/auth.module.ts`, `src/modules/auth/auth.service.spec.ts`, `src/modules/auth/index.ts`, `src/modules/auth/public-auth.controller.ts`, `src/modules/public/public-auth.service.ts` |
| `src/modules/event-registrations/event-registrations.service.ts` | 8 | `src/modules/event-registrations/event-registration-attendance.deps.ts`, `src/modules/event-registrations/event-registration-attendance.service.ts`, `src/modules/event-registrations/event-registration-attendance.types.ts`, `src/modules/event-registrations/event-registrations.controller.ts`, `src/modules/event-registrations/event-registrations.module.ts`, `src/modules/event-registrations/event-registrations.service.integration.spec.ts` |
| `src/common/bulk-actions.ts` | 7 | `src/common/bulk-actions.spec.ts`, `src/common/index.ts`, `src/modules/event-checkins/event-checkins.service.ts`, `src/modules/event-registrations/event-registrations.service.ts`, `src/modules/event-speakers/event-speakers.service.ts`, `src/modules/events/events.service.ts` |
| `src/modules/contact-requests/contact-request.service.ts` | 7 | `src/modules/contact-requests/contact-request.controller.spec.ts`, `src/modules/contact-requests/contact-request.controller.ts`, `src/modules/contact-requests/contact-request.module.ts`, `src/modules/contact-requests/contact-request.service.integration.spec.ts`, `src/modules/contact-requests/contact-request.service.spec.ts`, `src/modules/contact-requests/index.ts` |
| `src/modules/posts/posts.service.ts` | 7 | `src/modules/posts/index.ts`, `src/modules/posts/posts.controller.spec.ts`, `src/modules/posts/posts.controller.ts`, `src/modules/posts/posts.module.ts`, `src/modules/posts/posts.service.integration.spec.ts`, `src/modules/posts/posts.service.spec.ts` |
| `src/modules/settings/setting.service.ts` | 7 | `src/modules/settings/index.ts`, `src/modules/settings/public-settings.controller.ts`, `src/modules/settings/setting.controller.ts`, `src/modules/settings/setting.module.ts`, `src/modules/settings/setting.service.integration.spec.ts`, `src/modules/settings/setting.service.spec.ts` |
| `src/modules/cameras/camera.service.ts` | 6 | `src/modules/cameras/camera.controller.ts`, `src/modules/cameras/camera.module.ts`, `src/modules/cameras/camera.service.integration.spec.ts`, `src/modules/cameras/camera.service.spec.ts`, `src/modules/cameras/cameras.module.ts`, `src/modules/cameras/index.ts` |
| `src/modules/courses/course.service.ts` | 6 | `src/modules/courses/course.controller.ts`, `src/modules/courses/course.module.ts`, `src/modules/courses/course.service.integration.spec.ts`, `src/modules/courses/course.service.spec.ts`, `src/modules/courses/courses.module.ts`, `src/modules/courses/index.ts` |
| `src/modules/dashboard/dashboard.types.ts` | 6 | `src/modules/dashboard/dashboard.controller.spec.ts`, `src/modules/dashboard/dashboard.controller.ts`, `src/modules/dashboard/dashboard.module.ts`, `src/modules/dashboard/dashboard.service.spec.ts`, `src/modules/dashboard/dashboard.service.ts`, `src/modules/dashboard/index.ts` |
| `src/modules/departments/department.service.ts` | 6 | `src/modules/departments/department.controller.ts`, `src/modules/departments/department.module.ts`, `src/modules/departments/department.service.integration.spec.ts`, `src/modules/departments/department.service.spec.ts`, `src/modules/departments/departments.module.ts`, `src/modules/departments/index.ts` |
| `src/modules/groups/group.service.ts` | 6 | `src/modules/groups/group.controller.ts`, `src/modules/groups/group.module.ts`, `src/modules/groups/group.service.integration.spec.ts`, `src/modules/groups/group.service.spec.ts`, `src/modules/groups/groups.module.ts`, `src/modules/groups/index.ts` |
| `src/modules/locations/location.service.ts` | 6 | `src/modules/locations/index.ts`, `src/modules/locations/location.controller.ts`, `src/modules/locations/location.module.ts`, `src/modules/locations/location.service.integration.spec.ts`, `src/modules/locations/location.service.spec.ts`, `src/modules/locations/locations.module.ts` |
| `src/modules/majors/major.service.ts` | 6 | `src/modules/majors/index.ts`, `src/modules/majors/major.controller.ts`, `src/modules/majors/major.module.ts`, `src/modules/majors/major.service.integration.spec.ts`, `src/modules/majors/major.service.spec.ts`, `src/modules/majors/majors.module.ts` |
| `src/modules/messages/message.service.ts` | 6 | `src/modules/messages/index.ts`, `src/modules/messages/message.controller.ts`, `src/modules/messages/message.module.ts`, `src/modules/messages/message.service.integration.spec.ts`, `src/modules/messages/message.service.spec.ts`, `src/modules/messages/messages.module.ts` |
| `src/modules/notifications/notifications.service.ts` | 6 | `src/modules/notifications/index.ts`, `src/modules/notifications/notifications.controller.ts`, `src/modules/notifications/notifications.module.ts`, `src/modules/notifications/notifications.service.integration.spec.ts`, `src/modules/notifications/notifications.service.spec.ts`, `src/modules/sessions/sessions.controller.ts` |
| `src/modules/orders/order.service.ts` | 6 | `src/modules/orders/index.ts`, `src/modules/orders/order.controller.ts`, `src/modules/orders/order.module.ts`, `src/modules/orders/order.service.integration.spec.ts`, `src/modules/orders/order.service.spec.ts`, `src/modules/orders/orders.module.ts` |
| `src/modules/products/product.service.ts` | 6 | `src/modules/products/index.ts`, `src/modules/products/product.controller.ts`, `src/modules/products/product.module.ts`, `src/modules/products/product.service.integration.spec.ts`, `src/modules/products/product.service.spec.ts`, `src/modules/products/products.module.ts` |
| `src/modules/roles/role.service.ts` | 6 | `src/modules/roles/index.ts`, `src/modules/roles/role.controller.ts`, `src/modules/roles/role.module.ts`, `src/modules/roles/role.service.integration.spec.ts`, `src/modules/roles/role.service.spec.ts`, `src/modules/roles/roles.module.ts` |
| `src/modules/screens/screen.service.ts` | 6 | `src/modules/screens/index.ts`, `src/modules/screens/screen.controller.ts`, `src/modules/screens/screen.module.ts`, `src/modules/screens/screen.service.integration.spec.ts`, `src/modules/screens/screen.service.spec.ts`, `src/modules/screens/screens.module.ts` |

## `src/common/` — tiện ích dùng chung

- `src/common/entity-id.ts` — 22 importer
- `src/common/pagination.ts` — 15 importer
- `src/common/date-utils.ts` — 11 importer
- `src/common/bulk-actions.ts` — 7 importer
- `src/common/apply-column-filters.ts` — 5 importer
- `src/common/parse-list-query.ts` — 5 importer
- `src/common/poster-normalize.ts` — 4 importer
- `src/common/admin-filter-configs.ts` — 3 importer
- `src/common/image-processor.ts` — 3 importer
- `src/common/resolve-relation-filters.ts` — 3 importer
- `src/common/api-response.ts` — 2 importer
- `src/common/event-time-status.ts` — 2 importer
- `src/common/fs-unlink-retry.ts` — 2 importer
- `src/common/get-options.ts` — 2 importer
- `src/common/parse-column-filters.ts` — 2 importer

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/api-server` → `pnpm graphify:ai-summary`.
