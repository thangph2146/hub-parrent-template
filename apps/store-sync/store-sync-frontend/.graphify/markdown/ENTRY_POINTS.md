# Điểm vào (entry) — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.330Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- `src/middleware.ts`

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 39 file

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
- `src/app/api/graphify/route.ts`
- `src/app/graph/layout.tsx`
- `src/app/graph/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/store/layout.tsx`
- `src/app/store/orders/[orderId]/page.tsx`
- `src/app/store/orders/page.tsx`
- `src/app/store/page.tsx`
- `src/app/store/profile/page.tsx`

## `loading.tsx` (pattern skeleton) — 7 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **7** file `loading.tsx` trong graph
  - `src/app/(store-sync)/cart/loading.tsx`
  - `src/app/(store-sync)/catalog/[productId]/loading.tsx`
  - `src/app/(store-sync)/catalog/loading.tsx`
  - `src/app/(store-sync)/checkout/loading.tsx`
  - `src/app/(store-sync)/orders/[orderId]/loading.tsx`
  - `src/app/(store-sync)/orders/loading.tsx`
  - `src/app/graph/loading.tsx`

## AUTO-GENERATED (không sửa tay) — 0 file

- (không phát hiện marker `AUTO-GENERATED` trong header file)

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` → `pnpm graphify:ai-summary`.
