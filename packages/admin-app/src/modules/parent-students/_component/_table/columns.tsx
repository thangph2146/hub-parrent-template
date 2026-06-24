"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge"
import {
  CheckCircle2,
  Clock,
  Settings2,
  Trash2,
  User,
  XCircle,
} from "lucide-react"
import {
  DataTableRowActionsMenu,
  defineDataTableActionsColumn,
  defineRelationExportColumns,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import {
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@workspace/admin-app/lib/admin-table-columns"
import { formatAdminDateTime } from "@workspace/admin-app/lib/format-admin-datetime"
import type { ParentStudent } from "../shared/types"

export interface ParentStudentsColumnsProps {
  onApprove: (row: ParentStudent) => void
  onReject: (row: ParentStudent) => void
  onPurge: (row: ParentStudent) => void
  canApprove: boolean
}

export function getParentStudentsColumns(
  props: ParentStudentsColumnsProps
): ColumnDef<ParentStudent>[] {
  const { onApprove, onReject, onPurge, canApprove } = props

  return [
    {
      id: "parent",
      header: "Phụ huynh",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <User className="size-3.5" />
          </div>
          <div className="min-w-0">
            {row.original.parentName ? (
              <p className="truncate text-sm font-medium">
                {row.original.parentName}
              </p>
            ) : null}
            <p className="truncate font-mono text-xs text-muted-foreground">
              {row.original.parentEmail ??
                `${row.original.parentId.slice(0, 8)}…`}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "student",
      header: "Học sinh",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            {row.original.studentName && (
              <p className="font-medium">{row.original.studentName}</p>
            )}
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.studentCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Ghi chú",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return v ? (
          <span className="text-xs text-muted-foreground">{v}</span>
        ) : (
          <span className="text-xs italic opacity-40">Không có</span>
        )
      },
    },
    defineAdminCreatedAtColumn<ParentStudent>({ header: "Ngày gửi" }),
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "pending", label: "Chờ duyệt" },
          { value: "approved", label: "Đã duyệt" },
          { value: "rejected", label: "Từ chối" },
        ],
      },
      cell: ({ getValue }) => {
        const s = getValue() as ParentStudent["status"]
        const STATUS_CONFIG: Record<
          "pending" | "approved" | "rejected",
          { label: string; icon: typeof Clock; tone: UsageStatusTone }
        > = {
          pending: { label: "Chờ duyệt", icon: Clock, tone: "warning" },
          approved: { label: "Đã duyệt", icon: CheckCircle2, tone: "success" },
          rejected: { label: "Từ chối", icon: XCircle, tone: "danger" },
        }
        const cfg = STATUS_CONFIG[s]
        const StatusIcon = cfg.icon
        return (
          <UsageStatusBadge tone={cfg.tone} className="gap-1 text-[10px]">
            <StatusIcon className="size-3 shrink-0" aria-hidden />
            {cfg.label}
          </UsageStatusBadge>
        )
      },
    },
    {
      accessorKey: "reviewedAt",
      header: "Duyệt lúc",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: { defaultHidden: true },
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatAdminDateTime(v)}
          </span>
        )
      },
    },
    {
      accessorKey: "reviewedBy",
      header: "Người duyệt",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: { defaultHidden: true },
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return v ? (
          <span className="font-mono text-xs text-muted-foreground">{v}</span>
        ) : (
          <span className="text-xs italic opacity-40">—</span>
        )
      },
    },
    ...defineRelationExportColumns<ParentStudent>([
      {
        id: "parentId_full",
        header: "ID phụ huynh",
        getValue: (row) => row.parentId,
      },
      {
        id: "parentEmail",
        header: "Email phụ huynh",
        getValue: (row) => row.parentEmail,
        defaultHidden: false,
      },
      {
        id: "parentPhone",
        header: "SĐT phụ huynh",
        getValue: (row) => row.parentPhone,
      },
    ]),
    defineAdminUpdatedAtColumn<ParentStudent>({ defaultHidden: true }),
    defineDataTableActionsColumn<ParentStudent>({
      cell: ({ row }) => {
        const data = row.original
        const actions: DataTableRowActionItem[] = []
        if (canApprove && data.status === "pending") {
          actions.push(
            {
              key: "approve",
              label: "Duyệt",
              hint: "Chấp nhận liên kết phụ huynh – học sinh",
              onClick: () => onApprove(data),
              icon: <CheckCircle2 />,
              group: "primary",
              confirm: false,
            },
            {
              key: "reject",
              label: "Từ chối",
              hint: "Từ chối yêu cầu liên kết",
              onClick: () => onReject(data),
              icon: <XCircle />,
              group: "danger",
              menuVariant: "destructive",
              confirm: false,
            }
          )
        }
        actions.push({
          key: "purge",
          label: "Xóa vĩnh viễn",
          hint: "Xóa khỏi cơ sở dữ liệu, không hoàn tác",
          onClick: () => onPurge(data),
          icon: <Trash2 />,
          group: "danger",
          menuVariant: "destructive",
          confirm: false,
        })
        return (
          <DataTableRowActionsMenu
            actions={actions}
            autoConfirmDangerousActions={false}
            groups={{
              primary: { label: "Thao tác", icon: Settings2 },
              danger: { label: "Từ chối / xóa", sublabel: true },
            }}
          />
        )
      },
    }),
  ]
}
