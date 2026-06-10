# Audit: Actions & API Queries theo từng chức năng Backend

> Ngày tạo: 2026-06-04 (cập nhật lần cuối: 2026-06-05)
> Mục đích: Liệt kê `feature → action → API query → permission → controller` để đối chiếu giữa `apps/backend/`, `apps/api/` và `apps/api/src/config/permissions.ts`.
> Trạng thái: **Permission list đã được chuẩn hóa — bổ sung `EVENT_CHECKOUTS_*`, `IMPORTED_USERS_*`, `SYSTEM_*`, `PARENT_STUDENTS_*`, `ROLES_RESTORE`, `TAGS_RESTORE` ở cả API config, api-client `PERMISSION_CODES`, backend labels, và super_admin seed. `packages/api-client/src/permissions.ts` đã được refactor: bỏ section "Frontend-specific Resources" (đã lỗi thời vì các resource này giờ đều có trong API), nhóm theo domain nghiệp vụ, cô lập các key dot-notation legacy ở cuối với JSDoc `@deprecated`.**

---

## 1. Quy trình kiểm tra

Với mỗi chức năng trong `apps/backend/src/app/<feature>/`:

1. Đọc `page.tsx` + `_component/columns.tsx` + `_component/_hooks/use-<feature>-actions.ts` để tìm `api.<resource>.<method>()`.
2. Tra `packages/api-client/src/resources/<resource>.ts` để biết HTTP verb + path.
3. Tra `apps/api/src/<resource>/<resource>.controller.ts` để biết `@Permissions()`.
4. Tra `apps/api/src/config/permissions.ts` để biết hằng số API.
5. Tra `packages/api-client/src/permissions.ts` (`PERMISSION_CODES`) + `apps/backend/src/lib/permission-labels.ts` (`RESOURCE_LABEL_VI`) để biết UI có hiển thị nhóm đó không.

---

## 2. Bảng ánh xạ Feature → Action → API → Permission

