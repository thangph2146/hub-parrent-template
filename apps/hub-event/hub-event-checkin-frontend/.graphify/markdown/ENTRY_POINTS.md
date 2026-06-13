# Điểm vào (entry) — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.089Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 76 file

- `src/app/(auth)/dang-nhap/[role]/page.tsx`
- `src/app/(auth)/dang-nhap/page.tsx`
- `src/app/(auth)/guest/dang-nhap/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/student/dang-nhap/page.tsx`
- `src/app/(portal)/guest/events/page.tsx`
- `src/app/(portal)/guest/layout.tsx`
- `src/app/(portal)/guest/page.tsx`
- `src/app/(portal)/guest/profile/page.tsx`
- `src/app/(portal)/student/events/page.tsx`
- `src/app/(portal)/student/layout.tsx`
- `src/app/(portal)/student/page.tsx`
- `src/app/(portal)/student/profile/page.tsx`
- `src/app/(site)/[slug]/page.tsx`
- `src/app/(site)/layout.tsx`
- `src/app/(site)/page.tsx`
- `src/app/(site)/su-kien-cua-toi/page.tsx`
- `src/app/(site)/su-kien/[slug]/page.tsx`
- `src/app/(site)/su-kien/page.tsx`
- `src/app/admin/[id]/edit/page.tsx`
- `src/app/admin/[id]/page.tsx`
- `src/app/admin/cameras/[id]/edit/page.tsx`
- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/cameras/new/page.tsx`
- `src/app/admin/cameras/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/check-in-ky-tuc-xa/page.tsx`
- `src/app/admin/dang-ky/page.tsx`
- `src/app/admin/dang-nhap/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/locations/[id]/edit/page.tsx`
- `src/app/admin/locations/[id]/page.tsx`
- `src/app/admin/locations/new/page.tsx`
- `src/app/admin/locations/page.tsx`
- `src/app/admin/new/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/posts/[id]/edit/page.tsx`
- `src/app/admin/posts/[id]/page.tsx`
- `src/app/admin/posts/new/page.tsx`
- `src/app/admin/posts/page.tsx`
- `src/app/admin/profile/page.tsx`
- … và 26 route file khác

## `loading.tsx` (pattern skeleton) — 36 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **36** file `loading.tsx` trong graph
  - `src/app/admin/[id]/edit/loading.tsx`
  - `src/app/admin/[id]/loading.tsx`
  - `src/app/admin/cameras/[id]/edit/loading.tsx`
  - `src/app/admin/cameras/[id]/loading.tsx`
  - `src/app/admin/cameras/new/loading.tsx`
  - `src/app/admin/categories/[id]/edit/loading.tsx`
  - `src/app/admin/categories/[id]/loading.tsx`
  - `src/app/admin/categories/new/loading.tsx`
  - `src/app/admin/guides/[id]/edit/loading.tsx`
  - `src/app/admin/guides/[id]/loading.tsx`
  - `src/app/admin/guides/new/loading.tsx`
  - `src/app/admin/locations/[id]/edit/loading.tsx`
  - … và 24 file khác

## AUTO-GENERATED (không sửa tay) — 81 file

Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`).

- `src/app/admin/cameras/[id]/edit/loading.tsx`
- `src/app/admin/cameras/[id]/edit/page.tsx`
- `src/app/admin/cameras/[id]/loading.tsx`
- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/cameras/new/loading.tsx`
- `src/app/admin/cameras/new/page.tsx`
- `src/app/admin/cameras/page.tsx`
- `src/app/admin/categories/[id]/edit/loading.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/loading.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/categories/new/loading.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/[id]/edit/loading.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/loading.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/guides/new/loading.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/locations/[id]/edit/loading.tsx`
- `src/app/admin/locations/[id]/edit/page.tsx`
- `src/app/admin/locations/[id]/loading.tsx`
- `src/app/admin/locations/[id]/page.tsx`
- `src/app/admin/locations/new/loading.tsx`
- `src/app/admin/locations/new/page.tsx`
- `src/app/admin/locations/page.tsx`
- `src/app/admin/posts/[id]/edit/loading.tsx`
- `src/app/admin/posts/[id]/edit/page.tsx`
- `src/app/admin/posts/[id]/loading.tsx`
- `src/app/admin/posts/[id]/page.tsx`
- `src/app/admin/posts/loading.tsx`
- … và 46 file khác

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend` → `pnpm graphify:ai-summary`.
