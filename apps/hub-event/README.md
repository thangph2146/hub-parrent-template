# hub-event — deploy check-in

Line deploy gồm `@hub-event/api` + `@hub-event-checkin-frontend`. **Không** phát triển feature đầy đủ tại đây — dev trên `apps/main/`, đồng bộ khi cần deploy.

## Dev

| Mục đích | Lệnh |
|----------|------|
| Hàng ngày (UI check-in + API main) | `pnpm dev:main:checkin` |
| Test stack deploy thật | `pnpm dev:checkin` |
| Sau pull — cập nhật từ main | `pnpm pull:checkin` |
| Deploy server | `git pull origin hub-event` (branch deploy, sau `pnpm push:deploy` / CI) |
| Verify sync (không chạy server) | `pnpm test:checkin` |
| Verify + typecheck hub-event | `pnpm test:checkin:full` |

## API (`apps/hub-event/api`)

Subset sync từ `apps/main/api` theo [`api/api.sync-profile.json`](./api/api.sync-profile.json).

**Sửa trực tiếp tại đây** (local, không ghi đè):

- `api.sync-profile.json` — rule exclude/include
- `src/app.module.ts` — composition module check-in
- `src/seeders/DatabaseSeeder.ts` — seed tối thiểu
- `package.json` — tên package `@hub-event/api`

Mọi module/controller/entity khác: sửa trên **main** rồi `pnpm pull:checkin`.

## Frontend (`hub-event-checkin-frontend`)

### Admin — sync từ main (`admin.sync-modules.json`)

Các thư mục dưới `src/app/admin/` **copy từ** `apps/main/backend` khi `pnpm pull:checkin` — **không sửa lâu dài tại đây**:

`staff`, `rbac`, `categories`, `tags`, `guides`, `posts`, `cameras`, `templates`, `screens`, `locations`, `speakers`, `settings`, `file-storage`, `data`, `tong-quan`

**Không sync:** kho/đơn hàng (`products`, `orders`, `promo-codes`, `carts`), đào tạo, phụ huynh/SV, graph/CSDL.

**Menu sidebar** (`src/config/admin/checkin-admin-menu-tree.tsx`): **auto-generated** từ `admin-menu-tree.items.ts` — lọc theo `admin.sync-modules.json` → `menu`. Sửa menu main rồi `pnpm pull:checkin`.

### Native check-in (giữ tại line này)

- `src/app/(site)/` — storefront / landing
- `src/app/(portal)/` — portal guest
- `src/app/admin/` — route **events / check-in** và layout riêng (không nằm whitelist sync)
- Auth, profile, check-in ký túc xá, v.v.

Khi thêm admin module mới cho check-in only: thêm vào native, **không** thêm vào `admin.sync-modules.json` trừ khi module đó cũng tồn tại trên main và cần mirror.

## PM2

Stack check-in: `pnpm pm2:start:checkin` — xem `AGENTS.md` / `docs/MONOREPO_STRUCTURE.md`.
