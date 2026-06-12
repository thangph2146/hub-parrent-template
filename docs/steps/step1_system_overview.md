# Step 1: System Overview

Tổng quan nhanh để hiểu cấu trúc monorepo và các ranh giới trước khi phát triển.

Chi tiết product line: [`docs/MONOREPO_STRUCTURE.md`](../MONOREPO_STRUCTURE.md) · entry point: [`AGENTS.md`](../../AGENTS.md).

## Product lines (`apps/`)

| Line | Thư mục | Vai trò |
|------|---------|---------|
| **main** (dev) | `apps/main/api`, `apps/main/backend` | Source of truth — sửa hàng ngày |
| **hub-parent** | `apps/hub-parent/api`, `apps/hub-parent/hub-parent-frontend` | Deploy site chính |
| **hub-event** | `apps/hub-event/api`, `apps/hub-event/hub-event-checkin-frontend` | Deploy check-in sự kiện |
| **store-sync** | `apps/store-sync/api`, `apps/store-sync/store-sync-frontend` | Line đồng bộ cửa hàng |

## Dịch vụ chính (theo package npm)

- `@api` — `apps/main/api`: NestJS + MikroORM (entities, migrations, controllers, services).
- `@backend` — `apps/main/backend`: Admin Next.js.
- `@frontend` — `apps/hub-parent/hub-parent-frontend`: Storefront Next.js (public).
- `@hub-event/api`, `@hub-event-checkin-frontend` — line check-in (subset sync từ main + generate).

## Packages chia sẻ (`packages/`)

- `packages/api-client` — SDK gọi API (HTTP).
- `packages/api-server` — logic Nest dùng chung + generate API check-in.
- `packages/admin-app` — CRUD admin dùng chung + generate page.
- `packages/query-client` — TanStack Query config.
- `packages/ui`, `packages/editor` — UI / editor.
- `packages/eslint-config`, `packages/typescript-config` — lint/tsconfig chung.

## Nguyên tắc ranh giới

- **KHÔNG** import chéo source giữa `apps/*`.
- Next apps gọi API qua `@workspace/api-client` (không `fetch` thẳng).
- DB (entities, migrations, seeders): app API tương ứng; dev tại `apps/main/api`.
- Logic dùng chung: `packages/*` (`admin-app`, `api-server`, `api-client`, `ui`, …).
- Dev hàng ngày: chỉ `apps/main/` + `packages/*`; line deploy cập nhật qua `pnpm push` / `pnpm pull:checkin` / sync script.

## Tài liệu quan trọng (đọc trước khi sửa code)

- `docs/admin-pattern/PRE_CODE_PROTOCOL.md` — quy trình bắt buộc.
- `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` — sơ đồ microservice.
- `docs/admin-pattern/AGENTS_GUIDE.md` — thứ tự đọc graphify + `pnpm check`.
- `.graphify/markdown/SUMMARY_FOR_AI.md` và graphify từng app (xem bảng trong `AGENTS.md` mục 3).
- Task theo feature: `docs/pages/<feature>.md` hoặc `docs/pages/README.md`.

## Quy trình thay đổi (tối thiểu)

1. Xác định phạm vi (app/package/feature) — dùng bảng task trong `AGENTS.md`.
2. Đọc tài liệu trong mục "Tài liệu quan trọng" theo thứ tự.
3. Mở `apps/<app>/.graphify/markdown/FOLDER_TREE.md` để định vị file mục tiêu.
4. Chỉnh code sau khi hiểu luồng dữ liệu.
5. Chạy từ root:

```bash
pnpm check
```

6. Nếu thay đổi kiến trúc/module/routes lớn:

```bash
node script-system/graphify/graphify-update.cjs apps/<app>
pnpm graphify:ai-summary
pnpm check:full
```

7. Đẩy remote và cập nhật branch deploy (`main`, `hub-event`, `hub-parent`):

```bash
pnpm push -- "feat: mô tả thay đổi"
```

Chi tiết: `docs/steps/step6_code_execution_and_change_tracking.md`.

## Kiểm tra hoàn thành

- `pnpm check` phải pass.
- Không vi phạm `service-boundaries` (`packages/eslint-config/service-boundaries.js`).
- Không thêm phụ thuộc sai vào `package.json` của app/package.
- Nếu đã push: branch `hub-event` / `hub-parent` đồng bộ với `main` (qua `pnpm push` hoặc CI).

---

File này là tóm tắt; chi tiết trong `docs/admin-pattern/`, `docs/MONOREPO_STRUCTURE.md`, và `.graphify/markdown/`.
