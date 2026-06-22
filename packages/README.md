# `packages/` — shared platform packages

Downstream product repos kéo **toàn bộ** thư mục này qua `pnpm pull:template`. Upstream không chứa `apps/`.

## Lớp compose

Hầu hết tính năng đi qua **`admin-app`** (Next admin) và **`api-server`** (Nest API). App downstream chỉ bind qua `api.app.config.json` / `admin.app.config.json` và render theo feature profile.

| Package | Vai trò |
|---------|---------|
| **`@workspace/admin-app`** | CRUD admin modules + routing shared |
| **`@workspace/api-server`** | Base Nest CRUD + deploy/render tooling |
| `@workspace/ui` | Component admin/storefront |
| `@workspace/api-client` | SDK HTTP + permissions |
| `@workspace/query-client` | TanStack Query |
| `@workspace/logger` | Logging |
| `@workspace/site-config` | Site metadata |
| `@thangph2146/lexical-editor` | Rich text (`packages/editor`) |
| `@workspace/promo-codes` | Promo (store / parent lines) |
| `@workspace/dealer-support` | Dealer helpers (optional) |
| `@workspace/eslint-config` | ESLint shared |
| `@workspace/typescript-config` | TS config shared |

Feature profile theo product line: `packages/api-server/deploy/config/product-line-profiles.cjs`.

## Cấu trúc chuẩn mỗi package

```text
packages/<name>/
├── package.json      # exports + scripts lint/typecheck
├── tsconfig.json
├── src/              # source (hoặc deploy/ với api-server)
└── README.md         # khi package phức tạp (ui, api-server, editor)
```

Tooling-only (`eslint-config`, `typescript-config`) có thể chỉ export config, không cần `src/`.

## Ranh giới `api-server`

| Lớp | Đường dẫn | Quy tắc |
|-----|-----------|---------|
| Runtime shared | `packages/api-server/src/**` | Không hard-code product line |
| Deploy/render | `packages/api-server/deploy/**` | Đọc feature profile + app config |
| App binding | `apps/<line>/api/**` (downstream) | Modules, entities, overrides local |

Bật/tắt module theo line: sửa feature profile hoặc `api.app.config.json` ở downstream — không thêm nhánh product vào `packages/api-server/src/**`.

## Package theo product line

| Line | Packages dùng (logic) |
|------|------------------------|
| hub-checkin | ui, admin-app, api-client, api-server, query-client, logger, site-config, editor |
| hub-parent | ui, api-client, api-server, query-client, logger, site-config, editor, promo-codes |
| store-sync | ui, api-client, api-server, query-client, promo-codes |

Downstream vẫn pull full `packages/`; profile chỉ là hợp đồng render/verify.

## Workflow

**Upstream (template):**

```bash
pnpm check && pnpm push -- "feat: ..."
```

**Downstream (product):**

```bash
pnpm sync    # pull:template + post-pull (install, build, render profile)
pnpm check
```

Doc: [`docs/TEMPLATE_MONOREPO.md`](../docs/TEMPLATE_MONOREPO.md) · API server: [`api-server/README.md`](api-server/README.md).
