# ROUTE_SURFACE — Admin URL ↔ API ↔ api-client (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.641Z` — ghép `admin.app.config.json`, Nest `@Controller`, `packages/api-client/src/resources/*.ts`.

Lưu ý: Next App Router còn route theo **file convention** (`src/app/**/page.tsx`); bảng dưới lấy **module id** từ config admin. Chi tiết file: `apps/*/backend/.graphify/markdown/ENTRY_POINTS.md`.

## Main admin modules (`apps/main/backend`)

| Module | Admin URL (base) | API domain | API prefix (Nest) | api-client | HTTP mẫu (client) |
|--------|------------------|------------|-------------------|------------|-------------------|
| `staff` | `/staff` | `users` | `/admin/users` | `users.ts` | /admin/roles; /admin/users; /admin/users/${id}; /admin/users/${id}/hard-delete; …+2 |
| `rbac` | `/rbac` | `roles` | `/admin/roles` | `rbac.ts` | /admin/roles; /admin/roles/permissions |
| `categories` | `/categories` | `categories` | `/admin/categories` | `categories.ts` | /admin/categories; /admin/categories/${id}; /admin/categories/${id}/hard-delete; /admin/categories/${id}/restore; …+2 |
| `tags` | `/tags` | `tags` | `/admin/tags` | `tags.ts` | /admin/tags; /admin/tags/${id}; /admin/tags/${id}/hard-delete; /admin/tags/${id}/restore; …+1 |
| `guides` | `/guides` | `page-contents` | `/admin/page-contents` | `guides.ts` | /admin/page-contents; /admin/page-contents/${id}; /admin/page-contents/${id}/hard-delete; /admin/page-contents/${id}/restore; …+1 |
| `posts` | `/posts` | `posts` | `/admin/posts` | `posts.ts` | /admin/posts; /admin/posts/${id}; /admin/posts/${id}/hard-delete; /admin/posts/${id}/restore; …+1 |
| `cameras` | `/cameras` | `cameras` | `/admin/cameras` | `cameras.ts` | /admin/cameras; /admin/cameras/${id}; /admin/cameras/${id}/hard-delete; /admin/cameras/${id}/restore; …+1 |
| `templates` | `/templates` | `templates` | `/admin/templates` | `templates.ts` | /admin/templates; /admin/templates/${id}; /admin/templates/${id}/hard-delete; /admin/templates/${id}/restore; …+1 |
| `screens` | `/screens` | `screens` | `/admin/screens` | `screens.ts` | /admin/screens; /admin/screens/${id}; /admin/screens/${id}/hard-delete; /admin/screens/${id}/restore; …+1 |
| `locations` | `/locations` | `locations` | `/admin/locations` | `locations.ts` | /admin/locations; /admin/locations/${id}; /admin/locations/${id}/hard-delete; /admin/locations/${id}/restore; …+1 |
| `speakers` | `/speakers` | `speakers` | `/admin/speakers` | `speakers.ts` | /admin/speakers; /admin/speakers/${id}; /admin/speakers/${id}/hard-delete; /admin/speakers/${id}/restore; …+1 |
| `settings` | `/settings` | `settings` | `/admin/settings` | `settings.ts` | /admin/settings; /admin/settings/${id}; /admin/settings/${key}; /public/site-branding |
| `file-storage` | `/file-storage` | `uploads` | `//uploads, /admin/uploads` | `uploads.ts` | /admin/uploads; /admin/uploads/bulk-delete; /admin/uploads/bulk-move; /admin/uploads/export; …+2 |
| `data` | `/data` | `system` | `/admin/system` | `system.ts` | /admin/system/database-schema; /admin/system/import-config |
| `events` | `/events` | `events` | `/admin/events` | `events.ts` | /admin/events; /admin/events/${id}; /admin/events/${id}/hard-delete; /admin/events/${id}/restore; …+1 |
| `departments` | `/departments` | `departments` | `/admin/departments` | `departments.ts` | /admin/departments; /admin/departments/${id}; /admin/departments/${id}/hard-delete; /admin/departments/${id}/restore; …+1 |
| `academic-years` | `/academic-years` | `academic-years` | `/admin/academic-years` | `academic-years.ts` | /admin/academic-years; /admin/academic-years/${id}; /admin/academic-years/${id}/hard-delete; /admin/academic-years/${id}/restore; …+1 |
| `courses` | `/courses` | `courses` | `/admin/courses` | `courses.ts` | /admin/courses; /admin/courses/${id}; /admin/courses/${id}/hard-delete; /admin/courses/${id}/restore; …+1 |
| `majors` | `/majors` | `majors` | `/admin/majors` | `majors.ts` | /admin/majors; /admin/majors/${id}; /admin/majors/${id}/hard-delete; /admin/majors/${id}/restore; …+1 |
| `training-levels` | `/training-levels` | `training-levels` | `/admin/training-levels` | `training-levels.ts` | /admin/training-levels; /admin/training-levels/${id}; /admin/training-levels/${id}/hard-delete; /admin/training-levels/${id}/restore; …+1 |
| `training-systems` | `/training-systems` | `training-systems` | `/admin/training-systems` | `training-systems.ts` | /admin/training-systems; /admin/training-systems/${id}; /admin/training-systems/${id}/hard-delete; /admin/training-systems/${id}/restore; …+1 |
| `products` | `/products` | `products` | `//admin/products, /public/products` | `products.ts` | /admin/products; /admin/products/${id}; /admin/products/${id}/restore; /public/products; …+2 |
| `orders` | `/orders` | `orders` | `//admin/orders, /public/orders` | `orders.ts` | /admin/orders; /admin/orders/${id}; /admin/orders/${id}/status; /admin/orders/staff/status-counts; …+2 |
| `promo-codes` | `/promo-codes` | `promo-codes` | `//admin/promo-codes, /public/promo-codes` | `promo-codes.ts` | /admin/promo-codes; /admin/promo-codes/${id}; /public/promo-codes |
| `seo-metas` | `/seo-metas` | `seo-metas` | `/admin/seo-metas` | `seo-metas.ts` | /admin/seo-metas; /admin/seo-metas/${id}; /admin/seo-metas/${id}/hard-delete; /admin/seo-metas/${id}/restore; …+4 |
| `contact-requests` | `/contact-requests` | `contact-requests` | `/admin/contact-requests` | `contact-requests.ts` | /admin/contact-requests; /admin/contact-requests/${id}; /admin/contact-requests/${id}/hard-delete; /admin/contact-requests/${id}/restore; …+1 |
| `parent-students` | `/parent-students` | `parent-students` | `//parent/my-students, /admin/parent-students` | `parent-students.ts` | /admin/parent-students; /admin/parent-students/${id}; /admin/parent-students/${id}/review |
| `my-students` | `/my-students` | `students` | `/admin/students` | `—` | — |

