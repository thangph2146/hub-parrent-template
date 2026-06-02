"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge";
import { Button } from "@ui/components/button";
import { CheckCircle2, Clock, User, XCircle } from "lucide-react";
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTablePurgeButton,
  AdminTableRowActions,
} from "@/components/admin-table-row-actions";
import type { ParentStudent } from "./types";

const actionButtonClass = "h-8 gap-1.5";

export interface ParentStudentsColumnsProps {
  onApprove: (row: ParentStudent) => void;
  onReject: (row: ParentStudent) => void;
  onPurge: (row: ParentStudent) => void;
  canApprove: boolean;
}

export function getParentStudentsColumns(props: ParentStudentsColumnsProps): ColumnDef<ParentStudent>[] {
  const { onApprove, onReject, onPurge, canApprove } = props;

  return [
    {
      id: "parent",
      header: "Phụ huynh",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <User className="size-3.5" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.parentId.slice(0, 8)}…
          </span>
        </div>
      ),
    },
    {
      id: "student",
      header: "Học sinh",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            {row.original.studentName && (
              <p className="font-medium">{row.original.studentName}</p>
            )}
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.studentCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Ghi chú",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        return v ? (
          <span className="text-xs text-muted-foreground">{v}</span>
        ) : (
          <span className="text-xs italic opacity-40">Không có</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày gửi",
      enableColumnFilter: true,
      enableSorting: true,
      meta: {
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
      },
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "pending", label: "Chờ duyệt" },
          { value: "approved", label: "Đã duyệt" },
          { value: "rejected", label: "Từ chối" },
        ],
      },
      cell: ({ getValue }) => {
        const s = getValue() as ParentStudent["status"];
        const STATUS_CONFIG: Record<
          "pending" | "approved" | "rejected",
          { label: string; icon: typeof Clock; tone: UsageStatusTone }
        > = {
          pending: { label: "Chờ duyệt", icon: Clock, tone: "warning" },
          approved: { label: "Đã duyệt", icon: CheckCircle2, tone: "success" },
          rejected: { label: "Từ chối", icon: XCircle, tone: "danger" },
        };
        const cfg = STATUS_CONFIG[s];
        const StatusIcon = cfg.icon;
        return (
          <UsageStatusBadge tone={cfg.tone} className="gap-1 text-[10px]">
            <StatusIcon className="size-3 shrink-0" aria-hidden />
            {cfg.label}
          </UsageStatusBadge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => (
        <AdminTableRowActions>
          {canApprove ? (
            <Button
              type="button"
              size="sm"
              variant="default"
              className={actionButtonClass}
              onClick={() => onApprove(row.original)}
            >
              <CheckCircle2 className="size-3.5" aria-hidden />
              Duyệt
            </Button>
          ) : null}
          {canApprove ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className={actionButtonClass}
              onClick={() => onReject(row.original)}
            >
              <XCircle className="size-3.5" aria-hidden />
              Từ chối
            </Button>
          ) : null}
          <AdminTablePurgeButton onClick={() => onPurge(row.original)} />
        </AdminTableRowActions>
      ),
    },
  ];
}
