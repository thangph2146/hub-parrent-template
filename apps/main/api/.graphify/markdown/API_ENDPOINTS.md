# API endpoints — @api (`apps/main/api`)

> **Sinh tự động:** `2026-06-13T21:25:57.651Z` — quét `src/**/*.controller.ts` + route từ `Base*Controller` / `BaseCrudController` trong `@workspace/api-server` khi app extend mỏng.

## Global prefix

- Nest `setGlobalPrefix('api')` → URL thực tế: `/api/<path-dưới>`
- Ví dụ: `GET /admin/users` trong bảng = **`GET /api/admin/users`** trên wire.

Nguồn route constants: [`src/config/constants.ts`](../../src/config/constants.ts) (`ADMIN_ROUTES`, `PUBLIC_ROUTES`).

Verify contract: `pnpm verify:api-contract` · parity package: `pnpm verify:main-api-endpoint-parity`.

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

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/academic-years/:id` | `/api/admin/academic-years/:id` |
| `DELETE` | `/admin/academic-years/:id/hard-delete` | `/api/admin/academic-years/:id/hard-delete` |
| `GET` | `/admin/academic-years` | `/api/admin/academic-years` |
| `GET` | `/admin/academic-years/:id` | `/api/admin/academic-years/:id` |
| `POST` | `/admin/academic-years` | `/api/admin/academic-years` |
| `POST` | `/admin/academic-years/:id/restore` | `/api/admin/academic-years/:id/restore` |
| `POST` | `/admin/academic-years/bulk` | `/api/admin/academic-years/bulk` |
| `PUT` | `/admin/academic-years/:id` | `/api/admin/academic-years/:id` |

### `accounts`

- **Controller:** `src/accounts/accounts.controller.ts`
- **Base:** `/admin/accounts`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/admin/accounts` | `/api/admin/accounts` |
| `POST` | `/admin/accounts/avatar` | `/api/admin/accounts/avatar` |
| `PUT` | `/admin/accounts` | `/api/admin/accounts` |

### `admission-results`

- **Controller:** `src/admission-results/admission-results.controller.ts`
- **Base:** `/admin/admission-results`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/admission-results/:id` | `/api/admin/admission-results/:id` |
| `DELETE` | `/admin/admission-results/:id/hard-delete` | `/api/admin/admission-results/:id/hard-delete` |
| `GET` | `/admin/admission-results` | `/api/admin/admission-results` |
| `GET` | `/admin/admission-results/:id` | `/api/admin/admission-results/:id` |
| `GET` | `/admin/admission-results/options` | `/api/admin/admission-results/options` |
| `POST` | `/admin/admission-results` | `/api/admin/admission-results` |
| `POST` | `/admin/admission-results/:id/restore` | `/api/admin/admission-results/:id/restore` |
| `POST` | `/admin/admission-results/bulk` | `/api/admin/admission-results/bulk` |
| `PUT` | `/admin/admission-results/:id` | `/api/admin/admission-results/:id` |

### `auth`

- **Controller:** `src/auth/auth.controller.ts`
- **Base:** `/auth/admin`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/auth/admin/google/config` | `/api/auth/admin/google/config` |
| `GET` | `/auth/admin/me` | `/api/auth/admin/me` |
| `POST` | `/auth/admin/dev-login` | `/api/auth/admin/dev-login` |
| `POST` | `/auth/admin/google` | `/api/auth/admin/google` |
| `POST` | `/auth/admin/login` | `/api/auth/admin/login` |
| `POST` | `/auth/admin/logout` | `/api/auth/admin/logout` |

### `cameras`

- **Controller:** `src/cameras/cameras.controller.ts`
- **Base:** `/admin/cameras`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/cameras/:id` | `/api/admin/cameras/:id` |
| `DELETE` | `/admin/cameras/:id/hard-delete` | `/api/admin/cameras/:id/hard-delete` |
| `GET` | `/admin/cameras` | `/api/admin/cameras` |
| `GET` | `/admin/cameras/:id` | `/api/admin/cameras/:id` |
| `POST` | `/admin/cameras` | `/api/admin/cameras` |
| `POST` | `/admin/cameras/:id/restore` | `/api/admin/cameras/:id/restore` |
| `POST` | `/admin/cameras/bulk` | `/api/admin/cameras/bulk` |
| `PUT` | `/admin/cameras/:id` | `/api/admin/cameras/:id` |

### `carts`

- **Controller:** `src/carts/public-carts.controller.ts`
- **Base:** `/public/cart`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/public/cart` | `/api/public/cart` |
| `GET` | `/public/cart` | `/api/public/cart` |
| `PUT` | `/public/cart` | `/api/public/cart` |

