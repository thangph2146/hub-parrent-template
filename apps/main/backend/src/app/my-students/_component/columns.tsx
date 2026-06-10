"use client"

import type { ColumnDef, FilterFnOption } from "@tanstack/react-table"
import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge"
import {
  BarChart3,
  CheckCircle2,
  Clock,
  GraduationCap,
  Settings2,
  Trash2,
  XCircle,
} from "lucide-react"
import {
  DataTableRowActionsMenu,
  defineDataTableActionsColumn,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import type { MyStudentRow } from "./types"
import { defineRelationExportColumns } from "@ui/components/data-table"
import {
  adminDateRangeFilterFn,
  defineAdminCreatedAtColumn,
} from "@/lib/admin-table-columns"
import { formatAdminDateTime } from "@/lib/format-admin-datetime"

function recordLabel(row: MyStudentRow): string {
  return row.studentName?.trim() || row.studentCode
}

export interface MyStudentsColumnsProps {
  onViewGrades: (row: MyStudentRow) => void
  onDelete: (row: MyStudentRow) => void | Promise<void>
  canDelete: boolean
  deleteBusy?: boolean
}

export function getMyStudentsColumns(
  props: MyStudentsColumnsProps
): ColumnDef<MyStudentRow>[] {
  const { onViewGrades, onDelete, canDelete, deleteBusy } = props

  return [
    {
      id: "student",
      header: "Sinh viên",
      accessorFn: (row) =>
        [row.studentCode, row.studentName].filter(Boolean).join(" "),
      enableColumnFilter: true,
      meta: {
        filterLabel: "Sinh viên",
        filterPlaceholder: "Mã hoặc họ tên…",
      },
      enableSorting: true,
      sortingFn: (a, b) => {
        const la = recordLabel(a.original)
        const lb = recordLabel(b.original)
        return la.localeCompare(lb, "vi")
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <GraduationCap className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            {row.original.studentName && (
              <p className="truncate font-medium">{row.original.studentName}</p>
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
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return v ? (
          <span className="text-xs text-muted-foreground">{v}</span>
        ) : (
          <span className="text-xs italic opacity-40">—</span>
        )
      },
    },
    defineAdminCreatedAtColumn<MyStudentRow>({ header: "Ngày gửi" }),
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.getValue(columnId)) === String(filterValue)
      },
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
        const s = getValue() as MyStudentRow["status"]
        const STATUS_CONFIG: Record<
          MyStudentRow["status"],
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
      filterFn: adminDateRangeFilterFn as FilterFnOption<MyStudentRow>,
      meta: {
        defaultHidden: true,
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
      },
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatAdminDateTime(v)}
          </span>
        )
      },
    },
    ...defineRelationExportColumns<MyStudentRow>(
      [{ id: "parentId", header: "ID phụ huynh", getValue: (r) => r.parentId }],
      { enableColumnFilter: false }
    ),
    defineDataTableActionsColumn<MyStudentRow>({
      cell: ({ row }) => {
        const data = row.original
        const label = recordLabel(data)
        const actions: DataTableRowActionItem[] = []

        if (data.status === "approved") {
          actions.push({
            key: "grades",
            label: "Xem kết quả học tập",
            hint: "Bảng điểm chi tiết, TB năm học và học kỳ",
            onClick: () => onViewGrades(data),
            icon: <BarChart3 />,
            group: "primary",
          })
        }

        if (canDelete) {
          const approved = data.status === "approved"
          actions.push({
            key: "unlink",
            label: approved ? "Gỡ liên kết" : "Xóa yêu cầu",
            hint: approved
              ? "Ngừng theo dõi bảng điểm sinh viên này"
              : "Xóa yêu cầu liên kết chưa hoặc đã bị từ chối",
            onClick: () => onDelete(data),
            icon: <Trash2 />,
            group: "danger",
            menuVariant: "destructive",
            confirm: approved
              ? {
                  title: `Gỡ liên kết ${label}?`,
                  description:
                    "Bạn sẽ không còn xem được bảng điểm của sinh viên này.",
                  confirmLabel: "Gỡ liên kết",
                  destructive: true,
                }
              : {
                  title: `Xóa yêu cầu ${label}?`,
                  description: "Thao tác không thể hoàn tác.",
                  confirmLabel: "Xóa",
                  destructive: true,
                },
          })
        }

        return (
          <DataTableRowActionsMenu
            actions={actions}
            busy={deleteBusy}
            groups={{
              primary: { label: "Theo dõi", icon: Settings2 },
              danger: { label: "Liên kết", sublabel: true },
            }}
          />
        )
      },
    }),
  ]
}

export function getMyStudentGlobalFilterText(row: MyStudentRow): string {
  return [row.studentCode, row.studentName, row.note].filter(Boolean).join(" ")
}
