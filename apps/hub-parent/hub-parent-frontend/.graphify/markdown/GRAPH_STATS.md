# Thống kê graph — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.374Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `tsx` | 45 |
| `directory` | 39 |
| `ts` | 33 |
| `page` | 21 |
| `layout` | 18 |
| `loading` | 7 |
| `route-group` | 2 |
| `api-route` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 167 |
| `contains` | 164 |
| `renders` | 16 |
| `assets` | 2 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/features/pages/about-page/about-client.tsx` | 11 |
| `src/app/(public)/layout.tsx` | 9 |
| `src/app/(public)/(store-sync)/catalog/page.tsx` | 8 |
| `src/features/pages/home-page/sub-sections/index.ts` | 8 |
| `src/app/(public)/(store-sync)/checkout/page.tsx` | 7 |
| `src/app/(public)/(store-sync)/orders/page.tsx` | 6 |
| `src/components/shared/header.tsx` | 6 |
| `src/components/shared/product-detail.tsx` | 6 |
| `src/features/pages/home-page/home-client.tsx` | 6 |
| `src/app/(public)/bai-viet/[slug]/page.tsx` | 5 |
| `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx` | 4 |
| `src/features/pages/home-page/index.ts` | 4 |
| `src/app/(public)/(store-sync)/cart/page.tsx` | 3 |
| `src/app/(public)/(store-sync)/login/page.tsx` | 3 |
| `src/app/(public)/bai-viet/page.tsx` | 3 |
| `src/app/(public)/huong-dan-su-dung/page.tsx` | 3 |
| `src/components/shared/cart-drawer.tsx` | 3 |
| `src/components/shared/cart-line-item.tsx` | 3 |
| `src/components/shared/store-auth-gate.tsx` | 3 |
| `src/features/pages/home-page/sub-sections/hero-section.tsx` | 3 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/api.ts` | 15 |
| `src/hooks/use-cart.ts` | 9 |
| `src/lib/seo.ts` | 9 |
| `src/lib/format.ts` | 8 |
| `src/components/shared/route-loading.tsx` | 7 |
| `src/hooks/queries.ts` | 6 |
| `src/hooks/use-session.ts` | 6 |
| `src/features/pages/about-page/constants.tsx` | 6 |
| `src/features/pages/home-page/sub-sections/scroll-indicator.tsx` | 5 |
| `src/features/auth/admin-bridge.ts` | 4 |
| `src/features/pages/home-page/constants.ts` | 4 |
| `src/lib/store-feature.ts` | 3 |
| `src/features/pages/home-page/sub-sections/contact-section.tsx` | 3 |
| `src/lib/gift-rules-from-fulfillment-note.ts` | 3 |
| `src/components/shared/cart-line-item.tsx` | 2 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
