# API endpoints — @hub-event/api (`apps/hub-event/api`)

> **Sinh tự động:** `2026-06-13T21:25:57.659Z` — quét `src/**/*.controller.ts` + route từ `Base*Controller` / `BaseCrudController` trong `@workspace/api-server` khi app extend mỏng.

Deploy line check-in — controller/service AUTO-GENERATED từ `@workspace/api-server` + `api.app.config.json`. Native giữ tay: `public.controller.ts`, `system.module.ts`, `public-uploads.controller.ts`. Render: `pnpm api:render:checkin`.

## Global prefix

- Nest `setGlobalPrefix('api')` → URL thực tế: `/api/<path-dưới>`
- Ví dụ: `GET /admin/users` trong bảng = **`GET /api/admin/users`** trên wire.

Nguồn route constants: [`src/config/constants.ts`](../../src/config/constants.ts) (`ADMIN_ROUTES`, `PUBLIC_ROUTES`).

Verify: `pnpm verify:checkin-api` · `pnpm verify:main-api-endpoint-parity` (28 module vs `apps/main/api`) · `pnpm verify:api-contract`.

## Prefix admin (`ADMIN_ROUTES`)

| Key | Path (không gồm `/api`) |
|-----|------------------------|
| `BASE` | `/admin` |
| `ACADEMIC_YEARS` | `/admin/academic-years` |
| `ACCOUNTS` | `/admin/accounts` |
| `ADMISSION_RESULTS` | `/admin/admission-results` |
| `CAMERAS` | `/admin/cameras` |
| `CATEGORIES` | `/admin/categories` |
| `COMMENTS` | `/admin/comments` |
| `CONTACT_REQUESTS` | `/admin/contact-requests` |
| `CONVERSATIONS` | `/admin/conversations` |
| `COURSES` | `/admin/courses` |
| `DASHBOARD` | `/admin/dashboard` |
| `DEPARTMENTS` | `/admin/departments` |
| `EVENT_CHECKINS` | `/admin/event-checkins` |
| `EVENT_CHECKOUTS` | `/admin/event-checkouts` |
| `EVENT_REGISTRATIONS` | `/admin/event-registrations` |
| `EVENT_SPEAKERS` | `/admin/event-speakers` |
| `EVENTS` | `/admin/events` |
| `FACE_DATA` | `/admin/face-data` |
| `GROUPS` | `/admin/groups` |
| `IMPORTED_USERS` | `/admin/imported-users` |
| `LOCATIONS` | `/admin/locations` |
| `MAJORS` | `/admin/majors` |
| `MESSAGES` | `/admin/messages` |
| `NOTIFICATIONS` | `/admin/notifications` |
| `ORDERS` | `/admin/orders` |
| `PAGE_CONTENTS` | `/admin/page-contents` |
| `PARENT_STUDENTS` | `/admin/parent-students` |
| `POSTS` | `/admin/posts` |
| `PRODUCTS` | `/admin/products` |
| `PROMO_CODES` | `/admin/promo-codes` |
| `ROLES` | `/admin/roles` |
| `SCREENS` | `/admin/screens` |
| `SEO_METAS` | `/admin/seo-metas` |
| `SESSIONS` | `/admin/sessions` |
| `SETTINGS` | `/admin/settings` |
| `SPEAKERS` | `/admin/speakers` |
| `STUDENTS` | `/admin/students` |
| `SYSTEM` | `/admin/system` |
| `TAGS` | `/admin/tags` |
| `TEMPLATES` | `/admin/templates` |
| `TRAINING_LEVELS` | `/admin/training-levels` |
| `TRAINING_SYSTEMS` | `/admin/training-systems` |
| `UPLOADS` | `/admin/uploads` |
| `USERS` | `/admin/users` |
| `AUTH` | `/auth/admin` |

## Prefix public & khác (`PUBLIC_ROUTES` + uploads)

| Key | Path |
|-----|------|
| `PARENT_MY_STUDENTS` | `/parent/my-students` |
| `BASE` | `/public` |
| `ADMISSION_RESULTS_LOOKUP` | `/public/admission-results/lookup` |
| `CATEGORIES` | `/public/categories` |
| `CONTACT_REQUESTS` | `/public/contact-requests` |
| `EVENT_CATEGORIES` | `/public/event-categories` |
| `EVENTS` | `/public/events` |
| `HANET_WEBHOOK` | `/public/hanet/webhook` |
| `HOME_ADMISSION_POSTS` | `/public/home-admission-posts` |
| `PAGE_CONTENTS` | `/public/page-contents` |
| `POSTS` | `/public/posts` |
| `SEO_META` | `/public/seo-meta` |
| `SITE_BRANDING` | `/public/site-branding` |
| `SERVE_UPLOADS` | `/uploads` |

