# API Nest (hub-parent) — @hub-parent/api — tóm tắt cho AI (Graphify)

> Tự động sinh từ `../snapshot/context.json` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).

- **projectRoot:** `D:/HUB/working/2026/hub-parrent-template/apps/hub-parent/api`
- **context.generatedAt:** 2026-06-15T03:40:51.288Z

## Mục lục artefact Graphify

- **Markdown (ưu tiên đọc):** file này — [`FOLDER_TREE.md`](FOLDER_TREE.md), [`GRAPH_STATS.md`](GRAPH_STATS.md), [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md), [`ENTRY_POINTS.md`](ENTRY_POINTS.md), [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md) — [`API_DOMAIN_IMPORTS.md`](API_DOMAIN_IMPORTS.md)
- **Snapshot (JSON nặng):** [`../snapshot/context.json`](../snapshot/context.json), [`../snapshot/graph.json`](../snapshot/graph.json) — chỉ mở khi cần trích source hoặc đồ thị đầy đủ.
- **Quy ước thư mục `.graphify` (tay):** [`../README.md`](../README.md).

## Liên kết dịch vụ & tài liệu hub

App **không** import chéo source `apps/*`; giao tiếp qua **HTTP** + `@workspace/api-client` (và `fetch` public ở storefront khi cần).

### Graphify — markdown các phần còn lại của monorepo

