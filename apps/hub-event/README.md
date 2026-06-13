# hub-event — repo code chính (check-in)

Line **`hub-event`** là **repo sản phẩm chính** trong mô hình template: full `packages/` + `apps/hub-event/` mỏng.

## Compose từ packages

```text
packages/admin-app  ──► admin CRUD, generate route
       │ uses: ui, api-client, query-client, editor, logger, site-config
       ▼
apps/hub-event/hub-event-checkin-frontend  (native routes + admin.app.config)

packages/api-server ──► base Nest (unified + binding services)
       ▼
apps/hub-event/api  (entities, app.module.ts, api.app.config.json)
```

**Không** copy logic từ `apps/main/api` (`pnpm pull:checkin:legacy`). Cập nhật thư viện downstream: **`pnpm pull:template`**.

## Dev

| Mục đích | Lệnh |
|----------|------|
| **Repo chính (khuyến nghị)** | Clone `hub-event-monorepo` → `pnpm dev:checkin` |
| Sandbox template upstream | `pnpm dev:main:checkin` (main API + check-in UI) |
| Test stack hub-event | `pnpm dev:checkin` |
| Cập nhật packages (downstream) | `pnpm pull:template` |
| Regenerate check-in (template upstream) | `pnpm pull:checkin` |
| Verify | `pnpm test:checkin:full` |

## API (`apps/hub-event/api`) — packages-first

App **chỉ giữ binding mỏng**; logic admin nằm trong `@workspace/api-server`:

| Lớp app (AUTO-GENERATED) | Package |
|--------------------------|---------|
| `*.service.ts` extends `Base*Service` | `modules/<domain>/*.service.ts` |
| `*.controller.ts` extends `Base*Controller` | `modules/<domain>/*.controller.ts` |
| `*.module.ts` | Nest wiring + entity imports |

**Unified modules (HTTP + service trong package):** `posts`, `events`, `comments`, `accounts`, `page-contents`, `notifications`, `sessions`, `event-checkins`, `event-registrations`, `event-speakers`, `uploads`, `system`, `auth`.

**Native controller (app):** chỉ `public` — khai báo `api.app.config.json` → `native.controllers`.

**Native logic (không generate):** `dashboard`, `hanet`, `public/*`, `event-registration-attendance`, …

```bash
pnpm pull:checkin          # build + generate + admin (packages-first)
pnpm api:generate:checkin  # chỉ API scaffold
pnpm verify:checkin-api
pnpm verify:main-api-endpoint-parity
```

App giữ: `entities/`, `app.module.ts`, `api.app.config.json`, seed, socket/public helpers.

## Frontend (`hub-event-checkin-frontend`)

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
pnpm init:downstream hub-event ../hub-event-monorepo
```

## PM2

`pnpm pm2:start:checkin` — xem `ecosystem.checkin.cjs`.
