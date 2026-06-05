import type { ColumnDef } from "@tanstack/react-table"

export type LinkedUserRef = {
  id: string
  name: string | null
  email: string
}

type RelationExportField<T> = {
  id: string
  header: string
  getValue: (row: T) => unknown
  exportWidth?: number
  defaultHidden?: boolean
}

function formatRelationCellValue(value: unknown): string {
  if (value == null || value === "") return ""
  if (typeof value === "boolean") return value ? "Có" : "Không"
  if (typeof value === "number") return String(value)
  if (value instanceof Date) return value.toLocaleString("vi-VN")
  return String(value)
}

/**
 * Gộp object quan hệ (populate) với field phẳng từ API (assignedToId, assignedToName…).
 */
export function resolveLinkedUser(
  nested: LinkedUserRef | null | undefined,
  flat?: {
    id?: string | null
    name?: string | null
    email?: string | null
  } | null,
): LinkedUserRef | null {
  if (nested && (nested.id || nested.email || nested.name)) {
    return {
      id: nested.id || flat?.id || "",
      name: nested.name ?? flat?.name ?? null,
      email: nested.email || flat?.email || "",
    }
  }
  if (flat?.id) {
    return {
      id: flat.id,
      name: flat.name ?? null,
      email: flat.email ?? "",
    }
  }
  return null
}

/**
 * Cột ẩn mặc định cho dữ liệu quan hệ (FK, populate từ API).
 * Bật hiển thị qua "Hiện cột" — cell render giá trị thật, không để trống.
 */
export function defineRelationExportColumns<T>(
  fields: RelationExportField<T>[]
): ColumnDef<T, unknown>[] {
  return fields.map((field) => ({
    id: field.id,
    header: field.header,
    accessorFn: (row) => field.getValue(row),
    enableSorting: false,
    enableColumnFilter: false,
    meta: {
      defaultHidden: field.defaultHidden ?? true,
      exportHeader: field.header,
      exportValue: (row: T) => field.getValue(row),
      exportWidth: field.exportWidth,
    },
    cell: ({ row }) => {
      const text = formatRelationCellValue(field.getValue(row.original))
      return text || "—"
    },
  }))
}

function linkedUserLabel(user: LinkedUserRef | null | undefined): string {
  if (!user) return ""
  return user.name?.trim() || user.email || user.id
}

/**
 * Cột hiển thị + xuất cho quan hệ User (assignedTo, submittedBy, author…).
 */
export function defineLinkedUserColumns<T>(options: {
  scope: string
  header: string
  getUser: (row: T) => LinkedUserRef | null | undefined
  /** Ẩn cột hiển thị mặc định — vẫn xuất qua "Hiện cột". */
  defaultHidden?: boolean
}): ColumnDef<T, unknown>[] {
  const { scope, header, getUser, defaultHidden = false } = options
  return [
    {
      id: `${scope}Name`,
      header,
      accessorFn: (row) => linkedUserLabel(getUser(row)),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        defaultHidden,
        exportHeader: header,
        exportValue: (row: T) => linkedUserLabel(getUser(row)),
      },
      cell: ({ row }) => linkedUserLabel(getUser(row.original)) || "—",
    },
    ...defineRelationExportColumns<T>([
      {
        id: `${scope}Email`,
        header: `Email — ${header}`,
        getValue: (row) => getUser(row)?.email ?? "",
      },
      {
        id: `${scope}Id`,
        header: `ID — ${header}`,
        getValue: (row) => getUser(row)?.id ?? "",
        defaultHidden: true,
      },
    ]),
  ]
}