| Feature (apps/backend/src/app) | Action người dùng              | API client call                                                      | HTTP / API endpoint                            | Permission (string)                             | API constant               | UI group            |
| ------------------------------ | ------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- | -------------------------- | ------------------- |
| `login`, `register`            | (public)                       | `api.auth.*`                                                         | `/auth/*`                                      | (none)                                          | —                          | —                   |
| `page.tsx` (dashboard)         | Xem thống kê                   | `api.dashboard.stats()`                                              | `GET /admin/dashboard/stats`                   | `dashboard:view`                                | `DASHBOARD_VIEW`           | dashboard           |
| `profile`                      | Xem / cập nhật tài khoản       | `api.profile.*`                                                      | `/accounts/*`                                  | `accounts:view/update`                          | `ACCOUNTS_*`               | accounts            |
| `staff`                        | List users                     | `api.users.list()`                                                   | `GET /admin/users`                             | `users:view`                                    | `USERS_VIEW`               | users               |
|                                | Tạo user                       | `api.users.create()`                                                 | `POST /admin/users`                            | `users:create`                                  | `USERS_CREATE`             |                     |
|                                | Sửa user                       | `api.users.update()`                                                 | `PATCH /admin/users/:id`                       | `users:update`                                  | `USERS_UPDATE`             |                     |
|                                | Xóa user                       | `api.users.remove()`                                                 | `DELETE /admin/users/:id`                      | `users:delete`                                  | `USERS_DELETE`             |                     |
|                                | Active/unactive                | `api.users.active()`, `unactive()`                                   | `POST /admin/users/:id/active`                 | `users:active/unactive`                         | `USERS_ACTIVE`/`UNACTIVE`  |                     |
|                                | Khôi phục                      | `api.users.restore()`                                                | `POST /admin/users/:id/restore`                | `users:restore`                                 | `USERS_RESTORE`            |                     |
|                                | Hard-delete                    | `api.users.purge()`                                                  | `DELETE /admin/users/:id/hard-delete`          | `users:hard-delete`                             | `USERS_HARD_DELETE`        |                     |
|                                | Bulk                           | `api.users.bulk()`                                                   | `POST /admin/users/bulk`                       | `users:manage`                                  | `USERS_MANAGE`             |                     |
| `rbac`                         | List roles                     | `api.roles.list()`                                                   | `GET /admin/roles`                             | `roles:view`                                    | `ROLES_VIEW`               | roles               |
|                                | Create role                    | `api.roles.create()`                                                 | `POST /admin/roles`                            | `roles:create`                                  | `ROLES_CREATE`             |                     |
|                                | Update role                    | `api.roles.update()`                                                 | `PATCH /admin/roles/:id`                       | `roles:update`                                  | `ROLES_UPDATE`             |                     |
|                                | Delete role                    | `api.roles.remove()`                                                 | `DELETE /admin/roles/:id`                      | `roles:delete`                                  | `ROLES_DELETE`             |                     |
|                                | Restore                        | `api.roles.restore()`                                                | `POST /admin/roles/:id/restore`                | `roles:restore`                                 | `ROLES_RESTORE`            |                     |
|                                | Hard-delete                    | `api.roles.purge()`                                                  | `DELETE /admin/roles/:id/hard-delete`          | `roles:manage`                                  | `ROLES_MANAGE`             |                     |
|                                | Bulk                           | `api.roles.bulk()`                                                   | `POST /admin/roles/bulk`                       | `roles:manage`                                  | `ROLES_MANAGE`             |                     |
| `posts`                        | List                           | `api.posts.list()`                                                   | `GET /admin/posts`                             | `posts:view`                                    | `POSTS_VIEW`               | posts               |
|                                | Detail                         | `api.posts.get()`                                                    | `GET /admin/posts/:id`                         | `posts:view`                                    | `POSTS_VIEW`               |                     |
|                                | Create                         | `api.posts.create()`                                                 | `POST /admin/posts`                            | `posts:create`                                  | `POSTS_CREATE`             |                     |
|                                | Update                         | `api.posts.update()`                                                 | `PATCH /admin/posts/:id`                       | `posts:update`                                  | `POSTS_UPDATE`             |                     |
|                                | Delete                         | `api.posts.remove()`                                                 | `DELETE /admin/posts/:id`                      | `posts:delete`                                  | `POSTS_DELETE`             |                     |
|                                | Restore                        | `api.posts.restore()`                                                | `POST /admin/posts/:id/restore`                | `posts:restore`                                 | `POSTS_RESTORE`            |                     |
|                                | Publish                        | `api.posts.publish()`                                                | `POST /admin/posts/:id/publish`                | `posts:publish`                                 | `POSTS_PUBLISH`            |                     |
|                                | Bulk                           | `api.posts.bulk()`                                                   | `POST /admin/posts/bulk`                       | `posts:manage`                                  | `POSTS_MANAGE`             |                     |
|                                | Taxonomy                       | `api.taxonomy.*` (categories, tags)                                  | `/taxonomy/*`                                  | `categories:* / tags:*`                         | `CATEGORIES_* / TAGS_*`    | categories, tags    |
| `categories`                   | List                           | `api.categories.list()`                                              | `GET /admin/categories`                        | `categories:view`                               | `CATEGORIES_VIEW`          | categories          |
|                                | Create/Update                  | `api.categories.create/update()`                                     | `POST /admin/categories`                       | `categories:create/update`                      | `CATEGORIES_*`             |                     |
|                                | Delete                         | `api.categories.remove()`                                            | `DELETE /admin/categories/:id`                 | `categories:delete`                             | `CATEGORIES_DELETE`        |                     |
|                                | Restore                        | `api.categories.restore()`                                           | `POST /admin/categories/:id/restore`           | `categories:manage`                             | `CATEGORIES_MANAGE`        |                     |
|                                | Hard-delete                    | `api.categories.purgeTrashed()`                                      | `DELETE /admin/categories/:id/hard-delete`     | `categories:manage`                             | `CATEGORIES_MANAGE`        |                     |
|                                | Bulk                           | `api.categories.bulk()`                                              | `POST /admin/categories/bulk`                  | `categories:manage`                             | `CATEGORIES_MANAGE`        |                     |
| `tags`                         | CRUD + Bulk                    | `api.tags.*`                                                         | `/admin/tags/*`                                | `tags:*`                                        | `TAGS_*`                   | tags                |
|                                | Restore                        | `api.tags.restore()`                                                 | `POST /admin/tags/:id/restore`                 | `tags:restore`                                  | `TAGS_RESTORE`             |                     |
|                                | Hard-delete                    | `api.tags.purge()`                                                   | `DELETE /admin/tags/:id/hard-delete`           | `tags:manage`                                   | `TAGS_MANAGE`              |                     |
| `contact-requests`             | List                           | `api.contactRequests.list()`                                         | `GET /admin/contact-requests`                  | `contact_requests:view`                         | `CONTACT_REQUESTS_VIEW`    | contact_requests    |
|                                | Detail                         | `api.contactRequests.get()`                                          | `GET /admin/contact-requests/:id`              | `contact_requests:view`                         | `CONTACT_REQUESTS_VIEW`    |                     |
|                                | Create                         | `api.contactRequests.create()`                                       | `POST /admin/contact-requests`                 | `contact_requests:create`                       | `CONTACT_REQUESTS_CREATE`  |                     |
|                                | Update                         | `api.contactRequests.update()`                                       | `PATCH /admin/contact-requests/:id`            | `contact_requests:update`                       | `CONTACT_REQUESTS_UPDATE`  |                     |
|                                | Delete                         | `api.contactRequests.remove()`                                       | `DELETE /admin/contact-requests/:id`           | `contact_requests:delete`                       | `CONTACT_REQUESTS_DELETE`  |                     |
|                                | Assign                         | `api.contactRequests.assign()`                                       | `POST /admin/contact-requests/:id/assign`      | `contact_requests:assign`                       | `CONTACT_REQUESTS_ASSIGN`  |                     |
|                                | Bulk                           | `api.contactRequests.bulk()`                                         | `POST /admin/contact-requests/bulk`            | `contact_requests:manage`                       | `CONTACT_REQUESTS_MANAGE`  |                     |
| `guides`                       | List                           | `api.guides.list()`                                                  | `GET /admin/guides`                            | `page_contents:view`                            | `PAGE_CONTENTS_VIEW`       | page_contents       |
|                                | Create/Update/Delete           | `api.guides.*`                                                       | `/admin/guides/*`                              | `page_contents:create/update/delete`            | `PAGE_CONTENTS_*`          |                     |
|                                | Hard-delete                    | `api.guides.purge()`                                                 | `DELETE /admin/guides/:id/hard-delete`         | `page_contents:manage`                          | `PAGE_CONTENTS_MANAGE`     |                     |
|                                | Bulk hard-delete               | `api.guides.bulk({action:"hard-delete"})`                            | `POST /admin/guides/bulk`                      | `page_contents:manage`                          | `PAGE_CONTENTS_MANAGE`     |                     |
| `my-students`                  | List my students               | `api.myStudents.list()`                                              | `GET /students/my`                             | `students:view_own`                             | `STUDENTS_VIEW_OWN`        | students            |
|                                | Thêm student (của mình)        | `api.myStudents.add()`                                               | `POST /students/my`                            | `students:view_own` (custom)                    | —                          |                     |
|                                | Xóa student                    | `api.myStudents.remove()`                                            | `DELETE /students/my/:id`                      | `students:view_own` (custom)                    | —                          |                     |
|                                | Điểm chi tiết                  | `api.myStudents.getDetailedScores()`                                 | `GET /students/my/:code/scores`                | `students:view_own`                             | `STUDENTS_VIEW_OWN`        |                     |
|                                | Điểm TB                        | `api.myStudents.getYearAverages/getTermAverages/getOverallAverage()` | `GET /students/my/:code/averages`              | `students:view_own`                             | `STUDENTS_VIEW_OWN`        |                     |
| `parent-students`              | List students to review        | `api.parentStudents.list()`                                          | `GET /admin/parent-students`                   | `students:view` (custom route)                  | `STUDENTS_VIEW`            | students            |
|                                | Duyệt (review)                 | `api.parentStudents.review()`                                        | `PATCH /admin/parent-students/:id/review`      | `students:update` (custom)                      | `STUDENTS_UPDATE`          |                     |
|                                | Xóa                            | `api.parentStudents.remove()`                                        | `DELETE /admin/parent-students/:id`            | `students:delete` (custom)                      | `STUDENTS_DELETE`          |                     |
| `academic-years`               | List                           | `api.academicYears.list()`                                           | `GET /admin/academic-years`                    | `academic_years:view`                           | `ACADEMIC_YEARS_VIEW`      | academic_years      |
|                                | Create/Update/Delete           | `api.academicYears.*`                                                | `/admin/academic-years/*`                      | `academic_years:create/update/delete`           | `ACADEMIC_YEARS_*`         |                     |
|                                | Hard-delete                    | `api.academicYears.purge()`                                          | `DELETE /admin/academic-years/:id/hard-delete` | `academic_years:manage`                         | `ACADEMIC_YEARS_MANAGE`    |                     |
|                                | Bulk                           | `api.academicYears.bulk()`                                           | `POST /admin/academic-years/bulk`              | `academic_years:manage`                         | `ACADEMIC_YEARS_MANAGE`    |                     |
| `courses`                      | List                           | `api.courses.list()`                                                 | `GET /admin/courses`                           | `courses:view`                                  | `COURSES_VIEW`             | courses             |
|                                | CRUD                           | `api.courses.create/update/remove()`                                 | `/admin/courses/*`                             | `courses:create/update/delete`                  | `COURSES_*`                |                     |
|                                | Restore / Hard-delete / Bulk   | `api.courses.restore/purge/bulk()`                                   | `POST /admin/courses/bulk`                     | `courses:manage`                                | `COURSES_MANAGE`           |                     |
| `departments`                  | List / CRUD                    | `api.departments.*`                                                  | `/admin/departments/*`                         | `departments:*`                                 | `DEPARTMENTS_*`            | departments         |
|                                | Restore / Hard-delete / Bulk   | `api.departments.restore/purge/bulk()`                               | `POST /admin/departments/bulk`                 | `departments:manage`                            | `DEPARTMENTS_MANAGE`       |                     |
| `events`                       | List / CRUD                    | `api.events.*`                                                       | `/admin/events/*`                              | `events:*`                                      | `EVENTS_*`                 | events              |
|                                | Update isFeatured              | `api.events.update(id, {isFeatured})`                                | `PATCH /admin/events/:id`                      | `events:update`                                 | `EVENTS_UPDATE`            |                     |
|                                | Restore / Hard-delete / Bulk   | `api.events.restore/purge/bulk()`                                    | `POST /admin/events/bulk`                      | `events:manage`                                 | `EVENTS_MANAGE`            |                     |
| (sub) Event Registrations      | List                           | `api.eventRegistrations.list()`                                      | `GET /admin/event-registrations`               | `event_registrations:view`                      | `EVENT_REGISTRATIONS_VIEW` | event_registrations |
|                                | Checkin                        | `api.eventCheckins.*`                                                | `/admin/event-checkins/*`                      | `event_checkins:*`                              | `EVENT_CHECKINS_*`         | event_checkins      |
|                                | Checkout                       | `api.eventCheckouts.*`                                               | `/admin/event-checkouts/*`                     | `event_checkouts:*`                             | `EVENT_CHECKOUTS_*`        | event_checkouts     |
|                                | Speakers gán                   | `api.eventSpeakers.*`                                                | `/admin/event-speakers/*`                      | `event_speakers:*`                              | `EVENT_SPEAKERS_*`         | event_speakers      |
| `locations`                    | List / CRUD                    | `api.locations.*`                                                    | `/admin/locations/*`                           | `locations:*`                                   | `LOCATIONS_*`              | locations           |
|                                | Restore / Hard-delete / Bulk   | `api.locations.restore/purge/bulk()`                                 | `POST /admin/locations/bulk`                   | `locations:manage`                              | `LOCATIONS_MANAGE`         |                     |
| `majors`                       | List / CRUD                    | `api.majors.*`                                                       | `/admin/majors/*`                              | `majors:*`                                      | `MAJORS_*`                 | majors              |
|                                | Restore / Hard-delete / Bulk   | `api.majors.restore/purge/bulk()`                                    | `POST /admin/majors/bulk`                      | `majors:manage`                                 | `MAJORS_MANAGE`            |                     |
| `speakers`                     | List / CRUD                    | `api.speakers.*`                                                     | `/admin/speakers/*`                            | `speakers:*`                                    | `SPEAKERS_*`               | speakers            |
|                                | Restore / Hard-delete / Bulk   | `api.speakers.restore/purge/bulk()`                                  | `POST /admin/speakers/bulk`                    | `speakers:manage`                               | `SPEAKERS_MANAGE`          |                     |
| `screens`                      | List / CRUD                    | `api.screens.*`                                                      | `/admin/screens/*`                             | `screens:*`                                     | `SCREENS_*`                | screens             |
|                                | Restore / Hard-delete / Bulk   | `api.screens.restore/purge/bulk()`                                   | `POST /admin/screens/bulk`                     | `screens:manage`                                | `SCREENS_MANAGE`           |                     |
| `cameras`                      | List / CRUD                    | `api.cameras.*`                                                      | `/admin/cameras/*`                             | `cameras:*`                                     | `CAMERAS_*`                | cameras             |
|                                | Restore / Hard-delete / Bulk   | `api.cameras.restore/purge/bulk()`                                   | `POST /admin/cameras/bulk`                     | `cameras:manage`                                | `CAMERAS_MANAGE`           |                     |
| `templates`                    | List / CRUD                    | `api.templates.*`                                                    | `/admin/templates/*`                           | `templates:*`                                   | `TEMPLATES_*`              | templates           |
|                                | Restore / Hard-delete / Bulk   | `api.templates.restore/purge/bulk()`                                 | `POST /admin/templates/bulk`                   | `templates:manage`                              | `TEMPLATES_MANAGE`         |                     |
| `training-levels`              | List / CRUD                    | `api.trainingLevels.*`                                               | `/admin/training-levels/*`                     | `training_levels:*`                             | `TRAINING_LEVELS_*`        | training_levels     |
|                                | Restore / Hard-delete / Bulk   | `api.trainingLevels.restore/purge/bulk()`                            | `POST /admin/training-levels/bulk`             | `training_levels:manage`                        | `TRAINING_LEVELS_MANAGE`   |                     |
| `training-systems`             | List / CRUD                    | `api.trainingSystems.*`                                              | `/admin/training-systems/*`                    | `training_systems:*`                            | `TRAINING_SYSTEMS_*`       | training_systems    |
|                                | Restore / Hard-delete / Bulk   | `api.trainingSystems.restore/purge/bulk()`                           | `POST /admin/training-systems/bulk`            | `training_systems:manage`                       | `TRAINING_SYSTEMS_MANAGE`  |                     |
| `seo-metas`                    | List                           | `api.seoMetas.list()`                                                | `GET /admin/seo-metas`                         | `seo_metas:view`                                | `SEO_METAS_VIEW`           | seo_metas           |
|                                | Create/Update                  | `api.seoMetas.create/update()`                                       | `POST/PATCH /admin/seo-metas`                  | `seo_metas:create/update`                       | `SEO_METAS_CREATE/UPDATE`  |                     |
|                                | Delete / Restore / Hard-delete | `api.seoMetas.remove/restore/purge()`                                | `/admin/seo-metas/*`                           | `seo_metas:delete / restore / hard-delete`      | `SEO_METAS_*`              |                     |
|                                | Bulk                           | `api.seoMetas.bulk()`                                                | `POST /admin/seo-metas/bulk`                   | `seo_metas:manage`                              | `SEO_METAS_MANAGE`         |                     |
| `data`                         | Sao lưu / bảo trì              | `api.system.*`                                                       | `POST /admin/system/*`                         | `system:manage / system:import / system:export` | `SYSTEM_*`                 | system              |
| `database-schema`              | (super_admin only)             | `api.system.getDatabaseSchema()`                                     | `GET /admin/system/database-schema`            | `system:view`                                   | `SYSTEM_VIEW`              | system              |
| `graph`                        | (super_admin only)             | (graphify route)                                                     | `GET /api/graphify`                            | (no perm — super_admin only)                    | —                          | —                   |
| `settings`                     | List / Update                  | `api.settings.list/update()`                                         | `GET/PATCH /admin/settings`                    | `settings:view/update`                          | `SETTINGS_VIEW/UPDATE`     | settings            |
|                                | Roles selector                 | `api.roles.list()`                                                   | `GET /admin/roles`                             | `roles:view`                                    | `ROLES_VIEW`               | roles               |

