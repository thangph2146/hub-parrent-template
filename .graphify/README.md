# Graphify — monorepo (hub-parent-template)

Thư mục `.graphify/` ở **root** giữ **chỉ mục monorepo** (`markdown/SUMMARY_FOR_AI.md`), checklist cho AI (`README.md`), và tùy chọn **snapshot** (`snapshot/`) khi chạy `node script-system/graphify/graphify-update.cjs .`. Artefact Markdown chi tiết nằm trong **`apps/<app>/.graphify/markdown/`** và **`packages/.graphify/markdown/`** (JSON snapshot tương ứng trong `snapshot/` từng app).

Bản đồ đường dẫn app: [`AGENTS.md`](../AGENTS.md) mục 1 và 3.

## File Markdown tại `.graphify/` (root)

| File | Vai trò |
|------|---------|
| **`README.md`** | Hướng dẫn người + agent (file này; không sinh bởi script). |
| **`markdown/SUMMARY_FOR_AI.md`** | Chỉ mục monorepo + **mục "Chỉ dẫn theo chủ đề"** (bảng mục tiêu → đường dẫn); sinh bởi `pnpm graphify:ai-summary`. |
| **`markdown/TASK_INDEX.md`** | Module/feature → file path (`admin-app`, API, api-client); sinh cùng `graphify:ai-summary`. |
| **`markdown/SYNC_DELTA.md`** | So sánh domain `apps/main/api` ↔ `apps/hub-checkin/api` (sync profile). |
| **`markdown/ROUTE_SURFACE.md`** | Admin URL ↔ Nest API ↔ api-client. |
| **`packages/.graphify/markdown/PACKAGE_INDEX.md`** | Graphify per-package (`ui`, `admin-app`, `api-client`, `api-server`). |
| **`markdown/ROUTE_SURFACE.md`** | Admin URL ↔ Nest controller ↔ api-client HTTP paths. |
| **`markdown/task-index.json`** | Dữ liệu máy cho `pnpm graphify:brief`. |

JSON snapshot repo-level (nếu dùng): **`.graphify/snapshot/`** — từ `node script-system/graphify/graphify-update.cjs .` ở root (tùy chọn; snapshot **đầy đủ theo service** nằm ở `apps/*/.graphify/snapshot/`).

## Ma trận artefact (clean scope)

| Phạm vi | Markdown (AI) | Snapshot JSON |
|----------|----------------|-----------------|
| **Root** `.graphify/` | `SUMMARY_FOR_AI.md`, `TASK_INDEX.md`, `SYNC_DELTA.md`, `ROUTE_SURFACE.md` | `snapshot/` (nếu chạy update ở root) |
| **`packages/`** | `packages/.graphify/markdown/*.md` | — |
| **Mỗi app** | `FOLDER_TREE`, `GRAPH_STATS`, `IMPACT_RADIUS`, `ENTRY_POINTS`, `PATTERN_CLUSTERS` (+ `API_DOMAIN_IMPORTS` cho API) | `apps/<line>/<app>/.graphify/snapshot/` |

## Đọc theo thứ tự

1. **`markdown/SUMMARY_FOR_AI.md`** — bản đồ dịch vụ, ranh giới, link app/package, **bảng chỉ dẫn theo chủ đề**.
2. **`packages/.graphify/README.md`** + **`packages/.graphify/markdown/SUMMARY_FOR_AI.md`** + **`WORKSPACE_DEPS.md`** — workspace packages.
3. **`apps/<đường-dẫn-app>/.graphify/markdown/SUMMARY_FOR_AI.md`** (+ `FOLDER_TREE`, `GRAPH_STATS`, `IMPACT_RADIUS`, `ENTRY_POINTS`; API thêm `API_DOMAIN_IMPORTS`) — từng service.
4. **`markdown/SYNC_DELTA.md`** — khi sửa API main và cần biết ảnh hưởng line check-in.

## Làm mới snapshot (đường dẫn thật)

```bash
# Dev / site chính — chạy app bị ảnh hưởng:
node script-system/graphify/graphify-update.cjs apps/main/api
node script-system/graphify/graphify-update.cjs apps/main/backend
node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend

# Check-in / store-sync — khi sửa line đó:
node script-system/graphify/graphify-update.cjs apps/hub-checkin/api
node script-system/graphify/graphify-update.cjs apps/store-sync/api

pnpm graphify:ai-summary
```

Hoặc: `pnpm graphify:refresh` (sau khi đã update snapshot cho app liên quan).

Làm mới toàn bộ: `pnpm graphify:refresh` (= `graphify:update` + `graphify:ai-summary`).

## Checklist sau chuẩn hóa / refactor kiến trúc

1. **`pnpm check`** — bounds + lint + typecheck (bắt buộc trước khi coi task xong).
2. **Nếu đổi cấu trúc file/route/module:** chạy `graphify-update` cho app bị ảnh hưởng, rồi `pnpm graphify:ai-summary`.
3. **Đối chiếu nhanh:**
   - **`markdown/SUMMARY_FOR_AI.md` (root)** — mục *Chỉ dẫn theo chủ đề* + bảng app.
   - **`apps/<app>/.graphify/markdown/FOLDER_TREE.md`** / **`GRAPH_STATS.md`**
   - **`apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md`** (hoặc app API tương ứng)
   - **`packages/.graphify/markdown/WORKSPACE_DEPS.md`**
4. **Hoặc một lệnh:** `pnpm check:full` — **không** thay bước `graphify-update`; nếu chưa update snapshot, JSON có thể cũ.

Khi chỉ sửa vài file nhỏ, có thể chỉ chạy `graphify-update` cho **một** app rồi vẫn `pnpm graphify:ai-summary` từ root.
