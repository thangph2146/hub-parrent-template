# mono-repo-template

Feature-template upstream cho các product HUB.

Repo này chỉ giữ code dùng chung:

- `packages/`: thư viện và generator source dùng chung.
- `packages/api-server/deploy/config/product-line-profiles.cjs`: cấu hình tính năng theo product line.
- `script-system/`: tooling generic tối thiểu để pull template, post-pull và verify shared boundary.
- `docs/`: pattern dùng chung.

Repo này **không chứa `apps/`**. Product apps, env runtime, PM2, database bootstrap và deploy scripts thuộc từng downstream product.

## Cài Đặt

```bash
pnpm install
pnpm check
```

## Lệnh Chính

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm check
pnpm push -- "feat: mô tả"
```

## Downstream Pull

Product repo kéo code dùng chung bằng:

```bash
pnpm pull:template
pnpm post-pull:downstream
```

Downstream tự giữ `apps/` và các scripts vận hành riêng. Template không sync app code.

## Tài Liệu

- `AGENTS.md`
- `docs/TEMPLATE_MONOREPO.md`
- `docs/MONOREPO_STRUCTURE.md`
- `packages/README.md`
- `packages/api-server/README.md`
