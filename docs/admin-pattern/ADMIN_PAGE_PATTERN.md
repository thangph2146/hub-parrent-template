# Admin Page Pattern — Hướng dẫn triển khai

## ⚠️ Nguyên tắc bắt buộc: KHÔNG tạo admin component trong apps/

Mọi component UI admin — guard, page header, layout grid, table actions, confirm dialog, button, input, card, badge, icon — **PHẢI** import từ `@ui/components/...`.

**KHÔNG** được:
- Tạo file `.tsx` mới trong `apps/backend/src/components/`, `apps/backend/src/app/**/_components/`, hay bất kỳ thư mục `components/` nào trong apps
- Định nghĩa lại `AdminPageGuard`, `AdminListPageHeader`, `AdminFormLayout`, `AdminCrudConfirmDialog`, `AdminTableCrudRowActions`, `Button`, `Input`, `Badge`, `Card`, v.v.
- Tạo wrapper confirm dialog riêng cho từng module — dùng `AdminCrudConfirmDialog` từ `@ui/components/admin`

Nếu thiếu component nào, **hãy thêm vào `packages/ui/src/components/admin/`** (presets, pages, shell, hoặc trực tiếp trong `components/`), không tạo local copy trong apps.

Mọi page trong `apps/backend/src/app/**/page.tsx` phải dùng **common admin layout components** từ `@ui/components/admin`.

## Import chuẩn

```tsx
import {
  // ── Guard ──
  AdminPageGuard,
  // ── Section wrapper ──
  AdminPageSection,
  // ── Loading ──
  AdminPageLoading,
  // ── Page headers ──
  AdminListPageHeader,         // List pages
  AdminFormPageHeader,         // Create/Edit pages
  AdminDetailPageHeader,       // Detail pages
  // ── Layout grids ──
  AdminFormLayout,
  AdminFormMain,
  AdminFormSidebar,
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
  // ── Header buttons ──
  AdminPageHeaderBackButton,
  AdminPageHeaderOutlineButton,
  AdminPageHeaderPrimaryButton,
  // ── Preset table actions ──
  AdminTableViewButton,
  AdminTableEditButton,
  AdminTableSoftDeleteButton,
  AdminTablePurgeButton,
  AdminTableRestoreButton,
  AdminTableCrudRowActions,
  AdminTableTrashRowActions,
  // ── Others ──
  AdminReadOnlyHint,
  // ── Confirm dialogs ──
  AdminCrudConfirmDialog,
} from "@ui/components/admin"
```

## 3 loại page pattern

### 1. List page

```tsx
export default function XxxPage() {
  return (
    <AdminPageGuard permission="xxx:list">
      <AdminPageSection>
        <AdminListPageHeader
          icon={ListIcon}
          title="Danh sách XXX"
          subtitle="Quản lý XXX"
          readOnlyHint={!canWrite ? <AdminReadOnlyHint>Chỉ xem</AdminReadOnlyHint> : null}
          actions={
            canWrite ? (
              <AdminPageHeaderPrimaryButton onClick={openCreateDialog}>
                <Plus className="size-4" />
                Thêm mới
              </AdminPageHeaderPrimaryButton>
            ) : null
          }
        />
        {/* DataTable here */}
      </AdminPageSection>
    </AdminPageGuard>
  )
}
```

### 2. Form page (Create/Edit)

```tsx
export default function XxxFormPage() {
  const form = useForm<FormData>({ resolver })
  const { isSubmitting, isValid } = form.formState

  return (
    <AdminPageGuard permission="xxx:write">
      <AdminPageSection>
        <AdminFormPageHeader
          title={isEdit ? "Chỉnh sửa XXX" : "Thêm XXX"}
          subtitle="Điền thông tin XXX"
          onBack={() => router.back()}
          onReset={() => form.reset()}
          formId="xxx-form"
          submitting={isSubmitting}
          isEdit={isEdit}
        />
        <AdminFormLayout id="xxx-form" onSubmit={form.handleSubmit(onSubmit)}>
          <AdminFormMain>
            {/* Main content cards */}
            <Card>...</Card>
          </AdminFormMain>
          <AdminFormSidebar>
            {/* Sidebar cards */}
            <Card>...</Card>
          </AdminFormSidebar>
        </AdminFormLayout>
      </AdminPageSection>
    </AdminPageGuard>
  )
}
```

