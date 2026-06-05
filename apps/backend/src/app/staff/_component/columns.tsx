import type { ColumnDef } from "@tanstack/react-table"

import { Mail, Phone, ShieldHalf, UserCircle } from "lucide-react"

import { Badge } from "@ui/components/badge"

import { UsageStatusFromValue } from "@ui/components/usage-status-badge"

import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"

import { isSuperAdminRoleCode } from "@workspace/api-client"

import { canEditProtectedAdminUser } from "@/config/protected-admin"

import type { StaffRow } from "./types"

import { defineRelationExportColumns } from "@ui/components/data-table"

import {
  type AdminTableView,
  buildAdminTableColumns,
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@/lib/admin-table-columns"

export interface StaffColumnsProps {
  view?: AdminTableView

  onView: (user: StaffRow) => void

  onEdit: (user: StaffRow) => void

  onDelete: (user: StaffRow) => void

  onRestore: (user: StaffRow) => void

  onPurge: (user: StaffRow) => void

  onToggleActive: (user: StaffRow) => void

  busy: boolean

  currentUserId?: string

  actorEmail?: string

  isProtected: (user: StaffRow) => boolean

  roleOptions?: { value: string; label: string }[]
}

export function getStaffColumns(
  props: StaffColumnsProps
): ColumnDef<StaffRow>[] {
  const {
    view = "list",

    onView,

    onEdit,

    onDelete,

    onRestore,

    onPurge,

    onToggleActive,

    busy,

    currentUserId,

    actorEmail,

    isProtected,

    roleOptions,
  } = props

  const dataColumns: ColumnDef<StaffRow>[] = [
    {
      accessorKey: "fullName",

      header: "Họ tên",

      meta: { filterPlaceholder: "Lọc họ tên…" },

      cell: ({ row }) => (
        <span className="flex min-w-0 items-center gap-2">
          <UserCircle className="size-4 shrink-0 text-primary/80" aria-hidden />

          <span className="truncate font-medium">{row.original.fullName}</span>
        </span>
      ),
    },

    {
      accessorKey: "email",

      header: "Email",

      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0 opacity-80" aria-hidden />

          <span className="truncate">{String(getValue())}</span>
        </span>
      ),

      meta: { filterPlaceholder: "Lọc email…" },
    },

    {
      accessorKey: "phone",

      header: "SĐT",

      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined

        return v ? (
          <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <Phone
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />

            {v}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5 opacity-40" aria-hidden />—
          </span>
        )
      },

      meta: { filterPlaceholder: "Lọc SĐT…" },
    },

    {
      id: "roles",

      accessorFn: (u) =>
        u.roles.length === 0 ? "" : u.roles.map((r) => r.name).join("; "),

      header: "Vai trò",

      cell: ({ row }) => {
        const u = row.original

        if (u.roles.length === 0) {
          return (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldHalf
                className="size-3.5 shrink-0 opacity-60"
                aria-hidden
              />
              —
            </span>
          )
        }

        return (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <Badge
                key={r.code}
                variant={isSuperAdminRoleCode(r.code) ? "default" : "secondary"}
                className="text-xs font-normal"
              >
                {r.name}
              </Badge>
            ))}
          </div>
        )
      },

      enableColumnFilter: true,

      enableSorting: false,

      filterFn: () => true,

      meta: {
        filterVariant: "select",

        filterLabel: "Vai trò",

        selectOptions: roleOptions ?? [],
      },
    },

    ...defineRelationExportColumns<StaffRow>([
      {
        id: "address",

        header: "Địa chỉ",

        getValue: (u) => u.address ?? "",
      },

      {
        id: "citizenId",

        header: "CCCD/CMND",

        getValue: (u) => u.citizenId ?? "",
      },

    ]),
    defineAdminCreatedAtColumn<StaffRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<StaffRow>({ defaultHidden: true }),

    {
      id: "isActive",

      accessorFn: (u) => (u.isActive ? "true" : "false"),

      header: "Trạng thái",

      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.isActive}
          labels={{ active: "Hoạt động", locked: "Khoá" }}
          className="text-[10px]"
        />
      ),

      filterFn: (row, id, v) => {
        if (v == null || v === "") return true

        return row.getValue(id) === v
      },

      meta: {
        filterVariant: "select",

        filterLabel: "Trạng thái",

        selectOptions: [
          { value: "true", label: "Hoạt động" },

          { value: "false", label: "Khoá" },
        ],
      },
    },
  ]

  return buildAdminTableColumns({
    view,

    dataColumns,

    listActionsColumn: defineAdminCrudActionsColumn<StaffRow>({
      canWrite: true,

      busy,

      pageConfirm: true,

      getRecordLabel: (u) => u.fullName || u.email,

      onView,

      onEdit,

      onSoftDelete: onDelete,

      onPurge,

      onToggleActive,

      getIsActive: (u) => u.isActive,

      resolveRowProps: (u) => {
        const selfAccount = String(u.id) === String(currentUserId ?? "")

        const protectedAccount = isProtected(u)

        const canEditThisUser = canEditProtectedAdminUser(actorEmail, u.email)

        const blockedTitle = protectedAccount
          ? "Tài khoản hệ thống — không thể thay đổi trạng thái"
          : selfAccount
            ? "Không thao tác trên tài khoản đang đăng nhập"
            : undefined

        const blockedDeleteTitle = protectedAccount
          ? "Tài khoản hệ thống — không thể xóa"
          : selfAccount
            ? "Không thao tác trên tài khoản đang đăng nhập"
            : undefined

        return {
          editDisabled: busy || !canEditThisUser,

          editTitle:
            protectedAccount && !canEditThisUser
              ? "Tài khoản hệ thống — chỉ chính tài khoản đó mới được chỉnh sửa"
              : undefined,

          toggleDisabled: busy || selfAccount || protectedAccount,

          toggleTitle:
            blockedTitle ??
            (u.isActive
              ? "Khoá tài khoản (thu hồi phiên hiện tại)"
              : "Kích hoạt tài khoản"),

          softDeleteDisabled: busy || selfAccount || protectedAccount,

          softDeleteTitle: blockedDeleteTitle ?? "Xóa tạm",

          purgeDisabled: busy || selfAccount || protectedAccount,

          purgeTitle: blockedDeleteTitle ?? "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
        }
      },
    }),

    trashActionsColumn: defineAdminTrashActionsColumn<StaffRow>({
      canWrite: true,

      busy,

      pageConfirm: true,

      getRecordLabel: (u) => u.fullName || u.email,

      onRestore,

      onPurge,

      resolveRowProps: () => ({ disabled: busy }),
    }),
  })
}
