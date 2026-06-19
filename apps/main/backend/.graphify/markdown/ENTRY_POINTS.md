# Điểm vào (entry) — apps/main/backend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.446Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 101 file

- `src/app/academic-years/[id]/edit/page.tsx`
- `src/app/academic-years/[id]/page.tsx`
- `src/app/academic-years/new/page.tsx`
- `src/app/academic-years/page.tsx`
- `src/app/api/graphify/route.ts`
- `src/app/cameras/[id]/edit/page.tsx`
- `src/app/cameras/[id]/page.tsx`
- `src/app/cameras/new/page.tsx`
- `src/app/cameras/page.tsx`
- `src/app/categories/[id]/edit/page.tsx`
- `src/app/categories/[id]/page.tsx`
- `src/app/categories/new/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/contact-requests/[id]/page.tsx`
- `src/app/contact-requests/page.tsx`
- `src/app/courses/[id]/edit/page.tsx`
- `src/app/courses/[id]/page.tsx`
- `src/app/courses/new/page.tsx`
- `src/app/courses/page.tsx`
- `src/app/data/page.tsx`
- `src/app/database-schema/page.tsx`
- `src/app/departments/[id]/edit/page.tsx`
- `src/app/departments/[id]/page.tsx`
- `src/app/departments/new/page.tsx`
- `src/app/departments/page.tsx`
- `src/app/events/[id]/edit/page.tsx`
- `src/app/events/[id]/page.tsx`
- `src/app/events/new/page.tsx`
- `src/app/events/page.tsx`
- `src/app/file-storage/page.tsx`
- `src/app/graph/page.tsx`
- `src/app/guides/[id]/edit/page.tsx`
- `src/app/guides/[id]/page.tsx`
- `src/app/guides/new/page.tsx`
- `src/app/guides/page.tsx`
- `src/app/layout.tsx`
- `src/app/locations/[id]/edit/page.tsx`
- `src/app/locations/[id]/page.tsx`
- `src/app/locations/new/page.tsx`
- `src/app/locations/page.tsx`
- `src/app/login/page.tsx`
- `src/app/majors/[id]/edit/page.tsx`
- `src/app/majors/[id]/page.tsx`
- `src/app/majors/new/page.tsx`
- `src/app/majors/page.tsx`
- `src/app/my-students/page.tsx`
- `src/app/orders/[id]/edit/page.tsx`
- `src/app/orders/[id]/page.tsx`
- `src/app/orders/page.tsx`
- `src/app/page.tsx`
- … và 51 route file khác

## `loading.tsx` (pattern skeleton) — 59 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **59** file `loading.tsx` trong graph
  - `src/app/academic-years/[id]/edit/loading.tsx`
  - `src/app/academic-years/[id]/loading.tsx`
  - `src/app/academic-years/new/loading.tsx`
  - `src/app/cameras/[id]/edit/loading.tsx`
  - `src/app/cameras/[id]/loading.tsx`
  - `src/app/cameras/new/loading.tsx`
  - `src/app/categories/[id]/edit/loading.tsx`
  - `src/app/categories/[id]/loading.tsx`
  - `src/app/categories/new/loading.tsx`
  - `src/app/contact-requests/[id]/loading.tsx`
  - `src/app/courses/[id]/edit/loading.tsx`
  - `src/app/courses/[id]/loading.tsx`
  - … và 47 file khác

## AUTO-GENERATED (không sửa tay) — 152 file

Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`).

- `src/app/academic-years/[id]/edit/loading.tsx`
- `src/app/academic-years/[id]/edit/page.tsx`
- `src/app/academic-years/[id]/loading.tsx`
- `src/app/academic-years/[id]/page.tsx`
- `src/app/academic-years/new/loading.tsx`
- `src/app/academic-years/new/page.tsx`
- `src/app/academic-years/page.tsx`
- `src/app/cameras/[id]/edit/loading.tsx`
- `src/app/cameras/[id]/edit/page.tsx`
- `src/app/cameras/[id]/loading.tsx`
- `src/app/cameras/[id]/page.tsx`
- `src/app/cameras/new/loading.tsx`
- `src/app/cameras/new/page.tsx`
- `src/app/cameras/page.tsx`
- `src/app/categories/[id]/edit/loading.tsx`
- `src/app/categories/[id]/edit/page.tsx`
- `src/app/categories/[id]/loading.tsx`
- `src/app/categories/[id]/page.tsx`
- `src/app/categories/new/loading.tsx`
- `src/app/categories/new/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/contact-requests/[id]/loading.tsx`
- `src/app/contact-requests/[id]/page.tsx`
- `src/app/contact-requests/page.tsx`
- `src/app/courses/[id]/edit/loading.tsx`
- `src/app/courses/[id]/edit/page.tsx`
- `src/app/courses/[id]/loading.tsx`
- `src/app/courses/[id]/page.tsx`
- `src/app/courses/new/loading.tsx`
- `src/app/courses/new/page.tsx`
- `src/app/courses/page.tsx`
- `src/app/data/page.tsx`
- `src/app/departments/[id]/edit/loading.tsx`
- `src/app/departments/[id]/edit/page.tsx`
- `src/app/departments/[id]/loading.tsx`
- … và 117 file khác

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/main/backend` → `pnpm graphify:ai-summary`.