### `categories`

- **Controller:** `src/categories/categories.controller.ts`
- **Base:** `/admin/categories`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/categories/:id` | `/api/admin/categories/:id` |
| `DELETE` | `/admin/categories/:id/hard-delete` | `/api/admin/categories/:id/hard-delete` |
| `GET` | `/admin/categories` | `/api/admin/categories` |
| `GET` | `/admin/categories/:id` | `/api/admin/categories/:id` |
| `GET` | `/admin/categories/options` | `/api/admin/categories/options` |
| `POST` | `/admin/categories` | `/api/admin/categories` |
| `POST` | `/admin/categories/:id/restore` | `/api/admin/categories/:id/restore` |
| `POST` | `/admin/categories/bulk` | `/api/admin/categories/bulk` |
| `PUT` | `/admin/categories/:id` | `/api/admin/categories/:id` |

### `comments`

- **Controller:** `src/comments/comments.controller.ts`
- **Base:** `/admin/comments`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/comments/:id` | `/api/admin/comments/:id` |
| `DELETE` | `/admin/comments/:id/hard-delete` | `/api/admin/comments/:id/hard-delete` |
| `GET` | `/admin/comments` | `/api/admin/comments` |
| `GET` | `/admin/comments/:id` | `/api/admin/comments/:id` |
| `GET` | `/admin/comments/options` | `/api/admin/comments/options` |
| `POST` | `/admin/comments/:id/approve` | `/api/admin/comments/:id/approve` |
| `POST` | `/admin/comments/:id/restore` | `/api/admin/comments/:id/restore` |
| `POST` | `/admin/comments/:id/unapprove` | `/api/admin/comments/:id/unapprove` |
| `POST` | `/admin/comments/bulk` | `/api/admin/comments/bulk` |

### `contact-requests`

- **Controller:** `src/contact-requests/contact-requests.controller.ts`
- **Base:** `/admin/contact-requests`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/contact-requests/:id` | `/api/admin/contact-requests/:id` |
| `DELETE` | `/admin/contact-requests/:id/hard-delete` | `/api/admin/contact-requests/:id/hard-delete` |
| `GET` | `/admin/contact-requests` | `/api/admin/contact-requests` |
| `GET` | `/admin/contact-requests/:id` | `/api/admin/contact-requests/:id` |
| `GET` | `/admin/contact-requests/options` | `/api/admin/contact-requests/options` |
| `POST` | `/admin/contact-requests/:id/assign` | `/api/admin/contact-requests/:id/assign` |
| `POST` | `/admin/contact-requests/:id/restore` | `/api/admin/contact-requests/:id/restore` |
| `POST` | `/admin/contact-requests/bulk` | `/api/admin/contact-requests/bulk` |
| `PUT` | `/admin/contact-requests/:id` | `/api/admin/contact-requests/:id` |

### `courses`

- **Controller:** `src/courses/courses.controller.ts`
- **Base:** `/admin/courses`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/courses/:id` | `/api/admin/courses/:id` |
| `DELETE` | `/admin/courses/:id/hard-delete` | `/api/admin/courses/:id/hard-delete` |
| `GET` | `/admin/courses` | `/api/admin/courses` |
| `GET` | `/admin/courses/:id` | `/api/admin/courses/:id` |
| `POST` | `/admin/courses` | `/api/admin/courses` |
| `POST` | `/admin/courses/:id/restore` | `/api/admin/courses/:id/restore` |
| `POST` | `/admin/courses/bulk` | `/api/admin/courses/bulk` |
| `PUT` | `/admin/courses/:id` | `/api/admin/courses/:id` |

### `dashboard`

