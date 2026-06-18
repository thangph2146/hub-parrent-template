# store-sync-monorepo — HUB Store (packages-first)

Monorepo deploy HUB Store — kế thừa full `packages/` từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

## Lớp compose

| Lớp | Package / app | Vai trò |
|-----|----------------|---------|
| Storefront + admin | `apps/store-sync/store-sync-frontend` | Storefront + `/admin` |
| API | `apps/store-sync/api` | API catalog, cart, checkout |
| Thư viện | `packages/*` | UI, api-client, api-server, ... — `pnpm pull:template` |

Feature dùng chung: sửa `packages/*` trên template upstream rồi kéo về downstream bằng `pnpm pull:template`.

## Lệnh hàng ngày

```bash
pnpm install
pnpm env:init
pnpm dev:store
pnpm check
```

## Cập nhật thư viện từ template

```bash
pnpm pull:template
pnpm install
pnpm build:packages
pnpm check
git push -- "chore: sync template"
```

## Deploy

```bash
pnpm build
pnpm pm2:start:store
pnpm pm2:reload:store
```