---

## 3. Resources KHÔNG có feature @backend (chỉ quản lý qua API/seeder)

| Resource            | Tại sao không có page                                          | Cách dùng                                                                          |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `accounts`          | (profile page dùng `api.profile.*`, không có CRUD admin riêng) | Dùng `/admin/accounts` nếu cần; hiện tại controller có class-level `ACCOUNTS_VIEW` |
| `comments`          | (chưa có admin page — có thể là TODO)                          | API có `CommentsController` với class-level `COMMENTS_VIEW`                        |
| `messages`          | (chưa có admin page)                                           | API có `MessagesController` + `ConversationsController`                            |
| `groups`            | (chưa có admin page)                                           | API có `GroupsController`                                                          |
| `notifications`     | (chưa có admin page)                                           | API có `NotificationsController`                                                   |
| `sessions`          | (chưa có admin page)                                           | API có `SessionsController`                                                        |
| `uploads`           | (chưa có admin page — quản lý qua `editor` / `form` upload)    | API có `UploadsController`                                                         |
| `admission_results` | (chưa có admin page)                                           | API có `AdmissionResultsController`                                                |
| `face_data`         | (chưa có admin page)                                           | API có `FaceDataController`                                                        |
| `imported_users`    | (chưa có admin page)                                           | API có `ImportedUsersController` (import sinh viên)                                |

