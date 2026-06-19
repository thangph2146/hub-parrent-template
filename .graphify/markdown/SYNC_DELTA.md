# SYNC_DELTA — main API ↔ hub-checkin API (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.858Z` — so sánh domain `src/<tên>/` giữa `apps/main/api` và `apps/hub-checkin/api`, theo `api.sync-profile.json`.



Dev hàng ngày: sửa **`apps/main/api`** (+ `packages/api-server`). Deploy check-in: **`pnpm pull:checkin`**.

## Domain có trên cả hai (sau sync)

- `academic-years`
- `accounts`
- `admission-results`
- `auth`
- `cameras`
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
- `page-contents`
- `parent-students`
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

## Domain chỉ main — không có trên check-in (ngoài exclude list)

- `carts`
- `orders`
- `products`
- `promo-codes`

## Domain chỉ hub-checkin (native check-in, không từ main)

- `data-test`

## Quy trình agent

1. Sửa logic API dùng chung → `apps/main/api` hoặc `packages/api-server`.
2. Chạy `pnpm pull:checkin` trước khi test/deploy line check-in.
3. File AUTO-GENERATED trên hub-checkin → xem [`apps/hub-checkin/api/.graphify/markdown/ENTRY_POINTS.md`](../apps/hub-checkin/api/.graphify/markdown/ENTRY_POINTS.md).
4. Bảng module admin ↔ API: [`TASK_INDEX.md`](TASK_INDEX.md).

## Làm mới

- `pnpm graphify:ai-summary`
