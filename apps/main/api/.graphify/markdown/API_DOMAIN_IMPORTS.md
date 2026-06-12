# API — phụ thuộc giữa các domain (`src/`)

> **Sinh tự động:** `2026-06-12T14:20:21.047Z` từ `snapshot/graph.json` (cạnh `relation: "imports"`).
> **Domain** = thư mục cấp một dưới `src/` (ví dụ `posts`, `users`). File trực tiếp trong `src/*.ts` gom vào domain `_root`.

Ý nghĩa: **domain hàng gọi (import) domain cột** — Nest module/controller/service trong một feature đang dùng code của feature khác hoặc layer dùng chung (`entities`, `common`, …).

## Bảng phụ thuộc chéo (gộp)

| Domain gọi | Domain được import | Số cạnh import | Ví dụ (tên file) |
|-------------|---------------------|----------------|------------------|
| `_root` | `academic-years` | 1 | app.module.ts → academic-years.module.ts |
| `_root` | `accounts` | 1 | app.module.ts → accounts.module.ts |
| `_root` | `admission-results` | 1 | app.module.ts → admission-results.module.ts |
| `_root` | `auth` | 1 | app.module.ts → auth.module.ts |
| `_root` | `cameras` | 1 | app.module.ts → cameras.module.ts |
| `_root` | `carts` | 1 | app.module.ts → carts.module.ts |
| `_root` | `categories` | 1 | app.module.ts → categories.module.ts |
| `_root` | `comments` | 1 | app.module.ts → comments.module.ts |
| `_root` | `common` | 6 | app.module.ts → permissions.guard.ts; main.ts → logging.interceptor.ts; main.ts → database-http-exception.filter.ts; main.ts → request-id.middleware.ts |
| `_root` | `config` | 1 | main.ts → app.config.ts |
| `_root` | `contact-requests` | 1 | app.module.ts → contact-requests.module.ts |
| `_root` | `courses` | 1 | app.module.ts → courses.module.ts |
| `_root` | `dashboard` | 1 | app.module.ts → dashboard.module.ts |
| `_root` | `departments` | 1 | app.module.ts → departments.module.ts |
| `_root` | `entities` | 27 | seed-full-export.ts → account.entity.ts; seed-full-export.ts → admission-result.entity.ts; seed-full-export.ts → category.entity.ts; seed-full-export.ts → comment.entity.ts |
| `_root` | `event-checkins` | 1 | app.module.ts → event-checkins.module.ts |
| `_root` | `event-checkouts` | 1 | app.module.ts → event-checkouts.module.ts |
| `_root` | `event-registrations` | 1 | app.module.ts → event-registrations.module.ts |
| `_root` | `event-speakers` | 1 | app.module.ts → event-speakers.module.ts |
| `_root` | `events` | 1 | app.module.ts → events.module.ts |
| `_root` | `face-data` | 1 | app.module.ts → face-data.module.ts |
| `_root` | `groups` | 1 | app.module.ts → groups.module.ts |
| `_root` | `hanet` | 1 | app.module.ts → hanet.module.ts |
| `_root` | `imported-users` | 1 | app.module.ts → imported-users.module.ts |
| `_root` | `locations` | 1 | app.module.ts → locations.module.ts |
| `_root` | `majors` | 1 | app.module.ts → majors.module.ts |
| `_root` | `messages` | 1 | app.module.ts → messages.module.ts |
| `_root` | `mikro-orm` | 3 | app.module.ts → mikro-orm.module.ts; seed-demo.ts → orm-entities.ts; seed-full-export.ts → orm-entities.ts |
| `_root` | `notifications` | 1 | app.module.ts → notifications.module.ts |
| `_root` | `orders` | 1 | app.module.ts → orders.module.ts |
| `_root` | `page-contents` | 1 | app.module.ts → page-contents.module.ts |
| `_root` | `parent-students` | 1 | app.module.ts → parent-students.module.ts |
| `_root` | `posts` | 1 | app.module.ts → posts.module.ts |
| `_root` | `products` | 1 | app.module.ts → products.module.ts |
| `_root` | `promo-codes` | 1 | app.module.ts → promo-codes.module.ts |
| `_root` | `proxy-image` | 1 | app.module.ts → proxy-image.module.ts |
| `_root` | `public` | 1 | app.module.ts → public.module.ts |
| `_root` | `roles` | 1 | app.module.ts → roles.module.ts |
| `_root` | `screens` | 1 | app.module.ts → screens.module.ts |
| `_root` | `seeds` | 2 | seed-demo.ts → checkin-demo.runner.ts; seed-superadmin.ts → superadmin-bootstrap.runner.ts |
| `_root` | `seo-metas` | 1 | app.module.ts → seo-metas.module.ts |
| `_root` | `sessions` | 1 | app.module.ts → sessions.module.ts |
| `_root` | `settings` | 1 | app.module.ts → settings.module.ts |
| `_root` | `socket` | 1 | app.module.ts → socket.module.ts |
| `_root` | `speakers` | 1 | app.module.ts → speakers.module.ts |
| `_root` | `students` | 1 | app.module.ts → students.module.ts |
| `_root` | `system` | 1 | app.module.ts → system.module.ts |
| `_root` | `tags` | 1 | app.module.ts → tags.module.ts |
| `_root` | `templates` | 1 | app.module.ts → templates.module.ts |
| `_root` | `training-levels` | 1 | app.module.ts → training-levels.module.ts |
| `_root` | `training-systems` | 1 | app.module.ts → training-systems.module.ts |
| `_root` | `uploads` | 1 | app.module.ts → uploads.module.ts |
| `_root` | `users` | 1 | app.module.ts → users.module.ts |
| `academic-years` | `common` | 11 | academic-years.controller.ts → permissions.decorator.ts; academic-years.controller.ts → bulk-actions.ts; academic-years.controller.ts → api-response.ts; academic-years.controller.ts → parse-list-query.ts |
| `academic-years` | `config` | 2 | academic-years.controller.ts → permissions.ts; academic-years.controller.ts → constants.ts |
| `academic-years` | `entities` | 1 | academic-years.service.ts → academic-year.entity.ts |
| `accounts` | `common` | 3 | accounts.controller.ts → api-response.ts; accounts.controller.ts → permissions.decorator.ts; accounts.service.ts → entity-id.ts |
| `accounts` | `config` | 3 | accounts.controller.ts → permissions.ts; accounts.controller.ts → constants.ts; accounts.controller.ts → app.config.ts |
| `accounts` | `entities` | 5 | accounts.service.spec.ts → user.entity.ts; accounts.service.spec.ts → user-role.entity.ts; accounts.service.spec.ts → role.entity.ts; accounts.service.ts → user.entity.ts |
| `accounts` | `uploads` | 2 | accounts.controller.ts → uploads.service.ts; accounts.module.ts → uploads.module.ts |
| `admission-results` | `common` | 7 | admission-results.controller.ts → entity-id.ts; admission-results.controller.ts → api-response.ts; admission-results.controller.ts → permissions.decorator.ts; admission-results.controller.ts → parse-list-query.ts |
| `admission-results` | `config` | 2 | admission-results.controller.ts → constants.ts; admission-results.controller.ts → permissions.ts |
| `admission-results` | `entities` | 3 | admission-results.controller.ts → notification.entity.ts; admission-results.service.spec.ts → admission-result.entity.ts; admission-results.service.ts → admission-result.entity.ts |
| `admission-results` | `notifications` | 2 | admission-results.controller.ts → notifications.service.ts; admission-results.module.ts → notifications.module.ts |
| `auth` | `common` | 3 | auth-admin.controller.ts → api-response.ts; auth-admin.controller.ts → public.decorator.ts; auth.service.ts → entity-id.ts |
| `auth` | `config` | 2 | auth-admin.controller.ts → constants.ts; auth.service.ts → constants.ts |
| `auth` | `entities` | 7 | auth.service.spec.ts → user.entity.ts; auth.service.spec.ts → role.entity.ts; auth.service.spec.ts → user-role.entity.ts; auth.service.ts → user.entity.ts |
| `cameras` | `common` | 10 | cameras.controller.ts → permissions.decorator.ts; cameras.controller.ts → api-response.ts; cameras.controller.ts → bulk-actions.ts; cameras.controller.ts → parse-list-query.ts |
| `cameras` | `config` | 2 | cameras.controller.ts → permissions.ts; cameras.controller.ts → constants.ts |
| `cameras` | `entities` | 2 | cameras.service.ts → camera.entity.ts; cameras.service.ts → event.entity.ts |
| `carts` | `common` | 3 | carts.service.ts → cart-types.ts; public-carts.controller.ts → api-response.ts; public-carts.controller.ts → public.decorator.ts |
| `carts` | `config` | 1 | public-carts.controller.ts → constants.ts |
| `carts` | `entities` | 1 | carts.service.ts → customer-cart.entity.ts |
| `categories` | `common` | 6 | categories.controller.ts → entity-id.ts; categories.controller.ts → api-response.ts; categories.controller.ts → permissions.decorator.ts; categories.controller.ts → parse-list-query.ts |
| `categories` | `config` | 2 | categories.controller.ts → constants.ts; categories.controller.ts → permissions.ts |
| `categories` | `entities` | 4 | categories.controller.ts → notification.entity.ts; categories.service.spec.ts → category.entity.ts; categories.service.ts → category.entity.ts; categories.service.ts → post-category.entity.ts |
| `categories` | `notifications` | 2 | categories.controller.ts → notifications.service.ts; categories.module.ts → notifications.module.ts |
| `comments` | `common` | 6 | comments.controller.ts → entity-id.ts; comments.controller.ts → api-response.ts; comments.controller.ts → permissions.decorator.ts; comments.controller.ts → parse-list-query.ts |
| `comments` | `config` | 2 | comments.controller.ts → constants.ts; comments.controller.ts → permissions.ts |
| `comments` | `entities` | 3 | comments.controller.ts → notification.entity.ts; comments.service.spec.ts → comment.entity.ts; comments.service.ts → comment.entity.ts |
| `comments` | `notifications` | 2 | comments.controller.ts → notifications.service.ts; comments.module.ts → notifications.module.ts |
| `common` | `auth` | 1 | permissions.guard.ts → auth.service.ts |
| `common` | `config` | 4 | api-access.middleware.ts → constants.ts; logging.interceptor.ts → app.config.ts; logging.interceptor.ts → constants.ts; permissions.guard.ts → constants.ts |
| `common` | `entities` | 22 | dev-login-options.ts → role.entity.ts; dev-login-options.ts → user.entity.ts; dev-login-options.ts → user-role.entity.ts; gift-rules.spec.ts → product.entity.ts |
| `common` | `socket` | 3 | admin-realtime-broadcast.service.ts → socket.gateway.ts; admin-realtime-broadcast.service.ts → socket.types.ts; admin-realtime.interceptor.ts → socket.gateway.ts |
| `contact-requests` | `common` | 8 | contact-requests.controller.ts → entity-id.ts; contact-requests.controller.ts → admin-realtime-broadcast.service.ts; contact-requests.controller.ts → api-response.ts; contact-requests.controller.ts → permissions.decorator.ts |
| `contact-requests` | `config` | 2 | contact-requests.controller.ts → constants.ts; contact-requests.controller.ts → permissions.ts |
| `contact-requests` | `entities` | 4 | contact-requests.controller.ts → notification.entity.ts; contact-requests.service.spec.ts → contact-request.entity.ts; contact-requests.service.ts → contact-request.entity.ts; contact-requests.service.ts → user.entity.ts |
| `contact-requests` | `notifications` | 2 | contact-requests.controller.ts → notifications.service.ts; contact-requests.module.ts → notifications.module.ts |
| `contact-requests` | `socket` | 1 | contact-requests.module.ts → socket.module.ts |
| `courses` | `common` | 11 | courses.controller.ts → permissions.decorator.ts; courses.controller.ts → api-response.ts; courses.controller.ts → bulk-actions.ts; courses.controller.ts → parse-list-query.ts |
| `courses` | `config` | 2 | courses.controller.ts → permissions.ts; courses.controller.ts → constants.ts |
| `courses` | `entities` | 1 | courses.service.ts → course.entity.ts |
| `dashboard` | `common` | 3 | dashboard.controller.ts → api-response.ts; dashboard.controller.ts → permissions.decorator.ts; dashboard.service.ts → entity-id.ts |
| `dashboard` | `config` | 2 | dashboard.controller.ts → constants.ts; dashboard.controller.ts → permissions.ts |
| `dashboard` | `entities` | 12 | dashboard.service.ts → category.entity.ts; dashboard.service.ts → comment.entity.ts; dashboard.service.ts → contact-request.entity.ts; dashboard.service.ts → message.entity.ts |
| `departments` | `common` | 10 | departments.controller.ts → permissions.decorator.ts; departments.controller.ts → api-response.ts; departments.controller.ts → bulk-actions.ts; departments.controller.ts → parse-list-query.ts |
| `departments` | `config` | 2 | departments.controller.ts → permissions.ts; departments.controller.ts → constants.ts |
| `departments` | `entities` | 1 | departments.service.ts → department.entity.ts |
| `entities` | `common` | 3 | customer-cart.entity.ts → cart-types.ts; order.entity.ts → product-types.ts; product.entity.ts → product-types.ts |
| `event-checkins` | `common` | 7 | event-checkins.controller.ts → api-response.ts; event-checkins.controller.ts → permissions.decorator.ts; event-checkins.controller.ts → bulk-actions.ts; event-checkins.controller.ts → parse-list-query.ts |
| `event-checkins` | `config` | 2 | event-checkins.controller.ts → permissions.ts; event-checkins.controller.ts → constants.ts |
| `event-checkins` | `entities` | 3 | event-checkins.service.ts → event-checkin.entity.ts; event-checkins.service.ts → event.entity.ts; event-checkins.service.ts → event-registration.entity.ts |
| `event-checkouts` | `common` | 5 | event-checkouts.controller.ts → api-response.ts; event-checkouts.controller.ts → permissions.decorator.ts; event-checkouts.controller.ts → parse-list-query.ts; event-checkouts.service.ts → entity-id.ts |
| `event-checkouts` | `config` | 2 | event-checkouts.controller.ts → permissions.ts; event-checkouts.controller.ts → constants.ts |
| `event-checkouts` | `entities` | 1 | event-checkouts.service.ts → event-registration.entity.ts |
| `event-registrations` | `common` | 8 | event-registration-attendance.service.ts → entity-id.ts; event-registrations.controller.ts → api-response.ts; event-registrations.controller.ts → permissions.decorator.ts; event-registrations.controller.ts → bulk-actions.ts |
| `event-registrations` | `config` | 2 | event-registrations.controller.ts → permissions.ts; event-registrations.controller.ts → constants.ts |
| `event-registrations` | `entities` | 5 | event-registration-attendance.service.ts → event.entity.ts; event-registration-attendance.service.ts → event-registration.entity.ts; event-registrations.service.ts → event-registration.entity.ts; event-registrations.service.ts → event.entity.ts |
| `event-registrations` | `socket` | 3 | event-registration-attendance.service.ts → socket.gateway.ts; event-registration-attendance.service.ts → socket.types.ts; event-registrations.module.ts → socket.module.ts |
| `event-speakers` | `common` | 7 | event-speakers.controller.ts → api-response.ts; event-speakers.controller.ts → permissions.decorator.ts; event-speakers.controller.ts → bulk-actions.ts; event-speakers.controller.ts → parse-list-query.ts |
| `event-speakers` | `config` | 2 | event-speakers.controller.ts → permissions.ts; event-speakers.controller.ts → constants.ts |
| `event-speakers` | `entities` | 3 | event-speakers.service.ts → event-speaker.entity.ts; event-speakers.service.ts → event.entity.ts; event-speakers.service.ts → speaker.entity.ts |
| `events` | `common` | 11 | events.controller.ts → permissions.decorator.ts; events.controller.ts → api-response.ts; events.controller.ts → bulk-actions.ts; events.controller.ts → parse-list-query.ts |
| `events` | `config` | 2 | events.controller.ts → permissions.ts; events.controller.ts → constants.ts |
| `events` | `entities` | 2 | events.service.ts → event.entity.ts; events.service.ts → camera.entity.ts |
| `face-data` | `common` | 7 | face-data.controller.ts → api-response.ts; face-data.controller.ts → permissions.decorator.ts; face-data.controller.ts → bulk-actions.ts; face-data.controller.ts → parse-list-query.ts |
| `face-data` | `config` | 2 | face-data.controller.ts → permissions.ts; face-data.controller.ts → constants.ts |
| `face-data` | `entities` | 2 | face-data.service.ts → face-data.entity.ts; face-data.service.ts → user.entity.ts |
| `groups` | `common` | 5 | groups.controller.ts → entity-id.ts; groups.controller.ts → api-response.ts; groups.controller.ts → permissions.decorator.ts; groups.controller.ts → parse-list-query.ts |
| `groups` | `config` | 2 | groups.controller.ts → constants.ts; groups.controller.ts → permissions.ts |
| `groups` | `entities` | 8 | groups.controller.ts → notification.entity.ts; groups.service.spec.ts → group.entity.ts; groups.service.spec.ts → group-member.entity.ts; groups.service.ts → group.entity.ts |
| `groups` | `notifications` | 2 | groups.controller.ts → notifications.service.ts; groups.module.ts → notifications.module.ts |
| `groups` | `socket` | 2 | groups.controller.ts → socket.gateway.ts; groups.module.ts → socket.module.ts |
| `hanet` | `common` | 2 | hanet-webhook.controller.ts → public.decorator.ts; hanet-webhook.service.ts → entity-id.ts |
| `hanet` | `config` | 1 | hanet-webhook.controller.ts → constants.ts |
| `hanet` | `entities` | 3 | hanet-webhook.service.ts → event.entity.ts; hanet-webhook.service.ts → event-registration.entity.ts; hanet-webhook.service.ts → camera.entity.ts |
| `hanet` | `event-registrations` | 2 | hanet-webhook.service.ts → event-registration-attendance.service.ts; hanet.module.ts → event-registrations.module.ts |
| `imported-users` | `common` | 7 | imported-users.controller.ts → api-response.ts; imported-users.controller.ts → permissions.decorator.ts; imported-users.controller.ts → bulk-actions.ts; imported-users.controller.ts → parse-list-query.ts |
| `imported-users` | `config` | 2 | imported-users.controller.ts → constants.ts; imported-users.controller.ts → permissions.ts |
| `imported-users` | `entities` | 1 | imported-users.service.ts → imported-user.entity.ts |
| `locations` | `common` | 10 | locations.controller.ts → permissions.decorator.ts; locations.controller.ts → api-response.ts; locations.controller.ts → bulk-actions.ts; locations.controller.ts → parse-list-query.ts |
| `locations` | `config` | 2 | locations.controller.ts → permissions.ts; locations.controller.ts → constants.ts |
| `locations` | `entities` | 1 | locations.service.ts → location.entity.ts |
| `majors` | `common` | 11 | majors.controller.ts → permissions.decorator.ts; majors.controller.ts → api-response.ts; majors.controller.ts → bulk-actions.ts; majors.controller.ts → parse-list-query.ts |
| `majors` | `config` | 2 | majors.controller.ts → permissions.ts; majors.controller.ts → constants.ts |
| `majors` | `entities` | 1 | majors.service.ts → major.entity.ts |
| `messages` | `common` | 6 | conversations.controller.ts → entity-id.ts; conversations.controller.ts → api-response.ts; conversations.controller.ts → permissions.decorator.ts; messages.controller.ts → entity-id.ts |
| `messages` | `config` | 4 | conversations.controller.ts → constants.ts; conversations.controller.ts → permissions.ts; messages.controller.ts → permissions.ts; messages.controller.ts → constants.ts |
| `messages` | `entities` | 6 | conversations.controller.ts → message.entity.ts; messages.controller.ts → message.entity.ts; messages.controller.ts → message-read.entity.ts; messages.controller.ts → group-member.entity.ts |
| `messages` | `socket` | 3 | conversations.controller.ts → socket.gateway.ts; messages.controller.ts → socket.gateway.ts; messages.module.ts → socket.module.ts |
| `mikro-orm` | `entities` | 46 | orm-entities.ts → academic-year.entity.ts; orm-entities.ts → account.entity.ts; orm-entities.ts → admission-result.entity.ts; orm-entities.ts → camera.entity.ts |
| `notifications` | `common` | 4 | notifications.controller.ts → entity-id.ts; notifications.controller.ts → api-response.ts; notifications.controller.ts → permissions.decorator.ts; notifications.service.ts → entity-id.ts |
| `notifications` | `config` | 2 | notifications.controller.ts → permissions.ts; notifications.controller.ts → constants.ts |
| `notifications` | `entities` | 6 | notifications.service.spec.ts → notification.entity.ts; notifications.service.ts → notification.entity.ts; notifications.service.ts → user.entity.ts; notifications.service.ts → user-role.entity.ts |
| `notifications` | `socket` | 4 | notifications.module.ts → socket.module.ts; notifications.service.spec.ts → socket.gateway.ts; notifications.service.ts → socket.gateway.ts; notifications.service.ts → notification-mapper.ts |
| `orders` | `common` | 16 | order-checkout.ts → product-types.ts; order-checkout.ts → unit-pricing.ts; order-checkout.ts → product-units.ts; orders.controller.ts → api-response.ts |
| `orders` | `config` | 3 | orders.controller.ts → constants.ts; orders.controller.ts → permissions.ts; public-orders.controller.ts → constants.ts |
| `orders` | `entities` | 5 | order-checkout.spec.ts → product.entity.ts; order-checkout.ts → product.entity.ts; orders.controller.ts → order.entity.ts; orders.service.ts → order.entity.ts |
| `orders` | `products` | 2 | orders.module.ts → products.module.ts; orders.service.ts → products.service.ts |
| `orders` | `promo-codes` | 2 | orders.module.ts → promo-codes.module.ts; orders.service.ts → promo-codes.service.ts |
| `orders` | `uploads` | 2 | orders.module.ts → uploads.module.ts; orders.service.ts → uploads.service.ts |
| `page-contents` | `auth` | 2 | page-contents.controller.ts → auth.service.ts; page-contents.module.ts → auth.module.ts |
| `page-contents` | `common` | 9 | page-contents.controller.ts → entity-id.ts; page-contents.controller.ts → api-response.ts; page-contents.controller.ts → permissions.decorator.ts; page-contents.controller.ts → bulk-actions.ts |
| `page-contents` | `config` | 2 | page-contents.controller.ts → constants.ts; page-contents.controller.ts → permissions.ts |
| `page-contents` | `entities` | 2 | page-contents.controller.ts → notification.entity.ts; page-contents.service.ts → page-content.entity.ts |
| `page-contents` | `notifications` | 2 | page-contents.controller.ts → notifications.service.ts; page-contents.module.ts → notifications.module.ts |
| `parent-students` | `common` | 10 | parent-students.controller.ts → entity-id.ts; parent-students.controller.ts → api-response.ts; parent-students.controller.ts → permissions.decorator.ts; parent-students.controller.ts → parse-list-query.ts |
| `parent-students` | `config` | 2 | parent-students.controller.ts → constants.ts; parent-students.controller.ts → permissions.ts |
| `parent-students` | `entities` | 2 | parent-students.service.ts → user.entity.ts; parent-students.service.ts → parent-student.entity.ts |
| `parent-students` | `socket` | 1 | parent-students.module.ts → socket.module.ts |
| `posts` | `common` | 9 | posts.controller.ts → entity-id.ts; posts.controller.ts → api-response.ts; posts.controller.ts → permissions.decorator.ts; posts.controller.ts → parse-list-query.ts |
| `posts` | `config` | 2 | posts.controller.ts → constants.ts; posts.controller.ts → permissions.ts |
| `posts` | `entities` | 11 | posts.controller.ts → notification.entity.ts; posts.service.spec.ts → post.entity.ts; posts.service.spec.ts → category.entity.ts; posts.service.spec.ts → tag.entity.ts |
| `posts` | `notifications` | 2 | posts.controller.ts → notifications.service.ts; posts.module.ts → notifications.module.ts |
| `products` | `common` | 9 | products.controller.ts → api-response.ts; products.controller.ts → permissions.decorator.ts; products.controller.ts → parse-list-query.ts; products.service.ts → entity-id.ts |
| `products` | `config` | 3 | products.controller.ts → constants.ts; products.controller.ts → permissions.ts; public-products.controller.ts → constants.ts |
| `products` | `entities` | 1 | products.service.ts → product.entity.ts |
| `promo-codes` | `common` | 11 | promo-codes.controller.ts → api-response.ts; promo-codes.controller.ts → permissions.decorator.ts; promo-codes.controller.ts → parse-list-query.ts; promo-codes.controller.ts → parse-column-filters.ts |
| `promo-codes` | `config` | 3 | promo-codes.controller.ts → constants.ts; promo-codes.controller.ts → permissions.ts; public-promo-codes.controller.ts → constants.ts |
| `promo-codes` | `entities` | 1 | promo-codes.service.ts → promo-code.entity.ts |
| `proxy-image` | `common` | 1 | proxy-image.controller.ts → public.decorator.ts |
| `proxy-image` | `config` | 1 | proxy-image.controller.ts → constants.ts |
| `public` | `admission-results` | 2 | public.controller.ts → admission-results.service.ts; public.module.ts → admission-results.module.ts |
| `public` | `auth` | 3 | public-auth.service.ts → auth.service.ts; public.controller.ts → auth.service.ts; public.module.ts → auth.module.ts |
| `public` | `common` | 12 | public-auth.service.ts → entity-id.ts; public-contact-requests.service.ts → admin-realtime-broadcast.service.ts; public-event-registration.service.ts → entity-id.ts; public-event-registration.service.ts → poster-normalize.ts |
| `public` | `config` | 3 | public-auth.service.ts → constants.ts; public-contact-requests.service.ts → constants.ts; public.controller.ts → constants.ts |
| `public` | `entities` | 15 | public-auth.service.ts → role.entity.ts; public-auth.service.ts → setting.entity.ts; public-auth.service.ts → user.entity.ts; public-categories.service.ts → category.entity.ts |
| `public` | `event-registrations` | 3 | public-event-registration.service.ts → event-registrations.service.ts; public-events.service.ts → event-registrations.service.ts; public.module.ts → event-registrations.module.ts |
| `public` | `event-speakers` | 2 | public-events.service.ts → event-speakers.service.ts; public.module.ts → event-speakers.module.ts |
| `public` | `page-contents` | 2 | public.controller.ts → page-contents.service.ts; public.module.ts → page-contents.module.ts |
| `public` | `seo-metas` | 2 | public.controller.ts → seo-metas.service.ts; public.module.ts → seo-metas.module.ts |
| `public` | `settings` | 2 | public.controller.ts → settings.service.ts; public.module.ts → settings.module.ts |
| `public` | `socket` | 1 | public.module.ts → socket.module.ts |
| `public` | `users` | 3 | public-auth.service.ts → users.service.ts; public.controller.ts → users.service.ts; public.module.ts → users.module.ts |
| `roles` | `common` | 7 | roles.controller.ts → entity-id.ts; roles.controller.ts → api-response.ts; roles.controller.ts → permissions.decorator.ts; roles.controller.ts → parse-list-query.ts |
| `roles` | `config` | 4 | roles.controller.ts → constants.ts; roles.controller.ts → permissions.ts; roles.service.ts → protected-admin.ts; roles.service.ts → system-role.ts |
| `roles` | `entities` | 4 | roles.controller.ts → notification.entity.ts; roles.service.spec.ts → role.entity.ts; roles.service.ts → role.entity.ts; roles.service.ts → user.entity.ts |
| `roles` | `notifications` | 2 | roles.controller.ts → notifications.service.ts; roles.module.ts → notifications.module.ts |
| `roles` | `socket` | 2 | roles.controller.ts → socket.gateway.ts; roles.module.ts → socket.module.ts |
| `screens` | `common` | 10 | screens.controller.ts → permissions.decorator.ts; screens.controller.ts → api-response.ts; screens.controller.ts → bulk-actions.ts; screens.controller.ts → parse-list-query.ts |
| `screens` | `config` | 2 | screens.controller.ts → permissions.ts; screens.controller.ts → constants.ts |
| `screens` | `entities` | 1 | screens.service.ts → screen.entity.ts |
| `scripts` | `mikro-orm` | 1 | mark-migrations-executed.ts → mikro-orm.module.ts |
| `seeders` | `seeds` | 4 | DatabaseSeeder.ts → superadmin-bootstrap.runner.ts; DatabaseSeeder.ts → orders-sample.runner.ts; DatabaseSeeder.ts → products-sample.runner.ts; DatabaseSeeder.ts → promo-codes-sample.runner.ts |
| `seeds` | `common` | 1 | orders-sample.runner.ts → gift-rules.ts |
| `seeds` | `config` | 1 | superadmin-bootstrap.data.ts → event-staff.template.ts |
| `seeds` | `entities` | 14 | checkin-demo.runner.ts → event.entity.ts; checkin-demo.runner.ts → event-registration.entity.ts; checkin-demo.runner.ts → user.entity.ts; orders-sample.runner.ts → order.entity.ts |
| `seeds` | `orders` | 1 | orders-sample.runner.ts → order-checkout.ts |
| `seo-metas` | `common` | 10 | seo-metas.controller.ts → api-response.ts; seo-metas.controller.ts → permissions.decorator.ts; seo-metas.controller.ts → bulk-actions.ts; seo-metas.controller.ts → parse-list-query.ts |
| `seo-metas` | `config` | 2 | seo-metas.controller.ts → permissions.ts; seo-metas.controller.ts → constants.ts |
| `seo-metas` | `entities` | 1 | seo-metas.service.ts → seo-meta.entity.ts |
| `sessions` | `common` | 7 | sessions.controller.ts → entity-id.ts; sessions.controller.ts → api-response.ts; sessions.controller.ts → permissions.decorator.ts; sessions.controller.ts → parse-list-query.ts |
| `sessions` | `config` | 3 | sessions.controller.ts → constants.ts; sessions.controller.ts → permissions.ts; sessions.service.ts → constants.ts |
| `sessions` | `entities` | 5 | sessions.controller.ts → notification.entity.ts; sessions.service.ts → session.entity.ts; sessions.service.ts → user.entity.ts; sessions.service.ts → user-role.entity.ts |
| `sessions` | `notifications` | 2 | sessions.controller.ts → notifications.service.ts; sessions.module.ts → notifications.module.ts |
| `sessions` | `socket` | 2 | sessions.controller.ts → socket.gateway.ts; sessions.module.ts → socket.module.ts |
| `settings` | `common` | 4 | settings.controller.ts → api-response.ts; settings.controller.ts → permissions.decorator.ts; settings.service.ts → entity-id.ts; settings.service.ts → parse-setting-value.ts |
| `settings` | `config` | 2 | settings.controller.ts → constants.ts; settings.controller.ts → permissions.ts |
| `settings` | `entities` | 2 | settings.service.spec.ts → setting.entity.ts; settings.service.ts → setting.entity.ts |
| `socket` | `common` | 3 | socket.gateway.ts → entity-id.ts; socket.module.ts → admin-realtime.interceptor.ts; socket.module.ts → admin-realtime-broadcast.service.ts |
| `socket` | `config` | 1 | socket.gateway.ts → app.config.ts |
| `socket` | `entities` | 2 | socket.gateway.ts → notification.entity.ts; socket.gateway.ts → user.entity.ts |
| `socket` | `sessions` | 2 | socket.gateway.ts → sessions.service.ts; socket.module.ts → sessions.module.ts |
| `speakers` | `common` | 10 | speakers.controller.ts → permissions.decorator.ts; speakers.controller.ts → api-response.ts; speakers.controller.ts → bulk-actions.ts; speakers.controller.ts → parse-list-query.ts |
| `speakers` | `config` | 2 | speakers.controller.ts → permissions.ts; speakers.controller.ts → constants.ts |
| `speakers` | `entities` | 1 | speakers.service.ts → speaker.entity.ts |
| `students` | `common` | 7 | students.controller.ts → entity-id.ts; students.controller.ts → api-response.ts; students.controller.ts → permissions.decorator.ts; students.controller.ts → parse-list-query.ts |
| `students` | `config` | 2 | students.controller.ts → constants.ts; students.controller.ts → permissions.ts |
| `students` | `entities` | 5 | students.controller.ts → notification.entity.ts; students.service.spec.ts → student.entity.ts; students.service.spec.ts → user.entity.ts; students.service.ts → user.entity.ts |
| `students` | `notifications` | 2 | students.controller.ts → notifications.service.ts; students.module.ts → notifications.module.ts |
| `system` | `auth` | 2 | system.controller.ts → auth.service.ts; system.module.ts → auth.module.ts |
| `system` | `common` | 3 | system.controller.ts → api-response.ts; system.controller.ts → permissions.decorator.ts; system.service.ts → entity-id.ts |
| `system` | `config` | 2 | system.controller.ts → constants.ts; system.controller.ts → permissions.ts |
| `system` | `entities` | 18 | system.service.ts → category.entity.ts; system.service.ts → comment.entity.ts; system.service.ts → contact-request.entity.ts; system.service.ts → event.entity.ts |
| `system` | `mikro-orm` | 1 | system.service.ts → orm-entities.ts |
| `system` | `seeds` | 1 | system.service.ts → superadmin-bootstrap.runner.ts |
| `tags` | `common` | 7 | tags.controller.ts → entity-id.ts; tags.controller.ts → api-response.ts; tags.controller.ts → permissions.decorator.ts; tags.controller.ts → parse-list-query.ts |
| `tags` | `config` | 2 | tags.controller.ts → constants.ts; tags.controller.ts → permissions.ts |
| `tags` | `entities` | 4 | tags.controller.ts → notification.entity.ts; tags.service.spec.ts → tag.entity.ts; tags.service.ts → tag.entity.ts; tags.service.ts → post-tag.entity.ts |
| `tags` | `notifications` | 2 | tags.controller.ts → notifications.service.ts; tags.module.ts → notifications.module.ts |
| `templates` | `common` | 10 | templates.controller.ts → permissions.decorator.ts; templates.controller.ts → api-response.ts; templates.controller.ts → bulk-actions.ts; templates.controller.ts → parse-list-query.ts |
| `templates` | `config` | 2 | templates.controller.ts → permissions.ts; templates.controller.ts → constants.ts |
| `templates` | `entities` | 1 | templates.service.ts → template.entity.ts |
| `training-levels` | `common` | 11 | training-levels.controller.ts → permissions.decorator.ts; training-levels.controller.ts → api-response.ts; training-levels.controller.ts → bulk-actions.ts; training-levels.controller.ts → parse-list-query.ts |
| `training-levels` | `config` | 2 | training-levels.controller.ts → permissions.ts; training-levels.controller.ts → constants.ts |
| `training-levels` | `entities` | 1 | training-levels.service.ts → training-level.entity.ts |
| `training-systems` | `common` | 11 | training-systems.controller.ts → permissions.decorator.ts; training-systems.controller.ts → api-response.ts; training-systems.controller.ts → bulk-actions.ts; training-systems.controller.ts → parse-list-query.ts |
| `training-systems` | `config` | 2 | training-systems.controller.ts → permissions.ts; training-systems.controller.ts → constants.ts |
| `training-systems` | `entities` | 1 | training-systems.service.ts → training-system.entity.ts |
| `uploads` | `common` | 10 | public-uploads.controller.ts → public.decorator.ts; storage-media.ts → image-processor.ts; uploads.controller.ts → api-response.ts; uploads.controller.ts → permissions.decorator.ts |
| `uploads` | `config` | 5 | public-uploads.controller.ts → constants.ts; uploads.controller.ts → app.config.ts; uploads.controller.ts → permissions.ts; uploads.controller.ts → constants.ts |
| `uploads` | `entities` | 2 | uploads.service.ts → storage-file.entity.ts; uploads.service.ts → user.entity.ts |
| `users` | `common` | 9 | users.controller.ts → entity-id.ts; users.controller.ts → api-response.ts; users.controller.ts → permissions.decorator.ts; users.controller.ts → parse-list-query.ts |
| `users` | `config` | 3 | users.controller.ts → constants.ts; users.controller.ts → permissions.ts; users.service.ts → protected-admin.ts |
| `users` | `entities` | 8 | users.controller.ts → notification.entity.ts; users.service.spec.ts → user.entity.ts; users.service.spec.ts → role.entity.ts; users.service.spec.ts → user-role.entity.ts |
| `users` | `notifications` | 2 | users.controller.ts → notifications.service.ts; users.module.ts → notifications.module.ts |
| `users` | `sessions` | 2 | users.controller.ts → sessions.service.ts; users.module.ts → sessions.module.ts |
| `users` | `socket` | 2 | users.controller.ts → socket.gateway.ts; users.module.ts → socket.module.ts |

