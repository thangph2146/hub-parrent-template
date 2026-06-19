# Báo cáo kiểm tra từng file — apps\hub-checkin\api

Thời điểm: 2026-06-13T17:52:27.383Z

## Tổng quan

| Chỉ số | Giá trị |
|--------|---------|
| Tổng module | 50 |
| Thin OK (extends Base*, không issue) | 35 |
| Thin + fat override (service > 80 dòng) | 4 |
| Skip-thin (mirror có chủ đích) | 7 |
| Mirror / no-service | 1 |
| Có cảnh báo file | 7 |

## Xác minh pipeline

- `pnpm api:render apps/hub-checkin/api --prune` — pass
- Typecheck, check-in API, endpoint parity — pass (xem log render)

## Chi tiết từng module

### `academic-years` — **thin**
- Expected base: `BaseAcademicYearsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/academic-years/academic-years.controller.ts` | 18 | `BaseAcademicYearsController` | auto-generated, extends:BaseAcademicYearsController | — |
| `src/academic-years/academic-years.module.ts` | 12 | — | auto-generated | — |
| `src/academic-years/academic-years.service.ts` | 22 | `BaseAcademicYearsService` | auto-generated, extends:BaseAcademicYearsService | — |

### `accounts` — **thin**
- Expected base: `BaseAccountsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/accounts/accounts.controller.ts` | 19 | `BaseAccountsController` | auto-generated, extends:BaseAccountsController | — |
| `src/accounts/accounts.module.ts` | 14 | — | auto-generated | — |
| `src/accounts/accounts.service.ts` | 27 | `BaseAccountsService` | auto-generated, extends:BaseAccountsService | — |

### `admission-results` — **thin+fat-override**
- Expected base: `BaseAdmissionResultsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/admission-results/admission-results.controller.ts` | 18 | `BaseAdmissionResultsController` | auto-generated, extends:BaseAdmissionResultsController | — |
| `src/admission-results/admission-results.module.ts` | 15 | — | auto-generated | — |
| `src/admission-results/admission-results.service.ts` | 142 | `BaseAdmissionResultsService` | auto-generated, extends:BaseAdmissionResultsService, fat:142L | — |

