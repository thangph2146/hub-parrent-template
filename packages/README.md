# `packages/` — thư viện đầy đủ (mono-repo-template)

Mọi monorepo **downstream** kéo **toàn bộ** thư mục này qua `pnpm pull:template`.  
**Apps không copy logic** — chỉ compose từ các package dưới đây.

## Bản đồ package

| Package | Vai trò | App dùng qua |
|---------|---------|--------------|
| **`@workspace/ui`** | Component admin + storefront (`@ui/*` trên app Next) | import `@ui/components/...` |
| **`@workspace/admin-app`** | CRUD admin modules + generate route | `@workspace/admin-app/modules/...` |
| **`@workspace/api-client`** | SDK HTTP + types + permissions | `api.users`, `api.events`, … |
| **`@workspace/api-server`** | Base Nest CRUD + 47 domain modules | extend `Base*Service` / generate scaffold |
| **`@workspace/query-client`** | TanStack Query hub | provider + hooks |
| **`@workspace/logger`** | Logging | `@workspace/logger` |
| **`@workspace/site-config`** | Site metadata | config public/admin |
| **`@thangph2146/lexical-editor`** | Rich text editor | admin posts, guides |
| **`@workspace/promo-codes`** | Promo logic | store / checkout |
| **`@workspace/dealer-support`** | Dealer support helpers | tùy app |
| **`@workspace/eslint-config`** | ESLint shared | devDependency |
| **`@workspace/typescript-config`** | TS config shared | extends |

Chi tiết graph: [`packages/.graphify/markdown/PACKAGE_INDEX.md`](.graphify/markdown/PACKAGE_INDEX.md).

## Ranh giới bắt buộc

| Việc | Làm ở | Không làm ở `apps/` |
|------|--------|---------------------|
| Component admin UI | `packages/ui` | `apps/*/src/components/admin` |
| Page CRUD admin | `packages/admin-app` | copy module admin local |
| Gọi API HTTP | `packages/api-client` | `fetch` / `sdk.http` |
| Logic CRUD Nest dùng chung | `packages/api-server` | copy service từ app khác |
| Entity, migration, seed | `apps/<line>/api` | — |
| `app.module.ts`, sync profile | `apps/<line>/api` | — |
| Route native (check-in UI) | `apps/<line>/*-frontend` | — |

## API Nest — pattern packages-first

1. Entity + migration trong `apps/<line>/api/src/entities/`.
2. Service app **extend** `Base*Service` từ `@workspace/api-server` (hoặc AUTO-GENERATED từ `api.app.config.json`).
3. Controller giữ local khi cần header/auth đặc thù.
4. **Không** sync copy cả `apps/main/api` sang line deploy — dùng generate + package.

Xem [`packages/api-server/README.md`](api-server/README.md).

## Admin Next — pattern packages-first

1. Module CRUD trong `packages/admin-app/src/modules/`.
2. App khai báo `admin.app.config.json` + `pnpm admin:generate:<line>`.
3. Route Next = re-export mỏng (AUTO-GENERATED).

Xem [`docs/admin-pattern/ADMIN_APP_PACKAGE.md`](../docs/admin-pattern/ADMIN_APP_PACKAGE.md).

## Cập nhật downstream

```bash
pnpm pull:template
pnpm install
pnpm check
```

Tag template: `git tag template/vYYYY.MM.DD` trên repo upstream.
