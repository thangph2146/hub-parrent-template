# Cấu trúc Monorepo (product lines)

> **Mô hình template (khuyến nghị):** [`docs/TEMPLATE_MONOREPO.md`](TEMPLATE_MONOREPO.md) — upstream = repo này; downstream = repo sản phẩm (`hub-event`, `hub-parent`) kéo `packages/` qua `pnpm pull:template`.

Monorepo tổ chức theo **product line** — mỗi thư mục con trong `apps/` gồm **2 project deployable** (API + web). Phát triển đầy đủ tại `apps/main/`; các line khác **reference** hoặc **repo downstream** riêng.

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

### Dev hàng ngày (khuyến nghị)

- Sửa code tại **`apps/main/`** (`@api` + `@backend`).
- Chạy **`pnpm dev:main:checkin`** — check-in UI gọi **main API**, không cần sync.
- Commit trên **`main`**, push:

```bash
git push origin main          # CI tự sync + cập nhật branch hub-event, hub-parent
# hoặc một lệnh (commit + sync + push):
pnpm push -- "feat: mô tả thay đổi"
pnpm push:deploy              # đã commit sẵn — chỉ sync + push branch
```

### Branch deploy (cùng repo)

| Branch | Dùng cho | Server |
|--------|----------|--------|
| **`main`** | Dev — source of truth đầy đủ | Team phát triển |
| **`hub-event`** | Deploy check-in (sau sync) | `git pull origin hub-event` → PM2 compo 2 |
| **`hub-parent`** | Deploy site chính (sau sync API) | `git pull origin hub-parent` → PM2 compo 1 |

Ba branch trỏ **cùng commit** sau sync (full monorepo; server chỉ build app của line mình).

**Local:** `pnpm push -- "feat: ..."` — commit (nếu có diff) + `pull:checkin` + `pull:parent` + push `main` + `hub-event` + `hub-parent`. Chỉ sync/push: `pnpm push:deploy`.

**CI:** workflow `.github/workflows/deploy-branches.yml` chạy sau mỗi push `main` (bỏ qua commit `chore(sync):` / `[skip ci]`).

### Cập nhật deploy site chính (`hub-parent`)

Sau `git pull`, khi cần đưa thay đổi main sang line deploy hub-parent:

```bash
pnpm pull:parent
# hoặc
pnpm sync:parent
```

Sync **full API** `main/api` → `hub-parent/api` (giữ `app.module.ts` local). Thường gộp trong `pnpm push:deploy`.

Test stack deploy: **`pnpm dev:parent`**.

### Cập nhật deploy check-in (`hub-event`)

Sau `git pull`, khi cần đưa thay đổi main sang line deploy check-in:

```bash
pnpm pull:checkin
# hoặc
pnpm sync:checkin
```

Lệnh này (không thay `git pull`):

1. Sync **subset API** `main/api` → `hub-event/api` theo `api.sync-profile.json` (loại store/HRM/đào tạo, `prune` dead code).
2. `verify:api-profile` — `app.module.ts` khớp profile.
3. Migrate admin → `@workspace/admin-app` + `pnpm admin:generate:checkin` (re-export, không copy source).

Test stack deploy thật: **`pnpm dev:checkin`** (`@hub-event/api` + check-in frontend).

### API sync chi tiết

| File | Vai trò |
|------|---------|
| `apps/hub-event/api/api.sync-profile.json` | `excludeDirs` / `includeDirs`, `keepFiles`, `prune` |
| `apps/hub-event/api/src/app.module.ts` | Composition check-in — **giữ local**, không ghi đè khi sync |
| `api.sync-keep.json` (legacy) | Vẫn merge vào `keepFiles` nếu còn |

Lệnh chỉ API: `pnpm sync:api:hub-event` · Verify: `pnpm verify:api-profile` · Test: `pnpm test:api:hub-event`

### Test sau sync (`test:*`)

Đối xứng với lệnh sync — chạy **không cần** dev server:

| Lệnh | Kiểm tra |
|------|----------|
| `pnpm test:checkin` | API profile + admin modules/native/imports/menu |
| `pnpm test:checkin:full` | Như trên + `typecheck` `@hub-event/*` |
| `pnpm test:api:all` | `api.sync-profile.json` mọi line kế thừa |
| `pnpm test:apps` | Cấu trúc `apps/` + verify/typecheck từng product line |
| `pnpm test:apps:quick` | Chỉ verify, bỏ typecheck |

Orchestrator: `script-system/verify/test-app-operations.mjs` — cấu trúc script: `script-system/README.md`

Các line khác (`hub-parent`, `store-sync`): `pnpm sync:api` — copy full trừ khi thêm profile riêng.

### Admin check-in (mới: `@workspace/admin-app`)

- **`packages/admin-app`** — module CRUD + lib/hooks dùng chung; app khai báo `admin.app.config.json`.
- **`pnpm admin:migrate`** — đưa module từ `main/backend` vào package.
- **`pnpm admin:generate:checkin`** — sinh page re-export dưới `src/app/admin/{module}` (không copy source).
- Menu: vẫn `sync-checkin-menu-tree.cjs` (sẽ gộp vào generate).
- Legacy copy `copy-checkin-admin-modules.cjs` — **deprecated** (dùng `pnpm pull:checkin`).

Chi tiết: `docs/admin-pattern/ADMIN_APP_PACKAGE.md`.

### Packages

`@workspace/ui`, `@workspace/api-client`, … — dùng chung; không import chéo `apps/*`.

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
| `pnpm dev:checkin` | `@hub-event/api` + `@hub-event-checkin-frontend` — không `tsup --watch` lexical; Next `--webpack` (giảm process/GPU) |
| `pnpm dev:store` | `@store-sync/api` + `@store-sync-frontend` |

## PM2 production

| Stack | Processes |
|-------|-----------|
| **parent** | `hub-parent-api`, `hub-parent-backend` (main), `hub-parent-frontend` |
| **checkin** | `hub-checkin-api`, `hub-checkin-frontend` (2 app) |
| **store** | `hub-store-api`, `hub-store-frontend` (2 app) |

## Workspace pnpm

`pnpm-workspace.yaml` dùng pattern `apps/*/*` — mỗi app là package con một cấp trong product line.

## Giữ cấu trúc `apps/` sạch

- Chỉ **4 product line** dưới `apps/`: `main`, `hub-parent`, `hub-event`, `store-sync` — không tạo `apps/api` phẳng (legacy).
- Dev feature → **`apps/main/`**; line deploy cập nhật qua sync (`pull:checkin`, `sync:api`), không copy thủ công.
- Artifact build (`dist/`, `.next/`) không commit.
- Kiểm tra: `pnpm verify:apps` (registry + tên package); hub-event API: `pnpm verify:api-profile`.

Quy tắc ngắn cho dev/agent: [`apps/README.md`](../apps/README.md) · hub-event native vs sync: [`apps/hub-event/README.md`](../apps/hub-event/README.md).

## Ranh giới (không đổi)

- Không import chéo source giữa `apps/*`.
- Next apps gọi API qua `@workspace/api-client`.
- Entity / MikroORM chỉ trong package API tương ứng.

Chi tiết microservice: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.
