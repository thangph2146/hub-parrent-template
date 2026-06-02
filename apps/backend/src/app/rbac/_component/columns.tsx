"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Lock } from "lucide-react";
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableEditButton,
  AdminTablePurgeButton,
  AdminTableRowActions,
  AdminTableSoftDeleteButton,
} from "@/components/admin-table-row-actions";
import { isSuperAdminRoleCode } from "@workspace/api-client";

type RoleRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  deletedAt: string | null;
};

export interface RbacColumnsProps {
  onEdit: (role: RoleRow) => void;
  onDelete: (role: RoleRow) => void;
  onPurge: (role: RoleRow) => void;
  canManageRoles: boolean;
}

export function getRbacColumns(props: RbacColumnsProps): ColumnDef<RoleRow>[] {
  const { onEdit, onDelete, onPurge, canManageRoles } = props;

  return [
    {
      accessorKey: "name",
      header: "Vai trò",
      meta: { filterPlaceholder: "Lọc tên vai trò…" },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs font-mono text-muted-foreground">{row.original.code}</div>
        </div>
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
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="outline" className="border-emerald-300 text-emerald-700">
            Hoạt động
          </Badge>
        ) : (
          <Badge variant="outline">Tạm tắt</Badge>
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
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5" disabled>
              <Lock className="size-3.5" aria-hidden />
              Hệ thống
            </Button>
          );
        }

        return (
          <AdminTableRowActions>
            <AdminTableEditButton
              onClick={() => onEdit(role)}
              disabled={!canManageRoles}
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
