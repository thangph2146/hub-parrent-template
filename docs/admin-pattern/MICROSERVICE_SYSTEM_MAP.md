# Microservice System Map (hub-parent-template)

Tài liệu này là bản đồ nhanh để AI/agent hiểu đúng kiến trúc microservice trong monorepo trước khi đọc code, chạy kiểm tra, và tự điều chỉnh.

## 1) Service Boundaries

| Service | Thư mục | Chức năng riêng | Không được chứa |
|---------|---------|-----------------|-----------------|
| `@api` | `apps/api` | NestJS REST/WS, MikroORM entity/migration/seed, RBAC, business rules | React, Next, fetch từ client |
| `@frontend` | `apps/frontend` | Storefront Next (HUB công khai), SSR/SEO trang public | DB, entity, admin CRUD logic |
| `@backend` | `apps/backend` | Admin Next, route/page theo domain, query hooks, wiring auth | Entity, MikroORM, component admin generic |
| `@hub-event-checkin-frontend` | `apps/hub-event-checkin-frontend` | Storefront check-in sự kiện (PM2 compo 2) | Cùng ranh giới như `@frontend` |

Nguyên tắc:

- Không import chéo source giữa các app trong `apps/*`.
- Mọi app Next gọi `@api` qua HTTP và `@workspace/api-client` (kể cả auth/public — dùng `AuthAdminApi` / `createAuthAdminApi`, không `fetch` rải rác).
- Component admin **generic** (`AdminQuickPresets`, `AdminConfigCopyButton`, `AdminRouteLoading`, dashboard charts, `LocationMap`…) thuộc `@workspace/ui` (dashboard/maps qua subpath, không barrel); app chỉ giữ page orchestration + domain columns/query + wiring realtime (`providers/admin-realtime-sync.tsx`).
- Logic/config dùng chung nhiều dự án → `packages/*` (không phụ thuộc runtime một app).

## 2) Shared Packages

| Package | Vai trò |
|---------|---------|
| `@workspace/api-client` | SDK HTTP tới `@api` — admin CRUD, `PublicApi` (storefront/check-in), `AuthAdminApi` |
| `@workspace/site-config` | Constant/preset composition (HUB Parent vs Check-in, OG image) — không React/DB |
| `@workspace/query-client` | `QueryClient` TanStack Query mặc định cho Next apps |
| `@workspace/ui` | Shell admin, data-table, presets, typography — dùng `@workspace/api-client` cho permission types |
| `@thangph2146/lexical-editor` | Editor Lexical (`packages/editor`) |
| `@workspace/logger` | Dev logging — dùng bởi api-client |
| `@workspace/eslint-config` | ESLint + `service-boundaries` |
| `@workspace/typescript-config` | tsconfig cơ sở |

## 3) Graphify — theo dõi kiến trúc cho AI

- **Chỉ mục monorepo:** `.graphify/markdown/SUMMARY_FOR_AI.md` (liên kết tới từng app + `packages/.graphify/markdown/`).
- **Chỉ dẫn theo chủ đề (AI):** mục *Chỉ dẫn theo chủ đề* trong `.graphify/markdown/SUMMARY_FOR_AI.md` — bảng *mục tiêu → file đọc trước*.
- **Danh sách package:** `packages/.graphify/markdown/SUMMARY_FOR_AI.md`.
- **Phụ thuộc `workspace:*`:** `packages/.graphify/markdown/WORKSPACE_DEPS.md`.
- **Từng dịch vụ:** `apps/<frontend|backend|api>/.graphify/markdown/SUMMARY_FOR_AI.md` (sinh từ `snapshot/context.json`).
- **Cây thư mục / thống kê graph:** `apps/<app>/.graphify/markdown/FOLDER_TREE.md`, `GRAPH_STATS.md`.
- **Phụ thuộc domain API:** `apps/api/.graphify/markdown/API_DOMAIN_IMPORTS.md` (bảng, inbound, Mermaid).
- Làm mới snapshot: `pnpm graphify:refresh` (hoặc `node scripts/graphify-update.cjs apps/<app>` rồi `pnpm graphify:ai-summary`) từ root.
- **Checklist sau chuẩn hóa:** `.graphify/README.md` (mục *Checklist sau chuẩn hóa / refactor kiến trúc*).

## 4) Thứ Tự Đọc Khuyến Nghị Cho AI

1. `.graphify/markdown/SUMMARY_FOR_AI.md` (bản đồ tổng + link)
2. `packages/.graphify/markdown/SUMMARY_FOR_AI.md`
3. `apps/frontend/.graphify/markdown/SUMMARY_FOR_AI.md`
4. `apps/backend/.graphify/markdown/SUMMARY_FOR_AI.md`
5. `apps/api/.graphify/markdown/SUMMARY_FOR_AI.md`
6. `packages/eslint-config/service-boundaries.js`
7. `scripts/verify-service-boundaries.mjs`
8. File source cụ thể liên quan task

Lưu ý:

- Tránh đọc toàn bộ `apps/*/.graphify/snapshot/context.json` nếu chưa cần, vì file lớn và nhúng full source.
- Dùng `SUMMARY_FOR_AI.md` để định vị module trước, sau đó mở đúng file mục tiêu.
- Cây `src/` và phụ thuộc domain API (import chéo): `apps/<app>/.graphify/markdown/FOLDER_TREE.md`, `apps/api/.graphify/markdown/API_DOMAIN_IMPORTS.md`.
- Thống kê graph (điểm nóng import): `apps/<app>/.graphify/markdown/GRAPH_STATS.md`.
- Chỉ dẫn theo chủ đề: mục **Chỉ dẫn theo chủ đề** trong `.graphify/markdown/SUMMARY_FOR_AI.md`; phụ thuộc `workspace:*`: `packages/.graphify/markdown/WORKSPACE_DEPS.md`.

## 5) Quy Trình Kiểm Tra Chuẩn

Chạy ở root repo:

```bash
pnpm check
```

Bao gồm:

- `pnpm verify:bounds`: kiểm tra phụ thuộc chéo sai trong `package.json`.
- `pnpm verify:sdk-http`: Next apps không gọi `api.http` / `sdk.http` trực tiếp.
- `pnpm lint`: kiểm tra import boundaries + style/lint.
- `pnpm typecheck`: kiểm tra TypeScript.

Nếu có thay đổi kiến trúc/module/routes và đã cập nhật Graphify context:

```bash
pnpm graphify:ai-summary
```

Hoặc chạy full:

```bash
pnpm check:full
```

## 6) Vòng Lặp Tự Điều Chỉnh (Agent Loop)

1. Đọc bản đồ (`.graphify/markdown/SUMMARY_FOR_AI.md`, `packages/.graphify/markdown/`, app SUMMARY + rules).
2. Chạy `pnpm check` (hoặc `pnpm check:full`).
3. Phân loại lỗi theo service (`@api`, `@frontend`, `@backend`, `packages/*`).
4. Sửa đúng phạm vi service gây lỗi, tránh refactor lan.
5. Chạy lại `pnpm check` đến khi exit code 0.

## 7) Tiêu Chí Hoàn Thành

- `pnpm check` pass.
- Không vi phạm boundaries giữa services.
- Không thêm phụ thuộc sai vào `package.json`.
- Nếu đổi cấu trúc app đáng kể: đã chạy `update.cjs` + `pnpm graphify:ai-summary` (SUMMARY / chỉ mục monorepo).
