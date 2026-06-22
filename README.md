# mono-repo-template

Feature-template upstream cho các product HUB — **chỉ packages + generators**, không chạy app.

## Cung Cấp

- `packages/`: thư viện, UI, API client, API server, admin app.
- `packages/api-server/deploy/config/product-line-profiles.cjs`: profile theo product line.
- `script-system/`: pull template, init downstream, verify boundary, admin generator.
- `docs/`: pattern dùng chung.

## Không Cung Cấp (thuộc downstream)

- `apps/`, `data/`, `.env` runtime, Docker/PM2, dev stack, db bootstrap.

## Cài Đặt

```bash
pnpm install
pnpm check
```

## Lệnh Chính

```bash
pnpm build          # packages/*
pnpm lint
pnpm typecheck
pnpm check
pnpm push -- "feat: mô tả"
```

## Downstream Pull

```bash
pnpm pull:template
pnpm post-pull:downstream   # trong repo product
```

Product repo tự thêm `dev`, `pm2`, `env`, `data/` và deploy scripts.

## Tài Liệu

- `AGENTS.md`
- `docs/TEMPLATE_MONOREPO.md`
- `packages/README.md`
