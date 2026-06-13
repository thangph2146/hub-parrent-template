# SYNC_DELTA — main API ↔ hub-event API (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.512Z` — so sánh domain `src/<tên>/` giữa `apps/main/api` và `apps/hub-event/api`, theo `api.sync-profile.json`.

> Hub-event check-in API — subset từ main: có users/roles/events; loại trừ store (products/orders/carts/promo), đào tạo, phụ huynh/SV.

Dev hàng ngày: sửa **`apps/main/api`** (+ `packages/api-server`). Deploy check-in: **`pnpm pull:checkin`**.

## Domain có trên cả hai (sau sync)

- `accounts`
- `auth`
- `cameras`
- `categories`
- `comments`
- `dashboard`
- `event-checkins`
- `event-checkouts`
- `event-registrations`
- `event-speakers`
- `events`
- `face-data`
- `hanet`
- `locations`
- `notifications`
- `page-contents`
- `posts`
- `proxy-image`
- `public`
- `roles`
- `screens`
- `seo-metas`
- `sessions`
- `settings`
- `socket`
- `speakers`
- `system`
- `tags`
- `templates`
- `testing`
- `uploads`
- `users`

## Domain chỉ main — loại trừ bởi `excludeDirs` (không sync sang check-in)

- `academic-years`
- `carts`
- `contact-requests`
- `courses`
- `departments`
- `groups`
- `imported-users`
- `majors`
- `messages`
- `orders`
- `parent-students`
- `products`
- `promo-codes`
- `students`
- `training-levels`
- `training-systems`

## Domain chỉ main — không có trên check-in (ngoài exclude list)

- `admission-results`

## Quy trình agent

1. Sửa logic API dùng chung → `apps/main/api` hoặc `packages/api-server`.
2. Chạy `pnpm pull:checkin` trước khi test/deploy line check-in.
3. File AUTO-GENERATED trên hub-event → xem [`apps/hub-event/api/.graphify/markdown/ENTRY_POINTS.md`](../apps/hub-event/api/.graphify/markdown/ENTRY_POINTS.md).
4. Bảng module admin ↔ API: [`TASK_INDEX.md`](TASK_INDEX.md).

## Làm mới

- `pnpm graphify:ai-summary`