Các resource này vẫn có controller + `@Permissions()` đầy đủ, chỉ thiếu UI page admin.

---

## 4. Audit Permission — đã làm và còn thiếu

### 4.1. `apps/api/src/config/permissions.ts` ✅

- 37 resource + 16 action. Đầy đủ cho mọi controller.
- `generateResourcePermissions()` helper chuẩn hóa tên constant.
- Hằng số bổ sung (`*_RESTORE`, `*_HARD_DELETE`, `*_ACTIVE`, `*_UNACTIVE`, `*_ASSIGN`, `*_APPROVE`, `*_PUBLISH`, `*_VIEW_ALL`, `*_VIEW_OWN`, `*_IMPORT`) đều có.

### 4.2. `packages/api-client/src/permissions.ts` — đã fix

**Đã bổ sung** (trước đây thiếu → khiến ma trận UI không hiển thị nhóm này):

```ts
// ─── Event Checkouts (bulk reset hasCheckout) ───
EVENT_CHECKOUTS_VIEW: "event_checkouts:view",
EVENT_CHECKOUTS_CREATE: "event_checkouts:create",
EVENT_CHECKOUTS_UPDATE: "event_checkouts:update",
EVENT_CHECKOUTS_DELETE: "event_checkouts:delete",
EVENT_CHECKOUTS_MANAGE: "event_checkouts:manage",
EVENT_CHECKOUTS_EXPORT: "event_checkouts:export",

// ─── Imported Users (import sinh viên hàng loạt) ───
IMPORTED_USERS_VIEW: "imported_users:view",
IMPORTED_USERS_CREATE: "imported_users:create",
IMPORTED_USERS_UPDATE: "imported_users:update",
IMPORTED_USERS_DELETE: "imported_users:delete",
IMPORTED_USERS_MANAGE: "imported_users:manage",
IMPORTED_USERS_RESTORE: "imported_users:restore",
```