- **@api:** [SUMMARY](../../../../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/api/.graphify/markdown/GRAPH_STATS.md)
- **@backend:** [SUMMARY](../../../../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/backend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/backend/.graphify/markdown/GRAPH_STATS.md)
- **@frontend:** [SUMMARY](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@hub-event/api:** [SUMMARY](../../../../../apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-event/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-event/api/.graphify/markdown/GRAPH_STATS.md)
- **@hub-event-checkin-frontend:** [SUMMARY](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync/api:** [SUMMARY](../../../../../apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/api/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync-frontend:** [SUMMARY](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/GRAPH_STATS.md)
- **packages:** [SUMMARY](../../../../../packages/.graphify/markdown/SUMMARY_FOR_AI.md) · [WORKSPACE_DEPS](../../../../../packages/.graphify/markdown/WORKSPACE_DEPS.md)
- **monorepo (chỉ mục + chủ đề):** [SUMMARY gốc](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md)

### Tài liệu hub (không sinh bởi Graphify)

- [MICROSERVICE_SYSTEM_MAP](../../../../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) — boundaries, ORM, checklist.
- [AGENTS_GUIDE](../../../../../docs/admin-pattern/AGENTS_GUIDE.md) — thứ tự đọc cho agent.
- [AGENTS.md](../../../../../AGENTS.md) — `pnpm check`, `check:full`.

## Bản đồ từ snapshot/graph.json

- **Cây thư mục `src/`:** [`FOLDER_TREE.md`](FOLDER_TREE.md) (ASCII từ `../snapshot/graph.json`).
- **Thống kê graph:** [`GRAPH_STATS.md`](GRAPH_STATS.md) — quy mô node/link, top file in/out-degree (điểm nóng import).
- **Phụ thuộc chéo giữa domain API:** [`API_DOMAIN_IMPORTS.md`](API_DOMAIN_IMPORTS.md) — domain `src/<tên>` nào import domain nào (cạnh `imports` trong graph).
- **Bán kính ảnh hưởng:** [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) — file in-degree cao + mẫu importer (sửa shared code).
- **Điểm vào:** [`ENTRY_POINTS.md`](ENTRY_POINTS.md) — bootstrap, module, route Next, AUTO-GENERATED.
- **Pattern lặp:** [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md) — boilerplate (loading, re-export generate).

## Thống kê
- **totalFiles:** 538
- **clientComponents:** 0

## Góc hệ thống (@api) — đường dẫn gợi ý

### Cấu hình runtime (`src/config/`)
- `src/config/app-config.ts`
- `src/config/app.config.ts`
- `src/config/constants.ts`
- `src/config/permissions.ts`
- `src/config/protected-admin.ts`
- `src/config/role-templates/event-staff.template.ts`
- `src/config/system-role.ts`

### Guards
- `src/common/permissions.guard.ts`

### Seeds / bootstrap
- `src/seeds/checkin-demo.runner.ts`
- `src/seeds/lexical-plain-text.ts`
- `src/seeds/load-export-posts.ts`
- `src/seeds/orders-sample.runner.ts`
- `src/seeds/products-sample.runner.ts`
- `src/seeds/promo-codes-sample.runner.ts`
- `src/seeds/storesync-sample.data.ts`
- `src/seeds/superadmin-bootstrap.data.ts`
- `src/seeds/superadmin-bootstrap.runner.ts`

> **DB:** entity `src/entities/`, migration `src/migrations/` — xem thêm bảng *Module map* và `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` (MikroORM).

## Nest — module (92)
- `src/academic-years/academic-years.module.ts`
- `src/accounts/accounts.module.ts`
- `src/admission-results/admission-results.module.ts`
- `src/app.module.ts`
- `src/auth/auth.module.ts`
- `src/cameras/cameras.module.ts`
- `src/carts/carts.module.ts`
- `src/categories/categories.module.ts`
- `src/comments/comments.module.ts`
- `src/common/module-bases/academic-years/academic-year.module.ts`
- `src/common/module-bases/accounts/accounts.module.ts`
- `src/common/module-bases/admission-results/admission-result.module.ts`
- `src/common/module-bases/auth/auth.module.ts`
- `src/common/module-bases/cameras/cameras.module.ts`
- `src/common/module-bases/carts/carts.module.ts`
- `src/common/module-bases/categories/categories.module.ts`
- `src/common/module-bases/comments/comments.module.ts`
- `src/common/module-bases/contact-requests/contact-request.module.ts`
- `src/common/module-bases/courses/courses.module.ts`
- `src/common/module-bases/dashboard/dashboard.module.ts`
- `src/common/module-bases/departments/departments.module.ts`
- `src/common/module-bases/event-checkins/event-checkins.module.ts`
- `src/common/module-bases/event-checkouts/event-checkout.module.ts`
- `src/common/module-bases/event-registrations/event-registrations.module.ts`
- `src/common/module-bases/event-speakers/event-speakers.module.ts`
- `src/common/module-bases/events/events.module.ts`
- `src/common/module-bases/face-data/face-data.module.ts`
- `src/common/module-bases/groups/groups.module.ts`
- `src/common/module-bases/imported-users/imported-user.module.ts`
- `src/common/module-bases/locations/locations.module.ts`
- `src/common/module-bases/majors/majors.module.ts`
- `src/common/module-bases/notifications/notifications.module.ts`
- `src/common/module-bases/orders/orders.module.ts`
- `src/common/module-bases/page-contents/page-contents.module.ts`
- `src/common/module-bases/parent-students/parent-student.module.ts`
- `src/common/module-bases/posts/posts.module.ts`
- `src/common/module-bases/products/products.module.ts`
- `src/common/module-bases/promo-codes/promo-code.module.ts`
- `src/common/module-bases/roles/roles.module.ts`
- `src/common/module-bases/screens/screens.module.ts`
- `src/common/module-bases/seo-metas/seo-meta.module.ts`
- `src/common/module-bases/sessions/sessions.module.ts`
- `src/common/module-bases/settings/settings.module.ts`
- `src/common/module-bases/speakers/speakers.module.ts`
- `src/common/module-bases/students/students.module.ts`
- `src/common/module-bases/system/system.module.ts`
- `src/common/module-bases/tags/tags.module.ts`
- `src/common/module-bases/templates/templates.module.ts`
- `src/common/module-bases/training-levels/training-level.module.ts`
- `src/common/module-bases/training-systems/training-system.module.ts`
- `src/common/module-bases/users/users.module.ts`
- `src/contact-requests/contact-requests.module.ts`
- `src/courses/courses.module.ts`
- `src/dashboard/dashboard.module.ts`
- `src/departments/departments.module.ts`
- `src/event-checkins/event-checkins.module.ts`
- `src/event-checkouts/event-checkouts.module.ts`
- `src/event-registrations/event-registrations.module.ts`
- `src/event-speakers/event-speakers.module.ts`
- `src/events/events.module.ts`
- `src/face-data/face-data.module.ts`
- `src/groups/groups.module.ts`
- `src/hanet/hanet.module.ts`
- `src/imported-users/imported-users.module.ts`
- `src/locations/locations.module.ts`
- `src/majors/majors.module.ts`
- `src/messages/messages.module.ts`
- `src/mikro-orm/mikro-orm.module.ts`
- `src/notifications/notifications.module.ts`
- `src/orders/orders.module.ts`
- `src/page-contents/page-contents.module.ts`
- `src/parent-students/parent-students.module.ts`
- `src/posts/posts.module.ts`
- `src/products/products.module.ts`
- `src/promo-codes/promo-codes.module.ts`
- `src/proxy-image/proxy-image.module.ts`
- `src/public/public.module.ts`
- `src/roles/roles.module.ts`
- `src/screens/screens.module.ts`
- `src/seo-metas/seo-metas.module.ts`
- `src/sessions/sessions.module.ts`
- `src/settings/settings.module.ts`
- `src/socket/socket.module.ts`
- `src/speakers/speakers.module.ts`
- `src/students/students.module.ts`
- `src/system/system.module.ts`
- `src/tags/tags.module.ts`
- `src/templates/templates.module.ts`
- `src/training-levels/training-levels.module.ts`
- `src/training-systems/training-systems.module.ts`
- `src/uploads/uploads.module.ts`
- `src/users/users.module.ts`

## Nest — controller (101)
- `src/academic-years/academic-years.controller.ts`
- `src/accounts/accounts.controller.ts`
- `src/admission-results/admission-results.controller.ts`
- `src/auth/auth-admin.controller.ts`
- `src/auth/auth.controller.ts`
- `src/cameras/cameras.controller.ts`
- `src/carts/carts.controller.ts`
- `src/carts/public-carts.controller.ts`
- `src/categories/categories.controller.ts`
- `src/comments/comments.controller.ts`
- `src/common/crud/base-admin-crud.controller.ts`
- `src/common/crud/base-admin-http.controller.ts`
- `src/common/crud/base-crud.controller.ts`
- `src/common/module-bases/academic-years/academic-year.controller.ts`
- `src/common/module-bases/accounts/accounts.controller.ts`
- `src/common/module-bases/admission-results/admission-result.controller.ts`
- `src/common/module-bases/auth/auth.controller.ts`
- `src/common/module-bases/auth/public-auth.controller.ts`
- `src/common/module-bases/cameras/camera.controller.ts`
- `src/common/module-bases/carts/carts.controller.ts`
- `src/common/module-bases/categories/categories.controller.ts`
- `src/common/module-bases/comments/comments.controller.ts`
- `src/common/module-bases/contact-requests/contact-request.controller.ts`
- `src/common/module-bases/contact-requests/public-contact-requests.controller.ts`
- `src/common/module-bases/courses/course.controller.ts`
- `src/common/module-bases/dashboard/dashboard.controller.ts`
- `src/common/module-bases/departments/department.controller.ts`
- `src/common/module-bases/event-checkins/event-checkins.controller.ts`
- `src/common/module-bases/event-checkouts/event-checkout.controller.ts`
- `src/common/module-bases/event-registrations/event-registrations.controller.ts`
- `src/common/module-bases/event-speakers/event-speakers.controller.ts`
- `src/common/module-bases/events/events.controller.ts`
- `src/common/module-bases/face-data/face-data.controller.ts`
- `src/common/module-bases/groups/group.controller.ts`
- `src/common/module-bases/imported-users/imported-user.controller.ts`
- `src/common/module-bases/locations/location.controller.ts`
- `src/common/module-bases/majors/major.controller.ts`
- `src/common/module-bases/notifications/notifications.controller.ts`
- `src/common/module-bases/orders/order.controller.ts`
- `src/common/module-bases/page-contents/page-contents.controller.ts`
- `src/common/module-bases/parent-students/parent-student.controller.ts`
- `src/common/module-bases/posts/posts.controller.ts`
- `src/common/module-bases/products/product.controller.ts`
- `src/common/module-bases/promo-codes/promo-code.controller.ts`
- `src/common/module-bases/roles/role.controller.ts`
- `src/common/module-bases/screens/screen.controller.ts`
- `src/common/module-bases/seo-metas/seo-meta.controller.ts`
- `src/common/module-bases/sessions/sessions.controller.ts`
- `src/common/module-bases/settings/public-settings.controller.ts`
- `src/common/module-bases/settings/setting.controller.ts`
- `src/common/module-bases/speakers/speaker.controller.ts`
- `src/common/module-bases/students/student.controller.ts`
- `src/common/module-bases/system/system.controller.ts`
- `src/common/module-bases/tags/tag.controller.ts`
- `src/common/module-bases/templates/template.controller.ts`
- `src/common/module-bases/training-levels/training-level.controller.ts`
- `src/common/module-bases/training-systems/training-system.controller.ts`
- `src/common/module-bases/users/users.controller.ts`
- `src/contact-requests/contact-requests.controller.ts`
- `src/courses/courses.controller.ts`
- `src/dashboard/dashboard.controller.ts`
- `src/departments/departments.controller.ts`
- `src/event-checkins/event-checkins.controller.ts`
- `src/event-checkouts/event-checkouts.controller.ts`
- `src/event-registrations/event-registrations.controller.ts`
- `src/event-speakers/event-speakers.controller.ts`
- `src/events/events.controller.ts`
- `src/face-data/face-data.controller.ts`
- `src/groups/groups.controller.ts`
- `src/hanet/hanet-webhook.controller.ts`
- `src/imported-users/imported-users.controller.ts`
- `src/locations/locations.controller.ts`
- `src/majors/majors.controller.ts`
- `src/messages/conversations.controller.ts`
- `src/messages/messages.controller.ts`
- `src/notifications/notifications.controller.ts`
- `src/orders/orders.controller.ts`
- `src/orders/public-orders.controller.ts`
- `src/page-contents/page-contents.controller.ts`
- `src/parent-students/parent-students.controller.ts`
- `src/posts/posts.controller.ts`
- `src/products/products.controller.ts`
- `src/products/public-products.controller.ts`
- `src/promo-codes/promo-codes.controller.ts`
- `src/promo-codes/public-promo-codes.controller.ts`
- `src/proxy-image/proxy-image.controller.ts`
- `src/roles/roles.controller.ts`
- `src/screens/screens.controller.ts`
- `src/seo-metas/seo-metas.controller.ts`
- `src/sessions/sessions.controller.ts`
- `src/settings/settings.controller.ts`
- `src/speakers/speakers.controller.ts`
- `src/students/students.controller.ts`
- `src/system/system.controller.ts`
- `src/tags/tags.controller.ts`
- `src/templates/templates.controller.ts`
- `src/training-levels/training-levels.controller.ts`
- `src/training-systems/training-systems.controller.ts`
- `src/uploads/public-uploads.controller.ts`
- `src/uploads/uploads.controller.ts`
- `src/users/users.controller.ts`

## Entities (47)
- `src/entities/academic-year.entity.ts`
- `src/entities/account.entity.ts`
- `src/entities/admission-result.entity.ts`
- `src/entities/base.entity.ts`
- `src/entities/camera.entity.ts`
- `src/entities/category.entity.ts`
- `src/entities/comment.entity.ts`
- `src/entities/contact-request.entity.ts`
- `src/entities/course.entity.ts`
- `src/entities/customer-cart.entity.ts`
- `src/entities/department.entity.ts`
- `src/entities/event-checkin.entity.ts`
- `src/entities/event-registration.entity.ts`
- `src/entities/event-speaker.entity.ts`
- `src/entities/event.entity.ts`
- `src/entities/face-data.entity.ts`
- `src/entities/group-member.entity.ts`
- `src/entities/group.entity.ts`
- `src/entities/imported-user.entity.ts`
- `src/entities/location.entity.ts`
- `src/entities/major.entity.ts`
- `src/entities/message-read.entity.ts`
- `src/entities/message.entity.ts`
- `src/entities/notification.entity.ts`
- `src/entities/order.entity.ts`
- `src/entities/page-content.entity.ts`
- `src/entities/parent-student.entity.ts`
- `src/entities/post-category.entity.ts`
- `src/entities/post-tag.entity.ts`
- `src/entities/post.entity.ts`
- `src/entities/product.entity.ts`
- `src/entities/promo-code.entity.ts`
- `src/entities/role.entity.ts`
- `src/entities/screen.entity.ts`
- `src/entities/seo-meta.entity.ts`
- `src/entities/session.entity.ts`
- `src/entities/setting.entity.ts`
- `src/entities/speaker.entity.ts`
- `src/entities/storage-file.entity.ts`
- `src/entities/student.entity.ts`
- `src/entities/tag.entity.ts`
- `src/entities/template.entity.ts`
- `src/entities/training-level.entity.ts`
- `src/entities/training-system.entity.ts`
- `src/entities/user-role.entity.ts`
- `src/entities/user.entity.ts`
- `src/entities/verification-token.entity.ts`

## Migrations (6)
- `src/migrations/Migration20260605120000_standardize_legacy_table_names.ts`
- `src/migrations/Migration20260608120000_add_storage_files.ts`
- `src/migrations/Migration20260609120000_add_products_orders.ts`
- `src/migrations/Migration20260610120000_add_order_gifts.ts`
- `src/migrations/Migration20260610140000_add_customer_carts.ts`
- `src/migrations/Migration20260611120000_add_promo_codes.ts`

## Module map (không có nội dung file)

| File | Loại | Client | Exports | Imports |
|------|------|--------|---------|---------|
| `package.json` | config | — | — | — |
| `src/academic-years/academic-years.controller.ts` | ts | no | AcademicYearsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/academic-years/academic-year.controller.ts, src/academic-years/academic-years.service.t |
| `src/academic-years/academic-years.module.ts` | ts | no | AcademicYearsModule | src/academic-years/academic-years.controller.ts, src/academic-years/academic-years.service.ts |
| `src/academic-years/academic-years.service.spec.ts` | ts | no |  | src/academic-years/academic-years.service.ts |
| `src/academic-years/academic-years.service.ts` | ts | no | AcademicYearsService | src/common/admin/filter-configs.ts, src/entities/academic-year.entity.ts, src/common/module-bases/academic-years/academic-year.service.ts |
| `src/accounts/accounts.controller.ts` | ts | no | AccountsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/uploads/uploads.service.ts, src/common/module-bases/accounts/accounts.controller.ts, src/accounts/accounts. |
| `src/accounts/accounts.module.ts` | ts | no | AccountsModule | src/uploads/uploads.module.ts, src/accounts/accounts.controller.ts, src/accounts/accounts.service.ts |
| `src/accounts/accounts.service.spec.ts` | ts | no |  | src/accounts/accounts.service.ts |
| `src/accounts/accounts.service.ts` | ts | no | AccountsService | src/entities/user.entity.ts, src/entities/user-role.entity.ts, src/common/module-bases/accounts/accounts.service.ts |
| `src/admission-results/admission-results.controller.ts` | ts | no | AdmissionResultsController | src/common, src/admission-results/admission-results.service.ts, src/notifications/notifications.service.ts, src/entities/notification.entity.ts, src/config/constants.ts, src/config/permissions.ts |
| `src/admission-results/admission-results.module.ts` | ts | no | AdmissionResultsModule | src/notifications/notifications.module.ts, src/admission-results/admission-results.service.ts, src/admission-results/admission-results.controller.ts |
| `src/admission-results/admission-results.service.spec.ts` | ts | no |  | src/admission-results/admission-results.service.ts, src/entities/admission-result.entity.ts |
| `src/admission-results/admission-results.service.ts` | ts | no | AdmissionResultsService | src/entities/admission-result.entity.ts, src/common/module-bases/admission-results/admission-result.service.ts |
| `src/app.module.ts` | ts | no | AppModule | src/mikro-orm/mikro-orm.module.ts, src/common, src/auth/auth.service.ts, src/public/public.module.ts, src/socket/socket.module.ts, src/auth/auth.module.ts, src/notifications/notifications.module.ts, s |
| `src/auth/auth-admin.controller.ts` | ts | no | LoginDto, DevLoginDto, GoogleLoginDto, LogoutDto, AuthAdminController | src/auth/auth.service.ts, src/common/api-response.ts, src/config/constants.ts, src/common/public.decorator.ts |
| `src/auth/auth.controller.ts` | ts | no | AuthController | src/common, src/config/constants.ts, src/auth/auth.service.ts |
| `src/auth/auth.module.ts` | ts | no | AuthModule | src/auth/auth.controller.ts, src/auth/auth.service.ts |
| `src/auth/auth.service.spec.ts` | ts | no |  | src/auth/auth.service.ts, src/entities/user.entity.ts, src/entities/role.entity.ts, src/entities/user-role.entity.ts |
| `src/auth/auth.service.ts` | ts | no | AuthUserPayload, AuthService | src/entities/user.entity.ts, src/entities/role.entity.ts, src/entities/user-role.entity.ts, src/entities/setting.entity.ts, src/common/module-bases/auth/auth.service.ts |
| `src/cameras/cameras.controller.ts` | ts | no | CamerasController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/cameras/camera.controller.ts, src/cameras/cameras.service.ts |
| `src/cameras/cameras.module.ts` | ts | no | CamerasModule | src/cameras/cameras.controller.ts, src/cameras/cameras.service.ts |
| `src/cameras/cameras.service.spec.ts` | ts | no |  | src/cameras/cameras.service.ts |
| `src/cameras/cameras.service.ts` | ts | no | CamerasService | src/common/admin/filter-configs.ts, src/entities/camera.entity.ts, src/common/module-bases/cameras/camera.service.ts |
| `src/carts/carts.controller.ts` | ts | no | PublicCartsController | src/config/constants.ts, src/common/module-bases/carts/carts.controller.ts, src/carts/carts.service.ts |
| `src/carts/carts.module.ts` | ts | no | CartsModule | src/carts/carts.service.ts, src/carts/public-carts.controller.ts |
| `src/carts/carts.service.spec.ts` | ts | no |  | src/carts/carts.service.ts |
| `src/carts/carts.service.ts` | ts | no | CartsService | src/common/module-bases/carts/carts.service.ts |
| `src/carts/public-carts.controller.ts` | ts | no | PublicCartsController | src/carts/carts.service.ts, src/common, src/config/constants.ts |
| `src/categories/categories.controller.ts` | ts | no | CategoriesController | src/common, src/categories/categories.service.ts, src/notifications/notifications.service.ts, src/entities/notification.entity.ts, src/config/constants.ts, src/config/permissions.ts |
| `src/categories/categories.module.ts` | ts | no | CategoriesModule | src/notifications/notifications.module.ts, src/categories/categories.service.ts, src/categories/categories.controller.ts |
| `src/categories/categories.service.spec.ts` | ts | no |  | src/categories/categories.service.ts, src/entities/category.entity.ts |
| `src/categories/categories.service.ts` | ts | no | CategoriesService | src/entities/category.entity.ts, src/entities/post-category.entity.ts, src/common/module-bases/categories/categories.service.ts |
| `src/comments/comments.controller.ts` | ts | no | CommentsController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/comments/comments.controller.ts, src/comments/comments.service.ts |
| `src/comments/comments.module.ts` | ts | no | CommentsModule | src/notifications/notifications.module.ts, src/comments/comments.service.ts, src/comments/comments.controller.ts |
| `src/comments/comments.service.spec.ts` | ts | no |  | src/comments/comments.service.ts |
| `src/comments/comments.service.ts` | ts | no | CommentsService | src/entities/comment.entity.ts, src/common/module-bases/comments/comments.service.ts |
| `src/common/admin-realtime-broadcast.service.ts` | ts | no | AdminRealtimeBroadcastService | src/socket/socket.gateway.ts, src/socket/socket.types.ts |
| `src/common/admin-realtime.interceptor.ts` | ts | no | AdminRealtimeInterceptor | src/socket/socket.gateway.ts, src/common/admin/realtime/util.ts |
| `src/common/admin-realtime.util.ts` | ts | no | AdminCacheInvalidateAction, AdminCacheInvalidatePayload, parseAdminRealtimeInvalidate |  |
| `src/common/admin/filter-configs.ts` | ts | no | CAMERA_COLUMN_FILTERS, DEPARTMENT_COLUMN_FILTERS, LOCATION_COLUMN_FILTERS, SCREEN_COLUMN_FILTERS, TEMPLATE_COLUMN_FILTERS, SPEAKER_COLUMN_FILTERS, SEO_META_COLUMN_FILTERS, ACADEMIC_YEAR_COLUMN_FILTERS | src/common/crud/crud-apply-column-filters.ts |
| `src/common/admin/index.ts` | ts | no |  | src/common/admin/filter-configs.ts, src/common/admin/realtime |
| `src/common/admin/realtime/broadcast.service.ts` | ts | no | AdminRealtimeBroadcastService | src/socket/socket.gateway.ts, src/socket/socket.types.ts |
| `src/common/admin/realtime/index.ts` | ts | no |  | src/common/admin/realtime/broadcast.service.ts, src/common/admin/realtime/interceptor.ts, src/common/admin/realtime/util.ts |
| `src/common/admin/realtime/interceptor.ts` | ts | no | AdminRealtimeInterceptor | src/socket/socket.gateway.ts, src/common/admin/realtime/util.ts |
| `src/common/admin/realtime/util.ts` | ts | no | AdminCacheInvalidateAction, AdminCacheInvalidatePayload, parseAdminRealtimeInvalidate |  |
| `src/common/api-access.middleware.ts` | ts | no | ApiAccessMiddleware | src/config/constants.ts, src/common/request-id.middleware.ts |
| `src/common/api-response.ts` | ts | no | ApiResponsePayload, createSuccessResponse, createErrorResponse, ok, fail |  |
| `src/common/app/dev-login-options.ts` | ts | no | DevLoginRoleDto, DevLoginOptionDto, DevLoginOptionsQuery, mapUserToDevLoginOption, filterDevLoginOptions | src/entities/role.entity.ts, src/entities/user.entity.ts, src/entities/user-role.entity.ts |
| `src/common/app/index.ts` | ts | no |  | src/common/app/dev-login-options.ts, src/common/app/legacy-audit-timestamps.ts, src/common/app/parse-setting-value.ts |
| `src/common/app/legacy-audit-timestamps.ts` | ts | no | LegacyAuditEntity, touchLegacyAuditTimestamps, backfillLegacyAuditTimestampsIfMissing |  |
| `src/common/app/parse-setting-value.ts` | ts | no | parseSettingValue |  |
| `src/common/bulk-actions.ts` | ts | no | BulkAction, BulkResult, BulkOptions, BULK_ACTIONS, isBulkAction | src/common/entity-id.ts |
| `src/common/cart-types.ts` | ts | no | CustomerCartLine, CustomerCartPayload | src/common/product-types.ts |
| `src/common/column-filter-builders.ts` | ts | no | columnFilterText, columnFilterExact, columnFilterNumber, columnFilterNumberRange, columnFilterDateRange, columnFilterBoolean, columnFilterEntityId |  |
| `src/common/commerce/cart-types.ts` | ts | no | CustomerCartLine, CustomerCartPayload | src/common/commerce/product-types.ts |
| `src/common/commerce/gift-rules.spec.ts` | ts | no |  | src/common/commerce/gift-rules.ts, src/entities/product.entity.ts |
| `src/common/commerce/gift-rules.ts` | ts | no | CheckoutLineContext, GiftCatalogProduct, evaluateOrderGifts | src/common/commerce/product-types.ts, src/common/commerce/product-units.ts |
| `src/common/commerce/index.ts` | ts | no |  | src/common/commerce/cart-types.ts, src/common/commerce/gift-rules.ts, src/common/commerce/product-types.ts, src/common/commerce/product-units.ts, src/common/commerce/promo-checkout.ts, src/common/comm |
| `src/common/commerce/product-types.ts` | ts | no | QuantityCountMode, QuantityScope, QuantityCondition, ProductPriceTier, ProductGiftRule, ProductUnitType, OrderItemSnapshot, OrderGiftSnapshot |  |
| `src/common/commerce/product-units.spec.ts` | ts | no |  | src/common/commerce/product-units.ts, src/entities/product.entity.ts |
| `src/common/commerce/product-units.ts` | ts | no | ProductStockLike, resolveUnit, resolveUnitImage, resolveLineSku, effectiveQuantityForCondition, matchesQuantityCondition, getUnitStock, hasExplicitSellableUnitStock, syncProductStockFromUnits, applyPr | src/common/commerce/product-types.ts |
| `src/common/commerce/promo-checkout.spec.ts` | ts | no |  | src/common/commerce/promo-checkout.ts, src/entities/promo-code.entity.ts |
| `src/common/commerce/promo-checkout.ts` | ts | no | PromoDiscountResult, RedeemablePromo, computePromoDiscount, isPromoRedeemable | src/entities/promo-code.entity.ts |
| `src/common/commerce/unit-pricing.spec.ts` | ts | no |  | src/common/commerce/unit-pricing.ts |
| `src/common/commerce/unit-pricing.ts` | ts | no | LinePricingResult, effectiveLineUnitPrice | src/common/commerce/product-types.ts |
| `src/common/crud/base-admin-crud.controller.ts` | ts | no | AdminCrudControllerConfig, IAdminCrudControllerService | src/common/bulk-actions.ts, src/common/crud/build-admin-list-params.ts, src/common/crud/base-admin-http.controller.ts |
| `src/common/crud/base-admin-http.controller.ts` | ts | no |  | src/config/constants.ts, src/common/api-response.ts |
| `src/common/crud/base-crud.controller.spec.ts` | ts | no |  | src/common/crud/base-crud.controller.ts, src/common/crud/crud.types.ts, src/data-test/fixture.ts |
| `src/common/crud/base-crud.controller.ts` | ts | no | ICrudControllerService, DefaultRestorePayload, BasePostsController, BaseCrudController | src/common/crud/crud.types.ts, src/common/api-response.ts, src/common/parse-list-query.ts, src/common/bulk-actions.ts, src/common/permissions.decorator.ts, src/common/entity-id.ts |
| `src/common/crud/base-crud.service.spec.ts` | ts | no |  | src/common/crud/base-crud.service.ts, src/common/crud/crud.types.ts |
| `src/common/crud/base-crud.service.ts` | ts | no | CrudStatus | src/common/crud/crud.types.ts, src/common/pagination.ts, src/common/entity-id.ts, src/common/crud/crud-date.ts, src/common/bulk-actions.ts, src/common/crud/crud-apply-column-filters.ts |
| `src/common/crud/base-standard-admin-crud.service.ts` | ts | no | StandardAdminListParams, StandardAdminListResult | src/common/entity-id.ts, src/common/pagination.ts, src/common/bulk-actions.ts, src/common/crud/crud-apply-column-filters.ts |
| `src/common/crud/build-admin-list-params.ts` | ts | no | AdminListQueryInput, buildAdminListCrudParams, bulkAffectedCount | src/common/crud/crud.types.ts, src/common/parse-column-filters.ts, src/common/parse-list-query.ts |
| `src/common/crud/common.types.spec.ts` | ts | no |  | src/common/crud/common.types.ts |
| `src/common/crud/common.types.ts` | ts | no |  | src/common/module-types/common.types.ts |
| `src/common/crud/crud-apply-column-filters.spec.ts` | ts | no |  | src/data-test/fixture.ts, src/data-test/fake-em.ts, src/common/crud/crud-apply-column-filters.ts |
| `src/common/crud/crud-apply-column-filters.ts` | ts | no | AdminColumnFilterType, AdminColumnFilterField, AdminColumnFiltersConfig, applyColumnFilters, StandardAdminListParams, buildStandardAdminListWhere, buildStandardAdminWhere |  |
| `src/common/crud/crud-date.ts` | ts | no | toIso, toIsoNow | src/common/date-utils.ts |
| `src/common/crud/crud.types.ts` | ts | no |  | src/common/module-types/crud.types.ts, src/common/module-types/user.types.ts |
| `src/common/crud/index.ts` | ts | no | BaseStandardAdminCrudService, BaseAdminHttpController, BaseAdminCrudController, buildAdminListCrudParams, BaseCrudService, BaseCrudController | src/common/crud/base-standard-admin-crud.service.ts, src/common/crud/base-admin-http.controller.ts, src/common/crud/base-admin-crud.controller.ts, src/common/crud/build-admin-list-params.ts, src/commo |
| `src/common/data-paths.ts` | ts | no | SEED_EXPORT_BASENAMES, IMPORT_REFERENCE_BASENAMES, findMonorepoRoot, dataDir, seedExportPath, ResolveSeedExportOptions, resolveImportReferencePath, resolveSeedExportPath |  |
| `src/common/database-http-exception.filter.ts` | ts | no | DatabaseHttpExceptionFilter | src/common/api-response.ts |
| `src/common/date-utils.ts` | ts | no | toIso, toIsoNow, parseDateInput, normalizeDateInput, safeIsoString, safeIsoStringNow, parseDate, isValidDate, formatDate, formatDateTime |  |
| `src/common/entity-id.ts` | ts | no | EntityId, parseEntityId, isEntityId, toEntityId, toEntityIdList, toEntityIdListSafe, relationEntityId, coerceImportPrimaryKey |  |
| `src/common/event-time-status.ts` | ts | no | EventTimeStatus, resolveEventTimeStatus |  |
| `src/common/fs-unlink-retry.ts` | ts | no | UnlinkWithRetryOptions |  |
| `src/common/get-options.ts` | ts | no | GetOptionsColumnConfig, GetOptionsConfig |  |
| `src/common/gift-rules.ts` | ts | no | CheckoutLineContext, evaluateOrderGifts | src/common/product-types.ts, src/entities/product.entity.ts, src/common/product-units.ts |
| `src/common/image-processor.ts` | ts | no | ImageProcessOptions, isImageMime, isImageExt |  |
| `src/common/index.ts` | ts | no | buildAdminListCrudParams | src/common/api-response.ts, src/common/bulk-actions.ts, src/common/column-filter-builders.ts, src/common/date-utils.ts, src/common/entity-id.ts, src/common/event-time-status.ts, src/common/fs-unlink-r |
| `src/common/infra/api-access.middleware.ts` | ts | no | ApiAccessMiddleware | src/config/constants.ts, src/common/infra/request-id.middleware.ts |
| `src/common/infra/database-http-exception.filter.ts` | ts | no | DatabaseHttpExceptionFilter | src/common |
| `src/common/infra/index.ts` | ts | no |  | src/common/infra/api-access.middleware.ts, src/common/infra/database-http-exception.filter.ts, src/common/infra/logging.interceptor.ts, src/common/infra/request-id.middleware.ts |
| `src/common/infra/logging.interceptor.ts` | ts | no | LoggingInterceptor | src/config/app-config.ts, src/config/constants.ts, src/common/infra/request-id.middleware.ts |
| `src/common/infra/request-id.middleware.ts` | ts | no | REQUEST_ID_HEADER, RequestIdMiddleware |  |
| `src/common/logging.interceptor.ts` | ts | no | LoggingInterceptor | src/config/app-config.ts, src/config/constants.ts, src/common/request-id.middleware.ts |
| `src/common/module-bases/academic-years/academic-year.controller.ts` | ts | no | IAcademicYearsControllerService, BaseAcademicYearsController | src/common/crud, src/common/module-bases/academic-years/academic-year.service.ts |
| `src/common/module-bases/academic-years/academic-year.module.ts` | ts | no | BaseAcademicYearsModule, BaseAcademicYearsController, BaseAcademicYearsService | src/common/module-bases/academic-years/academic-year.controller.ts, src/common/module-bases/academic-years/academic-year.service.ts |
| `src/common/module-bases/academic-years/academic-year.service.ts` | ts | no | AcademicYearsRowDto, AcademicYearsCreateData, AcademicYearsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/accounts/accounts.controller.ts` | ts | no | IAccountsControllerService, IAccountsAdminControllerService, BaseAccountsController | src/common/crud/base-admin-http.controller.ts, src/common/module-bases/accounts/accounts.service.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/config/app-config.ts |
| `src/common/module-bases/accounts/accounts.module.ts` | ts | no | BaseAccountsModule, BaseAccountsController, BaseAccountsService | src/common/module-bases/accounts/accounts.controller.ts, src/common/module-bases/accounts/accounts.service.ts |
| `src/common/module-bases/accounts/accounts.service.ts` | ts | no | AccountProfileDto, UpdateAccountDto, UpdateAccountResult | src/common/entity-id.ts, src/common/date-utils.ts |
| `src/common/module-bases/admission-results/admission-result.controller.ts` | ts | no | BaseAdmissionResultsController |  |
| `src/common/module-bases/admission-results/admission-result.module.ts` | ts | no | BaseAdmissionResultsModule, BaseAdmissionResultsController, BaseAdmissionResultsService | src/common/module-bases/admission-results/admission-result.controller.ts, src/common/module-bases/admission-results/admission-result.service.ts |
| `src/common/module-bases/admission-results/admission-result.service.ts` | ts | no | AdmissionResultsRowDto, ListAdmissionResultsParams, ListAdmissionResultsResult, AdmissionResultsCreateData, AdmissionResultsUpdateData | src/common/index.ts |
| `src/common/module-bases/auth/auth.controller.ts` | ts | no | IAuthControllerService, IAuthAdminControllerService, BaseAuthController, BaseAuthAdminController | src/common/index.ts, src/config/constants.ts, src/common/module-bases/auth/auth.service.ts |
| `src/common/module-bases/auth/auth.module.ts` | ts | no | BaseAuthModule, BaseAuthController, BasePublicAuthController, BaseAuthService | src/common/module-bases/auth/auth.controller.ts, src/common/module-bases/auth/public-auth.controller.ts, src/common/module-bases/auth/auth.service.ts |
| `src/common/module-bases/auth/auth.service.ts` | ts | no | AuthRolePayload, GoogleProfileDto, AuthLoginPayload, DevLoginOptionDto | src/common/index.ts, src/common/module-types, src/config/constants.ts |
| `src/common/module-bases/auth/public-auth.controller.ts` | ts | no | IPublicAuthControllerService, BasePublicAuthController | src/common/index.ts, src/config/constants.ts, src/common/module-bases/auth/auth.service.ts |
| `src/common/module-bases/cameras/camera.controller.ts` | ts | no | ICamerasControllerService, BaseCamerasController | src/common/crud, src/common/module-bases/cameras/camera.service.ts |
| `src/common/module-bases/cameras/camera.service.ts` | ts | no | CamerasRowDto, CamerasCreateData, CamerasUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/cameras/cameras.module.ts` | ts | no | BaseCamerasModule, BaseCamerasController, BaseCamerasService | src/common/module-bases/cameras/camera.controller.ts, src/common/module-bases/cameras/camera.service.ts |
| `src/common/module-bases/carts/carts.controller.ts` | ts | no | BaseCartsController | src/common/module-bases/carts/carts.service.ts, src/common/index.ts |
| `src/common/module-bases/carts/carts.module.ts` | ts | no | BaseCartsModule, BaseCartsController, BaseCartsService | src/common/module-bases/carts/carts.controller.ts, src/common/module-bases/carts/carts.service.ts |
| `src/common/module-bases/carts/carts.service.ts` | ts | no | CartLineItem, CartPayload, CartDto |  |
| `src/common/module-bases/categories/categories.controller.ts` | ts | no | BaseCategoriesController |  |
| `src/common/module-bases/categories/categories.module.ts` | ts | no | BaseCategoriesModule, BaseCategoriesController, BaseCategoriesService | src/common/module-bases/categories/categories.controller.ts, src/common/module-bases/categories/categories.service.ts |
| `src/common/module-bases/categories/categories.service.ts` | ts | no | CategoryRowDto, ChildCategoryDto, RelatedPostDto, ListCategoriesParams, ListCategoriesResult, CategoryCreateData, CategoryUpdateData, CategoryUsageRow | src/common/index.ts |
| `src/common/module-bases/comments/comments.controller.ts` | ts | no | ICommentsControllerService, ICommentsAdminControllerService, BaseCommentsController | src/common/crud/base-admin-crud.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/comments/comments.service.ts |
| `src/common/module-bases/comments/comments.module.ts` | ts | no | BaseCommentsModule, BaseCommentsController, BaseCommentsService | src/common/module-bases/comments/comments.controller.ts, src/common/module-bases/comments/comments.service.ts |
| `src/common/module-bases/comments/comments.service.ts` | ts | no | CommentRowDto, ListCommentsParams, ListCommentsResult | src/common/pagination.ts, src/common/date-utils.ts, src/common/entity-id.ts |
| `src/common/module-bases/contact-requests/contact-request.controller.ts` | ts | no | IContactRequestsControllerService, BaseContactRequestsController | src/common/crud, src/common/index.ts, src/common/module-bases/contact-requests/contact-request.service.ts |
| `src/common/module-bases/contact-requests/contact-request.module.ts` | ts | no | BaseContactRequestsModule, BaseContactRequestsController, BasePublicContactRequestsController, BaseContactRequestsService | src/common/module-bases/contact-requests/contact-request.controller.ts, src/common/module-bases/contact-requests/public-contact-requests.controller.ts, src/common/module-bases/contact-requests/contact |
| `src/common/module-bases/contact-requests/contact-request.service.ts` | ts | no | ContactRequestsRowDto, ContactRequestsCreateData, ContactRequestsUpdateData, ContactRequestBulkAction | src/common/crud, src/common/module-types, src/common/index.ts |
| `src/common/module-bases/contact-requests/public-contact-requests.controller.ts` | ts | no | CreatePublicContactRequestDto, IPublicContactRequestsControllerService, BasePublicContactRequestsController | src/common/index.ts, src/config/constants.ts, src/common/module-bases/contact-requests/contact-request.service.ts |
| `src/common/module-bases/courses/course.controller.ts` | ts | no | ICoursesControllerService, BaseCoursesController | src/common/crud, src/common/module-bases/courses/course.service.ts |
| `src/common/module-bases/courses/course.service.ts` | ts | no | CoursesRowDto, CoursesCreateData, CoursesUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/courses/courses.module.ts` | ts | no | BaseCoursesModule, BaseCoursesController, BaseCoursesService | src/common/module-bases/courses/course.controller.ts, src/common/module-bases/courses/course.service.ts |
| `src/common/module-bases/dashboard/dashboard.controller.ts` | ts | no | BaseDashboardController | src/common/module-bases/dashboard/dashboard.service.ts, src/common/index.ts, src/common/module-bases/dashboard/dashboard.types.ts |
| `src/common/module-bases/dashboard/dashboard.module.ts` | ts | no | BaseDashboardModule, BaseDashboardController, BaseDashboardService | src/common/module-bases/dashboard/dashboard.controller.ts, src/common/module-bases/dashboard/dashboard.service.ts, src/common/module-bases/dashboard/dashboard.types.ts |
| `src/common/module-bases/dashboard/dashboard.service.ts` | ts | no |  | src/common/entity-id.ts, src/common/module-bases/dashboard/dashboard.types.ts |
| `src/common/module-bases/dashboard/dashboard.types.ts` | ts | no | DashboardOverviewDto, DashboardMonthlyItemDto, DashboardCategoryItemDto, DashboardTopPostDto, DashboardStatsDto |  |
| `src/common/module-bases/departments/department.controller.ts` | ts | no | IDepartmentsControllerService, BaseDepartmentsController | src/common/crud, src/common/module-bases/departments/department.service.ts |
| `src/common/module-bases/departments/department.service.ts` | ts | no | DepartmentsRowDto, DepartmentsCreateData, DepartmentsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/departments/departments.module.ts` | ts | no | BaseDepartmentsModule, BaseDepartmentsController, BaseDepartmentsService | src/common/module-bases/departments/department.controller.ts, src/common/module-bases/departments/department.service.ts |
| `src/common/module-bases/event-checkins/event-checkins.controller.ts` | ts | no | IEventCheckinsControllerService, IEventCheckinsAdminControllerService, BaseEventCheckinsController | src/common/crud/base-admin-http.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/event-checkins/event-checkins.service.ts |
| `src/common/module-bases/event-checkins/event-checkins.module.ts` | ts | no | BaseEventCheckinsModule, BaseEventCheckinsController, BaseEventCheckinsService | src/common/module-bases/event-checkins/event-checkins.controller.ts, src/common/module-bases/event-checkins/event-checkins.service.ts |
| `src/common/module-bases/event-checkins/event-checkins.service.ts` | ts | no | EventCheckinRowDto, ListEventCheckinsParams, ListEventCheckinsResult | src/common/bulk-actions.ts, src/common/pagination.ts, src/common/date-utils.ts, src/common/entity-id.ts |
| `src/common/module-bases/event-checkouts/event-checkout.controller.ts` | ts | no | BaseEventCheckoutsController | src/common/module-bases/event-checkouts/event-checkout.service.ts, src/common/index.ts |
| `src/common/module-bases/event-checkouts/event-checkout.module.ts` | ts | no | BaseEventCheckoutsModule, BaseEventCheckoutsController, BaseEventCheckoutsService | src/common/module-bases/event-checkouts/event-checkout.controller.ts, src/common/module-bases/event-checkouts/event-checkout.service.ts |
| `src/common/module-bases/event-checkouts/event-checkout.service.ts` | ts | no | EventCheckoutRowDto, ListEventCheckoutsParams, ListEventCheckoutsResult, BulkClearCheckoutsResult |  |
| `src/common/module-bases/event-registrations/event-registration-attendance.deps.ts` | ts | no | EventRegistrationAttendanceDeps | src/common/module-bases/event-registrations/event-registrations.service.ts, src/common/module-bases/event-registrations/event-registration-attendance.types.ts |
| `src/common/module-bases/event-registrations/event-registration-attendance.service.ts` | ts | no | BaseEventRegistrationAttendanceService | src/common/entity-id.ts, src/common/module-bases/event-registrations/event-registration-attendance.deps.ts, src/common/module-bases/event-registrations/event-registration-attendance.types.ts, src/comm |
| `src/common/module-bases/event-registrations/event-registration-attendance.types.ts` | ts | no | AttendanceSource, ManualAttendanceAction, ApplyAttendanceResult, EventAttendanceSocketPayload, REGISTRATION_STATUS, ATTENDANCE_STATUS, CHECKIN_METHOD, EventAttendancePolicy, AttendanceRegistrationRow | src/common/module-bases/event-registrations/event-registrations.service.ts |
| `src/common/module-bases/event-registrations/event-registrations.controller.ts` | ts | no | IEventRegistrationsControllerService, IEventRegistrationsAdminControllerService, BaseEventRegistrationsController | src/common/crud/base-admin-http.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/event-registrations/event-registrations.service.ts, src/ |
| `src/common/module-bases/event-registrations/event-registrations.module.ts` | ts | no | BaseEventRegistrationsModule, BaseEventRegistrationsController, BaseEventRegistrationsService | src/common/module-bases/event-registrations/event-registrations.controller.ts, src/common/module-bases/event-registrations/event-registrations.service.ts |
| `src/common/module-bases/event-registrations/event-registrations.service.ts` | ts | no | EventRegistrationRowDto, ListEventRegistrationsParams, ListEventRegistrationsResult, PublicEventRegistrantDto | src/common/bulk-actions.ts, src/common/pagination.ts, src/common/date-utils.ts, src/common/entity-id.ts |
| `src/common/module-bases/event-speakers/event-speakers.controller.ts` | ts | no | IEventSpeakersControllerService, IEventSpeakersAdminControllerService, BaseEventSpeakersController | src/common/crud/base-admin-http.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/event-speakers/event-speakers.service.ts |
| `src/common/module-bases/event-speakers/event-speakers.module.ts` | ts | no | BaseEventSpeakersModule, BaseEventSpeakersController, BaseEventSpeakersService | src/common/module-bases/event-speakers/event-speakers.controller.ts, src/common/module-bases/event-speakers/event-speakers.service.ts |
| `src/common/module-bases/event-speakers/event-speakers.service.ts` | ts | no | EventSpeakerRowDto, ListEventSpeakersParams, ListEventSpeakersResult | src/common/bulk-actions.ts, src/common/pagination.ts, src/common/date-utils.ts, src/common/entity-id.ts |
| `src/common/module-bases/events/events-column-filters.ts` | ts | no | EVENT_COLUMN_FILTERS | src/common/crud/crud-apply-column-filters.ts, src/common/column-filter-builders.ts |
| `src/common/module-bases/events/events.controller.ts` | ts | no | IEventsControllerService, IEventsAdminControllerService, BaseEventsController | src/common/crud/base-admin-crud.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/events/events.service.ts |
| `src/common/module-bases/events/events.module.ts` | ts | no | BaseEventsModule, BaseEventsController, BaseEventsService | src/common/module-bases/events/events.controller.ts, src/common/module-bases/events/events.service.ts |
| `src/common/module-bases/events/events.service.ts` | ts | no | EventRowDto, ListEventsParams, ListEventsResult | src/common/bulk-actions.ts, src/common/pagination.ts, src/common/date-utils.ts, src/common/poster-normalize.ts, src/common/crud/crud-apply-column-filters.ts, src/common/module-bases/events/events-colu |
| `src/common/module-bases/face-data/face-data.controller.ts` | ts | no | IFaceDatasControllerService, BaseFaceDatasController | src/common/crud, src/common/module-bases/face-data/face-data.service.ts |
| `src/common/module-bases/face-data/face-data.module.ts` | ts | no | BaseFaceDatasModule, BaseFaceDatasController, BaseFaceDatasService | src/common/module-bases/face-data/face-data.controller.ts, src/common/module-bases/face-data/face-data.service.ts |
| `src/common/module-bases/face-data/face-data.service.ts` | ts | no | FaceDatasRowDto, FaceDatasCreateData, FaceDatasUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/groups/group.controller.ts` | ts | no | BaseGroupsController |  |
| `src/common/module-bases/groups/group.service.ts` | ts | no | GROUP_ROLE, CreateGroupInput, ListGroupsInput, GroupWithMembersDto, GroupMessageDto | src/common/index.ts |
| `src/common/module-bases/groups/groups.module.ts` | ts | no | BaseGroupsModule, BaseGroupsController, BaseGroupsService | src/common/module-bases/groups/group.controller.ts, src/common/module-bases/groups/group.service.ts |
| `src/common/module-bases/imported-users/imported-user.controller.ts` | ts | no | IImportedUsersControllerService, BaseImportedUsersController | src/common/crud, src/common/module-bases/imported-users/imported-user.service.ts |
| `src/common/module-bases/imported-users/imported-user.module.ts` | ts | no | BaseImportedUsersModule, BaseImportedUsersController, BaseImportedUsersService | src/common/module-bases/imported-users/imported-user.controller.ts, src/common/module-bases/imported-users/imported-user.service.ts |
| `src/common/module-bases/imported-users/imported-user.service.ts` | ts | no | ImportedUsersRowDto, ImportedUsersCreateData, ImportedUsersUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/locations/location.controller.ts` | ts | no | ILocationsControllerService, BaseLocationsController | src/common/crud, src/common/module-bases/locations/location.service.ts |
| `src/common/module-bases/locations/location.service.ts` | ts | no | LocationsRowDto, LocationsCreateData, LocationsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/locations/locations.module.ts` | ts | no | BaseLocationsModule, BaseLocationsController, BaseLocationsService | src/common/module-bases/locations/location.controller.ts, src/common/module-bases/locations/location.service.ts |
| `src/common/module-bases/majors/major.controller.ts` | ts | no | IMajorsControllerService, BaseMajorsController | src/common/crud, src/common/module-bases/majors/major.service.ts |
| `src/common/module-bases/majors/major.service.ts` | ts | no | MajorsRowDto, MajorsCreateData, MajorsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/majors/majors.module.ts` | ts | no | BaseMajorsModule, BaseMajorsController, BaseMajorsService | src/common/module-bases/majors/major.controller.ts, src/common/module-bases/majors/major.service.ts |
| `src/common/module-bases/notifications/notifications.controller.ts` | ts | no | INotificationsControllerService, INotificationsAdminControllerService, BaseNotificationsController | src/common/entity-id.ts, src/common/module-bases/notifications/notifications.service.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/crud/base-admin-http.contro |
| `src/common/module-bases/notifications/notifications.module.ts` | ts | no | BaseNotificationsModule, BaseNotificationsController, BaseNotificationsService | src/common/module-bases/notifications/notifications.controller.ts, src/common/module-bases/notifications/notifications.service.ts |
| `src/common/module-bases/notifications/notifications.service.ts` | ts | no | NotificationsListQuery, NotificationItemDto, NotificationsListResult, UnreadCountsResult, AdminTableRowDto, AdminTableQuery, AdminTableResult | src/common/entity-id.ts |
| `src/common/module-bases/orders/order-checkout.ts` | ts | no | CheckoutProduct, CreateOrderLineInput, mergeCreateOrderLines, buildOrderItemsFromProducts, buildOrderNumber | src/common/commerce/product-types.ts, src/common/commerce/unit-pricing.ts, src/common/commerce/product-units.ts |
| `src/common/module-bases/orders/order-column-filters.ts` | ts | no | ORDER_COLUMN_FILTERS | src/common/crud/crud-apply-column-filters.ts, src/common/column-filter-builders.ts |
| `src/common/module-bases/orders/order.controller.ts` | ts | no | BaseOrdersController |  |
| `src/common/module-bases/orders/order.service.ts` | ts | no | OrderStatus, OrderRowDto, CreateOrderDto, StaffOrderStatusCounts, OrdersProductsPort, OrdersPromoPort, OrdersUploadsPort | src/common/index.ts, src/common/crud/crud-apply-column-filters.ts, src/common/commerce/product-types.ts, src/common/commerce/gift-rules.ts, src/common/commerce/promo-checkout.ts, src/common/module-bas |
| `src/common/module-bases/orders/orders.module.ts` | ts | no | BaseOrdersModule, BaseOrdersController, BaseOrdersService | src/common/module-bases/orders/order.controller.ts, src/common/module-bases/orders/order.service.ts |
| `src/common/module-bases/page-contents/page-contents-column-filters.ts` | ts | no | GUIDE_COLUMN_FILTERS | src/common/crud/crud-apply-column-filters.ts, src/common/column-filter-builders.ts |
| `src/common/module-bases/page-contents/page-contents.controller.ts` | ts | no | IPageContentsControllerService, IPageContentsAdminControllerService, BasePageContentsController | src/common/crud/base-admin-http.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/page-contents/page-contents.service.ts |
| `src/common/module-bases/page-contents/page-contents.module.ts` | ts | no | BasePageContentsModule, BasePageContentsController, BasePageContentsService | src/common/module-bases/page-contents/page-contents.controller.ts, src/common/module-bases/page-contents/page-contents.service.ts |
| `src/common/module-bases/page-contents/page-contents.service.ts` | ts | no | PageContentCreateInput, PageContentUpdateInput | src/common/bulk-actions.ts, src/common/crud/crud-apply-column-filters.ts, src/common/module-bases/page-contents/page-contents-column-filters.ts, src/common/entity-id.ts |
| `src/common/module-bases/parent-students/parent-student-column-filters.ts` | ts | no | PARENT_STUDENT_COLUMN_FILTERS | src/common/crud/crud-apply-column-filters.ts, src/common/column-filter-builders.ts |
| `src/common/module-bases/parent-students/parent-student.controller.ts` | ts | no | IParentStudentsControllerService, BaseParentStudentsController, BaseParentMyStudentsController | src/common/index.ts, src/common/module-bases/parent-students/parent-student.service.ts |
| `src/common/module-bases/parent-students/parent-student.module.ts` | ts | no | BaseParentStudentsModule, BaseParentStudentsController, BaseParentMyStudentsController, BaseParentStudentsService | src/common/module-bases/parent-students/parent-student.controller.ts, src/common/module-bases/parent-students/parent-student.service.ts |
| `src/common/module-bases/parent-students/parent-student.service.ts` | ts | no | ParentStudentsRowDto, ListParentStudentsResult, AddParentStudentInput, ParentStudentsRealtimePort | src/common/crud/crud-apply-column-filters.ts, src/common/index.ts, src/common/module-bases/parent-students/parent-student-column-filters.ts |
| `src/common/module-bases/posts/posts.controller.ts` | ts | no | IPostsControllerService, IPostsAdminControllerService, BasePostsController | src/common/crud/base-admin-crud.controller.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/posts/posts.service.ts |
| `src/common/module-bases/posts/posts.module.ts` | ts | no | BasePostsModule, BasePostsController, BasePostsService, POSTS_FILTER_CATEGORIES_NONE | src/common/module-bases/posts/posts.controller.ts, src/common/module-bases/posts/posts.service.ts |
| `src/common/module-bases/posts/posts.service.ts` | ts | no | PostRowDto, PostDetailDto, POSTS_FILTER_CATEGORIES_NONE, ListPostsParams, ListPostsResult | src/common/resolve-relation-filters.ts, src/common/pagination.ts, src/common/get-options.ts, src/common/date-utils.ts, src/common/entity-id.ts, src/common/post-pivot-insert.ts |
| `src/common/module-bases/posts/posts.types.ts` | ts | no | PostActivityLog, PostsModuleConfig, PostBulkActionResult | src/common/module-types, src/common/module-bases/posts/posts.service.ts |
| `src/common/module-bases/products/product.controller.ts` | ts | no | BaseProductsController |  |
| `src/common/module-bases/products/product.service.ts` | ts | no | ProductRowDto, ProductListParams, ProductListResult, ProductWriteData | src/common/index.ts, src/common/commerce/product-units.ts, src/common/commerce/product-types.ts |
| `src/common/module-bases/products/products.module.ts` | ts | no | BaseProductsModule, BaseProductsController, BaseProductsService | src/common/module-bases/products/product.controller.ts, src/common/module-bases/products/product.service.ts |
| `src/common/module-bases/promo-codes/promo-code.controller.ts` | ts | no | IPromoCodesControllerService, BasePromoCodesController | src/common/crud, src/common/module-bases/promo-codes/promo-code.service.ts |
| `src/common/module-bases/promo-codes/promo-code.module.ts` | ts | no | BasePromoCodesModule, BasePromoCodesController, BasePromoCodesService | src/common/module-bases/promo-codes/promo-code.controller.ts, src/common/module-bases/promo-codes/promo-code.service.ts |
| `src/common/module-bases/promo-codes/promo-code.service.ts` | ts | no | PromoCodesRowDto, PromoCodesCreateData, PromoCodesUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/roles/role.controller.ts` | ts | no | BaseRolesController |  |
| `src/common/module-bases/roles/role.service.ts` | ts | no | RolesRowDto, ListRolesParams, ListRolesResult, RolesCreateData, RolesUpdateData | src/common/index.ts, src/config/system-role.ts |
| `src/common/module-bases/roles/roles.module.ts` | ts | no | BaseRolesModule, BaseRolesController, BaseRolesService | src/common/module-bases/roles/role.controller.ts, src/common/module-bases/roles/role.service.ts |
| `src/common/module-bases/screens/screen.controller.ts` | ts | no | IScreensControllerService, BaseScreensController | src/common/crud, src/common/module-bases/screens/screen.service.ts |
| `src/common/module-bases/screens/screen.service.ts` | ts | no | ScreensRowDto, ScreensCreateData, ScreensUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/screens/screens.module.ts` | ts | no | BaseScreensModule, BaseScreensController, BaseScreensService | src/common/module-bases/screens/screen.controller.ts, src/common/module-bases/screens/screen.service.ts |
| `src/common/module-bases/seo-metas/seo-meta.controller.ts` | ts | no | ISeoMetasControllerService, BaseSeoMetasController | src/common/crud, src/common/index.ts, src/common/module-bases/seo-metas/seo-meta.service.ts |
| `src/common/module-bases/seo-metas/seo-meta.module.ts` | ts | no | BaseSeoMetasModule, BaseSeoMetasController, BaseSeoMetasService | src/common/module-bases/seo-metas/seo-meta.controller.ts, src/common/module-bases/seo-metas/seo-meta.service.ts |
| `src/common/module-bases/seo-metas/seo-meta.service.ts` | ts | no | SeoMetasRowDto, SeoMetasCreateData, SeoMetasUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/sessions/sessions.controller.ts` | ts | no | ISessionsControllerService, ISessionsAdminControllerService, ISessionsAdminSocketGateway, ISessionsSocketGateway, BaseSessionsController | src/common/module-bases/sessions/sessions.service.ts, src/common/module-bases/notifications/notifications.service.ts, src/common/crud/base-admin-http.controller.ts, src/common/entity-id.ts, src/common |
| `src/common/module-bases/sessions/sessions.module.ts` | ts | no | BaseSessionsModule, BaseSessionsController, BaseSessionsService | src/common/module-bases/sessions/sessions.controller.ts, src/common/module-bases/sessions/sessions.service.ts |
| `src/common/module-bases/sessions/sessions.service.ts` | ts | no | AuthRoleNamesBinding, SessionRowDto, ListSessionsParams, ListSessionsResult, AccountWithSessionStatusDto, ListAccountsWithSessionStatusParams, ListAccountsWithSessionStatusResult | src/common/resolve-relation-filters.ts, src/common/pagination.ts, src/common/entity-id.ts, src/common/date-utils.ts |
| `src/common/module-bases/settings/public-settings.controller.ts` | ts | no | IPublicSettingsControllerService, BasePublicSettingsController | src/common/index.ts, src/config/constants.ts, src/common/module-bases/settings/setting.service.ts |
| `src/common/module-bases/settings/setting.controller.ts` | ts | no | ISettingsControllerService, BaseSettingsController | src/common/index.ts, src/common/module-bases/settings/setting.service.ts |
| `src/common/module-bases/settings/setting.service.ts` | ts | no | PublicSiteBranding, SettingsRowDto, SettingsCreateData, SettingsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/settings/settings.module.ts` | ts | no | BaseSettingsModule, BaseSettingsController, BasePublicSettingsController, BaseSettingsService | src/common/module-bases/settings/public-settings.controller.ts, src/common/module-bases/settings/setting.controller.ts, src/common/module-bases/settings/setting.service.ts |
| `src/common/module-bases/speakers/speaker.controller.ts` | ts | no | ISpeakersControllerService, BaseSpeakersController | src/common/crud, src/common/module-bases/speakers/speaker.service.ts |
| `src/common/module-bases/speakers/speaker.service.ts` | ts | no | SpeakersRowDto, SpeakersCreateData, SpeakersUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/speakers/speakers.module.ts` | ts | no | BaseSpeakersModule, BaseSpeakersController, BaseSpeakersService | src/common/module-bases/speakers/speaker.controller.ts, src/common/module-bases/speakers/speaker.service.ts |
| `src/common/module-bases/students/student.controller.ts` | ts | no | IStudentsControllerService, BaseStudentsController | src/common/crud, src/common/module-bases/students/student.service.ts |
| `src/common/module-bases/students/student.service.ts` | ts | no | StudentsRowDto, StudentsCreateData, StudentsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/students/students.module.ts` | ts | no | BaseStudentsModule, BaseStudentsController, BaseStudentsService | src/common/module-bases/students/student.controller.ts, src/common/module-bases/students/student.service.ts |
| `src/common/module-bases/system/export-schema.ts` | ts | no | LEGACY_TABLE_TO_MODEL, LEGACY_IMPORT_FIELD_ALIASES, resolveLegacyTableModelName, normalizeLegacyImportRow |  |
| `src/common/module-bases/system/import-helpers.ts` | ts | no | ImportRow, stripLegacyHeroSlideFromBundle, isSkippableImportRowError, stripHeroSlidesPermissions, pivotFk, sanitizePivotRowsInExportJson, orderCategoryRowsForImport |  |
| `src/common/module-bases/system/import-reference.ts` | ts | no | ImportReferenceManifest, getImportReferenceFilePath, loadImportReferenceManifest, ImportVerificationModel, ImportVerificationResult, buildImportVerification | src/common/data-paths.ts |
| `src/common/module-bases/system/legacy-import-id-map.ts` | ts | no | IMPORT_ID_MAP_GROUP, importIdMapSettingKey, exportLegacyKey, LegacyImportIdMap | src/common/index.ts |
| `src/common/module-bases/system/system-bootstrap.deps.ts` | ts | no | SystemBootstrapResult, SystemBootstrapDeps |  |
| `src/common/module-bases/system/system-maintenance.ts` | ts | no | SYSTEM_MAINTENANCE_PERMISSIONS, canAccessSystemMaintenance | src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/auth/auth.service.ts |
| `src/common/module-bases/system/system.controller.ts` | ts | no | ISystemMaintenanceAuth, ISystemControllerService, BaseSystemController | src/common/module-bases/system/system.service.ts, src/common/index.ts, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/auth/auth.service.ts, src/common/module-bases/system/ |
| `src/common/module-bases/system/system.module.ts` | ts | no | BaseSystemModule, BaseSystemController, BaseSystemService | src/common/module-bases/system/system.controller.ts, src/common/module-bases/system/system.service.ts |
| `src/common/module-bases/system/system.types.ts` | ts | no | SchemaColumn, SchemaTable, ImportVerificationModel, ImportVerification, SchemaRelation, DatabaseSchemaResponse, ImportConfigResponse |  |
| `src/common/module-bases/tags/tag.controller.ts` | ts | no | ITagsControllerService, BaseTagsController | src/common/crud, src/common/module-bases/tags/tag.service.ts |
| `src/common/module-bases/tags/tag.service.ts` | ts | no | TagsRowDto, TagsCreateData, TagsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/tags/tags.module.ts` | ts | no | BaseTagsModule, BaseTagsController, BaseTagsService | src/common/module-bases/tags/tag.controller.ts, src/common/module-bases/tags/tag.service.ts |
| `src/common/module-bases/templates/template.controller.ts` | ts | no | ITemplatesControllerService, BaseTemplatesController | src/common/crud, src/common/module-bases/templates/template.service.ts |
| `src/common/module-bases/templates/template.service.ts` | ts | no | TemplatesRowDto, TemplatesCreateData, TemplatesUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/templates/templates.module.ts` | ts | no | BaseTemplatesModule, BaseTemplatesController, BaseTemplatesService | src/common/module-bases/templates/template.controller.ts, src/common/module-bases/templates/template.service.ts |
| `src/common/module-bases/training-levels/training-level.controller.ts` | ts | no | ITrainingLevelsControllerService, BaseTrainingLevelsController | src/common/crud, src/common/module-bases/training-levels/training-level.service.ts |
| `src/common/module-bases/training-levels/training-level.module.ts` | ts | no | BaseTrainingLevelsModule, BaseTrainingLevelsController, BaseTrainingLevelsService | src/common/module-bases/training-levels/training-level.controller.ts, src/common/module-bases/training-levels/training-level.service.ts |
| `src/common/module-bases/training-levels/training-level.service.ts` | ts | no | TrainingLevelsRowDto, TrainingLevelsCreateData, TrainingLevelsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/training-systems/training-system.controller.ts` | ts | no | ITrainingSystemsControllerService, BaseTrainingSystemsController | src/common/crud, src/common/module-bases/training-systems/training-system.service.ts |
| `src/common/module-bases/training-systems/training-system.module.ts` | ts | no | BaseTrainingSystemsModule, BaseTrainingSystemsController, BaseTrainingSystemsService | src/common/module-bases/training-systems/training-system.controller.ts, src/common/module-bases/training-systems/training-system.service.ts |
| `src/common/module-bases/training-systems/training-system.service.ts` | ts | no | TrainingSystemsRowDto, TrainingSystemsCreateData, TrainingSystemsUpdateData | src/common/crud, src/common/module-types |
| `src/common/module-bases/users/users.controller.ts` | ts | no | UsersController, CreateUserDto, UpdateUserDto, BulkActionDto, BaseUsersController | src/common/module-types, src/common/module-bases/users/users.service.ts, src/common/parse-list-query.ts |
| `src/common/module-bases/users/users.mapper.ts` | ts | no | mapUserToRowDto, mapUserRoles, mapUserToDevLoginOption, filterDevLoginOptions, buildSearchPattern, buildSearchConditions | src/common/module-types |
| `src/common/module-bases/users/users.module.ts` | ts | no | UsersModule, BaseUsersModule, BaseUsersController, BaseUsersService, ADMIN_TABLE_EXPORT_MAX_LIMIT | src/common/module-bases/users/users.service.ts, src/common/module-bases/users/users.controller.ts, src/common/module-bases/notifications/notifications.module.ts |
| `src/common/module-bases/users/users.service.ts` | ts | no | DevLoginOptionDto, UserBulkResult, BaseUsersService, ADMIN_TABLE_EXPORT_MAX_LIMIT | src/common/index.ts, src/common/module-bases/users/users.mapper.ts, src/common/module-types |
| `src/common/module-bases/users/users.types.ts` | ts | no | IUsersModule, UsersModuleConfig, UserActivityLog, UserBulkActionResult, UserRowDto, UserRoleDto, ListUsersParams, CreateUserData, UpdateUserData, BulkOperationResult, PaginatedResult, UserOption, DevL | src/common/module-types |
| `src/common/module-types/common.types.ts` | ts | no | ApiResponse, ApiError, ListQueryParams, FilterOperator, FilterCondition, Timestamps, SoftDeletable, Activable, BaseEntity, PaginationInput, normalizePagination |  |
| `src/common/module-types/crud.types.ts` | ts | no | CrudRowDto, ListCrudParams, BulkOperationResult, CrudFieldDescriptor, CrudCreateData, CrudUpdateData | src/common/module-types/common.types.ts |
| `src/common/module-types/index.ts` | ts | no |  | src/common/module-types/crud.types.ts, src/common/module-types/common.types.ts, src/common/module-types/user.types.ts |
| `src/common/module-types/user.types.ts` | ts | no | UserRowDto, UserRoleDto, PaginationMeta, PaginatedResult, ListUsersParams, CreateUserData, UpdateUserData, BulkAction, BulkOperationResult, UserOption, DevLoginRole, DevLoginOption, DevLoginOptionsQue |  |
| `src/common/normalize-relation-ids.ts` | ts | no | normalizeRelationIds |  |
| `src/common/pagination.ts` | ts | no | ADMIN_TABLE_EXPORT_MAX_LIMIT, DEFAULT_PAGE_LIMIT, normalizePageLimit, paginationMeta, buildPaginationMeta, calculateOffset, calculateTotalPages, isValidPagination, getPaginationRange |  |
| `src/common/parse-column-filters.ts` | ts | no | parseColumnFiltersFromQuery |  |
| `src/common/parse-list-query.ts` | ts | no | ParsedListQuery, parseAdminListLimit, parseAdminListPage, parseListQuery | src/common/pagination.ts |
| `src/common/permissions.decorator.ts` | ts | no | PERMISSIONS_KEY, Permissions |  |
| `src/common/permissions.guard.ts` | ts | no | IS_PUBLIC_KEY, AuthPayload, AuthFailureReason, AuthPayloadResolver, Public, PermissionsGuard | src/common/permissions.decorator.ts, src/config/constants.ts |
| `src/common/post-pivot-insert.ts` | ts | no |  |  |
| `src/common/poster-normalize.ts` | ts | no | unwrapPosterUrl, normalizePosterField |  |
| `src/common/product-types.ts` | ts | no | QuantityCountMode, QuantityScope, QuantityCondition, ProductPriceTier, ProductGiftRule, ProductUnitType, OrderItemSnapshot, OrderGiftSnapshot |  |
| `src/common/product-units.ts` | ts | no | resolveUnit, resolveUnitImage, resolveLineSku, effectiveQuantityForCondition, matchesQuantityCondition, getUnitStock, hasExplicitSellableUnitStock, syncProductStockFromUnits, applyProductStockDeductio | src/common/product-types.ts, src/entities/product.entity.ts |
| `src/common/promo-checkout.ts` | ts | no | PromoDiscountResult, computePromoDiscount, isPromoRedeemable | src/entities/promo-code.entity.ts |
| `src/common/public.decorator.ts` | ts | no | IS_PUBLIC_KEY, Public |  |
| `src/common/request-id.middleware.ts` | ts | no | REQUEST_ID_HEADER, RequestIdMiddleware |  |
| `src/common/resolve-relation-filters.ts` | ts | no | RelationFilterConfig, RelationFiltersConfig, RelationEntityResolver | src/common/entity-id.ts |
| `src/common/unit-pricing.ts` | ts | no | LinePricingResult, effectiveLineUnitPrice | src/common/product-types.ts |
| `src/config/app-config.ts` | ts | no | apiServerAppConfig | src/config/constants.ts |
| `src/config/app.config.ts` | ts | no | appConfig | src/config/constants.ts |
| `src/config/constants.ts` | ts | no | APP_HEADERS, AUTH_ROLE_NAMES, AuthRoleName, ADMIN_ROUTES, PUBLIC_ROUTES |  |
| `src/config/permissions.ts` | ts | no | RESOURCES, ACTIONS, Resource, Action, Permission, PERMISSIONS |  |
| `src/config/protected-admin.ts` | ts | no | isProtectedAdminEmail, canEditProtectedAdminUser |  |
| `src/config/role-templates/event-staff.template.ts` | ts | no | EVENT_STAFF_ROLE_NAME, EVENT_STAFF_ROLE_DISPLAY_NAME, EVENT_STAFF_ROLE_DESCRIPTION, EVENT_CHECKIN_STAFF_PERMISSIONS, EventCheckinStaffPermission, EVENT_STAFF_ROLE_TEMPLATE |  |
| `src/config/system-role.ts` | ts | no | SYSTEM_SUPER_ADMIN_ROLE_NAME, isSystemSuperAdminRoleName |  |
| `src/contact-requests/contact-requests.controller.ts` | ts | no | ContactRequestsController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/contact-requests/contact-request.controller.ts, src/contact-requests/contact-requests.s |
| `src/contact-requests/contact-requests.module.ts` | ts | no | ContactRequestsModule | src/notifications/notifications.module.ts, src/socket/socket.module.ts, src/contact-requests/contact-requests.service.ts, src/contact-requests/contact-requests.controller.ts |
| `src/contact-requests/contact-requests.service.spec.ts` | ts | no |  | src/contact-requests/contact-requests.service.ts |
| `src/contact-requests/contact-requests.service.ts` | ts | no | ContactRequestsService | src/entities/contact-request.entity.ts, src/common/module-bases/contact-requests/contact-request.service.ts |
| `src/courses/courses.controller.ts` | ts | no | CoursesController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/courses/course.controller.ts, src/courses/courses.service.ts |
| `src/courses/courses.module.ts` | ts | no | CoursesModule | src/courses/courses.controller.ts, src/courses/courses.service.ts |
| `src/courses/courses.service.spec.ts` | ts | no |  | src/courses/courses.service.ts |
| `src/courses/courses.service.ts` | ts | no | CoursesService | src/common/admin/filter-configs.ts, src/entities/course.entity.ts, src/common/module-bases/courses/course.service.ts |
| `src/dashboard/dashboard.controller.ts` | ts | no | DashboardController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/dashboard/dashboard.controller.ts, src/dashboard/dashboard.service.ts |
| `src/dashboard/dashboard.module.ts` | ts | no | DashboardModule | src/dashboard/dashboard.controller.ts, src/dashboard/dashboard.service.ts |
| `src/dashboard/dashboard.service.spec.ts` | ts | no |  | src/dashboard/dashboard.service.ts |
| `src/dashboard/dashboard.service.ts` | ts | no | DashboardService | src/entities/category.entity.ts, src/entities/post-category.entity.ts, src/common/module-bases/dashboard/dashboard.service.ts |
| `src/data-test/fake-em.spec.ts` | ts | no |  | src/data-test/fake-em.ts, src/data-test/fixture.ts |
| `src/data-test/fake-em.ts` | ts | no | FakeUpdateResult, FakeStore, entityNameToStoreKey, FakeEntityManager, createFakeEntityManager | src/data-test/fixture.ts |
| `src/data-test/fixture.spec.ts` | ts | no |  | src/data-test/fixture.ts |
| `src/data-test/fixture.ts` | ts | no | DEFAULT_FIXTURE_PATH, FullExportFixture, loadFixture, getUsers, getRoles, getUserRoles, getSettings, getCategories, findUserByEmail, findUserById, getUserIdsForRole, clearFixtureCache |  |
| `src/departments/departments.controller.ts` | ts | no | DepartmentsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/departments/department.controller.ts, src/departments/departments.service.ts |
| `src/departments/departments.module.ts` | ts | no | DepartmentsModule | src/departments/departments.controller.ts, src/departments/departments.service.ts |
| `src/departments/departments.service.spec.ts` | ts | no |  | src/departments/departments.service.ts |
| `src/departments/departments.service.ts` | ts | no | DepartmentsService | src/common/admin/filter-configs.ts, src/entities/department.entity.ts, src/common/module-bases/departments/department.service.ts |
| `src/entities/academic-year.entity.ts` | ts | no | AcademicYear |  |
| `src/entities/account.entity.ts` | ts | no | Account | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/admission-result.entity.ts` | ts | no | AdmissionResult | src/entities/base.entity.ts |
| `src/entities/base.entity.ts` | ts | no |  |  |
| `src/entities/camera.entity.ts` | ts | no | Camera | src/entities/base.entity.ts, src/entities/event.entity.ts |
| `src/entities/category.entity.ts` | ts | no | CategoryType, Category | src/entities/base.entity.ts, src/entities/post-category.entity.ts |
| `src/entities/comment.entity.ts` | ts | no | Comment | src/entities/base.entity.ts, src/entities/post.entity.ts, src/entities/user.entity.ts |
| `src/entities/contact-request.entity.ts` | ts | no | ContactStatus, ContactPriority, ContactRequest | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/course.entity.ts` | ts | no | Course |  |
| `src/entities/customer-cart.entity.ts` | ts | no | CustomerCart | src/common/commerce/cart-types.ts |
| `src/entities/department.entity.ts` | ts | no | Department | src/entities/base.entity.ts |
| `src/entities/event-checkin.entity.ts` | ts | no | CheckinType, EventCheckin | src/entities/base.entity.ts, src/entities/event.entity.ts, src/entities/event-registration.entity.ts |
| `src/entities/event-registration.entity.ts` | ts | no | RegistrationStatus, AttendanceStatus, CheckinMethod, EventRegistration | src/entities/base.entity.ts, src/entities/event.entity.ts |
| `src/entities/event-speaker.entity.ts` | ts | no | EventSpeaker | src/entities/base.entity.ts, src/entities/event.entity.ts, src/entities/speaker.entity.ts |
| `src/entities/event.entity.ts` | ts | no | EventFormat, Event | src/entities/base.entity.ts, src/entities/camera.entity.ts, src/entities/event-checkin.entity.ts, src/entities/event-registration.entity.ts, src/entities/event-speaker.entity.ts, src/entities/user.ent |
| `src/entities/face-data.entity.ts` | ts | no | FaceData | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/group-member.entity.ts` | ts | no | GroupRole, GroupMember | src/entities/base.entity.ts, src/entities/group.entity.ts, src/entities/user.entity.ts |
| `src/entities/group.entity.ts` | ts | no | Group | src/entities/base.entity.ts, src/entities/group-member.entity.ts, src/entities/message.entity.ts, src/entities/user.entity.ts |
| `src/entities/imported-user.entity.ts` | ts | no | ImportedUser | src/entities/academic-year.entity.ts, src/entities/training-level.entity.ts, src/entities/training-system.entity.ts, src/entities/major.entity.ts |
| `src/entities/location.entity.ts` | ts | no | Location |  |
| `src/entities/major.entity.ts` | ts | no | Major |  |
| `src/entities/message-read.entity.ts` | ts | no | MessageRead | src/entities/base.entity.ts, src/entities/message.entity.ts, src/entities/user.entity.ts |
| `src/entities/message.entity.ts` | ts | no | MessageType, Message | src/entities/base.entity.ts, src/entities/group.entity.ts, src/entities/message-read.entity.ts, src/entities/user.entity.ts |
| `src/entities/notification.entity.ts` | ts | no | NotificationKind, Notification | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/order.entity.ts` | ts | no | OrderStatus, PaymentMethod, PaymentStatus, Order | src/common/commerce/product-types.ts, src/entities/user.entity.ts |
| `src/entities/page-content.entity.ts` | ts | no | PageContent | src/entities/base.entity.ts |
| `src/entities/parent-student.entity.ts` | ts | no | ParentStudentStatus, ParentStudent | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/post-category.entity.ts` | ts | no | PostCategory | src/entities/post.entity.ts, src/entities/category.entity.ts |
| `src/entities/post-tag.entity.ts` | ts | no | PostTag | src/entities/post.entity.ts, src/entities/tag.entity.ts |
| `src/entities/post.entity.ts` | ts | no | Post | src/entities/base.entity.ts, src/entities/comment.entity.ts, src/entities/post-category.entity.ts, src/entities/post-tag.entity.ts, src/entities/user.entity.ts |
| `src/entities/product.entity.ts` | ts | no | Product | src/common/commerce/product-types.ts |
| `src/entities/promo-code.entity.ts` | ts | no | PromoDiscountKind, PromoCode |  |
| `src/entities/role.entity.ts` | ts | no | Role | src/entities/base.entity.ts, src/entities/user-role.entity.ts |
| `src/entities/screen.entity.ts` | ts | no | Screen | src/entities/base.entity.ts, src/entities/camera.entity.ts, src/entities/template.entity.ts |
| `src/entities/seo-meta.entity.ts` | ts | no | SeoMeta | src/entities/base.entity.ts |
| `src/entities/session.entity.ts` | ts | no | Session | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/setting.entity.ts` | ts | no | Setting | src/entities/base.entity.ts |
| `src/entities/speaker.entity.ts` | ts | no | Speaker |  |
| `src/entities/storage-file.entity.ts` | ts | no | StorageFile | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/student.entity.ts` | ts | no | Student | src/entities/base.entity.ts, src/entities/user.entity.ts |
| `src/entities/tag.entity.ts` | ts | no | Tag | src/entities/base.entity.ts, src/entities/post-tag.entity.ts |
| `src/entities/template.entity.ts` | ts | no | Template | src/entities/base.entity.ts |
| `src/entities/training-level.entity.ts` | ts | no | TrainingLevel |  |
| `src/entities/training-system.entity.ts` | ts | no | TrainingSystem |  |
| `src/entities/user-role.entity.ts` | ts | no | UserRole | src/entities/base.entity.ts, src/entities/role.entity.ts, src/entities/user.entity.ts |
| `src/entities/user.entity.ts` | ts | no | User | src/entities/base.entity.ts, src/entities/account.entity.ts, src/entities/comment.entity.ts, src/entities/contact-request.entity.ts, src/entities/group-member.entity.ts, src/entities/group.entity.ts,  |
| `src/entities/verification-token.entity.ts` | ts | no | VerificationToken |  |
| `src/event-checkins/event-checkins.controller.ts` | ts | no | EventCheckinsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/event-checkins/event-checkins.controller.ts, src/event-checkins/event-checkins.service. |
| `src/event-checkins/event-checkins.module.ts` | ts | no | EventCheckinsModule | src/event-checkins/event-checkins.controller.ts, src/event-checkins/event-checkins.service.ts |
| `src/event-checkins/event-checkins.service.spec.ts` | ts | no |  | src/event-checkins/event-checkins.service.ts |
| `src/event-checkins/event-checkins.service.ts` | ts | no | EventCheckinsService | src/entities/event-checkin.entity.ts, src/entities/event-registration.entity.ts, src/common/module-bases/event-checkins/event-checkins.service.ts |
| `src/event-checkouts/event-checkouts.controller.ts` | ts | no | EventCheckoutsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/event-checkouts/event-checkout.controller.ts, src/event-checkouts/event-checkouts.servi |
| `src/event-checkouts/event-checkouts.module.ts` | ts | no | EventCheckoutsModule | src/event-checkouts/event-checkouts.controller.ts, src/event-checkouts/event-checkouts.service.ts |
| `src/event-checkouts/event-checkouts.service.spec.ts` | ts | no |  | src/event-checkouts/event-checkouts.service.ts |
| `src/event-checkouts/event-checkouts.service.ts` | ts | no | EventCheckoutsService | src/common/module-bases/event-checkouts/event-checkout.service.ts |
| `src/event-registrations/event-registration-attendance.service.ts` | ts | no | EventRegistrationAttendanceService | src/common/module-bases/event-registrations/event-registration-attendance.service.ts, src/entities/event.entity.ts, src/entities/event-registration.entity.ts, src/socket/socket.gateway.ts, src/event-r |
| `src/event-registrations/event-registrations.controller.ts` | ts | no | EventRegistrationsController | src/event-registrations/event-registration-attendance.service.ts, src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/event-registrations/e |
| `src/event-registrations/event-registrations.module.ts` | ts | no | EventRegistrationsModule | src/socket/socket.module.ts, src/event-registrations/event-registration-attendance.service.ts, src/event-registrations/event-registrations.controller.ts, src/event-registrations/event-registrations.se |
| `src/event-registrations/event-registrations.service.spec.ts` | ts | no |  | src/event-registrations/event-registrations.service.ts |
| `src/event-registrations/event-registrations.service.ts` | ts | no | EventRegistrationsService | src/entities/event-registration.entity.ts, src/entities/event.entity.ts, src/entities/user.entity.ts, src/common/module-bases/event-registrations/event-registrations.service.ts |
| `src/event-speakers/event-speakers.controller.ts` | ts | no | EventSpeakersController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/event-speakers/event-speakers.controller.ts, src/event-speakers/event-speakers.service. |
| `src/event-speakers/event-speakers.module.ts` | ts | no | EventSpeakersModule | src/event-speakers/event-speakers.controller.ts, src/event-speakers/event-speakers.service.ts |
| `src/event-speakers/event-speakers.service.spec.ts` | ts | no |  | src/event-speakers/event-speakers.service.ts |
| `src/event-speakers/event-speakers.service.ts` | ts | no | EventSpeakersService | src/entities/event-speaker.entity.ts, src/common/module-bases/event-speakers/event-speakers.service.ts |
| `src/events/events.controller.ts` | ts | no | EventsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/events/events.controller.ts, src/events/events.service.ts |
| `src/events/events.module.ts` | ts | no | EventsModule | src/events/events.controller.ts, src/events/events.service.ts |
| `src/events/events.service.spec.ts` | ts | no |  | src/events/events.service.ts |
| `src/events/events.service.ts` | ts | no | EventsService | src/common/admin/filter-configs.ts, src/entities/event.entity.ts, src/entities/camera.entity.ts, src/common/module-bases/events/events.service.ts |
| `src/face-data/face-data.controller.ts` | ts | no | FaceDataController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/face-data/face-data.controller.ts, src/face-data/face-data.service.ts |
| `src/face-data/face-data.module.ts` | ts | no | FaceDataModule | src/face-data/face-data.controller.ts, src/face-data/face-data.service.ts |
| `src/face-data/face-data.service.spec.ts` | ts | no |  | src/face-data/face-data.service.ts |
| `src/face-data/face-data.service.ts` | ts | no | FaceDataService | src/entities/face-data.entity.ts, src/common/module-bases/face-data/face-data.service.ts |
| `src/groups/groups.controller.ts` | ts | no | GroupsController | src/common, src/groups/groups.service.ts, src/notifications/notifications.service.ts, src/entities/notification.entity.ts, src/socket/socket.gateway.ts, src/config/constants.ts, src/config/permissions |
| `src/groups/groups.module.ts` | ts | no | GroupsModule | src/notifications/notifications.module.ts, src/socket/socket.module.ts, src/groups/groups.controller.ts, src/groups/groups.service.ts |
| `src/groups/groups.service.spec.ts` | ts | no |  | src/groups/groups.service.ts, src/entities/group.entity.ts, src/entities/group-member.entity.ts |
| `src/groups/groups.service.ts` | ts | no | GroupsService | src/entities/group.entity.ts, src/entities/group-member.entity.ts, src/entities/message.entity.ts, src/entities/message-read.entity.ts, src/entities/user.entity.ts, src/common/module-bases/groups/grou |
| `src/hanet/hanet-payload.spec.ts` | ts | no |  | src/hanet/hanet-payload.ts |
| `src/hanet/hanet-payload.ts` | ts | no | HANET_DEVICE_ID_KEYS, HANET_PERSON_NAME_KEYS, HANET_PERSON_ID_KEYS, parseHanetCompactTime, pickHanetString, pickHanetTimestamp, pickHanetAttendanceKind, pickHanetDeviceId, normalizeHanetBody | src/hanet/hanet.types.ts |
| `src/hanet/hanet-webhook.controller.ts` | ts | no | HanetWebhookController | src/config/constants.ts, src/common, src/hanet/hanet-payload.ts, src/hanet/hanet-webhook.service.ts, src/hanet/hanet.types.ts |
| `src/hanet/hanet-webhook.service.spec.ts` | ts | no |  | src/hanet/hanet-webhook.service.ts, src/event-registrations/event-registration-attendance.service.ts |
| `src/hanet/hanet-webhook.service.ts` | ts | no | HanetWebhookService | src/common, src/entities/event.entity.ts, src/entities/event-registration.entity.ts, src/entities/camera.entity.ts, src/event-registrations/event-registration-attendance.service.ts, src/hanet/hanet-pa |
| `src/hanet/hanet.module.ts` | ts | no | HanetModule | src/event-registrations/event-registrations.module.ts, src/hanet/hanet-webhook.controller.ts, src/hanet/hanet-webhook.service.ts |
| `src/hanet/hanet.types.ts` | ts | no | HanetWebhookBody, HanetCameraRole, HanetResolveContext, HanetWebhookResult |  |
| `src/imported-users/imported-users.controller.ts` | ts | no | ImportedUsersController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/imported-users/imported-user.controller.ts, src/imported-users/imported-users.service.t |
| `src/imported-users/imported-users.module.ts` | ts | no | ImportedUsersModule | src/imported-users/imported-users.controller.ts, src/imported-users/imported-users.service.ts |
| `src/imported-users/imported-users.service.spec.ts` | ts | no |  | src/imported-users/imported-users.service.ts |
| `src/imported-users/imported-users.service.ts` | ts | no | ImportedUsersService | src/entities/imported-user.entity.ts, src/common/module-bases/imported-users/imported-user.service.ts |
| `src/locations/locations.controller.ts` | ts | no | LocationsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/locations/location.controller.ts, src/locations/locations.service.ts |
| `src/locations/locations.module.ts` | ts | no | LocationsModule | src/locations/locations.controller.ts, src/locations/locations.service.ts |
| `src/locations/locations.service.spec.ts` | ts | no |  | src/locations/locations.service.ts |
| `src/locations/locations.service.ts` | ts | no | LocationsService | src/common/admin/filter-configs.ts, src/entities/location.entity.ts, src/common/module-bases/locations/location.service.ts |
| `src/main.ts` | ts | no |  | src/app.module.ts, src/common/infra/logging.interceptor.ts, src/config/app-config.ts, src/common/infra/database-http-exception.filter.ts, src/common/infra/request-id.middleware.ts, src/common/infra/ap |
| `src/majors/majors.controller.ts` | ts | no | MajorsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/majors/major.controller.ts, src/majors/majors.service.ts |
| `src/majors/majors.module.ts` | ts | no | MajorsModule | src/majors/majors.controller.ts, src/majors/majors.service.ts |
| `src/majors/majors.service.spec.ts` | ts | no |  | src/majors/majors.service.ts |
| `src/majors/majors.service.ts` | ts | no | MajorsService | src/common/admin/filter-configs.ts, src/entities/major.entity.ts, src/common/module-bases/majors/major.service.ts |
| `src/messages/conversations.controller.ts` | ts | no | ConversationsController | src/common, src/socket/socket.gateway.ts, src/entities/message.entity.ts, src/config/constants.ts, src/config/permissions.ts |
| `src/messages/messages.controller.ts` | ts | no | MessagesController | src/common, src/socket/socket.gateway.ts, src/entities/message.entity.ts, src/entities/message-read.entity.ts, src/entities/group-member.entity.ts, src/entities/group.entity.ts, src/entities/user.enti |
| `src/messages/messages.module.ts` | ts | no | MessagesModule | src/socket/socket.module.ts, src/messages/messages.controller.ts, src/messages/conversations.controller.ts |
| `src/migrations/Migration20260605120000_standardize_legacy_table_names.ts` | ts | no | Migration20260605120000_standardize_legacy_table_names |  |
| `src/migrations/Migration20260608120000_add_storage_files.ts` | ts | no | Migration20260608120000_add_storage_files |  |
| `src/migrations/Migration20260609120000_add_products_orders.ts` | ts | no | Migration20260609120000_add_products_orders |  |
| `src/migrations/Migration20260610120000_add_order_gifts.ts` | ts | no | Migration20260610120000_add_order_gifts |  |
| `src/migrations/Migration20260610140000_add_customer_carts.ts` | ts | no | Migration20260610140000_add_customer_carts |  |
| `src/migrations/Migration20260611120000_add_promo_codes.ts` | ts | no | Migration20260611120000_add_promo_codes |  |
| `src/mikro-orm/mikro-orm.module.ts` | ts | no | createMikroConfig, DatabaseModule | src/mikro-orm/orm-entities.ts |
| `src/mikro-orm/orm-entities.ts` | ts | no | ormEntities | src/entities/academic-year.entity.ts, src/entities/account.entity.ts, src/entities/admission-result.entity.ts, src/entities/camera.entity.ts, src/entities/category.entity.ts, src/entities/comment.enti |
| `src/notifications/notifications.controller.ts` | ts | no | NotificationsController | src/common, src/notifications/notifications.service.ts, src/config/permissions.ts, src/config/constants.ts |
| `src/notifications/notifications.module.ts` | ts | no | NotificationsModule | src/socket/socket.module.ts, src/notifications/notifications.service.ts, src/notifications/notifications.controller.ts |
| `src/notifications/notifications.service.spec.ts` | ts | no |  | src/notifications/notifications.service.ts, src/socket/socket.gateway.ts, src/entities/notification.entity.ts |
| `src/notifications/notifications.service.ts` | ts | no | NotificationsService | src/entities/notification.entity.ts, src/entities/user.entity.ts, src/entities/user-role.entity.ts, src/entities/message.entity.ts, src/entities/contact-request.entity.ts, src/socket/socket.gateway.ts |
| `src/orders/order-checkout.spec.ts` | ts | no |  | src/orders/order-checkout.ts, src/entities/product.entity.ts |
| `src/orders/order-checkout.ts` | ts | no | mergeCreateOrderLines, buildOrderItemsFromProducts, buildOrderNumber | src/common/module-bases/orders/order-checkout.ts |
| `src/orders/orders.controller.ts` | ts | no | OrdersController | src/orders/orders.service.ts, src/common/api-response.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/config/permissions.ts, src/common/parse-list-query.ts, src/common/parse-colu |
| `src/orders/orders.module.ts` | ts | no | OrdersModule | src/products/products.module.ts, src/promo-codes/promo-codes.module.ts, src/uploads/uploads.module.ts, src/orders/orders.service.ts, src/orders/orders.controller.ts, src/orders/public-orders.controlle |
| `src/orders/orders.service.spec.ts` | ts | no |  | src/orders/orders.service.ts, src/products/products.service.ts, src/promo-codes/promo-codes.service.ts, src/uploads/uploads.service.ts |
| `src/orders/orders.service.ts` | ts | no | OrdersService, mergeCreateOrderLines, buildOrderItemsFromProducts, buildOrderNumber | src/entities/order.entity.ts, src/entities/user.entity.ts, src/products/products.service.ts, src/promo-codes/promo-codes.service.ts, src/uploads/uploads.service.ts, src/common/module-bases/orders/orde |
| `src/orders/public-orders.controller.ts` | ts | no | PublicOrdersController | src/orders/orders.service.ts, src/common, src/config/constants.ts |
| `src/page-contents/page-contents.controller.ts` | ts | no | PageContentsController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/page-contents/page-contents.controller.ts, src/page-contents/page-contents.service.ts |
| `src/page-contents/page-contents.module.ts` | ts | no | PageContentsModule | src/page-contents/page-contents.service.ts, src/page-contents/page-contents.controller.ts, src/notifications/notifications.module.ts, src/auth/auth.module.ts |
| `src/page-contents/page-contents.service.spec.ts` | ts | no |  | src/page-contents/page-contents.service.ts |
| `src/page-contents/page-contents.service.ts` | ts | no | PageContentsService | src/entities/page-content.entity.ts, src/common/module-bases/page-contents/page-contents.service.ts |
| `src/parent-students/parent-students.controller.ts` | ts | no | ParentStudentsPublicController, ParentStudentsAdminController | src/common, src/parent-students/parent-students.service.ts, src/config/constants.ts, src/config/permissions.ts |
| `src/parent-students/parent-students.module.ts` | ts | no | ParentStudentsModule | src/parent-students/parent-students.service.ts, src/parent-students/parent-students.controller.ts, src/socket/socket.module.ts |
| `src/parent-students/parent-students.service.spec.ts` | ts | no |  | src/common/admin/realtime/broadcast.service.ts, src/parent-students/parent-students.service.ts |
| `src/parent-students/parent-students.service.ts` | ts | no | ParentStudentRowDto, ParentStudentsService | src/common/admin/realtime/broadcast.service.ts, src/entities/parent-student.entity.ts, src/entities/user.entity.ts, src/common/module-bases/parent-students/parent-student.service.ts |
| `src/posts/posts.controller.ts` | ts | no | PostsController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/posts/posts.controller.ts, src/posts/posts.service.ts |
| `src/posts/posts.module.ts` | ts | no | PostsModule | src/notifications/notifications.module.ts, src/posts/posts.service.ts, src/posts/posts.controller.ts |
| `src/posts/posts.service.spec.ts` | ts | no |  | src/posts/posts.service.ts |
| `src/posts/posts.service.ts` | ts | no | PostsService | src/entities/post.entity.ts, src/entities/category.entity.ts, src/entities/tag.entity.ts, src/entities/post-category.entity.ts, src/entities/post-tag.entity.ts, src/entities/user.entity.ts, src/common |
| `src/products/products.controller.ts` | ts | no | ProductsController | src/products/products.service.ts, src/common, src/config/constants.ts, src/config/permissions.ts |
| `src/products/products.module.ts` | ts | no | ProductsModule | src/products/products.service.ts, src/products/products.controller.ts, src/products/public-products.controller.ts |
| `src/products/products.service.spec.ts` | ts | no |  | src/products/products.service.ts |
| `src/products/products.service.ts` | ts | no | ProductsService | src/entities/product.entity.ts, src/common/module-bases/products/product.service.ts, src/common/entity-id.ts |
| `src/products/public-products.controller.ts` | ts | no | PublicProductsController | src/products/products.service.ts, src/common, src/config/constants.ts |
| `src/promo-codes/promo-codes.controller.ts` | ts | no | PromoCodesController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/promo-codes/promo-code.controller.ts, src/promo-codes/promo-codes.service.ts |
| `src/promo-codes/promo-codes.module.ts` | ts | no | PromoCodesModule | src/promo-codes/promo-codes.service.ts, src/promo-codes/promo-codes.controller.ts, src/promo-codes/public-promo-codes.controller.ts |
| `src/promo-codes/promo-codes.service.spec.ts` | ts | no |  | src/promo-codes/promo-codes.service.ts |
| `src/promo-codes/promo-codes.service.ts` | ts | no | PromoCodesService | src/common/entity-id.ts, src/entities/promo-code.entity.ts, src/common/commerce/promo-checkout.ts, src/common/module-bases/promo-codes/promo-code.service.ts |
| `src/promo-codes/public-promo-codes.controller.ts` | ts | no | PublicPromoCodesController | src/promo-codes/promo-codes.service.ts, src/common, src/config/constants.ts |
| `src/proxy-image/proxy-image.controller.ts` | ts | no | ProxyImageController | src/config/constants.ts, src/common |
| `src/proxy-image/proxy-image.module.ts` | ts | no | ProxyImageModule | src/proxy-image/proxy-image.controller.ts |
| `src/public/event-student-email.ts` | ts | no | EVENT_STUDENT_EMAIL_SUFFIX, EVENT_STUDENT_EMAIL_ERROR, isEventStudentSchoolEmail |  |
| `src/public/public-auth.service.ts` | ts | no | CreatePublicRegisterDto, PublicAuthService | src/common, src/entities/role.entity.ts, src/entities/setting.entity.ts, src/entities/user.entity.ts, src/auth/auth.service.ts, src/users/users.service.ts, src/config/constants.ts |
| `src/public/public-categories.service.spec.ts` | ts | no |  | src/public/public-categories.service.ts |
| `src/public/public-categories.service.ts` | ts | no | PublicCategoryItem, PublicCategoriesService | src/entities/category.entity.ts |
| `src/public/public-contact-requests.service.ts` | ts | no | CreateContactRequestDto, PublicContactRequestsService | src/entities/contact-request.entity.ts, src/common/admin/realtime/broadcast.service.ts, src/config/constants.ts |
| `src/public/public-event-categories.service.ts` | ts | no | PublicEventCategoryItem, PublicEventCategoriesService | src/entities/category.entity.ts |
| `src/public/public-event-registration.service.ts` | ts | no | RegisterForEventResult, MyRegisteredEventItem, PublicEventRegistrationService | src/common, src/entities/event.entity.ts, src/entities/user.entity.ts, src/entities/event-registration.entity.ts, src/event-registrations/event-registrations.service.ts |
| `src/public/public-events.service.ts` | ts | no | EventTimeFilter, PublicEventsQuery, PublicEventItem, PublicViewerRegistration, PublicEventSpeaker, PublicEventRegistrant, PublicEventDetail, PublicEventsService | src/common, src/entities/event.entity.ts, src/entities/user.entity.ts, src/event-registrations/event-registrations.service.ts, src/event-speakers/event-speakers.service.ts |
| `src/public/public-posts.service.ts` | ts | no | PublicPostsQuery, PublicPostsService | src/common, src/entities/post.entity.ts, src/entities/category.entity.ts, src/entities/tag.entity.ts, src/entities/setting.entity.ts |
| `src/public/public.module.ts` | ts | no | PublicModule | src/socket/socket.module.ts, src/public/public.controller.ts, src/public/public-posts.service.ts, src/public/public-categories.service.ts, src/public/public-contact-requests.service.ts, src/public/pub |
| `src/roles/roles.controller.ts` | ts | no | RolesController | src/common, src/roles/roles.service.ts, src/socket/socket.gateway.ts, src/notifications/notifications.service.ts, src/entities/notification.entity.ts, src/config/constants.ts, src/config/permissions.t |
| `src/roles/roles.module.ts` | ts | no | RolesModule | src/notifications/notifications.module.ts, src/socket/socket.module.ts, src/roles/roles.controller.ts, src/roles/roles.service.ts |
| `src/roles/roles.service.spec.ts` | ts | no |  | src/roles/roles.service.ts, src/entities/role.entity.ts |
| `src/roles/roles.service.ts` | ts | no | RoleRowDto, RolesService | src/config/protected-admin.ts, src/entities/role.entity.ts, src/entities/user.entity.ts, src/common/module-bases/roles/role.service.ts |
| `src/screens/screens.controller.ts` | ts | no | ScreensController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/screens/screen.controller.ts, src/screens/screens.service.ts |
| `src/screens/screens.module.ts` | ts | no | ScreensModule | src/screens/screens.controller.ts, src/screens/screens.service.ts |
| `src/screens/screens.service.spec.ts` | ts | no |  | src/screens/screens.service.ts |
| `src/screens/screens.service.ts` | ts | no | ScreensService | src/common/admin/filter-configs.ts, src/entities/screen.entity.ts, src/common/module-bases/screens/screen.service.ts |
| `src/scripts/mark-migrations-executed.ts` | ts | no |  | src/mikro-orm/mikro-orm.module.ts |
| `src/seed-demo.ts` | ts | no |  | src/mikro-orm/orm-entities.ts, src/seeds/checkin-demo.runner.ts |
| `src/seed-guides.ts` | ts | no |  | src/entities/page-content.entity.ts |
| `src/seed-superadmin.ts` | ts | no |  | src/entities/user.entity.ts, src/entities/role.entity.ts, src/entities/user-role.entity.ts, src/entities/page-content.entity.ts, src/seeds/superadmin-bootstrap.runner.ts |
| `src/seeders/DatabaseSeeder.ts` | ts | no | DatabaseSeeder | src/seeds/superadmin-bootstrap.runner.ts, src/seeds/orders-sample.runner.ts, src/seeds/products-sample.runner.ts, src/seeds/promo-codes-sample.runner.ts |
| `src/seeds/checkin-demo.runner.ts` | ts | no | CheckinDemoSeedOptions, CheckinDemoSeedResult | src/entities/event.entity.ts, src/entities/event-registration.entity.ts, src/entities/user.entity.ts, src/seeds/superadmin-bootstrap.runner.ts, src/seeds/load-export-posts.ts, src/common/data-paths.ts |
| `src/seeds/lexical-plain-text.ts` | ts | no | LexicalEditorState, lexicalFromPlainText, isLexicalContentEmpty, isLexicalEditorState |  |
| `src/seeds/load-export-posts.ts` | ts | no | ExportPostSeedSource, loadExportPosts |  |
| `src/seeds/orders-sample.runner.ts` | ts | no |  | src/common/commerce/gift-rules.ts, src/entities/order.entity.ts, src/entities/product.entity.ts, src/entities/user.entity.ts, src/orders/order-checkout.ts, src/seeds/storesync-sample.data.ts |
| `src/seeds/products-sample.runner.ts` | ts | no |  | src/entities/product.entity.ts, src/seeds/storesync-sample.data.ts |
| `src/seeds/promo-codes-sample.runner.ts` | ts | no |  | src/entities/promo-code.entity.ts |
| `src/seeds/storesync-sample.data.ts` | ts | no | STORESYNC_SAMPLE_PRODUCTS, StoreSyncOrderLineSeed, StoreSyncOrderSeed, STORESYNC_SAMPLE_ORDERS | src/entities/order.entity.ts, src/entities/product.entity.ts |
| `src/seeds/superadmin-bootstrap.data.ts` | ts | no | DEV_LOGIN_PASSWORD_PLAIN, DEV_LOGIN_PASSWORD_HASH, SUPERADMIN_ROLES_DATA, SUPERADMIN_USERS_DATA, SUPERADMIN_USER_ROLES_DATA, EVENT_CHECKIN_STAFF_PERMISSIONS, EVENT_STAFF_ROLE_TEMPLATE | src/config/role-templates/event-staff.template.ts |
| `src/seeds/superadmin-bootstrap.runner.ts` | ts | no | SuperadminBootstrapResult | src/entities/user.entity.ts, src/entities/role.entity.ts, src/entities/user-role.entity.ts, src/entities/page-content.entity.ts, src/seeds/superadmin-bootstrap.data.ts |
| `src/seo-metas/seo-metas.controller.ts` | ts | no | SeoMetasController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/seo-metas/seo-meta.controller.ts, src/seo-metas/seo-metas.service.ts |
| `src/seo-metas/seo-metas.module.ts` | ts | no | SeoMetasModule | src/seo-metas/seo-metas.controller.ts, src/seo-metas/seo-metas.service.ts |
| `src/seo-metas/seo-metas.service.spec.ts` | ts | no |  | src/seo-metas/seo-metas.service.ts |
| `src/seo-metas/seo-metas.service.ts` | ts | no | SeoMetasService | src/common/admin/filter-configs.ts, src/entities/seo-meta.entity.ts, src/common/module-bases/seo-metas/seo-meta.service.ts |
| `src/sessions/sessions.controller.ts` | ts | no | SessionsController | src/notifications/notifications.service.ts, src/socket/socket.gateway.ts, src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/sessions/sess |
| `src/sessions/sessions.module.ts` | ts | no | SessionsModule | src/notifications/notifications.module.ts, src/socket/socket.module.ts, src/sessions/sessions.service.ts, src/sessions/sessions.controller.ts |
| `src/sessions/sessions.service.spec.ts` | ts | no |  | src/sessions/sessions.service.ts |
| `src/sessions/sessions.service.ts` | ts | no | SessionsService | src/entities/session.entity.ts, src/entities/user.entity.ts, src/entities/user-role.entity.ts, src/entities/role.entity.ts, src/config/constants.ts, src/common/module-bases/sessions/sessions.service.t |
| `src/settings/settings.controller.ts` | ts | no | SettingsController | src/settings/settings.service.ts, src/common, src/config/constants.ts, src/config/permissions.ts |
| `src/settings/settings.module.ts` | ts | no | SettingsModule | src/settings/settings.controller.ts, src/settings/settings.service.ts |
| `src/settings/settings.service.spec.ts` | ts | no |  | src/settings/settings.service.ts, src/entities/setting.entity.ts |
| `src/settings/settings.service.ts` | ts | no | SettingsService | src/entities/setting.entity.ts, src/common/app/parse-setting-value.ts, src/common/module-bases/settings/setting.service.ts |
| `src/socket/notification-mapper.ts` | ts | no | NotificationLike, mapNotificationToPayload | src/socket/socket.types.ts |
| `src/socket/socket.gateway.ts` | ts | no | SocketGateway | src/common, src/sessions/sessions.service.ts, src/entities/notification.entity.ts, src/entities/user.entity.ts, src/socket/socket.types.ts, src/config/app-config.ts, src/socket/notification-mapper.ts |
| `src/socket/socket.module.ts` | ts | no | SocketModule | src/common/admin/realtime/interceptor.ts, src/common/admin/realtime/broadcast.service.ts, src/socket/socket.gateway.ts, src/sessions/sessions.module.ts |
| `src/socket/socket.types.ts` | ts | no | SocketNotificationKind, SocketNotificationPayload, SocketData, SessionRowDto, MAX_HTTP_BUFFER_SIZE, SOCKET_PATH, userRoom, conversationRoom, sessionRoom, roleRoom, eventRoom, EventAttendanceSocketPayl |  |
| `src/speakers/speakers.controller.ts` | ts | no | SpeakersController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/speakers/speaker.controller.ts, src/speakers/speakers.service.ts |
| `src/speakers/speakers.module.ts` | ts | no | SpeakersModule | src/speakers/speakers.controller.ts, src/speakers/speakers.service.ts |
| `src/speakers/speakers.service.spec.ts` | ts | no |  | src/speakers/speakers.service.ts |
| `src/speakers/speakers.service.ts` | ts | no | SpeakersService | src/common/admin/filter-configs.ts, src/entities/speaker.entity.ts, src/common/module-bases/speakers/speaker.service.ts |
| `src/students/students.controller.ts` | ts | no | StudentsController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/students/student.controller.ts, src/students/students.service.ts |
| `src/students/students.module.ts` | ts | no | StudentsModule | src/notifications/notifications.module.ts, src/students/students.controller.ts, src/students/students.service.ts |
| `src/students/students.service.spec.ts` | ts | no |  | src/students/students.service.ts |
| `src/students/students.service.ts` | ts | no | StudentsService | src/entities/user.entity.ts, src/common/module-bases/students/student.service.ts |
| `src/system/system.controller.ts` | ts | no | ISystemMaintenanceAuth, ISystemControllerService, SystemController | src/auth/auth.service.ts, src/system/system.service.ts, src/common, src/config/constants.ts, src/config/permissions.ts, src/common/module-bases/system/system-maintenance.ts |
| `src/system/system.module.ts` | ts | no | SystemModule | src/system/system.controller.ts, src/system/system.service.ts, src/auth/auth.module.ts |
| `src/system/system.service.spec.ts` | ts | no |  | src/system/system.service.ts |
| `src/system/system.service.ts` | ts | no | SystemService | src/common/module-bases/system/system.service.ts, src/mikro-orm/orm-entities.ts, src/seeds/superadmin-bootstrap.runner.ts |
| `src/tags/tags.controller.ts` | ts | no | TagsController | src/config/constants.ts, src/config/permissions.ts, src/common/permissions.decorator.ts, src/common/module-bases/tags/tag.controller.ts, src/tags/tags.service.ts |
| `src/tags/tags.module.ts` | ts | no | TagsModule | src/notifications/notifications.module.ts, src/tags/tags.controller.ts, src/tags/tags.service.ts |
| `src/tags/tags.service.spec.ts` | ts | no |  | src/tags/tags.service.ts |
| `src/tags/tags.service.ts` | ts | no | TagsService | src/entities/tag.entity.ts, src/common/module-bases/tags/tag.service.ts |
| `src/templates/templates.controller.ts` | ts | no | TemplatesController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/templates/template.controller.ts, src/templates/templates.service.ts |
| `src/templates/templates.module.ts` | ts | no | TemplatesModule | src/templates/templates.controller.ts, src/templates/templates.service.ts |
| `src/templates/templates.service.spec.ts` | ts | no |  | src/templates/templates.service.ts |
| `src/templates/templates.service.ts` | ts | no | TemplatesService | src/common/admin/filter-configs.ts, src/entities/template.entity.ts, src/common/module-bases/templates/template.service.ts |
| `src/training-levels/training-levels.controller.ts` | ts | no | TrainingLevelsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/training-levels/training-level.controller.ts, src/training-levels/training-levels.servi |
| `src/training-levels/training-levels.module.ts` | ts | no | TrainingLevelsModule | src/training-levels/training-levels.controller.ts, src/training-levels/training-levels.service.ts |
| `src/training-levels/training-levels.service.spec.ts` | ts | no |  | src/training-levels/training-levels.service.ts |
| `src/training-levels/training-levels.service.ts` | ts | no | TrainingLevelsService | src/common/admin/filter-configs.ts, src/entities/training-level.entity.ts, src/common/module-bases/training-levels/training-level.service.ts |
| `src/training-systems/training-systems.controller.ts` | ts | no | TrainingSystemsController | src/config/permissions.ts, src/config/constants.ts, src/common/permissions.decorator.ts, src/common/module-bases/training-systems/training-system.controller.ts, src/training-systems/training-systems.s |
| `src/training-systems/training-systems.module.ts` | ts | no | TrainingSystemsModule | src/training-systems/training-systems.controller.ts, src/training-systems/training-systems.service.ts |
| `src/training-systems/training-systems.service.spec.ts` | ts | no |  | src/training-systems/training-systems.service.ts |
| `src/training-systems/training-systems.service.ts` | ts | no | TrainingSystemsService | src/common/admin/filter-configs.ts, src/entities/training-system.entity.ts, src/common/module-bases/training-systems/training-system.service.ts |
| `src/uploads/folder-navigation.spec.ts` | ts | no |  | src/uploads/folder-navigation.ts |
| `src/uploads/folder-navigation.ts` | ts | no | StorageTabDto, normalizeParentFolderPath, parentFolderPrefixes, fileUnderFolderPath, extractImmediateChildFolder, extractImmediateChildFromDiskFolder, fileDirectlyInFolderPath, matchesStorageFolderPat | src/uploads/storage-media.ts, src/uploads/storage-folder-labels.ts |
| `src/uploads/folder-reorganize.spec.ts` | ts | no |  | src/uploads/folder-reorganize.ts |
| `src/uploads/folder-reorganize.ts` | ts | no | FlattenDatePathResult, isYearSegment, isMonthSegment, isDaySegment, countTrailingDateSegments, flattenDateStoragePath, isUnderReorganizeScope, uniqueFlattenTargetPath, collectDateFolderCleanupPaths |  |
| `src/uploads/order-image-snapshot.spec.ts` | ts | no |  | src/uploads/order-image-snapshot.ts |
| `src/uploads/order-image-snapshot.ts` | ts | no | sanitizeOrderFolderSegment, extractStorageRelativePathFromAssetRef, buildOrderSnapshotFolderRelativePath, buildOrderSnapshotFileName, buildOrderSnapshotRelativePath, OrderLineSnapshotInput, OrderLineS |  |
| `src/uploads/public-uploads.controller.ts` | ts | no | PublicUploadsController | src/uploads/uploads.service.ts, src/config/constants.ts, src/common |
| `src/uploads/storage-folder-labels.spec.ts` | ts | no |  | src/uploads/storage-folder-labels.ts |
| `src/uploads/storage-folder-labels.ts` | ts | no | StorageFolderLabelLookup, buildStorageFolderLabelLookup, resolveStorageFolderDisplayLabel | src/uploads/storage-media.ts |
| `src/uploads/storage-folder-name.spec.ts` | ts | no |  | src/uploads/storage-folder-name.ts |
| `src/uploads/storage-folder-name.ts` | ts | no | slugifyStorageFolderSegment, sanitizeStorageFolderSegment, resolveStorageFolderSegment, resolveStorageFolderSlugPath, sanitizeStorageFolderName |  |
| `src/uploads/storage-media.spec.ts` | ts | no |  | src/uploads/storage-media.ts |
| `src/uploads/storage-media.ts` | ts | no | StorageMediaKind, StorageRealm, StorageTabDto, classifyStorageMedia, isVideoStorageFile, isAudioStorageFile, getStorageRealm, folderBelongsToRealm, getFolderTabIdFromDiskPath, parentStoragePrefixes, f | src/common, src/uploads/storage-folder-labels.ts |
| `src/uploads/storage-path-resolver.spec.ts` | ts | no |  | src/uploads/storage-path-resolver.ts |
| `src/uploads/storage-path-resolver.ts` | ts | no | StorageRealmDir, StoragePathRoots, stripStorageFolderPath, resolveCreateFolderTarget, resolveStorageRelativePath |  |
| `src/uploads/storage-protected-paths.spec.ts` | ts | no |  | src/uploads/storage-protected-paths.ts |
| `src/uploads/storage-protected-paths.ts` | ts | no | ORDER_SNAPSHOT_IMAGES_PREFIX, isProtectedStorageRelativePath, assertStoragePathMutable |  |
| `src/uploads/storage-upload-policy.spec.ts` | ts | no |  | src/uploads/storage-upload-policy.ts |
| `src/uploads/storage-upload-policy.ts` | ts | no | STORAGE_POLICY_FILENAME, StorageExtensionGroupId, StorageExtensionGroup, STORAGE_EXTENSION_GROUPS, REALM_EXTENSION_GROUP_IDS, StorageFolderPolicy, normalizeExtension, normalizeExtensions, getRealmDefa | src/uploads/storage-media.ts |
| `src/uploads/upload-filename.spec.ts` | ts | no |  | src/uploads/upload-filename.ts |
| `src/uploads/upload-filename.ts` | ts | no | sanitizeUploadUserId, buildStoredUploadFileName, extractUploadOwnerIdFromFileName, resolveImageFileOwnerId, storedUploadFilePrefix |  |
| `src/uploads/uploads.controller.ts` | ts | no | UploadsController | src/uploads/uploads.service.ts, src/common, src/config/app-config.ts, src/config/permissions.ts, src/config/constants.ts |
| `src/uploads/uploads.module.ts` | ts | no | UploadsModule | src/uploads/uploads.service.ts, src/uploads/uploads.controller.ts, src/uploads/public-uploads.controller.ts |
| `src/uploads/uploads.service.spec.ts` | ts | no |  | src/uploads/uploads.service.ts |
| `src/uploads/zip-path-mapper.spec.ts` | ts | no |  | src/uploads/zip-path-mapper.ts |
| `src/uploads/zip-path-mapper.ts` | ts | no | normalizeZipEntryPath, mapZipPathToStoragePath |  |
| `src/users/users.controller.ts` | ts | no | UsersController | src/config/constants.ts, src/common, src/config/permissions.ts, src/common/module-bases/users/users.controller.ts, src/users/users.service.ts |
| `src/users/users.module.ts` | ts | no | UsersModule | src/notifications/notifications.module.ts, src/socket/socket.module.ts, src/sessions/sessions.module.ts, src/users/users.service.ts, src/users/users.controller.ts |
| `src/users/users.service.spec.ts` | ts | no |  | src/users/users.service.ts |
| `src/users/users.service.ts` | ts | no | ListUsersResult, DevLoginOptionDto, DevLoginRoleDto, UsersService, ADMIN_TABLE_EXPORT_MAX_LIMIT | src/entities/user.entity.ts, src/entities/role.entity.ts, src/entities/user-role.entity.ts, src/entities/setting.entity.ts, src/common/module-bases/users/users.service.ts, src/common/module-types |
| `tsconfig.json` | config | — | — | — |
## File Markdown trong scope app

Toàn bộ `.md` sinh tự động nằm trong **`apps/hub-parent/api/.graphify/markdown/`**; JSON trong **`../snapshot/`** — xem mục **Mục lục artefact Graphify** ở đầu file.

- **Chỉ mục monorepo + chủ đề:** [`../../../../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md).

## Làm mới

- Cập nhật `snapshot/context.json` **và** `snapshot/graph.json`: `node script-system/graphify/graphify-update.cjs apps/hub-parent/api`.
- Sau đó chạy: `pnpm graphify:ai-summary` (sinh thêm `FOLDER_TREE.md`, `GRAPH_STATS.md`, `API_DOMAIN_IMPORTS.md` khi có graph).
