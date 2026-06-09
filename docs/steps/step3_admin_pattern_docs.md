# Step 3: Hub Parent Docs

Đây là bước đọc các tài liệu `docs/admin-pattern/` để nắm quy trình và ranh giới microservice.

## Các file cần đọc

1. `docs/admin-pattern/README.md`
   - Giới thiệu mục đích của thư mục `docs/admin-pattern/`.
   - Làm rõ đây là bộ tài liệu cho AI/agent.
2. `docs/admin-pattern/PRE_CODE_PROTOCOL.md`
   - Quy trình bắt buộc trước khi sửa code.
   - Thứ tự đọc docs và mapping feature docs.
3. `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
   - Bản đồ kiến trúc dịch vụ.
   - Ranh giới giữa `apps/api`, `apps/frontend`, `apps/backend`, và `packages/*`.
4. `docs/admin-pattern/AGENTS_GUIDE.md`
   - Hướng dẫn agent vận hành.
   - Quy trình đọc, code, kiểm tra, và tự điều chỉnh.
5. `docs/admin-pattern/FRONTEND_UX.md`
   - Chỉ cần đọc khi nhiệm vụ liên quan `apps/frontend`.
   - UX, a11y, và quy tắc UI storefront.
6. `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`
   - Bắt buộc khi sửa bất kỳ page nào trong `apps/backend/`.
   - Pattern chuẩn: guard, page header, layout grid, table actions, form pattern, common pitfalls.
7. `docs/api-pattern/README.md`
   - Đọc khi sửa `apps/api` (controller, service, entity, common utilities).
8. `docs/api-client-pattern/README.md`
   - Đọc khi sửa `packages/api-client` hoặc gọi API từ app (ApiClient, resource classes, SDK).

## Mục tiêu bước này

- Xác định đúng phạm vi của task: app, package, feature.
- Hiểu rõ ranh giới không import chéo giữa `apps/*`.
- Hiểu các quy tắc agent phải tuân thủ khi đọc, sửa và kiểm tra.
- Đọc `ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md` khi cần reference cho admin pages.
- Đọc `docs/api-pattern/README.md` khi cần reference cho API.
- Đọc `docs/api-client-pattern/README.md` khi cần reference cho API client.
- Nắm bản đồ packages: `@workspace/ui` (UI), `@workspace/api-client` (API calls), `@thangph2146/lexical-editor` (editor), `@workspace/logger` (log), `@workspace/query-client` (query), `@workspace/eslint-config` (lint), `@workspace/typescript-config` (tsconfig).
- Mỗi package có doc riêng: `docs/ui-pattern/README.md`, `docs/api-client-pattern/README.md`, `docs/logger-pattern/README.md`, `docs/query-client-pattern/README.md`, `packages/editor/README.md`.

## Gợi ý

- Nếu sửa `apps/frontend`, hãy đọc thêm `FRONTEND_UX.md`.
- Nếu task là admin page/backend, bắt buộc đọc `ADMIN_PAGE_PATTERN.md` trước.
- Nếu task sửa `apps/api`, đọc `docs/api-pattern/README.md`.
- Nếu task gọi API từ app, đọc `docs/api-client-pattern/README.md`.
- Nếu task dùng editor, đọc `packages/editor/README.md` (cần build trước).
- Không sửa code trước khi đã đọc ít nhất `PRE_CODE_PROTOCOL.md` và `MICROSERVICE_SYSTEM_MAP.md`.