- **Controller:** `src/dashboard/dashboard.controller.ts`
- **Base:** `/admin/dashboard`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/admin/dashboard/stats` | `/api/admin/dashboard/stats` |

### `departments`

- **Controller:** `src/departments/departments.controller.ts`
- **Base:** `/admin/departments`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/departments/:id` | `/api/admin/departments/:id` |
| `DELETE` | `/admin/departments/:id/hard-delete` | `/api/admin/departments/:id/hard-delete` |
| `GET` | `/admin/departments` | `/api/admin/departments` |
| `GET` | `/admin/departments/:id` | `/api/admin/departments/:id` |
| `POST` | `/admin/departments` | `/api/admin/departments` |
| `POST` | `/admin/departments/:id/restore` | `/api/admin/departments/:id/restore` |
| `POST` | `/admin/departments/bulk` | `/api/admin/departments/bulk` |
| `PUT` | `/admin/departments/:id` | `/api/admin/departments/:id` |

### `event-checkins`

- **Controller:** `src/event-checkins/event-checkins.controller.ts`
- **Base:** `/admin/event-checkins`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/event-checkins/:id` | `/api/admin/event-checkins/:id` |
| `DELETE` | `/admin/event-checkins/:id/hard-delete` | `/api/admin/event-checkins/:id/hard-delete` |
| `GET` | `/admin/event-checkins` | `/api/admin/event-checkins` |
| `GET` | `/admin/event-checkins/:id` | `/api/admin/event-checkins/:id` |
| `POST` | `/admin/event-checkins` | `/api/admin/event-checkins` |
| `POST` | `/admin/event-checkins/:id/restore` | `/api/admin/event-checkins/:id/restore` |
| `POST` | `/admin/event-checkins/bulk` | `/api/admin/event-checkins/bulk` |
| `PUT` | `/admin/event-checkins/:id` | `/api/admin/event-checkins/:id` |

### `event-checkouts`

- **Controller:** `src/event-checkouts/event-checkouts.controller.ts`
- **Base:** `/admin/event-checkouts`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/admin/event-checkouts` | `/api/admin/event-checkouts` |
| `POST` | `/admin/event-checkouts/bulk` | `/api/admin/event-checkouts/bulk` |

### `event-registrations`

- **Controller:** `src/event-registrations/event-registrations.controller.ts`
- **Base:** `/admin/event-registrations`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/event-registrations/:id` | `/api/admin/event-registrations/:id` |
| `DELETE` | `/admin/event-registrations/:id/hard-delete` | `/api/admin/event-registrations/:id/hard-delete` |
| `GET` | `/admin/event-registrations` | `/api/admin/event-registrations` |
| `GET` | `/admin/event-registrations/:id` | `/api/admin/event-registrations/:id` |
| `POST` | `/admin/event-registrations` | `/api/admin/event-registrations` |
| `POST` | `/admin/event-registrations/:id/attendance` | `/api/admin/event-registrations/:id/attendance` |
| `POST` | `/admin/event-registrations/:id/restore` | `/api/admin/event-registrations/:id/restore` |
| `POST` | `/admin/event-registrations/bulk` | `/api/admin/event-registrations/bulk` |
| `PUT` | `/admin/event-registrations/:id` | `/api/admin/event-registrations/:id` |

### `event-speakers`

- **Controller:** `src/event-speakers/event-speakers.controller.ts`
- **Base:** `/admin/event-speakers`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/event-speakers/:id` | `/api/admin/event-speakers/:id` |
| `GET` | `/admin/event-speakers` | `/api/admin/event-speakers` |
| `GET` | `/admin/event-speakers/:id` | `/api/admin/event-speakers/:id` |
| `POST` | `/admin/event-speakers` | `/api/admin/event-speakers` |
| `POST` | `/admin/event-speakers/bulk` | `/api/admin/event-speakers/bulk` |
| `PUT` | `/admin/event-speakers/:id` | `/api/admin/event-speakers/:id` |

### `events`

