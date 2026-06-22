# hub-parent-monorepo — downstream product

Monorepo **site chính HUB** tự sở hữu `apps/hub-parent/` và scripts vận hành riêng. Repo này chỉ pull shared `packages/`, feature profiles và generic generators từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

> **Downstream:** sửa thư viện trên **template upstream trước** → `pnpm sync` ở đây.  
> Agent: [`AGENTS.md`](AGENTS.md) · flow: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md)

## Cấu trúc

```
packages/                         # Kéo từ template
apps/hub-parent/                  # Product-owned
├── api/                          # @hub-parent/api
└── hub-parent-frontend/          # @frontend — storefront + /admin
```

## Đồng bộ (flow chuẩn)

```bash
# 1) Trên mono-repo-template — LUÔN TRƯỚC
pnpm check && pnpm push -- "feat: ..."

# 2) Trên hub-parent-monorepo
pnpm sync              # pull:template + post-pull generic
pnpm sync:full         # sync + pnpm check
# thêm dev/deploy scripts riêng trong repo product
```

| Lệnh | Vai trò |
|------|---------|
| `pnpm pull:template` | Bước 1 — checkout packages/ + script-system |
| `pnpm post-pull:downstream` | Bước 2 — install, build, verify API |
| `pnpm sync` | Cả hai bước |

## Lệnh hàng ngày

```bash
pnpm install
pnpm sync
pnpm check
pnpm check
```

## Deploy

```bash
Tự cấu hình trong repo product.
```
