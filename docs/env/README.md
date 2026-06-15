# Biến môi trường (monorepo)

Mỗi **app deployable** có một file mẫu **`.env.example`** (commit git) và **`.env`** (local, đã gitignore).

## Nguyên tắc

| Quy tắc | Chi tiết |
|---------|----------|
| Một app = một `.env` | Không dùng `.env.local` trừ khi Next.js tự tạo khi dev |
| `.env.example` | **Commit git** — mẫu không secret; app Next dùng `.env*` + `!.env.example` |
| `NEXT_PUBLIC_*` | Nhúng lúc **build** — đổi production phải build lại |
| Secret | `JWT_*`, `GOOGLE_*`, password DB — không commit |
| API CORS | Biến đúng trong code Nest: **`ALLOWED_ORIGINS`** (không phải `CORS_ORIGINS`) |
| Registry | `script-system/env/manifest.cjs` — danh sách app theo stack |

Marker trong mỗi `.env.example` (để verify):

```env
# ENV_TEMPLATE=api-main
# ENV_STACK=main
```

## Stack → file `.env`

### `main` — source of truth (dev API + admin)

| App | File | Port |
|-----|------|------|
| `@api` | `apps/main/api/.env` | 3002 |
| `@backend` | `apps/main/backend/.env` | 3001 |

```bash
pnpm env:init main
```

### `parent` — site chính (PM2 `ecosystem.main`)

| App | File | Port |
|-----|------|------|
| `@hub-parent/api` | `apps/hub-parent/api/.env` | 3002 |
| `@backend` | `apps/main/backend/.env` | 3001 |
| `@frontend` | `apps/hub-parent/hub-parent-frontend/.env` | 3000 |

```bash
pnpm env:init parent
pnpm dev:parent
```

### `checkin` — check-in sự kiện (PM2 `ecosystem.checkin`)

| App | File | Port |
|-----|------|------|
| `@hub-event/api` | `apps/hub-event/api/.env` | 3002 |
| `@hub-event-checkin-frontend` | `apps/hub-event/hub-event-checkin-frontend/.env` | 3000 |

Admin gộp trong frontend tại `/admin` — **không** có `@backend` riêng.

```bash
pnpm env:init checkin
pnpm dev:checkin
```

### `store` — storefront store-sync

| App | File | Port |
|-----|------|------|
| `@store-sync/api` | `apps/store-sync/api/.env` | 3002 |
| `@store-sync-frontend` | `apps/store-sync/store-sync-frontend/.env` | 3000 |

```bash
pnpm env:init store
pnpm db:bootstrap:store   # DB trống hub_store: schema + seed mẫu
pnpm dev:store
```

## Lệnh

```bash
# Tạo .env từ .env.example (không ghi đè file đã có)
pnpm env:init parent
pnpm env:init checkin
pnpm env:init all

# Ghi đè .env (cẩn thận)
node script-system/env/init-env.cjs --force checkin

# Chuẩn hóa .env hiện có theo .env.example (giữ giá trị, backup .env.bak)
pnpm env:reorganize
node script-system/env/reorganize-env.cjs checkin
node script-system/env/reorganize-env.cjs --dry-run all

# Kiểm tra đủ .env.example + marker chuẩn
pnpm verify:env
```

## Docker

File gốc repo: `.env.docker.example` → copy thành `.env` cạnh `docker-compose.yml`.

Compose map biến vào container; API runtime dùng `ALLOWED_ORIGINS` giống chạy local.

## Template loại app

| `ENV_TEMPLATE` | Dùng cho |
|----------------|----------|
| `api-main` | `apps/main/api` |
| `api-hub-parent` | `apps/hub-parent/api` |
| `api-hub-event` | `apps/hub-event/api` |
| `api-store-sync` | `apps/store-sync/api` |
| `next-admin` | `apps/main/backend` |
| `next-storefront-parent` | `apps/hub-parent/hub-parent-frontend` |
| `next-storefront-store` | `apps/store-sync/store-sync-frontend` |
| `next-checkin` | `apps/hub-event/hub-event-checkin-frontend` |

Chi tiết từng biến: mở `.env.example` tương ứng trong từng app.