- **Controller:** `src/events/events.controller.ts`
- **Base:** `/admin/events`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/events/:id` | `/api/admin/events/:id` |
| `DELETE` | `/admin/events/:id/hard-delete` | `/api/admin/events/:id/hard-delete` |
| `GET` | `/admin/events` | `/api/admin/events` |
| `GET` | `/admin/events/:id` | `/api/admin/events/:id` |
| `POST` | `/admin/events` | `/api/admin/events` |
| `POST` | `/admin/events/:id/restore` | `/api/admin/events/:id/restore` |
| `POST` | `/admin/events/bulk` | `/api/admin/events/bulk` |
| `PUT` | `/admin/events/:id` | `/api/admin/events/:id` |

### `face-data`

- **Controller:** `src/face-data/face-data.controller.ts`
- **Base:** `/admin/face-data`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/face-data/:id` | `/api/admin/face-data/:id` |
| `DELETE` | `/admin/face-data/:id/hard-delete` | `/api/admin/face-data/:id/hard-delete` |
| `GET` | `/admin/face-data` | `/api/admin/face-data` |
| `GET` | `/admin/face-data/:id` | `/api/admin/face-data/:id` |
| `POST` | `/admin/face-data` | `/api/admin/face-data` |
| `POST` | `/admin/face-data/:id/restore` | `/api/admin/face-data/:id/restore` |
| `POST` | `/admin/face-data/bulk` | `/api/admin/face-data/bulk` |
| `PUT` | `/admin/face-data/:id` | `/api/admin/face-data/:id` |

### `groups`

- **Controller:** `src/groups/groups.controller.ts`
- **Base:** `/admin/groups`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/groups/:id` | `/api/admin/groups/:id` |
| `DELETE` | `/admin/groups/:id/hard-delete` | `/api/admin/groups/:id/hard-delete` |
| `DELETE` | `/admin/groups/:id/members/:userId` | `/api/admin/groups/:id/members/:userId` |
| `GET` | `/admin/groups` | `/api/admin/groups` |
| `GET` | `/admin/groups/:id` | `/api/admin/groups/:id` |
| `GET` | `/admin/groups/:id/messages` | `/api/admin/groups/:id/messages` |
| `PATCH` | `/admin/groups/:id` | `/api/admin/groups/:id` |
| `PATCH` | `/admin/groups/:id/members/:userId/role` | `/api/admin/groups/:id/members/:userId/role` |
| `POST` | `/admin/groups` | `/api/admin/groups` |
| `POST` | `/admin/groups/:id/mark-read` | `/api/admin/groups/:id/mark-read` |
| `POST` | `/admin/groups/:id/members` | `/api/admin/groups/:id/members` |
| `POST` | `/admin/groups/:id/restore` | `/api/admin/groups/:id/restore` |

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

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/imported-users/:id` | `/api/admin/imported-users/:id` |
| `DELETE` | `/admin/imported-users/:id/hard-delete` | `/api/admin/imported-users/:id/hard-delete` |
| `GET` | `/admin/imported-users` | `/api/admin/imported-users` |
| `GET` | `/admin/imported-users/:id` | `/api/admin/imported-users/:id` |
| `POST` | `/admin/imported-users` | `/api/admin/imported-users` |
| `POST` | `/admin/imported-users/:id/restore` | `/api/admin/imported-users/:id/restore` |
| `POST` | `/admin/imported-users/bulk` | `/api/admin/imported-users/bulk` |
| `PUT` | `/admin/imported-users/:id` | `/api/admin/imported-users/:id` |

### `locations`

- **Controller:** `src/locations/locations.controller.ts`
- **Base:** `/admin/locations`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/locations/:id` | `/api/admin/locations/:id` |
| `DELETE` | `/admin/locations/:id/hard-delete` | `/api/admin/locations/:id/hard-delete` |
| `GET` | `/admin/locations` | `/api/admin/locations` |
| `GET` | `/admin/locations/:id` | `/api/admin/locations/:id` |
| `POST` | `/admin/locations` | `/api/admin/locations` |
| `POST` | `/admin/locations/:id/restore` | `/api/admin/locations/:id/restore` |
| `POST` | `/admin/locations/bulk` | `/api/admin/locations/bulk` |
| `PUT` | `/admin/locations/:id` | `/api/admin/locations/:id` |

### `majors`

- **Controller:** `src/majors/majors.controller.ts`
- **Base:** `/admin/majors`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/majors/:id` | `/api/admin/majors/:id` |
| `DELETE` | `/admin/majors/:id/hard-delete` | `/api/admin/majors/:id/hard-delete` |
| `GET` | `/admin/majors` | `/api/admin/majors` |
| `GET` | `/admin/majors/:id` | `/api/admin/majors/:id` |
| `POST` | `/admin/majors` | `/api/admin/majors` |
| `POST` | `/admin/majors/:id/restore` | `/api/admin/majors/:id/restore` |
| `POST` | `/admin/majors/bulk` | `/api/admin/majors/bulk` |
| `PUT` | `/admin/majors/:id` | `/api/admin/majors/:id` |

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

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/notifications/:id` | `/api/admin/notifications/:id` |
| `GET` | `/admin/notifications` | `/api/admin/notifications` |
| `GET` | `/admin/notifications/options` | `/api/admin/notifications/options` |
| `GET` | `/admin/notifications/table` | `/api/admin/notifications/table` |
| `GET` | `/admin/unread-counts` | `/api/admin/unread-counts` |
| `PATCH` | `/admin/notifications/:id` | `/api/admin/notifications/:id` |
| `POST` | `/admin/notifications/bulk` | `/api/admin/notifications/bulk` |
| `POST` | `/admin/notifications/mark-all-read` | `/api/admin/notifications/mark-all-read` |

### `orders`

- **Controller:** `src/orders/orders.controller.ts`
- **Base:** `/admin/orders, /public/orders`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/orders/:id` | `/api/admin/orders/:id` |
| `GET` | `/admin/orders` | `/api/admin/orders` |
| `GET` | `/admin/orders/:id` | `/api/admin/orders/:id` |
| `GET` | `/admin/orders/staff/status-counts` | `/api/admin/orders/staff/status-counts` |
| `GET` | `/public/orders` | `/api/public/orders` |
| `GET` | `/public/orders/:id` | `/api/public/orders/:id` |
| `POST` | `/admin/orders` | `/api/admin/orders` |
| `POST` | `/public/orders` | `/api/public/orders` |
| `PUT` | `/admin/orders/:id/status` | `/api/admin/orders/:id/status` |

