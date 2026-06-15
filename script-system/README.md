# script-system



Script vận hành monorepo — **một chỗ duy nhất** ở root, phân nhóm theo chức năng. CLI orchestrator dùng **`.cjs`**; graphify giữ **`.mjs`**.



```

script-system/

├── README.md           # Chỉ file duy nhất ở root

├── lib/                # Registry + paths (xem lib/README.md)

│   └── layout/         # data/, STORAGE_DIR, .pipeline/

├── dev/                # Dev stack, port, Next/Nest prep

├── sync/               # Đồng bộ main → product line deploy

│   ├── lib/            # Helper nội bộ sync

│   └── deprecated/     # Stub legacy (không gọi từ package.json)

├── admin/              # @workspace/admin-app migrate + generate

├── api/                # Wrapper → packages/api-server/deploy/cli

├── db/                 # Bootstrap DB + storage:init

├── env/                # env:init, env:reorganize

├── git/                # Commit + push branch deploy

├── verify/             # Kiểm tra cấu trúc, sync, bounds (100% .cjs)

├── graphify/           # Snapshot + AI summary (.mjs)

└── template/           # Manifest downstream (hub-event, hub-parent, …)

```

PM2 production: [`ecosystem/`](../ecosystem/README.md) — không nằm trong `script-system/`.

Kiểm tra layout: **`pnpm verify:scripts`**



## Lib (`lib/`)



| File | Mục đích |

|------|----------|

| `monorepo-root.cjs` | **Entry chuẩn** — `ROOT`, `SCRIPT_SYSTEM`, `PRODUCT_LINES` |

| `monorepo-apps.cjs` | Registry product line |

| `run-step.cjs` | `runStep()` cho orchestrator sync/db |

| `layout/data-paths.cjs` | `data/seed`, `data/exports` |

| `layout/storage-layout.cjs` | Subfolder `STORAGE_DIR/uploads/` |

| `layout/pipeline-paths.cjs` | `apps/*/api/.pipeline/` |

| `api-server-cli.cjs` | Đường dẫn `packages/api-server/deploy/cli` |

| `import-alias-rules.cjs` | Quy tắc `@ui` / workspace imports |

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

| `sync-checkin-packages.cjs` | `pnpm pull:checkin` (native — verify + admin) |

| `sync/deprecated/sync-checkin-api-copy.cjs` | `pnpm pull:checkin:legacy` (copy API main → hub-event) |

| `sync-checkin-menu-tree.cjs` | Sinh menu sidebar check-in |

| `sync-parent.cjs` | `pnpm pull:parent` |

| `pull-template.cjs` | `pnpm pull:template` — downstream kéo packages/script-system |

| `init-downstream.cjs` | `pnpm init:downstream hub-event ../path` |



Deprecated: `sync/deprecated/` — xem README trong thư mục.



## Admin (`admin/`)



| File | Lệnh |

|------|------|

| `migrate-admin-modules.cjs` | `pnpm admin:migrate` |

| `generate-admin-routes.cjs` | `pnpm admin:generate:*` |

| `fix-*-imports.cjs` | Sửa import sau migrate/generate |

| `consolidate-admin-loading.cjs` | `pnpm admin:consolidate-loading` |



## API wrappers (`api/`)



| File | Lệnh |

|------|------|

| `build-registry-from-package.cjs` | `pnpm api:registry:sync` |

| `audit-api-module-parity.cjs` | `pnpm api:audit:modules` |

| `generate-unified-*-specs.cjs` | `pnpm api:generate:unified-specs` |

| `merge-binding-service-files.cjs` | `pnpm api:merge:binding-services` |



Logic deploy nằm trong `packages/api-server/deploy/cli` — wrapper chỉ delegate.



## Template (`template/` + root manifest)



| File | Mục đích |

|------|----------|

| `template.manifest.json` (repo root) | Upstream — paths kế thừa, productLines |

| `template/template.manifest.downstream.json` | Mẫu manifest repo sản phẩm |

| `template/pnpm-workspace.*.yaml` | Workspace downstream theo line |

| `docs/TEMPLATE_MONOREPO.md` | Hướng dẫn đầy đủ |



## Git / push (`git/`)



| File | Lệnh |

|------|------|

| `commit-and-push.cjs` | `pnpm push` — template: chỉ main; `--legacy-deploy` = branch deploy |

| `push-deploy-branches.cjs` | `pnpm push:deploy` · `--only hub-event` |



## Verify & test (`verify/`)



| File | Lệnh |

|------|------|

| `verify-apps-structure.cjs` | `pnpm verify:apps` |

| `verify-import-aliases.cjs` | `pnpm verify:imports` |

| `verify-service-boundaries.cjs` | `pnpm verify:bounds` |

| `verify-no-sdk-http.cjs` | `pnpm verify:sdk-http` |

| `verify-permission-parity.cjs` | `pnpm verify:permissions` |

| `verify-api-profile.cjs` | `pnpm verify:api-profile` |

| `verify-api-client-contract.cjs` | `pnpm verify:api-contract` |

| `verify-checkin-admin-sync.cjs` | `pnpm verify:checkin-admin` |

| `verify-main-admin-sync.cjs` | `pnpm verify:main-admin` |

| `verify-data-layout.cjs` | `pnpm verify:data-layout` |

| `verify-script-system.cjs` | `pnpm verify:scripts` |

| `test-app-operations.cjs` | `pnpm test:apps`, `pnpm test:checkin` |



## Graphify (`graphify/`)



| File | Lệnh |

|------|------|

| `graphify-update.cjs` | `node script-system/graphify/graphify-update.cjs apps/...` |

| `graphify-ai-summary.mjs` | `pnpm graphify:ai-summary` |
| `audit-api-endpoints.mjs` | `pnpm graphify:audit-endpoints` |



## DB & storage (`db/`)



| File | Lệnh |

|------|------|

| `bootstrap-fresh-api.cjs` | `pnpm db:bootstrap:store` |

| `init-storage-dirs.cjs` | `pnpm storage:init`, `storage:init:checkin`, … |



## Env (`env/`)



| File | Lệnh |

|------|------|

| `init-env.cjs` | `pnpm env:init` |

| `reorganize-env.cjs` | `pnpm env:reorganize` |

| `manifest.cjs` | Manifest stack `.env` |



## Quy ước `.cjs`



- CLI orchestrator → **`.cjs`** trong các nhóm trên

- Verify static → **`.cjs`** trong `verify/` (không `.mjs`)

- Luôn `require("../lib/monorepo-root.cjs")` thay vì tự resolve `ROOT`

- Wrapper API → `script-system/api/*.cjs` delegate sang `packages/api-server/deploy/cli`



Kiểm tra: **`pnpm verify:scripts`** · **`pnpm verify:data-layout`**

