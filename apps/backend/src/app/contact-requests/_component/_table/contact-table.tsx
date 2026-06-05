import type { ColumnFiltersState, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table";

import { buildAdminTableXlsxExport } from "@ui/components/admin";

import { downloadAdminTableXlsx } from "@/lib/admin-xlsx-export";

import { getContactRequestColumns } from "../columns";

import { getContactRequestExportFields } from "../contact-export";

import type { ContactRequest } from "../types";



interface ContactRequestTableProps {

  data: ContactRequest[];

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

  onView: (contact: ContactRequest) => void;

  onDelete: (contact: ContactRequest) => void;

  onPurge: (contact: ContactRequest) => void;

  onStatusChange: (

    contact: ContactRequest,

    status: ContactRequest["status"],

  ) => void | Promise<void>;

  onSetRead: (contact: ContactRequest, isRead: boolean) => void | Promise<void>;

  onSetPriority: (

    contact: ContactRequest,

    priority: NonNullable<ContactRequest["priority"]>,

  ) => void | Promise<void>;

  busy: boolean;

  canUpdate?: boolean;

  canDelete?: boolean;

  onBulkDelete: (ids: string[]) => void;

  onBulkPurge: (ids: string[]) => void;

  onClearFilters: () => void;

}



export function ContactRequestTable(props: ContactRequestTableProps) {

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

    onDelete,

    onPurge,

    onStatusChange,

    onSetRead,

    onSetPriority,

    busy,

    canUpdate,

    canDelete,

    onBulkDelete,

    onBulkPurge,

    onClearFilters,

  } = props;



  const columns = getContactRequestColumns({

    onView,

    onDelete,

    onPurge,

    onStatusChange,

    onSetRead,

    onSetPriority,

    busy,

    canUpdate,

    canDelete,

  });



  const exportConfig = buildAdminTableXlsxExport("contact-requests", {
    pageCount: data.length,
    total,
  });



  return (

    <AdminDataTable<ContactRequest>

      data={data}

      getRowId={(row) => String(row.id)}

      columns={columns}

      isLoading={isLoading}

      emptyLabel="Không có yêu cầu liên hệ khớp tìm kiếm hoặc bộ lọc."

      defaultExpandedAll={false}

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

        ...(canDelete

          ? [

              {

                id: "bulk-contact-delete" as const,

                label: "Xóa tạm đã chọn",

                variant: "destructive" as const,

                onAction: async (rows: ContactRequest[]) => {

                  const ids = rows.map((c) => String(c.id));

                  if (!ids.length) return;

                  await onBulkDelete(ids);

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

                  const ids = rows.map((c) => String(c.id));

                  if (!ids.length) return;

                  await onBulkPurge(ids);

                },

              },

            ]

          : []),

      ]}

      xlsxExport={{
        ...exportConfig,
        runExport: () =>
          downloadAdminTableXlsx({
            templateId: "contact-requests",
            data,
            fields: getContactRequestExportFields("active"),
            options: { pageCount: data.length, total },
          }),
      }}

      pagination={{

        page,

        pageSize,

        total,

        isLoading,

        onPageChange,

        onPageSizeChange,

        emptySummary: "Không có yêu cầu liên hệ",

        itemLabel: "yêu cầu",

      }}

    />

  );

}

