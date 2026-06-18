# hub-parent-monorepo — site chính HUB (packages-first)

Monorepo **deploy site chính** — kế thừa **full** `packages/` từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

> **Downstream:** sửa thư viện trên **template upstream trước** → `pnpm sync` ở đây.  
> Agent: [`AGENTS.md`](AGENTS.md) · flow: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md)

## Cấu trúc

```
packages/                         # Thư viện — kéo từ template
apps/hub-parent/
├── api/                          # @hub-parent/api
└── hub-parent-frontend/          # @frontend — storefront + /admin
```

## Đồng bộ (flow chuẩn)

```bash
# 1) Trên mono-repo-template — LUÔN TRƯỚC
pnpm check && pnpm push -- "feat: ..."

# 2) Trên hub-parent-monorepo
pnpm sync              # pull:template + post-pull (install + build + verify)
pnpm sync:full         # sync + pnpm check
pnpm dev:parent
```

| Lệnh | Vai trò |
|------|---------|
| `pnpm pull:template` | Bước 1 — checkout packages/ + script-system |
| `pnpm post-pull:downstream` | Bước 2 — install, build, verify API |
| `pnpm sync` | Cả hai bước |

## Lệnh hàng ngày

```bash
pnpm install
pnpm env:init parent
pnpm dev:parent          # API :3002 + storefront :3000
pnpm check
```

## Deploy

```bash
pnpm build
pnpm pm2:start
pnpm pm2:reload
```