### 3. Detail page

```tsx
export default function XxxDetailPage() {
  return (
    <AdminPageGuard permission="xxx:read">
      <AdminPageSection>
        <AdminDetailPageHeader
          title={data.name ?? "Chi tiết XXX"}
          subtitle={data.description}
          onBack={() => router.back()}
          onEdit={canWrite ? () => router.push(`/xxx/${id}/edit`) : undefined}
          actions={
            canWrite ? (
              <AdminPageHeaderPrimaryButton onClick={handleAction}>
                <Plus className="size-4" />
                Hành động
              </AdminPageHeaderPrimaryButton>
            ) : null
          }
        />
        <AdminDetailLayout>
          <AdminDetailMain>
            {/* Main detail cards */}
            <Card>...</Card>
          </AdminDetailMain>
          <AdminDetailSidebar>
            {/* Sidebar info cards */}
            <Card>...</Card>
          </AdminDetailSidebar>
        </AdminDetailLayout>
      </AdminPageSection>
    </AdminPageGuard>
  )
}
```

## Table row actions (columns.tsx)

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import { AdminTableCrudRowActions } from "@ui/components/admin"

export function getXxxColumns({
  canWrite,
  onView,
  onEdit,
  onSoftDelete,
  onPurge,
}: {
  canWrite: boolean
  onView: (row: XxxRow) => void
  onEdit?: (row: XxxRow) => void
  onSoftDelete?: (row: XxxRow) => void
  onPurge?: (row: XxxRow) => void
}): ColumnDef<XxxRow>[] {
  return [
    /* data columns... */
    {
      id: TABLE_ACTIONS_COLUMN_META.id,
      meta: TABLE_ACTIONS_COLUMN_META.meta,
      cell: ({ row }) => (
        <AdminTableCrudRowActions
          canWrite={canWrite}
          onView={() => onView(row.original)}
          onEdit={onEdit ? () => onEdit(row.original) : undefined}
          onSoftDelete={onSoftDelete ? () => onSoftDelete(row.original) : undefined}
          onPurge={onPurge ? () => onPurge(row.original) : undefined}
        />
      ),
    },
  ]
}
```

### Action buttons riêng lẻ (khi cần custom hơn)

```tsx
<AdminTableViewButton onClick={() => router.push(`/xxx/${id}`)} />
<AdminTableEditButton onClick={() => router.push(`/xxx/${id}/edit`)} />
<AdminTableSoftDeleteButton onClick={() => handleDelete(id)} />
<AdminTablePurgeButton onClick={() => handlePurge(id)} />
<AdminTableRestoreButton onClick={() => handleRestore(id)} />
```

### Trash actions

```tsx
<AdminTableTrashRowActions
  canWrite={canWrite}
  onRestore={() => handleRestore(row.id)}
  onPurge={() => handlePurge(row.id)}