### 4.3. `apps/backend/src/lib/permission-labels.ts` — đã fix

**Đã bổ sung** 3 group key còn thiếu:

```ts
const RESOURCE_LABEL_VI = {
  // ... existing
  seo_metas: "SEO meta",
  event_checkouts: "check-out sự kiện",
  imported_users: "user imported",
}
```

### 4.4. `apps/api/src/seeds/superadmin-bootstrap.data.ts` — đã fix

Role `super_admin` được bổ sung các perm còn thiếu: `tags:restore`, `roles:restore`, `imported_users:*` (7), `system:*` (7), `parent_students:*` (6), `categories:restore`, `categories:hard-delete`, `groups:restore`, `groups:hard-delete` (cho 3 role super_admin records). Tổng seed giờ bao phủ 40 resource × action (xem chi tiết tại `apps/api/src/seeds/superadmin-bootstrap.data.ts`).

### 4.5. `packages/api-client/src/permissions.ts` — clean code refactor

- Bỏ section "Frontend-specific Resources (chưa có trong API permissions)" — các resource này giờ đều đã có trong API nên gộp về section chính.
- Nhóm theo domain nghiệp vụ (Dashboard / People / Content / Communication / Academic / Events / CMS resources / Operational / RBAC) với separator `// ───`.
- Cô lập key dot-notation legacy (`users.cart_own`, `rbac.read`, `data.maintenance`, `support.read/write`, `categories.read/write`, `products.read/write`, `orders.read/write/checkout`) vào section `// ─── Legacy (dot-notation, giữ để không vỡ code cũ) ───` với JSDoc `@deprecated` chỉ hướng di chuyển.
- Mỗi resource tuân thủ thứ tự `VIEW → CREATE → UPDATE → DELETE → MANAGE → EXPORT` rồi extras (`*_RESTORE`, `*_HARD_DELETE`, `*_ACTIVE`, `*_UNACTIVE`, `*_APPROVE`, `*_PUBLISH`, `*_VIEW_ALL/OWN`, `*_IMPORT`).
- Bổ sung `ROLES_*` (7), `FACE_DATA_EXPORT`, `IMPORTED_USERS_EXPORT`, `CATEGORIES_RESTORE/HARD_DELETE`, `GROUPS_RESTORE/HARD_DELETE`, `EVENT_REGISTRATIONS_RESTORE/HARD_DELETE`, `EVENT_CHECKINS_RESTORE/HARD_DELETE`, `FACE_DATA_RESTORE/HARD_DELETE` để đối xứng với API.

