# AI Docs Hub (hub-parent-template)

Thư mục này gom tài liệu Markdown tham chiếu chuyên sâu cho agent/AI khi cần hiểu kiến trúc và quy trình.

## Vai trò của folder này

- `docs/steps/` tại root là lộ trình chính cho agent.
- `docs/admin-pattern/` là bộ tài liệu tham khảo chi tiết về microservice, agent protocol, UX storefront và Graphify.
- `docs/pages/README.md` là reference kiến trúc file chuẩn cho admin modules.

## Tài liệu chính trong `admin-pattern`

- `PRE_CODE_PROTOCOL.md`: quy trình bắt buộc trước khi agent sửa code, gồm thứ tự đọc docs, mapping `docs/pages/`, boundary checklist.
- `MICROSERVICE_SYSTEM_MAP.md`: bản đồ kiến trúc + boundaries + checklist (API dùng **MikroORM**).
- `AGENTS_GUIDE.md`: hướng dẫn agent vận hành (đọc, kiểm tra, tự điều chỉnh).
- `FRONTEND_UX.md`: UX/UI storefront, nguồn palette (`apps/frontend/src/app/globals.css` ↔ `packages/ui`), a11y — **giữ nguyên** cách dùng `packages/*`.
- `ADMIN_PAGE_PATTERN.md`: pattern chuẩn cho mọi page admin trong `apps/backend` — guard, page header, layout grid, table actions, form pattern, common pitfalls.

## Bản đồ packages (`packages/`)

| Package              | Import name                    | Vai trò                                         | Runtime     | Doc                                                   |
| -------------------- | ------------------------------ | ----------------------------------------------- | ----------- | ----------------------------------------------------- |
| `ui/`                | `@workspace/ui`                | UI components (admin + site) + hooks + lib      | ✅          | `docs/ui-pattern/README.md` + `ADMIN_PAGE_PATTERN.md` |
| `api-client/`        | `@workspace/api-client`        | HTTP API client (fetch wrapper, SDK, resources) | ✅          | `docs/api-client-pattern/README.md`                   |
| `editor/`            | `@thangph2146/lexical-editor`  | Lexical rich text editor                        | ✅          | `packages/editor/README.md`                           |
| `logger/`            | `@workspace/logger`            | Dev logging (console output)                    | ✅          | `docs/logger-pattern/README.md`                       |
| `query-client/`      | `@workspace/query-client`      | TanStack Query setup                            | ✅          | `docs/query-client-pattern/README.md`                 |
| `eslint-config/`     | `@workspace/eslint-config`     | ESLint configs + service boundaries             | ❌ dev-only | config files                                          |
| `typescript-config/` | `@workspace/typescript-config` | tsconfig base configs                           | ❌ dev-only | config files                                          |

## Tài liệu bổ trợ theo chủ đề

- `docs/api-pattern/README.md` — kiến trúc API NestJS (khi sửa `apps/api`).
- `docs/api-client-pattern/README.md` — pattern gọi API qua `@workspace/api-client` (khi sửa `packages/api-client` hoặc gọi API từ app).
- `docs/steps/*.md` — lộ trình chính cho agent.
- `docs/pages/README.md` — kiến trúc file chuẩn cho admin modules.

## Lộ trình đề xuất

1. Đọc `docs/steps/step1_system_overview.md`.
2. Nếu cần biết chi tiết quy trình agent: đọc `docs/steps/step3_admin_pattern_docs.md`.
3. Khi task liên quan admin page backend: đọc `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md`.
4. Khi task liên quan API: đọc `docs/api-pattern/README.md`.
5. Khi task liên quan gọi API từ app/client: đọc `docs/api-client-pattern/README.md`.
6. Khi cần check import boundaries hoặc architecture: đọc `MICROSERVICE_SYSTEM_MAP.md`.

## Graphify theo service

- `apps/frontend/.graphify/markdown/SUMMARY_FOR_AI.md`
- `apps/backend/.graphify/markdown/SUMMARY_FOR_AI.md`
- `apps/api/.graphify/markdown/SUMMARY_FOR_AI.md`

Ưu tiên đọc `markdown/SUMMARY_FOR_AI.md` trước, chỉ mở `snapshot/context.json` khi cần trích đoạn cụ thể.