/>
```

## Admin page header: so sánh component

| Component | Dùng cho | Props chính |
|---|---|---|
| `AdminListPageHeader` | Danh sách (list) | `icon`, `title`, `subtitle`, `readOnlyHint`, `actions` |
| `AdminFormPageHeader` | Thêm/Sửa (form) | `title`, `subtitle`, `onBack`, `onReset`, `formId`, `submitting`, `isEdit`, `saveLabel`, `resetLabel`, `backLabel`, `extraActions` |
| `AdminDetailPageHeader` | Chi tiết (detail) | `title`, `subtitle`, `onBack`, `backLabel`, `variant` (`"entity"` / `"module"`), `onEdit`, `editLabel`, `actions` |

## Admin layout grid: so sánh

| Components | Dùng cho | Grid CSS |
|---|---|---|
| `AdminFormLayout` / `AdminFormMain` / `AdminFormSidebar` | Form (create/edit) | `grid gap-6 lg:grid-cols-3`, form wrapper |
| `AdminDetailLayout` / `AdminDetailMain` / `AdminDetailSidebar` | Detail page | `grid gap-6 lg:grid-cols-3`, div wrapper |

Grid class reference (trong `@ui/lib/layout-shell`):
- `ADMIN_PAGE_GRID_CLASS` = `grid gap-6 lg:grid-cols-3`
- `ADMIN_PAGE_GRID_MAIN_CLASS` = `space-y-6 lg:col-span-2`
- `ADMIN_PAGE_GRID_SIDEBAR_CLASS` = `space-y-6 lg:col-span-1`

## Admin page guard

```tsx
// Guard theo permission — BYPASS_ROLES = ["super_admin", "admin"]
<AdminPageGuard permission="xxx:list">
  <YourPage />
</AdminPageGuard>

// Guard theo role name
<AdminPageGuard roles={["editor", "manager"]}>
  <YourPage />
</AdminPageGuard>

// Guard không ràng buộc (vẫn bypass nếu user có role BYPASS)
<AdminPageGuard>
  <YourPage />
</AdminPageGuard>
```

`AdminPageGuard` behavior:
- `user === null` → render `null` (chờ loading)
- `user` có role `super_admin` hoặc `admin` → bypass luôn, render children
- `roles` được chỉ định → kiểm tra `user.roles` có chứa
- `permission` được chỉ định → dùng `canUserAccess(user, permission)`
- Không đủ quyền → render `AccessDenied` card

## Confirm dialog pattern (AdminCrudConfirmDialog)

**⚠️ BẮT BUỘC:** Không tạo wrapper confirm dialog riêng cho từng module. Mọi module phải dùng `AdminCrudConfirmDialog` chung từ `@ui/components/admin`.

Các module đã migrate (không có file `.tsx` riêng trong `_alert-dialog/`):
categories, posts, training-systems, courses, departments, academic-years, locations, majors, training-levels, events, templates, cameras, screens, tags, speakers, seo-metas.

Các module giữ lại custom dialog (có lý do đặc thù: bulk operations, no restore): staff, contact-requests, guides.

Dùng `AdminCrudConfirmDialog` chung từ `@ui/components/admin`:

```tsx
import { AdminCrudConfirmDialog } from "@ui/components/admin"

// Trong page, confirmAction đến từ useConfirmAction() hook:
const { confirmAction, setConfirmAction } = useConfirmAction()
const handleConfirmAction = useHandleConfirmAction(delM, resM, purM, setConfirmAction)