### `auth` — **thin**
- Expected base: `BaseAuthService`
- Issues:
  - auth.service.ts: import trùng: ../common/module-bases/auth/auth.service

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/auth/auth.controller.ts` | 16 | `BaseAuthController` | auto-generated, extends:BaseAuthController | — |
| `src/auth/auth.module.ts` | 16 | — | auto-generated | — |
| `src/auth/auth.service.ts` | 24 | `BaseAuthService` | auto-generated, extends:BaseAuthService | import trùng: ../common/module-bases/auth/auth.service |

### `cameras` — **thin**
- Expected base: `BaseCamerasService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/cameras/cameras.controller.ts` | 18 | `BaseCamerasController` | auto-generated, extends:BaseCamerasController | — |
| `src/cameras/cameras.module.ts` | 12 | — | auto-generated | — |
| `src/cameras/cameras.service.ts` | 22 | `BaseCamerasService` | auto-generated, extends:BaseCamerasService | — |

### `carts` — **thin**
- Expected base: `BaseCartsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/carts/carts.module.ts` | 12 | — | auto-generated | — |
| `src/carts/carts.service.ts` | 17 | `BaseCartsService` | auto-generated, extends:BaseCartsService | — |
| `src/carts/public-carts.controller.ts` | 16 | `BaseCartsController` | auto-generated, extends:BaseCartsController | — |

### `categories` — **thin**
- Expected base: `BaseCategoriesService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/categories/categories.controller.ts` | 18 | `BaseCategoriesController` | auto-generated, extends:BaseCategoriesController | — |
| `src/categories/categories.module.ts` | 14 | — | auto-generated | — |
| `src/categories/categories.service.ts` | 22 | `BaseCategoriesService` | auto-generated, extends:BaseCategoriesService | — |

### `comments` — **thin**
- Expected base: `BaseCommentsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/comments/comments.controller.ts` | 17 | `BaseCommentsController` | auto-generated, extends:BaseCommentsController | — |
| `src/comments/comments.module.ts` | 14 | — | auto-generated | — |
| `src/comments/comments.service.ts` | 22 | `BaseCommentsService` | auto-generated, extends:BaseCommentsService | — |

### `contact-requests` — **thin**
- Expected base: `BaseContactRequestsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/contact-requests/contact-requests.controller.ts` | 18 | `BaseContactRequestsController` | auto-generated, extends:BaseContactRequestsController | — |
| `src/contact-requests/contact-requests.module.ts` | 16 | — | auto-generated | — |
| `src/contact-requests/contact-requests.service.ts` | 22 | `BaseContactRequestsService` | auto-generated, extends:BaseContactRequestsService | — |

### `courses` — **thin**
- Expected base: `BaseCoursesService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/courses/courses.controller.ts` | 18 | `BaseCoursesController` | auto-generated, extends:BaseCoursesController | — |
| `src/courses/courses.module.ts` | 12 | — | auto-generated | — |
| `src/courses/courses.service.ts` | 22 | `BaseCoursesService` | auto-generated, extends:BaseCoursesService | — |

### `dashboard` — **thin**
- Expected base: `BaseDashboardService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/dashboard/dashboard.controller.ts` | 18 | `BaseDashboardController` | auto-generated, extends:BaseDashboardController | — |
| `src/dashboard/dashboard.module.ts` | 12 | — | auto-generated | — |
| `src/dashboard/dashboard.service.ts` | 30 | `BaseDashboardService` | auto-generated, extends:BaseDashboardService | — |

### `departments` — **thin**
- Expected base: `BaseDepartmentsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/departments/departments.controller.ts` | 18 | `BaseDepartmentsController` | auto-generated, extends:BaseDepartmentsController | — |
| `src/departments/departments.module.ts` | 12 | — | auto-generated | — |
| `src/departments/departments.service.ts` | 22 | `BaseDepartmentsService` | auto-generated, extends:BaseDepartmentsService | — |

### `event-checkins` — **thin**
- Expected base: `BaseEventCheckinsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/event-checkins/event-checkins.controller.ts` | 18 | `BaseEventCheckinsController` | auto-generated, extends:BaseEventCheckinsController | — |
| `src/event-checkins/event-checkins.module.ts` | 12 | — | auto-generated | — |
| `src/event-checkins/event-checkins.service.ts` | 31 | `BaseEventCheckinsService` | auto-generated, extends:BaseEventCheckinsService | — |

### `event-checkouts` — **thin**
- Expected base: `BaseEventCheckoutsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/event-checkouts/event-checkouts.controller.ts` | 18 | `BaseEventCheckoutsController` | auto-generated, extends:BaseEventCheckoutsController | — |
| `src/event-checkouts/event-checkouts.module.ts` | 12 | — | auto-generated | — |
| `src/event-checkouts/event-checkouts.service.ts` | 17 | `BaseEventCheckoutsService` | auto-generated, extends:BaseEventCheckoutsService | — |

### `event-registrations` — **thin**
- Expected base: `BaseEventRegistrationsService`
- Issues:
  - event-registration-attendance.service.ts: service không extends Base*
  - event-registration-attendance.service.ts: import trùng: ./event-registrations.service

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/event-registrations/event-registration-attendance.service.ts` | 358 | — | auto-generated, fat:358L | service không extends Base*; import trùng: ./event-registrations.service |
| `src/event-registrations/event-registrations.controller.ts` | 20 | `BaseEventRegistrationsController` | auto-generated, extends:BaseEventRegistrationsController | — |
| `src/event-registrations/event-registrations.module.ts` | 15 | — | auto-generated | — |
| `src/event-registrations/event-registrations.service.ts` | 31 | `BaseEventRegistrationsService` | auto-generated, extends:BaseEventRegistrationsService | — |

### `event-speakers` — **thin**
- Expected base: `BaseEventSpeakersService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/event-speakers/event-speakers.controller.ts` | 18 | `BaseEventSpeakersController` | auto-generated, extends:BaseEventSpeakersController | — |
| `src/event-speakers/event-speakers.module.ts` | 12 | — | auto-generated | — |
| `src/event-speakers/event-speakers.service.ts` | 30 | `BaseEventSpeakersService` | auto-generated, extends:BaseEventSpeakersService | — |

### `events` — **thin**
- Expected base: `BaseEventsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/events/events.controller.ts` | 18 | `BaseEventsController` | auto-generated, extends:BaseEventsController | — |
| `src/events/events.module.ts` | 12 | — | auto-generated | — |
| `src/events/events.service.ts` | 27 | `BaseEventsService` | auto-generated, extends:BaseEventsService | — |

