# Điểm vào (entry) — apps/hub-event/api (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.232Z` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).

## Bootstrap / root

- `src/app.module.ts`
- `src/main.ts`

## Nest modules (`*.module.ts`) — 32 file

- `src/accounts/accounts.module.ts`
- `src/auth/auth.module.ts`
- `src/cameras/cameras.module.ts`
- `src/categories/categories.module.ts`
- `src/comments/comments.module.ts`
- `src/dashboard/dashboard.module.ts`
- `src/event-checkins/event-checkins.module.ts`
- `src/event-checkouts/event-checkouts.module.ts`
- `src/event-registrations/event-registrations.module.ts`
- `src/event-speakers/event-speakers.module.ts`
- `src/events/events.module.ts`
- `src/face-data/face-data.module.ts`
- `src/hanet/hanet.module.ts`
- `src/locations/locations.module.ts`
- `src/mikro-orm/mikro-orm.module.ts`
- `src/notifications/notifications.module.ts`
- `src/page-contents/page-contents.module.ts`
- `src/posts/posts.module.ts`
- `src/proxy-image/proxy-image.module.ts`
- `src/public/public.module.ts`
- `src/roles/roles.module.ts`
- `src/screens/screens.module.ts`
- `src/seo-metas/seo-metas.module.ts`
- `src/sessions/sessions.module.ts`
- `src/settings/settings.module.ts`
- `src/socket/socket.module.ts`
- `src/speakers/speakers.module.ts`
- `src/system/system.module.ts`
- `src/tags/tags.module.ts`
- `src/templates/templates.module.ts`
- `src/uploads/uploads.module.ts`
- `src/users/users.module.ts`

## Controllers (`*.controller.ts`) — 31 file

- `src/accounts/accounts.controller.ts`
- `src/auth/auth.controller.ts`
- `src/cameras/cameras.controller.ts`
- `src/categories/categories.controller.ts`
- `src/comments/comments.controller.ts`
- `src/dashboard/dashboard.controller.ts`
- `src/event-checkins/event-checkins.controller.ts`
- `src/event-checkouts/event-checkouts.controller.ts`
- `src/event-registrations/event-registrations.controller.ts`
- `src/event-speakers/event-speakers.controller.ts`
- `src/events/events.controller.ts`
- `src/face-data/face-data.controller.ts`
- `src/hanet/hanet-webhook.controller.ts`
- `src/locations/locations.controller.ts`
- `src/notifications/notifications.controller.ts`
- `src/page-contents/page-contents.controller.ts`
- `src/posts/posts.controller.ts`
- `src/proxy-image/proxy-image.controller.ts`
- `src/public/public.controller.ts`
- `src/roles/roles.controller.ts`
- `src/screens/screens.controller.ts`
- `src/seo-metas/seo-metas.controller.ts`
- `src/sessions/sessions.controller.ts`
- `src/settings/settings.controller.ts`
- `src/speakers/speakers.controller.ts`
- `src/system/system.controller.ts`
- `src/tags/tags.controller.ts`
- `src/templates/templates.controller.ts`
- `src/uploads/public-uploads.controller.ts`
- `src/uploads/uploads.controller.ts`
- … và 1 controller khác

## AUTO-GENERATED (không sửa tay) — 91 file

Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`).

- `src/accounts/accounts.controller.ts`
- `src/accounts/accounts.module.ts`
- `src/accounts/accounts.service.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.module.ts`
- `src/auth/auth.service.ts`
- `src/cameras/cameras.controller.ts`
- `src/cameras/cameras.module.ts`
- `src/cameras/cameras.service.ts`
- `src/categories/categories.controller.ts`
- `src/categories/categories.module.ts`
- `src/categories/categories.service.ts`
- `src/comments/comments.controller.ts`
- `src/comments/comments.module.ts`
- `src/comments/comments.service.ts`
- `src/dashboard/dashboard.controller.ts`
- `src/dashboard/dashboard.module.ts`
- `src/dashboard/dashboard.service.ts`
- `src/event-checkins/event-checkins.controller.ts`
- `src/event-checkins/event-checkins.module.ts`
- `src/event-checkins/event-checkins.service.ts`
- `src/event-checkouts/event-checkouts.controller.ts`
- `src/event-checkouts/event-checkouts.module.ts`
- `src/event-checkouts/event-checkouts.service.ts`
- `src/event-registrations/event-registration-attendance.service.ts`
- `src/event-registrations/event-registrations.controller.ts`
- `src/event-registrations/event-registrations.module.ts`
- `src/event-registrations/event-registrations.service.ts`
- `src/event-speakers/event-speakers.controller.ts`
- `src/event-speakers/event-speakers.module.ts`
- `src/event-speakers/event-speakers.service.ts`
- `src/events/events.controller.ts`
- `src/events/events.module.ts`
- `src/events/events.service.ts`
- `src/face-data/face-data.controller.ts`
- … và 56 file khác

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-event/api` → `pnpm graphify:ai-summary`.
