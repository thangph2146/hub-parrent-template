# Admin UI (`components/admin`)

Module layout dùng chung cho **mọi app admin** Next. App chỉ import từ `@ui/components/admin` (barrel `index.ts`).

## Cấu trúc

| Thư mục / file  | Trách nhiệm                                                        |
| --------------- | ------------------------------------------------------------------ |
| `types.ts`      | `AdminLayoutContextValue`, menu types, branding                    |
| `menu-utils.ts` | Lọc menu theo role / permission                                    |
| `shell/`        | `AdminShell`, `Sidebar`, `AdminPageGuard`, context, scroll-to-top  |
| `integration/`  | `AdminLayoutBridge`, `AdminRootProviders`, branding hook, metadata |
| `presets/`      | Dialog/bảng/upload mặc định tiếng Việt (HUB admin)                 |

## Luồng tích hợp app (vd. `apps/backend`)

```text
layout.tsx
  └─ AdminRootProviders
       └─ QueryProvider + AuthProvider (app)
            └─ BackendAdminLayoutProvider
                 └─ buildAdminLayoutValue({ user, branding, static })
                 └─ AdminLayoutBridge → AdminShell
```

App cung cấp:

- `static`: menu, `loginPath`, `isAuthPath`, … (`config/admin-layout-static.ts`)
- `api.settings.getPublicBranding` + `api.seoMetas.getPublicByPage` (backend: `providers/backend-admin-layout.tsx`)
- Auth: `user`, `logout`, `clientReady`

## Presets (`presets/`)

- `AdminConfirmActionDialog`, `AdminTable*RowActions`, `buildAdminTableXlsxExport`, …
- `createAdminImageUploader` — wrapper `UploadsApi` (`@workspace/api-client`); backend khuyến nghị gọi trực tiếp `api.uploads.uploadFile` trong `lib/admin-upload.ts`

## Không đặt ở đây

- Menu tree cụ thể từng deployment → `apps/<admin-app>/src/config/`
- `api`, `auth-session`, filter query theo domain → `apps/<admin-app>/src/lib/`
