# Admin Pages — Implementation Reference

> Thư mục này trước đây chứa task list cho từng module riêng lẻ. Các module đã hoàn thiện, nội dung pattern chuẩn đã được gộp vào file này và `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`.

## Kiến trúc chuẩn cho mọi module

Mọi admin page trong `apps/backend/src/app/<module>/` đều theo cấu trúc:

```
<module>/
├── page.tsx                    # List page
├── new/
│   └── page.tsx                # Create page
├── [id]/
│   ├── page.tsx                # Detail page
│   └── edit/
│       └── page.tsx            # Edit page
└── _component/
    ├── index.ts                # Barrel export
    ├── types.ts                # Types (row, form, confirm action, detail)
    ├── utils.ts                # Utilities (slugify, buildPayload, format...)
    ├── columns.tsx             # Table column definitions
    ├── _hooks/                 # Form/action hooks
    │   ├── index.ts
    │   └── use-<module>-actions.ts
    ├── _query/                 # React Query hooks
    │   ├── index.ts
    │   └── use-<module>-queries.ts
    ├── _table/
    │   ├── index.ts
    │   ├── <module>-table.tsx
    │   └── <module>-trash-table.tsx
    ├── _form/
    │   ├── index.ts
    │   └── <module>-form-shell.tsx
    └── _alert-dialog/
        └── index.ts            # Re-export AdminCrudConfirmDialog từ @ui
```

## Quy tắc bắt buộc (xem chi tiết trong `docs/admin-pattern/`)

| Rule                                                                    | File                                   |
| ----------------------------------------------------------------------- | -------------------------------------- |
| Stack UI pattern (guard, header, layout, table actions, confirm dialog) | `ADMIN_PAGE_PATTERN.md`                |
| Microservice boundaries, ORM, package responsibilities                  | `MICROSERVICE_SYSTEM_MAP.md`           |
| Quy trình agent trước khi code                                          | `PRE_CODE_PROTOCOL.md`                 |
| Lệnh kiểm tra (`pnpm check`, `check:full`)                              | `AGENTS_GUIDE.md`                      |
| Graphify summaries & snapshot                                           | `.graphify/markdown/SUMMARY_FOR_AI.md` |

## Import chuẩn

```tsx
// Page guard + layout
import {
  AdminPageGuard,
  AdminPageSection,
  AdminListPageHeader,
} from "@ui/components/admin"

// Data table + actions
import { TABLE_ACTIONS_COLUMN_META } from "@ui/components/data-table"
import {
  AdminTableCrudRowActions,
  AdminTableTrashRowActions,
} from "@ui/components/admin"

// Confirm dialog (dùng chung, không tạo wrapper riêng)
import { AdminCrudConfirmDialog } from "@ui/components/admin"

// Upload (dùng chung, không tự viết fetch)
import { uploadAdminImage } from "@/lib/admin-upload"

// Form (dùng useWatch thay form.watch khi có reset)
import { useWatch } from "react-hook-form"
```

## Ghi chú

- Không tạo wrapper confirm dialog riêng cho từng module — dùng `AdminCrudConfirmDialog` chung.
- Không tự viết fetch upload — dùng `uploadAdminImage` từ `@/lib/admin-upload`.
- Confirm dialog barrel `_alert-dialog/index.ts` chỉ cần 1 dòng: `export { AdminCrudConfirmDialog as ModuleNameConfirmDialog } from "@ui/components/admin"`
