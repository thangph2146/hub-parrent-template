# Template Monorepo

`monorepo-template` là upstream dùng chung. Product repo pull `packages/` + generators; **apps và dev scripts** đi kèm starter pack khi bootstrap.

## Template Cung Cấp

- `packages/`: thư viện, UI, API client, API server, admin app.
- Feature profiles: cấu hình module/API/admin/permissions theo product line.
- Generators: admin route generator, API render CLI.
- Sync: `pull-template`, `post-pull-downstream`, `init-downstream`.
- **Starter pack** (`script-system/template/starter/<line>/`): apps + scripts dev/pm2 (hub-parent).

## Template Không Chạy App

Upstream chỉ `pnpm check` trên packages. Dev stack chạy trên **downstream** sau bootstrap.

## Bootstrap Product Mới (hub-parent)

```bash
# Trên mono-repo-template
node script-system/sync/init-downstream.cjs hub-parent ../my-hub-site
cd ../my-hub-site

# Đổi tên (tuỳ chọn): sửa "name" trong package.json
pnpm install
pnpm dev
```

`init-downstream` tự: copy starter → pull template → post-pull (render API, .env, overrides).

## Flow Upstream

```bash
pnpm install
pnpm check
pnpm push -- "feat: mô tả"
```

## Flow Downstream (repo đã có apps)

```bash
pnpm sync
pnpm dev

# Push repo product + cập nhật packages lên mono-repo-template
pnpm push -- "feat: mô tả"

# Chỉ push repo product (apps/scripts local)
pnpm push -- --skip-template "feat: hub-parent only"

# Chỉ đẩy packages → template (không push repo product)
pnpm push:template -- "feat: shared packages"
```

`pnpm push` (downstream):

1. Commit + push `origin main` repo product (apps, scripts, …).
2. Copy `inheritPaths` sang checkout `../monorepo-template` (hoặc `TEMPLATE_REPO_PATH`).
3. `pnpm check` trên template → commit → push `origin main` upstream.

Downstream giữ `apps/`, `scripts/` qua `keepPaths` khi pull/push template.

## Manifest

`template.manifest.json` allowlist shared paths. Starter không sync — đã copy vào repo product lúc init.
