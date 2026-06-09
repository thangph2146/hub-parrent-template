# Thống kê graph — store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-09T06:28:52.284Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `directory` | 27 |
| `ts` | 20 |
| `tsx` | 19 |
| `layout` | 17 |
| `page` | 16 |
| `loading` | 7 |
| `api-route` | 1 |
| `middleware` | 1 |
| `route-group` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `imports` | 115 |
| `contains` | 107 |
| `renders` | 16 |
| `assets` | 3 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/(store-sync)/checkout/page.tsx` | 9 |
| `src/app/(store-sync)/catalog/page.tsx` | 7 |
| `src/app/(store-sync)/orders/page.tsx` | 6 |
| `src/app/layout.tsx` | 6 |
| `src/app/page.tsx` | 6 |
| `src/components/shared/cart-drawer.tsx` | 6 |
| `src/app/(store-sync)/cart/page.tsx` | 5 |
| `src/components/shared/product-detail.tsx` | 5 |
| `src/app/(store-sync)/login/page.tsx` | 4 |
| `src/app/(store-sync)/orders/[orderId]/page.tsx` | 4 |
| `src/components/shared/cart-line-item.tsx` | 4 |
| `src/components/shared/cart-sync-bridge.tsx` | 4 |
| `src/components/shared/header.tsx` | 4 |
| `src/hooks/use-gift-product-catalog.ts` | 4 |
| `src/app/(store-sync)/profile/page.tsx` | 3 |
| `src/app/graph/page.tsx` | 3 |
| `src/components/shared/catalog-product-card.tsx` | 3 |
| `src/components/shared/product-suggestions.tsx` | 3 |
| `src/components/shared/store-auth-gate.tsx` | 3 |
| `src/app/(store-sync)/catalog/[productId]/page.tsx` | 2 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/api.ts` | 15 |
| `src/hooks/use-cart.ts` | 14 |
| `src/hooks/queries.ts` | 11 |
| `src/components/shared/route-loading.tsx` | 7 |
| `src/hooks/use-session.ts` | 7 |
| `src/lib/format.ts` | 7 |
| `src/lib/catalog-filters.ts` | 5 |
| `src/lib/cart-sync.ts` | 5 |
| `src/hooks/use-gift-product-catalog.ts` | 4 |
| `src/lib/graphify-context.ts` | 4 |
| `src/lib/cart-gift-rules.ts` | 4 |
| `src/components/shared/cart-line-item.tsx` | 2 |
| `src/components/shared/cart-order-summary.tsx` | 2 |
| `src/hooks/use-debounced-value.ts` | 2 |
| `src/lib/auth-routes.ts` | 2 |

## Làm mới

Chạy `node scripts/graphify-update.cjs apps/store-sync-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
