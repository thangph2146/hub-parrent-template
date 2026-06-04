"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@ui/components/badge";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import { Button } from "@ui/components/button";
import { ExternalLink, Lock } from "lucide-react";
import { ADMIN_TABLE_ACTIONS_COLUMN_META, AdminTableEditButton, AdminTablePurgeButton, AdminTableRowActions, AdminTableSoftDeleteButton, AdminTableViewButton } from "@ui/components/admin";
import { isSuperAdminRoleCode } from "@workspace/api-client";

type RoleRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};

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
      accessorKey: "isActive",
      header: "Trạng thái",
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "true", label: "Hoạt động" },
          { value: "false", label: "Tạm tắt" },
        ],
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === String(value);
      },
      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.isActive}
          labels={{ active: "Hoạt động", locked: "Tạm tắt" }}
          className="text-[10px]"
        />
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => {
        const role = row.original;
        const isSuperAdmin = isSuperAdminRoleCode(role.code);

        if (isSuperAdmin) {
          return (
            <AdminTableRowActions>
              <AdminTableViewButton onClick={() => onView(role)} />
              {canEditSuperAdminRole ? (
                <AdminTableEditButton
                  disabled={!canManageRoles}
                  onClick={() => onEdit(role)}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled
                  title="Chỉ tài khoản quản trị hệ thống mới được chỉnh sửa"
                >
                  <Lock className="size-3.5" aria-hidden />
                  Hệ thống
                </Button>
              )}
            </AdminTableRowActions>
          );
        }

        return (
          <AdminTableRowActions>
            <AdminTableViewButton
              onClick={() => onView(role)}
            />
            <AdminTableEditButton
                disabled={!canManageRoles}
                onClick={() => onEdit(role)}
              />
            <AdminTableSoftDeleteButton
              onClick={() => onDelete(role)}
              disabled={!canManageRoles}
            />
            <AdminTablePurgeButton
              onClick={() => onPurge(role)}
              disabled={!canManageRoles}
            />
          </AdminTableRowActions>
        );
      },
    },
  ];
}
