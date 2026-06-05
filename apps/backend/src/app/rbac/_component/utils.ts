import type { ColumnFiltersState } from "@tanstack/react-table";
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib";

export type RoleRow = {
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

export function normalizePermissionCodes(value: unknown): string[] {
  const visit = (input: unknown): string[] => {
    if (Array.isArray(input)) return input.flatMap((item) => visit(item));
    if (typeof input !== "string") return [];
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  };
  return [...new Set(visit(value))].sort((a, b) => a.localeCompare(b));
}

export function mapRoleRow(row: Record<string, unknown>): RoleRow {
  return {
    id: String(row.id ?? ""),
    code: String(row.name ?? ""),
    name: String(row.displayName ?? row.name ?? ""),
    description: (row.description as string | null | undefined) ?? null,
    permissions: normalizePermissionCodes(row.permissions),
    isActive: Boolean(row.isActive ?? true),
    createdAt: (row.createdAt as string | null | undefined) ?? null,
    updatedAt: (row.updatedAt as string | null | undefined) ?? null,
    deletedAt: (row.deletedAt as string | null | undefined) ?? null,
  };
}

export function buildRolesFilterQuery(
  columnFilters: ColumnFiltersState,
): Record<string, string> {
  return buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.roles);
}

export function formatRoleDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}
