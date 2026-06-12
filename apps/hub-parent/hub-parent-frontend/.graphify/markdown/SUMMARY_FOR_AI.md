# Next frontend (hub-parent) — @frontend — tóm tắt cho AI (Graphify)

> Tự động sinh từ `../snapshot/context.json` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).

- **projectRoot:** `D:/HUB/working/2026/hub-parrent-template/apps/hub-parent/hub-parent-frontend`
- **context.generatedAt:** 2026-06-12T12:59:24.112Z

## Mục lục artefact Graphify

- **Markdown (ưu tiên đọc):** file này — [`FOLDER_TREE.md`](FOLDER_TREE.md), [`GRAPH_STATS.md`](GRAPH_STATS.md)
- **Snapshot (JSON nặng):** [`../snapshot/context.json`](../snapshot/context.json), [`../snapshot/graph.json`](../snapshot/graph.json) — chỉ mở khi cần trích source hoặc đồ thị đầy đủ.
- **Quy ước thư mục `.graphify` (tay):** [`../README.md`](../README.md).

## Liên kết dịch vụ & tài liệu hub

App **không** import chéo source `apps/*`; giao tiếp qua **HTTP** + `@workspace/api-client` (và `fetch` public ở storefront khi cần).

### Graphify — markdown các phần còn lại của monorepo

