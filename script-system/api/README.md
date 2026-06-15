# script-system/api

Wrapper **`.cjs`** trỏ tới `@workspace/api-server/deploy` — giữ alias `pnpm api:*` ổn định tại root.

| File | Lệnh root | Delegate |
|------|-----------|----------|
| `audit-api-module-parity.cjs` | `pnpm api:audit:modules` | `deploy/cli/dev/report-module-*.cjs` |
| `build-registry-from-package.cjs` | `pnpm api:registry:sync` | `writeTemplatesMeta()` → `.pipeline/PACKAGE_MODULE_TEMPLATES.meta.json` |
| `generate-unified-controller-specs.cjs` | `api:generate:unified-specs` (1/2) | `apply-main-api-oop.cjs --specs-only` |
| `generate-unified-service-specs.cjs` | `api:generate:unified-specs` (2/2) | `pnpm api:sync-template` |
| `merge-binding-service-files.cjs` | `pnpm api:merge:binding-services` | `materialize-main-api-bases.cjs` |

Logic render/sync/verify chính: **`packages/api-server/deploy/cli/`** · root: `pnpm api:render`, `pnpm api:sync-template`.

Lib dùng chung: `script-system/lib/monorepo-root.cjs`, `script-system/lib/api-server-cli.cjs`.
