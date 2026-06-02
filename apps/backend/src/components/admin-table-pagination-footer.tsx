"use client"

/**
 * @deprecated Dùng `pagination` / `clientPagination` trên `AdminDataTable` từ `@ui/components/data-table`.
 * File giữ re-export để các trang admin cũ không gãy import.
 */
export {
  AdminDataTablePagination as AdminTablePaginationFooter,
  ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS as ADMIN_TABLE_PAGE_SIZE_OPTIONS,
} from "@ui/components/data-table"

export type {
  AdminDataTableServerPaginationConfig as AdminTablePaginationFooterProps,
} from "@ui/components/data-table"
