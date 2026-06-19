# Điểm vào (entry) — packages/api-server (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.825Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 42 file

- `src/modules/academic-years/academic-year.module.ts`
- `src/modules/accounts/accounts.module.ts`
- `src/modules/admission-results/admission-result.module.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/cameras/cameras.module.ts`
- `src/modules/carts/carts.module.ts`
- `src/modules/categories/categories.module.ts`
- `src/modules/comments/comments.module.ts`
- `src/modules/contact-requests/contact-request.module.ts`
- `src/modules/courses/courses.module.ts`
- `src/modules/dashboard/dashboard.module.ts`
- `src/modules/departments/departments.module.ts`
- `src/modules/event-checkins/event-checkins.module.ts`
- `src/modules/event-checkouts/event-checkout.module.ts`
- `src/modules/event-registrations/event-registrations.module.ts`
- `src/modules/event-speakers/event-speakers.module.ts`
- `src/modules/events/events.module.ts`
- `src/modules/face-data/face-data.module.ts`
- `src/modules/groups/groups.module.ts`
- `src/modules/imported-users/imported-user.module.ts`
- `src/modules/locations/locations.module.ts`
- `src/modules/majors/majors.module.ts`
- `src/modules/notifications/notifications.module.ts`
- `src/modules/orders/orders.module.ts`
- `src/modules/page-contents/page-contents.module.ts`
- `src/modules/parent-students/parent-student.module.ts`
- `src/modules/posts/posts.module.ts`
- `src/modules/products/products.module.ts`
- `src/modules/promo-codes/promo-code.module.ts`
- `src/modules/roles/roles.module.ts`
- `src/modules/screens/screens.module.ts`
- `src/modules/seo-metas/seo-meta.module.ts`
- `src/modules/sessions/sessions.module.ts`
- `src/modules/settings/settings.module.ts`
- `src/modules/speakers/speakers.module.ts`
- `src/modules/students/students.module.ts`
- `src/modules/system/system.module.ts`
- `src/modules/tags/tags.module.ts`
- `src/modules/templates/templates.module.ts`
- `src/modules/training-levels/training-level.module.ts`
- … và 2 file khác (xem `FOLDER_TREE.md`)

## Controllers (`*.controller.ts`) — 48 file

- `src/bases/base-admin-crud.controller.ts`
- `src/bases/base-admin-http.controller.ts`
- `src/bases/base-crud.controller.ts`
- `src/modules/academic-years/academic-year.controller.ts`
- `src/modules/accounts/accounts.controller.ts`
- `src/modules/admission-results/admission-result.controller.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/public-auth.controller.ts`
- `src/modules/cameras/camera.controller.ts`
- `src/modules/carts/carts.controller.ts`
- `src/modules/categories/categories.controller.ts`
- `src/modules/comments/comments.controller.ts`
- `src/modules/contact-requests/contact-request.controller.ts`
- `src/modules/contact-requests/public-contact-requests.controller.ts`
- `src/modules/courses/course.controller.ts`
- `src/modules/dashboard/dashboard.controller.ts`
- `src/modules/departments/department.controller.ts`
- `src/modules/event-checkins/event-checkins.controller.ts`
- `src/modules/event-checkouts/event-checkout.controller.ts`
- `src/modules/event-registrations/event-registrations.controller.ts`
- `src/modules/event-speakers/event-speakers.controller.ts`
- `src/modules/events/events.controller.ts`
- `src/modules/face-data/face-data.controller.ts`
- `src/modules/groups/group.controller.ts`
- `src/modules/imported-users/imported-user.controller.ts`
- `src/modules/locations/location.controller.ts`
- `src/modules/majors/major.controller.ts`
- `src/modules/notifications/notifications.controller.ts`
- `src/modules/orders/order.controller.ts`
- `src/modules/page-contents/page-contents.controller.ts`
- … và 18 controller khác

## AUTO-GENERATED (không sửa tay) — 0 file

- (không phát hiện marker `AUTO-GENERATED` trong header file)

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/api-server` → `pnpm graphify:ai-summary`.
