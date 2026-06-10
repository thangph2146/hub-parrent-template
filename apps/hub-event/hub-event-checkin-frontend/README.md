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
| `src/app/admin/*` trong `admin.sync-modules.json` | **Sync** từ `apps/main/backend` — sửa trên main, chạy `pnpm pull:checkin` |
| `src/app/admin/` còn lại | **Native** — events, check-in |

Manifest sync: [`admin.sync-modules.json`](./admin.sync-modules.json). Chi tiết line: [`../README.md`](../README.md).

## Packages

- UI admin: `@workspace/ui`
- API: `@workspace/api-client` (không fetch trực tiếp)
