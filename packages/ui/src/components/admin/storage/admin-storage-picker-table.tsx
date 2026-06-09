"use client"

import type {
  ColumnDef,
  OnChangeFn,
  Row,
  RowSelectionState,
} from "@tanstack/react-table"

import type { ReactNode } from "react"

import { AdminDataTable, adminTableRowSelectionProps } from "../../data-table"

import type { AdminStorageFileRow } from "./types"

export type AdminStoragePickerTableProps = {
  tableScope: string

  data: AdminStorageFileRow[]

  columns: ColumnDef<AdminStorageFileRow>[]

  isLoading: boolean

  isFetching?: boolean

  emptyLabel: string

  itemLabel: string

  emptySummary: string

  page: number

  pageSize: number

  total: number

  onPageChange: (page: number) => void

  onPageSizeChange: (pageSize: number) => void

  emptyState?: ReactNode

  multiSelect?: boolean

  selectedRowIds?: RowSelectionState

  onSelectedRowIdsChange?: OnChangeFn<RowSelectionState>

  canSelectRow?: (row: Row<AdminStorageFileRow>) => boolean
}

export function AdminStoragePickerTable({
  tableScope,

  data,

  columns,

  isLoading,

  isFetching = false,

  emptyLabel,

  itemLabel,

  emptySummary,

  page,

  pageSize,

  total,

  onPageChange,

  onPageSizeChange,

  emptyState,

  multiSelect = false,

  selectedRowIds,

  onSelectedRowIdsChange,

  canSelectRow,
}: AdminStoragePickerTableProps) {
  if (emptyState) {
    return <>{emptyState}</>
  }

  const selectionProps =
    multiSelect && selectedRowIds && onSelectedRowIdsChange
      ? adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)
      : { rowSelectionEnabled: false as const }

  return (
    <AdminDataTable<AdminStorageFileRow>
      tableScope={tableScope}
      data={data}
      getRowId={(row) => row.relativePath}
      columns={columns}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      manualFiltering
      showIndexColumn
      canSelectRow={multiSelect ? canSelectRow : undefined}
      showTableToolbar={false}
      showColumnFilters={false}
      showTableColumnPicker={false}
      stickyTableHeader={false}
      rowContextMenu
      {...selectionProps}
      pagination={{
        page,

        pageSize,

        total,

        isLoading: isFetching,

        onPageChange,

        onPageSizeChange,

        emptySummary,

        itemLabel,

        pageSizeOptions: [10, 20, 50, 100],
      }}
    />
  )
}
