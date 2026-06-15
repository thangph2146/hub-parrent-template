# TASK_INDEX — module/feature → file (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.717Z` — từ `admin.app.config.json`, `api.sync-profile.json`, `packages/api-client`. Đọc kèm [`AGENTS.md`](../AGENTS.md).

## Brief nhanh (agent)

```bash
pnpm graphify:brief --task "mô tả task ngắn"
```

> Dev hàng ngày: sửa apps/main/* + packages/*; hub-event cập nhật qua pnpm pull:checkin.

## Admin modules (main)

| Module | API domain | Admin-app | Main backend | Main API | API client | Check-in API |
|--------|------------|-----------|--------------|----------|------------|--------------|
| `staff` | `users` | `packages/admin-app/src/modules/staff/` | `apps/main/backend/src/app/staff/page.tsx` | `apps/main/api/src/users/` | `packages/api-client/src/resources/users.ts` | ✓ |
| `rbac` | `roles` | `packages/admin-app/src/modules/rbac/` | `apps/main/backend/src/app/rbac/page.tsx` | `apps/main/api/src/roles/` | `packages/api-client/src/resources/rbac.ts` | ✓ |
| `categories` | `categories` | `packages/admin-app/src/modules/categories/` | `apps/main/backend/src/app/categories/page.tsx` | `apps/main/api/src/categories/` | `packages/api-client/src/resources/categories.ts` | ✓ |
| `tags` | `tags` | `packages/admin-app/src/modules/tags/` | `apps/main/backend/src/app/tags/page.tsx` | `apps/main/api/src/tags/` | `packages/api-client/src/resources/tags.ts` | ✓ |
| `guides` | `page-contents` | `packages/admin-app/src/modules/guides/` | `apps/main/backend/src/app/guides/page.tsx` | `apps/main/api/src/page-contents/` | `packages/api-client/src/resources/guides.ts` | ✓ |
| `posts` | `posts` | `packages/admin-app/src/modules/posts/` | `apps/main/backend/src/app/posts/page.tsx` | `apps/main/api/src/posts/` | `packages/api-client/src/resources/posts.ts` | ✓ |
| `cameras` | `cameras` | `packages/admin-app/src/modules/cameras/` | `apps/main/backend/src/app/cameras/page.tsx` | `apps/main/api/src/cameras/` | `packages/api-client/src/resources/cameras.ts` | ✓ |
| `templates` | `templates` | `packages/admin-app/src/modules/templates/` | `apps/main/backend/src/app/templates/page.tsx` | `apps/main/api/src/templates/` | `packages/api-client/src/resources/templates.ts` | ✓ |
| `screens` | `screens` | `packages/admin-app/src/modules/screens/` | `apps/main/backend/src/app/screens/page.tsx` | `apps/main/api/src/screens/` | `packages/api-client/src/resources/screens.ts` | ✓ |
| `locations` | `locations` | `packages/admin-app/src/modules/locations/` | `apps/main/backend/src/app/locations/page.tsx` | `apps/main/api/src/locations/` | `packages/api-client/src/resources/locations.ts` | ✓ |
| `speakers` | `speakers` | `packages/admin-app/src/modules/speakers/` | `apps/main/backend/src/app/speakers/page.tsx` | `apps/main/api/src/speakers/` | `packages/api-client/src/resources/speakers.ts` | ✓ |
| `settings` | `settings` | `packages/admin-app/src/modules/settings/` | `apps/main/backend/src/app/settings/page.tsx` | `apps/main/api/src/settings/` | `packages/api-client/src/resources/settings.ts` | ✓ |
| `file-storage` | `uploads` | `packages/admin-app/src/modules/file-storage/` | `apps/main/backend/src/app/file-storage/page.tsx` | `apps/main/api/src/uploads/` | `packages/api-client/src/resources/uploads.ts` | ✓ |
| `data` | `data` | `packages/admin-app/src/modules/data/` | `apps/main/backend/src/app/data/page.tsx` | `—` | `—` | — |
| `events` | `events` | `packages/admin-app/src/modules/events/` | `apps/main/backend/src/app/events/page.tsx` | `apps/main/api/src/events/` | `packages/api-client/src/resources/events.ts` | ✓ |
| `departments` | `departments` | `packages/admin-app/src/modules/departments/` | `apps/main/backend/src/app/departments/page.tsx` | `apps/main/api/src/departments/` | `packages/api-client/src/resources/departments.ts` | ✓ |
| `academic-years` | `academic-years` | `packages/admin-app/src/modules/academic-years/` | `apps/main/backend/src/app/academic-years/page.tsx` | `apps/main/api/src/academic-years/` | `packages/api-client/src/resources/academic-years.ts` | ✓ |
| `courses` | `courses` | `packages/admin-app/src/modules/courses/` | `apps/main/backend/src/app/courses/page.tsx` | `apps/main/api/src/courses/` | `packages/api-client/src/resources/courses.ts` | ✓ |
| `majors` | `majors` | `packages/admin-app/src/modules/majors/` | `apps/main/backend/src/app/majors/page.tsx` | `apps/main/api/src/majors/` | `packages/api-client/src/resources/majors.ts` | ✓ |
| `training-levels` | `training-levels` | `packages/admin-app/src/modules/training-levels/` | `apps/main/backend/src/app/training-levels/page.tsx` | `apps/main/api/src/training-levels/` | `packages/api-client/src/resources/training-levels.ts` | ✓ |
| `training-systems` | `training-systems` | `packages/admin-app/src/modules/training-systems/` | `apps/main/backend/src/app/training-systems/page.tsx` | `apps/main/api/src/training-systems/` | `packages/api-client/src/resources/training-systems.ts` | ✓ |
| `products` | `products` | `packages/admin-app/src/modules/products/` | `apps/main/backend/src/app/products/page.tsx` | `apps/main/api/src/products/` | `packages/api-client/src/resources/products.ts` | ✓ |
| `orders` | `orders` | `packages/admin-app/src/modules/orders/` | `apps/main/backend/src/app/orders/page.tsx` | `apps/main/api/src/orders/` | `packages/api-client/src/resources/orders.ts` | ✓ |
| `promo-codes` | `promo-codes` | `packages/admin-app/src/modules/promo-codes/` | `apps/main/backend/src/app/promo-codes/page.tsx` | `apps/main/api/src/promo-codes/` | `packages/api-client/src/resources/promo-codes.ts` | ✓ |
| `seo-metas` | `seo-metas` | `packages/admin-app/src/modules/seo-metas/` | `apps/main/backend/src/app/seo-metas/page.tsx` | `apps/main/api/src/seo-metas/` | `packages/api-client/src/resources/seo-metas.ts` | ✓ |
| `contact-requests` | `contact-requests` | `packages/admin-app/src/modules/contact-requests/` | `apps/main/backend/src/app/contact-requests/page.tsx` | `apps/main/api/src/contact-requests/` | `packages/api-client/src/resources/contact-requests.ts` | ✓ |
| `parent-students` | `parent-students` | `packages/admin-app/src/modules/parent-students/` | `apps/main/backend/src/app/parent-students/page.tsx` | `apps/main/api/src/parent-students/` | `packages/api-client/src/resources/parent-students.ts` | ✓ |
| `my-students` | `students` | `packages/admin-app/src/modules/my-students/` | `apps/main/backend/src/app/my-students/page.tsx` | `apps/main/api/src/students/` | `—` | ✓ |

## Packages workspace

| Id | Path chính | Verify |
|----|------------|--------|
| `ui` | `packages/ui/src/` | pnpm --filter @workspace/ui lint |
| `api-client` | `packages/api-client/src/` | pnpm verify:api-contract, pnpm verify:sdk-http |
| `api-server` | `packages/api-server/src/` | pnpm --filter @workspace/api-server run build, pnpm api:generate:checkin, pnpm verify:checkin-api |
| `admin-app` | `packages/admin-app/src/` | pnpm verify:main-admin, pnpm verify:checkin-admin |

## Native pages (không generate từ admin-app)

**Main backend:**
- `apps/main/backend/src/app/layout.tsx`
- `apps/main/backend/src/app/login/page.tsx`
- `apps/main/backend/src/app/register/page.tsx`
- `apps/main/backend/src/app/profile/page.tsx`
- `apps/main/backend/src/app/graph/page.tsx`
- `apps/main/backend/src/app/database-schema/page.tsx`

**Check-in frontend:**
- `apps/hub-event/hub-event-checkin-frontend/src/app/layout.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/dang-nhap/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/dang-ky/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/profile/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/check-in-ky-tuc-xa/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/new/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/new/loading.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/[id]/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/[id]/loading.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/[id]/edit/page.tsx`
- `apps/hub-event/hub-event-checkin-frontend/src/app/[id]/edit/loading.tsx`

## Hub-event — domain loại trừ khi sync từ main

Chi tiết so sánh main ↔ check-in: [`SYNC_DELTA.md`](SYNC_DELTA.md). Các domain **exclude** (chỉ sửa `apps/main/api`):


## Làm mới

- `pnpm graphify:ai-summary` hoặc `node script-system/graphify/graphify-task-index.mjs`
