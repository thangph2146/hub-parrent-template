"use client"

import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import { Button } from "@ui/components/button"
import { Calendar, MapPin, Star } from "lucide-react"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@/lib/admin-table-columns"
import type { EventRow } from "./types"
import { defineRelationExportColumns } from "@ui/components/data-table"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN")
}

export function getEventColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
  canDelete,
  canRestore,
  canHardDelete,
  onToggleFeatured,
  isTogglingFeaturedId,
}: {
  view?: AdminTableView
  openDetail?: (row: EventRow) => void
  openEdit?: (row: EventRow) => void
  rowActions: AdminCrudRowHandlers<EventRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
  onToggleFeatured?: (row: EventRow) => void
  isTogglingFeaturedId?: string | null
}): ColumnDef<EventRow>[] {
  const dataColumns: ColumnDef<EventRow>[] = [
    {
      accessorKey: "title",
      header: "Sự kiện",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ row, getValue }) => (
        <button
          type="button"
          className="text-left font-medium text-foreground transition-colors hover:text-primary"
          onClick={() => openDetail(row.original)}
        >
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "organizer",
      header: "Đơn vị tổ chức",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (
        <span className="text-sm">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Bắt đầu",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        const rowVal = row.getValue(columnId) as string
        if (!rowVal) return false
        const [fromStr, toStr] = String(filterValue).split(",")
        const rowDate = rowVal.split("T")[0]
        if (fromStr && rowDate < fromStr) return false
        if (toStr && rowDate > toStr) return false
        return true
      },
      meta: { filterVariant: "date-range" },
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "location",
      header: "Địa điểm",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {String(getValue() ?? "—")}
        </span>
      ),
    },
    {
      accessorKey: "format",
      header: "Hình thức",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.getValue(columnId)) === String(filterValue)
      },
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "0", label: "Offline" },
          { value: "1", label: "Online" },
          { value: "2", label: "Hybrid" },
        ],
      },
      cell: ({ getValue }) => {
        const fmt = getValue() as number
        return (
          <Badge
            variant={
              fmt === 1 ? "secondary" : fmt === 2 ? "outline" : "default"
            }
            className="text-[10px]"
          >
            {fmt === 1 ? "Online" : fmt === 2 ? "Hybrid" : "Offline"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isFeatured",
      header: "Nổi bật",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ row }) => {
        const featured = row.original.isFeatured
        const busy = isTogglingFeaturedId === row.original.id
        if (!canWrite || !onToggleFeatured) {
          return featured ? (
            <Badge className="bg-amber-500/15 text-[10px] text-amber-800 dark:text-amber-300">
              Nổi bật
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        }
        return (
          <Button
            type="button"
            variant={featured ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1 rounded-md px-2"
            disabled={busy}
            onClick={() => onToggleFeatured(row.original)}
            title={featured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}
          >
            <Star className={featured ? "size-3.5 fill-current" : "size-3.5"} />
            {featured ? "Đang bật" : "Đánh dấu"}
          </Button>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.getValue(columnId)) === String(filterValue)
      },
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "1", label: "Hoạt động" },
          { value: "0", label: "Khóa" },
        ],
      },
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Khóa" }}
          className="text-[10px]"
        />
      ),
    },
    ...defineRelationExportColumns<EventRow>([
      { id: "slug", header: "Slug", getValue: (r) => r.slug ?? "" },
      { id: "address", header: "Địa chỉ", getValue: (r) => r.address ?? "" },
      {
        id: "onlineLink",
        header: "Link online",
        getValue: (r) => r.onlineLink ?? "",
      },
      { id: "endDate", header: "Kết thúc", getValue: (r) => r.endDate ?? "" },
      {
        id: "createdBy",
        header: "Người tạo (ID)",
        getValue: (r) => r.createdBy ?? "",
      },
      {
        id: "checkinCamera",
        header: "Camera check-in",
        getValue: (r) =>
          r.checkinCameraName
            ? `${r.checkinCameraName}${r.checkinCameraCode ? ` (${r.checkinCameraCode})` : ""}`
            : (r.checkinCameraId ?? ""),
      },
      {
        id: "checkoutCamera",
        header: "Camera check-out",
        getValue: (r) =>
          r.checkoutCameraName
            ? `${r.checkoutCameraName}${r.checkoutCameraCode ? ` (${r.checkoutCameraCode})` : ""}`
            : (r.checkoutCameraId ?? ""),
      },
      {
        id: "totalRegistrations",
        header: "Đăng ký",
        getValue: (r) => r.totalRegistrations,
      },
      {
        id: "totalCheckins",
        header: "Check-in",
        getValue: (r) => r.totalCheckins,
      },
      {
        id: "totalCheckouts",
        header: "Check-out",
        getValue: (r) => r.totalCheckouts,
      },
      {
        id: "maxParticipants",
        header: "Sức chứa",
        getValue: (r) => r.maxParticipants,
      },
    ]),
    defineAdminCreatedAtColumn<EventRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<EventRow>({ defaultHidden: true }),
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<EventRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<EventRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
