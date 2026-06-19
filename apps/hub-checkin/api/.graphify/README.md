# Graphify — `apps/hub-checkin/api`

Package **@hub-checkin/api**. Thư mục `.graphify/` giữ **snapshot** (`snapshot/`) và **Markdown cho AI** (`markdown/`).

## API endpoints (đọc trước khi sửa HTTP)

| File | Mục đích |
|------|----------|
| **[`markdown/API_ENDPOINTS.md`](markdown/API_ENDPOINTS.md)** | **Bản đồ endpoint hiện tại** — mọi domain, method, path (kèm `/api` global prefix) |
| [`../../../../.graphify/markdown/ROUTE_SURFACE.md`](../../../../.graphify/markdown/ROUTE_SURFACE.md) | Admin URL ↔ Nest ↔ `@workspace/api-client` (monorepo) |
| [`src/config/constants.ts`](../src/config/constants.ts) | Nguồn `ADMIN_ROUTES` / `PUBLIC_ROUTES` |

**Global prefix:** Nest `setGlobalPrefix('api')` → client gọi `GET /api/admin/...`.

**Controller extend package:** route khai báo trên `@workspace/api-server` — `API_ENDPOINTS.md` ghi rõ `→ packages/api-server/...`.

**Check-in deploy:** AUTO-GENERATED — `pnpm api:render:checkin` · verify `pnpm verify:checkin-api` · `pnpm verify:main-api-endpoint-parity`.

**Verify sau đổi route:** `pnpm verify:api-contract` · `pnpm verify:main-api-endpoint-parity`.

## File Graphify khác

| File / Thư mục | Mục đích |
|----------------|----------|
| `snapshot/graph.json` | Đồ thị node/link |
| `snapshot/context.json` | Snapshot nội dung file |
| `markdown/SUMMARY_FOR_AI.md` | Tóm tắt module |
| `markdown/FOLDER_TREE.md` | Cây thư mục `src/` |
| `markdown/GRAPH_STATS.md` | Thống kê graph |
| `markdown/IMPACT_RADIUS.md` | File in-degree cao |
| `markdown/ENTRY_POINTS.md` | Bootstrap, module Nest |
| `markdown/PATTERN_CLUSTERS.md` | Boilerplate lặp |
| `markdown/API_DOMAIN_IMPORTS.md` | Import chéo domain |
| `README.md` | File này |

## Làm mới

```bash
node script-system/graphify/graphify-update.cjs apps/hub-checkin/api
pnpm graphify:ai-summary
```

(`graphify:ai-summary` sinh lại `API_ENDPOINTS.md` + `ROUTE_SURFACE.md` monorepo.)

## Liên kết

- [SUMMARY monorepo](../../../../.graphify/markdown/SUMMARY_FOR_AI.md)
- [`@workspace/api-server`](../../../../packages/api-server/README.md)
- [AGENTS.md](../../../../AGENTS.md)
