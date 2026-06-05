import type { ColumnDef, Table, VisibilityState } from "@tanstack/react-table"
import { resolveDataTableColumnId } from "./data-table-columns"
import { DATA_TABLE_ACTIONS_COLUMN_ID } from "./table-row-actions"

export const DATA_TABLE_ALWAYS_VISIBLE_COLUMN_IDS = new Set([
  "_select",
  "stt",
  "_expand",
  DATA_TABLE_ACTIONS_COLUMN_ID,
  "attendanceActions",
])

type ColumnMetaLike = {
  hideInTable?: boolean
  defaultHidden?: boolean
  enableHiding?: boolean
  isIndexColumn?: boolean
  isActionsColumn?: boolean
}

function walkColumns<TData>(
  columns: ColumnDef<TData, unknown>[]
): ColumnDef<TData, unknown>[] {
  const result: ColumnDef<TData, unknown>[] = []
  for (const column of columns) {
    const group = column as ColumnDef<TData, unknown> & {
      columns?: ColumnDef<TData, unknown>[]
    }
    if (group.columns?.length) {
      result.push(...walkColumns(group.columns))
      continue
    }
    result.push(column)
  }
  return result
}

export function isDataTableColumnHideable<TData>(
  column: ColumnDef<TData, unknown>
): boolean {
  const id = resolveDataTableColumnId(column)
  if (id && DATA_TABLE_ALWAYS_VISIBLE_COLUMN_IDS.has(id)) return false
  const meta = column.meta as ColumnMetaLike | undefined
  if (meta?.isIndexColumn || meta?.isActionsColumn) return false
  if (meta?.enableHiding === false) return false
  return Boolean(id)
}

export function buildDefaultTableColumnVisibility<TData>(
  columns: ColumnDef<TData, unknown>[],
  stored?: VisibilityState | null
): VisibilityState {
  const visibility: VisibilityState = {}
  for (const column of walkColumns(columns)) {
    const id = resolveDataTableColumnId(column)
    if (!id || !isDataTableColumnHideable(column)) continue
    const meta = column.meta as ColumnMetaLike | undefined
    if (stored && stored[id] !== undefined) {
      visibility[id] = stored[id]
    } else if (meta?.hideInTable || meta?.defaultHidden) {
      visibility[id] = false
    } else {
      visibility[id] = true
    }
  }
  return visibility
}

export function readStoredColumnVisibility(
  storageKey: string | undefined
): VisibilityState | null {
  if (!storageKey || typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return null
    return parsed as VisibilityState
  } catch {
    return null
  }
}

export function tableColumnVisibilityLabel<TData>(
  table: Table<TData>,
  columnId: string
): string {
  const column = table.getColumn(columnId)
  if (!column) return columnId
  const meta = column.columnDef.meta as { filterLabel?: string } | undefined
  if (meta?.filterLabel?.trim()) return meta.filterLabel.trim()
  const header = column.columnDef.header
  if (typeof header === "string" && header.trim()) return header.trim()
  return columnId
}

export function getHideableTableColumnOptions<TData>(
  table: Table<TData>
): Array<{ value: string; label: string }> {
  return table
    .getAllLeafColumns()
    .filter((column) => isDataTableColumnHideable(column.columnDef))
    .map((column) => ({
      value: column.id,
      label: tableColumnVisibilityLabel(table, column.id),
    }))
}
