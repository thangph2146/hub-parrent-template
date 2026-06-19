# hub-checkin — repo code chính (check-in)

Line **`hub-checkin`** là **repo sản phẩm chính** trong mô hình template: full `packages/` + `apps/hub-checkin/` mỏng.

## Compose từ packages

```text
packages/admin-app  ──► admin CRUD, generate route
       │ uses: ui, api-client, query-client, editor, logger, site-config
       ▼
apps/hub-checkin/hub-checkin-frontend  (native routes + admin.app.config)

packages/api-server ──► shared types / dev tooling (hub-checkin API = native copy đã commit)
       ▼
apps/hub-checkin/api  (native main-port từ main — commit, không regenerate khi pull)
```

**Cập nhật API:** sửa `apps/main/api` → `pnpm api:render apps/hub-checkin/api --mode=native` → commit. **`pnpm pull:checkin`** chỉ verify + admin (không cần regenerate trên server).

## Dev

| Mục đích | Lệnh |
|----------|------|
| **Repo chính (khuyến nghị)** | Clone `hub-checkin-monorepo` → `pnpm dev:checkin` |
| Sandbox template upstream | `pnpm dev:main:checkin` (main API + check-in UI) |
| Test stack hub-checkin | `pnpm dev:checkin` |
| Cập nhật packages (downstream) | `pnpm pull:template` |
| Regenerate check-in (template upstream) | `pnpm pull:checkin` (verify + admin; API đã commit) |
| Cập nhật API sau sửa main | `pnpm api:regenerate:checkin` → commit |
| Verify | `pnpm test:checkin:full` |

## API (`apps/hub-checkin/api`) — native committed

Logic nằm trong repo (`main-port` từ `apps/main/api`). **`materialize.committed: true`** — không generate lại khi `pull:checkin`.

```bash
pnpm pull:checkin              # verify native + admin (server / sau pull)
pnpm api:regenerate:checkin    # dev: render lại từ main (cần apps/main/api)
pnpm verify:checkin-api
pnpm verify:main-api-endpoint-parity
```

**Quy trình dev (monorepo có main):** sửa `apps/main/api` → `pnpm api:regenerate:checkin` → commit `apps/hub-checkin/api`.

## Frontend (`hub-checkin-frontend`)

**Admin:** `@workspace/admin-app` + `admin.app.config.json`:

```bash
pnpm admin:generate:checkin
pnpm verify:checkin-admin
```

**Native check-in (sửa tại app):**

- `src/app/(site)/`, `(portal)/`
- `src/app/admin/` — events shell, check-in (ngoài generate)

## Bootstrap repo mới

```bash
pnpm init:downstream hub-checkin ../hub-checkin-monorepo
```

## PM2

`pnpm pm2:start:checkin` — xem `ecosystem/checkin.cjs`.
