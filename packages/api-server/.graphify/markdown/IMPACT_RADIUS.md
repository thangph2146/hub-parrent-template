# Bán kính ảnh hưởng import — packages/api-server (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.613Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/common/entity-id.ts` | 19 | `src/common/bulk-actions.ts`, `src/common/entity-id.spec.ts`, `src/common/index.ts`, `src/common/resolve-relation-filters.ts`, `src/modules/accounts/accounts.service.ts`, `src/modules/comments/comments.service.ts` |
| `src/common/pagination.ts` | 11 | `src/common/index.ts`, `src/common/pagination.spec.ts`, `src/common/parse-list-query.ts`, `src/modules/comments/comments.service.ts`, `src/modules/event-checkins/event-checkins.service.ts`, `src/modules/event-registrations/event-registrations.service.ts` |
| `src/common/date-utils.ts` | 10 | `src/common/index.ts`, `src/modules/accounts/accounts.service.ts`, `src/modules/comments/comments.service.ts`, `src/modules/event-checkins/event-checkins.service.ts`, `src/modules/event-registrations/event-registrations.service.ts`, `src/modules/event-speakers/event-speakers.service.ts` |
| `src/bases/base-admin-http.controller.ts` | 9 | `src/bases/base-admin-crud.controller.ts`, `src/bases/index.ts`, `src/modules/accounts/accounts.controller.ts`, `src/modules/event-checkins/event-checkins.controller.ts`, `src/modules/event-registrations/event-registrations.controller.ts`, `src/modules/event-speakers/event-speakers.controller.ts` |
| `src/common/bulk-actions.ts` | 7 | `src/common/bulk-actions.spec.ts`, `src/common/index.ts`, `src/modules/event-checkins/event-checkins.service.ts`, `src/modules/event-registrations/event-registrations.service.ts`, `src/modules/event-speakers/event-speakers.service.ts`, `src/modules/events/events.service.ts` |
| `src/common/apply-column-filters.ts` | 6 | `src/common/apply-column-filters.spec.ts`, `src/common/index.ts`, `src/modules/events/events-column-filters.ts`, `src/modules/events/events.service.ts`, `src/modules/page-contents/page-contents-column-filters.ts`, `src/modules/page-contents/page-contents.service.ts` |
| `src/data-test/fixture.ts` | 6 | `src/bases/base-crud.controller.spec.ts`, `src/common/apply-column-filters.spec.ts`, `src/common/bulk-actions.spec.ts`, `src/data-test/fake-em.spec.ts`, `src/data-test/fake-em.ts`, `src/data-test/fixture.spec.ts` |
| `src/modules/auth/auth.service.ts` | 6 | `src/modules/auth/auth.controller.ts`, `src/modules/auth/auth.module.ts`, `src/modules/auth/index.ts`, `src/modules/auth/public-auth.controller.ts`, `src/modules/system/system-maintenance.ts`, `src/modules/system/system.controller.ts` |
| `src/modules/event-registrations/event-registrations.service.ts` | 6 | `src/modules/event-registrations/event-registration-attendance.deps.ts`, `src/modules/event-registrations/event-registration-attendance.service.ts`, `src/modules/event-registrations/event-registration-attendance.types.ts`, `src/modules/event-registrations/event-registrations.controller.ts`, `src/modules/event-registrations/event-registrations.module.ts`, `src/modules/event-registrations/index.ts` |
| `src/bases/base-admin-crud.controller.ts` | 4 | `src/bases/index.ts`, `src/modules/comments/comments.controller.ts`, `src/modules/events/events.controller.ts`, `src/modules/posts/posts.controller.ts` |
| `src/bases/base-crud.controller.ts` | 4 | `src/bases/base-crud.controller.spec.ts`, `src/bases/crud-factory.spec.ts`, `src/bases/crud-factory.ts`, `src/bases/index.ts` |
| `src/bases/base-crud.service.ts` | 4 | `src/bases/base-crud.service.spec.ts`, `src/bases/crud-factory.spec.ts`, `src/bases/crud-factory.ts`, `src/bases/index.ts` |
| `src/common/parse-list-query.ts` | 4 | `src/common/build-admin-list-params.ts`, `src/common/index.ts`, `src/common/parse-list-query.spec.ts`, `src/modules/users/users.controller.ts` |
| `src/modules/contact-requests/contact-request.service.ts` | 4 | `src/modules/contact-requests/contact-request.controller.ts`, `src/modules/contact-requests/contact-request.module.ts`, `src/modules/contact-requests/index.ts`, `src/modules/contact-requests/public-contact-requests.controller.ts` |
| `src/modules/dashboard/dashboard.types.ts` | 4 | `src/modules/dashboard/dashboard.controller.ts`, `src/modules/dashboard/dashboard.module.ts`, `src/modules/dashboard/dashboard.service.ts`, `src/modules/dashboard/index.ts` |
| `src/modules/event-registrations/event-registration-attendance.types.ts` | 4 | `src/modules/event-registrations/event-registration-attendance.deps.ts`, `src/modules/event-registrations/event-registration-attendance.service.ts`, `src/modules/event-registrations/event-registrations.controller.ts`, `src/modules/event-registrations/index.ts` |
| `src/modules/notifications/notifications.service.ts` | 4 | `src/modules/notifications/index.ts`, `src/modules/notifications/notifications.controller.ts`, `src/modules/notifications/notifications.module.ts`, `src/modules/sessions/sessions.controller.ts` |
| `src/modules/posts/posts.service.ts` | 4 | `src/modules/posts/index.ts`, `src/modules/posts/posts.controller.ts`, `src/modules/posts/posts.module.ts`, `src/modules/posts/posts.types.ts` |
| `src/modules/settings/setting.service.ts` | 4 | `src/modules/settings/index.ts`, `src/modules/settings/public-settings.controller.ts`, `src/modules/settings/setting.controller.ts`, `src/modules/settings/settings.module.ts` |
| `src/common/resolve-relation-filters.ts` | 3 | `src/common/index.ts`, `src/modules/posts/posts.service.ts`, `src/modules/sessions/sessions.service.ts` |
| `src/data-test/fake-em.ts` | 3 | `src/common/apply-column-filters.spec.ts`, `src/common/bulk-actions.spec.ts`, `src/data-test/fake-em.spec.ts` |
| `src/modules/academic-years/academic-year.service.ts` | 3 | `src/modules/academic-years/academic-year.controller.ts`, `src/modules/academic-years/academic-year.module.ts`, `src/modules/academic-years/index.ts` |
| `src/modules/accounts/accounts.service.ts` | 3 | `src/modules/accounts/accounts.controller.ts`, `src/modules/accounts/accounts.module.ts`, `src/modules/accounts/index.ts` |
| `src/modules/admission-results/admission-result.service.ts` | 3 | `src/modules/admission-results/admission-result.controller.ts`, `src/modules/admission-results/admission-result.module.ts`, `src/modules/admission-results/index.ts` |
| `src/modules/cameras/camera.service.ts` | 3 | `src/modules/cameras/camera.controller.ts`, `src/modules/cameras/cameras.module.ts`, `src/modules/cameras/index.ts` |

## `src/common/` — tiện ích dùng chung

- `src/common/entity-id.ts` — 19 importer
- `src/common/pagination.ts` — 11 importer
- `src/common/date-utils.ts` — 10 importer
- `src/common/bulk-actions.ts` — 7 importer
- `src/common/apply-column-filters.ts` — 6 importer
- `src/common/parse-list-query.ts` — 4 importer
- `src/common/resolve-relation-filters.ts` — 3 importer
- `src/common/api-response.ts` — 2 importer
- `src/common/column-filter-builders.ts` — 2 importer
- `src/common/get-options.ts` — 2 importer
- `src/common/parse-column-filters.ts` — 2 importer
- `src/common/permissions.decorator.ts` — 2 importer
- `src/common/poster-normalize.ts` — 2 importer

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/api-server` → `pnpm graphify:ai-summary`.
