"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, CircleCheck, CircleDashed, CircleDot, Mail, MessageSquare, Phone, User } from "lucide-react";
import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge";
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableEditButton,
  AdminTablePurgeButton,
  AdminTableRestoreButton,
  AdminTableRowActions,
  AdminTableSoftDeleteButton,
  AdminTableViewButton,
} from "@/components/admin-table-row-actions";
import type { ContactRequest } from "./types";
import { CONTACT_REQUEST_STATUS_LABELS } from "./types";
import { formatPhoneNumber } from "./utils";

export interface ContactRequestColumnsProps {
  onView: (contact: ContactRequest) => void;
  onEdit: (contact: ContactRequest) => void;
  onDelete: (contact: ContactRequest) => void;
  onPurge: (contact: ContactRequest) => void;
  busy: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function getContactRequestColumns(props: ContactRequestColumnsProps): ColumnDef<ContactRequest>[] {
  const { onView, onEdit, onDelete, onPurge, busy, canUpdate, canDelete } = props;

  return [
    {
      accessorKey: "name",
      header: "Tên",
      meta: {
        filterPlaceholder: "Lọc tên…",
      } as ColumnDef<ContactRequest>['meta'],
      size: 200,
      cell: ({ row }) => (
        <span className="min-w-[200px] flex min-w-0 items-center gap-2">
          <User className="size-4 shrink-0 text-primary/80" aria-hidden />
          <span className="line-clamp-3 font-medium">{row.original.name}</span>
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="line-clamp-3">{String(getValue())}</span>
        </span>
      ),
      meta: { filterPlaceholder: "Lọc email…" },
    },
    {
      accessorKey: "phone",
      header: "SĐT",
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined;
        return v ? (
          <span className="min-w-[120px] flex items-center gap-2 font-mono text-xs tabular-nums">
            <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            {formatPhoneNumber(v)}
          </span>
        ) : (
          <span className="min-w-[120px] flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5 opacity-40" aria-hidden />—
          </span>
        );
      },
      meta: { filterPlaceholder: "Lọc SĐT…" },
    },
    {
      accessorKey: "subject",
      header: "Tiêu đề",
      cell: ({ getValue }) => (
        <span className="line-clamp-3 max-w-[300px]">{String(getValue())}</span>
      ),
      meta: { filterPlaceholder: "Lọc tiêu đề…" },
    },
    {
      accessorKey: "content",
      header: "Nội dung",
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        
        // Parse structured content to extract only the message
        const lines = content.split('\n').filter(line => line.trim());
        let message = "";
        
        for (const line of lines) {
          const match = line.match(/^Nội dung:\s*(.+)$/);
          if (match) {
            message = match[1].trim();
            break;
          }
        }
        
        // If no "Nội dung:" found, use the whole content but exclude structured fields
        if (!message) {
          for (const line of lines) {
            const isStructuredField = line.match(/^(Địa chỉ|Chương trình|Ngành|Đăng ký|Số điện thoại|Email):/);
            if (!isStructuredField) {
              message += line + " ";
            }
          }
        }
        
        return (
          <span className="flex items-start gap-2 text-xs">
            <MessageSquare className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
            <span className="line-clamp-3 max-w-[300px]">{message.trim() || content}</span>
          </span>
        );
      },
      meta: { filterPlaceholder: "Lọc nội dung…" },
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      enableColumnFilter: false,
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        const match = content.match(/Địa chỉ:\s*(.+?)(?:\n|$)/);
        const address = match ? match[1].trim() : "";
        
        if (!address) return <span className="text-muted-foreground text-xs">—</span>;
        
        return (
          <span className="line-clamp-3 text-xs max-w-[300px]">{address}</span>
        );
      },
    },
    {
      accessorKey: "program",
      header: "Chương trình",
      enableColumnFilter: false,
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        const match = content.match(/Chương trình:\s*(.+?)(?:\n|$)/);
        const program = match ? match[1].trim() : "";
        
        if (!program) return <span className="text-muted-foreground text-xs">—</span>;
        
        return (
          <span className="line-clamp-3 text-xs max-w-[300px]">{program}</span>
        );
      },
    },
    {
      accessorKey: "major",
      header: "Ngành",
      enableColumnFilter: false,
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        const match = content.match(/Ngành:\s*(.+?)(?:\n|$)/);
        const major = match ? match[1].trim() : "";
        
        if (!major) return <span className="text-muted-foreground text-xs">—</span>;
        
        return (
          <span className="line-clamp-3 text-xs max-w-[300px]">{major}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        const label = CONTACT_REQUEST_STATUS_LABELS[status];

        const statusConfig = {
          new: { icon: CircleDot, tone: "warning" as UsageStatusTone },
          "in-progress": { icon: CircleDashed, tone: "warning" as UsageStatusTone },
          resolved: { icon: CircleCheck, tone: "success" as UsageStatusTone },
          archived: { icon: CircleCheck, tone: "danger" as UsageStatusTone },
        } as const;

        const config =
          statusConfig[status as keyof typeof statusConfig] ?? statusConfig.archived;
        const StatusIcon = config.icon;

        return (
          <UsageStatusBadge tone={config.tone} className="gap-1.5 text-[10px]">
            <StatusIcon className="size-3 shrink-0" aria-hidden />
            {label}
          </UsageStatusBadge>
        );
      },
      filterFn: (row, id, v) => {
        if (v == null || v === "") return true;
        return row.getValue(id) === v;
      },
      meta: {
        filterVariant: "select",
        filterLabel: "Trạng thái",
        selectOptions: [
          { value: "new", label: "Mới" },
          { value: "in-progress", label: "Đang xử lý" },
          { value: "resolved", label: "Đã giải quyết" },
          { value: "archived", label: "Đã lưu trữ" },
        ],
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return (
          <span className="min-w-[150px] flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            {new Date(v).toLocaleString("vi-VN")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      enableColumnFilter: false,
      enableSorting: false,
      meta: {
        ...ADMIN_TABLE_ACTIONS_COLUMN_META,
        className: "sticky right-0",
      } as ColumnDef<ContactRequest>["meta"],
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <AdminTableRowActions>
            <AdminTableViewButton onClick={() => onView(contact)} />
            {canUpdate ? (
              <AdminTableEditButton
                onClick={() => onEdit(contact)}
                disabled={busy}
              />
            ) : null}
            {canDelete ? (
              <AdminTableSoftDeleteButton
                onClick={() => onDelete(contact)}
                disabled={busy}
              />
            ) : null}
            {canDelete ? (
              <AdminTablePurgeButton
                onClick={() => onPurge(contact)}
                disabled={busy}
              />
            ) : null}
          </AdminTableRowActions>
        );
      },
    },
  ];
}