### `page-contents`

- **Controller:** `src/page-contents/page-contents.controller.ts`
- **Base:** `/admin/page-contents`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/page-contents/:id` | `/api/admin/page-contents/:id` |
| `GET` | `/admin/page-contents` | `/api/admin/page-contents` |
| `GET` | `/admin/page-contents/:id` | `/api/admin/page-contents/:id` |
| `POST` | `/admin/page-contents` | `/api/admin/page-contents` |
| `POST` | `/admin/page-contents/bulk` | `/api/admin/page-contents/bulk` |
| `PUT` | `/admin/page-contents/:id` | `/api/admin/page-contents/:id` |

### `parent-students`

- **Controller:** `src/parent-students/parent-students.controller.ts (multi @Controller)`
- **Base:** `/parent/my-students, /admin/parent-students`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/parent-students/:id` | `/api/admin/parent-students/:id` |
| `DELETE` | `/parent/my-students/:id` | `/api/parent/my-students/:id` |
| `GET` | `/admin/parent-students` | `/api/admin/parent-students` |
| `GET` | `/parent/my-students` | `/api/parent/my-students` |
| `GET` | `/parent/my-students/averages/overall/:studentCode` | `/api/parent/my-students/averages/overall/:studentCode` |
| `GET` | `/parent/my-students/averages/terms/:studentCode` | `/api/parent/my-students/averages/terms/:studentCode` |
| `GET` | `/parent/my-students/averages/year/:studentCode` | `/api/parent/my-students/averages/year/:studentCode` |
| `GET` | `/parent/my-students/grades/:studentCode` | `/api/parent/my-students/grades/:studentCode` |
| `GET` | `/parent/my-students/scores/detailed/:studentCode` | `/api/parent/my-students/scores/detailed/:studentCode` |
| `PATCH` | `/admin/parent-students/:id/review` | `/api/admin/parent-students/:id/review` |
| `POST` | `/parent/my-students` | `/api/parent/my-students` |

### `posts`

- **Controller:** `src/posts/posts.controller.ts`
- **Base:** `/admin/posts`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/posts/:id` | `/api/admin/posts/:id` |
| `DELETE` | `/admin/posts/:id/hard-delete` | `/api/admin/posts/:id/hard-delete` |
| `GET` | `/admin/posts` | `/api/admin/posts` |
| `GET` | `/admin/posts/:id` | `/api/admin/posts/:id` |
| `GET` | `/admin/posts/dates-with-posts` | `/api/admin/posts/dates-with-posts` |
| `GET` | `/admin/posts/options` | `/api/admin/posts/options` |
| `POST` | `/admin/posts` | `/api/admin/posts` |
| `POST` | `/admin/posts/:id/restore` | `/api/admin/posts/:id/restore` |
| `POST` | `/admin/posts/bulk` | `/api/admin/posts/bulk` |
| `PUT` | `/admin/posts/:id` | `/api/admin/posts/:id` |

### `products`

- **Controller:** `src/products/products.controller.ts`
- **Base:** `/admin/products, /public/products`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/products/:id` | `/api/admin/products/:id` |
| `GET` | `/admin/products` | `/api/admin/products` |
| `GET` | `/admin/products/:id` | `/api/admin/products/:id` |
| `GET` | `/public/products` | `/api/public/products` |
| `GET` | `/public/products/:id` | `/api/public/products/:id` |
| `GET` | `/public/products/sku/:sku` | `/api/public/products/sku/:sku` |
| `POST` | `/admin/products` | `/api/admin/products` |
| `POST` | `/admin/products/:id/restore` | `/api/admin/products/:id/restore` |
| `PUT` | `/admin/products/:id` | `/api/admin/products/:id` |

