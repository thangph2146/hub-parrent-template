# Thống kê graph — apps/hub-checkin/hub-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.607Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `directory` | 116 |
| `ts` | 82 |
| `page` | 80 |
| `tsx` | 76 |
| `loading` | 37 |
| `layout` | 7 |
| `route-group` | 3 |
| `styles` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `contains` | 400 |
| `imports` | 333 |
| `assets` | 5 |
| `renders` | 4 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/(site)/su-kien/_component/events-page-client.tsx` | 9 |
| `src/app/admin/[id]/page.tsx` | 9 |
| `src/components/admin/events/index.ts` | 9 |
| `src/app/(site)/_component/landing-home.tsx` | 8 |
| `src/app/admin/page.tsx` | 8 |
| `src/lib/site/index.ts` | 8 |
| `src/components/admin/events/_live/event-live-monitor-tab.tsx` | 7 |
| `src/components/shared/header-access-cluster.tsx` | 7 |
| `src/app/(site)/su-kien/_component/event-detail-tabs.tsx` | 6 |
| `src/app/admin/[id]/edit/page.tsx` | 6 |
| `src/app/(site)/su-kien/_component/event-detail-view.tsx` | 5 |
| `src/components/admin/events/event-registrations-live-table.tsx` | 5 |
| `src/providers/admin/auth-provider.tsx` | 5 |
| `src/providers/admin/checkin-admin-layout.tsx` | 5 |
| `src/app/(site)/su-kien/_component/event-registration-panel.tsx` | 4 |
| `src/app/(site)/_component/hero-section.tsx` | 4 |
| `src/app/admin/layout.tsx` | 4 |
| `src/app/admin/new/page.tsx` | 4 |
| `src/components/admin/events/registration-attendance-actions.tsx` | 4 |
| `src/components/admin/events/registration-columns.tsx` | 4 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/site/public-events.ts` | 29 |
| `src/lib/portal/event-portal-routes.ts` | 14 |
| `src/lib/admin/api.ts` | 12 |
| `src/config/admin/checkin-admin-access.ts` | 11 |
| `src/lib/portal/event-auth.ts` | 10 |
| `src/app/(site)/_component/data.ts` | 9 |
| `src/components/admin/events/types.ts` | 9 |
| `src/lib/portal/event-session.ts` | 9 |
| `src/components/shared/event-poster.tsx` | 8 |
| `src/lib/admin/auth-session.ts` | 8 |
| `src/lib/site/events-list-query.ts` | 7 |
| `src/providers/admin/auth-provider.tsx` | 7 |
| `src/components/admin/events/_live/event-attendance-sync.ts` | 7 |
| `src/lib/site/site-nav.ts` | 6 |
| `src/components/admin/events/utils.ts` | 6 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-checkin/hub-checkin-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
