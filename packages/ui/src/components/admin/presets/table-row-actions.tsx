"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { ReactNode } from "react"
import {
  ArchiveRestore,
  Eye,
  Lock,
  Pencil,
  Settings2,
  Trash2,
  Unlock,
} from "lucide-react"
import {
  buildAdminRowActionConfirm,
  DATA_TABLE_ACTIONS_COLUMN_ID,
  DataTableRowActionButton,
  DataTableRowActions,
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionConfirm,
  type DataTableRowActionItem,
} from "../../data-table"

/** @deprecated Dùng `TABLE_ACTIONS_COLUMN_META` từ `@ui/components/data-table`. */
export const ADMIN_TABLE_ACTIONS_COLUMN_META = TABLE_ACTIONS_COLUMN_META

export { DataTableRowActions as AdminTableRowActions }
export { DataTableRowActionsMenu as AdminTableRowActionsMenu }

type ActionButtonProps = {
  label?: string
  onClick: () => void
  disabled?: boolean
  title?: string
}

export function AdminTableViewButton({
  label = "Xem",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="default"
      icon={<Eye />}
    />
  )
}

export function AdminTableEditButton({
  label = "Sửa",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="outline"
      icon={<Pencil />}
    />
  )
}

export function AdminTableSoftDeleteButton({
  label = "Xóa tạm",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="destructive"
      icon={<Trash2 />}
    />
  )
}

export function AdminTablePurgeButton({
  label = "Xóa vĩnh viễn",
  title = "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      title={title}
      variant="destructive"
      icon={<Trash2 />}
    />
  )
}

export function AdminTableRestoreButton({
  label = "Khôi phục",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="outline"
      icon={<ArchiveRestore />}
    />
  )
}

/**
 * Nút bật/tắt trạng thái `isActive` cho dòng. Icon + variant đổi theo trạng thái hiện tại:
 * - Đang hoạt động → hiển thị nút "Khoá" (warning) để chuyển sang unactive.
 * - Đã khoá      → hiển thị nút "Kích hoạt" (success) để chuyển sang active.
 *
 * Đặt `disabled` + `title` từ caller khi user là protected admin / chính mình.
 */
export function AdminTableToggleActiveButton({
  isActive,
  activeLabel = "Khoá",
  inactiveLabel = "Kích hoạt",
  ...props
}: ActionButtonProps & {
  isActive: boolean
  activeLabel?: string
  inactiveLabel?: string
}) {
  if (isActive) {
    return (
      <DataTableRowActionButton
        {...props}
        label={activeLabel}
        variant="warning"
        icon={<Lock />}
      />
    )
  }
  return (
    <DataTableRowActionButton
      {...props}
      label={inactiveLabel}
      variant="success"
      icon={<Unlock />}
    />
  )
}

type AdminTableCrudRowActionsProps = {
  canWrite: boolean
  onView: () => void
  onEdit?: () => void
  onSoftDelete?: () => void
  onPurge?: () => void
  onToggleActive?: () => void
  isActive?: boolean
  toggleDisabled?: boolean
  toggleTitle?: string
  /** Badge trạng thái trong nhóm menu (vd. UsageStatusFromValue). */
  statusHeader?: ReactNode
  softDeleteDisabled?: boolean
  softDeleteTitle?: string
  purgeDisabled?: boolean
  purgeTitle?: string
  editDisabled?: boolean
  editHidden?: boolean
  editTitle?: string
  busy?: boolean
  labels?: {
    view?: string
    edit?: string
    softDelete?: string
    purge?: string
    lock?: string
    activate?: string
  }
  /** Tên bản ghi trong dialog xác nhận menu (vd. họ tên, tiêu đề). */
  recordLabel?: string
  /**
   * `true`: tắt dialog menu, dùng dialog cấp page (`setConfirmAction`).
   * Mặc định `false`: dialog chung trong menu ⋯ trước khi gọi `onClick`.
   */
  pageConfirm?: boolean
  autoConfirmDangerousActions?: boolean
}

function resolveActionConfirm(
  key: string,
  pageConfirm: boolean,
  recordLabel: string | undefined,
  labels?: AdminTableCrudRowActionsProps["labels"]
): DataTableRowActionConfirm | false | undefined {
  if (pageConfirm) return false
  if (recordLabel) {
    return buildAdminRowActionConfirm(key, recordLabel, {
      softDelete: labels?.softDelete,
      purge: labels?.purge,
      lock: labels?.lock,
      activate: labels?.activate,
    })
  }
  return undefined
}