- **@api:** [SUMMARY](../../../../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/api/.graphify/markdown/GRAPH_STATS.md)
- **@backend:** [SUMMARY](../../../../../apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/backend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/backend/.graphify/markdown/GRAPH_STATS.md)
- **@hub-parent/api:** [SUMMARY](../../../../../apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-parent/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-parent/api/.graphify/markdown/GRAPH_STATS.md)
- **@hub-event/api:** [SUMMARY](../../../../../apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-event/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-event/api/.graphify/markdown/GRAPH_STATS.md)
- **@hub-event-checkin-frontend:** [SUMMARY](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync/api:** [SUMMARY](../../../../../apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/api/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync-frontend:** [SUMMARY](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/GRAPH_STATS.md)
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

## Thống kê
- **totalFiles:** 128
- **clientComponents:** 39

## Trang (pages) (21)
- `src/app/(public)/(store-sync)/cart/page.tsx`
- `src/app/(public)/(store-sync)/catalog/page.tsx`
- `src/app/(public)/(store-sync)/catalog/[productId]/page.tsx`
- `src/app/(public)/(store-sync)/checkout/page.tsx`
- `src/app/(public)/(store-sync)/dashboard/page.tsx`
- `src/app/(public)/(store-sync)/help/page.tsx`
- `src/app/(public)/(store-sync)/login/page.tsx`
- `src/app/(public)/(store-sync)/orders/page.tsx`
- `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx`
- `src/app/(public)/(store-sync)/privacy/page.tsx`
- `src/app/(public)/(store-sync)/profile/page.tsx`
- `src/app/(public)/(store-sync)/register/page.tsx`
- `src/app/(public)/(store-sync)/support/page.tsx`
- `src/app/(public)/(store-sync)/terms/page.tsx`
- `src/app/(public)/bai-viet/page.tsx`
- `src/app/(public)/bai-viet/[slug]/page.tsx`
- `src/app/(public)/huong-dan-su-dung/page.tsx`
- `src/app/(public)/lien-he/page.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/ve-chung-toi/page.tsx`
- `src/app/graph/page.tsx`

## Layout (18)
- `src/app/(public)/(store-sync)/cart/layout.tsx`
- `src/app/(public)/(store-sync)/catalog/layout.tsx`
- `src/app/(public)/(store-sync)/catalog/[productId]/layout.tsx`
- `src/app/(public)/(store-sync)/checkout/layout.tsx`
- `src/app/(public)/(store-sync)/dashboard/layout.tsx`
- `src/app/(public)/(store-sync)/help/layout.tsx`
- `src/app/(public)/(store-sync)/layout.tsx`
- `src/app/(public)/(store-sync)/login/layout.tsx`
- `src/app/(public)/(store-sync)/orders/layout.tsx`
- `src/app/(public)/(store-sync)/orders/[orderId]/layout.tsx`
- `src/app/(public)/(store-sync)/privacy/layout.tsx`
- `src/app/(public)/(store-sync)/profile/layout.tsx`
- `src/app/(public)/(store-sync)/register/layout.tsx`
- `src/app/(public)/(store-sync)/support/layout.tsx`
- `src/app/(public)/(store-sync)/terms/layout.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/graph/layout.tsx`
- `src/app/layout.tsx`

## API routes (1)
- `src/app/api/graphify/route.ts`

## Góc hệ thống (@frontend) — đường dẫn gợi ý

- **Root layout:** `src/app/layout.tsx`
- **Route handlers dưới `src/app/api/`:** 1 file (danh sách `apiRoutes` ở trên nếu có).

## Module map (không có nội dung file)

| File | Loại | Client | Exports | Imports |
|------|------|--------|---------|---------|
| `components.json` | config | — | — | — |
| `next.config.ts` | config | — | — | — |
| `package.json` | config | — | — | — |
| `src/app/(public)/(store-sync)/cart/layout.tsx` | layout | no | metadata, CartLayout | src/app/(public)/(store-sync)/cart/page.tsx |
| `src/app/(public)/(store-sync)/cart/loading.tsx` | loading | no | CartLoading | src/components/shared/route-loading.tsx |
| `src/app/(public)/(store-sync)/cart/page.tsx` | page | yes | CartPage | src/hooks/use-cart.ts, src/components/shared/cart-line-item.tsx, src/components/shared/cart-order-summary.tsx |
| `src/app/(public)/(store-sync)/catalog/[productId]/layout.tsx` | layout | no | metadata, ProductDetailLayout | src/app/(public)/(store-sync)/catalog/[productId]/page.tsx |
| `src/app/(public)/(store-sync)/catalog/[productId]/loading.tsx` | loading | no | ProductDetailLoading | src/components/shared/route-loading.tsx |
| `src/app/(public)/(store-sync)/catalog/[productId]/page.tsx` | page | yes | ProductDetailPage | src/components/shared/product-detail.tsx, src/hooks/queries.ts |
| `src/app/(public)/(store-sync)/catalog/layout.tsx` | layout | no | metadata, CatalogLayout | src/app/(public)/(store-sync)/catalog/page.tsx |
| `src/app/(public)/(store-sync)/catalog/loading.tsx` | loading | no | CatalogLoading | src/components/shared/route-loading.tsx |
| `src/app/(public)/(store-sync)/checkout/layout.tsx` | layout | no | metadata, CheckoutLayout | src/app/(public)/(store-sync)/checkout/page.tsx |
| `src/app/(public)/(store-sync)/checkout/loading.tsx` | loading | no | CheckoutLoading | src/components/shared/route-loading.tsx |
| `src/app/(public)/(store-sync)/checkout/page.tsx` | page | yes | CheckoutPage | src/hooks/use-cart.ts, src/hooks/use-session.ts, src/hooks/queries.ts, src/lib/api.ts, src/lib/format.ts, src/components/shared/cart-line-item.tsx, src/components/shared/cart-order-summary.tsx |
| `src/app/(public)/(store-sync)/dashboard/layout.tsx` | layout | no | metadata, DashboardLayout | src/app/(public)/(store-sync)/dashboard/page.tsx |
| `src/app/(public)/(store-sync)/dashboard/page.tsx` | page | no | DashboardPage |  |
| `src/app/(public)/(store-sync)/help/layout.tsx` | layout | no | metadata, HelpLayout | src/app/(public)/(store-sync)/help/page.tsx |
| `src/app/(public)/(store-sync)/help/page.tsx` | page | no | HelpPage |  |
| `src/app/(public)/(store-sync)/layout.tsx` | layout | no | StoreSyncLayout | src/components/shared/store-auth-gate.tsx |
| `src/app/(public)/(store-sync)/login/layout.tsx` | layout | no | metadata, LoginLayout | src/app/(public)/(store-sync)/login/page.tsx |
| `src/app/(public)/(store-sync)/login/page.tsx` | page | yes | LoginPage | src/lib/api.ts, src/lib/auth-routes.ts, src/lib/store-ui.ts |
| `src/app/(public)/(store-sync)/orders/[orderId]/layout.tsx` | layout | no | metadata, OrderDetailLayout | src/app/(public)/(store-sync)/orders/[orderId]/page.tsx |
| `src/app/(public)/(store-sync)/orders/[orderId]/loading.tsx` | loading | no | OrderDetailLoading | src/components/shared/route-loading.tsx |
| `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx` | page | yes | OrderDetailPage | src/lib/api.ts, src/hooks/queries.ts, src/lib/format.ts, src/hooks/use-session.ts |
| `src/app/(public)/(store-sync)/orders/layout.tsx` | layout | no | metadata, OrdersLayout | src/app/(public)/(store-sync)/orders/page.tsx |
| `src/app/(public)/(store-sync)/orders/loading.tsx` | loading | no | OrdersLoading | src/components/shared/route-loading.tsx |
| `src/app/(public)/(store-sync)/orders/page.tsx` | page | yes | OrdersPage | src/hooks/use-debounced-value.ts, src/lib/api.ts, src/hooks/queries.ts, src/hooks/use-session.ts, src/lib/format.ts, src/components/shared/order-status-table.tsx |
| `src/app/(public)/(store-sync)/privacy/layout.tsx` | layout | no | metadata, PrivacyLayout | src/app/(public)/(store-sync)/privacy/page.tsx |
| `src/app/(public)/(store-sync)/privacy/page.tsx` | page | no | PrivacyPage |  |
| `src/app/(public)/(store-sync)/profile/layout.tsx` | layout | no | metadata, ProfileLayout | src/app/(public)/(store-sync)/profile/page.tsx |
| `src/app/(public)/(store-sync)/profile/page.tsx` | page | yes | ProfilePage | src/hooks/use-session.ts, src/hooks/use-cart.ts |
| `src/app/(public)/(store-sync)/register/layout.tsx` | layout | no | metadata, RegisterLayout | src/app/(public)/(store-sync)/register/page.tsx |
| `src/app/(public)/(store-sync)/register/page.tsx` | page | yes | RegisterPage | src/lib/store-ui.ts |
| `src/app/(public)/(store-sync)/support/layout.tsx` | layout | no | metadata, SupportLayout | src/app/(public)/(store-sync)/support/page.tsx |
| `src/app/(public)/(store-sync)/support/page.tsx` | page | no | dynamic |  |
| `src/app/(public)/(store-sync)/terms/layout.tsx` | layout | no | metadata, TermsLayout | src/app/(public)/(store-sync)/terms/page.tsx |
| `src/app/(public)/(store-sync)/terms/page.tsx` | page | no | TermsPage |  |
| `src/app/(public)/bai-viet/[slug]/page.tsx` | page | no |  | src/lib/dev-route-log.ts, src/lib/public-posts.ts, src/components/shared/post-content.tsx, src/components/shared/public-post-view-badge.tsx, src/lib/seo.ts |
| `src/app/(public)/bai-viet/page.tsx` | page | no | metadata | src/lib/dev-route-log.ts, src/lib/public-posts.ts, src/lib/seo.ts |
| `src/app/(public)/huong-dan-su-dung/guide-sections.tsx` | tsx | yes | GuideSections |  |
| `src/app/(public)/huong-dan-su-dung/page.tsx` | page | no | metadata | src/lib/seo.ts, src/app/(public)/huong-dan-su-dung/guide-sections.tsx, src/lib/api.ts |
| `src/app/(public)/layout.tsx` | layout | no | metadata, RootLayout | src/app/(public)/page.tsx, src/components/shared/header.tsx, src/components/shared/footer.tsx, src/providers/query-provider.tsx, src/components/shared/scroll-to-top.tsx, src/components/shared/store-au |
| `src/app/(public)/lien-he/page.tsx` | page | no | metadata, ContactPage | src/features/pages/home-page/sub-sections/contact-section.tsx, src/lib/seo.ts |
| `src/app/(public)/page.tsx` | page | no | metadata, PublicHomePage | src/features/pages/home-page, src/lib/seo.ts |
| `src/app/(public)/ve-chung-toi/page.tsx` | page | no | metadata, AboutPage | src/features/pages/about-page, src/lib/seo.ts |
| `src/app/api/graphify/route.ts` | api-route | no |  |  |
| `src/app/graph/layout.tsx` | layout | no | metadata, GraphLayout | src/app/graph/page.tsx |
| `src/app/graph/loading.tsx` | loading | no | GraphLoading | src/components/shared/route-loading.tsx |
| `src/app/graph/page.tsx` | page | yes | GraphPage |  |
| `src/app/layout.tsx` | layout | no | metadata, RootLayout |  |
| `src/app/robots.ts` | ts | no | robots | src/lib/seo.ts |
| `src/app/sitemap.ts` | ts | no | sitemap | src/lib/seo.ts |
| `src/components/icons/logo.tsx` | tsx | no | Logo |  |
| `src/components/shared/cart-drawer.tsx` | tsx | yes | useOpenCartDrawer, CartDrawerHost | src/hooks/use-cart.ts, src/lib/format.ts, src/lib/gift-rules-from-fulfillment-note.ts |
| `src/components/shared/cart-line-item.tsx` | tsx | yes | cartLineMaxQty, CartLineItem | src/hooks/use-cart.ts, src/lib/format.ts, src/lib/gift-rules-from-fulfillment-note.ts |
| `src/components/shared/cart-order-summary.tsx` | tsx | yes | CartOrderSummary, CheckoutPromoField | src/hooks/use-cart.ts, src/lib/format.ts |
| `src/components/shared/footer.tsx` | tsx | no | Footer | src/features/auth/admin-bridge.ts, src/components/icons/logo.tsx |
| `src/components/shared/header.tsx` | tsx | yes | Header | src/hooks/use-cart.ts, src/components/shared/cart-drawer.tsx, src/hooks/use-session.ts, src/features/auth/admin-bridge.ts, src/lib/store-feature.ts, src/components/icons/logo.tsx |
| `src/components/shared/order-status-table.tsx` | tsx | no | OrderStatusTableRow, OrderStatusTable |  |
| `src/components/shared/post-content-renderer.tsx` | tsx | yes | PostContentRenderer |  |
| `src/components/shared/post-content.tsx` | tsx | yes | PostContent | src/components/shared/post-content-renderer.tsx |
| `src/components/shared/product-card.tsx` | tsx | yes | ProductCard |  |
| `src/components/shared/product-detail.tsx` | tsx | yes | ProductDetail | src/lib/api.ts, src/lib/format.ts, src/lib/product-price.ts, src/hooks/queries.ts, src/hooks/use-cart.ts, src/lib/gift-rules-from-fulfillment-note.ts |
| `src/components/shared/product-wide-card.tsx` | tsx | yes | ProductWideCard |  |
| `src/components/shared/promo-rules-sync.tsx` | tsx | yes | PromoRulesSync | src/lib/api.ts, src/lib/promo-rules-registry.ts |
| `src/components/shared/public-post-view-badge.tsx` | tsx | yes | PublicPostViewBadge | src/lib/api.ts |
| `src/components/shared/route-loading.tsx` | tsx | no | RouteLoading |  |
| `src/components/shared/scroll-to-top.tsx` | tsx | yes | ScrollToTop | src/lib/scroll.ts |
| `src/components/shared/store-auth-gate.tsx` | tsx | yes | StoreAuthGate | src/hooks/use-session.ts, src/hooks/use-client-ready.ts, src/lib/auth-routes.ts |
| `src/features/auth/admin-bridge.ts` | ts | no | getAdminBaseUrl, getAdminLoginUrl, getAdminRegisterUrl |  |
| `src/features/pages/about-page/about-client.tsx` | tsx | yes | AboutClient | src/features/pages/about-page/sub-sections/overview-section.tsx, src/features/pages/about-page/sub-sections/about-hub-section.tsx, src/features/pages/about-page/sub-sections/history-section.tsx, src/f |
| `src/features/pages/about-page/about.tsx` | tsx | no | AboutProps, About | src/features/pages/about-page/about-client.tsx |
| `src/features/pages/about-page/constants.tsx` | tsx | no | CORE_VALUES, EDUCATION_PHILOSOPHY, FACILITIES_STATS, FACILITY_IMAGES, FACILITIES, DEPARTMENTS, HISTORY_TIMELINE, LEADER_GENERATIONS, getTimelineData |  |
| `src/features/pages/about-page/index.ts` | ts | no |  | src/features/pages/about-page/sub-sections |
| `src/features/pages/about-page/sub-sections/about-hub-section.tsx` | tsx | no | AboutHubSection |  |
| `src/features/pages/about-page/sub-sections/core-values-section.tsx` | tsx | no | CoreValuesSection | src/features/pages/about-page/utils.tsx, src/features/pages/about-page/constants.tsx |
| `src/features/pages/about-page/sub-sections/departments-section.tsx` | tsx | no | DepartmentsSection | src/features/pages/about-page/constants.tsx |
| `src/features/pages/about-page/sub-sections/education-philosophy-section.tsx` | tsx | no | EducationPhilosophySection | src/features/pages/about-page/utils.tsx, src/features/pages/about-page/constants.tsx |
| `src/features/pages/about-page/sub-sections/facilities-section.tsx` | tsx | no | FacilitiesSection | src/features/pages/about-page/constants.tsx |
| `src/features/pages/about-page/sub-sections/faculty-scientists-section.tsx` | tsx | no | FacultyScientistsSection |  |
| `src/features/pages/about-page/sub-sections/history-section.tsx` | tsx | yes | HistorySection | src/features/pages/about-page/constants.tsx |
| `src/features/pages/about-page/sub-sections/index.ts` | ts | no | About, AboutClient | src/features/pages/about-page/about.tsx, src/features/pages/about-page/about-client.tsx |
| `src/features/pages/about-page/sub-sections/leaders-section.tsx` | tsx | no | LeadersSection | src/features/pages/about-page/constants.tsx |
| `src/features/pages/about-page/sub-sections/organization-structure-section.tsx` | tsx | no | OrganizationStructureSection |  |
| `src/features/pages/about-page/sub-sections/overview-section.tsx` | tsx | no | OverviewSection |  |
| `src/features/pages/about-page/sub-sections/vision-mission-section.tsx` | tsx | no | VisionMissionSection |  |
| `src/features/pages/about-page/utils.tsx` | tsx | no | highlightHUB |  |
| `src/features/pages/home-page/constants.ts` | ts | no | HOME_ROUTES | src/features/auth/admin-bridge.ts |
| `src/features/pages/home-page/data.tsx` | tsx | no | HERO_DATA | src/features/pages/home-page/constants.ts |
| `src/features/pages/home-page/home-client.tsx` | tsx | no | HomeClient | src/features/pages/home-page/sub-sections/hero-section.tsx, src/features/pages/home-page/data.tsx, src/features/pages/home-page/sub-sections/about-hub-section.tsx, src/features/pages/home-page/sub-sec |
| `src/features/pages/home-page/home.tsx` | tsx | no | HomeProps | src/features/pages/home-page/home-client.tsx |
| `src/features/pages/home-page/index.ts` | ts | no | Home, HomeClient | src/features/pages/home-page/home.tsx, src/features/pages/home-page/home-client.tsx, src/features/pages/home-page/data.tsx, src/features/pages/home-page/sub-sections |
| `src/features/pages/home-page/sub-sections/about-hub-section.tsx` | tsx | yes | AboutHubSection | src/features/pages/home-page/constants.ts, src/features/pages/home-page/sub-sections/scroll-indicator.tsx |
| `src/features/pages/home-page/sub-sections/contact-section.tsx` | tsx | yes | ContactSectionProps, ContactSection | src/lib/api.ts |
| `src/features/pages/home-page/sub-sections/content-card.tsx` | tsx | no | ContentCardButton, ContentCardProps, ContentCard |  |
| `src/features/pages/home-page/sub-sections/featured-posts-section.tsx` | tsx | yes | FeaturedPostsSectionProps, FeaturedPostsSection | src/features/pages/home-page/constants.ts |
| `src/features/pages/home-page/sub-sections/guide-register-section.tsx` | tsx | yes | GuideRegisterSection | src/features/pages/home-page/constants.ts, src/features/pages/home-page/sub-sections/scroll-indicator.tsx |
| `src/features/pages/home-page/sub-sections/hero-section.tsx` | tsx | yes | HeroButton, HeroSectionProps, HeroSection | src/features/pages/home-page/sub-sections/content-card.tsx, src/features/auth/admin-bridge.ts, src/features/pages/home-page/sub-sections/scroll-indicator.tsx |
| `src/features/pages/home-page/sub-sections/index.ts` | ts | no | HeroSection, AboutHubSection, OverviewSection, GuideRegisterSection, FeaturedPostsSection, ContactSection, ScrollIndicator | src/features/pages/home-page/sub-sections/hero-section.tsx, src/features/pages/home-page/sub-sections/about-hub-section.tsx, src/features/pages/home-page/sub-sections/overview-section.tsx, src/feature |
| `src/features/pages/home-page/sub-sections/overview-section.tsx` | tsx | yes | OverviewSection | src/features/pages/home-page/sub-sections/scroll-indicator.tsx |
| `src/features/pages/home-page/sub-sections/scroll-indicator.tsx` | tsx | yes | ScrollIndicatorProps, ScrollIndicator | src/lib/scroll.ts |
| `src/hooks/queries.ts` | ts | yes | queryKeys, useProducts, useCatalogProducts, useCategoryUsage, useProduct, useProductBySku, useCategories, useCategoryBySlug, useOrders, useOrder, useCreateOrder | src/lib/api.ts |
| `src/hooks/use-cart.ts` | ts | yes | CartLine, cartLineKey, cartLineQuantity, mergeLinesForCreateOrder, cartStore, CartSummary, useCart | src/lib/promo-rules-registry.ts, src/lib/api.ts |
| `src/hooks/use-client-ready.ts` | ts | yes | useClientReady |  |
| `src/hooks/use-debounced-value.ts` | ts | yes | useDebouncedValue |  |
| `src/hooks/use-mobile.ts` | ts | no | useIsMobile |  |
| `src/hooks/use-session.ts` | ts | yes | MockSession, useSession |  |
| `src/hooks/useTodos.ts` | ts | no | TodoFilter, TodoStats, useTodos | src/types/todo.ts, src/lib/utils.ts, src/lib/storage.ts |
| `src/lib/api.ts` | ts | no | api, ApiError |  |
| `src/lib/auth-routes.ts` | ts | no | STORE_AUTH_PATHS, isStoreAuthPath, safeRelativeNext |  |
| `src/lib/catalog-filters.ts` | ts | no | getProductUnits, scoreProductSearchMatch, productMatchesCatalogFilters | src/lib/api.ts |
| `src/lib/category-icons.ts` | ts | no | CATEGORY_ICON_OPTIONS, resolveCategoryIcon |  |
| `src/lib/dev-route-log.ts` | ts | no |  |  |
| `src/lib/format.ts` | ts | no | formatVND, formatDate, formatDateShort |  |
| `src/lib/gift-rules-from-fulfillment-note.ts` | ts | no | GiftRule, normalizeGiftRuleUnitType, parseGiftRulesFromFulfillmentNote, getActiveGiftRuleForUnit |  |
| `src/lib/product-price.ts` | ts | no | unitSellingAndListPrice | src/lib/api.ts |
| `src/lib/promo-rules-registry.ts` | ts | no | setStorefrontPromoRulesFromApi, getMergedPromoRules |  |
| `src/lib/public-posts.ts` | ts | no | PublicPostSummary, PublicPostDetail, PublicCategoryItem, formatPostDate | src/lib/api.ts |
| `src/lib/scroll.ts` | ts | yes | getHeaderHeight, scrollToYWithHeaderOffset |  |
| `src/lib/seo.ts` | ts | no | SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_URL, OG_IMAGE_URL, absoluteUrl, buildSeoMetadata |  |
| `src/lib/storage.ts` | ts | no | StorageLib |  |
| `src/lib/store-feature.ts` | ts | no | STORE_ENABLED, isStoreRoute |  |
| `src/lib/store-ui.ts` | ts | no | STORE_AUTH_FORM_CARD_CLASS |  |
| `src/lib/utils.ts` | ts | no | cn, generateId |  |
| `src/providers/query-provider.tsx` | tsx | yes | QueryProvider |  |
| `src/proxy.ts` | ts | no | proxy, config | src/lib/store-feature.ts |
| `src/types/todo.ts` | ts | no | Todo |  |
| `tsconfig.json` | config | — | — | — |
## File Markdown trong scope app

Toàn bộ `.md` sinh tự động nằm trong **`apps/hub-parent/hub-parent-frontend/.graphify/markdown/`**; JSON trong **`../snapshot/`** — xem mục **Mục lục artefact Graphify** ở đầu file.

- **Chỉ mục monorepo + chủ đề:** [`../../../../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md).

## Làm mới

- Cập nhật `snapshot/context.json` **và** `snapshot/graph.json`: `node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend`.
- Sau đó chạy: `pnpm graphify:ai-summary` (sinh thêm `FOLDER_TREE.md`, `GRAPH_STATS.md` khi có graph).
