import type { ColumnFiltersState, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table";
import { getStaffColumns } from "../columns";
import type { StaffRow } from "../types";
import { buildAdminTableXlsxExport } from "@ui/components/admin";

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
  onToggleActive: (user: StaffRow) => void;
  busy: boolean;
  currentUserId?: string;
  actorEmail?: string;
  isProtected: (user: StaffRow) => boolean;
  onBulkDelete: (ids: string[]) => void;
  onBulkPurge: (ids: string[]) => void;
  onBulkActive: (ids: string[]) => void;
  onBulkUnactive: (ids: string[]) => void;
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
    onToggleActive,
    busy,
    currentUserId,
    actorEmail,
    isProtected,
    onBulkDelete,
    onBulkPurge,
    onBulkActive,
    onBulkUnactive,
    onClearFilters,
    roleOptions,
  } = props;

  const columns = getStaffColumns({
    onView,
    onEdit,
    onDelete,
    onPurge,
    onToggleActive,
    busy,
    currentUserId,
    actorEmail,
    isProtected,
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
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      canSelectRow={(row) => String(row.original.id) !== String(currentUserId ?? "")}
      bulkActions={[
        {
          id: "bulk-staff-active",
          label: "Kích hoạt đã chọn",
          variant: "success",
          onAction: async (rows) => {
            const ids = rows
              .filter(
                (u) =>
                  String(u.id) !== String(currentUserId ?? "") &&
                  !isProtected(u) &&
                  !u.isActive,
              )
              .map((u) => String(u.id));
            if (!ids.length) return;
            await onBulkActive(ids);
          },
        },
        {
          id: "bulk-staff-unactive",
          label: "Khoá đã chọn",
          variant: "warning",
          onAction: async (rows) => {
            const ids = rows
              .filter(
                (u) =>
                  String(u.id) !== String(currentUserId ?? "") &&
                  !isProtected(u) &&
                  u.isActive,
              )
              .map((u) => String(u.id));
            if (!ids.length) return;
            await onBulkUnactive(ids);
          },
        },
        {
          id: "bulk-staff-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          onAction: async (rows) => {
            const ids = rows
              .filter(
                (u) =>
                  String(u.id) !== String(currentUserId ?? "") &&
                  !isProtected(u),
              )
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
              .filter(
                (u) =>
                  String(u.id) !== String(currentUserId ?? "") &&
                  !isProtected(u),
              )
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
