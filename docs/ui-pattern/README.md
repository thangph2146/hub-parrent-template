# @workspace/ui (packages/ui)

Thư viện UI dùng chung cho `apps/backend` và `apps/frontend`. Import alias: `@ui/*` hoặc `@workspace/ui`.

## Vị trí

- `packages/ui/src/`
- Package namespace: `@workspace/ui`

## Cấu trúc thư mục

```
packages/ui/src/
├── components/        # React components
│   ├── admin/        # Admin page components (shell, pages, data-table, presets, graphify)
│   ├── site/         # Site/storefront components
│   ├── data-table/   # DataTable + variants
│   ├── dialogs/      # Reusable dialogs
│   ├── graphify/     # Graphify visualization
│   ├── pickers/      # Date/time pickers
│   ├── typing/       # Animation typing effect
│   └── *.tsx         # shadcn primitives (accordion, button, card, dialog, etc.)
├── hooks/            # Shared hooks
├── lib/              # Shared utilities (cn, icons, export helpers, layout)
└── styles/           # globals.css theme
```

## Component categories

### Primitive (shadcn/ui + custom)

Table, button, card, dialog, sheet, dropdown-menu, popover, tooltip, accordion, tabs, form elements (input, select, checkbox, switch, textarea), combobox, command, drawer, sheet, resizable, menubar, context-menu, navigation-menu, slider, toggle, breadcrumb, skeleton, avatar, badge, alert, collapsible, scroll-area, pagination, calendar, separator, hover-card, radio-group, timeline, chart, sonner (toast).

### Admin (`components/admin/`)

- **shell**: `AdminPageGuard`, `AdminShell`, `AdminSidebar`, `AdminRouteLoading`
- **pages**: `AdminListPageHeader`, `AdminFormPageHeader`, `AdminPageSection`, `AdminFormLayout`, `AdminFormLayoutMain`, `AdminFormLayoutSidebar`, `AdminReadOnlyHint`, `AdminPageHeaderPrimaryButton`
- **data-table**: `AdminDataTable`, `AdminUseDataTable`
- **presets**: `AdminTableRowActions`, `AdminTableCrudRowActions`, `AdminTableTrashRowActions`, `AdminCrudConfirmDialog`, `AdminConfirmActionDialog`, `createAdminImageUploader`, `buildAdminTableXlsxExport`, `AdminQuickPresets`, `AdminConfigCopyButton`
- **graphify**: Graph management UI components

### Subpath — dashboard & maps (không qua barrel admin)

Chart.js và Leaflet **không** export qua `@ui/components/admin` (tránh `window is not defined` khi SSR import nhầm barrel). Dùng subpath + `dynamic(..., { ssr: false })`:

```typescript
import dynamic from "next/dynamic"

const AdminDashboardCharts = dynamic(
  () =>
    import("@ui/components/admin/dashboard").then(
      (m) => m.AdminDashboardCharts
    ),
  { ssr: false }
)

const AdminLocationMap = dynamic(
  () => import("@ui/components/admin/maps").then((m) => m.AdminLocationMap),
  { ssr: false }
)
```

| Subpath                          | Nội dung                                              |
| -------------------------------- | ----------------------------------------------------- |
| `@ui/components/admin/dashboard` | `AdminDashboardCharts` (Chart.js)                     |
| `@ui/components/admin/maps`      | `AdminLocationMap`, `map-utils` (`@ui/lib/map-utils`) |

Khai báo trong `packages/ui/package.json` → `exports`.

### Site (`components/site/`)

- Components for storefront pages (header, footer, etc.)

## Hooks (`hooks/`)

| Hook          | Mô tả                                    |
| ------------- | ---------------------------------------- |
| `useHydrated` | SSR-safe: trả về `true` sau client mount |
| `useMobile`   | Media query `(max-width: 768px)`         |
| `useGraphify` | Graphify service interaction             |

## Lib (`lib/`)

| File                     | Mô tả                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `utils.ts`               | `cn()` — class merge utility (clsx + tailwind-merge)         |
| `icons.ts`               | Lucide icon map (~1923 lines generated), `resolveIcon(name)` |
| `layout-shell.ts`        | Layout utility functions                                     |
| `build-table-csv.ts`     | CSV export                                                   |
| `export-xlsx.ts`         | XLSX export                                                  |
| `format-export-value.ts` | Value formatting for exports                                 |
| `graphify-context.ts`    | Graphify context                                             |

## Quy tắc cho agent

- **Admin components PHẢI từ `@ui/components/admin/...`** (hoặc subpath `dashboard` / `maps`) — không tạo local trong `apps/backend/src/components/` hay `apps/backend/src/app/**/_components/`
- **Wiring app-specific** (vd. socket invalidate cache) giữ trong `apps/backend/src/providers/`, không đưa lên `@ui`
- **Site components** cũng PHẢI từ `@ui` — không tạo local component UI trong `apps/frontend/src/components/`
- Nếu thiếu component, thêm vào `packages/ui/` (không tạo local)
- Import alias: `@ui/...` (VD: `@ui/components/admin/AdminCrudConfirmDialog`)
