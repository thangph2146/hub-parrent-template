# script-system

Orchestration monorepo — sync template, bootstrap downstream, verify repo-level.

## Giữ lại

| Nhóm | Vai trò |
|------|---------|
| `sync/` | `pull:template`, `post-pull-downstream`, `push-template`, `push-product`, `init:downstream` (upstream) |
| `git/` | Push template (upstream) |
| `lib/` | `monorepo-root`, `run-step` |
| `verify/` | Layout repo, downstream-safe, template manifest |
| `template/` | Bootstrap manifests + starter pack (upstream) |

## Script thuộc package — không nằm đây

| Package | Script |
|---------|--------|
| `@workspace/admin-app` | `deploy/cli/generate-routes.cjs` → `pnpm --filter @workspace/admin-app run generate:routes` |
| `@workspace/api-server` | `deploy/cli/render.cjs`, `deploy/cli/verify/verify-api-profile.cjs` |
| `@workspace/eslint-config` | `verify/service-boundaries.cjs` |

Product app (hub-parent): `apps/hub-parent/api/scripts/apply-product-overrides.cjs`

Dev/PM2 → `scripts/` ở downstream.

## Kiểm tra

```bash
pnpm verify:scripts
pnpm check
```
