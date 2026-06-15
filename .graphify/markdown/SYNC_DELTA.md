# SYNC_DELTA — main API ↔ hub-event API (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.719Z` — so sánh domain `src/<tên>/` giữa `apps/main/api` và `apps/hub-event/api`, theo `api.sync-profile.json`.



Dev hàng ngày: sửa **`apps/main/api`** (+ `packages/api-server`). Deploy check-in: **`pnpm pull:checkin`**.

## Domain có trên cả hai (sau sync)

- `academic-years`
- `accounts`
- `admission-results`
- `auth`
- `cameras`
- `carts`
- `categories`
- `comments`
- `contact-requests`
- `courses`
- `dashboard`
- `departments`
- `event-checkins`
- `event-checkouts`
- `event-registrations`
- `event-speakers`
- `events`
- `face-data`
- `groups`
- `hanet`
- `imported-users`
- `locations`
- `majors`
- `messages`
- `notifications`
- `orders`
- `page-contents`
- `parent-students`
- `posts`
- `products`
- `promo-codes`
- `proxy-image`
- `public`
- `roles`
- `screens`
- `seo-metas`
- `sessions`
- `settings`
- `socket`
- `speakers`
- `students`
- `system`
- `tags`
- `templates`
- `training-levels`
- `training-systems`
- `uploads`
- `users`

## Domain chỉ main — loại trừ bởi `excludeDirs` (không sync sang check-in)

- (danh sách exclude trống)

## Domain chỉ hub-event (native check-in, không từ main)

- `data-test`

## Quy trình agent

1. Sửa logic API dùng chung → `apps/main/api` hoặc `packages/api-server`.
2. Chạy `pnpm pull:checkin` trước khi test/deploy line check-in.
3. File AUTO-GENERATED trên hub-event → xem [`apps/hub-event/api/.graphify/markdown/ENTRY_POINTS.md`](../apps/hub-event/api/.graphify/markdown/ENTRY_POINTS.md).
4. Bảng module admin ↔ API: [`TASK_INDEX.md`](TASK_INDEX.md).

## Làm mới

- `pnpm graphify:ai-summary`
