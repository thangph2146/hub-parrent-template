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

## API (`apps/hub-event/api`) — packages-first

App **chỉ giữ binding mỏng**; logic admin nằm trong `@workspace/api-server`:

| Lớp app (AUTO-GENERATED) | Package |
|--------------------------|---------|
| `*.service.ts` extends `Base*AdminService` | `modules/<domain>/*-admin.service.ts` |
| `*.controller.ts` extends `Package*Controller` | `modules/<domain>/*-admin.controller.ts` |
| `*.module.ts` | Nest wiring + entity imports |

**Native (chưa port package):** `public`, `system` — khai báo trong `api.app.config.json` → `native.controllers`.

```bash
pnpm pull:checkin          # build api-server + generate + admin
pnpm api:generate:checkin  # service binding + controller extend package
pnpm verify:checkin-api    # kiểm tra AUTO-GENERATED + extends package
```

Chuẩn hóa barrel package sau port admin:

```bash
node script-system/api/render-module-barrel.cjs
node script-system/api/normalize-admin-controllers.cjs
```

App giữ: `entities/`, `app.module.ts`, `api.app.config.json`, socket/public helpers.

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
