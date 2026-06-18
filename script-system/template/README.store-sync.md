# store-sync-monorepo — HUB Store (packages-first)

Monorepo deploy **HUB Store** — kế thừa full `packages/` từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

> **Downstream:** sửa thư viện trên **template upstream trước** → `pnpm sync` ở đây.  
> Agent: [`AGENTS.md`](AGENTS.md) · flow: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md)

## Cấu trúc

```
packages/
apps/store-sync/
├── api/                    # @store-sync/api
└── store-sync-frontend/    # storefront + /admin
```

## Đồng bộ (flow chuẩn)

```bash
# 1) Trên mono-repo-template — LUÔN TRƯỚC
pnpm check && pnpm push -- "feat: ..."

# 2) Trên store-sync-monorepo
pnpm sync              # pull:template + post-pull (install + build + admin generate)
pnpm sync:full         # sync + pnpm check
pnpm dev:store
```

| Lệnh | Vai trò |
|------|---------|
| `pnpm pull:template` | Bước 1 — checkout packages/ + script-system |
| `pnpm post-pull:downstream` | Bước 2 — install, build, admin generate store |
| `pnpm sync` | Cả hai bước |

## Lệnh hàng ngày

```bash
pnpm install
pnpm env:init
pnpm dev:store
pnpm check
```

## Deploy

```bash
pnpm build
pnpm pm2:start:store
pnpm pm2:reload:store
```
