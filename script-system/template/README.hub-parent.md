# hub-parent-monorepo

Site HUB Parent — bootstrap từ [mono-repo-template](https://github.com/thangph2146/mono-repo-template.git).

## Khởi tạo repo mới

```bash
# Trên mono-repo-template (upstream)
node script-system/sync/init-downstream.cjs hub-parent ../my-hub-site
cd ../my-hub-site
```

## Chạy dev (3 bước)

```bash
# 1) Đổi tên project (tuỳ chọn)
#    Sửa field "name" trong package.json

pnpm install
pnpm dev          # API :3002 + storefront :3000
```

Cần MySQL local — chỉnh `apps/hub-parent/api/.env` (`DATABASE_URL`) nếu chưa có (post-pull tạo từ `.env.example`).

## Đồng bộ packages từ template

```bash
pnpm sync              # pull:template + post-pull (render API, overrides, …)
pnpm sync:full         # + pnpm check
```

## Cấu trúc

```
apps/hub-parent/
├── api/                 @hub-parent/api
└── hub-parent-frontend/ @frontend
packages/                ← kéo từ template
scripts/dev/             ← dev stack product-owned
```

## Production (Ubuntu)

```bash
pnpm build:prod
pnpm pm2:start
```
