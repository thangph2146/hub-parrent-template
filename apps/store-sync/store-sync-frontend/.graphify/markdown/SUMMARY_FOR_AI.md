# Next frontend (store-sync) — @store-sync-frontend — tóm tắt cho AI (Graphify)

> Tự động sinh từ `../snapshot/context.json` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).

- **projectRoot:** `D:/HUB/working/2026/monorepo-template/apps/store-sync/store-sync-frontend`
- **context.generatedAt:** 2026-06-19T01:42:22.785Z

## Mục lục artefact Graphify

- **Markdown (ưu tiên đọc):** file này — [`FOLDER_TREE.md`](FOLDER_TREE.md), [`GRAPH_STATS.md`](GRAPH_STATS.md), [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md), [`ENTRY_POINTS.md`](ENTRY_POINTS.md), [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md)
- **Snapshot (JSON nặng):** [`../snapshot/context.json`](../snapshot/context.json), [`../snapshot/graph.json`](../snapshot/graph.json) — chỉ mở khi cần trích source hoặc đồ thị đầy đủ.
- **Quy ước thư mục `.graphify` (tay):** [`../README.md`](../README.md).

## Liên kết dịch vụ & tài liệu hub

App **không** import chéo source `apps/*`; giao tiếp qua **HTTP** + `@workspace/api-client` (và `fetch` public ở storefront khi cần).

### Graphify — markdown các phần còn lại của monorepo

