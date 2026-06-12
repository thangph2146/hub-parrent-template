# PACKAGE_INDEX — graphify per-package (agent)

> **Sinh tự động:** `2026-06-12T14:20:21.485Z` — package workspace có snapshot `.graphify/snapshot/`.

| Package | Path | Graphify | Doc |
|---------|------|----------|-----|
| `@workspace/ui` | `packages/ui/` | [SUMMARY](../../ui/.graphify/markdown/SUMMARY_FOR_AI.md) ✓ | [`docs/ui-pattern/README.md`](../../../docs/ui-pattern/README.md) |
| `@workspace/admin-app` | `packages/admin-app/` | [SUMMARY](../../admin-app/.graphify/markdown/SUMMARY_FOR_AI.md) ✓ | [`docs/admin-pattern/ADMIN_APP_PACKAGE.md`](../../../docs/admin-pattern/ADMIN_APP_PACKAGE.md) |
| `@workspace/api-client` | `packages/api-client/` | [SUMMARY](../../api-client/.graphify/markdown/SUMMARY_FOR_AI.md) ✓ | [`docs/api-client-pattern/README.md`](../../../docs/api-client-pattern/README.md) |
| `@workspace/api-server` | `packages/api-server/` | [SUMMARY](../../api-server/.graphify/markdown/SUMMARY_FOR_AI.md) ✓ | [`packages/api-server/README.md`](../../../packages/api-server/README.md) |

## Làm mới snapshot package

```bash
node script-system/graphify/graphify-update.cjs packages/ui
node script-system/graphify/graphify-update.cjs packages/admin-app
node script-system/graphify/graphify-update.cjs packages/api-client
node script-system/graphify/graphify-update.cjs packages/api-server
pnpm graphify:ai-summary
```

Hoặc: `pnpm graphify:update:packages` (nếu có trong root `package.json`).
