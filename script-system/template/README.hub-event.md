# hub-event-monorepo — repo code chính (packages-first)

Monorepo **sản phẩm check-in** — kế thừa **full** `packages/` từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

## Lớp compose (template chung)

| Lớp | Package | Vai trò |
|-----|---------|---------|
| **Admin UI** | `@workspace/admin-app` | CRUD admin + generate route → kéo `ui`, `api-client`, `query-client`, `editor`, … |
| **API Nest** | `@workspace/api-server` | Base CRUD + 47 modules → generate service trong app |
| **Apps** | `apps/hub-event/*` | Entity, `app.module.ts`, route native, env deploy |

Feature mới: sửa **`packages/admin-app`** hoặc **`packages/api-server`** trên template → `pnpm pull:template` ở đây.

## Lệnh hàng ngày

```bash
pnpm install
pnpm env:init checkin
pnpm dev:checkin          # @hub-event/api + check-in frontend
pnpm check
pnpm push -- "feat: ..."
```

## Cập nhật thư viện từ template

```bash
pnpm pull:template
pnpm install
pnpm --filter @workspace/api-server run build
pnpm check
```

## Generate (apps mỏng)

```bash
pnpm admin:generate:checkin   # route admin ← @workspace/admin-app
pnpm api:generate:checkin     # service API ← @workspace/api-server
pnpm verify:checkin-api
pnpm verify:checkin-admin
```

## Deploy

```bash
pnpm build
pnpm pm2:start:checkin
# hoặc PM2 reload sau pull
pnpm pm2:reload:checkin
```

Chi tiết: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md) · catalog [`packages/README.md`](packages/README.md).
