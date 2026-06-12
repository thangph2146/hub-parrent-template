# Step 4: Graphify Reading

Đây là bước dùng Graphify để định vị file, module và import boundaries trước khi mở source.

Bảng đường dẫn app đầy đủ: [`AGENTS.md`](../../AGENTS.md) mục 3 (Graphify).

## Các file Graphify cần đọc

1. `.graphify/markdown/SUMMARY_FOR_AI.md`
   - Bản đồ monorepo tổng.
   - Liên kết tới `packages/` và từng app `apps/*`.
2. `packages/.graphify/markdown/SUMMARY_FOR_AI.md`
   - Tóm tắt package chia sẻ trong workspace.
   - Dùng khi task liên quan `packages/*` hoặc chia sẻ logic.
3. App tương ứng với task (chỉ mở **một** hoặc vài app liên quan):

| Task | `SUMMARY_FOR_AI.md` |
|------|---------------------|
| Storefront | `apps/hub-parent/hub-parent-frontend/.graphify/markdown/` |
| Admin (dev) | `apps/main/backend/.graphify/markdown/` |
| API (dev) | `apps/main/api/.graphify/markdown/` |
| Check-in API | `apps/hub-event/api/.graphify/markdown/` |
| Check-in frontend | `apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/` |
| Store Sync | `apps/store-sync/api/.graphify/markdown/` (hoặc frontend tương ứng) |

## Dùng mục "Chỉ dẫn theo chủ đề"

Trong mỗi `SUMMARY_FOR_AI.md`, tìm phần:

- `FOLDER_TREE.md`
- `GRAPH_STATS.md`
- `API_DOMAIN_IMPORTS.md` (chỉ app API Nest)
- `WORKSPACE_DEPS.md` (packages)

Chọn tiếp theo dựa theo mục tiêu:

- Định vị file/route/module: dùng `FOLDER_TREE.md`.
- Hiểu điểm nóng import: mở `GRAPH_STATS.md`.
- Điều tra domain API / import NestJS: mở `API_DOMAIN_IMPORTS.md`.
- Xác nhận phụ thuộc package workspace: mở `WORKSPACE_DEPS.md`.

## Làm mới snapshot (khi đổi cấu trúc)

```bash
node script-system/graphify/graphify-update.cjs apps/main/api
node script-system/graphify/graphify-update.cjs apps/main/backend
node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend
pnpm graphify:ai-summary
```

Hoặc: `pnpm graphify:refresh` (sau khi đã chạy `graphify-update` cho app bị ảnh hưởng).

## Mục tiêu bước này

- Xác định chính xác app/module/dòng đọc cần mở.
- Giảm thiểu việc mở file không cần thiết.
- Hiểu được scope import và dependency boundaries.

## Ghi nhớ

- Tránh mở `apps/*/.graphify/snapshot/context.json` trừ khi cần trích đoạn cụ thể.
- Dùng Graphify summary trước, rồi mới mở source code cụ thể.
- Làm mới snapshot: `pnpm graphify:refresh` (xem `.graphify/README.md`).