### `face-data` — **thin**
- Expected base: `BaseFaceDatasService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/face-data/face-data.controller.ts` | 18 | `BaseFaceDatasController` | auto-generated, extends:BaseFaceDatasController | — |
| `src/face-data/face-data.module.ts` | 12 | — | auto-generated | — |
| `src/face-data/face-data.service.ts` | 22 | `BaseFaceDatasService` | auto-generated, extends:BaseFaceDatasService | — |

### `groups` — **thin**
- Expected base: `BaseGroupsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/groups/groups.controller.ts` | 18 | `BaseGroupsController` | auto-generated, extends:BaseGroupsController | — |
| `src/groups/groups.module.ts` | 16 | — | auto-generated | — |
| `src/groups/groups.service.ts` | 22 | `BaseGroupsService` | auto-generated, extends:BaseGroupsService | — |

### `hanet` — **skip-thin**
- Expected base: `BaseHanetWebhookService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/hanet/hanet-payload.ts` | 186 | — | auto-generated | — |
| `src/hanet/hanet-webhook.controller.ts` | 58 | — | auto-generated | — |
| `src/hanet/hanet-webhook.service.ts` | 326 | — | auto-generated, mirror-service, fat:326L | — |
| `src/hanet/hanet.module.ts` | 14 | — | auto-generated | — |
| `src/hanet/hanet.types.ts` | 24 | — | auto-generated | — |

### `imported-users` — **thin**
- Expected base: `BaseImportedUsersService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/imported-users/imported-users.controller.ts` | 18 | `BaseImportedUsersController` | auto-generated, extends:BaseImportedUsersController | — |
| `src/imported-users/imported-users.module.ts` | 12 | — | auto-generated | — |
| `src/imported-users/imported-users.service.ts` | 22 | `BaseImportedUsersService` | auto-generated, extends:BaseImportedUsersService | — |

### `locations` — **thin**
- Expected base: `BaseLocationsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/locations/locations.controller.ts` | 18 | `BaseLocationsController` | auto-generated, extends:BaseLocationsController | — |
| `src/locations/locations.module.ts` | 12 | — | auto-generated | — |
| `src/locations/locations.service.ts` | 22 | `BaseLocationsService` | auto-generated, extends:BaseLocationsService | — |

### `majors` — **thin**
- Expected base: `BaseMajorsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/majors/majors.controller.ts` | 18 | `BaseMajorsController` | auto-generated, extends:BaseMajorsController | — |
| `src/majors/majors.module.ts` | 12 | — | auto-generated | — |
| `src/majors/majors.service.ts` | 22 | `BaseMajorsService` | auto-generated, extends:BaseMajorsService | — |

### `messages` — **skip-thin**
- Expected base: `BaseMessagesService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/messages/conversations.controller.ts` | 278 | — | auto-generated, fat:278L | — |
| `src/messages/messages.controller.ts` | 280 | — | auto-generated, fat:280L | — |
| `src/messages/messages.module.ts` | 13 | — | auto-generated | — |

### `notifications` — **thin**
- Expected base: `BaseNotificationsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/notifications/notifications.controller.ts` | 17 | `BaseNotificationsController` | auto-generated, extends:BaseNotificationsController | — |
| `src/notifications/notifications.module.ts` | 15 | — | auto-generated | — |
| `src/notifications/notifications.service.ts` | 55 | `BaseNotificationsService` | auto-generated, extends:BaseNotificationsService | — |

### `orders` — **thin+fat-override**
- Expected base: `BaseOrdersService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/orders/order-checkout.ts` | 110 | — | auto-generated | — |
| `src/orders/orders.controller.ts` | 18 | `BaseOrdersController` | auto-generated, extends:BaseOrdersController | — |
| `src/orders/orders.module.ts` | 17 | — | auto-generated | — |
| `src/orders/orders.service.ts` | 327 | `BaseOrdersService` | auto-generated, extends:BaseOrdersService, fat:327L | — |
| `src/orders/public-orders.controller.ts` | 107 | — | auto-generated, public-mirror, fat:107L | — |

### `page-contents` — **thin**
- Expected base: `BasePageContentsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/page-contents/page-contents.controller.ts` | 18 | `BasePageContentsController` | auto-generated, extends:BasePageContentsController | — |
| `src/page-contents/page-contents.module.ts` | 15 | — | auto-generated | — |
| `src/page-contents/page-contents.service.ts` | 22 | `BasePageContentsService` | auto-generated, extends:BasePageContentsService | — |

