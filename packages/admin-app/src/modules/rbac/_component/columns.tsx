"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@ui/components/badge"

import { UsageStatusFromValue } from "@ui/components/usage-status-badge"

import { ExternalLink } from "lucide-react"

import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"

import { isSuperAdminRoleCode } from "@workspace/api-client"

import { defineRelationExportColumns } from "@ui/components/data-table"

import { permissionLabelVi } from "@workspace/admin-app/lib/permission-labels"

import {
  type AdminTableView,
  buildAdminTableColumns,
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@workspace/admin-app/lib/admin-table-columns"

import type { RoleRow } from "./utils"

export interface RbacColumnsProps {
  view?: AdminTableView

  onView: (role: RoleRow) => void

  onEdit: (role: RoleRow) => void

  onDelete: (role: RoleRow) => void

  onRestore: (role: RoleRow) => void

  onPurge: (role: RoleRow) => void

  canManageRoles: boolean

  /** Email trong `NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS` — được sửa vai trò `super_admin`. */

  canEditSuperAdminRole: boolean
}

export function getRbacColumns(props: RbacColumnsProps): ColumnDef<RoleRow>[] {
  const {
    view = "list",

    onView,

    onEdit,

    onDelete,

    onRestore,

    onPurge,

    canManageRoles,

    canEditSuperAdminRole,
  } = props

  const dataColumns: ColumnDef<RoleRow>[] = [
    {
      accessorKey: "name",

      header: "Vai trò",

      meta: { filterPlaceholder: "Lọc tên vai trò…" },

      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onView(row.original)}
          className="group flex w-full items-center gap-2 text-left"
        >
          <div>
            <div className="font-medium group-hover:text-primary group-hover:underline">
              {row.original.name}
            </div>

            <div className="font-mono text-xs text-muted-foreground">
              {row.original.code}
            </div>
          </div>

          <ExternalLink
            className="size-3 shrink-0 text-muted-foreground/40 group-hover:text-primary"
            aria-hidden
          />
        </button>
      ),
    },

    {
      accessorKey: "code",

      header: "Mã vai trò",

      meta: {
        filterPlaceholder: "Lọc mã role…",

        defaultHidden: true,
      },

      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.code}
        </span>
      ),
    },

    {
      accessorKey: "description",

      header: "Mô tả",

      meta: {
        filterPlaceholder: "Lọc mô tả…",

        defaultHidden: true,
      },

      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description?.trim() || "—"}
        </span>
      ),
    },

    {
      id: "permissionCount",

      header: "Số quyền",

      accessorFn: (row) => row.permissions.length,

      enableColumnFilter: true,
      filterFn: () => true,

      cell: ({ row }) => (
        <Badge variant="secondary" className="rounded-lg">
          {row.original.permissions.length}
        </Badge>
      ),
    },

    {
      id: "permissionsList",

      header: "Danh sách quyền",

      accessorFn: (row) =>
        row.permissions.map((code) => permissionLabelVi(code)).join("; "),

      enableColumnFilter: true,
      filterFn: () => true,

      meta: { defaultHidden: true },

      cell: ({ row }) => {
        const labels = row.original.permissions.map((code) =>
          permissionLabelVi(code)
        )

        if (labels.length === 0) return "—"

        return (
          <span
            className="text-xs text-muted-foreground"
            title={labels.join("; ")}
          >
            {labels.join("; ")}
          </span>
        )
      },
    },

    {
      id: "isActive",

      accessorFn: (row) => (row.isActive ? "true" : "false"),

      header: "Trạng thái",

      filterFn: (row, id, value) => {
        if (!value) return true

        return String(row.getValue(id)) === String(value)
      },

      meta: {
        filterVariant: "select",

        filterLabel: "Trạng thái",

        selectOptions: [
          { value: "true", label: "Hoạt động" },

          { value: "false", label: "Tạm tắt" },
        ],
      },

      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.isActive}
          labels={{ active: "Hoạt động", locked: "Tạm tắt" }}
          className="text-[10px]"
        />
      ),
    },

    ...defineRelationExportColumns<RoleRow>([
      {
        id: "permissionsCodes",

        header: "Mã quyền (export)",

        getValue: (row) => row.permissions.join("; "),

        defaultHidden: true,
      },

      {
        id: "id",
        header: "ID",
        getValue: (row) => row.id,
        defaultHidden: true,
      },
    ]),
    defineAdminCreatedAtColumn<RoleRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<RoleRow>({ defaultHidden: true }),
  ]

  return buildAdminTableColumns({
    view,

    dataColumns,

    listActionsColumn: defineAdminCrudActionsColumn<RoleRow>({
      canWrite: true,

      pageConfirm: true,

      getRecordLabel: (r) => r.name,

      onView,

      onEdit,

      onSoftDelete: onDelete,

      onPurge,

      resolveRowProps: (role) => {
        const isSuperAdmin = isSuperAdminRoleCode(role.code)

        if (isSuperAdmin) {
          return {
            editHidden: !canEditSuperAdminRole || !canManageRoles,

            editTitle: canEditSuperAdminRole
              ? undefined
              : "Chỉ tài khoản quản trị hệ thống mới được chỉnh sửa",

            onSoftDelete: undefined,

            onPurge: undefined,
          }
        }

        return {
          editHidden: !canManageRoles,
          softDeleteDisabled: !canManageRoles,
          purgeDisabled: !canManageRoles,
        }
      },
    }),

    trashActionsColumn: defineAdminTrashActionsColumn<RoleRow>({
      canWrite: canManageRoles,

      onRestore,

      onPurge,
    }),
  })
}