## Domain trung tâm (chiều ngược: ai import vào domain này?)

Liệt kê domain **đích** (`to`) được nhiều cạnh `imports` nhất; kèm các domain **nguồn** (`from`) nổi bật.

- **`common`**: **377** cạnh từ **51** domain — `orders` (16), `public` (12), `academic-years` (11), `courses` (11), `events` (11), `majors` (11), `promo-codes` (11), `training-levels` (11)
- **`entities`**: **288** cạnh từ **51** domain — `mikro-orm` (46), `_root` (27), `common` (22), `system` (18), `public` (15), `seeds` (14), `dashboard` (12), `posts` (11)
- **`config`**: **112** cạnh từ **51** domain — `uploads` (5), `common` (4), `messages` (4), `roles` (4), `accounts` (3), `orders` (3), `products` (3), `promo-codes` (3)
- **`notifications`**: **25** cạnh từ **13** domain — `admission-results` (2), `categories` (2), `comments` (2), `contact-requests` (2), `groups` (2), `page-contents` (2), `posts` (2), `roles` (2)
- **`socket`**: **25** cạnh từ **12** domain — `notifications` (4), `common` (3), `event-registrations` (3), `messages` (3), `groups` (2), `roles` (2), `sessions` (2), `users` (2)
- **`auth`**: **9** cạnh từ **5** domain — `public` (3), `page-contents` (2), `system` (2), `_root` (1), `common` (1)
- **`seeds`**: **7** cạnh từ **3** domain — `seeders` (4), `_root` (2), `system` (1)
- **`event-registrations`**: **6** cạnh từ **3** domain — `public` (3), `hanet` (2), `_root` (1)
- **`mikro-orm`**: **5** cạnh từ **3** domain — `_root` (3), `scripts` (1), `system` (1)
- **`sessions`**: **5** cạnh từ **3** domain — `socket` (2), `users` (2), `_root` (1)
- **`uploads`**: **5** cạnh từ **3** domain — `accounts` (2), `orders` (2), `_root` (1)
- **`users`**: **4** cạnh từ **2** domain — `public` (3), `_root` (1)
- **`admission-results`**: **3** cạnh từ **2** domain — `public` (2), `_root` (1)
- **`event-speakers`**: **3** cạnh từ **2** domain — `public` (2), `_root` (1)
- **`page-contents`**: **3** cạnh từ **2** domain — `public` (2), `_root` (1)
- **`products`**: **3** cạnh từ **2** domain — `orders` (2), `_root` (1)
- **`promo-codes`**: **3** cạnh từ **2** domain — `orders` (2), `_root` (1)
- **`seo-metas`**: **3** cạnh từ **2** domain — `public` (2), `_root` (1)
- **`settings`**: **3** cạnh từ **2** domain — `public` (2), `_root` (1)
- **`orders`**: **2** cạnh từ **2** domain — `_root` (1), `seeds` (1)
- **`academic-years`**: **1** cạnh từ **1** domain — `_root` (1)
- **`accounts`**: **1** cạnh từ **1** domain — `_root` (1)
- **`cameras`**: **1** cạnh từ **1** domain — `_root` (1)
- **`carts`**: **1** cạnh từ **1** domain — `_root` (1)
- **`categories`**: **1** cạnh từ **1** domain — `_root` (1)
- **`comments`**: **1** cạnh từ **1** domain — `_root` (1)
- **`contact-requests`**: **1** cạnh từ **1** domain — `_root` (1)
- **`courses`**: **1** cạnh từ **1** domain — `_root` (1)
- **`dashboard`**: **1** cạnh từ **1** domain — `_root` (1)
- **`departments`**: **1** cạnh từ **1** domain — `_root` (1)
- **`event-checkins`**: **1** cạnh từ **1** domain — `_root` (1)
- **`event-checkouts`**: **1** cạnh từ **1** domain — `_root` (1)
- **`events`**: **1** cạnh từ **1** domain — `_root` (1)
- **`face-data`**: **1** cạnh từ **1** domain — `_root` (1)
- **`groups`**: **1** cạnh từ **1** domain — `_root` (1)

