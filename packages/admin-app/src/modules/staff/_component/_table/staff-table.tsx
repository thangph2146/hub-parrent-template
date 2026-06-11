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

interface StaffTableProps {
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
  onView: (user: StaffRow) => void
  onEdit: (user: StaffRow) => void
  onDelete: (user: StaffRow) => void
  onPurge: (user: StaffRow) => void
  onToggleActive: (user: StaffRow) => void
  busy: boolean
  currentUserId?: string | number
  actorEmail?: string
  isProtected: (user: StaffRow) => boolean
  canUpdate: boolean
  canDelete: boolean
  canRestore: boolean
  canHardDelete: boolean
  onBulkDelete: (ids: string[]) => void
  onBulkPurge: (ids: string[]) => void
  onBulkActive: (ids: string[]) => void
  onBulkUnactive: (ids: string[]) => void
  onClearFilters: () => void
  roleOptions?: { value: string; label: string }[]
  listParams: {
    q?: string
    filters?: Record<string, string>
  }
  onRowPrefetch?: (row: StaffRow) => void
}

export function StaffTable(props: StaffTableProps) {
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
    onView,
    onEdit,
    onDelete,
    onPurge,
    onToggleActive,
    busy,
    currentUserId,
    actorEmail,
    isProtected,
    canUpdate,
    canDelete: canDeletePerm,
    canRestore: canRestorePerm,
    canHardDelete: canHardDeletePerm,
    onBulkDelete,
    onBulkPurge,
    onBulkActive,
    onBulkUnactive,
    onClearFilters,
    roleOptions,
    listParams,
    onRowPrefetch,
  } = props

  const columns = getStaffColumns({
    view: "list",
    onView,
    onEdit,
    onDelete,
    onRestore: () => {},
    onPurge,
    onToggleActive,
    busy,
    currentUserId,
    actorEmail,
    isProtected,
    roleOptions,
    canWrite: canUpdate,
    canDelete: canDeletePerm,
    canRestore: canRestorePerm,
    canHardDelete: canHardDeletePerm,
  })

  return (
    <AdminDataTable<StaffRow>
      tableScope="staff"
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Không có tài khoản khớp tìm kiếm API hoặc bộ lọc vai trò / cột."
      defaultExpandedAll={false}
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo email, họ tên (API)…"
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch ? (row) => onRowPrefetch(row.original) : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      canSelectRow={(row) =>
        String(row.original.id) !== String(currentUserId ?? "")
      }
      bulkActions={[
        ...(canUpdate
          ? [
              {
                id: "bulk-staff-active" as const,
                label: "Kích hoạt đã chọn",
                variant: "success" as const,
                onAction: async (rows: StaffRow[]) => {
                  const ids = rows
                    .filter(
                      (u) =>
                        String(u.id) !== String(currentUserId ?? "") &&
                        !isProtected(u) &&
                        !u.isActive
                    )
                    .map((u) => String(u.id))
                  if (!ids.length) return
                  await onBulkActive(ids)
                },
              },
              {
                id: "bulk-staff-unactive" as const,
                label: "Khoá đã chọn",
                variant: "warning" as const,
                onAction: async (rows: StaffRow[]) => {
                  const ids = rows
                    .filter(
                      (u) =>
                        String(u.id) !== String(currentUserId ?? "") &&
                        !isProtected(u) &&
                        u.isActive
                    )
                    .map((u) => String(u.id))
                  if (!ids.length) return
                  await onBulkUnactive(ids)
                },
              },
            ]
          : []),
        ...(canDeletePerm
          ? [
              {
                id: "bulk-staff-delete" as const,
                label: "Xóa tạm đã chọn",
                variant: "destructive" as const,
                onAction: async (rows: StaffRow[]) => {
                  const ids = rows
                    .filter(
                      (u) =>
                        String(u.id) !== String(currentUserId ?? "") &&
                        !isProtected(u)
                    )
                    .map((u) => String(u.id))
                  if (!ids.length) return
                  await onBulkDelete(ids)
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
                  const ids = rows
                    .filter(
                      (u) =>
                        String(u.id) !== String(currentUserId ?? "") &&
                        !isProtected(u)
                    )
                    .map((u) => String(u.id))
                  if (!ids.length) return
                  await onBulkPurge(ids)
                },
              },
            ]
          : []),
      ]}
      xlsxExport={buildAdminTableXlsxExport("staff", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={async ({ page: exportPage, limit }) => {
        const res = await api.users.list({
          q: listParams.q,
          page: exportPage,
          limit,
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
        emptySummary: "Không có nhân sự",
        itemLabel: "tài khoản",
      }}
    />
  )
}
