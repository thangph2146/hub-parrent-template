# Cấu trúc Monorepo (product lines)

Monorepo tổ chức theo **product line** — mỗi thư mục con trong `apps/` gồm **2 project deployable** (API + web). Phát triển đầy đủ tại `apps/main/`; các line khác **kế thừa** từ main và chỉ giữ tính năng cần thiết.

## Sơ đồ

```
apps/
├── main/                          # Phát triển chính (API + admin)
│   ├── api/          @api
│   └── backend/      @backend
├── hub-parent/                    # Site HUB công khai (deploy)
│   ├── api/          @hub-parent/api      ← sync từ main/api
│   └── hub-parent-frontend/  @frontend
├── hub-event/                     # Check-in sự kiện (deploy)
│   ├── api/          @hub-event/api      ← sync từ main/api
│   └── hub-event-checkin-frontend/  @hub-event-checkin-frontend
│                                   (storefront + admin check-in)
└── store-sync/                    # Store Sync (deploy)
    ├── api/          @store-sync/api     ← sync từ main/api
    └── store-sync-frontend/  @store-sync-frontend
```

## Vai trò từng line

| Line | Mục đích | Package | Port dev |
|------|----------|---------|----------|
| **main** | Source of truth — API đầy đủ + admin pages | `@api`, `@backend` | 3002, 3001 |
| **hub-parent** | Storefront site chính + API deploy | `@hub-parent/api`, `@frontend` | 3002, 3000 |
| **hub-event** | Check-in: frontend + admin gộp một app | `@hub-event/api`, `@hub-event-checkin-frontend` | 3002, 3000 |
| **store-sync** | Catalog / giỏ / checkout | `@store-sync/api`, `@store-sync-frontend` | 3002, 3000 |

## Kế thừa từ main

1. **API** (`hub-event`, `hub-parent`, `store-sync`): copy/sync từ `apps/main/api`.
   - Lệnh: `pnpm sync:api` (tất cả) hoặc `pnpm sync:api:hub-event`
   - File `api.sync-keep.json` trong API đích liệt kê file **không** ghi đè (mặc định giữ `src/app.module.ts` để cắt module).
2. **Admin check-in**: script `copy-admin-modules.mjs` trong `hub-event-checkin-frontend` copy page admin từ `apps/main/backend`.
3. **Packages** (`@workspace/ui`, `@workspace/api-client`, …): dùng chung — không import chéo `apps/*`.

## Dev stacks

| Lệnh | Apps chạy |
|------|-----------|
| `pnpm dev:main` | `@api` + `@backend` (phát triển chính) |
| `pnpm dev:main:checkin` | `@api` + `@backend` + `@hub-event-checkin-frontend` — không chạy `tsup --watch` lexical; Next dùng `--webpack`; **resource guard** tự dừng khi CPU/GPU tràn |

### Resource guard (CPU/GPU)

Mặc định bật trên `dev:main:checkin`. Vượt ngưỡng liên tục → dừng stack, exit code `2`, in hướng dẫn.

| Biến môi trường | Mặc định | Ý nghĩa |
|-----------------|----------|---------|
| `HUB_DEV_RESOURCE_GUARD` | `1` | `0` = tắt |
| `HUB_DEV_CPU_LIMIT_PERCENT` | `92` | % CPU hệ thống |
| `HUB_DEV_GPU_LIMIT_PERCENT` | `88` | % GPU (nvidia-smi hoặc Windows counter) |
| `HUB_DEV_RESOURCE_INTERVAL_MS` | `8000` | Chu kỳ đo |
| `HUB_DEV_RESOURCE_STRIKES` | `4` | Số lần vượt ngưỡng liên tiếp trước khi dừng |
| `HUB_DEV_RESOURCE_GRACE_MS` | `90000` | Bỏ qua giai đoạn compile ban đầu |
| `HUB_DEV_GPU_GUARD` | `1` | `0` = chỉ giám sát CPU |

Ví dụ nới ngưỡng: `HUB_DEV_CPU_LIMIT_PERCENT=96 HUB_DEV_GPU_LIMIT_PERCENT=94 pnpm dev:main:checkin`
| `pnpm dev:parent` | `@api` + `@backend` + `@frontend` |
| `pnpm dev:checkin` | `@hub-event/api` + `@hub-event-checkin-frontend` |
| `pnpm dev:store` | `@store-sync/api` + `@store-sync-frontend` |

## PM2 production

| Stack | Processes |
|-------|-----------|
| **parent** | `hub-parent-api`, `hub-parent-backend` (main), `hub-parent-frontend` |
| **checkin** | `hub-checkin-api`, `hub-checkin-frontend` (2 app) |
| **store** | `hub-store-api`, `hub-store-frontend` (2 app) |

## Workspace pnpm

`pnpm-workspace.yaml` dùng pattern `apps/*/*` — mỗi app là package con một cấp trong product line.

## Ranh giới (không đổi)

- Không import chéo source giữa `apps/*`.
- Next apps gọi API qua `@workspace/api-client`.
- Entity / MikroORM chỉ trong package API tương ứng.

Chi tiết microservice: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.
