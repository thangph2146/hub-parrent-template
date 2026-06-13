# Bán kính ảnh hưởng import — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.330Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/lib/api.ts` | 21 | `src/app/(store-sync)/catalog/page.tsx`, `src/app/(store-sync)/checkout/page.tsx`, `src/app/(store-sync)/login/page.tsx`, `src/app/page.tsx`, `src/app/store/orders/_component/columns.tsx`, `src/app/store/orders/_component/store-order-actions.ts` |
| `src/hooks/use-cart.ts` | 15 | `src/app/(store-sync)/cart/page.tsx`, `src/app/(store-sync)/catalog/page.tsx`, `src/app/(store-sync)/checkout/page.tsx`, `src/app/store/orders/_component/store-order-actions.ts`, `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-line-item.tsx` |
| `src/hooks/queries.ts` | 12 | `src/app/(store-sync)/cart/page.tsx`, `src/app/(store-sync)/catalog/page.tsx`, `src/app/(store-sync)/catalog/[productId]/page.tsx`, `src/app/(store-sync)/checkout/page.tsx`, `src/app/page.tsx`, `src/app/store/orders/page.tsx` |
| `src/hooks/use-session.ts` | 11 | `src/app/(store-sync)/checkout/page.tsx`, `src/app/(store-sync)/login/page.tsx`, `src/app/store/orders/page.tsx`, `src/app/store/orders/[orderId]/page.tsx`, `src/app/store/profile/page.tsx`, `src/components/shared/cart-sync-bridge.tsx` |
| `src/app/store/orders/_component/types.ts` | 8 | `src/app/store/orders/_component/columns.tsx`, `src/app/store/orders/_component/index.ts`, `src/app/store/orders/_component/store-order-actions.ts`, `src/app/store/orders/_component/store-order-item-row-actions.tsx`, `src/app/store/orders/_component/store-order-items-columns.tsx`, `src/app/store/orders/_component/store-order-items-table.tsx` |
| `src/lib/format.ts` | 8 | `src/app/(store-sync)/checkout/page.tsx`, `src/app/page.tsx`, `src/app/store/orders/_component/columns.tsx`, `src/app/store/orders/_component/store-order-actions.ts`, `src/app/store/orders/_component/store-order-items-columns.tsx`, `src/components/shared/cart-drawer.tsx` |
| `src/components/shared/route-loading.tsx` | 7 | `src/app/(store-sync)/cart/loading.tsx`, `src/app/(store-sync)/catalog/loading.tsx`, `src/app/(store-sync)/catalog/[productId]/loading.tsx`, `src/app/(store-sync)/checkout/loading.tsx`, `src/app/(store-sync)/orders/loading.tsx`, `src/app/(store-sync)/orders/[orderId]/loading.tsx` |
| `src/lib/catalog-filters.ts` | 6 | `src/app/(store-sync)/catalog/page.tsx`, `src/app/page.tsx`, `src/app/store/orders/_component/store-order-actions.ts`, `src/components/shared/catalog-product-card.tsx`, `src/components/shared/product-detail.tsx`, `src/components/shared/product-suggestions.tsx` |
| `src/lib/cart-sync.ts` | 5 | `src/app/(store-sync)/checkout/page.tsx`, `src/app/(store-sync)/login/page.tsx`, `src/components/shared/cart-sync-bridge.tsx`, `src/components/shared/header.tsx`, `src/providers/store-portal-layout.tsx` |
| `src/components/shared/cart-drawer.tsx` | 4 | `src/app/layout.tsx`, `src/app/store/orders/page.tsx`, `src/app/store/orders/[orderId]/page.tsx`, `src/components/shared/header.tsx` |
| `src/hooks/use-gift-product-catalog.ts` | 4 | `src/app/(store-sync)/cart/page.tsx`, `src/app/(store-sync)/checkout/page.tsx`, `src/components/shared/cart-drawer.tsx`, `src/components/shared/product-detail.tsx` |
| `src/lib/cart-gift-rules.ts` | 4 | `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-gift-rule-text.tsx`, `src/components/shared/cart-line-item.tsx`, `src/hooks/use-gift-product-catalog.ts` |
| `src/lib/graphify-context.ts` | 4 | `src/app/api/graphify/route.ts`, `src/app/graph/page.tsx`, `src/components/graphify/force-graph-3d.tsx`, `src/hooks/use-graphify.ts` |
| `src/lib/store-auth.ts` | 4 | `src/app/(store-sync)/login/page.tsx`, `src/app/store/profile/page.tsx`, `src/config/store-portal-layout-static.ts`, `src/providers/store-portal-layout.tsx` |
| `src/app/store/orders/_component/store-order-item-row-actions.tsx` | 3 | `src/app/store/orders/_component/index.ts`, `src/app/store/orders/_component/store-order-items-columns.tsx`, `src/app/store/orders/_component/store-order-items-table.tsx` |
| `src/config/store-portal-layout-static.ts` | 3 | `src/app/(store-sync)/orders/page.tsx`, `src/app/store/page.tsx`, `src/providers/store-portal-layout.tsx` |
| `src/lib/auth-routes.ts` | 3 | `src/app/(store-sync)/login/page.tsx`, `src/components/shared/store-auth-gate.tsx`, `src/config/store-portal-layout-static.ts` |
| `src/app/store/orders/_component/store-order-items-columns.tsx` | 2 | `src/app/store/orders/_component/index.ts`, `src/app/store/orders/_component/store-order-items-table.tsx` |
| `src/app/store/orders/_component/store-order-row-actions.tsx` | 2 | `src/app/store/orders/_component/columns.tsx`, `src/app/store/orders/_component/index.ts` |
| `src/app/store/orders/_component/store-order-status-groups.ts` | 2 | `src/app/store/orders/_component/index.ts`, `src/app/store/orders/_component/store-orders-stat-cards.tsx` |
| `src/app/store/profile/_component/profile-utils.ts` | 2 | `src/app/store/profile/page.tsx`, `src/app/store/profile/_component/store-profile-sidebar.tsx` |
| `src/components/shared/cart-gift-rule-text.tsx` | 2 | `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-line-item.tsx` |
| `src/components/shared/cart-line-item.tsx` | 2 | `src/app/(store-sync)/cart/page.tsx`, `src/app/(store-sync)/checkout/page.tsx` |
| `src/components/shared/cart-order-summary.tsx` | 2 | `src/app/(store-sync)/cart/page.tsx`, `src/app/(store-sync)/checkout/page.tsx` |
| `src/hooks/use-client-ready.ts` | 2 | `src/components/shared/store-auth-gate.tsx`, `src/providers/store-portal-layout.tsx` |

## `src/common/` — tiện ích dùng chung

- (không có file common in-degree ≥ 2)

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` → `pnpm graphify:ai-summary`.
