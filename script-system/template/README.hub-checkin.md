# hub-checkin-monorepo — repo code chính (packages-first)

Monorepo **sản phẩm check-in** — kế thừa **full** `packages/` từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

> **Downstream:** không có `apps/main/`. Sửa thư viện trên **template upstream trước** → `pnpm sync` ở đây.  
> Agent: [`AGENTS.md`](AGENTS.md) · flow: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md)

## Cấu trúc microservice

```
packages/                    # Thư viện — kéo từ template (không sửa lâu dài)
apps/hub-checkin/
├── api/                     # check-in API
└── hub-checkin-frontend/
```

## Đồng bộ (flow chuẩn)

```bash
# 1) Trên mono-repo-template — LUÔN TRƯỚC
pnpm check && pnpm push -- "feat: ..."

# 2) Trên hub-checkin-monorepo
pnpm sync              # pull:template + post-pull (install + build + pull:checkin)
pnpm sync:full         # sync + pnpm check
pnpm dev:checkin
```

| Lệnh | Vai trò |
|------|---------|
| `pnpm pull:template` | Bước 1 — checkout packages/ + script-system từ remote `template` |
| `pnpm post-pull:downstream` | Bước 2 — install, build, pull:checkin |
| `pnpm sync` | Cả hai bước |

## Lệnh hàng ngày

```bash
pnpm install
pnpm env:init
pnpm dev:checkin
pnpm check
```

## Deploy

```bash
pnpm build
pnpm pm2:start:checkin
pnpm pm2:reload:checkin
```

Catalog: [`packages/README.md`](packages/README.md)
