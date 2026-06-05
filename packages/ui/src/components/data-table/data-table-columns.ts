import type { ColumnDef } from "@tanstack/react-table"
import { applyDefaultDataColumnWidths } from "./data-table-column-width"
import {
  DATA_TABLE_ACTIONS_COLUMN_ID,
  TABLE_ACTIONS_COLUMN_META,
} from "./table-row-actions"

export function resolveDataTableColumnId<TData>(
  column: ColumnDef<TData, unknown>
): string | undefined {
  if (column.id) return column.id
  const accessorKey = (column as { accessorKey?: unknown }).accessorKey
  if (typeof accessorKey === "string") return accessorKey
  return undefined
}

export function dataTableColumnsHasActionsColumn<TData>(
  columns: ColumnDef<TData, unknown>[]
): boolean {
  const walk = (cols: ColumnDef<TData, unknown>[]): boolean => {
    for (const col of cols) {
      const group = col as ColumnDef<TData, unknown> & {
        columns?: ColumnDef<TData, unknown>[]
      }
      if (group.columns?.length && walk(group.columns)) return true
      const id = resolveDataTableColumnId(col)
      if (id === DATA_TABLE_ACTIONS_COLUMN_ID || col.meta?.isActionsColumn) {
        return true
      }
    }
    return false
  }
  return walk(columns)
}

/** Gộp meta chuẩn cho cột `actions` / `isActionsColumn` — không cần khai báo meta thủ công. */
export function normalizeDataTableColumns<TData>(
  columns: ColumnDef<TData, unknown>[]
): ColumnDef<TData, unknown>[] {
  const normalized = columns.map((column) => {
    const groupColumn = column as ColumnDef<TData, unknown> & {
      columns?: ColumnDef<TData, unknown>[]
    }
    const children = groupColumn.columns
      ? normalizeDataTableColumns(groupColumn.columns)
      : undefined
    const id = resolveDataTableColumnId(column)
    const isActions =
      id === DATA_TABLE_ACTIONS_COLUMN_ID || column.meta?.isActionsColumn === true

    if (!isActions && !children) return column

    if (!isActions && children) {
      return { ...column, columns: children }
    }

    return {
      ...column,
      ...(id === DATA_TABLE_ACTIONS_COLUMN_ID && !column.id
        ? { id: DATA_TABLE_ACTIONS_COLUMN_ID }
        : {}),
      enableColumnFilter: column.enableColumnFilter ?? false,
      enableSorting: column.enableSorting ?? false,
      ...(children ? { columns: children } : {}),
      meta: {
        ...TABLE_ACTIONS_COLUMN_META,
        ...column.meta,
      },
    }
  })
  return applyDefaultDataColumnWidths(normalized)
}