### 4.6. Đối xứng restore / hard-delete giữa các resource (round 2)

Round 1 audit phát hiện 5 resource còn dùng `*_MANAGE` cho restore và `*_DELETE`/`*_MANAGE` cho hard-delete. Đã thống nhất convention: **mỗi restore endpoint dùng `*_RESTORE`** (nếu có restore action) và **mỗi hard-delete endpoint dùng `*_HARD_DELETE`** (nếu có hard-delete action). Round 2 bổ sung 10 perm code mới:

| Resource              | Restore                       | Hard-delete                       |
| --------------------- | ----------------------------- | --------------------------------- |
| `categories`          | `CATEGORIES_RESTORE`          | `CATEGORIES_HARD_DELETE`          |
| `event_checkins`      | `EVENT_CHECKINS_RESTORE`      | `EVENT_CHECKINS_HARD_DELETE`      |
| `event_registrations` | `EVENT_REGISTRATIONS_RESTORE` | `EVENT_REGISTRATIONS_HARD_DELETE` |
| `face_data`           | `FACE_DATA_RESTORE`           | `FACE_DATA_HARD_DELETE`           |
| `groups`              | `GROUPS_RESTORE`              | `GROUPS_HARD_DELETE`              |

5 controller đã được update để dùng perm granular mới:

- `apps/api/src/categories/categories.controller.ts:524, 433`
- `apps/api/src/event-checkins/event-checkins.controller.ts:202, 252`
- `apps/api/src/event-registrations/event-registrations.controller.ts:252, 302`
- `apps/api/src/face-data/face-data.controller.ts:167, 217`
- `apps/api/src/groups/groups.controller.ts:329, 412`

Convention: **khi thêm resource mới có restore / hard-delete, khai báo đủ `*_RESTORE` và `*_HARD_DELETE` cùng `*_MANAGE`**.

---

## 5. Tổng số permission theo resource

Tính từ `apps/api/src/config/permissions.ts` (generateResourcePermissions + extras):

| Resource          | Số perm | Resource            | Số perm |
| ----------------- | ------- | ------------------- | ------- |
| dashboard         | 1       | seo_metas           | 8       |
| users             | 11      | speakers            | 7       |
| posts             | 11      | locations           | 7       |
| categories        | 8       | training_levels     | 7       |
| tags              | 7       | training_systems    | 7       |
| comments          | 8       | majors              | 7       |
| roles             | 7       | courses             | 7       |
| messages          | 6       | academic_years      | 7       |
| groups            | 8       | events              | 7       |
| notifications     | 5       | cameras             | 7       |
| contact_requests  | 8       | templates           | 7       |
| students          | 11      | screens             | 7       |
| sessions          | 7       | departments         | 7       |
| settings          | 7       | event_registrations | 8       |
| accounts          | 3       | event_checkins      | 8       |
| uploads           | 6       | event_checkouts     | 6       |
| admission_results | 8       | event_speakers      | 6       |
| page_contents     | 6       | face_data           | 8       |
|                   |         | imported_users      | 7       |
|                   |         | system              | 6       |
|                   |         | parent_students     | 6       |

**Tổng: 277 permissions** trải đều trên 40 resource (sau round 2: +10 perm cho restore/hard-delete của 5 resource: categories, groups, event_checkins, event_registrations, face_data). Ma trận UI ở `/rbac/[id]` sẽ hiển thị đủ nhóm vì `Object.values(PERMISSION_CODES)` quét toàn bộ `PERMISSION_CODES`.

---

## 6. Controller → @Permissions coverage

