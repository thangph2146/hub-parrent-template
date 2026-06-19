# Cấu trúc Monorepo (product lines)

> **Mô hình template (packages-first):** [`docs/TEMPLATE_MONOREPO.md`](TEMPLATE_MONOREPO.md) · catalog [`packages/README.md`](../packages/README.md).

Monorepo tổ chức theo **product line** — logic dùng chung nằm trong **`packages/`** (thư viện đầy đủ). `apps/main/` = sandbox dev trên upstream; line deploy = repo downstream + `pull:template`.

## Sơ đồ

```
apps/
├── main/                          # Phát triển chính (API + admin)
│   ├── api/          @api
│   └── backend/      @backend
├── hub-parent/                    # Site HUB công khai (deploy)
│   ├── api/          @hub-parent/api      ← sync từ main/api
│   └── hub-parent-frontend/  @frontend
├── hub-checkin/                   # Check-in sự kiện (deploy)
│   ├── api/          @hub-checkin/api      ← sync từ main/api
│   └── hub-checkin-frontend/  @hub-checkin/frontend
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
| **hub-checkin** | Check-in: frontend + admin gộp một app | `@hub-checkin/api`, `@hub-checkin/frontend` | 3002, 3000 |
| **store-sync** | Catalog / giỏ / checkout | `@store-sync/api`, `@store-sync-frontend` | 3002, 3000 |

## Kế thừa từ main

### Dev hàng ngày (khuyến nghị)

- Sửa code tại **`apps/main/`** (`@api` + `@backend`).
- Chạy **`pnpm dev:main:checkin`** — check-in UI gọi **main API**, không cần sync.
- Commit trên **`main`**, push:

```bash
git push origin main          # CI tự sync + cập nhật branch hub-checkin, hub-parent
# hoặc một lệnh (commit + sync + push):
pnpm push -- "feat: mô tả thay đổi"
pnpm push:deploy              # đã commit sẵn — chỉ sync + push branch
```

### Branch deploy (cùng repo)

| Branch | Dùng cho | Server |
|--------|----------|--------|
| **`main`** | Dev — source of truth đầy đủ | Team phát triển |
| **`hub-checkin`** | Deploy check-in (sau sync) | `git pull origin hub-checkin` → PM2 compo 2 |
| **`hub-parent`** | Deploy site chính (sau sync API) | `git pull origin hub-parent` → PM2 compo 1 |

Ba branch trỏ **cùng commit** sau sync (full monorepo; server chỉ build app của line mình).

**Local:** `pnpm push -- "feat: ..."` — commit (nếu có diff) + `pull:checkin` + `pull:parent` + push `main` + `hub-checkin` + `hub-parent`. Chỉ sync/push: `pnpm push:deploy`.

**CI:** workflow `.github/workflows/deploy-branches.yml` chạy sau mỗi push `main` (bỏ qua commit `chore(sync):` / `[skip ci]`).

### Cập nhật deploy site chính (`hub-parent`)

Sau `git pull`, khi cần đưa thay đổi main sang line deploy hub-parent:

```bash
pnpm pull:parent
```

Sync **full API** `main/api` → `hub-parent/api` (giữ `app.module.ts` local). Thường gộp trong `pnpm push:deploy`.

Test stack deploy: **`pnpm dev:parent`**.

### Cập nhật deploy check-in (`hub-checkin`)

**Native đã commit (`materialize.committed: true`):** `hub-checkin/api` là bản copy từ `apps/main/api` — **commit trong git**. `pnpm pull:checkin` **không** regenerate API; chỉ verify + admin generate.

```bash
pnpm pull:checkin
# = verify API native + parity (cần main/api cho parity) + admin migrate/generate
```

**Cập nhật logic API** (dev monorepo có `apps/main/api`):

```bash
pnpm api:render apps/hub-checkin/api --mode=native   # hoặc pnpm api:regenerate:checkin
git add apps/hub-checkin/api && git commit ...
```

**Legacy packages-first** (bỏ `materialize.committed` hoặc `committed: false`): generate từ `@workspace/api-server`.

Test stack deploy: **`pnpm dev:checkin`**. Verify: **`pnpm test:checkin:full`**.

### API check-in (native committed)

| File | Vai trò |
|------|---------|
| `apps/hub-checkin/api/api.app.config.json` | `materialize.committed: true` — pull skip generate |
| `apps/hub-checkin/api/src/**` | Native main-port — **commit**, cập nhật qua `pnpm api:render` |
| `apps/hub-checkin/hub-checkin-frontend/admin.app.config.json` | Admin modules |

Lệnh: `pnpm pull:checkin` (verify + admin) · Regenerate API: `pnpm api:regenerate:checkin` · Parity: `pnpm verify:main-api-endpoint-parity`

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
- Legacy copy `sync/deprecated/` đã upstream-only; downstream không sync lại nhóm này.

Chi tiết: `docs/admin-pattern/ADMIN_APP_PACKAGE.md`.

### Packages

`@workspace/ui`, `@workspace/api-client`, … — dùng chung; không import chéo `apps/*`.

## Dev stacks

| Lệnh | Apps chạy |
|------|-----------|
| `pnpm dev:main` | `@api` + `@backend` (phát triển chính) |
| `pnpm dev:main:checkin` | `@api` + `@backend` + `@hub-checkin/frontend` — không chạy `tsup --watch` lexical; Next dùng `--webpack`; **resource guard** tự dừng khi CPU/GPU tràn |

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
| `pnpm dev:checkin` | `@hub-checkin/api` + `@hub-checkin/frontend` — không `tsup --watch` lexical; Next `--webpack` (giảm process/GPU) |
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

- Chỉ **4 product line** dưới `apps/`: `main`, `hub-parent`, `hub-checkin`, `store-sync` — không tạo `apps/api` phẳng (legacy).
- Dev feature → **`apps/main/`** hoặc **`packages/*`**; line deploy cập nhật qua **`pnpm pull:checkin`** (generate) hoặc **`pnpm pull:template`** (downstream), không copy thủ công.
- Artifact build (`dist/`, `.next/`) không commit.
- Export JSON / backup / scratch: **`data/`** tại repo root (`seed/`, `exports/`, `local/`) — không đặt trong `apps/*/api/src/`. Kiểm tra: `pnpm verify:data-layout`.
- Pipeline meta API: **`apps/*/api/.pipeline/`** — commit `main` + `deploy/nest`; deploy line khác gitignore, tái tạo bằng `pnpm api:registry:sync`.
- PM2 production: **`ecosystem/`** — không file `ecosystem.*.cjs` ở root; xem [`ecosystem/README.md`](../ecosystem/README.md).
- Upload media runtime: **`STORAGE_DIR`** ngoài repo — xem [`docs/storage/README.md`](storage/README.md).
- Kiểm tra: `pnpm verify:apps` (registry + tên package); hub-checkin API: `pnpm verify:api-profile`.

Quy tắc ngắn cho dev/agent: [`apps/README.md`](../apps/README.md) · hub-checkin native vs sync: [`apps/hub-checkin/README.md`](../apps/hub-checkin/README.md).

## Ranh giới (không đổi)

- Không import chéo source giữa `apps/*`.
- Next apps gọi API qua `@workspace/api-client`.
- Entity / MikroORM chỉ trong package API tương ứng.

Chi tiết microservice: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.
