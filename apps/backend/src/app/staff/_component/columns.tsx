import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarClock,
  Mail,
  Phone,
  ShieldHalf,
  UserCircle,
} from "lucide-react";
import { Badge } from "@ui/components/badge";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableEditButton,
  AdminTablePurgeButton,
  AdminTableRestoreButton,
  AdminTableRowActions,
  AdminTableSoftDeleteButton,
  AdminTableToggleActiveButton,
  AdminTableViewButton,
} from "@ui/components/admin";
import { isSuperAdminRoleCode } from "@workspace/api-client";
import { canEditProtectedAdminUser } from "@/config/protected-admin";
import type { StaffRow } from "./types";

export interface StaffColumnsProps {
  onView: (user: StaffRow) => void;
  onEdit: (user: StaffRow) => void;
  onDelete: (user: StaffRow) => void;
  onPurge: (user: StaffRow) => void;
  onToggleActive: (user: StaffRow) => void;
  busy: boolean;
  currentUserId?: string;
  actorEmail?: string;
  isProtected: (user: StaffRow) => boolean;
  roleOptions?: { value: string; label: string }[];
}

export function getStaffColumns(props: StaffColumnsProps): ColumnDef<StaffRow>[] {
  const {
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
  } = props;

  return [
    {
      accessorKey: "fullName",
      header: "Họ tên",
      meta: { filterPlaceholder: "Lọc họ tên…" },
      cell: ({ row }) => (
        <span className="flex min-w-0 items-center gap-2">
          <UserCircle
            className="size-4 shrink-0 text-primary/80"
            aria-hidden
          />
          <span className="truncate font-medium">
            {row.original.fullName}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="truncate">{String(getValue())}</span>
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
          <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <Phone
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            {v}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5 opacity-40" aria-hidden />—
          </span>
        );
      },
      meta: { filterPlaceholder: "Lọc SĐT…" },
    },
    {
      id: "roles",
      accessorFn: (u) =>
        u.roles.length === 0 ? "" : u.roles.map((r) => r.name).join("; "),
      header: "Vai trò",
      cell: ({ row }) => {
        const u = row.original;
        if (u.roles.length === 0) {
          return (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldHalf
                className="size-3.5 shrink-0 opacity-60"
                aria-hidden
              />
              —
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <Badge
                key={r.code}
                variant={
                  isSuperAdminRoleCode(r.code) ? "default" : "secondary"
                }
                className="text-xs font-normal"
              >
                {r.name}
              </Badge>
            ))}
          </div>
        );
      },
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: () => true,
      meta: {
        filterVariant: "select",
        filterLabel: "Vai trò",
        selectOptions: roleOptions ?? [],
      },
    },
    {
      id: "isActive",
      accessorFn: (u) => (u.isActive ? "true" : "false"),
      header: "Trạng thái",
      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.isActive}
          labels={{ active: "Hoạt động", locked: "Khoá" }}
          className="text-[10px]"
        />
      ),
      filterFn: (row, id, v) => {
        if (v == null || v === "") return true;
        return row.getValue(id) === v;
      },
      meta: {
        filterVariant: "select",
        filterLabel: "Trạng thái",
        selectOptions: [
          { value: "true", label: "Hoạt động" },
          { value: "false", label: "Khoá" },
        ],
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      enableColumnFilter: false,
      enableSorting: false,
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => {
        const u = row.original;
        const selfAccount = String(u.id) === String(currentUserId ?? "");
        const protectedAccount = isProtected(u);
        const canEditThisUser = canEditProtectedAdminUser(actorEmail, u.email);
        const blockedTitle = protectedAccount
          ? "Tài khoản hệ thống — không thể thay đổi trạng thái"
          : selfAccount
            ? "Không thao tác trên tài khoản đang đăng nhập"
            : undefined;
        return (
          <AdminTableRowActions>
            <AdminTableViewButton onClick={() => onView(u)} />
            <AdminTableEditButton
              onClick={() => onEdit(u)}
              disabled={busy || !canEditThisUser}
              title={
                protectedAccount && !canEditThisUser
                  ? "Tài khoản hệ thống — chỉ chính tài khoản đó mới được chỉnh sửa"
                  : undefined
              }
            />
            <AdminTableToggleActiveButton
              isActive={u.isActive}
              onClick={() => onToggleActive(u)}
              disabled={busy || selfAccount || protectedAccount}
              title={
                blockedTitle ??
                (u.isActive
                  ? "Khoá tài khoản (thu hồi phiên hiện tại)"
                  : "Kích hoạt tài khoản")
              }
            />
            <AdminTableSoftDeleteButton
              onClick={() => onDelete(u)}
              disabled={busy || selfAccount || protectedAccount}
              title={
                protectedAccount
                  ? "Tài khoản hệ thống — không thể xóa"
                  : selfAccount
                    ? "Không thao tác trên tài khoản đang đăng nhập"
                    : "Xóa tạm"
              }
            />
            <AdminTablePurgeButton
              onClick={() => onPurge(u)}
              disabled={busy || selfAccount || protectedAccount}
              title={
                protectedAccount
                  ? "Tài khoản hệ thống — không thể xóa"
                  : selfAccount
                    ? "Không thao tác trên tài khoản đang đăng nhập"
                    : "Xóa vĩnh viễn khỏi cơ sở dữ liệu"
              }
            />
          </AdminTableRowActions>
        );
      },
    },
  ];
}

export function getTrashColumns(props: {
  onRestore: (user: StaffRow) => void;
  onPurge: (user: StaffRow) => void;
  busy: boolean;
}): ColumnDef<StaffRow>[] {
  const { onRestore, onPurge, busy } = props;

  return [
    {
      accessorKey: "email",
      header: "Email",
      meta: { filterPlaceholder: "Lọc email…" },
      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
          <Mail
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">{String(getValue())}</span>
        </span>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Họ tên",
      meta: { filterPlaceholder: "Lọc họ tên…" },
      cell: ({ getValue }) => (
        <span className="flex min-w-0 items-center gap-2">
          <UserCircle
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate font-medium">{String(getValue())}</span>
        </span>
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
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => (
        <AdminTableRowActions className="justify-end">
          <AdminTableRestoreButton
            onClick={() => onRestore(row.original)}
            disabled={busy}
          />
          <AdminTablePurgeButton
            onClick={() => onPurge(row.original)}
            disabled={busy}
            label="Xóa vĩnh viễn"
          />
        </AdminTableRowActions>
      ),
    },
  ];
}
