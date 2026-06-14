# Bán kính ảnh hưởng import — packages/api-client (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.606Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/client.ts` | 44 | `src/index.ts`, `src/resources/academic-years.ts`, `src/resources/accounts.ts`, `src/resources/auth-admin.ts`, `src/resources/cameras.ts`, `src/resources/carts.ts` |
| `src/resources/_shared.ts` | 41 | `src/index.ts`, `src/resources/academic-years.ts`, `src/resources/accounts.ts`, `src/resources/auth-admin.ts`, `src/resources/cameras.ts`, `src/resources/carts.ts` |
| `src/types/dev-login.ts` | 4 | `src/index.ts`, `src/resources/auth-admin.ts`, `src/resources/dev-login.ts`, `src/resources/public.ts` |
| `src/realtime/types.ts` | 3 | `src/realtime/index.ts`, `src/realtime/notifications.ts`, `src/realtime/toast-coordinator.ts` |
| `src/resources/dev-login.ts` | 3 | `src/index.ts`, `src/resources/auth-admin.ts`, `src/resources/public.ts` |
| `src/sdk.ts` | 3 | `src/index.ts`, `src/realtime/paths.ts`, `src/storefront-sdk.ts` |
| `src/permissions.ts` | 2 | `src/index.ts`, `src/role-templates/event-staff.ts` |
| `src/realtime/normalize-id.ts` | 2 | `src/realtime/notifications.ts`, `src/realtime/toast-coordinator.ts` |
| `src/realtime/notifications.ts` | 2 | `src/realtime/index.ts`, `src/realtime/toast-coordinator.ts` |
| `src/realtime/toast-coordinator.ts` | 2 | `src/realtime/index.ts`, `src/resources/_shared.ts` |
| `src/resources/academic-years.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/accounts.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/cameras.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/carts.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/categories.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/contact-requests.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/courses.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/dashboard.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/departments.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/event-checkins.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/event-checkouts.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/event-registrations.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/event-speakers.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/events.ts` | 2 | `src/index.ts`, `src/sdk.ts` |
| `src/resources/face-data.ts` | 2 | `src/index.ts`, `src/sdk.ts` |

## `src/common/` — tiện ích dùng chung

- (không có file common in-degree ≥ 2)

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/api-client` → `pnpm graphify:ai-summary`.
