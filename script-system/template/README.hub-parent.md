# hub-parent-monorepo — site chính HUB (packages-first)

Monorepo **deploy site chính** — kế thừi **full** `packages/` từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

## Lớp compose

| Lớp | Package / app | Vai trò |
|-----|----------------|---------|
| **Storefront + admin** | `apps/hub-parent/hub-parent-frontend` | Site công khai + `/admin` |
| **API** | `apps/hub-parent/api` | API deploy site chính |
| **Thư viện** | `packages/*` | UI, api-client, api-server, … — `pnpm pull:template` |

Feature dùng chung: sửa **`packages/*`** trên template upstream → tag → `pnpm pull:template` ở đây.

## Lệnh hàng ngày

```bash
pnpm install
pnpm env:init parent
pnpm dev:parent          # API :3002 + storefront :3000
pnpm check
```

## Cập nhật thư viện từ template

```bash
pnpm pull:template
# hoặc pin tag:
pnpm pull:template -- --ref template/v2026.06.18
pnpm install
pnpm build:packages
pnpm check
git push -- "chore: sync template"
```

## Deploy

```bash
pnpm build
pnpm pm2:start
pnpm pm2:reload
```

Chi tiết: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md) · upstream dev: `mono-repo-template` (`apps/main`).
