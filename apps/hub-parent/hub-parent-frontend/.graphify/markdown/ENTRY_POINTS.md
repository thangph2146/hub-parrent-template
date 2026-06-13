# Điểm vào (entry) — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.213Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- (không có `main.ts` / `app.module.ts` trong graph)

## Nest modules (`*.module.ts`) — 0 file


## Next App Router (`page` / `layout` / `route`) — 40 file

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
- `src/app/api/graphify/route.ts`
- `src/app/graph/layout.tsx`
- `src/app/graph/page.tsx`
- `src/app/layout.tsx`

## `loading.tsx` (pattern skeleton) — 7 file

Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file.

- Tổng: **7** file `loading.tsx` trong graph
  - `src/app/(public)/(store-sync)/cart/loading.tsx`
  - `src/app/(public)/(store-sync)/catalog/[productId]/loading.tsx`
  - `src/app/(public)/(store-sync)/catalog/loading.tsx`
  - `src/app/(public)/(store-sync)/checkout/loading.tsx`
  - `src/app/(public)/(store-sync)/orders/[orderId]/loading.tsx`
  - `src/app/(public)/(store-sync)/orders/loading.tsx`
  - `src/app/graph/loading.tsx`

## AUTO-GENERATED (không sửa tay) — 0 file

- (không phát hiện marker `AUTO-GENERATED` trong header file)

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` → `pnpm graphify:ai-summary`.
