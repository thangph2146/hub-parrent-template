# Cấu trúc `apps/`

> **Packages-first:** logic nằm trong [`packages/`](../packages/README.md). `apps/` chỉ entity, composition, route native — **không** copy CRUD từ line khác.

Monorepo template tổ chức theo **product line** — mỗi line là một thư mục con, bên trong có **đúng 2 app deployable** (API + web).

```
apps/
├── main/              ← source of truth (dev hàng ngày)
├── hub-parent/        ← deploy site chính
├── hub-event/         ← deploy check-in
└── store-sync/        ← deploy store
```

Chi tiết workflow: [`docs/MONOREPO_STRUCTURE.md`](../docs/MONOREPO_STRUCTURE.md).

## Quy tắc giữ cấu trúc sạch

| Việc | Nơi làm | Không làm |
|------|---------|-----------|
| Feature API / admin mới | `apps/main/api`, `apps/main/backend` | Copy thủ công sang line deploy |
| Dev check-in UI + main API | `pnpm dev:main:checkin` | Sửa `hub-event/api` khi chưa cần deploy |
| Cập nhật deploy check-in (template upstream) | `pnpm pull:checkin` — generate từ packages |
| Copy API main → hub-event (deprecated) | `pnpm pull:checkin:legacy` |
| Logic dùng chung | `packages/*` | Import chéo `apps/*` |
| Component admin | `@workspace/ui` | Tạo component admin local trong từng app |

### File local (không ghi đè khi sync)

| Line | Giữ tại chỗ |
|------|-------------|
| **hub-event** API | `api.sync-profile.json`, `src/app.module.ts`, `src/seeders/DatabaseSeeder.ts`, `package.json` |
| **hub-event** frontend | Mọi route **không** nằm trong `admin.sync-modules.json` — xem [`hub-event/README.md`](./hub-event/README.md) |

### Script — ranh giới

| Vị trí | Được phép |
|--------|-----------|
| `script-system/` | Dev, sync, verify, graphify, deploy — xem `script-system/README.md` |
| `apps/main/api/scripts/` | `ensure-dist.mjs`, `test-live-admin-api.ts`; migration một lần trong `scripts/archive/` |
| `apps/*/api/scripts/` (line deploy) | Chỉ `ensure-dist.mjs` |
| `apps/*/.../scripts/` (frontend) | **Không** — dùng `script-system/` |

### Artifact build (không commit)

`dist/`, `.next/`, `out/`, `.turbo/` — đã có trong `.gitignore`. Chạy build local không đưa vào git.

### Cấu trúc cấm (legacy)

Không tạo lại layout phẳng cũ:

- `apps/api`, `apps/backend`, `apps/frontend`

Registry chuẩn: `script-system/lib/monorepo-apps.cjs` — cấu trúc thư mục: `script-system/README.md`.

## Biến môi trường

Mỗi app deployable: **`.env.example`** (mẫu, commit) + **`.env`** (local).

| Lệnh | Mô tả |
|------|--------|
| `pnpm env:init parent` | Tạo `.env` cho stack site chính |
| `pnpm env:init checkin` | Tạo `.env` cho stack check-in |
| `pnpm env:init all` | Tất cả app trong manifest |
| `pnpm env:reorganize` | Chuẩn hóa `.env` hiện có theo `.env.example` (backup `.env.bak`) |

Chi tiết stack, biến, marker: [`docs/env/README.md`](../docs/env/README.md) · registry: `script-system/env/manifest.cjs`.

## Kiểm tra tự động

```bash
pnpm verify:env           # đủ .env.example + marker ENV_TEMPLATE
pnpm verify:apps          # cấu trúc product line + package registry
pnpm verify:imports       # alias @ui/* + cấm @workspace/ui trong app Next
pnpm verify:api-profile   # hub-event API khớp sync profile
pnpm verify:checkin-admin # admin check-in sau sync (modules, native, imports)
pnpm verify:bounds        # không import chéo apps/*
```

### Test thao tác sync (đối xứng `sync:*` / `pull:checkin`)

| Sync | Test |
|------|------|
| `pnpm pull:checkin` | `pnpm test:checkin` (nhanh) · `pnpm test:checkin:full` (+ typecheck) |
| `pnpm sync:api:hub-event` | `pnpm test:api:hub-event` |
| `pnpm sync:api` | `pnpm test:api:all` |
| — | `pnpm test:apps` (mọi line) · `pnpm test:apps:quick` (bỏ typecheck) |

`pnpm check` chạy `verify:apps` cùng các verify khác (chưa gồm `test:checkin`).

## Product line nhanh

| Line | API package | Web package |
|------|-------------|-------------|
| main | `@api` | `@backend` |
| hub-parent | `@hub-parent/api` | `@frontend` |
| hub-event | `@hub-event/api` | `@hub-event-checkin-frontend` |
| store-sync | `@store-sync/api` | `@store-sync-frontend` |