## Endpoint theo domain (Nest controller)

Cột **Package** = HTTP khai báo trên `packages/api-server` (app chỉ extend).

### `academic-years`

- **Controller:** `src/academic-years/academic-years.controller.ts`
- **Base:** `/admin/academic-years`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `accounts`

- **Controller:** `src/accounts/accounts.controller.ts`
- **Base:** `/admin/accounts`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `admission-results`

- **Controller:** `src/admission-results/admission-results.controller.ts`
- **Base:** `/admin/admission-results`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `auth`

- **Controller:** `src/auth/auth.controller.ts`
- **Base:** `/auth/admin`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `cameras`

- **Controller:** `src/cameras/cameras.controller.ts`
- **Base:** `/admin/cameras`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `carts`

- **Controller:** `src/carts/carts.controller.ts`
- **Base:** `/public/cart`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/public/cart` | `/api/public/cart` |
| `GET` | `/public/cart` | `/api/public/cart` |
| `PUT` | `/public/cart` | `/api/public/cart` |

### `categories`

- **Controller:** `src/categories/categories.controller.ts`
- **Base:** `/admin/categories`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `comments`

- **Controller:** `src/comments/comments.controller.ts`
- **Base:** `/admin/comments`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `common`

- **Controller:** `src/common/crud/base-crud.controller.ts`
- **Base:** `/admin/posts, /admin/accounts, /auth/admin, /public, /admin/comments, /admin/event-checkins, /admin/event-registrations, /admin/event-speakers, /admin/events, /admin, /admin/page-contents, /admin/sessions, /admin/system, /users`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/comments/:id` | `/api/admin/comments/:id` |
| `DELETE` | `/admin/comments/:id/hard-delete` | `/api/admin/comments/:id/hard-delete` |
| `DELETE` | `/admin/event-checkins/:id` | `/api/admin/event-checkins/:id` |
| `DELETE` | `/admin/event-checkins/:id/hard-delete` | `/api/admin/event-checkins/:id/hard-delete` |
| `DELETE` | `/admin/event-registrations/:id` | `/api/admin/event-registrations/:id` |
| `DELETE` | `/admin/event-registrations/:id/hard-delete` | `/api/admin/event-registrations/:id/hard-delete` |
| `DELETE` | `/admin/event-speakers/:id` | `/api/admin/event-speakers/:id` |
| `DELETE` | `/admin/events/:id` | `/api/admin/events/:id` |
| `DELETE` | `/admin/events/:id/hard-delete` | `/api/admin/events/:id/hard-delete` |
| `DELETE` | `/admin/notifications/:id` | `/api/admin/notifications/:id` |
| `DELETE` | `/admin/page-contents/:id` | `/api/admin/page-contents/:id` |
| `DELETE` | `/admin/posts/:id` | `/api/admin/posts/:id` |
| `DELETE` | `/admin/posts/:id/hard` | `/api/admin/posts/:id/hard` |
| `DELETE` | `/admin/posts/:id/hard-delete` | `/api/admin/posts/:id/hard-delete` |
| `DELETE` | `/admin/sessions/:id` | `/api/admin/sessions/:id` |
| `DELETE` | `/admin/sessions/:id/hard-delete` | `/api/admin/sessions/:id/hard-delete` |
| `DELETE` | `/users/:id` | `/api/users/:id` |
| `DELETE` | `/users/:id/hard-delete` | `/api/users/:id/hard-delete` |
| `GET` | `/admin/accounts` | `/api/admin/accounts` |
| `GET` | `/admin/comments/:id` | `/api/admin/comments/:id` |
| `GET` | `/admin/comments/options` | `/api/admin/comments/options` |
| `GET` | `/admin/event-checkins` | `/api/admin/event-checkins` |
| `GET` | `/admin/event-checkins/:id` | `/api/admin/event-checkins/:id` |
| `GET` | `/admin/event-registrations` | `/api/admin/event-registrations` |
| `GET` | `/admin/event-registrations/:id` | `/api/admin/event-registrations/:id` |
| `GET` | `/admin/event-speakers` | `/api/admin/event-speakers` |
| `GET` | `/admin/event-speakers/:id` | `/api/admin/event-speakers/:id` |
| `GET` | `/admin/events/:id` | `/api/admin/events/:id` |
| `GET` | `/admin/notifications` | `/api/admin/notifications` |
| `GET` | `/admin/notifications/options` | `/api/admin/notifications/options` |
| `GET` | `/admin/notifications/table` | `/api/admin/notifications/table` |
| `GET` | `/admin/page-contents` | `/api/admin/page-contents` |
| `GET` | `/admin/page-contents/:id` | `/api/admin/page-contents/:id` |
| `GET` | `/admin/posts` | `/api/admin/posts` |
| `GET` | `/admin/posts/:id` | `/api/admin/posts/:id` |
| `GET` | `/admin/posts/dates-with-posts` | `/api/admin/posts/dates-with-posts` |
| `GET` | `/admin/posts/options` | `/api/admin/posts/options` |
| `GET` | `/admin/sessions` | `/api/admin/sessions` |
| `GET` | `/admin/sessions/:id` | `/api/admin/sessions/:id` |
| `GET` | `/admin/sessions/accounts` | `/api/admin/sessions/accounts` |
| `GET` | `/admin/sessions/options` | `/api/admin/sessions/options` |
| `GET` | `/admin/system/database-schema` | `/api/admin/system/database-schema` |
| `GET` | `/admin/system/export` | `/api/admin/system/export` |
| `GET` | `/admin/system/export/excel` | `/api/admin/system/export/excel` |
| `GET` | `/admin/system/import-config` | `/api/admin/system/import-config` |
| `GET` | `/admin/system/models` | `/api/admin/system/models` |
| `GET` | `/admin/unread-counts` | `/api/admin/unread-counts` |
| `GET` | `/auth/admin/google/config` | `/api/auth/admin/google/config` |
| `GET` | `/auth/admin/me` | `/api/auth/admin/me` |
| `GET` | `/public/auth/dev-login-options` | `/api/public/auth/dev-login-options` |
| `GET` | `/public/auth/google/config` | `/api/public/auth/google/config` |
| `GET` | `/public/dev-login-options` | `/api/public/dev-login-options` |
| `GET` | `/public/site-branding` | `/api/public/site-branding` |
| `GET` | `/users` | `/api/users` |
| `GET` | `/users/:id` | `/api/users/:id` |
| `GET` | `/users/dev-login-options` | `/api/users/dev-login-options` |
| `GET` | `/users/options` | `/api/users/options` |
| `PATCH` | `/admin/notifications/:id` | `/api/admin/notifications/:id` |
| `POST` | `/admin/accounts/avatar` | `/api/admin/accounts/avatar` |
| `POST` | `/admin/comments/:id/approve` | `/api/admin/comments/:id/approve` |
| `POST` | `/admin/comments/:id/restore` | `/api/admin/comments/:id/restore` |
| `POST` | `/admin/comments/:id/unapprove` | `/api/admin/comments/:id/unapprove` |
| `POST` | `/admin/comments/bulk` | `/api/admin/comments/bulk` |
| `POST` | `/admin/event-checkins` | `/api/admin/event-checkins` |
| `POST` | `/admin/event-checkins/:id/restore` | `/api/admin/event-checkins/:id/restore` |
| `POST` | `/admin/event-checkins/bulk` | `/api/admin/event-checkins/bulk` |
| `POST` | `/admin/event-registrations` | `/api/admin/event-registrations` |
| `POST` | `/admin/event-registrations/:id/attendance` | `/api/admin/event-registrations/:id/attendance` |
| `POST` | `/admin/event-registrations/:id/restore` | `/api/admin/event-registrations/:id/restore` |
| `POST` | `/admin/event-registrations/bulk` | `/api/admin/event-registrations/bulk` |
| `POST` | `/admin/event-speakers` | `/api/admin/event-speakers` |
| `POST` | `/admin/event-speakers/bulk` | `/api/admin/event-speakers/bulk` |
| `POST` | `/admin/events` | `/api/admin/events` |
| `POST` | `/admin/events/:id/restore` | `/api/admin/events/:id/restore` |
| `POST` | `/admin/events/bulk` | `/api/admin/events/bulk` |
| `POST` | `/admin/notifications/bulk` | `/api/admin/notifications/bulk` |
| `POST` | `/admin/notifications/mark-all-read` | `/api/admin/notifications/mark-all-read` |
| `POST` | `/admin/page-contents` | `/api/admin/page-contents` |
| `POST` | `/admin/page-contents/bulk` | `/api/admin/page-contents/bulk` |
| `POST` | `/admin/posts` | `/api/admin/posts` |
| `POST` | `/admin/posts/:id/restore` | `/api/admin/posts/:id/restore` |
| `POST` | `/admin/posts/bulk` | `/api/admin/posts/bulk` |
| `POST` | `/admin/sessions` | `/api/admin/sessions` |
| `POST` | `/admin/sessions/:id/restore` | `/api/admin/sessions/:id/restore` |
| `POST` | `/admin/sessions/bulk` | `/api/admin/sessions/bulk` |
| `POST` | `/admin/sessions/revoke-by-user/:userId` | `/api/admin/sessions/revoke-by-user/:userId` |
| `POST` | `/admin/system/import` | `/api/admin/system/import` |
| `POST` | `/admin/system/import/excel` | `/api/admin/system/import/excel` |
| `POST` | `/admin/system/seed-bootstrap` | `/api/admin/system/seed-bootstrap` |
| `POST` | `/auth/admin/dev-login` | `/api/auth/admin/dev-login` |
| `POST` | `/auth/admin/google` | `/api/auth/admin/google` |
| `POST` | `/auth/admin/login` | `/api/auth/admin/login` |
| `POST` | `/auth/admin/logout` | `/api/auth/admin/logout` |
| `POST` | `/public/auth/dev-login` | `/api/public/auth/dev-login` |
| `POST` | `/public/auth/google` | `/api/public/auth/google` |
| `POST` | `/public/auth/guest-dev-login` | `/api/public/auth/guest-dev-login` |
| `POST` | `/public/auth/guest-login` | `/api/public/auth/guest-login` |
| `POST` | `/public/auth/login` | `/api/public/auth/login` |
| `POST` | `/public/auth/store-dev-login` | `/api/public/auth/store-dev-login` |
| `POST` | `/public/auth/store-login` | `/api/public/auth/store-login` |
| `POST` | `/public/contact-requests` | `/api/public/contact-requests` |
| `POST` | `/public/register` | `/api/public/register` |
| `POST` | `/users` | `/api/users` |
| `POST` | `/users/:id/restore` | `/api/users/:id/restore` |
| `POST` | `/users/bulk` | `/api/users/bulk` |
| `PUT` | `/admin/accounts` | `/api/admin/accounts` |
| `PUT` | `/admin/event-checkins/:id` | `/api/admin/event-checkins/:id` |
| `PUT` | `/admin/event-registrations/:id` | `/api/admin/event-registrations/:id` |
| `PUT` | `/admin/event-speakers/:id` | `/api/admin/event-speakers/:id` |
| `PUT` | `/admin/events/:id` | `/api/admin/events/:id` |
| `PUT` | `/admin/page-contents/:id` | `/api/admin/page-contents/:id` |
| `PUT` | `/admin/posts/:id` | `/api/admin/posts/:id` |
| `PUT` | `/admin/sessions/:id` | `/api/admin/sessions/:id` |
| `PUT` | `/users/:id` | `/api/users/:id` |

