# Điểm vào (entry) — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.677Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 78 file

- `src/app/(store-sync)/cart/layout.tsx`
- `src/app/(store-sync)/cart/page.tsx`
- `src/app/(store-sync)/catalog/[productId]/layout.tsx`
- `src/app/(store-sync)/catalog/[productId]/page.tsx`
- `src/app/(store-sync)/catalog/layout.tsx`
- `src/app/(store-sync)/catalog/page.tsx`
- `src/app/(store-sync)/checkout/layout.tsx`
- `src/app/(store-sync)/checkout/page.tsx`
- `src/app/(store-sync)/dashboard/layout.tsx`
- `src/app/(store-sync)/dashboard/page.tsx`
- `src/app/(store-sync)/help/layout.tsx`
- `src/app/(store-sync)/help/page.tsx`
- `src/app/(store-sync)/layout.tsx`
- `src/app/(store-sync)/login/layout.tsx`
- `src/app/(store-sync)/login/page.tsx`
- `src/app/(store-sync)/orders/[orderId]/layout.tsx`
- `src/app/(store-sync)/orders/[orderId]/page.tsx`
- `src/app/(store-sync)/orders/layout.tsx`
- `src/app/(store-sync)/orders/page.tsx`
- `src/app/(store-sync)/privacy/layout.tsx`
- `src/app/(store-sync)/privacy/page.tsx`
- `src/app/(store-sync)/profile/layout.tsx`
- `src/app/(store-sync)/profile/page.tsx`
- `src/app/(store-sync)/register/layout.tsx`
- `src/app/(store-sync)/register/page.tsx`
- `src/app/(store-sync)/support/layout.tsx`
- `src/app/(store-sync)/support/page.tsx`
- `src/app/(store-sync)/terms/layout.tsx`
- `src/app/(store-sync)/terms/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/orders/[id]/edit/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/page.tsx`
- … và 28 route file khác

## `loading.tsx` (pattern skeleton) — 21 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **21** file `loading.tsx` trong graph
  - `src/app/(store-sync)/cart/loading.tsx`
  - `src/app/(store-sync)/catalog/[productId]/loading.tsx`
  - `src/app/(store-sync)/catalog/loading.tsx`
  - `src/app/(store-sync)/checkout/loading.tsx`
  - `src/app/(store-sync)/orders/[orderId]/loading.tsx`
  - `src/app/(store-sync)/orders/loading.tsx`
  - `src/app/admin/categories/[id]/edit/loading.tsx`
  - `src/app/admin/categories/[id]/loading.tsx`
  - `src/app/admin/categories/new/loading.tsx`
  - `src/app/admin/guides/[id]/edit/loading.tsx`
  - `src/app/admin/guides/[id]/loading.tsx`
  - `src/app/admin/guides/new/loading.tsx`
  - … và 9 file khác

## AUTO-GENERATED (không sửa tay) — 48 file

Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`).

- `src/app/admin/categories/[id]/edit/loading.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/loading.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/categories/new/loading.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/[id]/edit/loading.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/loading.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/guides/new/loading.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/orders/[id]/edit/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/promo-codes/[id]/edit/page.tsx`
- `src/app/admin/promo-codes/[id]/page.tsx`
- `src/app/admin/promo-codes/new/page.tsx`
- `src/app/admin/promo-codes/page.tsx`
- `src/app/admin/rbac/[id]/edit/loading.tsx`
- `src/app/admin/rbac/[id]/edit/page.tsx`
- `src/app/admin/rbac/[id]/loading.tsx`
- `src/app/admin/rbac/[id]/page.tsx`
- `src/app/admin/rbac/page.tsx`
- `src/app/admin/seo-metas/[id]/edit/loading.tsx`
- `src/app/admin/seo-metas/[id]/edit/page.tsx`
- … và 13 file khác

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` → `pnpm graphify:ai-summary`.