- **@api:** [SUMMARY](../../../../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/api/.graphify/markdown/GRAPH_STATS.md)
- **@backend:** [SUMMARY](../../../../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/backend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/backend/.graphify/markdown/GRAPH_STATS.md)
- **@hub-parent/api:** [SUMMARY](../../../../../apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-parent/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-parent/api/.graphify/markdown/GRAPH_STATS.md)
- **@frontend:** [SUMMARY](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@hub-checkin/api:** [SUMMARY](../../../../../apps/hub-checkin/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-checkin/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-checkin/api/.graphify/markdown/GRAPH_STATS.md)
- **@hub-checkin/frontend:** [SUMMARY](../../../../../apps/hub-checkin/hub-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-checkin/hub-checkin-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-checkin/hub-checkin-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync/api:** [SUMMARY](../../../../../apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/api/.graphify/markdown/GRAPH_STATS.md)
- **packages:** [SUMMARY](../../../../../packages/.graphify/markdown/SUMMARY_FOR_AI.md) · [WORKSPACE_DEPS](../../../../../packages/.graphify/markdown/WORKSPACE_DEPS.md)
- **monorepo (chỉ mục + chủ đề):** [SUMMARY gốc](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md)

### Tài liệu hub (không sinh bởi Graphify)

- [MICROSERVICE_SYSTEM_MAP](../../../../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) — boundaries, ORM, checklist.
- [AGENTS_GUIDE](../../../../../docs/admin-pattern/AGENTS_GUIDE.md) — thứ tự đọc cho agent.
- [AGENTS.md](../../../../../AGENTS.md) — `pnpm check`, `check:full`.
- [FRONTEND_UX](../../../../../docs/admin-pattern/FRONTEND_UX.md) — UX / token / a11y storefront.

## Bản đồ từ snapshot/graph.json

- **Cây thư mục `src/`:** [`FOLDER_TREE.md`](FOLDER_TREE.md) (ASCII từ `../snapshot/graph.json`).
- **Thống kê graph:** [`GRAPH_STATS.md`](GRAPH_STATS.md) — quy mô node/link, top file in/out-degree (điểm nóng import).
- **Bán kính ảnh hưởng:** [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) — file in-degree cao + mẫu importer (sửa shared code).
- **Điểm vào:** [`ENTRY_POINTS.md`](ENTRY_POINTS.md) — bootstrap, module, route Next, AUTO-GENERATED.
- **Pattern lặp:** [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md) — boilerplate (loading, re-export generate).

## Thống kê
- **totalFiles:** 189
- **clientComponents:** 52

## Trang (pages) (58)
- `src/app/(store-sync)/cart/page.tsx`
- `src/app/(store-sync)/catalog/page.tsx`
- `src/app/(store-sync)/catalog/[productId]/page.tsx`
- `src/app/(store-sync)/checkout/page.tsx`
- `src/app/(store-sync)/dashboard/page.tsx`
- `src/app/(store-sync)/help/page.tsx`
- `src/app/(store-sync)/login/page.tsx`
- `src/app/(store-sync)/orders/page.tsx`
- `src/app/(store-sync)/orders/[orderId]/page.tsx`
- `src/app/(store-sync)/privacy/page.tsx`
- `src/app/(store-sync)/profile/page.tsx`
- `src/app/(store-sync)/register/page.tsx`
- `src/app/(store-sync)/support/page.tsx`
- `src/app/(store-sync)/terms/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/[id]/edit/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/app/admin/profile/page.tsx`
- `src/app/admin/promo-codes/new/page.tsx`
- `src/app/admin/promo-codes/page.tsx`
- `src/app/admin/promo-codes/[id]/edit/page.tsx`
- `src/app/admin/promo-codes/[id]/page.tsx`
- `src/app/admin/rbac/page.tsx`
- `src/app/admin/rbac/[id]/edit/page.tsx`
- `src/app/admin/rbac/[id]/page.tsx`
- `src/app/admin/register/page.tsx`
- `src/app/admin/seo-metas/new/page.tsx`
- `src/app/admin/seo-metas/page.tsx`
- `src/app/admin/seo-metas/[id]/edit/page.tsx`
- `src/app/admin/seo-metas/[id]/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/staff/new/page.tsx`
- `src/app/admin/staff/page.tsx`
- `src/app/admin/staff/[id]/edit/page.tsx`
- `src/app/admin/staff/[id]/page.tsx`
- `src/app/graph/page.tsx`
- `src/app/page.tsx`
- `src/app/store/orders/page.tsx`
- `src/app/store/orders/[orderId]/page.tsx`
- `src/app/store/page.tsx`
- `src/app/store/profile/page.tsx`

## Layout (19)
- `src/app/(store-sync)/cart/layout.tsx`
- `src/app/(store-sync)/catalog/layout.tsx`
- `src/app/(store-sync)/catalog/[productId]/layout.tsx`
- `src/app/(store-sync)/checkout/layout.tsx`
- `src/app/(store-sync)/dashboard/layout.tsx`
- `src/app/(store-sync)/help/layout.tsx`
- `src/app/(store-sync)/layout.tsx`
- `src/app/(store-sync)/login/layout.tsx`
- `src/app/(store-sync)/orders/layout.tsx`
- `src/app/(store-sync)/orders/[orderId]/layout.tsx`
- `src/app/(store-sync)/privacy/layout.tsx`
- `src/app/(store-sync)/profile/layout.tsx`
- `src/app/(store-sync)/register/layout.tsx`
- `src/app/(store-sync)/support/layout.tsx`
- `src/app/(store-sync)/terms/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/app/graph/layout.tsx`
- `src/app/layout.tsx`
- `src/app/store/layout.tsx`

## API routes (1)
- `src/app/api/graphify/route.ts`

## Góc hệ thống (@store-sync-frontend) — đường dẫn gợi ý

- **Root layout:** `src/app/layout.tsx`
- **Route handlers dưới `src/app/api/`:** 1 file (danh sách `apiRoutes` ở trên nếu có).

## Module map (không có nội dung file)

| File | Loại | Client | Exports | Imports |
|------|------|--------|---------|---------|
| `components.json` | config | — | — | — |
| `next.config.ts` | config | — | — | — |
| `package.json` | config | — | — | — |
| `src/app/(store-sync)/cart/layout.tsx` | layout | no | metadata, CartLayout | src/app/(store-sync)/cart/page.tsx |
| `src/app/(store-sync)/cart/loading.tsx` | loading | no | CartLoading | src/components/shared/route-loading.tsx |
| `src/app/(store-sync)/cart/page.tsx` | page | yes | CartPage | src/hooks/queries.ts, src/hooks/use-cart.ts, src/hooks/use-gift-product-catalog.ts, src/components/shared/cart-line-item.tsx, src/components/shared/cart-order-summary.tsx |
| `src/app/(store-sync)/catalog/[productId]/layout.tsx` | layout | no | metadata, ProductDetailLayout | src/app/(store-sync)/catalog/[productId]/page.tsx |
| `src/app/(store-sync)/catalog/[productId]/loading.tsx` | loading | no | ProductDetailLoading | src/components/shared/route-loading.tsx |
| `src/app/(store-sync)/catalog/[productId]/page.tsx` | page | yes | ProductDetailPage | src/components/shared/product-detail.tsx, src/hooks/queries.ts |
| `src/app/(store-sync)/catalog/layout.tsx` | layout | no | metadata, CatalogLayout | src/app/(store-sync)/catalog/page.tsx |
| `src/app/(store-sync)/catalog/loading.tsx` | loading | no | CatalogLoading | src/components/shared/route-loading.tsx |
| `src/app/(store-sync)/catalog/page.tsx` | page | yes | CatalogPage | src/components/shared/catalog-product-card.tsx, src/lib/api.ts, src/hooks/queries.ts, src/hooks/use-debounced-value.ts, src/hooks/use-cart.ts, src/lib/catalog-filters.ts, src/lib/category-icons.ts |
| `src/app/(store-sync)/checkout/layout.tsx` | layout | no | metadata, CheckoutLayout | src/app/(store-sync)/checkout/page.tsx |
| `src/app/(store-sync)/checkout/loading.tsx` | loading | no | CheckoutLoading | src/components/shared/route-loading.tsx |
| `src/app/(store-sync)/checkout/page.tsx` | page | yes | CheckoutPage | src/hooks/use-checkout-draft.ts, src/hooks/use-cart.ts, src/hooks/use-session.ts, src/lib/cart-sync.ts, src/hooks/queries.ts, src/hooks/use-gift-product-catalog.ts, src/lib/api.ts, src/lib/format.ts,  |
| `src/app/(store-sync)/dashboard/layout.tsx` | layout | no | metadata, DashboardLayout | src/app/(store-sync)/dashboard/page.tsx |
| `src/app/(store-sync)/dashboard/page.tsx` | page | no | DashboardPage |  |
| `src/app/(store-sync)/help/layout.tsx` | layout | no | metadata, HelpLayout | src/app/(store-sync)/help/page.tsx |
| `src/app/(store-sync)/help/page.tsx` | page | no | HelpPage |  |
| `src/app/(store-sync)/layout.tsx` | layout | no | StoreSyncLayout | src/components/shared/store-auth-gate.tsx |
| `src/app/(store-sync)/login/layout.tsx` | layout | no | metadata, LoginLayout | src/app/(store-sync)/login/page.tsx |
| `src/app/(store-sync)/login/page.tsx` | page | yes | LoginPage | src/hooks/use-session.ts, src/lib/api.ts, src/lib/auth-routes.ts, src/lib/cart-sync.ts, src/lib/store-ui.ts, src/lib/store-auth.ts |
| `src/app/(store-sync)/orders/[orderId]/layout.tsx` | layout | no | metadata, OrderDetailLayout | src/app/(store-sync)/orders/[orderId]/page.tsx |
| `src/app/(store-sync)/orders/[orderId]/loading.tsx` | loading | no | OrderDetailLoading | src/components/shared/route-loading.tsx |
| `src/app/(store-sync)/orders/[orderId]/page.tsx` | page | no |  |  |
| `src/app/(store-sync)/orders/layout.tsx` | layout | no | metadata, OrdersLayout | src/app/(store-sync)/orders/page.tsx |
| `src/app/(store-sync)/orders/loading.tsx` | loading | no | OrdersLoading | src/components/shared/route-loading.tsx |
| `src/app/(store-sync)/orders/page.tsx` | page | no | OrdersLegacyRedirectPage | src/config/store-portal-layout-static.ts |
| `src/app/(store-sync)/privacy/layout.tsx` | layout | no | metadata, PrivacyLayout | src/app/(store-sync)/privacy/page.tsx |
| `src/app/(store-sync)/privacy/page.tsx` | page | no | PrivacyPage |  |
| `src/app/(store-sync)/profile/layout.tsx` | layout | no | metadata, ProfileLayout | src/app/(store-sync)/profile/page.tsx |
| `src/app/(store-sync)/profile/page.tsx` | page | no | ProfileLegacyRedirectPage |  |
| `src/app/(store-sync)/register/layout.tsx` | layout | no | metadata, RegisterLayout | src/app/(store-sync)/register/page.tsx |
| `src/app/(store-sync)/register/page.tsx` | page | yes | RegisterPage | src/lib/store-ui.ts |
| `src/app/(store-sync)/support/layout.tsx` | layout | no | metadata, SupportLayout | src/app/(store-sync)/support/page.tsx |
| `src/app/(store-sync)/support/page.tsx` | page | no | dynamic |  |
| `src/app/(store-sync)/terms/layout.tsx` | layout | no | metadata, TermsLayout | src/app/(store-sync)/terms/page.tsx |
| `src/app/(store-sync)/terms/page.tsx` | page | no | TermsPage |  |
| `src/app/admin/admin-runtime-bridge.tsx` | tsx | yes | AdminRuntimeBridge | src/providers/admin/auth-provider.tsx, src/lib/admin/api.ts |
| `src/app/admin/categories/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/categories/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/categories/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/categories/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/categories/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/categories/new/page.tsx` | page | no | default |  |
| `src/app/admin/categories/page.tsx` | page | no | default |  |
| `src/app/admin/dashboard/page.tsx` | page | no | default |  |
| `src/app/admin/data/page.tsx` | page | no | default |  |
| `src/app/admin/file-storage/page.tsx` | page | no | default |  |
| `src/app/admin/guides/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/guides/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/guides/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/guides/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/guides/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/guides/new/page.tsx` | page | no | default |  |
| `src/app/admin/guides/page.tsx` | page | no | default |  |
| `src/app/admin/layout.tsx` | layout | no | StoreAdminLayout | src/app/admin/page.tsx, src/providers/admin/query-provider.tsx, src/providers/admin/auth-provider.tsx, src/providers/admin/store-admin-layout.tsx, src/app/admin/admin-runtime-bridge.tsx |
| `src/app/admin/login/page.tsx` | page | no | StoreAdminLoginPage | src/features/admin-auth/sign-in-form.tsx |
| `src/app/admin/orders/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/orders/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/orders/page.tsx` | page | no | default |  |
| `src/app/admin/page.tsx` | page | no | StoreAdminIndexPage | src/config/admin/store-admin-access.ts |
| `src/app/admin/products/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/products/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/products/new/page.tsx` | page | no | default |  |
| `src/app/admin/products/page.tsx` | page | no | default |  |
| `src/app/admin/profile/page.tsx` | page | no | StoreAdminProfilePage |  |
| `src/app/admin/promo-codes/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/promo-codes/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/promo-codes/new/page.tsx` | page | no | default |  |
| `src/app/admin/promo-codes/page.tsx` | page | no | default |  |
| `src/app/admin/rbac/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/rbac/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/rbac/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/rbac/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/rbac/page.tsx` | page | no | default |  |
| `src/app/admin/register/page.tsx` | page | no | StoreAdminRegisterPage | src/features/admin-auth/register-form.tsx |
| `src/app/admin/seo-metas/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/seo-metas/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/seo-metas/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/seo-metas/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/seo-metas/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/seo-metas/new/page.tsx` | page | no | default |  |
| `src/app/admin/seo-metas/page.tsx` | page | no | default |  |
| `src/app/admin/settings/page.tsx` | page | no | default |  |
| `src/app/admin/staff/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/staff/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/staff/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/staff/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/staff/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/staff/new/page.tsx` | page | no | default |  |
| `src/app/admin/staff/page.tsx` | page | no | default |  |
| `src/app/api/graphify/route.ts` | api-route | no |  | src/lib/graphify-context.ts |
| `src/app/graph/layout.tsx` | layout | no | metadata, GraphLayout | src/app/graph/page.tsx |
| `src/app/graph/loading.tsx` | loading | no | GraphLoading | src/components/shared/route-loading.tsx |
| `src/app/graph/page.tsx` | page | yes | GraphPage | src/hooks/use-graphify.ts, src/lib/graphify-context.ts, src/components/graphify/force-graph-3d.tsx |
| `src/app/layout.tsx` | layout | no | metadata, RootLayout | src/app/page.tsx, src/components/shared/storefront-chrome.tsx, src/providers/query-provider.tsx, src/components/shared/cart-sync-bridge.tsx, src/components/shared/cart-drawer.tsx, src/components/share |
| `src/app/page.tsx` | page | yes | Home | src/components/shared/product-card.tsx, src/components/shared/product-wide-card.tsx, src/hooks/queries.ts, src/lib/format.ts, src/lib/api.ts, src/lib/catalog-filters.ts |
| `src/app/store/layout.tsx` | layout | no | metadata, StorePortalLayout | src/app/store/page.tsx, src/providers/store-portal-layout.tsx |
| `src/app/store/orders/[orderId]/page.tsx` | page | yes | StoreOrderDetailPage | src/components/shared/cart-drawer.tsx, src/hooks/queries.ts, src/hooks/use-session.ts, src/app/store/orders/_component |
| `src/app/store/orders/_component/columns.tsx` | tsx | yes | getStoreOrderGlobalFilterText, getStoreOrderColumns | src/lib/api.ts, src/lib/format.ts, src/app/store/orders/_component/store-order-progress-cell.tsx, src/app/store/orders/_component/store-order-row-actions.tsx, src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/index.ts` | ts | no | mapStoreOrderItemRows, mapStoreOrderRow, STORE_ORDER_STATUSES | src/app/store/orders/_component/types.ts, src/app/store/orders/_component/columns.tsx, src/app/store/orders/_component/store-order-actions.ts, src/app/store/orders/_component/store-order-row-actions.t |
| `src/app/store/orders/_component/store-order-actions.ts` | ts | no | ReorderToCartResult, buildOrderSummaryText, buildOrdersSupportMessage, buildSupportPageHref, ReorderLineToCartResult, reorderOrderLineToCart, reorderOrdersToCart | src/lib/catalog-filters.ts, src/hooks/use-cart.ts, src/lib/api.ts, src/lib/format.ts, src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/store-order-item-row-actions.tsx` | tsx | yes | StoreOrderItemRowActionHandlers, StoreOrderItemRowActions, storeOrderItemActionsColumnMeta | src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/store-order-items-columns.tsx` | tsx | yes | getStoreOrderItemColumns | src/lib/format.ts, src/app/store/orders/_component/store-order-item-row-actions.tsx, src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/store-order-items-table.tsx` | tsx | yes | StoreOrderItemsTable | src/lib/api.ts, src/app/store/orders/_component/store-order-items-columns.tsx, src/app/store/orders/_component/store-order-item-row-actions.tsx, src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/store-order-progress-cell.tsx` | tsx | yes | StoreOrderProgressCell | src/lib/api.ts |
| `src/app/store/orders/_component/store-order-row-actions.tsx` | tsx | yes | StoreOrderRowActionHandlers, StoreOrderRowActions, storeOrderActionsColumnMeta | src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/store-order-status-groups.ts` | ts | no | StoreOrderStatusGroup, StoreOrderStatusGroupOption, STORE_ORDER_STATUS_GROUPS, toStoreOrderStatusGroup, matchesStoreOrderStatusGroup | src/lib/api.ts |
| `src/app/store/orders/_component/store-orders-stat-cards.tsx` | tsx | yes | StoreOrdersStatCards, countOrdersByStatus | src/lib/api.ts, src/app/store/orders/_component/store-order-status-groups.ts, src/app/store/orders/_component/types.ts |
| `src/app/store/orders/_component/types.ts` | ts | no | StoreOrderItemRow, StoreOrderRow, mapStoreOrderItemRows, mapStoreOrderRow, STORE_ORDER_STATUSES | src/lib/api.ts |
| `src/app/store/orders/page.tsx` | page | yes | StoreOrdersPage | src/components/shared/cart-drawer.tsx, src/hooks/queries.ts, src/hooks/use-session.ts, src/app/store/orders/_component, src/app/store/orders/_component/store-orders-stat-cards.tsx |
| `src/app/store/page.tsx` | page | no | StorePortalIndexPage | src/config/store-portal-layout-static.ts |
| `src/app/store/profile/_component/profile-utils.ts` | ts | no | formatProfileDateTime, profileInitials, PROFILE_FIELD_CLASS, PROFILE_TEXTAREA_CLASS, PROFILE_ACTION_BAR_CLASS |  |
| `src/app/store/profile/_component/store-profile-sidebar.tsx` | tsx | yes | StoreProfileSidebar | src/app/store/profile/_component/profile-utils.ts |
| `src/app/store/profile/page.tsx` | page | yes | StoreProfilePage | src/hooks/queries.ts, src/hooks/use-session.ts, src/lib/store-auth.ts, src/app/store/profile/_component/store-profile-sidebar.tsx, src/app/store/profile/_component/profile-utils.ts |
| `src/components/graphify/force-graph-3d.tsx` | tsx | yes | GraphifyForceGraph3D | src/lib/graphify-context.ts |
| `src/components/shared/cart-drawer.tsx` | tsx | yes | useOpenCartDrawer, CartDrawerHost | src/hooks/use-cart.ts, src/hooks/queries.ts, src/lib/format.ts, src/lib/cart-gift-rules.ts, src/hooks/use-gift-product-catalog.ts, src/components/shared/cart-gift-rule-text.tsx |
| `src/components/shared/cart-gift-rule-text.tsx` | tsx | yes | CartGiftRuleText | src/lib/cart-gift-rules.ts |
| `src/components/shared/cart-line-item.tsx` | tsx | yes | cartLineMaxQty, CartLineItem | src/hooks/use-cart.ts, src/lib/format.ts, src/lib/cart-gift-rules.ts, src/components/shared/cart-gift-rule-text.tsx |
| `src/components/shared/cart-order-summary.tsx` | tsx | yes | CartOrderSummary, CheckoutPromoField | src/hooks/use-cart.ts, src/lib/format.ts |
| `src/components/shared/cart-sync-bridge.tsx` | tsx | yes | CartSyncBridge | src/hooks/use-cart.ts, src/hooks/queries.ts, src/hooks/use-session.ts, src/lib/cart-sync.ts |
| `src/components/shared/catalog-product-card.tsx` | tsx | yes | CatalogProductCardProps, CatalogProductCard | src/lib/api.ts, src/lib/catalog-filters.ts, src/hooks/use-cart.ts |
| `src/components/shared/footer.tsx` | tsx | no | Footer |  |
| `src/components/shared/header.tsx` | tsx | yes | Header | src/hooks/use-cart.ts, src/lib/cart-sync.ts, src/hooks/use-session.ts, src/components/shared/cart-drawer.tsx |
| `src/components/shared/order-status-table.tsx` | tsx | no | OrderStatusTableRow, OrderStatusTable |  |
| `src/components/shared/product-card.tsx` | tsx | yes | ProductCard |  |
| `src/components/shared/product-detail.tsx` | tsx | yes | ProductDetail | src/lib/api.ts, src/lib/catalog-filters.ts, src/hooks/use-cart.ts, src/hooks/use-gift-product-catalog.ts, src/components/shared/product-suggestions.tsx |
| `src/components/shared/product-suggestions.tsx` | tsx | yes | ProductSuggestions | src/lib/api.ts, src/lib/catalog-filters.ts, src/hooks/queries.ts |
| `src/components/shared/product-wide-card.tsx` | tsx | yes | ProductWideCard |  |
| `src/components/shared/promo-rules-sync.tsx` | tsx | yes | PromoRulesSync | src/lib/api.ts, src/lib/promo-rules-registry.ts |
| `src/components/shared/route-loading.tsx` | tsx | no | RouteLoading |  |
| `src/components/shared/store-auth-gate.tsx` | tsx | yes | StoreAuthGate | src/hooks/use-session.ts, src/hooks/use-client-ready.ts, src/lib/auth-routes.ts |
| `src/components/shared/store-location-map-picker.tsx` | tsx | yes | StoreLocationMapPicker |  |
| `src/components/shared/storefront-chrome.tsx` | tsx | yes | StorefrontChrome | src/components/shared/header.tsx, src/components/shared/footer.tsx |
| `src/config/admin/store-admin-access.ts` | ts | no | STORE_ADMIN_BASE_PATH, STORE_ADMIN_HOME_PATH, STORE_ADMIN_LOGIN_PATH, STORE_ADMIN_PROFILE_PATH, STORE_ADMIN_REGISTER_PATH, STORE_ADMIN_INDEX_PATH, STORE_ADMIN_ENTRY_PERMISSIONS, hasAnyStoreAdminPermis |  |
| `src/config/admin/store-admin-layout-static.ts` | ts | no | STORE_ADMIN_LAYOUT_STATIC | src/config/admin/store-admin-menu-tree.tsx, src/config/admin/store-admin-access.ts, src/lib/admin/auth-session.ts, src/lib/admin/auth-routes.ts |
| `src/config/admin/store-admin-menu-tree.tsx` | tsx | no | STORE_ADMIN_MENU_TREE |  |
| `src/config/store-portal-layout-static.ts` | ts | no | STORE_PORTAL_HOME, canAccessStorePortal, clearStorePortalSession, STORE_PORTAL_LAYOUT_STATIC | src/lib/auth-routes.ts, src/lib/store-auth.ts, src/config/store-portal-menu-tree.tsx |
| `src/config/store-portal-menu-tree.tsx` | tsx | no | STORE_PORTAL_MENU_TREE |  |
| `src/features/admin-auth/auth-api.ts` | ts | no |  | src/lib/admin/api-base-url.ts |
| `src/features/admin-auth/register-form.tsx` | tsx | yes | RegisterForm | src/lib/admin/auth-routes.ts |
| `src/features/admin-auth/sign-in-form.tsx` | tsx | yes | SignInForm | src/config/admin/store-admin-access.ts, src/providers/admin/auth-provider.tsx |
| `src/hooks/admin/index.ts` | ts | no | useDebouncedValue, useAdminEditFormHydration, useAdminFormDraftPersistence, useAdminTableState | src/hooks/admin/use-debounced-value.ts, src/hooks/admin/use-admin-edit-form-hydration.ts, src/hooks/admin/use-admin-table-state.ts |
| `src/hooks/admin/queries.ts` | ts | no |  |  |
| `src/hooks/admin/use-admin-edit-form-hydration.ts` | ts | no | useAdminEditFormHydration, useAdminFormDraftPersistence |  |
| `src/hooks/admin/use-admin-mutation.ts` | ts | no | useAdminMutation |  |
| `src/hooks/admin/use-admin-realtime-sync.ts` | ts | no | useAdminRealtimeSync |  |
| `src/hooks/admin/use-admin-table-state.ts` | ts | no | useAdminTableState |  |
| `src/hooks/admin/use-debounced-value.ts` | ts | no | useDebouncedValue |  |
| `src/hooks/queries.ts` | ts | yes | queryKeys, useProducts, useCatalogProducts, useCategoryUsage, useProduct, useCartStockProducts, useProductBySku, useSuggestedProducts, useCategories, useOrders, useOrder, useStoreAccountProfile, useUp | src/lib/api.ts |
| `src/hooks/use-cart.ts` | ts | yes | CartLine, cartLineKey, cartLineQuantity, mergeLinesForCreateOrder, CartAddResult, cartStore, cartNeedsStockSync, CartSummary, useCart, useCartStockSync | src/lib/promo-rules-registry.ts, src/lib/api.ts |
| `src/hooks/use-checkout-draft.ts` | ts | yes | CheckoutDraftFields, useCheckoutDraft |  |
| `src/hooks/use-client-ready.ts` | ts | yes | useClientReady |  |
| `src/hooks/use-debounced-value.ts` | ts | yes | useDebouncedValue |  |
| `src/hooks/use-gift-product-catalog.ts` | ts | yes | useGiftProductCatalogMap, useGiftHrefForRulesFromLines | src/lib/api.ts, src/lib/cart-gift-rules.ts, src/hooks/use-cart.ts, src/hooks/queries.ts |
| `src/hooks/use-graphify.ts` | ts | yes | UseGraphifyReturn, useGraphify | src/lib/graphify-context.ts |
| `src/hooks/use-mobile.ts` | ts | no | useIsMobile |  |
| `src/hooks/use-session.ts` | ts | yes | MockSession, useSession |  |
| `src/lib/admin/admin-navigation.ts` | ts | no |  |  |
| `src/lib/admin/api-base-url.ts` | ts | no |  |  |
| `src/lib/admin/api.ts` | ts | no | api, ApiError | src/lib/admin/api-base-url.ts, src/lib/admin/auth-session.ts |
| `src/lib/admin/auth-routes.ts` | ts | no | AUTH_LOGIN_PATH, AUTH_REGISTER_PATH, isStoreAdminAuthPath, getAdminAppHomeExternalPath, getAdminLoginExternalPath, STORE_ADMIN_HOME_PATH, STORE_ADMIN_LOGIN_PATH | src/config/admin/store-admin-access.ts |
| `src/lib/admin/auth-session.ts` | ts | no |  |  |
| `src/lib/admin/index.ts` | ts | no |  |  |
| `src/lib/admin/product-image-storage-stub.ts` | ts | no | PRODUCT_IMAGE_PARENT_LABEL, PRODUCT_IMAGE_PARENT_SLUG, ProductImageUploadInput, ProductImageUploadContext, resolveProductImageSlug, buildProductImageUploadContext, resolveProductImageFolderNav, folder |  |
| `src/lib/api.ts` | ts | no | api, ApiError |  |
| `src/lib/auth-routes.ts` | ts | no | STORE_AUTH_PATHS, isStoreAuthPath, safeRelativeNext |  |
| `src/lib/cart-gift-rules.ts` | ts | no | giftRulesForCartLine, isCartGiftRuleUnlocked, describeCartGiftRuleParts, summarizeCartGiftRule | src/hooks/use-cart.ts |
| `src/lib/cart-sync.ts` | ts | no | resetCartHydration, schedulePushUserCart | src/lib/api.ts, src/hooks/use-cart.ts |
| `src/lib/catalog-filters.ts` | ts | no | scoreProductSearchMatch, productMatchesCatalogFilters, getProductUnits | src/lib/api.ts |
| `src/lib/category-icons.ts` | ts | no | CATEGORY_ICON_OPTIONS, resolveCategoryIcon |  |
| `src/lib/format.ts` | ts | no | formatVND, formatDate, formatDateShort |  |
| `src/lib/graphify-context.ts` | ts | no | GraphNode, GraphLink, GraphData, FileEntry, ContextData, GraphifyPayload, nodeColorByCommunity, emojiForType, resolveSourceFile, exportsOfFile, importedBy, importsOf, getLinkedNodes, communityBreakdow |  |
| `src/lib/mock-session-to-admin-user.ts` | ts | no | mockSessionToAdminUser | src/hooks/use-session.ts |
| `src/lib/promo-rules-registry.ts` | ts | no | setStorefrontPromoRulesFromApi, getMergedPromoRules |  |
| `src/lib/storage.ts` | ts | no | StorageLib |  |
| `src/lib/store-auth.ts` | ts | no | STORE_SESSION_STORAGE_KEY, STORE_SESSION_EVENT, toStoreSession, writeStoreSession, patchStoreSession | src/hooks/use-session.ts, src/lib/api.ts |
| `src/lib/store-ui.ts` | ts | no | STORE_AUTH_FORM_CARD_CLASS |  |
| `src/lib/utils.ts` | ts | no | cn |  |
| `src/providers/admin/admin-realtime-sync.tsx` | tsx | yes | AdminRealtimeSync | src/providers/admin/auth-provider.tsx, src/hooks/admin/use-admin-realtime-sync.ts |
| `src/providers/admin/auth-provider.tsx` | tsx | yes | StaffLoginResult, AuthProvider, useAuth, useClientReady | src/config/admin/store-admin-access.ts, src/features/admin-auth/auth-api.ts, src/lib/admin/auth-session.ts, src/lib/admin/auth-routes.ts |
| `src/providers/admin/query-provider.tsx` | tsx | yes | QueryProvider |  |
| `src/providers/admin/store-admin-layout.tsx` | tsx | yes | StoreAdminLayoutProvider | src/lib/admin/api.ts, src/config/admin/store-admin-layout-static.ts, src/providers/admin/admin-realtime-sync.tsx, src/providers/admin/auth-provider.tsx, src/lib/admin/auth-session.ts |
| `src/providers/query-provider.tsx` | tsx | yes | QueryProvider |  |
| `src/providers/store-portal-layout.tsx` | tsx | yes | StorePortalLayoutProvider | src/hooks/use-cart.ts, src/hooks/use-client-ready.ts, src/hooks/use-session.ts, src/lib/cart-sync.ts, src/lib/mock-session-to-admin-user.ts, src/lib/store-auth.ts, src/config/store-portal-layout-stati |
| `src/proxy.ts` | ts | no | proxy, config |  |
| `src/types/google-gsi.d.ts` | ts | no |  |  |
| `tsconfig.json` | config | — | — | — |
## File Markdown trong scope app

Toàn bộ `.md` sinh tự động nằm trong **`apps/store-sync/store-sync-frontend/.graphify/markdown/`**; JSON trong **`../snapshot/`** — xem mục **Mục lục artefact Graphify** ở đầu file.

- **Chỉ mục monorepo + chủ đề:** [`../../../../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md).

## Làm mới

- Cập nhật `snapshot/context.json` **và** `snapshot/graph.json`: `node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend`.
- Sau đó chạy: `pnpm graphify:ai-summary` (sinh thêm `FOLDER_TREE.md`, `GRAPH_STATS.md` khi có graph).
