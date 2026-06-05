"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@ui/components/badge";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import { ExternalLink } from "lucide-react";
import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin";
import { isSuperAdminRoleCode } from "@workspace/api-client";
import { defineRelationExportColumns } from "@ui/components/data-table";
import { permissionLabelVi } from "@/lib/permission-labels";
import type { RoleRow } from "./utils";
import { formatRoleDateTime } from "./utils";

export interface RbacColumnsProps {
  onView: (role: RoleRow) => void;
  onEdit: (role: RoleRow) => void;
  onDelete: (role: RoleRow) => void;
  onPurge: (role: RoleRow) => void;
  canManageRoles: boolean;
  /** Email trong `NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS` — được sửa vai trò `super_admin`. */
  canEditSuperAdminRole: boolean;
}

export function getRbacColumns(props: RbacColumnsProps): ColumnDef<RoleRow>[] {
  const { onView, onEdit, onDelete, onPurge, canManageRoles, canEditSuperAdminRole } =
    props;
  return [
    {
      accessorKey: "name",
      header: "Vai trò",
      meta: { filterPlaceholder: "Lọc tên vai trò…" },
      cell: ({ row }) => (
        <Link
          href={`/rbac/${row.original.id}`}
          className="group flex items-center gap-2"
        >
          <div>
            <div className="font-medium group-hover:text-primary group-hover:underline">{row.original.name}</div>
            <div className="text-xs font-mono text-muted-foreground">{row.original.code}</div>
          </div>
          <ExternalLink className="size-3 shrink-0 text-muted-foreground/40 group-hover:text-primary" aria-hidden />
        </Link>
      ),
    },
    {
      accessorKey: "code",
      header: "Mã vai trò",
      meta: {
        filterPlaceholder: "Lọc mã role…",
        defaultHidden: true,
      },
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      meta: {
        filterPlaceholder: "Lọc mô tả…",
        defaultHidden: true,
      },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description?.trim() || "—"}
        </span>
      ),
    },
    {
      id: "permissionCount",
      header: "Số quyền",
      accessorFn: (row) => row.permissions.length,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <Badge variant="secondary" className="rounded-lg">
          {row.original.permissions.length}
        </Badge>
      ),
    },
    {
      id: "permissionsList",
      header: "Danh sách quyền",
      accessorFn: (row) =>
        row.permissions.map((code) => permissionLabelVi(code)).join("; "),
      enableColumnFilter: false,
      meta: { defaultHidden: true },
      cell: ({ row }) => {
        const labels = row.original.permissions.map((code) => permissionLabelVi(code));
        if (labels.length === 0) return "—";
        return (
          <span className="text-xs text-muted-foreground" title={labels.join("; ")}>
            {labels.join("; ")}
          </span>
        );
      },
    },
    {
      id: "isActive",
      accessorFn: (row) => (row.isActive ? "true" : "false"),
      header: "Trạng thái",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === String(value);
      },
      meta: {
        filterVariant: "select",
        filterLabel: "Trạng thái",
        selectOptions: [
          { value: "true", label: "Hoạt động" },
          { value: "false", label: "Tạm tắt" },
        ],
      },
      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.isActive}
          labels={{ active: "Hoạt động", locked: "Tạm tắt" }}
          className="text-[10px]"
        />
      ),
    },
    ...defineRelationExportColumns<RoleRow>([
      {
        id: "permissionsCodes",
        header: "Mã quyền (export)",
        getValue: (row) => row.permissions.join("; "),
        defaultHidden: true,
      },
      { id: "createdAt", header: "Tạo lúc", getValue: (row) => row.createdAt },
      { id: "updatedAt", header: "Cập nhật lúc", getValue: (row) => row.updatedAt },
      { id: "id", header: "ID", getValue: (row) => row.id, defaultHidden: true },
    ]),
    defineAdminCrudActionsColumn<RoleRow>({
      canWrite: true,
      pageConfirm: true,
      getRecordLabel: (r) => r.name,
      onView,
      onEdit,
      onSoftDelete: onDelete,
      onPurge,
      resolveRowProps: (role) => {
        const isSuperAdmin = isSuperAdminRoleCode(role.code);
        if (isSuperAdmin) {
          return {
            editHidden: !canEditSuperAdminRole,
            editDisabled: !canManageRoles,
            editTitle: canEditSuperAdminRole
              ? undefined
              : "Chỉ tài khoản quản trị hệ thống mới được chỉnh sửa",
            onSoftDelete: undefined,
            onPurge: undefined,
          };
        }
        return {
          editDisabled: !canManageRoles,
          softDeleteDisabled: !canManageRoles,
          purgeDisabled: !canManageRoles,
        };
      },
    }),
  ];
}

export function getRbacTrashColumns(options: {
  canManageRoles: boolean;
  onRestore: (role: RoleRow) => void;
  onPurge: (role: RoleRow) => void;
}): ColumnDef<RoleRow>[] {
  const { canManageRoles, onRestore, onPurge } = options;
  return [
    {
      accessorKey: "name",
      header: "Vai trò",
      meta: { filterPlaceholder: "Lọc tên vai trò…" },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Mã vai trò",
      meta: { filterPlaceholder: "Lọc mã role…", defaultHidden: true },
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "deletedAt",
      header: "Xóa lúc",
      enableColumnFilter: false,
      cell: ({ row }) => formatRoleDateTime(row.original.deletedAt),
    },
    ...defineRelationExportColumns<RoleRow>([
      { id: "description", header: "Mô tả", getValue: (row) => row.description ?? "" },
      {
        id: "permissionCount",
        header: "Số quyền",
        getValue: (row) => row.permissions.length,
      },
      { id: "createdAt", header: "Tạo lúc", getValue: (row) => row.createdAt },
      { id: "id", header: "ID", getValue: (row) => row.id, defaultHidden: true },
    ]),
    defineAdminTrashActionsColumn<RoleRow>({
      canWrite: canManageRoles,
      onRestore,
      onPurge,
    }),
  ];
}
