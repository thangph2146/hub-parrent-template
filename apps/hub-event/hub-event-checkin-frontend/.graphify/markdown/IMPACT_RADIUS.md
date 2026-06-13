# Bán kính ảnh hưởng import — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.089Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/lib/public-events.ts` | 31 | `src/app/(site)/su-kien/[slug]/page.tsx`, `src/app/(site)/su-kien/_component/event-catalog-card.tsx`, `src/app/(site)/su-kien/_component/event-detail-hero.tsx`, `src/app/(site)/su-kien/_component/event-detail-overview.tsx`, `src/app/(site)/su-kien/_component/event-detail-registration-aside.tsx`, `src/app/(site)/su-kien/_component/event-detail-tabs.tsx` |
| `src/lib/event-portal-routes.ts` | 14 | `src/app/(auth)/dang-nhap/[role]/page.tsx`, `src/app/(auth)/guest/dang-nhap/page.tsx`, `src/app/(auth)/student/dang-nhap/page.tsx`, `src/app/(portal)/guest/page.tsx`, `src/app/(portal)/guest/profile/page.tsx`, `src/app/(portal)/student/page.tsx` |
| `src/lib/admin/api.ts` | 12 | `src/app/admin/admin-runtime-bridge.tsx`, `src/app/admin/new/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/[id]/page.tsx`, `src/app/admin/_component/event-registrations-live-table.tsx` |
| `src/lib/event-auth.ts` | 12 | `src/app/(site)/su-kien/_component/event-registration-panel.tsx`, `src/components/shared/header-access-cluster.tsx`, `src/components/shared/header-account-menu.tsx`, `src/components/shared/header-auth.tsx`, `src/components/shared/header-guest-access-menu.tsx`, `src/components/shared/header.tsx` |
| `src/app/(site)/_component/data.ts` | 9 | `src/app/(site)/su-kien/_component/events-featured-strip.tsx`, `src/app/(site)/_component/cta-section.tsx`, `src/app/(site)/_component/hero-product-mockup.tsx`, `src/app/(site)/_component/hero-section.tsx`, `src/app/(site)/_component/hero-stats-bar.tsx`, `src/app/(site)/_component/how-it-works-section.tsx` |
| `src/app/admin/_component/types.ts` | 9 | `src/app/admin/_component/columns.tsx`, `src/app/admin/_component/index.ts`, `src/app/admin/_component/_form/event-form-shell.tsx`, `src/app/admin/_component/_hooks/use-events-actions.ts`, `src/app/admin/_component/_live/event-attendance-sync.ts`, `src/app/admin/_component/_live/event-live-monitor-tab.tsx` |
| `src/components/shared/event-poster.tsx` | 8 | `src/app/(site)/su-kien/_component/event-catalog-card.tsx`, `src/app/(site)/su-kien/_component/event-detail-hero.tsx`, `src/app/(site)/su-kien/_component/event-featured-card.tsx`, `src/app/(site)/su-kien/_component/event-row-card.tsx`, `src/app/(site)/_component/event-showcase-card.tsx`, `src/app/(site)/_component/featured-event-spotlight.tsx` |
| `src/config/admin/checkin-admin-access.ts` | 8 | `src/components/shared/header-admin-link.tsx`, `src/components/shared/header-guest-access-menu.tsx`, `src/components/shared/header-staff-account-menu.tsx`, `src/config/admin/checkin-admin-layout-static.ts`, `src/config/admin/index.ts`, `src/features/admin-auth/sign-in-form.tsx` |
| `src/lib/admin/auth-session.ts` | 8 | `src/app/admin/_component/_live/use-event-attendance-socket.ts`, `src/components/shared/header-staff-account-menu.tsx`, `src/components/shared/use-admin-session.ts`, `src/config/admin/checkin-admin-layout-static.ts`, `src/lib/admin/api.ts`, `src/lib/checkin-session-exclusive.ts` |
| `src/lib/event-session.ts` | 8 | `src/config/event-portal-layout-static.ts`, `src/lib/api.ts`, `src/lib/checkin-session-exclusive.ts`, `src/lib/event-auth.ts`, `src/lib/event-portal-routes.ts`, `src/lib/event-registration.ts` |
| `src/app/admin/_component/_live/event-attendance-sync.ts` | 7 | `src/app/admin/_component/event-registrations-live-table.tsx`, `src/app/admin/_component/live-activity-columns.tsx`, `src/app/admin/_component/registration-attendance-actions.tsx`, `src/app/admin/_component/registration-columns.tsx`, `src/app/admin/_component/_live/event-attendance-provider.tsx`, `src/app/admin/_component/_live/event-live-monitor-tab.tsx` |
| `src/lib/my-registered-events.ts` | 7 | `src/features/my-registered-events/my-registered-events-bulk-actions.tsx`, `src/features/my-registered-events/my-registered-events-page.tsx`, `src/features/my-registered-events/my-registered-events-row-actions.tsx`, `src/features/my-registered-events/registration-status-badge.tsx`, `src/features/my-registered-events/types.ts`, `src/features/my-registered-events/utils.ts` |
| `src/providers/admin/auth-provider.tsx` | 7 | `src/app/admin/admin-runtime-bridge.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[id]/page.tsx`, `src/features/admin-auth/sign-in-form.tsx`, `src/providers/admin/admin-realtime-sync.tsx` |
| `src/app/admin/_component/utils.ts` | 6 | `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/[id]/page.tsx`, `src/app/admin/_component/event-detail-content-panel.tsx`, `src/app/admin/_component/registration-avatar-cell.tsx`, `src/app/admin/_component/_form/event-poster-field.tsx`, `src/app/admin/_component/_hooks/use-events-actions.ts` |
| `src/features/my-registered-events/types.ts` | 6 | `src/features/my-registered-events/columns.tsx`, `src/features/my-registered-events/index.ts`, `src/features/my-registered-events/my-registered-events-bulk-actions.tsx`, `src/features/my-registered-events/my-registered-events-row-actions.tsx`, `src/features/my-registered-events/my-registered-events-stat-cards.tsx`, `src/features/my-registered-events/_table/my-registered-events-table.tsx` |
| `src/lib/events-list-query.ts` | 6 | `src/app/(site)/su-kien/_component/events-filter-sidebar.tsx`, `src/app/(site)/su-kien/_component/events-list-panel.tsx`, `src/app/(site)/su-kien/_component/events-page-banner.tsx`, `src/app/(site)/su-kien/_component/events-page-client.tsx`, `src/app/(site)/su-kien/_component/events-search-form.tsx`, `src/hooks/use-events-catalog.ts` |
| `src/lib/registration-format.ts` | 5 | `src/app/(site)/su-kien/_component/event-catalog-card.tsx`, `src/app/(site)/su-kien/_component/event-detail-hero.tsx`, `src/app/(site)/su-kien/_component/event-detail-overview.tsx`, `src/app/(site)/su-kien/_component/event-registration-panel.tsx`, `src/features/my-registered-events/columns.tsx` |
| `src/lib/site-nav.ts` | 5 | `src/app/(site)/_component/hero-section.tsx`, `src/app/(site)/_component/intro-section.tsx`, `src/app/(site)/_component/landing-quick-actions.tsx`, `src/components/shared/footer.tsx`, `src/components/shared/header.tsx` |
| `src/app/admin/_component/_live/event-attendance-provider.tsx` | 4 | `src/app/admin/[id]/page.tsx`, `src/app/admin/_component/event-registrations-live-table.tsx`, `src/app/admin/_component/registration-attendance-actions.tsx`, `src/app/admin/_component/_live/event-live-monitor-tab.tsx` |
| `src/components/shared/use-admin-session.ts` | 4 | `src/components/shared/header-access-cluster.tsx`, `src/components/shared/header-admin-link.tsx`, `src/components/shared/header-guest-access-menu.tsx`, `src/components/shared/header-staff-account-menu.tsx` |
| `src/features/my-registered-events/utils.ts` | 4 | `src/features/my-registered-events/columns.tsx`, `src/features/my-registered-events/my-registered-events-bulk-actions.tsx`, `src/features/my-registered-events/my-registered-events-page.tsx`, `src/features/my-registered-events/_table/my-registered-events-table.tsx` |
| `src/lib/admin/admin-navigation.ts` | 4 | `src/app/admin/new/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/[id]/page.tsx` |
| `src/lib/admin/fetch-all-admin-list.ts` | 4 | `src/app/admin/[id]/edit/page.tsx`, `src/app/admin/_component/_query/use-event-sub-queries.ts`, `src/app/admin/_component/_query/use-events-queries.ts`, `src/lib/admin/cameras-query.ts` |
| `src/lib/api.ts` | 4 | `src/lib/event-registration.ts`, `src/lib/my-registered-events.ts`, `src/lib/public-events.ts`, `src/lib/student-profile.ts` |
| `src/app/admin/_component/_live/use-event-attendance-socket.ts` | 3 | `src/app/admin/_component/_live/event-attendance-provider.tsx`, `src/app/admin/_component/_live/event-attendance-sync.ts`, `src/app/admin/_component/_live/patch-registration-attendance-cache.ts` |

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
