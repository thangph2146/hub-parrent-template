import type {
  DatabaseSchemaResponse,
  SchemaRelation,
} from "@workspace/api-client"
import type { EntityRelationRow, EntitySchemaRow } from "./types"

export function buildEntitySchemaRows(
  schema: DatabaseSchemaResponse
): EntitySchemaRow[] {
  const refsOut = new Map<string, Set<string>>()
  const refsIn = new Map<string, Set<string>>()

  for (const rel of schema.relations) {
    if (!refsOut.has(rel.fromTable)) refsOut.set(rel.fromTable, new Set())
    refsOut.get(rel.fromTable)!.add(rel.toTable)

    if (!refsIn.has(rel.toTable)) refsIn.set(rel.toTable, new Set())
    refsIn.get(rel.toTable)!.add(rel.fromTable)
  }

  return schema.tables
    .map((table) => {
      const pkColumns = table.columns
        .filter((c) => c.kind === "pk")
        .map((c) => c.name)
      const fkCount = table.columns.filter((c) => c.kind === "fk").length

      return {
        id: table.name,
        tableName: table.name,
        entityName: table.entityName,
        exportModelName: table.exportModelName,
        domain: table.domain,
        description: table.description,
        columnCount: table.columns.length,
        pkColumns: pkColumns.join(", ") || "—",
        fkCount,
        rowCount: table.rowCount ?? 0,
        activeRowCount: table.activeRowCount ?? table.rowCount ?? 0,
        trashedRowCount: table.trashedRowCount ?? 0,
        referencesOut: [...(refsOut.get(table.name) ?? [])].sort(),
        referencedBy: [...(refsIn.get(table.name) ?? [])].sort(),
      }
    })
    .sort((a, b) => b.activeRowCount - a.activeRowCount)
}

export function formatEntityRowCount(value: number): string {
  if (value < 0) return "—"
  return value.toLocaleString("vi-VN")
}

export function buildEntityRelationRows(
  relations: SchemaRelation[]
): EntityRelationRow[] {
  return relations.map((rel, index) => ({
    ...rel,
    id: `${rel.fromTable}.${rel.fromColumn}->${rel.toTable}.${rel.toColumn}:${index}`,
    label: `${rel.fromTable}.${rel.fromColumn} → ${rel.toTable}.${rel.toColumn}`,
  }))
}

export const DOMAIN_BADGE_CLASS: Record<string, string> = {
  Identity:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  Auth: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300",
  Student:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  Support:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  Content:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
  Messaging:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300",
  System:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  Event:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300",
}