return (
  <AdminCrudConfirmDialog
    confirmAction={confirmAction}
    deleteMutation={delM}
    restoreMutation={resM}
    purgeMutation={purM}
    onOpenChange={(o) => { if (!o) setConfirmAction(null) }}
    onConfirm={() => { if (confirmAction) void handleConfirmAction(confirmAction) }}
    contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
    entityLabel="sự kiện"
    getName={(r) => r.title}
  />
)
```

Nếu module có `code` (vd hệ đào tạo, bậc học), thêm `getSubInfo`:
```tsx
getSubInfo={(r) => r.code || "N/A"}
```

Props:
| Prop | Type | Bắt buộc | Mô tả |
|------|------|----------|-------|
| `confirmAction` | `CrudConfirmAction<T> \| null` | ✅ | `{ kind: "delete" \| "restore" \| "purge", row: T }` |
| `deleteMutation` | `{ isPending: boolean }` | ❌ | Mutation state xóa tạm |
| `restoreMutation` | `{ isPending: boolean }` | ❌ | Mutation state khôi phục |
| `purgeMutation` | `{ isPending: boolean }` | ❌ | Mutation state xóa vĩnh viễn |
| `onOpenChange` | `(open: boolean) => void` | ✅ | Đóng dialog |
| `onConfirm` | `() => void` | ✅ | Xác nhận delete/restore |
| `onPurgeConfirm` | `() => void` | ❌ | Xác nhận purge riêng (nếu khác onConfirm) |
| `onRestoreConfirm` | `() => void` | ❌ | Xác nhận restore riêng (nếu khác onConfirm) |
| `entityLabel` | `string` | ✅ | Tên entity tiếng Việt (vd "sự kiện") |
| `getName` | `(row: T) => string` | ✅ | Trích xuất tên hiển thị từ row |
| `getSubInfo` | `(row: T) => string \| null` | ❌ | Mã/phụ (vd `row.code`) |
| `contentClassName` | `string` | ❌ | Class cho dialog content |

## Common pitfalls

### useWatch vs form.watch

Khi có `form.reset()`, **`form.watch("field")` bị stale** (vẫn giữ giá trị cũ từ lúc subscribe).
Luôn dùng **`useWatch({ control: form.control, name: "field" })`** để đăng ký subscription lại đúng sau reset.

```tsx
// ❌ Sai: form.watch("permissions")
// ✅ Đúng:
import { useWatch } from "react-hook-form"
const permissions = useWatch({ control: form.control, name: "permissions" })
```

### Table actions column id + meta

Phải dùng `TABLE_ACTIONS_COLUMN_META` từ `@ui/components/data-table` (export qua `@ui/components/admin` dưới alias `ADMIN_TABLE_ACTIONS_COLUMN_META` — deprecated):

```tsx
import { TABLE_ACTIONS_COLUMN_META } from "@ui/components/data-table"

{
  id: TABLE_ACTIONS_COLUMN_META.id,
  meta: TABLE_ACTIONS_COLUMN_META.meta,
  cell: /* ... */
}
```

### Không dùng `<Button>` trực tiếp trong page headers

Luôn dùng `AdminPageHeaderPrimaryButton`, `AdminPageHeaderOutlineButton`, `AdminPageHeaderBackButton` thay vì `<Button>` — đảm bảo đồng bộ style với toàn bộ hệ thống.

## Checklist khi viết page mới

- [ ] Wrapped bằng `AdminPageGuard` với `permission` hoặc `roles` phù hợp
- [ ] Nội dung trong `AdminPageSection`
- [ ] Header dùng đúng component (List/Form/Detail)
- [ ] Actions dùng `AdminPageHeaderPrimaryButton` thay `<Button>`
- [ ] Grid layout dùng `AdminFormLayout` / `AdminDetailLayout` thay grid thủ công
- [ ] Table actions dùng `AdminTableCrudRowActions` hoặc action buttons riêng
- [ ] form.watch → useWatch nếu có form.reset
- [ ] Confirm dialog dùng `AdminCrudConfirmDialog` — không tạo wrapper riêng
- [ ] Upload image dùng `uploadAdminImage` từ `@/lib/admin-upload` — không tự viết fetch
- [ ] Không import chéo giữa `apps/*`
- [ ] Chạy `pnpm check` sau khi code

## Quick import reference

```tsx
// Page-level
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
  AdminListPageHeader,
  AdminFormPageHeader,
  AdminDetailPageHeader,
  AdminFormLayout, AdminFormMain, AdminFormSidebar,
  AdminDetailLayout, AdminDetailMain, AdminDetailSidebar,
  AdminPageHeaderBackButton,
  AdminPageHeaderOutlineButton,
  AdminPageHeaderPrimaryButton,
  AdminReadOnlyHint,
  AdminCrudConfirmDialog,
} from "@ui/components/admin"

// Table actions (in columns.tsx)
import {
  AdminTableCrudRowActions,
  AdminTableTrashRowActions,
  AdminTableViewButton,
  AdminTableEditButton,
  AdminTableSoftDeleteButton,
  AdminTablePurgeButton,
  AdminTableRestoreButton,
  TABLE_ACTIONS_COLUMN_META,
} from "@ui/components/admin"
```
