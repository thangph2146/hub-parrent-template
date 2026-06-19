# Điểm vào (entry) — apps/hub-checkin/api (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.558Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- `src/app.module.ts`
- `src/main.ts`

## Nest modules (`*.module.ts`) — 91 file

- `src/academic-years/academic-years.module.ts`
- `src/accounts/accounts.module.ts`
- `src/admission-results/admission-results.module.ts`
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
- … và 51 file khác (xem `FOLDER_TREE.md`)

## Controllers (`*.controller.ts`) — 101 file

- `src/academic-years/academic-years.controller.ts`
- `src/accounts/accounts.controller.ts`
- `src/admission-results/admission-results.controller.ts`
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
- … và 71 controller khác

## AUTO-GENERATED (không sửa tay) — 464 file

Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`).

- `src/academic-years/academic-years.controller.ts`
- `src/academic-years/academic-years.module.ts`
- `src/academic-years/academic-years.service.spec.ts`
- `src/academic-years/academic-years.service.ts`
- `src/accounts/accounts.controller.ts`
- `src/accounts/accounts.module.ts`
- `src/accounts/accounts.service.spec.ts`
- `src/accounts/accounts.service.ts`
- `src/admission-results/admission-results.controller.ts`
- `src/admission-results/admission-results.module.ts`
- `src/admission-results/admission-results.service.spec.ts`
- `src/admission-results/admission-results.service.ts`
- `src/app.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.module.ts`
- `src/auth/auth.service.spec.ts`
- `src/auth/auth.service.ts`
- `src/cameras/cameras.controller.ts`
- `src/cameras/cameras.module.ts`
- `src/cameras/cameras.service.spec.ts`
- `src/cameras/cameras.service.ts`
- `src/categories/categories.controller.ts`
- `src/categories/categories.module.ts`
- `src/categories/categories.service.spec.ts`
- `src/categories/categories.service.ts`
- `src/comments/comments.controller.ts`
- `src/comments/comments.module.ts`
- `src/comments/comments.service.spec.ts`
- `src/comments/comments.service.ts`
- `src/common/admin-realtime-broadcast.service.ts`
- `src/common/admin-realtime.interceptor.ts`
- `src/common/admin-realtime.util.ts`
- `src/common/admin/filter-configs.ts`
- `src/common/admin/index.ts`
- `src/common/admin/realtime/broadcast.service.ts`
- … và 429 file khác

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-checkin/api` → `pnpm graphify:ai-summary`.
