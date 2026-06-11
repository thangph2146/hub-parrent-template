# `@workspace/admin-app` — Admin dùng chung theo cấu hình

Thay pipeline **copy/sync** `main/backend` → `hub-event-checkin-frontend`, admin CRUD sống trong **`packages/admin-app`**. Mỗi app Next chỉ khai báo **module bật** + route native, rồi **generate** page mỏng.

## Mô hình

```
packages/admin-app/
  src/modules/{staff,tags,...}   # Page + _component (một nguồn)
  src/lib/                       # admin-navigation, api helpers, …
  src/hooks/                     # use-debounced-value, …
  src/menu/                      # BACKEND_ADMIN_MENU_ITEMS + build menu
  src/runtime/                   # AdminAppRuntimeProvider, useAdminAuth, useAdminApi

apps/main/backend/
  admin.app.config.json          # basePath: "" — full admin
  src/app/{module}/page.tsx      # AUTO-GENERATED re-export

apps/hub-event/hub-event-checkin-frontend/
  admin.app.config.json          # basePath: "/admin" + danh sách module
  src/app/admin/{module}/page.tsx  # AUTO-GENERATED (trừ native)
  src/app/admin/page.tsx         # native — sự kiện check-in
```

## Cấu hình app (`admin.app.config.json`)

| Trường | Ý nghĩa |
|--------|---------|
| `id` | Định danh deploy |
| `basePath` | `""` (main backend) hoặc `"/admin"` (check-in) |
| `modules` | Module CRUD bật — package + menu tự lọc |
| `native.files` | File giữ local, **không** ghi đè khi generate |
| `menu` | Subset menu, hrefOverrides, nativeGroups |
| `dashboard.relativePath` | Trang tổng quan (vd. `tong-quan/page.tsx`) |

## Lệnh

```bash
# 1. Migrate module từ main/backend vào package (một lần / khi thêm module mới)
pnpm admin:migrate

# 2. Sinh page re-export + (check-in) menu
pnpm admin:generate:checkin
pnpm admin:generate:main

# Dev — không cần sync copy
pnpm dev:main:checkin
```

## Runtime trong app

Layout admin bọc `AdminAppRuntimeProvider` — inject `api` + `useAuth` của app:

```tsx
import { AdminAppRuntimeProvider } from "@workspace/admin-app/runtime"
import adminConfig from "../../admin.app.config.json"
import { useAuth } from "@/providers/admin/auth-provider"
import { api } from "@/lib/admin/api"

<AdminAppRuntimeProvider config={adminConfig} adapters={{ useAuth, api }}>
  {children}
</AdminAppRuntimeProvider>
```

Module trong package dùng `useAdminAuth`, `useAdminApi`, `useAdminModuleNavigation("tags")` — **không** import `@/providers` hay path app.

## Lộ trình thay sync cũ

| Giai đoạn | Việc |
|-----------|------|
| **1** ✅ | Package + migrate + generate |
| **2** ✅ | `main/backend` + check-in dùng generate; prune duplicate |
| **3** ✅ | `copy-checkin-admin-modules.cjs` deprecated; `admin.sync-modules.json` xóa |
| **4** ✅ | Toàn bộ module CRUD main → package (28 modules) |
| **5** ✅ | App host: `lib/api` + thin re-export package; `hooks/queries` re-export; check-in `/admin/dang-ky` |
| **6** ✅ | `migrate-admin` không ghi đè package từ app generated; verify lib/hooks host |
| **7** ✅ | `pull:checkin` E2E; retry ghi file Windows; `pnpm check` gồm `verify:main-admin` |
| **8** ✅ | `AdminProfilePage` trong package; app re-export / config subtitle |
| **9** ✅ | Graph + database-schema + login/register pages → package `features/tools` & `features/auth` |

## App host — lib & hooks

Sau migrate, **package** là nguồn sự thật. Mỗi app Next chỉ giữ:

| App | Giữ local (substantive) | Re-export package |
|-----|-------------------------|-------------------|
| `main/backend` | `src/lib/api.ts` | `src/lib/*` còn lại, `hooks/queries`, `hooks/use-admin-realtime-sync`, `features/auth/*` |
| check-in | `src/lib/admin/api.ts`, `auth-routes.ts`, `cameras-query.ts`, `product-image-storage-stub.ts` | `src/lib/admin/*` còn lại, `hooks/admin/*` |

`pnpm verify:main-admin` / `pnpm verify:checkin-admin` báo lỗi nếu xuất hiện file lib/hooks **fat duplicate**.

`pnpm admin:migrate` / `pnpm pull:checkin`: **không** copy `src/lib` hay module AUTO-GENERATED từ app → package.

## Boundary

- UI shell: `@ui/components/admin`
- HTTP: `@workspace/api-client` qua `useAdminApi()`
- **Không** import chéo `apps/*` trong package
