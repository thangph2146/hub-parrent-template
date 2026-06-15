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

### `parent` — site chính (PM2 `ecosystem/main`)

| App | File | Port |
|-----|------|------|
| `@hub-parent/api` | `apps/hub-parent/api/.env` | 3002 |
| `@backend` | `apps/main/backend/.env` | 3001 |
| `@frontend` | `apps/hub-parent/hub-parent-frontend/.env` | 3000 |

```bash
pnpm env:init parent
pnpm dev:parent
```

### `checkin` — check-in sự kiện (PM2 `ecosystem/checkin`)

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

## Tên database mặc định (MySQL local)

| API | `DATABASE_URL` (schema) | Lệnh bootstrap |
|-----|-------------------------|----------------|
| `@api` (main) | `hub_parent` | `pnpm db:fresh` |
| `@hub-parent/api` | `hub_parent` | — |
| `@hub-event/api` | `hub_event` | `pnpm db:bootstrap:checkin` |
| `@store-sync/api` | `hub_store` | `pnpm db:bootstrap:store` |

Nguồn sự thật `.env.example` API deploy: `script-system/env/api-env-profiles.cjs` — sau `pnpm api:render` tự ghi lại; cập nhật tay: `pnpm env:sync-api-examples`.

### HANET (check-in / camera AI)

Chỉ **`@api` (main)** và **`@hub-event/api`** — cùng khối biến, sinh từ `api-env-profiles.cjs`.

| Biến | Bắt buộc | Mô tả |
|------|----------|--------|
| `HANET_CLIENT_ID` | Có | Client ID trên [developers.hanet.ai](https://developers.hanet.ai/apps) |
| `HANET_CLIENT_SECRET` | Có | Client secret — dùng OAuth refresh + verify webhook hash |
| `HANET_ACCESS_TOKEN` | Một trong hai | Access token (có thể hết hạn) |
| `HANET_REFRESH_TOKEN` | Một trong hai | Refresh token — API tự refresh khi access hết hạn |
| `HANET_API_BASE_URL` | Không | Mặc định `https://partner.hanet.ai` |
| `HANET_OAUTH_URL` | Không | Mặc định `https://oauth.hanet.com/token` |
| `HANET_WEBHOOK_VERIFY` | Không | `true` — kiểm MD5(`client_secret` + `id`) trên webhook |
| `HANET_WEBHOOK_VERIFY_REQUIRED` | Không | `true` — từ chối webhook thiếu/sai hash (production) |
| `HANET_WEBHOOK_KEYCODE` | Không | Khớp field `keycode` trong payload (nếu app HANET có cấu hình) |
| `HANET_DEFAULT_PLACE_ID` | Không | placeID mặc định khi gọi partner API (`/place/getPlaces`, register, checkin query) |

**Ảnh khuôn mặt (`registerByUrl`):** upload cổng SV lưu **JPG** (không WebP). URL gửi HANET phải public HTTPS — cấu hình `API_PUBLIC_URL=https://domain-cua-ban/api` trên API (production). Dev localhost HANET không tải được.

**Tự động đăng ký face:** khi sinh viên **lưu avatar** (PUT `/admin/accounts`) hoặc **đăng ký sự kiện** (đã có avatar), API gọi `registerByUrl` nếu `HANET_AUTO_REGISTER_FACE=true` (mặc định) và OAuth đã cấu hình.

**Admin partner API** (cần OAuth + quyền `events:view`):

| Endpoint hub | HANET Postman |
|--------------|---------------|
| `POST /api/admin/hanet/test-partner` | `/profile/getProfile` |
| `GET /api/admin/hanet/profile` | `/profile/getProfile` (alias, cần API mới) |
| `GET /api/admin/hanet/devices/connection-status?deviceId=` | `/device/getConnectionStatus` (`deviceIDs` trên partner) |
| `GET /api/admin/hanet/places` | `/place/getPlaces` |
| `GET /api/admin/hanet/devices?placeId=` | `/device/getListDeviceByPlace` |
| `POST /api/admin/hanet/person/register-by-url` | `/person/registerByUrl` |
| `GET /api/admin/hanet/checkins?placeId=&date=` | `/person/getCheckinByPlaceIdInDay` |
| `GET /api/admin/hanet/persons?placeId=&pageIndex=&pageSize=` | `/person/getListByPlace` |
| `POST /api/admin/hanet/persons/sync?placeId=` | Đồng bộ avatar → bảng `face_data` |
| `GET /api/admin/hanet/avatars?page=&limit=&search=` | Danh sách avatar đã lưu local |

**Dev `main-checkin`:** stack dùng `apps/main/api/.env` — copy khối HANET từ `hub-event` hoặc điền trực tiếp. **Deploy check-in:** `apps/hub-event/api/.env`.

Chi tiết từng biến: mở `.env.example` tương ứng trong từng app.

## Lưu trữ disk (upload)

| Biến | App | Mô tả |
|------|-----|--------|
| `STORAGE_DIR` | API (`@api`, `@hub-* /api`) | Thư mục gốc upload + cache resize |

Cấu trúc `uploads/` và seed JSON: [`docs/storage/README.md`](../storage/README.md) · [`data/README.md`](../../data/README.md).
