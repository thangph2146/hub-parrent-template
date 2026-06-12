# script-system

Script vận hành monorepo — **một chỗ duy nhất** ở root, phân nhóm theo chức năng.

```
script-system/
├── lib/          # Registry + paths dùng chung
├── dev/          # Dev stack, port, Next/Nest prep
├── sync/         # Đồng bộ main → product line deploy
├── git/          # Commit + push branch deploy
├── verify/       # Kiểm tra cấu trúc, sync state, bounds
├── graphify/     # Cập nhật snapshot + AI summary
└── deploy/       # PM2 production stacks
```

## Dev (`dev/`)

| File | Lệnh / mục đích |
|------|-----------------|
| `dev-stack.cjs` | `pnpm dev:main`, `dev:checkin`, … |
| `dev-next.cjs`, `dev-prep-next.cjs` | `predev` / `dev` Next apps |
| `dev-prep-api.cjs` | `predev` Nest API |
| `kill-ports.cjs`, `kill-dev-workers.cjs` | `pnpm kill:*` |
| `clean-next-cache.cjs` | `pnpm clean:next` |
| `ensure-lexical-built.cjs` | Pre check-in dev |
| `dev-resource-guard.cjs` | CPU/GPU guard (`dev:main:checkin`) |

## Sync (`sync/`)

| File | Lệnh |
|------|------|
| `sync-api-from-main.cjs` | `pnpm sync:api:*` |
| `sync-checkin.cjs` | `pnpm pull:checkin` |
| `copy-checkin-admin-modules.cjs` | **Deprecated** — dùng `pnpm pull:checkin` |
| `sync-checkin-menu-tree.cjs` | Sinh menu sidebar check-in |
| `sync-parent.cjs` | `pnpm pull:parent` |

## Git / push deploy (`git/`)

| File | Lệnh |
|------|------|
| `commit-and-push.cjs` | `pnpm push -- "feat: ..."` — commit + sync + push `main`, `hub-event`, `hub-parent` |
| `push-deploy-branches.cjs` | `pnpm push:deploy` — đã commit, chỉ sync + push branch |

Quy trình agent: sau `pnpm check` → `pnpm push -- "..."` (xem `docs/steps/step6_code_execution_and_change_tracking.md`, `AGENTS.md` mục 6).

## Verify & test (`verify/`)

| File | Lệnh |
|------|------|
| `verify-apps-structure.mjs` | `pnpm verify:apps` |
| `verify-import-aliases.mjs` | `pnpm verify:imports` — `@ui/*` trên app Next |
| `verify-service-boundaries.mjs` | `pnpm verify:bounds` |
| `verify-no-sdk-http.mjs` | `pnpm verify:sdk-http` |
| `verify-permission-parity.mjs` | `pnpm verify:permissions` |
| `verify-api-profile.mjs` | `pnpm verify:api-profile` |
| `verify-checkin-admin-sync.mjs` | `pnpm verify:checkin-admin` |
| `verify-main-admin-sync.mjs` | `pnpm verify:main-admin` |
| `test-app-operations.mjs` | `pnpm test:apps`, `pnpm test:checkin` |

## Graphify (`graphify/`)

| File | Lệnh |
|------|------|
| `graphify-update.cjs` | `node script-system/graphify/graphify-update.cjs apps/...` |
| `graphify-ai-summary.mjs` | `pnpm graphify:ai-summary` |

## Deploy (`deploy/`)

| File | Lệnh |
|------|------|
| `pm2-stack.cjs` | `pnpm pm2:start`, `pm2:start:checkin`, … |

## Lib (`lib/`)

| File | Mục đích |
|------|----------|
| `monorepo-apps.cjs` | Registry product line |
| `paths.cjs` | `ROOT`, `SCRIPT_SYSTEM` |
