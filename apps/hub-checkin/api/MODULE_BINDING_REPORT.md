# Báo cáo module binding — apps\hub-event\api

Thời điểm: 2026-06-13T19:43:26.914Z

## Tổng quan

| Loại | Số module |
|------|-----------|
| **thin** (extends Base* package) | 42 |
| **skip-thin** (mirror — multi-service / phức tạp) | 1 |
| **mirror** (copy main, chưa thin) | 0 |
| **crud-legacy** (BaseStandardAdminCrudService) | 0 |
| Tổng module app | 50 |

Package template ref: 54 module
Active module-bases (thin): 42 module

## Xác minh sau render

- **Typecheck**: pass (`tsc --noEmit`)
- **Check-in API**: pass (48 module Nest bootstrap)
- **Endpoint parity**: pass (mọi route main có trong template; route thừa = kế thừa Base*)

## Module thin (extends Base*)

- `academic-years` → `BaseAcademicYearsService`
- `accounts` → `BaseAccountsService`
- `admission-results` → `BaseAdmissionResultsService`
- `auth` → `BaseAuthService`
- `cameras` → `BaseCamerasService`
- `carts` → `BaseCartsService`
- `categories` → `BaseCategoriesService`
- `comments` → `BaseCommentsService`
- `contact-requests` → `BaseContactRequestsService`
- `courses` → `BaseCoursesService`
- `dashboard` → `BaseDashboardService`
- `departments` → `BaseDepartmentsService`
- `event-checkins` → `BaseEventCheckinsService`
- `event-checkouts` → `BaseEventCheckoutsService`
- `event-registrations` → `BaseEventRegistrationsService`
- `event-speakers` → `BaseEventSpeakersService`
- `events` → `BaseEventsService`
- `face-data` → `BaseFaceDatasService`
- `groups` → `BaseGroupsService`
- `imported-users` → `BaseImportedUsersService`
- `locations` → `BaseLocationsService`
- `majors` → `BaseMajorsService`
- `notifications` → `BaseNotificationsService`
- `orders` → `BaseOrdersService`
- `page-contents` → `BasePageContentsService`
- `parent-students` → `BaseParentStudentsService`
- `posts` → `BasePostsService`
- `products` → `BaseProductsService`
- `promo-codes` → `BasePromoCodesService`
- `roles` → `BaseRolesService`
- `screens` → `BaseScreensService`
- `seo-metas` → `BaseSeoMetasService`
- `sessions` → `BaseSessionsService`
- `settings` → `BaseSettingsService`
- `speakers` → `BaseSpeakersService`
- `students` → `BaseStudentsService`
- `system` → `BaseSystemService`
- `tags` → `BaseTagsService`
- `templates` → `BaseTemplatesService`
- `training-levels` → `BaseTrainingLevelsService`
- `training-systems` → `BaseTrainingSystemsService`
- `users` → `BaseUsersService`

## Module skip-thin (giữ mirror)

- `uploads`

## Module mirror khác

- _(không)_