## API domain không có module admin riêng (main API)

Các domain có controller nhưng **không** nằm trong `admin.app.config.json` modules (webhook, public-only, v.v.):

| Domain | Controller | HTTP (Nest, rút gọn) |
|--------|------------|----------------------|
| `accounts` | `src/accounts/accounts.controller.ts` | GET /admin/accounts; POST /admin/accounts/avatar; PUT /admin/accounts |
| `admission-results` | `src/admission-results/admission-results.controller.ts` | DELETE /admin/admission-results/:id; DELETE /admin/admission-results/:id/hard-delete; GET /admin/admission-results; GET /admin/admission-results/:id; GET /admin/admission-results/options; POST /admin/admission-results; …+3 |
| `auth` | `src/auth/auth.controller.ts` | GET /auth/admin/google/config; GET /auth/admin/me; POST /auth/admin/dev-login; POST /auth/admin/google; POST /auth/admin/login; POST /auth/admin/logout |
| `carts` | `src/carts/public-carts.controller.ts` | DELETE /public/cart; GET /public/cart; PUT /public/cart |
| `comments` | `src/comments/comments.controller.ts` | DELETE /admin/comments/:id; DELETE /admin/comments/:id/hard-delete; GET /admin/comments; GET /admin/comments/:id; GET /admin/comments/options; POST /admin/comments/:id/approve; …+3 |
| `dashboard` | `src/dashboard/dashboard.controller.ts` | GET /admin/dashboard/stats |
| `event-checkins` | `src/event-checkins/event-checkins.controller.ts` | DELETE /admin/event-checkins/:id; DELETE /admin/event-checkins/:id/hard-delete; GET /admin/event-checkins; GET /admin/event-checkins/:id; POST /admin/event-checkins; POST /admin/event-checkins/:id/restore; …+2 |
| `event-checkouts` | `src/event-checkouts/event-checkouts.controller.ts` | GET /admin/event-checkouts; POST /admin/event-checkouts/bulk |
| `event-registrations` | `src/event-registrations/event-registrations.controller.ts` | DELETE /admin/event-registrations/:id; DELETE /admin/event-registrations/:id/hard-delete; GET /admin/event-registrations; GET /admin/event-registrations/:id; POST /admin/event-registrations; POST /admin/event-registrations/:id/attendance; …+3 |
| `event-speakers` | `src/event-speakers/event-speakers.controller.ts` | DELETE /admin/event-speakers/:id; GET /admin/event-speakers; GET /admin/event-speakers/:id; POST /admin/event-speakers; POST /admin/event-speakers/bulk; PUT /admin/event-speakers/:id |
| `face-data` | `src/face-data/face-data.controller.ts` | DELETE /admin/face-data/:id; DELETE /admin/face-data/:id/hard-delete; GET /admin/face-data; GET /admin/face-data/:id; POST /admin/face-data; POST /admin/face-data/:id/restore; …+2 |
| `groups` | `src/groups/groups.controller.ts` | DELETE /admin/groups/:id; DELETE /admin/groups/:id/hard-delete; DELETE /admin/groups/:id/members/:userId; GET /admin/groups; GET /admin/groups/:id; GET /admin/groups/:id/messages; …+6 |
| `hanet` | `src/hanet/hanet-webhook.controller.ts` | POST /public/hanet/webhook; POST /public/hanet/webhook/:eventId |
| `imported-users` | `src/imported-users/imported-users.controller.ts` | DELETE /admin/imported-users/:id; DELETE /admin/imported-users/:id/hard-delete; GET /admin/imported-users; GET /admin/imported-users/:id; POST /admin/imported-users; POST /admin/imported-users/:id/restore; …+2 |
| `messages` | `src/messages/conversations.controller.ts` | GET /admin/conversations; PATCH /admin/messages/:id; POST /admin/conversations/:otherUserId/mark-read; POST /admin/messages |
| `notifications` | `src/notifications/notifications.controller.ts` | DELETE /admin/notifications/:id; GET /admin/notifications; GET /admin/notifications/options; GET /admin/notifications/table; GET /admin/unread-counts; PATCH /admin/notifications/:id; …+2 |
| `proxy-image` | `src/proxy-image/proxy-image.controller.ts` | GET /admin/proxy-image; GET /admin/proxy-image/ |
| `public` | `src/public/public.controller.ts` | GET /public/admission-results/lookup; GET /public/auth/dev-login-options; GET /public/auth/google/config; GET /public/categories; GET /public/dev-login-options; GET /public/event-categories; …+21 |
| `sessions` | `src/sessions/sessions.controller.ts` | DELETE /admin/sessions/:id; DELETE /admin/sessions/:id/hard-delete; GET /admin/sessions; GET /admin/sessions/:id; GET /admin/sessions/accounts; GET /admin/sessions/options; …+5 |

