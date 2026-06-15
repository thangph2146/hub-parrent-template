# Bán kính ảnh hưởng import — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.458Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/lib/site/public-events.ts` | 29 | `src/app/(site)/su-kien/[slug]/page.tsx`, `src/app/(site)/su-kien/_component/event-catalog-card.tsx`, `src/app/(site)/su-kien/_component/event-detail-hero.tsx`, `src/app/(site)/su-kien/_component/event-detail-overview.tsx`, `src/app/(site)/su-kien/_component/event-detail-registration-aside.tsx`, `src/app/(site)/su-kien/_component/event-detail-tabs.tsx` |
| `src/lib/portal/event-portal-routes.ts` | 14 | `src/app/(auth)/dang-nhap/[role]/page.tsx`, `src/app/(auth)/guest/dang-nhap/page.tsx`, `src/app/(auth)/student/dang-nhap/page.tsx`, `src/app/(portal)/guest/page.tsx`, `src/app/(portal)/guest/profile/page.tsx`, `src/app/(portal)/student/page.tsx` |
| `src/lib/admin/api.ts` | 12 | `src/app/admin/admin-runtime-bridge.tsx`, `src/app/admin/new/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/[id]/page.tsx`, `src/components/admin/events/event-registrations-live-table.tsx` |
| `src/config/admin/checkin-admin-access.ts` | 11 | `src/app/admin/new/page.tsx`, `src/app/admin/page.tsx`, `src/components/shared/header-access-cluster.tsx`, `src/components/shared/header-admin-link.tsx`, `src/components/shared/header-guest-access-menu.tsx`, `src/components/shared/header-staff-account-menu.tsx` |
| `src/lib/portal/event-auth.ts` | 10 | `src/app/(site)/su-kien/_component/event-registration-panel.tsx`, `src/components/shared/header-access-cluster.tsx`, `src/components/shared/header-account-menu.tsx`, `src/components/shared/header-auth.tsx`, `src/components/shared/header-guest-access-menu.tsx`, `src/components/shared/header.tsx` |
| `src/app/(site)/_component/data.ts` | 9 | `src/app/(site)/su-kien/_component/events-featured-strip.tsx`, `src/app/(site)/_component/cta-section.tsx`, `src/app/(site)/_component/hero-product-mockup.tsx`, `src/app/(site)/_component/hero-section.tsx`, `src/app/(site)/_component/hero-stats-bar.tsx`, `src/app/(site)/_component/how-it-works-section.tsx` |
| `src/components/admin/events/types.ts` | 9 | `src/components/admin/events/columns.tsx`, `src/components/admin/events/index.ts`, `src/components/admin/events/_form/event-form-shell.tsx`, `src/components/admin/events/_hooks/use-events-actions.ts`, `src/components/admin/events/_live/event-attendance-sync.ts`, `src/components/admin/events/_live/event-live-monitor-tab.tsx` |
| `src/lib/portal/event-session.ts` | 9 | `src/config/portal/layout-static.ts`, `src/lib/portal/checkin-session-exclusive.ts`, `src/lib/portal/event-auth.ts`, `src/lib/portal/event-portal-routes.ts`, `src/lib/portal/index.ts`, `src/lib/site/api.ts` |
| `src/components/shared/event-poster.tsx` | 8 | `src/app/(site)/su-kien/_component/event-catalog-card.tsx`, `src/app/(site)/su-kien/_component/event-detail-hero.tsx`, `src/app/(site)/su-kien/_component/event-featured-card.tsx`, `src/app/(site)/su-kien/_component/event-row-card.tsx`, `src/app/(site)/_component/event-showcase-card.tsx`, `src/app/(site)/_component/featured-event-spotlight.tsx` |
| `src/lib/admin/auth-session.ts` | 8 | `src/components/admin/events/_live/use-event-attendance-socket.ts`, `src/components/shared/header-staff-account-menu.tsx`, `src/components/shared/use-admin-session.ts`, `src/config/admin/checkin-admin-layout-static.ts`, `src/lib/admin/api.ts`, `src/lib/portal/checkin-session-exclusive.ts` |
| `src/components/admin/events/_live/event-attendance-sync.ts` | 7 | `src/components/admin/events/event-registrations-live-table.tsx`, `src/components/admin/events/live-activity-columns.tsx`, `src/components/admin/events/registration-attendance-actions.tsx`, `src/components/admin/events/registration-columns.tsx`, `src/components/admin/events/_live/event-attendance-provider.tsx`, `src/components/admin/events/_live/event-live-monitor-tab.tsx` |
| `src/lib/site/events-list-query.ts` | 7 | `src/app/(site)/su-kien/_component/events-filter-sidebar.tsx`, `src/app/(site)/su-kien/_component/events-list-panel.tsx`, `src/app/(site)/su-kien/_component/events-page-banner.tsx`, `src/app/(site)/su-kien/_component/events-page-client.tsx`, `src/app/(site)/su-kien/_component/events-search-form.tsx`, `src/hooks/use-events-catalog.ts` |
| `src/providers/admin/auth-provider.tsx` | 7 | `src/app/admin/admin-runtime-bridge.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[id]/page.tsx`, `src/features/admin-auth/sign-in-form.tsx`, `src/providers/admin/admin-realtime-sync.tsx` |
| `src/components/admin/events/utils.ts` | 6 | `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/[id]/page.tsx`, `src/components/admin/events/event-detail-content-panel.tsx`, `src/components/admin/events/registration-avatar-cell.tsx`, `src/components/admin/events/_form/event-poster-field.tsx`, `src/components/admin/events/_hooks/use-events-actions.ts` |
| `src/lib/site/site-nav.ts` | 6 | `src/app/(site)/_component/hero-section.tsx`, `src/app/(site)/_component/intro-section.tsx`, `src/app/(site)/_component/landing-quick-actions.tsx`, `src/components/shared/footer.tsx`, `src/components/shared/header.tsx`, `src/lib/site/index.ts` |
| `src/lib/site/registration-format.ts` | 5 | `src/app/(site)/su-kien/_component/event-catalog-card.tsx`, `src/app/(site)/su-kien/_component/event-detail-hero.tsx`, `src/app/(site)/su-kien/_component/event-detail-overview.tsx`, `src/app/(site)/su-kien/_component/event-registration-panel.tsx`, `src/lib/site/index.ts` |
| `src/components/admin/events/_live/event-attendance-provider.tsx` | 4 | `src/app/admin/[id]/page.tsx`, `src/components/admin/events/event-registrations-live-table.tsx`, `src/components/admin/events/registration-attendance-actions.tsx`, `src/components/admin/events/_live/event-live-monitor-tab.tsx` |
| `src/components/shared/use-admin-session.ts` | 4 | `src/components/shared/header-access-cluster.tsx`, `src/components/shared/header-admin-link.tsx`, `src/components/shared/header-guest-access-menu.tsx`, `src/components/shared/header-staff-account-menu.tsx` |
| `src/lib/admin/admin-navigation.ts` | 4 | `src/app/admin/new/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/[id]/page.tsx` |
| `src/lib/admin/fetch-all-admin-list.ts` | 4 | `src/app/admin/[id]/edit/page.tsx`, `src/components/admin/events/_query/use-event-sub-queries.ts`, `src/components/admin/events/_query/use-events-queries.ts`, `src/lib/admin/cameras-query.ts` |
| `src/lib/portal/checkin-session-exclusive.ts` | 4 | `src/features/admin-auth/sign-in-form.tsx`, `src/lib/portal/event-auth.ts`, `src/lib/portal/index.ts`, `src/providers/admin/auth-provider.tsx` |
| `src/lib/site/api.ts` | 4 | `src/lib/site/event-registration.ts`, `src/lib/site/index.ts`, `src/lib/site/public-events.ts`, `src/providers/portal/runtime-bridge.tsx` |
| `src/lib/site/event-detail-content.ts` | 4 | `src/app/(site)/su-kien/_component/event-detail-tabs.tsx`, `src/components/admin/events/utils.ts`, `src/components/shared/event-content.tsx`, `src/lib/site/index.ts` |
| `src/components/admin/events/_live/use-event-attendance-socket.ts` | 3 | `src/components/admin/events/_live/event-attendance-provider.tsx`, `src/components/admin/events/_live/event-attendance-sync.ts`, `src/components/admin/events/_live/patch-registration-attendance-cache.ts` |
| `src/components/admin/events/registration-avatar-cell.tsx` | 3 | `src/app/admin/[id]/page.tsx`, `src/components/admin/events/live-activity-columns.tsx`, `src/components/admin/events/registration-columns.tsx` |

## `src/common/` — tiện ích dùng chung

- (không có file common in-degree ≥ 2)

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend` → `pnpm graphify:ai-summary`.
