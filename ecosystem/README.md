# PM2 ecosystem (production)

**Mọi** file PM2 nằm trong thư mục này — **không** có `ecosystem.*.cjs` ở repo root.

## Cấu trúc

| File | Stack | Lệnh |
|------|-------|------|
| `shared.cjs` | Factory chung | — |
| `main.cjs` | Site chính (3 app) | `pnpm pm2:start` |
| `checkin.cjs` | Check-in (2 app) | `pnpm pm2:start:checkin` |
| `store.cjs` | Store sync (2 app) | `pnpm pm2:start:store` |
| `config.cjs` | Alias → `main.cjs` | `pm2 start ecosystem/config.cjs` |
| `pm2-stack.cjs` | CLI start/reload/delete | `pnpm pm2:*` |

## PM2 trực tiếp (từ repo root)

```bash
pm2 start ecosystem/config.cjs      # site chính (mặc định)
pm2 start ecosystem/checkin.cjs
pm2 start ecosystem/store.cjs
pm2 reload ecosystem/config.cjs --update-env
```

## Stack site chính (`main`)

| Process | Port | Thư mục |
|---------|------|---------|
| `hub-parent-api` | 3002 | `apps/hub-parent/api` |
| `hub-parent-backend` | 3001 | `apps/main/backend` |
| `hub-parent-frontend` | 3000 | `apps/hub-parent/hub-parent-frontend` |

## Stack check-in (`checkin`)

| Process | Port |
|---------|------|
| `hub-checkin-api` | 3002 |
| `hub-checkin-frontend` | 3000 |

## Stack store (`store`)

| Process | Port |
|---------|------|
| `hub-store-api` | 3002 |
| `hub-store-frontend` | 3000 |

**Không chạy đồng thời** hai stack trên cùng máy — trùng port 3000–3002.

## Artifact sinh ra

`ecosystem/.pm2-ecosystem-*.json` — gitignore, tạo bởi `pm2-stack.cjs`.

Kiểm tra: `pnpm verify:ecosystem`
