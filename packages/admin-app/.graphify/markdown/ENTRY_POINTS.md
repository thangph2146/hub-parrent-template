# Điểm vào (entry) — packages/admin-app (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.605Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 101 file

- `src/modules/academic-years/[id]/edit/page.tsx`
- `src/modules/academic-years/[id]/page.tsx`
- `src/modules/academic-years/new/page.tsx`
- `src/modules/academic-years/page.tsx`
- `src/modules/auth/login/page.tsx`
- `src/modules/auth/register/page.tsx`
- `src/modules/cameras/[id]/edit/page.tsx`
- `src/modules/cameras/[id]/page.tsx`
- `src/modules/cameras/new/page.tsx`
- `src/modules/cameras/page.tsx`
- `src/modules/categories/[id]/edit/page.tsx`
- `src/modules/categories/[id]/page.tsx`
- `src/modules/categories/new/page.tsx`
- `src/modules/categories/page.tsx`
- `src/modules/contact-requests/[id]/page.tsx`
- `src/modules/contact-requests/page.tsx`
- `src/modules/courses/[id]/edit/page.tsx`
- `src/modules/courses/[id]/page.tsx`
- `src/modules/courses/new/page.tsx`
- `src/modules/courses/page.tsx`
- `src/modules/dashboard/page.tsx`
- `src/modules/data/page.tsx`
- `src/modules/database-schema/page.tsx`
- `src/modules/departments/[id]/edit/page.tsx`
- `src/modules/departments/[id]/page.tsx`
- `src/modules/departments/new/page.tsx`
- `src/modules/departments/page.tsx`
- `src/modules/events/[id]/edit/page.tsx`
- `src/modules/events/[id]/page.tsx`
- `src/modules/events/new/page.tsx`
- `src/modules/events/page.tsx`
- `src/modules/file-storage/page.tsx`
- `src/modules/graph/page.tsx`
- `src/modules/guides/[id]/edit/page.tsx`
- `src/modules/guides/[id]/page.tsx`
- `src/modules/guides/new/page.tsx`
- `src/modules/guides/page.tsx`
- `src/modules/locations/[id]/edit/page.tsx`
- `src/modules/locations/[id]/page.tsx`
- `src/modules/locations/new/page.tsx`
- `src/modules/locations/page.tsx`
- `src/modules/majors/[id]/edit/page.tsx`
- `src/modules/majors/[id]/page.tsx`
- `src/modules/majors/new/page.tsx`
- `src/modules/majors/page.tsx`
- `src/modules/my-registered-events/page.tsx`
- `src/modules/my-students/page.tsx`
- `src/modules/orders/[id]/edit/page.tsx`
- `src/modules/orders/[id]/page.tsx`
- `src/modules/orders/page.tsx`
- … và 51 route file khác

## `loading.tsx` (pattern skeleton) — 58 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **58** file `loading.tsx` trong graph
  - `src/modules/academic-years/[id]/edit/loading.tsx`
  - `src/modules/academic-years/[id]/loading.tsx`
  - `src/modules/academic-years/new/loading.tsx`
  - `src/modules/cameras/[id]/edit/loading.tsx`
  - `src/modules/cameras/[id]/loading.tsx`
  - `src/modules/cameras/new/loading.tsx`
  - `src/modules/categories/[id]/edit/loading.tsx`
  - `src/modules/categories/[id]/loading.tsx`
  - `src/modules/categories/new/loading.tsx`
  - `src/modules/contact-requests/[id]/loading.tsx`
  - `src/modules/courses/[id]/edit/loading.tsx`
  - `src/modules/courses/[id]/loading.tsx`
  - … và 46 file khác

## AUTO-GENERATED (không sửa tay) — 0 file

- (không phát hiện marker `AUTO-GENERATED` trong header file)

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/admin-app` → `pnpm graphify:ai-summary`.
