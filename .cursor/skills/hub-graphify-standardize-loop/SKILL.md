---
name: hub-graphify-standardize-loop
description: >-
  Vòng chuẩn hóa hub-parent-template: pnpm check, graphify refresh, đối chiếu
  SUMMARY_FOR_AI. Dùng sau refactor route/module, cập nhật agent docs, hoặc khi
  user nhắc AGENTS.md / graphify / chuẩn chỉnh AI coding.
---

# Hub Graphify standardize loop

## Khi nào chạy

- Đổi **route**, **module**, **cây thư mục** trong `apps/*` hoặc `packages/*`.
- User yêu cầu **cập nhật agent** / **@AGENTS.md** / làm mới bản đồ cho AI.
- Kết thúc task lớn (toast, import, refactor admin) trước khi coi xong.

## Vòng lặp (thực hiện tuần tự)

### 0. Brief task (trước khi sửa)

```bash
pnpm graphify:brief --task "mô tả task ngắn"
```

Đọc `.graphify/markdown/TASK_INDEX.md` nếu brief không khớp module.

### 1. Kiểm tra code

```bash
pnpm check
```

Phải pass: `verify:bounds`, `verify:permissions`, `lint`, `typecheck`.

### 2. Làm mới Graphify

```bash
pnpm graphify:refresh
```

Tương đương:

```bash
pnpm graphify:update
pnpm graphify:ai-summary
```

Chỉ một app bị ảnh hưởng (đường dẫn thật — xem `script-system/lib/monorepo-apps.cjs`):

```bash
node script-system/graphify/graphify-update.cjs apps/main/backend
pnpm graphify:ai-summary
```

### 3. Đối chiếu artefact (đọc, không mở full context.json)

| File                                                | Kiểm tra                                     |
| --------------------------------------------------- | -------------------------------------------- |
| `.graphify/markdown/SUMMARY_FOR_AI.md`              | Bảng app, chỉ dẫn theo chủ đề, `generatedAt` |
| `apps/<app>/.graphify/markdown/FOLDER_TREE.md`      | Cây `src/` khớp refactor                     |
| `apps/<app>/.graphify/markdown/GRAPH_STATS.md`      | Điểm nóng import                             |
| `apps/<app>/.graphify/markdown/IMPACT_RADIUS.md`    | File shared — ai import                      |
| `apps/<app>/.graphify/markdown/ENTRY_POINTS.md`     | Bootstrap, route, AUTO-GENERATED               |
| `apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md` | Domain mới                              |
| `.graphify/markdown/SYNC_DELTA.md`                  | Main API ↔ hub-event sync                    |
| `.graphify/markdown/ROUTE_SURFACE.md`               | Admin URL ↔ API ↔ api-client                 |
| `apps/<app>/.graphify/markdown/PATTERN_CLUSTERS.md` | Boilerplate lặp (loading, re-export)         |
| `packages/.graphify/markdown/WORKSPACE_DEPS.md`     | Cạnh `workspace:*`                           |
| `packages/.graphify/markdown/PACKAGE_INDEX.md`      | Graph per-package (ui, admin-app, …)         |

### 4. Cập nhật docs agent (nếu pattern mới)

- Entry: `AGENTS.md`
- Chi tiết: `docs/admin-pattern/AGENTS_GUIDE.md`
- Pattern feature: `docs/api-client-pattern/`, `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`

**Không** tạo doc mới trừ khi user yêu cầu — bổ sung mục ngắn vào file có sẵn.

## Lệnh gộp

```bash
pnpm check:full
```

= `pnpm check` + `pnpm graphify:ai-summary` (không chạy `graphify-update`). Sau refactor cây file: chạy `pnpm graphify:refresh` **trước** hoặc **cùng** lúc với `check:full`.

## Ranh giới microservice (nhắc nhanh)

- Không import chéo `apps/*`.
- Admin UI: `@workspace/ui` — không component admin local trong `apps/main/backend`.
- HTTP client: `@workspace/api-client` — không fetch thẳng tới API.
- Toast admin: `useAdminMutation` — không `toast` thủ công trong mutation callback.

## Tham chiếu

- `.graphify/README.md` — checklist đầy đủ
- `docs/steps/step8_architecture_maintenance.md`
- `docs/steps/step10_agent_task_automation.md`
