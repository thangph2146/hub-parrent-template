# store-sync-monorepo — downstream product

Monorepo **HUB Store** tự sở hữu `apps/store-sync/` và scripts vận hành riêng. Repo này chỉ pull shared `packages/`, feature profiles và generic generators từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

> **Downstream:** sửa thư viện trên **template upstream trước** → `pnpm sync` ở đây.  
> Agent: [`AGENTS.md`](AGENTS.md) · flow: [`docs/TEMPLATE_MONOREPO.md`](docs/TEMPLATE_MONOREPO.md)

## Cấu trúc

```
packages/                   # Kéo từ template
apps/store-sync/            # Product-owned
├── api/                    # @store-sync/api
└── store-sync-frontend/    # storefront + /admin
```

## Đồng bộ (flow chuẩn)

```bash
# 1) Trên mono-repo-template — LUÔN TRƯỚC
pnpm check && pnpm push -- "feat: ..."

# 2) Trên store-sync-monorepo
pnpm sync              # pull:template + post-pull generic
pnpm sync:full         # sync + pnpm check
# thêm dev/deploy scripts riêng trong repo product
```

| Lệnh | Vai trò |
|------|---------|
| `pnpm pull:template` | Bước 1 — checkout packages/ + script-system |
| `pnpm post-pull:downstream` | Bước 2 — install, build, admin generate store |
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
