# `@workspace/ui` (`packages/ui`)

Thư viện UI dùng chung cho các app Next trong monorepo. **Không import** source từ `apps/*`; app chỉ tiêu thụ qua alias `@ui/*` hoặc `@workspace/ui`.

## Cây thư mục chuẩn

```text
packages/ui/
├── package.json          # exports map (@ui/...)
├── postcss.config.mjs
├── tsconfig.json
├── README.md             # file này
└── src/
    ├── styles/
    │   └── globals.css   # theme semantic, @source apps
    ├── lib/              # helper thuần (không React component)
    ├── hooks/            # hook dùng chung UI
    └── components/
        ├── index.ts      # barrel primitives + domain (tránh import cả package nếu chỉ cần 1 file)
        ├── *.tsx         # shadcn / primitive — MỘT file MỘT component (flat)
        ├── admin/        # layout + shell + presets VI (xem admin/README.md)
        ├── data-table/   # bảng TanStack + pagination + row actions
        ├── dialogs/      # dialog xác nhận generic
        ├── pickers/      # date, select, tree pickers
        ├── typing/       # form field layout
        └── graphify/     # trang / graph 3D (công cụ nội bộ)
```

## Quy tắc đặt file

| Vị trí                 | Dùng khi                                       | Ví dụ import app            |
| ---------------------- | ---------------------------------------------- | --------------------------- |
| `components/<tên>.tsx` | Primitive shadcn, tái dùng mọi app             | `@ui/components/button`     |
| `components/<domain>/` | Nhóm ≥2 file có barrel `index.ts`              | `@ui/components/data-table` |
| `components/admin/`    | Portal admin (sidebar, guard, bridge app)      | `@ui/components/admin`      |
| `lib/`                 | Utils, export CSV/XLSX, layout class constants | `@ui/lib/utils`             |
| `hooks/`               | Hook không gắn một page cụ thể                 | `@ui/hooks/use-mobile`      |
| `styles/`              | CSS global + token                             | `@ui/globals.css`           |

### Vì sao primitive vẫn **flat** ở `components/`?

`package.json` khai báo `"./components/*": "./src/components/*.tsx"` — mỗi component một file ngang hàng để import `@ui/components/card` không đổi path. **Không** gom shadcn vào `components/primitives/` trừ khi cập nhật toàn bộ exports và import trong monorepo.

### Domain module (folder con)

- Có `index.ts` re-export API public.
- File nội bộ import lẫn nhau bằng relative trong folder.
- Import primitive: `../button`, `../../lib/utils` (tùy độ sâu).

### Admin (`components/admin/`)

```text
admin/
├── types.ts              # types + AdminLayoutContextValue
├── menu-utils.ts         # lọc menu theo quyền
├── index.ts              # barrel — app chỉ import từ đây
├── shell/                # UI: sidebar, header, guard trang
└── integration/          # gắn app: providers, bridge, branding, metadata
```

App admin (`apps/backend`, …) giữ **riêng**: menu tree, auth provider, `api`, file `*-layout-static.ts`.

### Tên trùng — tránh nhầm

| File                               | Ý nghĩa                                   |
| ---------------------------------- | ----------------------------------------- |
| `components/shell.tsx`             | Shell layout storefront / trang công khai |
| `components/admin/shell/shell.tsx` | `AdminShell` — header + sidebar admin     |

## Exports (`package.json`)

| Subpath                     | File                                 |
| --------------------------- | ------------------------------------ |
| `@ui/globals.css`           | `src/styles/globals.css`             |
| `@ui/components`            | `src/components/index.ts`            |
| `@ui/components/<name>`     | `src/components/<name>.tsx`          |
| `@ui/components/admin`      | `src/components/admin/index.ts`      |
| `@ui/components/data-table` | `src/components/data-table/index.ts` |
| `@ui/components/dialogs`    | `src/components/dialogs/index.ts`    |
| `@ui/lib/*`                 | `src/lib/*.ts`                       |
| `@ui/hooks/*`               | `src/hooks/*.ts`                     |

## Phụ thuộc

- Được phép: `@workspace/api-client` (vd. `AdminPageGuard`, menu permission).
- **Cấm**: import `apps/frontend`, `apps/backend`, `apps/api` (ESLint `service-boundaries`).

## Thêm component mới

1. **Primitive shadcn** → `src/components/<tên>.tsx` + export trong `components/index.ts` (nếu dùng barrel).
2. **Nhóm feature** → folder mới + `index.ts` + thêm `exports` trong `package.json` nếu cần subpath riêng.
3. **Chỉ admin** → `admin/shell/` hoặc `admin/integration/`, export qua `admin/index.ts`.
4. Chạy `pnpm exec tsc -p packages/ui --noEmit` và `pnpm check` sau thay đổi kiến trúc.

## Tài liệu liên quan

- Palette / UX: `docs/admin-pattern/FRONTEND_UX.md`
- Ranh giới monorepo: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
