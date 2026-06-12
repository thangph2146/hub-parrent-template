# hub-event — repo code chính (check-in)

Line **`hub-event`** là **repo sản phẩm chính** trong mô hình template: full `packages/` + `apps/hub-event/` mỏng.

## Compose từ packages

```text
packages/admin-app  ──► admin CRUD, generate route
       │ uses: ui, api-client, query-client, editor, logger, site-config
       ▼
apps/hub-event/hub-event-checkin-frontend  (native routes + admin.app.config)

packages/api-server ──► base Nest CRUD, generate service
       ▼
apps/hub-event/api  (entities, app.module.ts, api.app.config.json)
```

**Không** sync copy từ `apps/main/` (`pull:checkin` legacy). Cập nhật thư viện: `pnpm pull:template` trên **hub-event-monorepo**.

## Dev

| Mục đích | Lệnh |
|----------|------|
| **Repo chính (khuyến nghị)** | Clone `hub-event-monorepo` → `pnpm dev:checkin` |
| Sandbox template upstream | `pnpm dev:main:checkin` (main API + UI — legacy dev) |
| Test stack hub-event | `pnpm dev:checkin` |
| Cập nhật packages | `pnpm pull:template` |
| Verify | `pnpm test:checkin:full` |

## API (`apps/hub-event/api`)

**Giữ local (không ghi đè khi pull:template):**

- `api.sync-profile.json` — subset module (nếu còn dùng)
- `api.app.config.json` — scaffold `@workspace/api-server`
- `src/app.module.ts` — composition
- `src/entities/`, migrations, seeders

**Generate service từ package:**

```bash
pnpm api:generate:checkin
pnpm verify:checkin-api
```

## Frontend (`hub-event-checkin-frontend`)

**Admin:** module trong `@workspace/admin-app` + `admin.app.config.json`:

```bash
pnpm admin:generate:checkin
pnpm verify:checkin-admin
```

**Native check-in (sửa tại app):**

- `src/app/(site)/`, `(portal)/`
- `src/app/admin/` — events, check-in shell (ngoài generate)

## Bootstrap repo mới

Từ template upstream:

```bash
pnpm init:downstream hub-event ../hub-event-monorepo
```

## PM2

`pnpm pm2:start:checkin` — xem `ecosystem.checkin.cjs`.