## Check-in admin modules (`hub-event-checkin-frontend`)

| Module | Admin URL | Có trên main API |
|--------|-----------|------------------|
| `staff` | `/staff` | ✓ |
| `rbac` | `/rbac` | ✓ |
| `categories` | `/categories` | ✓ |
| `tags` | `/tags` | ✓ |
| `guides` | `/guides` | ✓ |
| `posts` | `/posts` | ✓ |
| `cameras` | `/cameras` | ✓ |
| `templates` | `/templates` | ✓ |
| `screens` | `/screens` | ✓ |
| `locations` | `/locations` | ✓ |
| `speakers` | `/speakers` | ✓ |
| `settings` | `/settings` | ✓ |
| `file-storage` | `/file-storage` | ✓ |
| `data` | `/data` | ✓ |

## PUBLIC_ROUTES (main API — tham chiếu nhanh)

- `parent/my-students` — `PARENT_MY_STUDENTS`
- `public` — `BASE`
- `public/admission-results/lookup` — `ADMISSION_RESULTS_LOOKUP`
- `public/categories` — `CATEGORIES`
- `public/contact-requests` — `CONTACT_REQUESTS`
- `public/event-categories` — `EVENT_CATEGORIES`
- `public/events` — `EVENTS`
- `public/hanet/webhook` — `HANET_WEBHOOK`
- `public/home-admission-posts` — `HOME_ADMISSION_POSTS`
- `public/page-contents` — `PAGE_CONTENTS`
- `public/posts` — `POSTS`
- `public/seo-meta` — `SEO_META`
- `public/site-branding` — `SITE_BRANDING`
- `uploads` — `SERVE_UPLOADS`

## Gợi ý agent

1. Đổi **admin page** → `packages/admin-app` + `pnpm admin:generate:main` (hoặc check-in).
2. Đổi **HTTP contract** → `apps/main/api` controller + `packages/api-client` resource tương ứng.
3. Check-in deploy → `SYNC_DELTA.md` + `pnpm pull:checkin` sau khi sửa `@workspace/api-server` hoặc registry.

## Làm mới

- `pnpm graphify:ai-summary`
