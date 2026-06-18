# @hub-event-checkin-frontend

Next.js — storefront + admin check-in sự kiện. Package trong line deploy `hub-event`.

## Dev

```bash
# Khuyến nghị: main API + backend + UI này
pnpm dev:main:checkin

# Stack deploy (hub-event API + UI này)
pnpm dev:checkin
```

Port mặc định: **3000**.

## Cấu trúc source

```
config/                # Manifest app — admin + portal (JSON)
  admin.app.config.json
  portal.app.config.json
src/
  app/
    (site)/          # Trang công khai — landing, catalog, chi tiết sự kiện
    (portal)/        # Cổng SV / khách — re-export @workspace/admin-app
    (auth)/          # Đăng nhập portal + redirect legacy
    admin/           # Admin BTC — AUTO-GENERATED + native (events shell, check-in)
  config/
    admin/           # Menu, layout, access admin BTC
    portal/          # Menu, layout, access cổng SV/khách
  providers/
    admin/           # Auth, query, layout admin
    portal/          # Layout bridge cổng SV/khách
  lib/
    admin/           # Re-export/sync từ main backend admin lib
    portal/          # Session, routes, auth cổng SV/khách
    site/            # API public, catalog, đăng ký sự kiện
    auth-routes.ts   # Helper redirect an toàn
  features/
    admin-auth/      # Form đăng nhập admin (native, verify yêu cầu)
    auth/            # Form đăng nhập portal
  components/
    shared/          # Header, footer, card sự kiện site
    admin/events/    # UI native module sự kiện (admin root /admin)
  hooks/             # Catalog sự kiện, v.v.
```

| Vùng | Ghi chú |
|------|---------|
| `src/app/(site)/`, `(portal)/`, `(auth)/` | **Native** — chỉ sửa tại đây |
| `src/app/admin/{module}/` (AUTO-GENERATED) | Re-export từ `@workspace/admin-app` — sửa package, chạy `pnpm admin:generate:checkin` |
| `src/app/admin/` (page, new, [id], …) | **Native** — shell quản lý sự kiện tại `/admin` |
| `src/components/admin/events/` | **Native** — table, form, live check-in cho module sự kiện |

Config:

| File | Vai trò |
|------|---------|
| `config/admin.app.config.json` | Admin modules, menu, native files |
| `config/portal.app.config.json` | Cổng SV/khách |

`src/config/` — code TypeScript đọc JSON trên (access, menu, layout).

Chi tiết admin package: [`docs/admin-pattern/ADMIN_APP_PACKAGE.md`](../../../docs/admin-pattern/ADMIN_APP_PACKAGE.md).

## Packages

- UI admin: `@workspace/ui` (import qua alias `@ui/...`)
- API: `@workspace/api-client` (không fetch trực tiếp)
