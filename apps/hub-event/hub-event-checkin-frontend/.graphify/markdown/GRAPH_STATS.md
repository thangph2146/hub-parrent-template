# Thống kê graph — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-12T14:20:21.210Z` từ `../snapshot/graph.json` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.

## Nodes theo `type`

| type | Số |
|------|-----|
| `directory` | 104 |
| `ts` | 86 |
| `tsx` | 86 |
| `page` | 70 |
| `loading` | 36 |
| `layout` | 6 |
| `route-group` | 3 |
| `styles` | 1 |

## Links theo `relation`

| relation | Số |
|----------|-----|
| `contains` | 390 |
| `imports` | 356 |
| `assets` | 5 |
| `renders` | 4 |

## Top file theo số cạnh `imports` đi ra (out-degree)

Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”).

| File | Số cạnh imports |
|------|-----------------|
| `src/app/(site)/su-kien/_component/events-page-client.tsx` | 9 |
| `src/app/admin/[id]/page.tsx` | 9 |
| `src/app/admin/_component/index.ts` | 9 |
| `src/app/(site)/_component/landing-home.tsx` | 8 |
| `src/features/my-registered-events/index.ts` | 8 |
| `src/app/admin/page.tsx` | 7 |
| `src/app/admin/_component/_live/event-live-monitor-tab.tsx` | 7 |
| `src/features/my-registered-events/columns.tsx` | 7 |
| `src/features/my-registered-events/my-registered-events-page.tsx` | 7 |
| `src/app/(site)/su-kien/_component/event-detail-tabs.tsx` | 6 |
| `src/app/admin/[id]/edit/page.tsx` | 6 |
| `src/components/shared/header-access-cluster.tsx` | 6 |
| `src/app/(site)/su-kien/_component/event-detail-view.tsx` | 5 |
| `src/app/admin/_component/event-registrations-live-table.tsx` | 5 |
| `src/providers/admin/auth-provider.tsx` | 5 |
| `src/providers/admin/checkin-admin-layout.tsx` | 5 |
| `src/app/(site)/su-kien/_component/event-registration-panel.tsx` | 4 |
| `src/app/(site)/_component/hero-section.tsx` | 4 |
| `src/app/admin/layout.tsx` | 4 |
| `src/app/admin/_component/registration-attendance-actions.tsx` | 4 |

## Top file theo số cạnh `imports` đi vào (in-degree)

File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper).

| File | Số lần bị import |
|------|------------------|
| `src/lib/public-events.ts` | 31 |
| `src/lib/event-portal-routes.ts` | 14 |
| `src/lib/event-auth.ts` | 12 |
| `src/lib/admin/api.ts` | 12 |
| `src/app/(site)/_component/data.ts` | 9 |
| `src/app/admin/_component/types.ts` | 9 |
| `src/components/shared/event-poster.tsx` | 8 |
| `src/lib/admin/auth-session.ts` | 8 |
| `src/config/admin/checkin-admin-access.ts` | 8 |
| `src/lib/event-session.ts` | 8 |
| `src/providers/admin/auth-provider.tsx` | 7 |
| `src/app/admin/_component/_live/event-attendance-sync.ts` | 7 |
| `src/lib/my-registered-events.ts` | 7 |
| `src/lib/events-list-query.ts` | 6 |
| `src/app/admin/_component/utils.ts` | 6 |

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