### `parent-students` — **thin**
- Expected base: `BaseParentStudentsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/parent-students/parent-students.controller.ts` | 26 | `BaseParentStudentsController` | auto-generated, extends:BaseParentStudentsController | — |
| `src/parent-students/parent-students.module.ts` | 17 | — | auto-generated | — |
| `src/parent-students/parent-students.service.ts` | 22 | `BaseParentStudentsService` | auto-generated, extends:BaseParentStudentsService | — |

### `posts` — **thin**
- Expected base: `BasePostsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/posts/posts.controller.ts` | 18 | `BasePostsController` | auto-generated, extends:BasePostsController | — |
| `src/posts/posts.module.ts` | 15 | — | auto-generated | — |
| `src/posts/posts.service.ts` | 45 | `BasePostsService` | auto-generated, extends:BasePostsService | — |

### `products` — **thin+fat-override**
- Expected base: `BaseProductsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/products/products.controller.ts` | 18 | `BaseProductsController` | auto-generated, extends:BaseProductsController | — |
| `src/products/products.module.ts` | 13 | — | auto-generated | — |
| `src/products/products.service.ts` | 194 | `BaseProductsService` | auto-generated, extends:BaseProductsService, fat:194L | — |
| `src/products/public-products.controller.ts` | 111 | — | auto-generated, public-mirror, fat:111L | — |

### `promo-codes` — **thin+fat-override**
- Expected base: `BasePromoCodesService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/promo-codes/promo-codes.controller.ts` | 18 | `BasePromoCodesController` | auto-generated, extends:BasePromoCodesController | — |
| `src/promo-codes/promo-codes.module.ts` | 13 | — | auto-generated | — |
| `src/promo-codes/promo-codes.service.ts` | 119 | `BasePromoCodesService` | auto-generated, extends:BasePromoCodesService, fat:119L | — |
| `src/promo-codes/public-promo-codes.controller.ts` | 34 | — | auto-generated, public-mirror | — |

### `proxy-image` — **skip-thin**

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/proxy-image/proxy-image.controller.ts` | 60 | — | auto-generated | — |
| `src/proxy-image/proxy-image.module.ts` | 9 | — | auto-generated | — |

### `public` — **skip-thin**
- Expected base: `BasePublicService`
- Issues:
  - public-events.service.ts: import trùng: ../common/pagination
  - public.controller.ts: import trùng: ./public-contact-requests.service, ../auth/auth.service, ../config/constants

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/public/event-student-email.ts` | 15 | — | auto-generated | — |
| `src/public/public-auth.service.ts` | 98 | — | auto-generated, mirror-service, fat:98L | — |
| `src/public/public-categories.service.ts` | 71 | — | auto-generated, mirror-service | — |
| `src/public/public-contact-requests.service.ts` | 77 | — | auto-generated, mirror-service | — |
| `src/public/public-event-categories.service.ts` | 61 | — | auto-generated, mirror-service | — |
| `src/public/public-event-registration.service.ts` | 298 | — | auto-generated, mirror-service, fat:298L | — |
| `src/public/public-events.service.ts` | 377 | — | auto-generated, mirror-service, fat:377L | import trùng: ../common/pagination |
| `src/public/public-posts.service.ts` | 331 | — | auto-generated, mirror-service, fat:331L | — |
| `src/public/public.controller.ts` | 1170 | — | auto-generated, fat:1170L | import trùng: ./public-contact-requests.service, ../auth/auth.service, ../config/constants |
| `src/public/public.module.ts` | 46 | — | auto-generated | — |

### `roles` — **thin**
- Expected base: `BaseRolesService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/roles/roles.controller.ts` | 18 | `BaseRolesController` | auto-generated, extends:BaseRolesController | — |
| `src/roles/roles.module.ts` | 15 | — | auto-generated | — |
| `src/roles/roles.service.ts` | 22 | `BaseRolesService` | auto-generated, extends:BaseRolesService | — |

### `screens` — **thin**
- Expected base: `BaseScreensService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/screens/screens.controller.ts` | 18 | `BaseScreensController` | auto-generated, extends:BaseScreensController | — |
| `src/screens/screens.module.ts` | 12 | — | auto-generated | — |
| `src/screens/screens.service.ts` | 22 | `BaseScreensService` | auto-generated, extends:BaseScreensService | — |