### `promo-codes`

- **Controller:** `src/promo-codes/promo-codes.controller.ts`
- **Base:** `/admin/promo-codes, /public/promo-codes`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/promo-codes/:id` | `/api/admin/promo-codes/:id` |
| `GET` | `/admin/promo-codes` | `/api/admin/promo-codes` |
| `GET` | `/admin/promo-codes/:id` | `/api/admin/promo-codes/:id` |
| `GET` | `/public/promo-codes` | `/api/public/promo-codes` |
| `POST` | `/admin/promo-codes` | `/api/admin/promo-codes` |
| `PUT` | `/admin/promo-codes/:id` | `/api/admin/promo-codes/:id` |

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

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/roles/:id` | `/api/admin/roles/:id` |
| `DELETE` | `/admin/roles/:id/hard-delete` | `/api/admin/roles/:id/hard-delete` |
| `GET` | `/admin/roles` | `/api/admin/roles` |
| `GET` | `/admin/roles/:id` | `/api/admin/roles/:id` |
| `GET` | `/admin/roles/options` | `/api/admin/roles/options` |
| `GET` | `/admin/roles/permissions` | `/api/admin/roles/permissions` |
| `POST` | `/admin/roles` | `/api/admin/roles` |
| `POST` | `/admin/roles/:id/restore` | `/api/admin/roles/:id/restore` |
| `POST` | `/admin/roles/bulk` | `/api/admin/roles/bulk` |
| `PUT` | `/admin/roles/:id` | `/api/admin/roles/:id` |

### `screens`

- **Controller:** `src/screens/screens.controller.ts`
- **Base:** `/admin/screens`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/screens/:id` | `/api/admin/screens/:id` |
| `DELETE` | `/admin/screens/:id/hard-delete` | `/api/admin/screens/:id/hard-delete` |
| `GET` | `/admin/screens` | `/api/admin/screens` |
| `GET` | `/admin/screens/:id` | `/api/admin/screens/:id` |
| `POST` | `/admin/screens` | `/api/admin/screens` |
| `POST` | `/admin/screens/:id/restore` | `/api/admin/screens/:id/restore` |
| `POST` | `/admin/screens/bulk` | `/api/admin/screens/bulk` |
| `PUT` | `/admin/screens/:id` | `/api/admin/screens/:id` |

### `seo-metas`

- **Controller:** `src/seo-metas/seo-metas.controller.ts`
- **Base:** `/admin/seo-metas`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/seo-metas/:id` | `/api/admin/seo-metas/:id` |
| `DELETE` | `/admin/seo-metas/:id/hard-delete` | `/api/admin/seo-metas/:id/hard-delete` |
| `GET` | `/admin/seo-metas` | `/api/admin/seo-metas` |
| `GET` | `/admin/seo-metas/:id` | `/api/admin/seo-metas/:id` |
| `GET` | `/admin/seo-metas/lookup` | `/api/admin/seo-metas/lookup` |
| `POST` | `/admin/seo-metas` | `/api/admin/seo-metas` |
| `POST` | `/admin/seo-metas/:id/restore` | `/api/admin/seo-metas/:id/restore` |
| `POST` | `/admin/seo-metas/bulk` | `/api/admin/seo-metas/bulk` |
| `PUT` | `/admin/seo-metas/:id` | `/api/admin/seo-metas/:id` |
| `PUT` | `/admin/seo-metas/upsert` | `/api/admin/seo-metas/upsert` |

### `sessions`

