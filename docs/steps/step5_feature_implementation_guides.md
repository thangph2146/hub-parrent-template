# Step 5: Feature Implementation Reference

Đây là bước đọc tài liệu tham chiếu cho feature implementation — gồm admin pages, API pattern, và API client pattern.

## Các file chính

### Admin pages (apps/backend)

1. `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` — pattern chuẩn cho mọi page admin (guard, header, layout, table actions, confirm dialog, upload)
2. `docs/pages/README.md` — kiến trúc file chuẩn (`_component/`, `_hooks/`, `_query/`, ...) và import rule
3. Graphify summaries + `FOLDER_TREE.md` của `apps/backend` — định vị file/module cụ thể

### API (apps/api)

4. `docs/api-pattern/README.md` — kiến trúc NestJS: controller, service, entity, common utilities

### API Client (packages/api-client)

5. `docs/api-client-pattern/README.md` — pattern gọi API qua `@workspace/api-client`: `StoreSyncSdk`, `ApiClient`, resource classes

### Workspace Packages

6. `packages/` — bản đồ packages:
   - `@workspace/ui` → UI components (admin + site)
   - `@workspace/api-client` → API client SDK
   - `@thangph2146/lexical-editor` → Lexical editor (cần build trước)
   - `@workspace/logger` → dev logging
   - `@workspace/query-client` → TanStack Query setup
   - `@workspace/eslint-config` + `@workspace/typescript-config` → dev configs

## Mục tiêu bước này

- Hiểu cấu trúc page, form, bảng, và flow implement.
- Nắm pattern chuẩn để không tạo code ngoài `packages/`:
  - **UI**: `@workspace/ui` — không tạo local admin/site components
  - **API calls**: `@workspace/api-client` — không tự viết fetch
  - **Editor**: `@thangph2146/lexical-editor` — không tự build editor UI
  - **Logger/Query**: `@workspace/logger`, `@workspace/query-client` — dùng khi cần
- Async Admin components từ `@ui`, confirm dialog dùng `AdminCrudConfirmDialog`, upload dùng `uploadAdminImage`, action buttons dùng preset
- API endpoint ở `apps/api` theo pattern controller → service → entity
- Gọi API từ app qua `@workspace/api-client` — không tự viết fetch

## Cách dùng

1. Đọc `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` trước.
2. Đọc `docs/pages/README.md` để xem kiến trúc file + import chuẩn.
3. Nếu task cần sửa API: đọc `docs/api-pattern/README.md`.
4. Nếu task cần gọi API từ app: đọc `docs/api-client-pattern/README.md`.
5. Nếu task dùng editor: đọc `packages/editor/README.md`.
6. Nếu task dùng logger: đọc `docs/logger-pattern/README.md`.
7. Nếu task dùng query client: đọc `docs/query-client-pattern/README.md`.
8. Nếu task dùng UI components nói chung: đọc `docs/ui-pattern/README.md`.
9. Mở module qua Graphify `FOLDER_TREE.md` để xem cấu trúc thực tế.
10. Sửa code theo pattern đã học.
