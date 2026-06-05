"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, CircleCheck, CircleDashed, CircleDot, Mail, MessageSquare, Phone, User } from "lucide-react";
import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge";
import { defineAdminTrashActionsColumn } from "@ui/components/admin";
import type { ContactRequest } from "./types";
import {
  CONTACT_REQUEST_PRIORITY_LABELS,
  CONTACT_REQUEST_STATUS_LABELS,
} from "./types";
import { formatPhoneNumber } from "./utils";
import {
  ContactRequestRowActions,
  contactRequestActionsColumnId,
  contactRequestActionsColumnMeta,
} from "./contact-row-actions";

/** Độ rộng cột bảng — khai báo trên `meta.className`, không đặt `min-w` trong cell. */
const COL_NAME = "w-[180px] min-w-[160px] max-w-[220px]";
const COL_EMAIL = "w-[210px] min-w-[190px] max-w-[260px]";
const COL_PHONE = "w-[130px] min-w-[120px] max-w-[145px]";
const COL_SUBJECT = "w-[160px] min-w-[140px] max-w-[200px]";
const COL_TEXT = "w-[220px] min-w-[180px] max-w-[280px]";
const COL_SLUG = "w-[140px] min-w-[120px] max-w-[165px]";
const COL_BADGE = "w-[108px] min-w-[96px] max-w-[120px]";
const COL_DATE = "w-[168px] min-w-[150px] max-w-[185px]";

export interface ContactRequestColumnsProps {
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
}

export function getContactRequestColumns(props: ContactRequestColumnsProps): ColumnDef<ContactRequest>[] {
  const {
    onView,
    onDelete,
    onPurge,
    onStatusChange,
    onSetRead,
    onSetPriority,
    busy,
    canUpdate,
    canDelete,
  } = props;

  return [
    {
      accessorKey: "name",
      header: "Tên",
      meta: {
        filterPlaceholder: "Lọc tên…",
        className: COL_NAME,
      } as ColumnDef<ContactRequest>["meta"],
      cell: ({ row }) => (
        <span className="flex min-w-0 items-center gap-2">
          <User className="size-4 shrink-0 text-primary/80" aria-hidden />
          <span className="line-clamp-3 font-medium">{row.original.name}</span>
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: {
        filterPlaceholder: "Lọc email…",
        className: COL_EMAIL,
      },
      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="line-clamp-3 break-all">{String(getValue())}</span>
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "SĐT",
      meta: {
        filterPlaceholder: "Lọc SĐT…",
        className: COL_PHONE,
      },
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined;
        return v ? (
          <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            {formatPhoneNumber(v)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5 opacity-40" aria-hidden />—
          </span>
        );
      },
    },
    {
      accessorKey: "subject",
      header: "Tiêu đề",
      meta: {
        filterPlaceholder: "Lọc tiêu đề…",
        className: COL_SUBJECT,
      },
      cell: ({ getValue }) => (
        <span className="line-clamp-3">{String(getValue())}</span>
      ),
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
            <span className="line-clamp-3">{message.trim() || content}</span>
          </span>
        );
      },
      meta: {
        filterPlaceholder: "Lọc nội dung…",
        className: COL_TEXT,
      },
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      enableColumnFilter: false,
      meta: { className: COL_TEXT },
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        const match = content.match(/Địa chỉ:\s*(.+?)(?:\n|$)/);
        const address = match ? match[1].trim() : "";
        
        if (!address) return <span className="text-muted-foreground text-xs">—</span>;
        
        return (
          <span className="line-clamp-3 text-xs">{address}</span>
        );
      },
    },
    {
      accessorKey: "program",
      header: "Chương trình",
      enableColumnFilter: false,
      meta: { className: COL_SLUG },
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        const match = content.match(/Chương trình:\s*(.+?)(?:\n|$)/);
        const program = match ? match[1].trim() : "";
        
        if (!program) return <span className="text-muted-foreground text-xs">—</span>;
        
        return (
          <span className="line-clamp-3 text-xs">{program}</span>
        );
      },
    },
    {
      accessorKey: "major",
      header: "Ngành",
      enableColumnFilter: false,
      meta: { className: COL_SLUG },
      cell: ({ row }) => {
        const content = row.original.content || row.original.message || "";
        const match = content.match(/Ngành:\s*(.+?)(?:\n|$)/);
        const major = match ? match[1].trim() : "";
        
        if (!major) return <span className="text-muted-foreground text-xs">—</span>;
        
        return (
          <span className="line-clamp-3 text-xs">{major}</span>
        );
      },
    },
    {
      accessorKey: "isRead",
      header: "Đã đọc",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        className: COL_BADGE,
        filterVariant: "select",
        filterLabel: "Đã đọc",
        selectOptions: [
          { value: "true", label: "Đã đọc" },
          { value: "false", label: "Chưa đọc" },
        ],
      },
      filterFn: (row, id, v) => {
        if (v == null || v === "") return true;
        const read = row.getValue(id) as boolean | undefined;
        return String(read) === v;
      },
      cell: ({ row }) => {
        const read = row.original.isRead;
        return (
          <UsageStatusBadge
            tone={read ? "success" : "warning"}
            className="text-[10px]"
          >
            {read ? "Đã đọc" : "Chưa đọc"}
          </UsageStatusBadge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Ưu tiên",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        className: COL_BADGE,
        filterVariant: "select",
        filterLabel: "Ưu tiên",
        selectOptions: [
          { value: "HIGH", label: "Cao" },
          { value: "MEDIUM", label: "Trung bình" },
          { value: "LOW", label: "Thấp" },
        ],
      },
      filterFn: (row, id, v) => {
        if (v == null || v === "") return true;
        const p = (row.getValue(id) as string | undefined) ?? "MEDIUM";
        return p === v;
      },
      cell: ({ getValue }) => {
        const p = (getValue() as ContactRequest["priority"]) ?? "MEDIUM";
        const tone =
          p === "HIGH" ? "danger" : p === "MEDIUM" ? "warning" : "success";
        return (
          <UsageStatusBadge tone={tone} className="text-[10px]">
            {CONTACT_REQUEST_PRIORITY_LABELS[p]}
          </UsageStatusBadge>
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
        className: COL_BADGE,
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
      meta: { className: COL_DATE },
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return (
          <span className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            {new Date(v).toLocaleString("vi-VN")}
          </span>
        );
      },
    },
    {
      id: contactRequestActionsColumnId,
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: contactRequestActionsColumnMeta,
      cell: ({ row }) => (
        <ContactRequestRowActions
          contact={row.original}
          canUpdate={!!canUpdate}
          canDelete={!!canDelete}
          busy={busy}
          onView={() => onView(row.original)}
          onDelete={canDelete ? () => onDelete(row.original) : undefined}
          onPurge={canDelete ? () => onPurge(row.original) : undefined}
          onStatusChange={(status) => onStatusChange(row.original, status)}
          onSetRead={(isRead) => onSetRead(row.original, isRead)}
          onSetPriority={(priority) => onSetPriority(row.original, priority)}
        />
      ),
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
    defineAdminTrashActionsColumn<ContactRequest>({
      canWrite: !!(canRestore || canDelete),
      busy,
      pageConfirm: true,
      columnMeta: { className: "sticky right-0" },
      onRestore: canRestore ? onRestore : undefined,
      onPurge: canDelete ? onPurge : undefined,
    }),
  ];
}