| Controller                       | Class-level                                    | Override per-action                                                 | Bulk endpoint | Status           |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- | ------------- | ---------------- |
| `UsersController`                | `USERS_VIEW`                                   | `_CREATE/_UPDATE/_DELETE/_RESTORE/_HARD_DELETE/_ACTIVE/_UNACTIVE`   | ✅            | ✅               |
| `RolesController`                | `ROLES_VIEW`                                   | `_CREATE/_UPDATE/_DELETE/_RESTORE/_MANAGE`                          | ✅            | ✅               |
| `PostsController`                | `POSTS_VIEW`                                   | `_CREATE/_UPDATE/_DELETE/_PUBLISH/_RESTORE/_IMPORT/_EXPORT`         | ✅            | ✅               |
| `CategoriesController`           | `CATEGORIES_VIEW`                              | `_CREATE/_UPDATE/_DELETE/_RESTORE/_HARD_DELETE`                     | ✅            | ✅               |
| `TagsController`                 | `TAGS_VIEW`                                    | `_CREATE/_UPDATE/_DELETE/_RESTORE/_MANAGE`                          | ✅            | ✅               |
| `CommentsController`             | `COMMENTS_VIEW`                                | `_CREATE/_UPDATE/_DELETE/_APPROVE/_MANAGE`                          | ✅            | ✅               |
| `MessagesController`             | `MESSAGES_VIEW`                                | (tùy method)                                                        | ✅            | ✅               |
| `ConversationsController`        | `MESSAGES_VIEW`                                | `markRead` dùng `MESSAGES_UPDATE`                                   | ✅            | ✅               |
| `GroupsController`               | `GROUPS_VIEW`                                  | `_CREATE/_UPDATE/_DELETE/_RESTORE/_HARD_DELETE`                     | ✅            | ✅               |
| `NotificationsController`        | `NOTIFICATIONS_VIEW_OWN`                       | (per-action override)                                               | (n/a)         | ✅               |
| `ContactRequestsController`      | `CONTACT_REQUESTS_VIEW`                        | `_CREATE/_UPDATE/_DELETE/_ASSIGN/_MANAGE`                           | ✅            | ✅               |
| `StudentsController`             | `STUDENTS_VIEW`                                | (per-action)                                                        | ✅            | ✅               |
| `SessionsController`             | `SESSIONS_VIEW`                                | (per-action)                                                        | ✅            | ✅               |
| `SettingsController`             | `SETTINGS_VIEW`                                | `_UPDATE/_DELETE/_IMPORT`                                           | (n/a)         | ✅               |
| `AccountsController`             | `ACCOUNTS_VIEW`                                | `_UPDATE`                                                           | (n/a)         | ✅               |
| `UploadsController`              | `UPLOADS_VIEW`                                 | (per-action)                                                        | ✅            | ✅               |
| `AdmissionResultsController`     | `ADMISSION_RESULTS_VIEW`                       | (per-action)                                                        | ✅            | ✅               |
| `PageContentsController`         | `PAGE_CONTENTS_VIEW`                           | (per-action override)                                               | ✅            | ✅               |
| `SeoMetasController`             | `SEO_METAS_VIEW`                               | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `SpeakersController`             | `SPEAKERS_VIEW`                                | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `LocationsController`            | `LOCATIONS_VIEW`                               | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `TrainingLevelsController`       | `TRAINING_LEVELS_VIEW`                         | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `TrainingSystemsController`      | `TRAINING_SYSTEMS_VIEW`                        | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `MajorsController`               | `MAJORS_VIEW`                                  | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `CoursesController`              | `COURSES_VIEW`                                 | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `AcademicYearsController`        | `ACADEMIC_YEARS_VIEW`                          | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `EventsController`               | `EVENTS_VIEW`                                  | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `EventRegistrationsController`   | `EVENT_REGISTRATIONS_VIEW`                     | `_CREATE/_UPDATE/_DELETE/_RESTORE/_HARD_DELETE`                     | ✅            | ✅               |
| `EventCheckinsController`        | `EVENT_CHECKINS_VIEW`                          | `_CREATE/_UPDATE/_DELETE/_RESTORE/_HARD_DELETE`                     | ✅            | ✅               |
| `EventCheckoutsController`       | `EVENT_CHECKOUTS_VIEW`                         | `bulkClear` dùng `_MANAGE`                                          | ✅            | ✅               |
| `EventSpeakersController`        | `EVENT_SPEAKERS_VIEW`                          | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `CamerasController`              | `CAMERAS_VIEW`                                 | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `TemplatesController`            | `TEMPLATES_VIEW`                               | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `ScreensController`              | `SCREENS_VIEW`                                 | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `DepartmentsController`          | `DEPARTMENTS_VIEW`                             | `_CREATE/_UPDATE/_DELETE/_MANAGE`                                   | ✅            | ✅               |
| `FaceDataController`             | `FACE_DATA_VIEW`                               | `_DELETE/_RESTORE/_HARD_DELETE`                                     | ✅            | ✅               |
| `ImportedUsersController`        | `IMPORTED_USERS_VIEW`                          | `_CREATE/_UPDATE/_DELETE/_RESTORE/_MANAGE`                          | ✅            | ✅               |
| `SystemController`               | `SYSTEM_MANAGE`                                | `SYSTEM_IMPORT` (POST /import), `SYSTEM_VIEW` (GET database-schema) | (n/a)         | ✅               |
| `HanetWebhookController`         | (n/a — webhook)                                | (n/a)                                                               | (n/a)         | public           |
| `ParentStudentsAdminController`  | `PARENT_STUDENTS_VIEW`                         | `PARENT_STUDENTS_UPDATE` cho review                                 | (n/a)         | ✅               |
| `ParentStudentsPublicController` | (X-User-Id header auth, không phải permission) | (n/a)                                                               | (n/a)         | ✅ (custom auth) |

