# Pre-Code Protocol For Agents

Tài liệu này là quy trình bắt buộc trước khi agent sửa code trong repo `hub-parent-template`.

Mục tiêu: agent phải hiểu kiến trúc microservice, docs feature, graph hiện tại, và boundary rule trước khi chỉnh source.

**Entry point:** [`AGENTS.md`](../../AGENTS.md) (bản đồ task → doc → folder).  
**Đường dẫn app:** dev hàng ngày `apps/main/*`; deploy qua `apps/hub-parent/*`, `apps/hub-event/*`, `apps/store-sync/*` — xem [`docs/MONOREPO_STRUCTURE.md`](../MONOREPO_STRUCTURE.md).

## 1. Luật bắt buộc

Trước khi sửa bất kỳ file code nào, agent phải đọc tài liệu theo đúng thứ tự bên dưới.

Nếu task liên quan một page/feature cụ thể, agent phải đọc docs feature trong `docs/pages/` trước khi mở hoặc sửa source chính của feature đó.

Agent phải thông báo ngắn gọn trong update đầu tiên rằng đã đọc hoặc sẽ đọc những tài liệu liên quan nào.

## 2. Thứ tự đọc tối thiểu

1. `docs/admin-pattern/README.md`
2. `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
3. `docs/admin-pattern/AGENTS_GUIDE.md`
4. `.graphify/markdown/SUMMARY_FOR_AI.md`
5. `pnpm graphify:brief --task "..."` (khuyến nghị) hoặc `.graphify/markdown/TASK_INDEX.md`
6. `packages/.graphify/markdown/SUMMARY_FOR_AI.md`
7. App Graphify summary tương ứng với phạm vi task:

| Phạm vi sửa | Graphify summary |
|-------------|------------------|
| Storefront (`@frontend`) | `apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md` |
| Admin main (`@backend`) | `apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md` |
| API main dev (`@api`) | `apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md` |
| Hub-parent API deploy | `apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md` |
| Check-in API | `apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md` |
| Check-in frontend | `apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md` (nếu có graphify) |
| Store Sync | `apps/store-sync/*/.graphify/markdown/SUMMARY_FOR_AI.md` |

8. File Graphify chi tiết theo chủ đề nếu cần:
   - `FOLDER_TREE.md` khi cần định vị route/module/file
   - `GRAPH_STATS.md` khi cần hiểu import hotspots
   - `apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md` khi sửa domain API hoặc import NestJS
   - `packages/.graphify/markdown/WORKSPACE_DEPS.md` khi sửa package workspace
9. Docs feature/page tương ứng trong `docs/pages/`, nếu có.
10. Source code cụ thể.

Không mở `apps/*/.graphify/snapshot/context.json` trừ khi cần trích đoạn source cụ thể từ snapshot.

## 3. Reading order bổ sung cho admin pages

Trước khi sửa **bất kỳ page admin nào** trong `apps/main/backend/src/app/` (hoặc page generate từ `@workspace/admin-app`), agent phải đọc `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` trước — tài liệu này định nghĩa pattern chuẩn (guard, header, layout grid, table actions, form) mà mọi page phải tuân thủ.

Check-in admin: logic CRUD trong `packages/admin-app`; app chỉ re-export generate — đọc thêm `docs/admin-pattern/ADMIN_APP_PACKAGE.md`.

## 4. Reference docs

Docs feature cho từng module đã được gộp vào file `docs/pages/README.md` và `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`. Các file task list riêng lẻ cũ đã được xoá.

Khi cần hiểu chi tiết về một module, agent đọc:

- `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` — pattern chuẩn cho mọi page admin
- `docs/pages/README.md` — kiến trúc file, import chuẩn, quy tắc
- App Graphify summaries + `FOLDER_TREE.md` để định vị file cụ thể

## 5. Boundary checklist trước khi sửa

Trước khi code, agent phải tự đối chiếu:

- **Admin components TUYỆT ĐỐI không tạo local** trong `apps/main/backend/src/`. Mọi component UI admin đều import từ `packages/ui` (`@ui/components/...`). Nếu thiếu, thêm vào `packages/ui/src/components/admin/`.
- Không import chéo source giữa `apps/*`.
- Next apps gọi API qua HTTP và `@workspace/api-client` — không tự viết `fetch` tới API.
- Entity, MikroORM, migrations, seeders, business logic database thuộc app API tương ứng (`apps/main/api` khi dev; deploy line qua sync).
- Logic dùng chung: `packages/admin-app` (admin CRUD), `packages/api-server` (API Nest scaffold check-in), các `@workspace/*` khác khi thật sự cần share.
- Không thêm dependency sai boundary vào `package.json`.
- Khi sửa API Nest: đọc `docs/api-pattern/README.md` (+ `packages/api-server/README.md` nếu sửa package hoặc hub-event generate).
- Khi sửa API client hoặc gọi API từ app: đọc `docs/api-client-pattern/README.md`.

## 6. Quy trình khi bắt đầu một task code

1. Xác định task thuộc app/package/feature nào (dùng bảng task trong `AGENTS.md` mục 3).
2. Đọc docs theo thứ tự trong tài liệu này.
3. Đọc docs feature trong `docs/pages/` nếu task là admin page/module.
4. Nếu task liên quan một package cụ thể, đọc tài liệu bổ trợ tương ứng (xem `AGENTS.md` mục 3 — Package doc).
5. Đọc Graphify files đúng chủ đề.
6. Trace import của file target và các API-client method liên quan.
7. Chỉ sửa code sau khi đã hiểu luồng dữ liệu đúng.
8. Sau khi sửa, chạy `pnpm check`.
9. Nếu đổi kiến trúc/module/routes đáng kể, chạy graphify update theo `AGENTS.md` rồi chạy `pnpm check:full`.

## 7. Khi làm việc với `parent-students`

Với mọi task liên quan `apps/main/backend/src/app/parent-students/**`, agent phải đọc:

1. `apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`
2. `apps/main/backend/.graphify/markdown/FOLDER_TREE.md`
3. `apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`
4. `packages/.graphify/markdown/SUMMARY_FOR_AI.md`
5. Source target trong `apps/main/backend/src/app/parent-students/**`
6. API client source liên quan trong `packages/api-client` hoặc import path tương ứng

Sau đó mới sửa component, hook, query, table, hoặc form của feature.
