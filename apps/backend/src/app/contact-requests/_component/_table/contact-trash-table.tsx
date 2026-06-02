import type { ColumnFiltersState, RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@ui/components/button";
import { AdminDataTable } from "@ui/components/data-table";
import { getTrashColumns } from "../columns";
import type { ContactRequest } from "../types";
import { downloadXlsxFile } from "@ui/lib/export-xlsx";
import { buildContactRequestsXlsxExport } from "@ui/components/admin";

function parseStructuredContent(content: string | undefined): Record<string, string> {
  if (!content) return {};
  const lines = content.split('\n').filter(line => line.trim());
  const parsed: Record<string, string> = {};
  
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      parsed[key.trim()] = value.trim();
    }
  }
  
  return parsed;
}

function buildCustomExportData(data: ContactRequest[]): { headers: string[]; rows: string[][] } {
  const headers = [
    "Tên",
    "Email",
    "Tiêu đề",
    "Địa chỉ",
    "Chương trình",
    "Ngành",
    "Đăng ký nhận thông tin tuyển sinh",
    "Đăng ký tư vấn",
    "Nội dung",
    "Xóa lúc",
  ];
  
  const rows = data.map((item) => {
    const parsed = parseStructuredContent(item.content || item.message || "");
    
    return [
      item.name || "",
      item.email || "",
      item.subject || "",
      parsed["Địa chỉ"] || "",
      parsed["Chương trình"] || "",
      parsed["Ngành"] || "",
      parsed["Đăng ký nhận thông tin tuyển sinh"] || "",
      parsed["Đăng ký tư vấn"] || "",
      parsed["Nội dung"] || item.content || item.message || "",
      item.deletedAt ? new Date(item.deletedAt).toLocaleString("vi-VN") : "",
    ];
  });
  
  return { headers, rows };
}

interface ContactRequestTrashTableProps {
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
  onRestore: (contact: ContactRequest) => void;
  onPurge: (contact: ContactRequest) => void;
  busy: boolean;
  canRestore?: boolean;
  canDelete?: boolean;
  onBulkRestore: (ids: string[]) => void;
  onBulkPurge: (ids: string[]) => void;
  onClearFilters: () => void;
}

export function ContactRequestTrashTable(props: ContactRequestTrashTableProps) {
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
    onRestore,
    onPurge,
    busy,
    canRestore,
    canDelete,
    onBulkRestore,
    onBulkPurge,
    onClearFilters,
  } = props;

  const columns = getTrashColumns({ onRestore, onPurge, busy, canRestore, canDelete });

  const handleXlsxExport = () => {
    const template = buildContactRequestsXlsxExport("trash", {
      pageCount: data.length,
      total,
    });
    const { headers, rows } = buildCustomExportData(data);
    void downloadXlsxFile(
      template.fileName,
      headers,
      rows,
      template.sheetName,
      {
        title: template.title,
        subtitle: template.subtitle,
        metadata: template.metadata,
      },
    );
  };

  return (
    <AdminDataTable<ContactRequest>
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Không có yêu cầu trong thùng rác khớp tìm kiếm."
      defaultExpandedAll={false}
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên, email, tiêu đề…"
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        ...(canRestore
          ? [
              {
                id: "bulk-contact-restore" as const,
                label: "Khôi phục đã chọn",
                variant: "default" as const,
                onAction: async (rows: ContactRequest[]) => {
                  const ids = rows.map((c) => String(c.id));
                  if (!ids.length) return;
                  await onBulkRestore(ids);
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
      filterToolbarExtra={
        <Button
          type="button"
          variant="outline"
          disabled={data.length === 0}
          onClick={handleXlsxExport}
        >
          <Download className="size-4" />
          Excel
        </Button>
      }
      xlsxExport={false}
      pagination={{
        page,
        pageSize,
        total,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary: "Không có yêu cầu trong thùng rác",
        itemLabel: "yêu cầu",
      }}
    />
  );
}