---

## 7. Checklist khi thêm feature mới

- [ ] Thêm resource + actions vào `apps/api/src/config/permissions.ts` (dùng `RESOURCES.X = 'x'` + `generateResourcePermissions()`).
- [ ] Thêm constant vào `PERMISSION_CODES` ở `packages/api-client/src/permissions.ts`.
- [ ] Thêm `RESOURCE_LABEL_VI[x] = "..."` ở `apps/backend/src/lib/permission-labels.ts` (để UI ma trận có tiêu đề nhóm tiếng Việt).
- [ ] Tạo page admin với `AdminPageGuard permission={PERMISSION_CODES.X_MANAGE}`.
- [ ] Tạo controller với `@Permissions(PERMISSIONS.X_VIEW)` ở class-level, override per-action khi cần.
- [ ] Bổ sung `bulk` method + endpoint dùng `applyBulkAction()` helper.
- [ ] Cập nhật seed role (super_admin phải có hết).
- [ ] Chạy `pnpm verify:permissions` để chắc chắn API ↔ client PERMISSION_CODES khớp.
- [ ] Cập nhật file audit này.

---

## 8. UI Permission Gating — gaps fixed (round 3)

Sau audit phát hiện và đã fix 2 trang còn 🟡/❌ trong ma trận UI gating:

### 8.1. `my-students` — thêm page guard

**File:** `apps/backend/src/app/my-students/page.tsx:141`

- Trước: `<AdminPageGuard>` (không prop → chỉ chặn unauthenticated)
- Sau: `<AdminPageGuard permission={PERMISSION_CODES.STUDENTS_VIEW_OWN}>`

### 8.2. `staff` — fine-grained permission gating

**File:** `apps/backend/src/app/staff/page.tsx`

- Thêm `canCreate`/`canUpdate`/`canDelete`/`canRestore`/`canHardDelete` từ session permissions.
- **Toolbar "Thêm nhân sự"**: gated bằng `canCreate` (thay vì luôn hiện).
- **Cột thao tác (list)**: `canWrite` = `canUpdate`, `canDelete`, `canHardDelete` thay vì hardcoded `canWrite: true`.
- **Cột thao tác (trash)**: `canRestore`, `canHardDelete` thay vì hardcoded `canWrite: true`.
- **Bulk actions (list)**: conditional — active/unactive gated by `canUpdate`, delete gated by `canDelete`, purge gated by `canHardDelete`.
- **Bulk actions (trash)**: restore gated by `canRestore`, purge gated by `canHardDelete`.

**Files đã sửa:**

- `apps/backend/src/app/staff/page.tsx`
- `apps/backend/src/app/staff/_component/columns.tsx`
- `apps/backend/src/app/staff/_component/_table/staff-table.tsx`
- `apps/backend/src/app/staff/_component/_table/staff-trash-table.tsx`

### 8.3. Kết quả

- **staff page**: 5 🟡 → ✅
- **my-students page**: 1 ❌ → ✅
- **Form submit ⬜ items**: xác nhận không phải gap thực sự (role-gated + API enforcement). Chỉ cần cập nhật doc.

---

## 9. Parity check (API ↔ client)

Để tránh drift giữa 2 nguồn truth, có script `script-system/verify-permission-parity.mjs` chạy qua `pnpm verify:permissions` (đã wire vào `pnpm check` + `pnpm check:full`).

Script sẽ:

1. Parse `apps/api/src/config/permissions.ts` → bóc tách `RESOURCES`, `ACTIONS`, template literal `${RESOURCES.X}:${ACTIONS.Y}`, các lệnh `generateResourcePermissions(RESOURCES.X)` (loop 6 actions VIEW/CREATE/UPDATE/DELETE/MANAGE/EXPORT), literal `x:y` trong PERMISSIONS object.
2. Parse `packages/api-client/src/permissions.ts` → trích `KEY: "x:y"` (chỉ tính code 1 dấu `:`) + `KEY: "x.y"` (legacy dot-notation, warn-only).
3. So sánh tập:
   - **Code chỉ có ở API** → FAIL (UI không gate được, hoặc typecheck fail khi dùng PERMISSION_CODES.\*).
   - **Code chỉ có ở client (không phải legacy)** → FAIL (dùng làm @Permissions() sẽ undefined, runtime guard broken).
   - **Legacy dot-notation** → WARN (giữ để tương thích DB cũ, có JSDoc `@deprecated`).

Kết quả hiện tại: **277 API codes ↔ 289 client codes (gồm 12 legacy) — parity OK**.