### `seeders` — **skip-thin**

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/seeders/DatabaseSeeder.ts` | 17 | — | auto-generated | — |

### `seeds` — **no-service**

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/seeds/checkin-demo.runner.ts` | 389 | — | auto-generated | — |
| `src/seeds/lexical-plain-text.ts` | 110 | — | auto-generated | — |
| `src/seeds/load-export-posts.ts` | 75 | — | auto-generated | — |
| `src/seeds/orders-sample.runner.ts` | 93 | — | auto-generated | — |
| `src/seeds/products-sample.runner.ts` | 36 | — | auto-generated | — |
| `src/seeds/promo-codes-sample.runner.ts` | 79 | — | auto-generated | — |
| `src/seeds/storesync-sample.data.ts` | 391 | — | auto-generated | — |
| `src/seeds/superadmin-bootstrap.data.ts` | 505 | — | auto-generated | — |
| `src/seeds/superadmin-bootstrap.runner.ts` | 264 | — | auto-generated | — |

### `seo-metas` — **thin**
- Expected base: `BaseSeoMetasService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/seo-metas/seo-metas.controller.ts` | 18 | `BaseSeoMetasController` | auto-generated, extends:BaseSeoMetasController | — |
| `src/seo-metas/seo-metas.module.ts` | 12 | — | auto-generated | — |
| `src/seo-metas/seo-metas.service.ts` | 22 | `BaseSeoMetasService` | auto-generated, extends:BaseSeoMetasService | — |

### `sessions` — **thin**
- Expected base: `BaseSessionsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/sessions/sessions.controller.ts` | 21 | `BaseSessionsController` | auto-generated, extends:BaseSessionsController | — |
| `src/sessions/sessions.module.ts` | 16 | — | auto-generated | — |
| `src/sessions/sessions.service.ts` | 42 | `BaseSessionsService` | auto-generated, extends:BaseSessionsService | — |

### `settings` — **thin**
- Expected base: `BaseSettingsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/settings/settings.controller.ts` | 18 | `BaseSettingsController` | auto-generated, extends:BaseSettingsController | — |
| `src/settings/settings.module.ts` | 12 | — | auto-generated | — |
| `src/settings/settings.service.ts` | 22 | `BaseSettingsService` | auto-generated, extends:BaseSettingsService | — |

### `socket` — **skip-thin**
- Issues:
  - socket.gateway.ts: import trùng: ../entities/notification.entity

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/socket/notification-mapper.ts` | 64 | — | auto-generated | — |
| `src/socket/socket.gateway.ts` | 624 | — | auto-generated | import trùng: ../entities/notification.entity |
| `src/socket/socket.module.ts` | 27 | — | auto-generated | — |
| `src/socket/socket.types.ts` | 136 | — | auto-generated | — |

### `speakers` — **thin**
- Expected base: `BaseSpeakersService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/speakers/speakers.controller.ts` | 18 | `BaseSpeakersController` | auto-generated, extends:BaseSpeakersController | — |
| `src/speakers/speakers.module.ts` | 12 | — | auto-generated | — |
| `src/speakers/speakers.service.ts` | 22 | `BaseSpeakersService` | auto-generated, extends:BaseSpeakersService | — |

### `students` — **thin**
- Expected base: `BaseStudentsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/students/students.controller.ts` | 18 | `BaseStudentsController` | auto-generated, extends:BaseStudentsController | — |
| `src/students/students.module.ts` | 14 | — | auto-generated | — |
| `src/students/students.service.ts` | 22 | `BaseStudentsService` | auto-generated, extends:BaseStudentsService | — |

### `system` — **thin**
- Expected base: `BaseSystemService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/system/export-schema.ts` | 132 | — | auto-generated | — |
| `src/system/import-helpers.ts` | 277 | — | auto-generated | — |
| `src/system/import-reference.ts` | 121 | — | auto-generated | — |
| `src/system/legacy-import-id-map.ts` | 97 | — | auto-generated | — |
| `src/system/system-bootstrap.deps.ts` | 14 | — | auto-generated | — |
| `src/system/system-maintenance.ts` | 21 | — | auto-generated | — |
| `src/system/system.controller.ts` | 24 | `BaseSystemController` | auto-generated, extends:BaseSystemController | — |
| `src/system/system.module.ts` | 14 | — | auto-generated | — |
| `src/system/system.service.ts` | 22 | `BaseSystemService` | auto-generated, extends:BaseSystemService | — |
| `src/system/system.types.ts` | 76 | — | auto-generated | — |

### `tags` — **thin**
- Expected base: `BaseTagsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/tags/tags.controller.ts` | 18 | `BaseTagsController` | auto-generated, extends:BaseTagsController | — |
| `src/tags/tags.module.ts` | 14 | — | auto-generated | — |
| `src/tags/tags.service.ts` | 22 | `BaseTagsService` | auto-generated, extends:BaseTagsService | — |

### `templates` — **thin**
- Expected base: `BaseTemplatesService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/templates/templates.controller.ts` | 18 | `BaseTemplatesController` | auto-generated, extends:BaseTemplatesController | — |
| `src/templates/templates.module.ts` | 12 | — | auto-generated | — |
| `src/templates/templates.service.ts` | 22 | `BaseTemplatesService` | auto-generated, extends:BaseTemplatesService | — |

### `training-levels` — **thin**
- Expected base: `BaseTrainingLevelsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/training-levels/training-levels.controller.ts` | 18 | `BaseTrainingLevelsController` | auto-generated, extends:BaseTrainingLevelsController | — |
| `src/training-levels/training-levels.module.ts` | 12 | — | auto-generated | — |
| `src/training-levels/training-levels.service.ts` | 22 | `BaseTrainingLevelsService` | auto-generated, extends:BaseTrainingLevelsService | — |

### `training-systems` — **thin**
- Expected base: `BaseTrainingSystemsService`

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/training-systems/training-systems.controller.ts` | 18 | `BaseTrainingSystemsController` | auto-generated, extends:BaseTrainingSystemsController | — |
| `src/training-systems/training-systems.module.ts` | 12 | — | auto-generated | — |
| `src/training-systems/training-systems.service.ts` | 22 | `BaseTrainingSystemsService` | auto-generated, extends:BaseTrainingSystemsService | — |

