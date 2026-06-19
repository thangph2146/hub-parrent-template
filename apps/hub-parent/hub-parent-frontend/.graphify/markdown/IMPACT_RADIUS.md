# Bán kính ảnh hưởng import — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.516Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/lib/api.ts` | 15 | `src/app/(public)/(store-sync)/catalog/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx`, `src/app/(public)/(store-sync)/login/page.tsx`, `src/app/(public)/(store-sync)/orders/page.tsx`, `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx`, `src/app/(public)/huong-dan-su-dung/page.tsx` |
| `src/hooks/use-cart.ts` | 9 | `src/app/(public)/(store-sync)/cart/page.tsx`, `src/app/(public)/(store-sync)/catalog/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx`, `src/app/(public)/(store-sync)/profile/page.tsx`, `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-line-item.tsx` |
| `src/lib/seo.ts` | 9 | `src/app/(public)/bai-viet/page.tsx`, `src/app/(public)/bai-viet/[slug]/page.tsx`, `src/app/(public)/huong-dan-su-dung/page.tsx`, `src/app/(public)/layout.tsx`, `src/app/(public)/lien-he/page.tsx`, `src/app/(public)/page.tsx` |
| `src/lib/format.ts` | 8 | `src/app/(public)/(store-sync)/catalog/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx`, `src/app/(public)/(store-sync)/orders/page.tsx`, `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx`, `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-line-item.tsx` |
| `src/components/shared/route-loading.tsx` | 7 | `src/app/(public)/(store-sync)/cart/loading.tsx`, `src/app/(public)/(store-sync)/catalog/loading.tsx`, `src/app/(public)/(store-sync)/catalog/[productId]/loading.tsx`, `src/app/(public)/(store-sync)/checkout/loading.tsx`, `src/app/(public)/(store-sync)/orders/loading.tsx`, `src/app/(public)/(store-sync)/orders/[orderId]/loading.tsx` |
| `src/features/pages/about-page/constants.tsx` | 6 | `src/features/pages/about-page/sub-sections/core-values-section.tsx`, `src/features/pages/about-page/sub-sections/departments-section.tsx`, `src/features/pages/about-page/sub-sections/education-philosophy-section.tsx`, `src/features/pages/about-page/sub-sections/facilities-section.tsx`, `src/features/pages/about-page/sub-sections/history-section.tsx`, `src/features/pages/about-page/sub-sections/leaders-section.tsx` |
| `src/hooks/queries.ts` | 6 | `src/app/(public)/(store-sync)/catalog/page.tsx`, `src/app/(public)/(store-sync)/catalog/[productId]/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx`, `src/app/(public)/(store-sync)/orders/page.tsx`, `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx`, `src/components/shared/product-detail.tsx` |
| `src/hooks/use-session.ts` | 6 | `src/app/(public)/(store-sync)/checkout/page.tsx`, `src/app/(public)/(store-sync)/orders/page.tsx`, `src/app/(public)/(store-sync)/orders/[orderId]/page.tsx`, `src/app/(public)/(store-sync)/profile/page.tsx`, `src/components/shared/header.tsx`, `src/components/shared/store-auth-gate.tsx` |
| `src/config/admin/parent-admin-access.ts` | 5 | `src/app/admin/page.tsx`, `src/config/admin/parent-admin-layout-static.ts`, `src/features/admin-auth/sign-in-form.tsx`, `src/lib/admin/auth-routes.ts`, `src/providers/admin/auth-provider.tsx` |
| `src/features/pages/home-page/sub-sections/scroll-indicator.tsx` | 5 | `src/features/pages/home-page/sub-sections/about-hub-section.tsx`, `src/features/pages/home-page/sub-sections/guide-register-section.tsx`, `src/features/pages/home-page/sub-sections/hero-section.tsx`, `src/features/pages/home-page/sub-sections/index.ts`, `src/features/pages/home-page/sub-sections/overview-section.tsx` |
| `src/providers/admin/auth-provider.tsx` | 5 | `src/app/admin/admin-runtime-bridge.tsx`, `src/app/admin/layout.tsx`, `src/features/admin-auth/sign-in-form.tsx`, `src/providers/admin/admin-realtime-sync.tsx`, `src/providers/admin/parent-admin-layout.tsx` |
| `src/features/pages/home-page/constants.ts` | 4 | `src/features/pages/home-page/data.tsx`, `src/features/pages/home-page/sub-sections/about-hub-section.tsx`, `src/features/pages/home-page/sub-sections/featured-posts-section.tsx`, `src/features/pages/home-page/sub-sections/guide-register-section.tsx` |
| `src/lib/admin/auth-session.ts` | 4 | `src/config/admin/parent-admin-layout-static.ts`, `src/lib/admin/api.ts`, `src/providers/admin/auth-provider.tsx`, `src/providers/admin/parent-admin-layout.tsx` |
| `src/features/auth/admin-bridge.ts` | 3 | `src/components/shared/footer.tsx`, `src/features/pages/home-page/constants.ts`, `src/features/pages/home-page/sub-sections/hero-section.tsx` |
| `src/features/pages/home-page/sub-sections/contact-section.tsx` | 3 | `src/app/(public)/lien-he/page.tsx`, `src/features/pages/home-page/home-client.tsx`, `src/features/pages/home-page/sub-sections/index.ts` |
| `src/lib/admin/auth-routes.ts` | 3 | `src/config/admin/parent-admin-layout-static.ts`, `src/features/admin-auth/register-form.tsx`, `src/providers/admin/auth-provider.tsx` |
| `src/lib/gift-rules-from-fulfillment-note.ts` | 3 | `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-line-item.tsx`, `src/components/shared/product-detail.tsx` |
| `src/lib/store-feature.ts` | 3 | `src/app/(public)/layout.tsx`, `src/components/shared/header.tsx`, `src/proxy.ts` |
| `src/components/icons/logo.tsx` | 2 | `src/components/shared/footer.tsx`, `src/components/shared/header.tsx` |
| `src/components/shared/cart-drawer.tsx` | 2 | `src/app/(public)/layout.tsx`, `src/components/shared/header.tsx` |
| `src/components/shared/cart-line-item.tsx` | 2 | `src/app/(public)/(store-sync)/cart/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx` |
| `src/components/shared/cart-order-summary.tsx` | 2 | `src/app/(public)/(store-sync)/cart/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx` |
| `src/components/shared/store-auth-gate.tsx` | 2 | `src/app/(public)/(store-sync)/layout.tsx`, `src/app/(public)/layout.tsx` |
| `src/features/pages/about-page/about-client.tsx` | 2 | `src/features/pages/about-page/about.tsx`, `src/features/pages/about-page/sub-sections/index.ts` |
| `src/features/pages/about-page/utils.tsx` | 2 | `src/features/pages/about-page/sub-sections/core-values-section.tsx`, `src/features/pages/about-page/sub-sections/education-philosophy-section.tsx` |

## `src/common/` — tiện ích dùng chung

- (không có file common in-degree ≥ 2)

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` → `pnpm graphify:ai-summary`.
