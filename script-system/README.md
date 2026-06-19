# script-system

Script vận hành monorepo nằm tập trung ở root. Không đặt tooling rải rác trong `apps/*`.

## Boundary

`mono-repo-template` giữ toolbox đầy đủ. Downstream chỉ nhận runtime subset để dev, sync, env, db và verify.

| Nhóm | Template | Downstream |
|------|----------|------------|
| `admin/` | Có | Có |
| `db/` | Có | Có |
| `dev/` | Có | Có |
| `env/` | Có | Có |
| `git/` | Có | Có |
| `lib/` | Có | Có |
| `verify/` | Có | Có |
| `sync/lib/` | Có | Có |
| `sync/*.cjs` allowlist | Có | Có |
| `api/` | Có | Không |
| `graphify/` | Có | Không |
| `template/` | Có | Không |
| `sync/apply-sync-to-downstream.cjs` | Có | Không |
| `sync/init-downstream.cjs` | Có | Không |
| `sync/sync-api-from-main.cjs` | Có | Không |
| `git/push-deploy-branches.cjs` | Có | Không |

Downstream không được thêm lại `"script-system"` nguyên thư mục vào `template.manifest.json`. Chỉ sync đúng path allowlist.

## Runtime Subset

```text
script-system/
├── README.md
├── admin/
├── db/
├── dev/
├── env/
├── git/
├── lib/
├── sync/
│   ├── lib/
│   ├── downstream-sync-profile.cjs
│   ├── post-pull-downstream.cjs
│   ├── pull-template.cjs
│   ├── sync-checkin-menu-tree.cjs
│   ├── sync-checkin-packages.cjs
│   └── sync-parent.cjs
└── verify/
```

## Nhóm Chính

| Nhóm | Mục đích |
|------|----------|
| `lib/` | `ROOT`, product registry, shared layout helpers |
| `dev/` | Dev stack, port cleanup, Next/Nest prep |
| `sync/` | `pull:template`, `post-pull:downstream`, profile sync |
| `admin/` | Generate/migrate admin routes qua `@workspace/admin-app` |
| `db/` | Bootstrap DB và storage dirs |
| `env/` | Render/verify `.env` theo stack |
| `git/` | Push helper |
| `verify/` | Static checks cho app layout, env, import, boundary |

## Upstream-only

Các nhóm sau chỉ chạy trong `mono-repo-template`:

- `script-system/api/`: wrapper audit/generate cho `packages/api-server`.
- `script-system/graphify/`: snapshot/AI summary generated cache.
- `script-system/template/`: template manifest/package downstream.
- `script-system/sync/apply-sync-to-downstream.cjs`: local helper trước khi push template.
- `script-system/sync/init-downstream.cjs`: bootstrap repo mới.
- `script-system/sync/sync-api-from-main.cjs`: legacy sync API dev.
- `script-system/git/push-deploy-branches.cjs`: legacy deploy branch orchestration.

## Quy Tắc

- CLI orchestrator dùng `.cjs`.
- Verify static nằm trong `verify/`.
- Luôn import root qua `require("../lib/monorepo-root.cjs")`.
- Nếu script dùng cho nhiều product line, đưa vào `script-system` hoặc `packages/*`, không copy vào `apps/*`.
- Nếu script chỉ generate/audit/bootstrap một lần, giữ upstream-only.

Kiểm tra: `pnpm verify:scripts` và `pnpm verify:apps`.