export function AdminTableCrudRowActions({
  canWrite,
  onView,
  onEdit,
  onSoftDelete,
  onPurge,
  onToggleActive,
  isActive,
  toggleDisabled,
  toggleTitle,
  statusHeader,
  softDeleteDisabled,
  softDeleteTitle,
  purgeDisabled,
  purgeTitle,
  editDisabled,
  editHidden,
  editTitle,
  busy,
  labels,
  recordLabel,
  pageConfirm = false,
  autoConfirmDangerousActions,
}: AdminTableCrudRowActionsProps) {
  const useMenuConfirm = autoConfirmDangerousActions ?? !pageConfirm
  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: labels?.view ?? "Xem chi tiết",
      hint: "Mở trang thông tin đầy đủ",
      onClick: onView,
      icon: <Eye />,
      group: "primary",
    },
  ]

  if (canWrite && onEdit && !editHidden) {
    actions.push({
      key: "edit",
      label: labels?.edit ?? "Chỉnh sửa",
      hint: editDisabled
        ? (editTitle ?? "Không có quyền chỉnh sửa")
        : "Cập nhật thông tin bản ghi",
      onClick: onEdit,
      icon: <Pencil />,
      group: "primary",
      disabled: editDisabled,
      title: editTitle,
    })
  }

  if (canWrite && onToggleActive && typeof isActive === "boolean") {
    const toggleKey = isActive ? "toggle-inactive" : "toggle-active"
    actions.push({
      key: toggleKey,
      label: isActive
        ? (labels?.lock ?? "Khoá tài khoản")
        : (labels?.activate ?? "Kích hoạt"),
      hint:
        toggleTitle ??
        (isActive
          ? "Vô hiệu hóa và thu hồi phiên đăng nhập"
          : "Cho phép đăng nhập lại"),
      onClick: onToggleActive,
      icon: isActive ? <Lock /> : <Unlock />,
      group: "status",
      disabled: toggleDisabled,
      title: toggleTitle,
      confirm: resolveActionConfirm(
        toggleKey,
        pageConfirm,
        recordLabel,
        labels
      ),
    })
  }

  if (canWrite && onSoftDelete) {
    actions.push({
      key: "soft-delete",
      label: labels?.softDelete ?? "Xóa tạm",
      hint: softDeleteDisabled
        ? (softDeleteTitle ?? "Không thể xóa tạm")
        : "Đưa vào thùng rác, có thể khôi phục",
      onClick: onSoftDelete,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      disabled: softDeleteDisabled,
      title: softDeleteTitle,
      confirm: resolveActionConfirm(
        "soft-delete",
        pageConfirm,
        recordLabel,
        labels
      ),
    })
  }

  if (canWrite && onPurge) {
    actions.push({
      key: "purge",
      label: labels?.purge ?? "Xóa vĩnh viễn",
      hint: purgeDisabled
        ? (purgeTitle ?? "Không thể xóa vĩnh viễn")
        : "Xóa khỏi cơ sở dữ liệu, không hoàn tác",
      onClick: onPurge,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      disabled: purgeDisabled,
      title: purgeTitle,
      confirm: resolveActionConfirm("purge", pageConfirm, recordLabel, labels),
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={busy}
      autoConfirmDangerousActions={useMenuConfirm}
      groups={{
        primary: {
          label: "Thao tác",
          icon: Settings2,
        },
        status: {
          label: "Trạng thái tài khoản",
          sublabel: true,
          header: statusHeader,
        },
      }}
    />
  )
}

type AdminTableTrashRowActionsProps = {
  canWrite: boolean
  /** Bỏ qua nếu không hiển thị khôi phục (quyền từng phần). */
  onRestore?: () => void
  /** Bỏ qua nếu không hiển thị xóa vĩnh viễn. */
  onPurge?: () => void
  disabled?: boolean
  busy?: boolean
  labels?: {
    restore?: string
    purge?: string
  }
  recordLabel?: string
  pageConfirm?: boolean
  autoConfirmDangerousActions?: boolean
}

export function AdminTableTrashRowActions({
  canWrite,
  onRestore,
  onPurge,
  disabled,
  busy,
  labels,
  recordLabel,
  pageConfirm = false,
  autoConfirmDangerousActions,
}: AdminTableTrashRowActionsProps) {
  const useMenuConfirm = autoConfirmDangerousActions ?? !pageConfirm
  if (!canWrite) return null

  const actions: DataTableRowActionItem[] = []

  if (onRestore) {
    actions.push({
      key: "restore",
      label: labels?.restore ?? "Khôi phục",
      hint: disabled
        ? "Không thể khôi phục"
        : "Đưa bản ghi trở lại danh sách chính",
      onClick: onRestore,
      icon: <ArchiveRestore />,
      group: "primary",
      disabled,
      confirm: resolveActionConfirm(
        "restore",
        pageConfirm,
        recordLabel,
        labels
      ),
    })
  }

  if (onPurge) {
    actions.push({
      key: "purge",
      label: labels?.purge ?? "Xóa vĩnh viễn",
      hint: disabled
        ? "Không thể xóa"
        : "Xóa khỏi cơ sở dữ liệu, không hoàn tác",
      onClick: onPurge,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      disabled,
      title: "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
      confirm: resolveActionConfirm("purge", pageConfirm, recordLabel, labels),
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={busy}
      autoConfirmDangerousActions={useMenuConfirm}
      groups={{
        primary: { label: "Thao tác", icon: ArchiveRestore },
        danger: { label: "Xóa vĩnh viễn", sublabel: true },
      }}
    />
  )
}

type AdminCrudActionsColumnHandlers<T> = {
  canWrite: boolean
  busy?: boolean
  header?: string
  /** Gộp thêm vào meta cột (vd. `sticky right-0`). */
  columnMeta?: ColumnDef<T, unknown>["meta"]
  /** Tên hiển thị trong dialog xác nhận menu ⋯. */
  getRecordLabel?: (row: T) => string
  /** Dialog cấp page thay vì menu (mặc định: menu ⋯). */
  pageConfirm?: boolean
  onView: (row: T) => void
  onEdit?: (row: T) => void
  onSoftDelete?: (row: T) => void | Promise<void>
  onPurge?: (row: T) => void | Promise<void>
  onToggleActive?: (row: T) => void | Promise<void>
  getIsActive?: (row: T) => boolean
  labels?: AdminTableCrudRowActionsProps["labels"]
  /** Ghi đè props theo từng dòng (disabled, title, statusHeader, …). */
  resolveRowProps?: (row: T) => Partial<AdminTableCrudRowActionsProps>
}

/** Cột thao tác CRUD chuẩn — chỉ cần `id: "actions"` + handlers, meta/filter tự áp dụng trong DataTable. */
export function defineAdminCrudActionsColumn<T>(
  handlers: AdminCrudActionsColumnHandlers<T>
): ColumnDef<T, unknown> {
  const {
    canWrite,
    busy,
    header = "Thao tác",
    columnMeta,
    getRecordLabel,
    pageConfirm,
    onView,
    onEdit,
    onSoftDelete,
    onPurge,
    onToggleActive,
    getIsActive,
    labels,
    resolveRowProps,
  } = handlers

  return {
    id: DATA_TABLE_ACTIONS_COLUMN_ID,
    header,
    enableSorting: false,
    enableColumnFilter: false,
    meta: { ...TABLE_ACTIONS_COLUMN_META, ...columnMeta },
    cell: ({ row }) => {
      const data = row.original
      const extra = resolveRowProps?.(data) ?? {}
      const isActive = extra.isActive ?? getIsActive?.(data)

      return (
        <AdminTableCrudRowActions
          canWrite={canWrite}
          busy={busy}
          labels={labels}
          recordLabel={getRecordLabel?.(data)}
          pageConfirm={pageConfirm}
          onView={() => onView(data)}
          onEdit={onEdit ? () => onEdit(data) : extra.onEdit}
          onSoftDelete={
            onSoftDelete ? () => onSoftDelete(data) : extra.onSoftDelete
          }
          onPurge={onPurge ? () => onPurge(data) : extra.onPurge}
          onToggleActive={
            onToggleActive ? () => onToggleActive(data) : extra.onToggleActive
          }
          isActive={isActive}
          {...extra}
        />
      )
    },
  }
}

type AdminTrashActionsColumnHandlers<T> = {
  canWrite: boolean
  busy?: boolean
  header?: string
  columnMeta?: ColumnDef<T, unknown>["meta"]
  getRecordLabel?: (row: T) => string
  pageConfirm?: boolean
  onRestore?: (row: T) => void | Promise<void>
  onPurge?: (row: T) => void | Promise<void>
  resolveRowProps?: (row: T) => Partial<AdminTableTrashRowActionsProps>
}

/** Cột thao tác thùng rác — menu khôi phục / xóa vĩnh viễn. */
export function defineAdminTrashActionsColumn<T>(
  handlers: AdminTrashActionsColumnHandlers<T>
): ColumnDef<T, unknown> {
  const {
    canWrite,
    busy,
    header = "Thao tác",
    columnMeta,
    getRecordLabel,
    pageConfirm,
    onRestore,
    onPurge,
    resolveRowProps,
  } = handlers

  return {
    id: DATA_TABLE_ACTIONS_COLUMN_ID,
    header,
    enableSorting: false,
    enableColumnFilter: false,
    meta: { ...TABLE_ACTIONS_COLUMN_META, ...columnMeta },
    cell: ({ row }) => {
      const data = row.original
      const extra = resolveRowProps?.(data) ?? {}
      return (
        <AdminTableTrashRowActions
          canWrite={canWrite}
          busy={busy}
          recordLabel={getRecordLabel?.(data)}
          pageConfirm={pageConfirm}
          onRestore={onRestore ? () => onRestore(data) : extra.onRestore}
          onPurge={onPurge ? () => onPurge(data) : extra.onPurge}
          {...extra}
        />
      )
    },
  }
}
