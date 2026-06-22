# Template Monorepo

`monorepo-template` là upstream dùng chung. Product repo pull code mới từ template nhưng tự giữ app/deploy config riêng.

## Template Cung Cấp

- `packages/`: thư viện, UI, API client, API server, admin app.
- Feature profiles: cấu hình module/API/admin/permissions theo product line.
- Generic generators: admin route generator và API render CLI.
- Generic sync: `pull-template.cjs`, `post-pull-downstream.cjs`.

## Template Không Cung Cấp

- `apps/`
- PM2/deploy scripts
- env runtime
- db bootstrap
- dev stack product
- script sync app/product-specific

## Flow Upstream

```bash
pnpm install
pnpm check
pnpm push -- "feat: mô tả"
```

## Flow Downstream

```bash
pnpm pull:template
pnpm post-pull:downstream
```

Downstream tự quyết định scripts như `dev`, `pm2`, `db`, `env`, `deploy`. Nếu cần thêm tính năng dùng chung, sửa ở template rồi push; product pull lại code mới.

## Manifest

`template.manifest.json` chỉ allowlist shared paths. Không thêm `apps/`, `ecosystem/`, hoặc product sync scripts vào `inheritPaths`.

## Bootstrap Product Mới

```bash
node script-system/sync/init-downstream.cjs hub-checkin ../hub-checkin-monorepo
```

Sau bootstrap, product repo cần tự thêm app code và scripts vận hành riêng.