- **Controller:** `src/sessions/sessions.controller.ts`
- **Base:** `/admin/sessions`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/sessions/:id` | `/api/admin/sessions/:id` |
| `DELETE` | `/admin/sessions/:id/hard-delete` | `/api/admin/sessions/:id/hard-delete` |
| `GET` | `/admin/sessions` | `/api/admin/sessions` |
| `GET` | `/admin/sessions/:id` | `/api/admin/sessions/:id` |
| `GET` | `/admin/sessions/accounts` | `/api/admin/sessions/accounts` |
| `GET` | `/admin/sessions/options` | `/api/admin/sessions/options` |
| `POST` | `/admin/sessions` | `/api/admin/sessions` |
| `POST` | `/admin/sessions/:id/restore` | `/api/admin/sessions/:id/restore` |
| `POST` | `/admin/sessions/bulk` | `/api/admin/sessions/bulk` |
| `POST` | `/admin/sessions/revoke-by-user/:userId` | `/api/admin/sessions/revoke-by-user/:userId` |
| `PUT` | `/admin/sessions/:id` | `/api/admin/sessions/:id` |

### `settings`

- **Controller:** `src/settings/settings.controller.ts`
- **Base:** `/admin/settings`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/settings/:id` | `/api/admin/settings/:id` |
| `GET` | `/admin/settings` | `/api/admin/settings` |
| `GET` | `/admin/settings/:key` | `/api/admin/settings/:key` |
| `PUT` | `/admin/settings` | `/api/admin/settings` |
| `PUT` | `/admin/settings/:key` | `/api/admin/settings/:key` |

### `speakers`

- **Controller:** `src/speakers/speakers.controller.ts`
- **Base:** `/admin/speakers`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/speakers/:id` | `/api/admin/speakers/:id` |
| `DELETE` | `/admin/speakers/:id/hard-delete` | `/api/admin/speakers/:id/hard-delete` |
| `GET` | `/admin/speakers` | `/api/admin/speakers` |
| `GET` | `/admin/speakers/:id` | `/api/admin/speakers/:id` |
| `POST` | `/admin/speakers` | `/api/admin/speakers` |
| `POST` | `/admin/speakers/:id/restore` | `/api/admin/speakers/:id/restore` |
| `POST` | `/admin/speakers/bulk` | `/api/admin/speakers/bulk` |
| `PUT` | `/admin/speakers/:id` | `/api/admin/speakers/:id` |

### `students`

- **Controller:** `src/students/students.controller.ts`
- **Base:** `/admin/students`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/students/:id` | `/api/admin/students/:id` |
| `DELETE` | `/admin/students/:id/hard-delete` | `/api/admin/students/:id/hard-delete` |
| `GET` | `/admin/students` | `/api/admin/students` |
| `GET` | `/admin/students/:id` | `/api/admin/students/:id` |
| `GET` | `/admin/students/options` | `/api/admin/students/options` |
| `POST` | `/admin/students` | `/api/admin/students` |
| `POST` | `/admin/students/:id/restore` | `/api/admin/students/:id/restore` |
| `POST` | `/admin/students/bulk` | `/api/admin/students/bulk` |
| `PUT` | `/admin/students/:id` | `/api/admin/students/:id` |

### `system`

- **Controller:** `src/system/system.controller.ts`
- **Base:** `/admin/system`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `GET` | `/admin/system/database-schema` | `/api/admin/system/database-schema` |
| `GET` | `/admin/system/export` | `/api/admin/system/export` |
| `GET` | `/admin/system/export/excel` | `/api/admin/system/export/excel` |
| `GET` | `/admin/system/import-config` | `/api/admin/system/import-config` |
| `GET` | `/admin/system/models` | `/api/admin/system/models` |
| `POST` | `/admin/system/import` | `/api/admin/system/import` |
| `POST` | `/admin/system/import/excel` | `/api/admin/system/import/excel` |
| `POST` | `/admin/system/seed-bootstrap` | `/api/admin/system/seed-bootstrap` |

### `tags`

