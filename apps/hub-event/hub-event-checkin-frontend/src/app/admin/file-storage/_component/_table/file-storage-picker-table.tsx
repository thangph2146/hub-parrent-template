"use client"

import type {
  ColumnDef,
  OnChangeFn,
  Row,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"
import { FileStorageTabEmpty } from "../file-storage-empty"
import type { FileStorageRow } from "../types"

export type FileStoragePickerTableProps = {
  tableScope: string
  data: FileStorageRow[]
  columns: ColumnDef<FileStorageRow>[]
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
  tabLabel?: string
  canUpload?: boolean
  uploading?: boolean
  onUpload?: () => void
  multiSelect?: boolean
  selectedRowIds?: RowSelectionState
  onSelectedRowIdsChange?: OnChangeFn<RowSelectionState>
  canSelectRow?: (row: Row<FileStorageRow>) => boolean
}

export function FileStoragePickerTable({
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
  tabLabel,
  canUpload = false,
  uploading = false,
  onUpload,
  multiSelect = false,
  selectedRowIds,
  onSelectedRowIdsChange,
  canSelectRow,
}: FileStoragePickerTableProps) {
  const showTabEmptyState = !isLoading && data.length === 0 && Boolean(tabLabel)

  if (showTabEmptyState) {
    return (
      <FileStorageTabEmpty
        tabLabel={tabLabel!}
        canUpload={canUpload}
        uploading={uploading}
        onUpload={onUpload}
      />
    )
  }

  const selectionProps =
    multiSelect && selectedRowIds && onSelectedRowIdsChange
      ? adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)
      : { rowSelectionEnabled: false as const }

  return (
    <AdminDataTable<FileStorageRow>
      tableScope={tableScope}
      data={data}
      getRowId={(row) => row.relativePath}
      columns={columns}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      manualFiltering
      showIndexColumn
      canSelectRow={multiSelect ? canSelectRow : undefined}
      showTableToolbar={multiSelect}
      showColumnFilters={false}
      showTableColumnPicker={false}
      stickyTableHeader={false}
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