### `uploads` — **skip-thin**
- Expected base: `BaseUploadsService`
- Issues:
  - folder-navigation.ts: import trùng: ./storage-media
  - uploads.service.ts: import trùng: fs

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/uploads/folder-navigation.ts` | 262 | — | auto-generated | import trùng: ./storage-media |
| `src/uploads/folder-reorganize.ts` | 122 | — | auto-generated | — |
| `src/uploads/order-image-snapshot.ts` | 136 | — | auto-generated | — |
| `src/uploads/public-uploads.controller.ts` | 84 | — | auto-generated, public-mirror, fat:84L | — |
| `src/uploads/storage-folder-labels.ts` | 44 | — | auto-generated | — |
| `src/uploads/storage-folder-name.ts` | 90 | — | auto-generated | — |
| `src/uploads/storage-media.ts` | 513 | — | auto-generated | — |
| `src/uploads/storage-path-resolver.ts` | 124 | — | auto-generated | — |
| `src/uploads/storage-protected-paths.ts` | 30 | — | auto-generated | — |
| `src/uploads/storage-upload-policy.ts` | 213 | — | auto-generated | — |
| `src/uploads/upload-filename.ts` | 73 | — | auto-generated | — |
| `src/uploads/uploads.controller.ts` | 581 | — | auto-generated, fat:581L | — |
| `src/uploads/uploads.module.ts` | 13 | — | auto-generated | — |
| `src/uploads/uploads.service.ts` | 1980 | — | auto-generated, mirror-service, fat:1980L | import trùng: fs |
| `src/uploads/zip-path-mapper.ts` | 136 | — | auto-generated | — |

### `users` — **thin**
- Expected base: `BaseUsersService`
- Issues:
  - users.controller.ts: import trùng: ../common/module-bases/users/users.controller

| File | Dòng | Extends | Flags | Issues |
|------|------|---------|-------|--------|
| `src/users/users.controller.ts` | 449 | `BaseUsersController` | auto-generated, extends:BaseUsersController, fat:449L | import trùng: ../common/module-bases/users/users.controller |
| `src/users/users.module.ts` | 20 | — | auto-generated | — |
| `src/users/users.service.ts` | 43 | `BaseUsersService` | auto-generated, extends:BaseUsersService | — |

## Module thin nhưng service fat (cần review)

- `admission-results` — 142 dòng (src/admission-results/admission-results.service.ts)
- `orders` — 327 dòng (src/orders/orders.service.ts)
- `products` — 194 dòng (src/products/products.service.ts)
- `promo-codes` — 119 dòng (src/promo-codes/promo-codes.service.ts)

## Module mirror (không thin)

- `seeds` — no-service