## Sơ đồ Mermaid (tối đa 80 cặp domain, ưu tiên cạnh có trọng số lớn)

```mermaid
flowchart LR
    dom_root["_root"]
    dom_academic_years["academic-years"]
    dom_accounts["accounts"]
    dom_admission_results["admission-results"]
    dom_auth["auth"]
    dom_cameras["cameras"]
    dom_carts["carts"]
    dom_categories["categories"]
    dom_comments["comments"]
    dom_common["common"]
    dom_config["config"]
    dom_contact_requests["contact-requests"]
    dom_courses["courses"]
    dom_dashboard["dashboard"]
    dom_departments["departments"]
    dom_entities["entities"]
    dom_event_checkins["event-checkins"]
    dom_event_checkouts["event-checkouts"]
    dom_event_registrations["event-registrations"]
    dom_event_speakers["event-speakers"]
    dom_events["events"]
    dom_face_data["face-data"]
    dom_groups["groups"]
    dom_imported_users["imported-users"]
    dom_locations["locations"]
    dom_majors["majors"]
    dom_messages["messages"]
    dom_mikro_orm["mikro-orm"]
    dom_notifications["notifications"]
    dom_orders["orders"]
    dom_page_contents["page-contents"]
    dom_parent_students["parent-students"]
    dom_posts["posts"]
    dom_products["products"]
    dom_promo_codes["promo-codes"]
    dom_public["public"]
    dom_roles["roles"]
    dom_screens["screens"]
    dom_seeders["seeders"]
    dom_seeds["seeds"]
    dom_seo_metas["seo-metas"]
    dom_sessions["sessions"]
    dom_settings["settings"]
    dom_socket["socket"]
    dom_speakers["speakers"]
    dom_students["students"]
    dom_system["system"]
    dom_tags["tags"]
    dom_templates["templates"]
    dom_training_levels["training-levels"]
    dom_training_systems["training-systems"]
    dom_uploads["uploads"]
    dom_users["users"]
    dom_mikro_orm -->|46| dom_entities
    dom_root -->|27| dom_entities
    dom_common -->|22| dom_entities
    dom_system -->|18| dom_entities
    dom_orders -->|16| dom_common
    dom_public -->|15| dom_entities
    dom_seeds -->|14| dom_entities
    dom_dashboard -->|12| dom_entities
    dom_public -->|12| dom_common
    dom_academic_years -->|11| dom_common
    dom_courses -->|11| dom_common
    dom_events -->|11| dom_common
    dom_majors -->|11| dom_common
    dom_posts -->|11| dom_entities
    dom_promo_codes -->|11| dom_common
    dom_training_levels -->|11| dom_common
    dom_training_systems -->|11| dom_common
    dom_cameras -->|10| dom_common
    dom_departments -->|10| dom_common
    dom_locations -->|10| dom_common
    dom_parent_students -->|10| dom_common
    dom_screens -->|10| dom_common
    dom_seo_metas -->|10| dom_common
    dom_speakers -->|10| dom_common
    dom_templates -->|10| dom_common
    dom_uploads -->|10| dom_common
    dom_page_contents -->|9| dom_common
    dom_posts -->|9| dom_common
    dom_products -->|9| dom_common
    dom_users -->|9| dom_common
    dom_contact_requests -->|8| dom_common
    dom_event_registrations -->|8| dom_common
    dom_groups -->|8| dom_entities
    dom_users -->|8| dom_entities
    dom_admission_results -->|7| dom_common
    dom_auth -->|7| dom_entities
    dom_event_checkins -->|7| dom_common
    dom_event_speakers -->|7| dom_common
    dom_face_data -->|7| dom_common
    dom_imported_users -->|7| dom_common
    dom_roles -->|7| dom_common
    dom_sessions -->|7| dom_common
    dom_students -->|7| dom_common
    dom_tags -->|7| dom_common
    dom_root -->|6| dom_common
    dom_categories -->|6| dom_common
    dom_comments -->|6| dom_common
    dom_messages -->|6| dom_common
    dom_messages -->|6| dom_entities
    dom_notifications -->|6| dom_entities
    dom_accounts -->|5| dom_entities
    dom_event_checkouts -->|5| dom_common
    dom_event_registrations -->|5| dom_entities
    dom_groups -->|5| dom_common
    dom_orders -->|5| dom_entities
    dom_sessions -->|5| dom_entities
    dom_students -->|5| dom_entities
    dom_uploads -->|5| dom_config
    dom_categories -->|4| dom_entities
    dom_common -->|4| dom_config
    dom_contact_requests -->|4| dom_entities
    dom_messages -->|4| dom_config
    dom_notifications -->|4| dom_common
    dom_notifications -->|4| dom_socket
    dom_roles -->|4| dom_config
    dom_roles -->|4| dom_entities
    dom_seeders -->|4| dom_seeds
    dom_settings -->|4| dom_common
    dom_tags -->|4| dom_entities
    dom_root -->|3| dom_mikro_orm
    dom_accounts -->|3| dom_common
    dom_accounts -->|3| dom_config
    dom_admission_results -->|3| dom_entities
    dom_auth -->|3| dom_common
    dom_carts -->|3| dom_common
    dom_comments -->|3| dom_entities
    dom_common -->|3| dom_socket
    dom_dashboard -->|3| dom_common
    dom_entities -->|3| dom_common
    dom_event_checkins -->|3| dom_entities
```

## Ghi chú

- Chỉ liệt kê import **nội bộ** giữa file dưới `src/` (theo snapshot Graphify). Import package npm có thể không xuất hiện.
- Để biết **HTTP route** giữa client và API, xem controller + `SUMMARY_FOR_AI.md` (module map).

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/main/api` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
