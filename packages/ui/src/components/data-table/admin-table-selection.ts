"use client"

import { useCallback, useState } from "react"
import type { OnChangeFn, Row, RowSelectionState } from "@tanstack/react-table"
import { DATA_TABLE_SELECTION_COLUMN_WIDTH } from "./data-table"

/** Props chuẩn cột checkbox — truyền vào `AdminDataTable` cùng `bulkActions`. */
export type AdminTableRowSelectionProps = {
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  selectionColumnWidth: number
  /** Bật cột checkbox (dùng cùng `bulkActions`). */
  rowSelectionEnabled: true
}

export function adminTableRowSelectionProps(
  selectedRowIds: RowSelectionState,
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
): AdminTableRowSelectionProps {
  return {
    selectedRowIds,
    onSelectedRowIdsChange,
    selectionColumnWidth: DATA_TABLE_SELECTION_COLUMN_WIDTH,
    rowSelectionEnabled: true,
  }
}

/** State chọn dòng + props sẵn cho bảng (dùng trong page hoặc component table). */
export function useAdminTableRowSelection(initial: RowSelectionState = {}) {
  const [selectedRowIds, setSelectedRowIds] =
    useState<RowSelectionState>(initial)
  const clearRowSelection = useCallback(() => setSelectedRowIds({}), [])

  return {
    selectedRowIds,
    onSelectedRowIdsChange: setSelectedRowIds,
    clearRowSelection,
    selectionProps: adminTableRowSelectionProps(
      selectedRowIds,
      setSelectedRowIds
    ),
  }
}

export function adminTableGetRowIdFromOriginal<
  T extends { id: string | number },
>(original: T, _index?: number, _parent?: Row<T>): string {
  return String(original.id)
}