### `contact-requests`

- **Controller:** `src/contact-requests/contact-requests.controller.ts`
- **Base:** `/admin/contact-requests`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `courses`

- **Controller:** `src/courses/courses.controller.ts`
- **Base:** `/admin/courses`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `dashboard`

- **Controller:** `src/dashboard/dashboard.controller.ts`
- **Base:** `/admin/dashboard`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `departments`

- **Controller:** `src/departments/departments.controller.ts`
- **Base:** `/admin/departments`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `event-checkins`

- **Controller:** `src/event-checkins/event-checkins.controller.ts`
- **Base:** `/admin/event-checkins`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `event-checkouts`

- **Controller:** `src/event-checkouts/event-checkouts.controller.ts`
- **Base:** `/admin/event-checkouts`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `event-registrations`

- **Controller:** `src/event-registrations/event-registrations.controller.ts`
- **Base:** `/admin/event-registrations`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `event-speakers`

- **Controller:** `src/event-speakers/event-speakers.controller.ts`
- **Base:** `/admin/event-speakers`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `events`

- **Controller:** `src/events/events.controller.ts`
- **Base:** `/admin/events`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `face-data`

- **Controller:** `src/face-data/face-data.controller.ts`
- **Base:** `/admin/face-data`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `groups`

- **Controller:** `src/groups/groups.controller.ts`
- **Base:** `/admin/groups`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `hanet`

