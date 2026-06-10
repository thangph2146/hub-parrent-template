import type {
  DatabaseSchemaResponse,
  SchemaRelation,
  SchemaTable,
} from "@workspace/api-client"

export type { DatabaseSchemaResponse, SchemaRelation, SchemaTable }

export type EntitySchemaRow = {
  id: string
  tableName: string
  entityName: string
  exportModelName: string
  domain: string
  description: string
  columnCount: number
  pkColumns: string
  fkCount: number
  rowCount: number
  activeRowCount: number
  trashedRowCount: number
  auxiliaryRowCount?: number
  expectedRowCount?: number
  verificationStatus?: "ok" | "over" | "under"
  referencesOut: string[]
  referencedBy: string[]
}

export type EntityRelationRow = SchemaRelation & {
  id: string
  label: string
}
