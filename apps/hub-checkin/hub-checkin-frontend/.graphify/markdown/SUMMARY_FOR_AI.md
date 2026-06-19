# Next frontend (hub-checkin) — @hub-checkin/frontend — tóm tắt cho AI (Graphify)

> Tự động sinh từ `../snapshot/context.json` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).

- **projectRoot:** `D:/HUB/working/2026/monorepo-template/apps/hub-checkin/hub-checkin-frontend`
- **context.generatedAt:** 2026-06-19T01:42:22.602Z

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
- **Bán kính ảnh hưởng:** [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) — file in-degree cao + mẫu importer (sửa shared code).
- **Điểm vào:** [`ENTRY_POINTS.md`](ENTRY_POINTS.md) — bootstrap, module, route Next, AUTO-GENERATED.
- **Pattern lặp:** [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md) — boilerplate (loading, re-export generate).

## Thống kê
- **totalFiles:** 286
- **clientComponents:** 59

## Trang (pages) (80)
- `src/app/(auth)/dang-nhap/page.tsx`
- `src/app/(auth)/dang-nhap/[role]/page.tsx`
- `src/app/(auth)/guest/dang-nhap/page.tsx`
- `src/app/(auth)/student/dang-nhap/page.tsx`
- `src/app/(portal)/guest/events/page.tsx`
- `src/app/(portal)/guest/page.tsx`
- `src/app/(portal)/guest/profile/page.tsx`
- `src/app/(portal)/student/events/page.tsx`
- `src/app/(portal)/student/page.tsx`
- `src/app/(portal)/student/profile/page.tsx`
- `src/app/(site)/page.tsx`
- `src/app/(site)/su-kien/page.tsx`
- `src/app/(site)/su-kien/[slug]/page.tsx`
- `src/app/(site)/su-kien-cua-toi/page.tsx`
- `src/app/(site)/[slug]/page.tsx`
- `src/app/admin/cameras/new/page.tsx`
- `src/app/admin/cameras/page.tsx`
- `src/app/admin/cameras/[id]/edit/page.tsx`
- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/contact-requests/page.tsx`
- `src/app/admin/contact-requests/[id]/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/dormitory-checkin/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/hanet/avatar/page.tsx`
- `src/app/admin/hanet/checkin/page.tsx`
- `src/app/admin/hanet/dia-diem/page.tsx`
- `src/app/admin/hanet/ket-noi/page.tsx`
- `src/app/admin/hanet/nguoi/page.tsx`
- `src/app/admin/hanet/page.tsx`
- `src/app/admin/hanet/thiet-bi/page.tsx`
- `src/app/admin/hanet-avatars/page.tsx`
- `src/app/admin/locations/new/page.tsx`
- `src/app/admin/locations/page.tsx`
- `src/app/admin/locations/[id]/edit/page.tsx`
- `src/app/admin/locations/[id]/page.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/new/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/posts/new/page.tsx`
- `src/app/admin/posts/page.tsx`
- `src/app/admin/posts/[id]/edit/page.tsx`
- `src/app/admin/posts/[id]/page.tsx`
- `src/app/admin/profile/page.tsx`
- `src/app/admin/rbac/page.tsx`
- `src/app/admin/rbac/[id]/edit/page.tsx`
- `src/app/admin/rbac/[id]/page.tsx`
- `src/app/admin/register/page.tsx`
- `src/app/admin/screens/new/page.tsx`
- `src/app/admin/screens/page.tsx`
- `src/app/admin/screens/[id]/edit/page.tsx`
- `src/app/admin/screens/[id]/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/speakers/new/page.tsx`
- `src/app/admin/speakers/page.tsx`
- `src/app/admin/speakers/[id]/edit/page.tsx`
- `src/app/admin/speakers/[id]/page.tsx`
- `src/app/admin/staff/new/page.tsx`
- `src/app/admin/staff/page.tsx`
- `src/app/admin/staff/[id]/edit/page.tsx`
- `src/app/admin/staff/[id]/page.tsx`
- `src/app/admin/tags/new/page.tsx`
- `src/app/admin/tags/page.tsx`
- `src/app/admin/tags/[id]/edit/page.tsx`
- `src/app/admin/tags/[id]/page.tsx`
- `src/app/admin/templates/new/page.tsx`
- `src/app/admin/templates/page.tsx`
- `src/app/admin/templates/[id]/edit/page.tsx`
- `src/app/admin/templates/[id]/page.tsx`
- `src/app/admin/[id]/edit/page.tsx`
- `src/app/admin/[id]/page.tsx`

## Layout (7)
- `src/app/(auth)/layout.tsx`
- `src/app/(portal)/guest/layout.tsx`
- `src/app/(portal)/student/layout.tsx`
- `src/app/(site)/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/app/layout.tsx`
- `src/providers/portal/layout.tsx`

## Góc hệ thống (@hub-checkin/frontend) — đường dẫn gợi ý

- **Root layout:** `src/app/layout.tsx`

## Module map (không có nội dung file)

| File | Loại | Client | Exports | Imports |
|------|------|--------|---------|---------|
| `next.config.ts` | config | — | — | — |
| `package.json` | config | — | — | — |
| `src/app/(auth)/dang-nhap/[role]/page.tsx` | page | no |  | src/lib/auth-routes.ts, src/lib/portal/event-portal-routes.ts |
| `src/app/(auth)/dang-nhap/page.tsx` | page | no | DangNhapPage | src/features/auth/event-sign-in-form.tsx |
| `src/app/(auth)/guest/dang-nhap/page.tsx` | page | no |  | src/lib/auth-routes.ts, src/lib/portal/event-portal-routes.ts |
| `src/app/(auth)/layout.tsx` | layout | no | metadata, AuthLayout | src/components/shared/footer.tsx, src/components/shared/header.tsx |
| `src/app/(auth)/student/dang-nhap/page.tsx` | page | no |  | src/lib/auth-routes.ts, src/lib/portal/event-portal-routes.ts |
| `src/app/(portal)/guest/events/page.tsx` | page | no | metadata, default |  |
| `src/app/(portal)/guest/layout.tsx` | layout | no | GuestPortalLayout | src/app/(portal)/guest/page.tsx, src/providers/portal/layout.tsx, src/providers/portal/runtime-bridge.tsx |
| `src/app/(portal)/guest/page.tsx` | page | no | GuestPortalIndexPage | src/lib/portal/event-portal-routes.ts |
| `src/app/(portal)/guest/profile/page.tsx` | page | no | GuestProfileRedirectPage | src/lib/portal/event-portal-routes.ts |
| `src/app/(portal)/student/events/page.tsx` | page | no | metadata, default |  |
| `src/app/(portal)/student/layout.tsx` | layout | no | StudentPortalLayout | src/app/(portal)/student/page.tsx, src/providers/admin/query-provider.tsx, src/providers/portal/layout.tsx, src/providers/portal/runtime-bridge.tsx |
| `src/app/(portal)/student/page.tsx` | page | no | StudentPortalIndexPage | src/lib/portal/event-portal-routes.ts |
| `src/app/(portal)/student/profile/page.tsx` | page | no | metadata, default |  |
| `src/app/(site)/[slug]/page.tsx` | page | no |  | src/lib/site/public-events.ts |
| `src/app/(site)/_component/cta-section.tsx` | tsx | no | LandingCtaSection | src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/data.ts` | ts | no | LANDING_ROUTES, LANDING_HERO, LANDING_HERO_BADGES, LANDING_STATS, LANDING_MARQUEE_TAGS, LandingFeatureAccent, LandingFeature, LANDING_FEATURES, LANDING_STEPS, LANDING_INTRO |  |
| `src/app/(site)/_component/event-showcase-card.tsx` | tsx | no | EventShowcaseCard | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts |
| `src/app/(site)/_component/featured-event-spotlight.tsx` | tsx | no | FeaturedEventSpotlight | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts |
| `src/app/(site)/_component/hero-product-mockup.tsx` | tsx | yes | HeroProductMockup | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts, src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/hero-section.tsx` | tsx | yes | LandingHeroSection | src/app/(site)/_component/hero-product-mockup.tsx, src/lib/site/public-events.ts, src/lib/site/site-nav.ts, src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/hero-stats-bar.tsx` | tsx | no | HeroStatsBar | src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/how-it-works-section.tsx` | tsx | no | LandingHowItWorksSection | src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/intro-section.tsx` | tsx | no | LandingIntroSection | src/lib/site/site-nav.ts, src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/landing-feature-card.tsx` | tsx | no | LandingFeatureCard |  |
| `src/app/(site)/_component/landing-home.tsx` | tsx | no |  | src/app/(site)/_component/cta-section.tsx, src/app/(site)/_component/hero-section.tsx, src/app/(site)/_component/how-it-works-section.tsx, src/app/(site)/_component/intro-section.tsx, src/app/(site)/_ |
| `src/app/(site)/_component/landing-quick-actions.tsx` | tsx | no | LandingQuickActions | src/lib/site/site-nav.ts |
| `src/app/(site)/_component/marquee-section.tsx` | tsx | no | LandingMarqueeSection | src/app/(site)/_component/data.ts |
| `src/app/(site)/_component/upcoming-events-section.tsx` | tsx | no | LandingUpcomingEventsSection | src/app/(site)/_component/event-showcase-card.tsx, src/lib/site/public-events.ts, src/app/(site)/_component/data.ts |
| `src/app/(site)/layout.tsx` | layout | no | SiteLayout | src/app/(site)/page.tsx, src/components/shared/footer.tsx, src/components/shared/header.tsx |
| `src/app/(site)/page.tsx` | page | no | metadata, HomePage | src/app/(site)/_component/landing-home.tsx |
| `src/app/(site)/su-kien-cua-toi/page.tsx` | page | no | SuKienCuaToiRedirectPage | src/lib/portal/event-portal-routes.ts |
| `src/app/(site)/su-kien/[slug]/page.tsx` | page | no |  | src/app/(site)/su-kien/_component/event-detail-view.tsx, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-catalog-card.tsx` | tsx | no | EventCatalogCard | src/components/shared/event-poster.tsx, src/lib/site/registration-format.ts, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-detail-hero.tsx` | tsx | no | EventDetailHero | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts, src/lib/site/registration-format.ts |
| `src/app/(site)/su-kien/_component/event-detail-notice.tsx` | tsx | no | EventDetailNotice |  |
| `src/app/(site)/su-kien/_component/event-detail-overview.tsx` | tsx | no | EventDetailOverview | src/lib/site/registration-format.ts, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-detail-registration-aside.tsx` | tsx | yes | EventDetailRegistrationAside | src/lib/site/public-events.ts, src/app/(site)/su-kien/_component/event-registration-panel.tsx |
| `src/app/(site)/su-kien/_component/event-detail-tabs.tsx` | tsx | yes | EventDetailTabs | src/components/shared/event-content.tsx, src/lib/site/event-detail-content.ts, src/lib/site/public-events.ts, src/app/(site)/su-kien/_component/event-detail-overview.tsx, src/app/(site)/su-kien/_compo |
| `src/app/(site)/su-kien/_component/event-detail-view.tsx` | tsx | yes | EventDetailView | src/lib/site/public-events.ts, src/app/(site)/su-kien/_component/event-detail-hero.tsx, src/app/(site)/su-kien/_component/event-detail-notice.tsx, src/app/(site)/su-kien/_component/event-detail-regist |
| `src/app/(site)/su-kien/_component/event-featured-card.tsx` | tsx | no | EventFeaturedCard | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-registrants-section.tsx` | tsx | yes | EventRegistrantsSection | src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-registration-panel.tsx` | tsx | yes | EventRegistrationPanel | src/lib/portal/event-auth.ts, src/lib/site/event-registration.ts, src/lib/site/registration-format.ts, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-row-card.tsx` | tsx | no | EventRowCard | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/event-speakers-section.tsx` | tsx | no | EventSpeakersSection | src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/events-category-sections.tsx` | tsx | no | CategoryWithEvents, EventsCategorySections | src/lib/site/public-events.ts, src/app/(site)/su-kien/_component/event-row-card.tsx |
| `src/app/(site)/su-kien/_component/events-code-panel.tsx` | tsx | yes | EventsCodePanel |  |
| `src/app/(site)/su-kien/_component/events-featured-strip.tsx` | tsx | yes | EventsFeaturedStrip | src/app/(site)/su-kien/_component/event-featured-card.tsx, src/lib/site/public-events.ts, src/app/(site)/_component/data.ts |
| `src/app/(site)/su-kien/_component/events-filter-sidebar.tsx` | tsx | yes | EventsFilterSidebar | src/lib/site/public-events.ts, src/lib/site/events-list-query.ts |
| `src/app/(site)/su-kien/_component/events-list-panel.tsx` | tsx | yes | EventsListPanel | src/app/(site)/su-kien/_component/event-catalog-card.tsx, src/lib/site/events-list-query.ts, src/lib/site/public-events.ts |
| `src/app/(site)/su-kien/_component/events-page-banner.tsx` | tsx | yes | EventsPageBanner | src/app/(site)/su-kien/_component/events-search-form.tsx, src/lib/site/events-list-query.ts |
| `src/app/(site)/su-kien/_component/events-page-client.tsx` | tsx | yes | EventsPageClient | src/app/(site)/su-kien/_component/events-category-sections.tsx, src/app/(site)/su-kien/_component/events-code-panel.tsx, src/app/(site)/su-kien/_component/events-featured-strip.tsx, src/app/(site)/su- |
| `src/app/(site)/su-kien/_component/events-query-provider.tsx` | tsx | yes | EventsQueryProvider |  |
| `src/app/(site)/su-kien/_component/events-search-form.tsx` | tsx | yes | EventsSearchForm | src/lib/site/events-list-query.ts |
| `src/app/(site)/su-kien/page.tsx` | page | no | metadata, EventsListPage | src/app/(site)/su-kien/_component/events-page-client.tsx, src/app/(site)/su-kien/_component/events-query-provider.tsx |
| `src/app/admin/[id]/edit/loading.tsx` | loading | no | Loading |  |
| `src/app/admin/[id]/edit/page.tsx` | page | yes | EditEventPage | src/lib/admin/fetch-all-admin-list.ts, src/lib/admin/admin-navigation.ts, src/lib/admin/api.ts, src/components/admin/events, src/components/admin/events/utils.ts, src/hooks/admin/use-admin-edit-form-h |
| `src/app/admin/[id]/loading.tsx` | loading | no | Loading |  |
| `src/app/admin/[id]/page.tsx` | page | yes | EventDetailPage | src/lib/admin/admin-navigation.ts, src/providers/admin/auth-provider.tsx, src/lib/admin/api.ts, src/components/admin/events, src/components/admin/events/event-registrations-live-table.tsx, src/compone |
| `src/app/admin/admin-runtime-bridge.tsx` | tsx | yes | AdminRuntimeBridge | src/providers/admin/auth-provider.tsx, src/lib/admin/api.ts |
| `src/app/admin/cameras/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/cameras/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/cameras/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/cameras/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/cameras/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/cameras/new/page.tsx` | page | no | default |  |
| `src/app/admin/cameras/page.tsx` | page | no | default |  |
| `src/app/admin/categories/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/categories/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/categories/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/categories/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/categories/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/categories/new/page.tsx` | page | no | default |  |
| `src/app/admin/categories/page.tsx` | page | no | default |  |
| `src/app/admin/contact-requests/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/contact-requests/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/contact-requests/page.tsx` | page | no | default |  |
| `src/app/admin/dashboard/page.tsx` | page | no | default |  |
| `src/app/admin/data/page.tsx` | page | no | default |  |
| `src/app/admin/dormitory-checkin/page.tsx` | page | yes | DormCheckinAdminPage |  |
| `src/app/admin/file-storage/page.tsx` | page | no | default |  |
| `src/app/admin/guides/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/guides/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/guides/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/guides/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/guides/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/guides/new/page.tsx` | page | no | default |  |
| `src/app/admin/guides/page.tsx` | page | no | default |  |
| `src/app/admin/hanet-avatars/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/avatar/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/checkin/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/dia-diem/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/ket-noi/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/nguoi/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/page.tsx` | page | no | default |  |
| `src/app/admin/hanet/thiet-bi/page.tsx` | page | no | default |  |
| `src/app/admin/layout.tsx` | layout | no | AdminCheckinLayout | src/app/admin/page.tsx, src/providers/admin/query-provider.tsx, src/providers/admin/auth-provider.tsx, src/providers/admin/checkin-admin-layout.tsx, src/app/admin/admin-runtime-bridge.tsx |
| `src/app/admin/locations/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/locations/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/locations/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/locations/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/locations/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/locations/new/page.tsx` | page | no | default |  |
| `src/app/admin/locations/page.tsx` | page | no | default |  |
| `src/app/admin/login/page.tsx` | page | no | CheckinAdminLoginPage | src/features/admin-auth/sign-in-form.tsx |
| `src/app/admin/new/loading.tsx` | loading | no | Loading |  |
| `src/app/admin/new/page.tsx` | page | yes | NewEventPage | src/lib/admin/admin-navigation.ts, src/config/admin/checkin-admin-access.ts, src/lib/admin/api.ts, src/components/admin/events |
| `src/app/admin/page.tsx` | page | yes | EventsPage | src/lib/admin/admin-navigation.ts, src/config/admin/checkin-admin-access.ts, src/hooks/admin/use-debounced-value.ts, src/providers/admin/auth-provider.tsx, src/lib/admin/api.ts, src/lib/admin, src/lib |
| `src/app/admin/posts/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/posts/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/posts/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/posts/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/posts/loading.tsx` | loading | no | default |  |
| `src/app/admin/posts/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/posts/new/page.tsx` | page | no | default |  |
| `src/app/admin/posts/page.tsx` | page | no | default |  |
| `src/app/admin/profile/page.tsx` | page | no | CheckinAdminProfilePage |  |
| `src/app/admin/rbac/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/rbac/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/rbac/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/rbac/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/rbac/page.tsx` | page | no | default |  |
| `src/app/admin/register/page.tsx` | page | no | CheckinAdminRegisterPage | src/features/admin-auth/register-form.tsx |
| `src/app/admin/screens/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/screens/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/screens/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/screens/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/screens/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/screens/new/page.tsx` | page | no | default |  |
| `src/app/admin/screens/page.tsx` | page | no | default |  |
| `src/app/admin/settings/_component/checkin-settings-presets.ts` | ts | no | CHECKIN_PRESET_ID, CHECKIN_SETTINGS_DISPLAY_PRESETS, CHECKIN_SETTINGS_SEO_PRESETS, getCheckinSettingsDisplayPreset, getCheckinSettingsSeoPreset |  |
| `src/app/admin/settings/page.tsx` | page | no | default |  |
| `src/app/admin/speakers/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/speakers/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/speakers/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/speakers/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/speakers/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/speakers/new/page.tsx` | page | no | default |  |
| `src/app/admin/speakers/page.tsx` | page | no | default |  |
| `src/app/admin/staff/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/staff/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/staff/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/staff/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/staff/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/staff/new/page.tsx` | page | no | default |  |
| `src/app/admin/staff/page.tsx` | page | no | default |  |
| `src/app/admin/tags/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/tags/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/tags/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/tags/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/tags/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/tags/new/page.tsx` | page | no | default |  |
| `src/app/admin/tags/page.tsx` | page | no | default |  |
| `src/app/admin/templates/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/admin/templates/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/admin/templates/[id]/loading.tsx` | loading | no | default |  |
| `src/app/admin/templates/[id]/page.tsx` | page | no | default |  |
| `src/app/admin/templates/new/loading.tsx` | loading | no | default |  |
| `src/app/admin/templates/new/page.tsx` | page | no | default |  |
| `src/app/admin/templates/page.tsx` | page | no | default |  |
| `src/app/globals.css` | styles | no |  |  |
| `src/app/layout.tsx` | layout | no | metadata, RootLayout |  |
| `src/components/admin/events/_alert-dialog/index.ts` | ts | no | EventsConfirmDialog |  |
| `src/components/admin/events/_form/event-form-shell.tsx` | tsx | yes | EventFormShellProps, EventFormShell | src/lib/admin/cameras-query.ts, src/components/admin/events/types.ts, src/components/admin/events/_form/event-poster-field.tsx, src/lib/admin/api.ts |
| `src/components/admin/events/_form/event-poster-field.tsx` | tsx | yes | EventPosterField | src/components/admin/events/utils.ts |
| `src/components/admin/events/_form/index.ts` | ts | no | EventFormShell | src/components/admin/events/_form/event-form-shell.tsx |
| `src/components/admin/events/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildEventPayload, useEventForm, useHandleConfirmAction, useConfirmAction | src/hooks/admin/use-table-filters.ts, src/components/admin/events/_hooks/use-events-actions.ts |
| `src/components/admin/events/_hooks/use-events-actions.ts` | ts | no | buildEventPayload, useEventForm, useHandleConfirmAction, useConfirmAction | src/components/admin/events/types.ts, src/components/admin/events/utils.ts |
| `src/components/admin/events/_live/event-attendance-provider.tsx` | tsx | yes | EventAttendanceProvider, useEventAttendanceContext | src/lib/admin/api.ts, src/components/admin/events/_query, src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/_live/use-event-attendance-socket.ts |
| `src/components/admin/events/_live/event-attendance-sync.ts` | ts | no | asAttendanceBool, mergeRegistrationRowsForDisplay, buildManualAttendancePayload, buildPayloadFromRegistrationRow, syncEventAttendanceUi, applyOptimisticRegistrationAttendance | src/components/admin/events/types.ts, src/components/admin/events/_live/patch-registration-attendance-cache.ts, src/components/admin/events/_live/use-event-attendance-socket.ts |
| `src/components/admin/events/_live/event-hanet-config-card.tsx` | tsx | yes | EventHanetCameraInfo, EventHanetConfigCard | src/lib/admin/hanet-webhook-url.ts |
| `src/components/admin/events/_live/event-live-monitor-tab.tsx` | tsx | yes | EventLiveMonitorTab | src/lib/admin/api.ts, src/components/admin/events/types.ts, src/components/admin/events/_query, src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/_live/event-atte |
| `src/components/admin/events/_live/patch-registration-attendance-cache.ts` | ts | no | patchRegistrationAttendanceCache | src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/_live/use-event-attendance-socket.ts |
| `src/components/admin/events/_live/use-event-attendance-socket.ts` | ts | yes | EVENT_ATTENDANCE_SOCKET_PATH, EventAttendanceSocketPayload, useEventAttendanceSocket, eventRegistrationsPollInterval | src/lib/admin/auth-session.ts |
| `src/components/admin/events/_query/index.ts` | ts | no | useEventDetailQuery, useEventsListQuery, useEventsTrashQuery, eventDetailQueryKey, prefetchEventDetail, useEventRegistrationsQuery, useEventCheckinsQuery, useEventCheckoutsQuery, useEventSpeakersQuery | src/components/admin/events/_query/use-events-queries.ts, src/components/admin/events/_query/use-event-sub-queries.ts |
| `src/components/admin/events/_query/use-event-sub-queries.ts` | ts | no | useEventRegistrationsQuery, useEventCheckinsQuery, useEventCheckoutsQuery, useEventSpeakersQuery | src/lib/admin/fetch-all-admin-list.ts, src/components/admin/events/_query/use-events-queries.ts |
| `src/components/admin/events/_query/use-events-queries.ts` | ts | no | EventLiveQueryOptions, eventDetailQueryKey, prefetchEventDetail, useEventDetailQuery, useEventsListQuery, UseTrashQueryProps, useEventsTrashQuery | src/lib/admin/admin-detail-query.ts, src/lib/admin/fetch-all-admin-list.ts, src/components/admin/events/types.ts |
| `src/components/admin/events/_table/events-table.tsx` | tsx | yes | EventsTableProps, EventsTable | src/components/admin/events/types.ts |
| `src/components/admin/events/_table/events-trash-table.tsx` | tsx | yes | EventsTrashTableProps, EventsTrashTable | src/components/admin/events/types.ts, src/lib/admin/api.ts, src/lib/admin/admin-trash-export.ts |
| `src/components/admin/events/_table/index.ts` | ts | no | EventsTable, EventsTrashTable | src/components/admin/events/_table/events-table.tsx, src/components/admin/events/_table/events-trash-table.tsx |
| `src/components/admin/events/attendance-status.tsx` | tsx | no | AttendanceRow, getAttendanceStatusLabel, AttendanceStatusBadge |  |
| `src/components/admin/events/columns.tsx` | tsx | yes | getEventColumns | src/lib/admin/admin-row-action-handlers.ts, src/lib/admin/admin-table-columns.tsx, src/components/admin/events/types.ts |
| `src/components/admin/events/event-detail-content-panel.tsx` | tsx | yes | EventDetailContentPanel | src/components/admin/events/utils.ts |
| `src/components/admin/events/event-registrations-live-table.tsx` | tsx | yes | EventRegistrationsLiveTable | src/lib/admin/api.ts, src/components/admin/events/_query, src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/_live/event-attendance-provider.tsx, src/components/ad |
| `src/components/admin/events/index.ts` | ts | no | eventFormSchema, getEventColumns, useEventDetailQuery, useEventsListQuery, useEventsTrashQuery, useEventRegistrationsQuery, useEventCheckinsQuery, useEventCheckoutsQuery, useEventSpeakersQuery, eventD | src/components/admin/events/types.ts, src/components/admin/events/columns.tsx, src/components/admin/events/_query, src/components/admin/events/_live/event-live-monitor-tab.tsx, src/components/admin/ev |
| `src/components/admin/events/live-activity-columns.tsx` | tsx | yes | EventLiveActivityKind, EventLiveActivityRow, checkinTypeLabel, buildLiveActivitiesFromRegistrations, getEventLiveActivityGlobalFilterText, getEventLiveActivityColumns | src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/registration-avatar-cell.tsx |
| `src/components/admin/events/registration-attendance-actions.tsx` | tsx | yes | RegistrationAttendanceActions | src/lib/admin/api.ts, src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/_live/event-attendance-provider.tsx, src/components/admin/events/attendance-status.tsx |
| `src/components/admin/events/registration-avatar-cell.tsx` | tsx | yes | resolveRegistrationAvatarUrl, resolveRowDisplayName, RegistrationAvatarCell | src/components/admin/events/utils.ts |
| `src/components/admin/events/registration-columns.tsx` | tsx | yes | EventRegistrationRow, getEventRegistrationGlobalFilterText, getEventRegistrationColumns | src/components/admin/events/attendance-status.tsx, src/components/admin/events/_live/event-attendance-sync.ts, src/components/admin/events/registration-attendance-actions.tsx, src/components/admin/eve |
| `src/components/admin/events/types.ts` | ts | no | EventRow, EventConfirmAction, eventFormSchema, EventFormValues, EventDetail, EventFormSpeaker |  |
| `src/components/admin/events/utils.ts` | ts | no | resolveEventDetailContent, getPosterUrlFromValue, buildPosterPayload, uploadEventPoster, isLexicalContentEmpty | src/lib/admin/admin-upload.ts, src/lib/site/event-detail-content.ts |
| `src/components/icons/logo.tsx` | tsx | no | Logo |  |
| `src/components/shared/event-content-renderer.tsx` | tsx | yes | EventContentRenderer |  |
| `src/components/shared/event-content.tsx` | tsx | yes | EventContent | src/lib/site/event-detail-content.ts |
| `src/components/shared/event-list-card.tsx` | tsx | no | EventListCard | src/components/shared/event-poster.tsx, src/lib/site/public-events.ts |
| `src/components/shared/event-poster.tsx` | tsx | no | EventPoster | src/lib/site/public-events.ts |
| `src/components/shared/footer.tsx` | tsx | no | Footer | src/components/icons/logo.tsx, src/lib/site/site-nav.ts |
| `src/components/shared/header-access-cluster.tsx` | tsx | yes | HeaderAccessCluster | src/components/shared/header-account-menu.tsx, src/components/shared/header-auth.tsx, src/components/shared/header-staff-account-menu.tsx, src/components/shared/use-admin-session.ts, src/components/sh |
| `src/components/shared/header-access-option-card.tsx` | tsx | yes | HeaderAccessOptionCardProps, HeaderAccessOptionCard | src/components/shared/header-action-tile.tsx |
| `src/components/shared/header-account-menu.tsx` | tsx | yes | HeaderAccountMenu | src/lib/portal/event-auth.ts |
| `src/components/shared/header-action-tile.tsx` | tsx | yes | HeaderActionTileVariant, HeaderActionTileProps, HeaderActionTile |  |
| `src/components/shared/header-admin-link.tsx` | tsx | yes | HeaderAdminLink | src/config/admin/checkin-admin-access.ts, src/components/shared/header-action-tile.tsx, src/components/shared/use-admin-session.ts |
| `src/components/shared/header-auth.tsx` | tsx | yes | HeaderAuth | src/components/shared/header-action-tile.tsx, src/lib/portal/event-auth.ts |
| `src/components/shared/header-guest-access-menu.tsx` | tsx | yes | HeaderGuestAccessOptions, HeaderGuestAccessDropdown | src/components/shared/header-access-option-card.tsx, src/config/admin/checkin-admin-access.ts, src/components/shared/use-admin-session.ts, src/lib/portal/event-auth.ts |
| `src/components/shared/header-staff-account-menu.tsx` | tsx | yes | HeaderStaffAccountMenu | src/config/admin/checkin-admin-access.ts, src/components/shared/use-admin-session.ts, src/lib/admin/auth-session.ts |
| `src/components/shared/header.tsx` | tsx | yes | Header | src/components/icons/logo.tsx, src/components/shared/header-access-cluster.tsx, src/lib/portal/event-auth.ts, src/lib/site/site-nav.ts |
| `src/components/shared/use-admin-session.ts` | ts | yes | useAdminSession | src/lib/admin/auth-session.ts |
| `src/config/admin/checkin-admin-access.ts` | ts | no | CHECKIN_ADMIN_BASE_PATH, CHECKIN_ADMIN_HOME_PATH, CHECKIN_ADMIN_LOGIN_PATH, CHECKIN_ADMIN_PROFILE_PATH, CHECKIN_ADMIN_REGISTER_PATH, CHECKIN_ADMIN_INDEX_PATH, CHECKIN_ADMIN_ENTRY_PERMISSIONS, hasAnyCh |  |
| `src/config/admin/checkin-admin-layout-static.ts` | ts | no | CHECKIN_ADMIN_LAYOUT_STATIC | src/config/admin/checkin-admin-menu-tree.tsx, src/config/admin/checkin-admin-access.ts, src/lib/admin/auth-session.ts, src/lib/admin/auth-routes.ts |
| `src/config/admin/checkin-admin-menu-tree.tsx` | tsx | no | CHECKIN_ADMIN_MENU_TREE |  |
| `src/config/admin/index.ts` | ts | no | CHECKIN_ADMIN_HOME_PATH, CHECKIN_ADMIN_LOGIN_PATH, CHECKIN_ADMIN_PROFILE_PATH, CHECKIN_ADMIN_ENTRY_PERMISSIONS, canAccessCheckinAdmin, canManageCheckinEvents, hasAnyCheckinAdminPermission, CHECKIN_ADM | src/config/admin/checkin-admin-access.ts, src/config/admin/checkin-admin-menu-tree.tsx, src/config/admin/checkin-admin-layout-static.ts |
| `src/config/admin/protected-admin.ts` | ts | no | isProtectedAdminEmail, canEditSuperAdminRole, canEditProtectedAdminUser |  |
| `src/config/portal/access.ts` | ts | no | EventPortalRole, CheckinPortalAppConfig, CheckinPortalShellPaths, getCheckinPortalAppConfig, buildCheckinPortalShellPaths, isCheckinPortalShellPath |  |
| `src/config/portal/index.ts` | ts | no | buildCheckinPortalShellPaths, getCheckinPortalAppConfig, isCheckinPortalShellPath, buildEventPortalLayoutStatic, canAccessEventPortal, getPortalSiteDescription, resolvePortalRoleFromUser, EVENT_LOGIN_ | src/config/portal/access.ts, src/config/portal/layout-static.ts, src/config/portal/menu-tree.tsx, src/config/portal/shared.ts |
| `src/config/portal/layout-static.ts` | ts | no | buildEventPortalLayoutStatic, getPortalSiteDescription, canAccessEventPortal, resolvePortalRoleFromUser, EVENT_LOGIN_PATH, isEventAuthPath, eventSessionToAuthUser | src/config/portal/menu-tree.tsx, src/config/portal/shared.ts, src/lib/portal/event-portal-routes.ts, src/lib/portal/event-session.ts |
| `src/config/portal/menu-tree.tsx` | tsx | no | buildEventPortalMenuTree | src/lib/portal/event-portal-routes.ts |
| `src/config/portal/shared.ts` | ts | no | eventLoginPath, isEventAuthPath, eventSessionToAuthUser, EVENT_LOGIN_PATH, clearEventSession | src/lib/portal/event-auth.ts, src/lib/portal/event-portal-routes.ts |
| `src/features/admin-auth/admin-bridge.ts` | ts | no | getAdminBaseUrl, buildAdminBridgeLoginUrl, getAdminLoginUrl |  |
| `src/features/admin-auth/auth-api.ts` | ts | no |  | src/lib/admin/api-base-url.ts |
| `src/features/admin-auth/index.ts` | ts | no | SignInForm, RegisterForm | src/features/admin-auth/sign-in-form.tsx, src/features/admin-auth/register-form.tsx |
| `src/features/admin-auth/register-form.tsx` | tsx | yes | RegisterForm | src/lib/admin/auth-routes.ts |
| `src/features/admin-auth/session.ts` | ts | no | StoreSessionPayload, toStoreSession, persistSession | src/features/admin-auth/auth-api.ts |
| `src/features/admin-auth/sign-in-form.tsx` | tsx | yes | SignInForm | src/config/admin/checkin-admin-access.ts, src/lib/portal/checkin-session-exclusive.ts, src/providers/admin/auth-provider.tsx |
| `src/features/auth/event-sign-in-form.tsx` | tsx | yes | EventSignInForm | src/components/icons/logo.tsx, src/lib/portal/event-auth.ts, src/lib/portal/event-portal-routes.ts, src/lib/site/student-email.ts |
| `src/hooks/admin/index.ts` | ts | no | useDebouncedValue, useAdminEditFormHydration, useAdminFormDraftPersistence, useAdminTableState | src/hooks/admin/use-debounced-value.ts, src/hooks/admin/use-admin-edit-form-hydration.ts, src/hooks/admin/use-admin-table-state.ts |
| `src/hooks/admin/queries.ts` | ts | no |  |  |
| `src/hooks/admin/use-admin-edit-form-hydration.ts` | ts | no |  |  |
| `src/hooks/admin/use-admin-mutation.ts` | ts | yes | useAdminMutation, adminToastMeta, createAdminMutationCache, defaultAdminOperationToast, defaultBulkOperationToast, resolveAdminOperationError, adminToastSuppressMeta, suppressRealtimeToastAfterMutatio |  |
| `src/hooks/admin/use-admin-realtime-sync.ts` | ts | no | useAdminRealtimeSync |  |
| `src/hooks/admin/use-admin-table-state.ts` | ts | no |  |  |
| `src/hooks/admin/use-debounced-value.ts` | ts | no |  |  |
| `src/hooks/admin/use-table-filters.ts` | ts | no |  |  |
| `src/hooks/use-events-catalog.ts` | ts | yes | eventsCatalogKeys, usePublicEventCategories, useFeaturedPublicEvents, usePublicEventsList, useEventCategorySections | src/lib/site/events-list-query.ts, src/lib/site/public-events.ts, src/app/(site)/su-kien/_component/events-category-sections.tsx |
| `src/lib/admin/admin-detail-query.ts` | ts | no |  |  |
| `src/lib/admin/admin-navigation.ts` | ts | no |  |  |
| `src/lib/admin/admin-realtime-query-map.ts` | ts | no |  |  |
| `src/lib/admin/admin-row-action-handlers.ts` | ts | no |  |  |
| `src/lib/admin/admin-socket.ts` | ts | no |  |  |
| `src/lib/admin/admin-storage-picker-adapters.ts` | ts | no |  |  |
| `src/lib/admin/admin-table-columns.tsx` | tsx | no |  |  |
| `src/lib/admin/admin-table-config.ts` | ts | no |  |  |
| `src/lib/admin/admin-trash-export.ts` | ts | no |  |  |
| `src/lib/admin/admin-upload.ts` | ts | no |  |  |
| `src/lib/admin/admin-uploads.ts` | ts | no |  |  |
| `src/lib/admin/admin-xlsx-export.ts` | ts | no |  |  |
| `src/lib/admin/api-base-url.ts` | ts | no |  |  |
| `src/lib/admin/api.ts` | ts | no | api, ApiError | src/lib/admin/api-base-url.ts, src/lib/admin/auth-session.ts |
| `src/lib/admin/auth-routes.ts` | ts | no | AUTH_LOGIN_PATH, AUTH_REGISTER_PATH, isCheckinAdminAuthPath, isAuthPath, getAdminAppHomeExternalPath, getAdminLoginExternalPath, CHECKIN_ADMIN_HOME_PATH, CHECKIN_ADMIN_LOGIN_PATH | src/config/admin/checkin-admin-access.ts |
| `src/lib/admin/auth-session.ts` | ts | no |  |  |
| `src/lib/admin/build-admin-filter-query.ts` | ts | no |  |  |
| `src/lib/admin/cameras-query.ts` | ts | no | CameraRow, CameraDetail, cameraDetailQueryKey, prefetchCameraDetail, useCamerasListQuery | src/lib/admin/admin-detail-query.ts, src/lib/admin/fetch-all-admin-list.ts |
| `src/lib/admin/category-icons.ts` | ts | no |  |  |
| `src/lib/admin/dev-demo-accounts.ts` | ts | no |  |  |
| `src/lib/admin/export-file-save.ts` | ts | no |  |  |
| `src/lib/admin/fetch-all-admin-list.ts` | ts | no |  |  |
| `src/lib/admin/format-admin-datetime.ts` | ts | no |  |  |
| `src/lib/admin/format.ts` | ts | no |  |  |
| `src/lib/admin/hanet-webhook-url.ts` | ts | no |  |  |
| `src/lib/admin/index.ts` | ts | no |  |  |
| `src/lib/admin/permission-labels.ts` | ts | no |  |  |
| `src/lib/admin/product-image-storage-stub.ts` | ts | no | ProductImageUploadContext, resolveProductImageFolderNav |  |
| `src/lib/admin/product-price.ts` | ts | no |  |  |
| `src/lib/auth-routes.ts` | ts | no | safeRelativeNext |  |
| `src/lib/portal/checkin-session-exclusive.ts` | ts | no | CheckinSessionKind, getCheckinSessionLabel, resolvePortalSessionKind, getActiveCheckinSessionKind, clearOtherCheckinSessions, CheckinLoginBlocked, assertCanLoginAs, assertCanLoginPortalAs | src/lib/admin/auth-session.ts, src/lib/portal/event-session.ts |
| `src/lib/portal/event-auth.ts` | ts | no | EventLoginKind, buildLoginHref, STUDENT_EMAIL_ERROR, isStudentSchoolEmail, isStudentSession, isGuestSession, isEventPortalSession, getMyEventsPath, getProfilePath, getEventAccountLabel, readEventSessi | src/lib/portal/event-session.ts, src/lib/portal/event-portal-routes.ts, src/lib/site/student-email.ts, src/lib/portal/checkin-session-exclusive.ts |
| `src/lib/portal/event-portal-routes.ts` | ts | no | EVENT_LOGIN_PATH, isEventPortalRole, resolveEventPortalRole, portalEventsPath, portalProfilePath, portalHomePath, portalLoginPath, resolveLoginRoleFromReturnPath, getMyEventsPath, getProfilePath, pars | src/config/portal/access.ts, src/lib/portal/event-session.ts |
| `src/lib/portal/event-session.ts` | ts | no | EventSessionUser, toEventSession, isStudentSession, isGuestSession, isEventPortalSession, getEventAccountLabel, readEventSession, writeEventSession, clearEventSession, subscribeEventSession, patchEven |  |
| `src/lib/portal/index.ts` | ts | no |  | src/lib/portal/event-auth.ts, src/lib/portal/event-portal-routes.ts, src/lib/portal/event-session.ts, src/lib/portal/checkin-session-exclusive.ts |
| `src/lib/site/api.ts` | ts | no | api, ApiError | src/lib/portal/event-session.ts |
| `src/lib/site/event-detail-content.ts` | ts | no | isSerializedEditorState, isLexicalContentEmpty, normalizeEventContentForDisplay, EventDetailContentDisplay, resolveEventDetailContent, hasEventDetailContent |  |
| `src/lib/site/event-registration.ts` | ts | no | RegisterEventResult, RegistrationWindowState, getRegistrationPeriodState, getRegistrationWindowState, isEventRegisterable | src/lib/site/api.ts, src/lib/portal/event-session.ts |
| `src/lib/site/events-list-query.ts` | ts | no | EventsListQuery, EventTimeFilterValue, parseRegisterable, toValidEventFilter, parseEventsListQuery, buildEventsHref |  |
| `src/lib/site/index.ts` | ts | no | api | src/lib/site/api.ts, src/lib/site/public-events.ts, src/lib/site/event-detail-content.ts, src/lib/site/event-registration.ts, src/lib/site/registration-format.ts, src/lib/site/events-list-query.ts, sr |
| `src/lib/site/public-events.ts` | ts | no | PublicEventItem, PublicViewerRegistration, PublicEventSpeaker, PublicEventRegistrant, PublicEventDetail, PublicEventCategoryItem, formatEventDate, EventTimeDateParts, formatEventTimeDateParts, formatE | src/lib/site/api.ts, src/lib/portal/event-session.ts |
| `src/lib/site/registration-format.ts` | ts | no | formatRange, FORMAT_LABELS | src/lib/site/public-events.ts |
| `src/lib/site/site-nav.ts` | ts | no | SITE_BRAND, NavItem, MY_EVENTS_NAV, MAIN_NAV, FOOTER_EVENT_LINKS, FOOTER_RESOURCE_LINKS, LANDING_QUICK_ACTIONS, isNavActive |  |
| `src/lib/site/student-email.ts` | ts | no | STUDENT_EMAIL_SUFFIX, STUDENT_EMAIL_ERROR, isStudentSchoolEmail, assertStudentSchoolEmail |  |
| `src/providers/admin/admin-realtime-sync.tsx` | tsx | yes | AdminRealtimeSync | src/providers/admin/auth-provider.tsx, src/hooks/admin/use-admin-realtime-sync.ts |
| `src/providers/admin/auth-provider.tsx` | tsx | yes | StaffLoginResult, AuthProvider, useAuth, useClientReady | src/config/admin/checkin-admin-access.ts, src/features/admin-auth/auth-api.ts, src/lib/admin/auth-session.ts, src/lib/admin/auth-routes.ts, src/lib/portal/checkin-session-exclusive.ts |
| `src/providers/admin/checkin-admin-layout.tsx` | tsx | yes | CheckinAdminLayoutProvider | src/lib/admin/api.ts, src/config/admin/checkin-admin-layout-static.ts, src/providers/admin/admin-realtime-sync.tsx, src/providers/admin/auth-provider.tsx, src/lib/admin/auth-session.ts |
| `src/providers/admin/query-provider.tsx` | tsx | yes | QueryProvider |  |
| `src/providers/portal/layout.tsx` | layout | yes | EventPortalLayoutProvider | src/config/portal/layout-static.ts, src/lib/portal/event-portal-routes.ts, src/lib/portal/event-auth.ts |
| `src/providers/portal/runtime-bridge.tsx` | tsx | yes | EventPortalRuntimeBridge | src/config/portal/access.ts, src/lib/site/api.ts, src/lib/portal/event-session.ts, src/config/portal/layout-static.ts |
| `src/types/admin/dashboard.ts` | ts | no |  |  |
| `tsconfig.json` | config | — | — | — |
## File Markdown trong scope app

Toàn bộ `.md` sinh tự động nằm trong **`apps/hub-checkin/hub-checkin-frontend/.graphify/markdown/`**; JSON trong **`../snapshot/`** — xem mục **Mục lục artefact Graphify** ở đầu file.

- **Chỉ mục monorepo + chủ đề:** [`../../../../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md).

## Làm mới

- Cập nhật `snapshot/context.json` **và** `snapshot/graph.json`: `node script-system/graphify/graphify-update.cjs apps/hub-checkin/hub-checkin-frontend`.
- Sau đó chạy: `pnpm graphify:ai-summary` (sinh thêm `FOLDER_TREE.md`, `GRAPH_STATS.md` khi có graph).
