# Bán kính ảnh hưởng import — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.374Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

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
| `src/features/pages/home-page/sub-sections/scroll-indicator.tsx` | 5 | `src/features/pages/home-page/sub-sections/about-hub-section.tsx`, `src/features/pages/home-page/sub-sections/guide-register-section.tsx`, `src/features/pages/home-page/sub-sections/hero-section.tsx`, `src/features/pages/home-page/sub-sections/index.ts`, `src/features/pages/home-page/sub-sections/overview-section.tsx` |
| `src/features/auth/admin-bridge.ts` | 4 | `src/components/shared/footer.tsx`, `src/components/shared/header.tsx`, `src/features/pages/home-page/constants.ts`, `src/features/pages/home-page/sub-sections/hero-section.tsx` |
| `src/features/pages/home-page/constants.ts` | 4 | `src/features/pages/home-page/data.tsx`, `src/features/pages/home-page/sub-sections/about-hub-section.tsx`, `src/features/pages/home-page/sub-sections/featured-posts-section.tsx`, `src/features/pages/home-page/sub-sections/guide-register-section.tsx` |
| `src/features/pages/home-page/sub-sections/contact-section.tsx` | 3 | `src/app/(public)/lien-he/page.tsx`, `src/features/pages/home-page/home-client.tsx`, `src/features/pages/home-page/sub-sections/index.ts` |
| `src/lib/gift-rules-from-fulfillment-note.ts` | 3 | `src/components/shared/cart-drawer.tsx`, `src/components/shared/cart-line-item.tsx`, `src/components/shared/product-detail.tsx` |
| `src/lib/store-feature.ts` | 3 | `src/app/(public)/layout.tsx`, `src/components/shared/header.tsx`, `src/proxy.ts` |
| `src/components/icons/logo.tsx` | 2 | `src/components/shared/footer.tsx`, `src/components/shared/header.tsx` |
| `src/components/shared/cart-drawer.tsx` | 2 | `src/app/(public)/layout.tsx`, `src/components/shared/header.tsx` |
| `src/components/shared/cart-line-item.tsx` | 2 | `src/app/(public)/(store-sync)/cart/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx` |
| `src/components/shared/cart-order-summary.tsx` | 2 | `src/app/(public)/(store-sync)/cart/page.tsx`, `src/app/(public)/(store-sync)/checkout/page.tsx` |
| `src/components/shared/store-auth-gate.tsx` | 2 | `src/app/(public)/(store-sync)/layout.tsx`, `src/app/(public)/layout.tsx` |
| `src/features/pages/about-page/about-client.tsx` | 2 | `src/features/pages/about-page/about.tsx`, `src/features/pages/about-page/sub-sections/index.ts` |
| `src/features/pages/about-page/utils.tsx` | 2 | `src/features/pages/about-page/sub-sections/core-values-section.tsx`, `src/features/pages/about-page/sub-sections/education-philosophy-section.tsx` |
| `src/features/pages/home-page/data.tsx` | 2 | `src/features/pages/home-page/home-client.tsx`, `src/features/pages/home-page/index.ts` |
| `src/features/pages/home-page/home-client.tsx` | 2 | `src/features/pages/home-page/home.tsx`, `src/features/pages/home-page/index.ts` |
| `src/features/pages/home-page/sub-sections/about-hub-section.tsx` | 2 | `src/features/pages/home-page/home-client.tsx`, `src/features/pages/home-page/sub-sections/index.ts` |
| `src/features/pages/home-page/sub-sections/content-card.tsx` | 2 | `src/features/pages/home-page/sub-sections/hero-section.tsx`, `src/features/pages/home-page/sub-sections/index.ts` |

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
