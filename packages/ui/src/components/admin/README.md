# Admin UI (`components/admin`)

Module layout dùng chung cho **mọi app admin** Next. App chỉ import từ `@ui/components/admin` (barrel `index.ts`).

## Cấu trúc

| Thư mục / file | Trách nhiệm |
|----------------|-------------|
| `types.ts` | `AdminLayoutContextValue`, menu types, branding |
| `menu-utils.ts` | Lọc menu theo role / permission |
| `shell/` | `AdminShell`, `Sidebar`, `AdminPageGuard`, context, scroll-to-top |
| `integration/` | `AdminLayoutBridge`, `AdminRootProviders`, branding hook, metadata |

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
- `fetchAdminSettingsBranding` + `api.http.get`
- Auth: `user`, `logout`, `clientReady`

## Không đặt ở đây

- Menu tree cụ thể từng deployment → `apps/<admin-app>/src/config/`
- Copy tiếng Việt cho confirm/table actions → `apps/<admin-app>/src/lib/` (preset app)
