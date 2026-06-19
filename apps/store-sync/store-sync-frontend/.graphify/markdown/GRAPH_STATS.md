# Thống kê graph — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.677Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `directory` | 78 |
| `page` | 58 |
| `ts` | 48 |
| `tsx` | 38 |
| `loading` | 21 |
| `layout` | 19 |
| `api-route` | 1 |
| `route-group` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `contains` | 262 |
| `imports` | 204 |
| `renders` | 18 |
| `assets` | 3 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/(store-sync)/checkout/page.tsx` | 10 |
| `src/app/store/orders/_component/index.ts` | 8 |
| `src/app/(store-sync)/catalog/page.tsx` | 7 |
| `src/providers/store-portal-layout.tsx` | 7 |
| `src/app/(store-sync)/login/page.tsx` | 6 |
| `src/app/page.tsx` | 6 |
| `src/components/shared/cart-drawer.tsx` | 6 |
| `src/app/(store-sync)/cart/page.tsx` | 5 |
| `src/app/layout.tsx` | 5 |
| `src/app/store/orders/page.tsx` | 5 |
| `src/app/store/orders/_component/columns.tsx` | 5 |
| `src/app/store/orders/_component/store-order-actions.ts` | 5 |
| `src/app/store/profile/page.tsx` | 5 |
| `src/components/shared/product-detail.tsx` | 5 |
| `src/providers/admin/store-admin-layout.tsx` | 5 |
| `src/app/admin/layout.tsx` | 4 |
| `src/app/store/orders/[orderId]/page.tsx` | 4 |
| `src/app/store/orders/_component/store-order-items-table.tsx` | 4 |
| `src/components/shared/cart-line-item.tsx` | 4 |
| `src/components/shared/cart-sync-bridge.tsx` | 4 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/api.ts` | 21 |
| `src/hooks/use-cart.ts` | 15 |
| `src/hooks/queries.ts` | 12 |
| `src/hooks/use-session.ts` | 11 |
| `src/lib/format.ts` | 8 |
| `src/app/store/orders/_component/types.ts` | 8 |
| `src/components/shared/route-loading.tsx` | 7 |
| `src/lib/catalog-filters.ts` | 6 |
| `src/lib/cart-sync.ts` | 5 |
| `src/providers/admin/auth-provider.tsx` | 5 |
| `src/config/admin/store-admin-access.ts` | 5 |
| `src/hooks/use-gift-product-catalog.ts` | 4 |
| `src/lib/store-auth.ts` | 4 |
| `src/lib/graphify-context.ts` | 4 |
| `src/components/shared/cart-drawer.tsx` | 4 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
