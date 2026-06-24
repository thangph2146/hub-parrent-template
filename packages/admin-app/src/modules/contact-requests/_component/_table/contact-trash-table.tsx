"use client"

import type {
  ColumnFiltersState,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table"

import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"

import { buildAdminTableXlsxExport } from "@ui/components/admin"

import { useAdminApi } from "@workspace/admin-app/runtime"

import { downloadAdminTableXlsx } from "@workspace/admin-app/lib/admin-xlsx-export"

import { getContactRequestColumns } from "./columns"

import { getContactRequestExportFields } from "./contact-export"

import type { ContactRequest } from "../shared/types"

interface ContactRequestTrashTableProps {
  data: ContactRequest[]

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

  onRestore: (contact: ContactRequest) => void

  onPurge: (contact: ContactRequest) => void

  busy: boolean

  canRestore?: boolean

  canDelete?: boolean

  onBulkRestore: (ids: string[]) => void

  onBulkPurge: (ids: string[]) => void

  onClearFilters: () => void

  listParams: {
    search?: string
    filters?: Record<string, string>
  }
}

export function ContactRequestTrashTable(props: ContactRequestTrashTableProps) {
  const api = useAdminApi()
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

    canRestore,

    canDelete,

    onBulkRestore,

    onBulkPurge,

    onClearFilters,

    listParams,
  } = props

  const columns = getContactRequestColumns({
    view: "trash",
    onView: () => {},
    onDelete: () => {},
    onRestore,
    onPurge,
    onStatusChange: async () => {},
    onSetRead: async () => {},
    onSetPriority: async () => {},
    busy,
    canRestore,
    canDelete,
  })

  const exportConfig = buildAdminTableXlsxExport("contact-requests-trash", {
    pageCount: data.length,
    total,
  })

  return (
    <AdminDataTable<ContactRequest>
      tableScope="contact-requests-trash"
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống hoặc không khớp bộ lọc."
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên, email, tiêu đề…"
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        ...(canRestore
          ? [
              {
                id: "bulk-contact-restore" as const,

                label: "Khôi phục đã chọn",

                variant: "default" as const,

                onAction: async (rows: ContactRequest[]) => {
                  const ids = rows.map((c) => String(c.id))

                  if (!ids.length) return

                  await onBulkRestore(ids)
                },
              },
            ]
          : []),

        ...(canDelete
          ? [
              {
                id: "bulk-contact-purge" as const,

                label: "Xóa vĩnh viễn đã chọn",

                variant: "destructive" as const,

                onAction: async (rows: ContactRequest[]) => {
                  const ids = rows.map((c) => String(c.id))

                  if (!ids.length) return

                  await onBulkPurge(ids)
                },
              },
            ]
          : []),
      ]}
      xlsxExport={{
        ...exportConfig,
        runExport: () =>
          downloadAdminTableXlsx({
            templateId: "contact-requests-trash",

            data,

            fields: getContactRequestExportFields("trash"),

            options: { pageCount: data.length, total },
          }),
      }}
      exportFetchPage={async ({ page: exportPage, limit }) => {
        const result = await api.contactRequests.list({
          page: exportPage,
          limit,
          search: listParams.search,
          trash: true,
          filters: listParams.filters,
        })
        return { items: result.items, total: result.total }
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
        emptySummary: "Không có yêu cầu trong thùng rác",
        itemLabel: "yêu cầu",
      }}
    />
  )
}
