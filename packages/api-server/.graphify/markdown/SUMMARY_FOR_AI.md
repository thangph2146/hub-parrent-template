# Logic API Nest dùng chung — tóm tắt cho AI (Graphify)

> Package `@workspace/api-server` · `packages/api-server/`

- **context.generatedAt:** 2026-06-13T21:25:48.473Z
- **summary sinh:** `2026-06-13T21:25:57.632Z`

## Mục lục artefact

- [`FOLDER_TREE.md`](FOLDER_TREE.md) · [`GRAPH_STATS.md`](GRAPH_STATS.md)
- [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) · [`ENTRY_POINTS.md`](ENTRY_POINTS.md) · [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md)

## Doc & verify

- **Doc:** [`packages/api-server/README.md`](../../../packages/api-server/README.md)
- **Verify:** `pnpm verify:api-template`, `pnpm --filter @workspace/api-server test`

## Focus paths (agent)

- `packages/api-server/src/modules/`
- `packages/api-server/deploy/cli/`
- `packages/api-server/deploy/config/`
- `packages/api-server/deploy/nest/`

## Thống kê snapshot

- **totalFiles:** 243
- **clientComponents:** 0

## `src/` top-level

- `src/bases/`
- `src/common/`
- `src/config/`
- `src/data-test/`
- `src/modules/`
- `src/types/`
- `src/utils/`

## Làm mới

```bash
node script-system/graphify/graphify-update.cjs packages/api-server
pnpm graphify:ai-summary
```