- **Controller:** `src/hanet/hanet-webhook.controller.ts`
- **Base:** `/public/hanet/webhook`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `POST` | `/public/hanet/webhook` | `/api/public/hanet/webhook` |
| `POST` | `/public/hanet/webhook/:eventId` | `/api/public/hanet/webhook/:eventId` |

### `imported-users`

- **Controller:** `src/imported-users/imported-users.controller.ts`
- **Base:** `/admin/imported-users`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `locations`

- **Controller:** `src/locations/locations.controller.ts`
- **Base:** `/admin/locations`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `majors`

- **Controller:** `src/majors/majors.controller.ts`
- **Base:** `/admin/majors`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `messages`

- **Controller:** `src/messages/conversations.controller.ts`
- **Base:** `/admin/conversations, /admin/messages`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/admin/conversations` | `/api/admin/conversations` |
| `PATCH` | `/admin/messages/:id` | `/api/admin/messages/:id` |
| `POST` | `/admin/conversations/:otherUserId/mark-read` | `/api/admin/conversations/:otherUserId/mark-read` |
| `POST` | `/admin/messages` | `/api/admin/messages` |

### `notifications`

- **Controller:** `src/notifications/notifications.controller.ts`
- **Base:** `/admin`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `orders`

- **Controller:** `src/orders/orders.controller.ts`
- **Base:** `/admin/orders, /public/orders`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/public/orders` | `/api/public/orders` |
| `GET` | `/public/orders/:id` | `/api/public/orders/:id` |
| `POST` | `/public/orders` | `/api/public/orders` |