- **Controller:** `src/tags/tags.controller.ts`
- **Base:** `/admin/tags`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/tags/:id` | `/api/admin/tags/:id` |
| `DELETE` | `/admin/tags/:id/hard-delete` | `/api/admin/tags/:id/hard-delete` |
| `GET` | `/admin/tags` | `/api/admin/tags` |
| `GET` | `/admin/tags/:id` | `/api/admin/tags/:id` |
| `GET` | `/admin/tags/options` | `/api/admin/tags/options` |
| `POST` | `/admin/tags` | `/api/admin/tags` |
| `POST` | `/admin/tags/:id/restore` | `/api/admin/tags/:id/restore` |
| `POST` | `/admin/tags/bulk` | `/api/admin/tags/bulk` |
| `PUT` | `/admin/tags/:id` | `/api/admin/tags/:id` |

### `templates`

- **Controller:** `src/templates/templates.controller.ts`
- **Base:** `/admin/templates`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/templates/:id` | `/api/admin/templates/:id` |
| `DELETE` | `/admin/templates/:id/hard-delete` | `/api/admin/templates/:id/hard-delete` |
| `GET` | `/admin/templates` | `/api/admin/templates` |
| `GET` | `/admin/templates/:id` | `/api/admin/templates/:id` |
| `POST` | `/admin/templates` | `/api/admin/templates` |
| `POST` | `/admin/templates/:id/restore` | `/api/admin/templates/:id/restore` |
| `POST` | `/admin/templates/bulk` | `/api/admin/templates/bulk` |
| `PUT` | `/admin/templates/:id` | `/api/admin/templates/:id` |

### `training-levels`

- **Controller:** `src/training-levels/training-levels.controller.ts`
- **Base:** `/admin/training-levels`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/training-levels/:id` | `/api/admin/training-levels/:id` |
| `DELETE` | `/admin/training-levels/:id/hard-delete` | `/api/admin/training-levels/:id/hard-delete` |
| `GET` | `/admin/training-levels` | `/api/admin/training-levels` |
| `GET` | `/admin/training-levels/:id` | `/api/admin/training-levels/:id` |
| `POST` | `/admin/training-levels` | `/api/admin/training-levels` |
| `POST` | `/admin/training-levels/:id/restore` | `/api/admin/training-levels/:id/restore` |
| `POST` | `/admin/training-levels/bulk` | `/api/admin/training-levels/bulk` |
| `PUT` | `/admin/training-levels/:id` | `/api/admin/training-levels/:id` |

### `training-systems`

- **Controller:** `src/training-systems/training-systems.controller.ts`
- **Base:** `/admin/training-systems`

| Method | Path (relative, chưa `/api`) | Full URL mẫu |
|--------|------------------------------|--------------|
| `DELETE` | `/admin/training-systems/:id` | `/api/admin/training-systems/:id` |
| `DELETE` | `/admin/training-systems/:id/hard-delete` | `/api/admin/training-systems/:id/hard-delete` |
| `GET` | `/admin/training-systems` | `/api/admin/training-systems` |
| `GET` | `/admin/training-systems/:id` | `/api/admin/training-systems/:id` |
| `POST` | `/admin/training-systems` | `/api/admin/training-systems` |
| `POST` | `/admin/training-systems/:id/restore` | `/api/admin/training-systems/:id/restore` |
| `POST` | `/admin/training-systems/bulk` | `/api/admin/training-systems/bulk` |
| `PUT` | `/admin/training-systems/:id` | `/api/admin/training-systems/:id` |

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
| `DELETE` | `/admin/users/:id` | `/api/admin/users/:id` |
| `DELETE` | `/admin/users/:id/hard-delete` | `/api/admin/users/:id/hard-delete` |
| `GET` | `/admin/users` | `/api/admin/users` |
| `GET` | `/admin/users/:id` | `/api/admin/users/:id` |
| `GET` | `/admin/users/options` | `/api/admin/users/options` |
| `POST` | `/admin/users` | `/api/admin/users` |
| `POST` | `/admin/users/:id/restore` | `/api/admin/users/:id/restore` |
| `POST` | `/admin/users/bulk` | `/api/admin/users/bulk` |
| `PUT` | `/admin/users/:id` | `/api/admin/users/:id` |

## Liên kết

- Monorepo: [ROUTE_SURFACE.md](../../../../.graphify/markdown/ROUTE_SURFACE.md) (admin ↔ api-client)
- [`../README.md`](../README.md) · [`SUMMARY_FOR_AI.md`](SUMMARY_FOR_AI.md)

## Làm mới

```bash
node script-system/graphify/graphify-update.cjs apps/main/api
pnpm graphify:ai-summary
```
