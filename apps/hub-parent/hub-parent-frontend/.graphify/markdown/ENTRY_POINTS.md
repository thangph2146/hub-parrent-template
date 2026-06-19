# Điểm vào (entry) — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.516Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 146 file

- `src/app/(public)/(store-sync)/cart/layout.tsx`
- `src/app/(public)/(store-sync)/cart/page.tsx`
- `src/app/(public)/(store-sync)/catalog/[productId]/layout.tsx`
- `src/app/(public)/(store-sync)/catalog/[productId]/page.tsx`
- `src/app/(public)/(store-sync)/catalog/layout.tsx`
- `src/app/(public)/(store-sync)/catalog/page.tsx`
- `src/app/(public)/(store-sync)/checkout/layout.tsx`
- `src/app/(public)/(store-sync)/checkout/page.tsx`
- `src/app/(public)/(store-sync)/dashboard/layout.tsx`
- `src/app/(public)/(store-sync)/dashboard/page.tsx`
- `src/app/(public)/(store-sync)/help/layout.tsx`
- `src/app/(public)/(store-sync)/help/page.tsx`
- `src/app/(public)/(store-sync)/layout.tsx`
- `src/app/(public)/(store-sync)/login/layout.tsx`
- `src/app/(public)/(store-sync)/login/page.tsx`
- `src/app/(public)/(store-sync)/orders/[orderId]/layout.tsx`
- `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx`
- `src/app/(public)/(store-sync)/orders/layout.tsx`
- `src/app/(public)/(store-sync)/orders/page.tsx`
- `src/app/(public)/(store-sync)/privacy/layout.tsx`
- `src/app/(public)/(store-sync)/privacy/page.tsx`
- `src/app/(public)/(store-sync)/profile/layout.tsx`
- `src/app/(public)/(store-sync)/profile/page.tsx`
- `src/app/(public)/(store-sync)/register/layout.tsx`
- `src/app/(public)/(store-sync)/register/page.tsx`
- `src/app/(public)/(store-sync)/support/layout.tsx`
- `src/app/(public)/(store-sync)/support/page.tsx`
- `src/app/(public)/(store-sync)/terms/layout.tsx`
- `src/app/(public)/(store-sync)/terms/page.tsx`
- `src/app/(public)/bai-viet/[slug]/page.tsx`
- `src/app/(public)/bai-viet/page.tsx`
- `src/app/(public)/huong-dan-su-dung/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/(public)/lien-he/page.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/ve-chung-toi/page.tsx`
- `src/app/admin/academic-years/[id]/edit/page.tsx`
- `src/app/admin/academic-years/[id]/page.tsx`
- `src/app/admin/academic-years/new/page.tsx`
- `src/app/admin/academic-years/page.tsx`
- `src/app/admin/cameras/[id]/edit/page.tsx`
- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/cameras/new/page.tsx`
- `src/app/admin/cameras/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/contact-requests/[id]/page.tsx`
- `src/app/admin/contact-requests/page.tsx`
- … và 96 route file khác

## `loading.tsx` (pattern skeleton) — 65 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **65** file `loading.tsx` trong graph
  - `src/app/(public)/(store-sync)/cart/loading.tsx`
  - `src/app/(public)/(store-sync)/catalog/[productId]/loading.tsx`
  - `src/app/(public)/(store-sync)/catalog/loading.tsx`
  - `src/app/(public)/(store-sync)/checkout/loading.tsx`
  - `src/app/(public)/(store-sync)/orders/[orderId]/loading.tsx`
  - `src/app/(public)/(store-sync)/orders/loading.tsx`
  - `src/app/admin/academic-years/[id]/edit/loading.tsx`
  - `src/app/admin/academic-years/[id]/loading.tsx`
  - `src/app/admin/academic-years/new/loading.tsx`
  - `src/app/admin/cameras/[id]/edit/loading.tsx`
  - `src/app/admin/cameras/[id]/loading.tsx`
  - `src/app/admin/cameras/new/loading.tsx`
  - … và 53 file khác

## AUTO-GENERATED (không sửa tay) — 159 file

Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`).

- `src/app/admin/academic-years/[id]/edit/loading.tsx`
- `src/app/admin/academic-years/[id]/edit/page.tsx`
- `src/app/admin/academic-years/[id]/loading.tsx`
- `src/app/admin/academic-years/[id]/page.tsx`
- `src/app/admin/academic-years/new/loading.tsx`
- `src/app/admin/academic-years/new/page.tsx`
- `src/app/admin/academic-years/page.tsx`
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
- `src/app/admin/contact-requests/[id]/loading.tsx`
- `src/app/admin/contact-requests/[id]/page.tsx`
- `src/app/admin/contact-requests/page.tsx`
- `src/app/admin/courses/[id]/edit/loading.tsx`
- `src/app/admin/courses/[id]/edit/page.tsx`
- `src/app/admin/courses/[id]/loading.tsx`
- `src/app/admin/courses/[id]/page.tsx`
- `src/app/admin/courses/new/loading.tsx`
- `src/app/admin/courses/new/page.tsx`
- `src/app/admin/courses/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/departments/[id]/edit/loading.tsx`
- `src/app/admin/departments/[id]/edit/page.tsx`
- … và 124 file khác

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` → `pnpm graphify:ai-summary`.