### `page-contents`

- **Controller:** `src/page-contents/page-contents.controller.ts`
- **Base:** `/admin/page-contents`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `parent-students`

- **Controller:** `src/parent-students/parent-students.controller.ts`
- **Base:** `/admin/parent-students`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `posts`

- **Controller:** `src/posts/posts.controller.ts`
- **Base:** `/admin/posts`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `products`

- **Controller:** `src/products/products.controller.ts`
- **Base:** `/admin/products, /public/products`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/public/products` | `/api/public/products` |
| `GET` | `/public/products/:id` | `/api/public/products/:id` |
| `GET` | `/public/products/sku/:sku` | `/api/public/products/sku/:sku` |

### `promo-codes`

- **Controller:** `src/promo-codes/promo-codes.controller.ts`
- **Base:** `/admin/promo-codes, /public/promo-codes`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/public/promo-codes` | `/api/public/promo-codes` |

### `proxy-image`

- **Controller:** `src/proxy-image/proxy-image.controller.ts`
- **Base:** `/admin`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/admin/proxy-image` | `/api/admin/proxy-image` |
| `GET` | `/admin/proxy-image/` | `/api/admin/proxy-image/` |

### `public`

- **Controller:** `src/public/public.controller.ts`
- **Base:** `/public`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/public/admission-results/lookup` | `/api/public/admission-results/lookup` |
| `GET` | `/public/auth/dev-login-options` | `/api/public/auth/dev-login-options` |
| `GET` | `/public/auth/google/config` | `/api/public/auth/google/config` |
| `GET` | `/public/categories` | `/api/public/categories` |
| `GET` | `/public/dev-login-options` | `/api/public/dev-login-options` |
| `GET` | `/public/event-categories` | `/api/public/event-categories` |
| `GET` | `/public/events` | `/api/public/events` |
| `GET` | `/public/events/:slug` | `/api/public/events/:slug` |
| `GET` | `/public/home-admission-posts` | `/api/public/home-admission-posts` |
| `GET` | `/public/me/events` | `/api/public/me/events` |
| `GET` | `/public/page-contents/:pageKey` | `/api/public/page-contents/:pageKey` |
| `GET` | `/public/posts` | `/api/public/posts` |
| `GET` | `/public/posts/:slug` | `/api/public/posts/:slug` |
| `GET` | `/public/seo-meta` | `/api/public/seo-meta` |
| `GET` | `/public/site-branding` | `/api/public/site-branding` |
| `POST` | `/public/auth/dev-login` | `/api/public/auth/dev-login` |
| `POST` | `/public/auth/google` | `/api/public/auth/google` |
| `POST` | `/public/auth/guest-dev-login` | `/api/public/auth/guest-dev-login` |
| `POST` | `/public/auth/guest-login` | `/api/public/auth/guest-login` |
| `POST` | `/public/auth/login` | `/api/public/auth/login` |
| `POST` | `/public/auth/store-dev-login` | `/api/public/auth/store-dev-login` |
| `POST` | `/public/auth/store-login` | `/api/public/auth/store-login` |
| `POST` | `/public/contact-requests` | `/api/public/contact-requests` |
| `POST` | `/public/events/:slug/register` | `/api/public/events/:slug/register` |
| `POST` | `/public/me/event-registrations/:id/cancel` | `/api/public/me/event-registrations/:id/cancel` |
| `POST` | `/public/posts/:slug/view` | `/api/public/posts/:slug/view` |
| `POST` | `/public/register` | `/api/public/register` |

