# Tài liệu monorepo (hub-parent-template)

Thư mục này tổ chức tài liệu cho agent/AI đọc nhanh và làm việc theo quy trình.

**Entry point:** [`AGENTS.md`](../AGENTS.md) — bản đồ task, folder, lệnh.  
**Cấu trúc product line:** [`MONOREPO_STRUCTURE.md`](MONOREPO_STRUCTURE.md).  
**Ngôn ngữ:** tiếng Việt, encoding **UTF-8** (không lưu file bị mojibake).

## Mục tiêu chính

- `docs/steps/*.md` — chuỗi bước step-by-step cho agent (onboarding).
- `docs/admin-pattern/` — kiến trúc, quy trình bắt buộc, UX, admin-app.
- `docs/pages/` — guide implementation chi tiết theo feature admin.
- `docs/*-pattern/` — pattern theo package hoặc layer (API, client, UI, …).

## Primary agent workflow

Agent nên dùng các file step-by-step này làm lộ trình chính:

- `docs/steps/step1_system_overview.md`
- `docs/steps/step2_clean_code_guidelines.md`
- `docs/steps/step3_admin_pattern_docs.md`
- `docs/steps/step4_graphify_reading.md`
- `docs/steps/step5_feature_implementation_guides.md`
- `docs/steps/step6_code_execution_and_change_tracking.md`
- `docs/steps/step7_review_pr_and_system_memory.md`
- `docs/steps/step8_architecture_maintenance.md`
- `docs/steps/step9_follow_up_rollback_legacy_tracking.md`
- `docs/steps/step10_agent_task_automation.md`

## Supporting docs

### Kiến trúc & quy trình

- `docs/admin-pattern/README.md` — giới thiệu thư mục + bản đồ packages.
- `docs/admin-pattern/PRE_CODE_PROTOCOL.md` — **bắt buộc** trước khi sửa code.
- `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` — sơ đồ microservice và ranh giới.
- `docs/admin-pattern/AGENTS_GUIDE.md` — đọc graphify, `pnpm check`, pattern ngắn.
- `docs/admin-pattern/ADMIN_APP_PACKAGE.md` — `@workspace/admin-app` + generate admin.
- `docs/admin-pattern/FRONTEND_UX.md` — UX storefront (`apps/hub-parent/hub-parent-frontend`).
- `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` — pattern admin (`apps/main/backend` + `@ui`).

### Feature & pages

- `docs/pages/README.md` — index implementation guide.
- `docs/pages/*.md` — hướng dẫn chi tiết theo feature.

### Pattern theo layer / package

| Doc | Áp dụng |
|-----|---------|
| `docs/api-pattern/README.md` | Nest API (`apps/main/api`, logic trong `packages/api-server`) |
| [`docs/api-pattern/HANET.md`](HANET.md) | HANET Partner API — Postman, proxy Hub, person/check-in |
| `docs/api-client-pattern/README.md` | `@workspace/api-client` |
| `docs/api-client-pattern/REALTIME.md` | Socket admin + toast |
| `docs/ui-pattern/README.md` | `@workspace/ui` |
| `docs/query-client-pattern/README.md` | `@workspace/query-client` |
| `docs/logger-pattern/README.md` | `@workspace/logger` |
| `packages/api-server/README.md` | Generate API check-in, `Base*Service` |
| `docs/env/README.md` | Biến môi trường |

## Đường dẫn app (tham chiếu nhanh)

| Vai trò | Dev (source of truth) | Deploy / line khác |
|---------|----------------------|---------------------|
| API Nest | `apps/main/api` (`@api`) | `apps/hub-parent/api`, `apps/hub-event/api`, `apps/store-sync/api` |
| Admin Next | `apps/main/backend` (`@backend`) | generate + native pages trên từng frontend admin |
| Storefront | — | `apps/hub-parent/hub-parent-frontend` (`@frontend`) |
| Check-in UI | `pnpm dev:main:checkin` | `apps/hub-event/hub-event-checkin-frontend` |

## Cách dùng

1. Onboarding: `step1` → `step10`.
2. Trước mọi task code: `PRE_CODE_PROTOCOL.md` + bảng task trong `AGENTS.md`.
3. Task cụ thể: `step5_feature_implementation_guides.md` → `docs/pages/<feature>`.
4. Ranh giới service: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.

## Tham chiếu nhanh

- `AGENTS.md` — chỉ mục điều hướng chính.
- `.graphify/markdown/SUMMARY_FOR_AI.md` — bản đồ monorepo (có thể cần `pnpm graphify:refresh`).
- `packages/.graphify/markdown/SUMMARY_FOR_AI.md` — tóm tắt packages.
- `apps/README.md` — quy tắc chỉ sửa `apps/main/` khi dev.

> Step docs là lộ trình chính. `admin-pattern/` và `pages/` là tài liệu chi tiết bổ trợ — không duplicate nội dung dài vào `AGENTS.md`.
