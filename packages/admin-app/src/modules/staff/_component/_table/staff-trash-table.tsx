import { api } from "@workspace/admin-app/lib/api"
import type {
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"
import { getStaffColumns } from "../columns"
import type { StaffRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"

interface StaffTrashTableProps {
  data: StaffRow[]
  isLoading: boolean
  total: number
  page: number
  pageSize: number
  appliedPage?: number
  appliedPageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  onRestore: (user: StaffRow) => void
  onPurge: (user: StaffRow) => void
  busy: boolean
  canRestore: boolean
  canHardDelete: boolean
  onBulkRestore: (ids: string[]) => void
  onBulkPurge: (ids: string[]) => void
  onClearFilters: () => void
  listParams: {
    q?: string
    filters?: Record<string, string>
  }
}

export function StaffTrashTable(props: StaffTrashTableProps) {
  const {
    data,
    isLoading,
    total,
    page,
    pageSize,
    appliedPage,
    appliedPageSize,
    onPageChange,
    onPageSizeChange,
    columnFilters,
    onColumnFiltersChange,
    globalFilter,
    onGlobalFilterChange,
    selectedRowIds,
    onSelectedRowIdsChange,
    onRestore,
    onPurge,
    busy,
    canRestore: canRestorePerm,
    canHardDelete: canHardDeletePerm,
    onBulkRestore,
    onBulkPurge,
    onClearFilters,
    listParams,
  } = props

  const canWriteTrash = canRestorePerm || canHardDeletePerm

  const columns = getStaffColumns({
    view: "trash",
    onView: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onRestore,
    onPurge,
    onToggleActive: () => {},
    busy,
    isProtected: () => false,
    canWrite: canWriteTrash,
    canRestore: canRestorePerm,
    canHardDelete: canHardDeletePerm,
  })

  return (
    <AdminDataTable<StaffRow>
      tableScope="staff-trash"
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống hoặc không khớp tìm kiếm."
      defaultExpandedAll={false}
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo email, họ tên, SĐT (API)…"
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        ...(canRestorePerm
          ? [
              {
                id: "bulk-staff-restore" as const,
                label: "Khôi phục đã chọn",
                variant: "outline" as const,
                onAction: async (rows: StaffRow[]) => {
                  const ids = rows.map((u) => String(u.id))
                  if (!ids.length) return
                  await onBulkRestore(ids)
                },
              },
            ]
          : []),
        ...(canHardDeletePerm
          ? [
              {
                id: "bulk-staff-purge" as const,
                label: "Xóa vĩnh viễn đã chọn",
                variant: "destructive" as const,
                onAction: async (rows: StaffRow[]) => {
                  const ids = rows.map((u) => String(u.id))
                  if (!ids.length) return
                  await onBulkPurge(ids)
                },
              },
            ]
          : []),
      ]}
      onClearFilters={onClearFilters}
      xlsxExport={buildAdminTableXlsxExport("staff-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={async ({ page: exportPage, limit }) => {
        const res = await api.users.listTrashed({
          page: exportPage,
          limit,
          q: listParams.q,
          filters: listParams.filters,
        })
        return { items: res.items, total: res.total }
      }}
      pagination={{
        page,
        pageSize,
        total,
        appliedPage,
        appliedPageSize,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary: "Thùng rác trống hoặc không khớp tìm kiếm.",
        itemLabel: "tài khoản",
      }}
    />
  )
}
