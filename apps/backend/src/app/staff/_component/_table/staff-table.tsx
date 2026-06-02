import type { ColumnFiltersState, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { AdminDataTable } from "@ui/components/data-table";
import { getStaffColumns } from "../columns";
import type { StaffRow } from "../types";
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";

interface StaffTableProps {
  data: StaffRow[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  globalFilter: string;
  onGlobalFilterChange: OnChangeFn<string>;
  selectedRowIds: RowSelectionState;
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>;
  onView: (user: StaffRow) => void;
  onEdit: (user: StaffRow) => void;
  onDelete: (user: StaffRow) => void;
  onPurge: (user: StaffRow) => void;
  busy: boolean;
  currentUserId?: string;
  onBulkDelete: (ids: string[]) => void;
  onBulkPurge: (ids: string[]) => void;
  onClearFilters: () => void;
  roleOptions?: { value: string; label: string }[];
}

export function StaffTable(props: StaffTableProps) {
  const {
    data,
    isLoading,
    total,
    page,
    pageSize,
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
    busy,
    currentUserId,
    onBulkDelete,
    onBulkPurge,
    onClearFilters,
    roleOptions,
  } = props;

  const columns = getStaffColumns({
    onView,
    onEdit,
    onDelete,
    onPurge,
    busy,
    currentUserId,
    roleOptions,
  });

  return (
    <AdminDataTable<StaffRow>
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
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      canSelectRow={(row) => String(row.original.id) !== String(currentUserId ?? "")}
      bulkActions={[
        {
          id: "bulk-staff-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          onAction: async (rows) => {
            const ids = rows
              .filter((u) => String(u.id) !== String(currentUserId ?? ""))
              .map((u) => String(u.id));
            if (!ids.length) return;
            await onBulkDelete(ids);
          },
        },
        {
          id: "bulk-staff-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          onAction: async (rows) => {
            const ids = rows
              .filter((u) => String(u.id) !== String(currentUserId ?? ""))
              .map((u) => String(u.id));
            if (!ids.length) return;
            await onBulkPurge(ids);
          },
        },
      ]}
      xlsxExport={buildAdminTableXlsxExport("staff", { pageCount: data.length, total })}
      pagination={{
        page,
        pageSize,
        total,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary: "Không có nhân sự",
        itemLabel: "tài khoản",
      }}
    />
  );
}
