"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@ui/components/badge";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import { ExternalLink } from "lucide-react";
import { defineAdminCrudActionsColumn } from "@ui/components/admin";
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
