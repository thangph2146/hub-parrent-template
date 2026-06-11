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

| Vùng | Ghi chú |
|------|---------|
| `src/app/(site)/`, `(portal)/` | **Native** — chỉ sửa tại đây |
| `src/app/admin/{module}/` (AUTO-GENERATED) | Re-export từ `@workspace/admin-app` — sửa package, chạy `pnpm admin:generate:checkin` |
| `src/app/admin/` còn lại | **Native** — events shell, check-in, layout |

Config: [`admin.app.config.json`](./admin.app.config.json). Chi tiết: [`docs/admin-pattern/ADMIN_APP_PACKAGE.md`](../../../docs/admin-pattern/ADMIN_APP_PACKAGE.md).

## Packages

- UI admin: `@workspace/ui`
- API: `@workspace/api-client` (không fetch trực tiếp)
