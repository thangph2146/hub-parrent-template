# Điểm vào (entry) — packages/api-server (Graphify)

> **Sinh tự động:** `2026-06-12T14:20:21.405Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 73 file

- `src/modules/academic-years/academic-year.module.ts`
- `src/modules/accounts/account.module.ts`
- `src/modules/accounts/accounts.module.ts`
- `src/modules/admission-results/admission-result.module.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/cameras/camera.module.ts`
- `src/modules/cameras/cameras.module.ts`
- `src/modules/carts/carts.module.ts`
- `src/modules/categories/categories.module.ts`
- `src/modules/comments/comments.module.ts`
- `src/modules/contact-requests/contact-request.module.ts`
- `src/modules/courses/course.module.ts`
- `src/modules/courses/courses.module.ts`
- `src/modules/customer-carts/customer-cart.module.ts`
- `src/modules/dashboard/dashboard.module.ts`
- `src/modules/departments/department.module.ts`
- `src/modules/departments/departments.module.ts`
- `src/modules/event-checkins/event-checkin.module.ts`
- `src/modules/event-checkouts/event-checkout.module.ts`
- `src/modules/event-registrations/event-registration.module.ts`
- `src/modules/event-speakers/event-speaker.module.ts`
- `src/modules/events/event.module.ts`
- `src/modules/events/events.module.ts`
- `src/modules/face-data/face-data.module.ts`
- `src/modules/group-members/group-member.module.ts`
- `src/modules/groups/group.module.ts`
- `src/modules/groups/groups.module.ts`
- `src/modules/imported-users/imported-user.module.ts`
- `src/modules/locations/location.module.ts`
- `src/modules/locations/locations.module.ts`
- `src/modules/majors/major.module.ts`
- `src/modules/majors/majors.module.ts`
- `src/modules/message-reads/message-read.module.ts`
- `src/modules/messages/message.module.ts`
- `src/modules/messages/messages.module.ts`
- `src/modules/notifications/notification.module.ts`
- `src/modules/notifications/notifications.module.ts`
- `src/modules/orders/order.module.ts`
- `src/modules/orders/orders.module.ts`
- `src/modules/page-contents/page-content.module.ts`
- … và 33 file khác (xem `FOLDER_TREE.md`)

## Controllers (`*.controller.ts`) — 58 file

- `src/bases/base-crud.controller.ts`
- `src/modules/academic-years/academic-year.controller.ts`
- `src/modules/accounts/account.controller.ts`
- `src/modules/admission-results/admission-result.controller.ts`
- `src/modules/auth/auth-admin.controller.ts`
- `src/modules/auth/public-auth.controller.ts`
- `src/modules/cameras/camera.controller.ts`
- `src/modules/carts/carts.controller.ts`
- `src/modules/categories/categories.controller.ts`
- `src/modules/comments/comments.controller.ts`
- `src/modules/contact-requests/contact-request.controller.ts`
- `src/modules/contact-requests/public-contact-requests.controller.ts`
- `src/modules/courses/course.controller.ts`
- `src/modules/customer-carts/customer-cart.controller.ts`
- `src/modules/dashboard/dashboard.controller.ts`
- `src/modules/departments/department.controller.ts`
- `src/modules/event-checkins/event-checkin.controller.ts`
- `src/modules/event-checkouts/event-checkout.controller.ts`
- `src/modules/event-registrations/event-registration.controller.ts`
- `src/modules/event-speakers/event-speaker.controller.ts`
- `src/modules/events/event.controller.ts`
- `src/modules/face-data/face-data.controller.ts`
- `src/modules/group-members/group-member.controller.ts`
- `src/modules/groups/group.controller.ts`
- `src/modules/imported-users/imported-user.controller.ts`
- `src/modules/locations/location.controller.ts`
- `src/modules/majors/major.controller.ts`
- `src/modules/message-reads/message-read.controller.ts`
- `src/modules/messages/message.controller.ts`
- `src/modules/notifications/notification.controller.ts`
- … và 28 controller khác

## AUTO-GENERATED (không sửa tay) — 0 file

- (không phát hiện marker `AUTO-GENERATED` trong header file)

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/api-server` → `pnpm graphify:ai-summary`.
