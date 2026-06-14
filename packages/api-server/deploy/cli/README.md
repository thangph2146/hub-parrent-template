# CLI deploy — `@workspace/api-server`

## Entry (`cli/`)

| Script | Lệnh | Vai trò |
|--------|------|---------|
| `sync-template.cjs` | `pnpm api:sync-template` | main/api → deploy/nest |
| `render.cjs` | `pnpm api:render <app>` | deploy/nest → app API (TTY menu) |
| `render-prompts.cjs` | — | @clack/prompts |
| `scaffold-api-app-config.cjs` | — | Tạo `api.app.config.json` |
| `ensure-app-env.cjs` | — | Copy / `pnpm env:init` → `.env` |

## `lib/` — implementation (nội bộ)

| Thư mục | Vai trò |
|---------|---------|
| `lib/monorepo-root.cjs` | Resolve monorepo + package root |
| `lib/sync/` | common, crud, module-bases, contract-specs, module-service-specs, materialize |
| `lib/prune/` | Dọn template sau sync/render |
| `lib/render/` | Copy nest → app, discover apps, module closure |

## `verify/`

| Script | Lệnh root |
|--------|-----------|
| `template.mjs` | `pnpm verify:api-template` |
| `checkin-api.mjs` | `pnpm verify:checkin-api` |
| `endpoint-parity.mjs` | `pnpm verify:endpoint-parity` |
| `render-checkin.cjs` | `pnpm api:render:checkin` |

## `dev/` — audit (không CI)

```bash
node packages/api-server/deploy/cli/dev/audit-common-usage.cjs
node packages/api-server/deploy/cli/dev/report-module-bindings.cjs apps/hub-event/api
node packages/api-server/deploy/cli/dev/report-module-files.cjs apps/hub-event/api
node packages/api-server/deploy/cli/dev/gzip-test-fixture.cjs path/to/export.json
```