### `roles`

- **Controller:** `src/roles/roles.controller.ts`
- **Base:** `/admin/roles`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `screens`

- **Controller:** `src/screens/screens.controller.ts`
- **Base:** `/admin/screens`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `seo-metas`

- **Controller:** `src/seo-metas/seo-metas.controller.ts`
- **Base:** `/admin/seo-metas`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `sessions`

- **Controller:** `src/sessions/sessions.controller.ts`
- **Base:** `/admin/sessions`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `settings`

- **Controller:** `src/settings/settings.controller.ts`
- **Base:** `/admin/settings`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `speakers`

- **Controller:** `src/speakers/speakers.controller.ts`
- **Base:** `/admin/speakers`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `students`

- **Controller:** `src/students/students.controller.ts`
- **Base:** `/admin/students`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `system`

- **Controller:** `src/system/system.controller.ts`
- **Base:** `/admin/system`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `tags`

- **Controller:** `src/tags/tags.controller.ts`
- **Base:** `/admin/tags`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `templates`

- **Controller:** `src/templates/templates.controller.ts`
- **Base:** `/admin/templates`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `training-levels`

- **Controller:** `src/training-levels/training-levels.controller.ts`
- **Base:** `/admin/training-levels`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `training-systems`

- **Controller:** `src/training-systems/training-systems.controller.ts`
- **Base:** `/admin/training-systems`

_Không trích được `@Get`/`@Post` — kiểm tra decorator._

### `uploads`

- **Controller:** `src/uploads/public-uploads.controller.ts`
- **Base:** `/uploads, /admin/uploads`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/uploads` | `/api/admin/uploads` |
| `GET` | `/admin/uploads` | `/api/admin/uploads` |
| `GET` | `/admin/uploads/export` | `/api/admin/uploads/export` |
| `GET` | `/admin/uploads/serve/*path` | `/api/admin/uploads/serve/*path` |
| `GET` | `/uploads/*path` | `/api/uploads/*path` |
| `GET` | `/uploads/resized/*path` | `/api/uploads/resized/*path` |
| `POST` | `/admin/uploads` | `/api/admin/uploads` |
| `POST` | `/admin/uploads/bulk-delete` | `/api/admin/uploads/bulk-delete` |
| `POST` | `/admin/uploads/bulk-move` | `/api/admin/uploads/bulk-move` |
| `POST` | `/admin/uploads/import` | `/api/admin/uploads/import` |
| `POST` | `/admin/uploads/reorganize-date-folders` | `/api/admin/uploads/reorganize-date-folders` |

### `users`

- **Controller:** `src/users/users.controller.ts`
- **Base:** `/admin/users`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/users/:id/hard-delete` | `/api/admin/users/:id/hard-delete` |
| `POST` | `/admin/users` | `/api/admin/users` |
| `POST` | `/admin/users/:id/restore` | `/api/admin/users/:id/restore` |
| `POST` | `/admin/users/bulk` | `/api/admin/users/bulk` |
| `PUT` | `/admin/users/:id` | `/api/admin/users/:id` |

## Liên kết

- Main dev API: [`../../main/api/.graphify/markdown/API_ENDPOINTS.md`](../../main/api/.graphify/markdown/API_ENDPOINTS.md)
- Monorepo: [ROUTE_SURFACE.md](../../../../.graphify/markdown/ROUTE_SURFACE.md)
- [`../README.md`](../README.md) · [`SUMMARY_FOR_AI.md`](SUMMARY_FOR_AI.md) · [`packages/api-server/README.md`](../../../../packages/api-server/README.md)

## Làm mới

```bash
pnpm api:render:checkin && node script-system/graphify/graphify-update.cjs apps/hub-event/api
pnpm graphify:ai-summary
```