export function getTrashColumns(props: {
  onRestore: (contact: ContactRequest) => void;
  onPurge: (contact: ContactRequest) => void;
  busy: boolean;
  canRestore?: boolean;
  canDelete?: boolean;
}): ColumnDef<ContactRequest>[] {
  const { onRestore, onPurge, busy, canRestore, canDelete } = props;

  return [
    {
      accessorKey: "name",
      header: "Tên",
      meta: { filterPlaceholder: "Lọc tên…" },
      cell: ({ row }) => (
        <span className="flex min-w-0 items-center gap-2">
          <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium">{row.original.name}</span>
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { filterPlaceholder: "Lọc email…" },
      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
          <Mail className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{String(getValue())}</span>
        </span>
      ),
    },
    {
      accessorKey: "subject",
      header: "Tiêu đề",
      cell: ({ getValue }) => (
        <span className="truncate font-medium">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "deletedAt",
      header: "Xóa lúc",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined;
        return (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            {v ? new Date(v).toLocaleString("vi-VN") : "—"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      enableColumnFilter: false,
      enableSorting: false,
      meta: {
        ...ADMIN_TABLE_ACTIONS_COLUMN_META,
        className: "sticky right-0",
      },
      cell: ({ row }) => (
        <AdminTableRowActions>
          {canRestore ? (
            <AdminTableRestoreButton
              onClick={() => onRestore(row.original)}
              disabled={busy}
            />
          ) : null}
          {canDelete ? (
            <AdminTablePurgeButton
              onClick={() => onPurge(row.original)}
              disabled={busy}
            />
          ) : null}
        </AdminTableRowActions>
      ),
    },
  ];
}
