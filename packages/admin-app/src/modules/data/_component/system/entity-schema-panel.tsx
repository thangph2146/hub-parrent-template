"use client"

import { useMemo, useState } from "react"
import { AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import type { ColumnFiltersState } from "@tanstack/react-table"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@ui/components/alert"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { AdminDataTable } from "@ui/components/data-table"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { toast } from "@ui/components/sonner"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { Check, Copy, GitBranch, Loader2, TableProperties } from "lucide-react"
import { getEntityRelationColumns, getEntitySchemaColumns } from "../_table/columns"
import { useDatabaseSchema } from "./_hooks/use-database-schema"
import { buildDatabaseSchemaErrorCopyText } from "./schema-error-report"
import { SystemOperationsPanel } from "./operations-panel"
import { copyTextToClipboard } from "./operation-result"
import type { SchemaTable } from "../shared/types"
import {
  buildEntityRelationRows,
  buildEntitySchemaRows,
  formatEntityRowCount,
} from "../shared/utils"

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {}
}

function getColumnId(column: unknown): string | null {
  const record = asRecord(column)
  if (typeof record.id === "string" && record.id.trim()) return record.id
  if (typeof record.accessorKey === "string" && record.accessorKey.trim()) {
    return record.accessorKey
  }
  return null
}

function getColumnLabel(column: unknown): string {
  const header = asRecord(column).header
  return typeof header === "string" && header.trim()
    ? header
    : (getColumnId(column) ?? "unknown")
}

function readJsonRecord(storageKey: string): Record<string, unknown> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function getColumnConfig(
  columns: readonly unknown[],
  storageKey: string
) {
  const saved = readJsonRecord(storageKey)
  const items = columns
    .map((column) => {
      const id = getColumnId(column)
      if (!id) return null
      const meta = asRecord(asRecord(column).meta)
      const defaultHidden = meta.defaultHidden === true
      const savedValue = saved[id]
      const visible =
        typeof savedValue === "boolean" ? savedValue : !defaultHidden
      return {
        id,
        label: getColumnLabel(column),
        visible,
      }
    })
    .filter((item): item is { id: string; label: string; visible: boolean } =>
      Boolean(item)
    )

  return {
    visible: items.filter((item) => item.visible),
    hidden: items.filter((item) => !item.visible),
    storage: saved,
  }
}

export function EntitySchemaPanel({
  schemaEnabled = true,
}: {
  schemaEnabled?: boolean
}) {
  const { schema, loading, error, queryError } =
    useDatabaseSchema(schemaEnabled)
  const [schemaTab, setSchemaTab] = useState<"tables" | "relations">("tables")
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [copiedConfig, setCopiedConfig] = useState(false)
  const [copiedSchemaError, setCopiedSchemaError] = useState(false)

  const entityRows = useMemo(
    () => (schema ? buildEntitySchemaRows(schema) : []),
    [schema]
  )
  const relationRows = useMemo(
    () => (schema ? buildEntityRelationRows(schema.relations) : []),
    [schema]
  )

  const entityColumns = useMemo(() => getEntitySchemaColumns(), [])
  const relationColumns = useMemo(() => getEntityRelationColumns(), [])

  const copyCurrentTableConfig = async () => {
    if (!schema) return
    const isTablesTab = schemaTab === "tables"
    const tableScope = isTablesTab
      ? "data-entity-tables"
      : "data-entity-relations"
    const rows = isTablesTab ? entityRows : relationRows
    const columns = isTablesTab ? entityColumns : relationColumns
    const columnConfig = getColumnConfig(columns, `${tableScope}-table-columns`)
    const payload = {
      title: "Bảng entity (MikroORM)",
      copiedAt: new Date().toISOString(),
      tableScope,
      activeTab: schemaTab,
      rowCount: rows.length,
      globalFilter,
      columnFilters,
      showIndexColumn: true,
      columns: {
        visible: columnConfig.visible,
        hidden: columnConfig.hidden,
        localStorageKey: `${tableScope}-table-columns`,
        localStorageValue: columnConfig.storage,
      },
      summary: {
        tables: schema.tables.length,
        relations: schema.relations.length,
        totalRows: schema.totalRows,
        totalActiveRows: schema.totalActiveRows,
        verification: schema.verification ?? null,
      },
    }
    const ok = await copyTextToClipboard(JSON.stringify(payload, null, 2))
    if (!ok) {
      toast.error("Không copy được cấu hình table.")
      return
    }
    setCopiedConfig(true)
    toast.success("Đã copy cấu hình table hiện tại.")
    window.setTimeout(() => setCopiedConfig(false), 1600)
  }

  const copySchemaError = async () => {
    if (!error) return
    const report = buildDatabaseSchemaErrorCopyText(queryError ?? error, error)
    const ok = await copyTextToClipboard(report)
    if (!ok) {
      toast.error("Không copy được báo cáo lỗi.")
      return
    }
    setCopiedSchemaError(true)
    toast.success("Đã copy báo cáo lỗi schema.")
    window.setTimeout(() => setCopiedSchemaError(false), 1600)
  }

  return (
    <>
      <SystemOperationsPanel />
      <FieldSet variant="section">
      <FieldSectionLegend
        icon={TableProperties}
        title="Bảng entity (MikroORM)"
        description="Danh sách bảng từ apps/api/src/entities, số bản ghi và quan hệ FK"
        badge={
          schema ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {schema.tables.length} bảng · {schema.relations.length} quan hệ ·{" "}
                {formatEntityRowCount(
                  schema.totalActiveRows ??
                    schema.tables.reduce(
                      (sum: number, t: SchemaTable) =>
                        sum + Math.max(0, t.activeRowCount ?? t.rowCount ?? 0),
                      0
                    )
                )}{" "}
                bản ghi
              </Badge>
              {schema.verification ? (
                <Badge
                  variant={
                    schema.verification.isComplete ? "default" : "secondary"
                  }
                  className="text-xs font-normal"
                >
                  {schema.verification.isComplete
                    ? `Khớp export ${schema.verification.referenceExportedAt}`
                    : `Lệch ${schema.verification.mismatchedModels} bảng / ${schema.verification.referenceSource}`}
                </Badge>
              ) : null}
            </div>
          ) : undefined
        }
      />
      <FieldSetContent
        variant="section"
        className="space-y-4 px-4 pt-0 pb-4 sm:px-5"
      >
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải metadata entity và đếm bản ghi…
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertTitle className="text-sm">Không tải được schema</AlertTitle>
            <AlertDescription className="pr-20 text-xs">{error}</AlertDescription>
            <AlertAction>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1.5"
                onClick={() => void copySchemaError()}
              >
                {copiedSchemaError ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
                {copiedSchemaError ? "Đã copy" : "Copy lỗi"}
              </Button>
            </AlertAction>
          </Alert>
        ) : null}

        {!loading && !error && schema?.verification ? (
          <Alert
            variant={schema.verification.isComplete ? "default" : "destructive"}
          >
            <AlertTitle className="text-sm">
              {schema.verification.isComplete
                ? "Dữ liệu khớp manifest import"
                : "Dữ liệu chưa khớp manifest import"}
            </AlertTitle>
            <AlertDescription className="text-xs">
              So với{" "}
              <code className="rounded bg-muted px-1">
                {schema.verification.referenceSource}
              </code>{" "}
              ({schema.verification.referenceExportedAt}):{" "}
              {schema.verification.matchedModels}/
              {schema.verification.matchedModels +
                schema.verification.mismatchedModels}{" "}
              bảng khớp ·{" "}
              {formatEntityRowCount(
                schema.verification.actualBusinessTotalRows
              )}{" "}
              /{" "}
              {formatEntityRowCount(
                schema.verification.expectedBusinessTotalRows
              )}{" "}
              bản ghi nghiệp vụ.
            </AlertDescription>
          </Alert>
        ) : null}

        {!loading && !error && schema ? (
          <Tabs
            value={schemaTab}
            onValueChange={(v) => setSchemaTab(v as "tables" | "relations")}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <AdminListTabsList>
                <AdminListTabsTrigger value="tables">
                  <TableProperties className="size-4" />
                  Bảng ({entityRows.length})
                </AdminListTabsTrigger>
                <AdminListTabsTrigger value="relations">
                  <GitBranch className="size-4" />
                  Quan hệ FK ({relationRows.length})
                </AdminListTabsTrigger>
              </AdminListTabsList>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => void copyCurrentTableConfig()}
              >
                {copiedConfig ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copiedConfig ? "Đã copy" : "Copy cấu hình table"}
              </Button>
            </div>

            <TabsContent value="tables">
              <AdminDataTable
                tableScope="data-entity-tables"
                data={entityRows}
                getRowId={(row) => row.id}
                columns={entityColumns}
                isLoading={false}
                emptyLabel="Không có bảng entity."
                manualFiltering
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                globalFilterPlaceholder="Tìm theo tên bảng, entity, domain…"
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                showIndexColumn
                showColumnFilters={false}
                footer={
                  <p className="text-xs text-muted-foreground">
                    Nguồn: MikroORM metadata từ{" "}
                    <code className="rounded bg-muted px-1">
                      apps/api/src/entities
                    </code>
                    . &quot;Bản ghi&quot; = số dòng đang hoạt động; bảng có{" "}
                    <code className="rounded bg-muted px-1">deletedAt</code>{" "}
                    hiển thị thêm số trong thùng rác. Sắp xếp theo số bản ghi
                    giảm dần.
                  </p>
                }
              />
            </TabsContent>

            <TabsContent value="relations">
              <AdminDataTable
                tableScope="data-entity-relations"
                data={relationRows}
                getRowId={(row) => row.id}
                columns={relationColumns}
                isLoading={false}
                emptyLabel="Không có quan hệ FK."
                manualFiltering
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                globalFilterPlaceholder="Tìm theo bảng hoặc cột…"
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                showIndexColumn
                showColumnFilters={false}
                footer={
                  <p className="text-xs text-muted-foreground">
                    Mỗi dòng là một quan hệ ManyToOne / OneToOne giữa hai
                    entity. Sơ đồ trực quan: menu{" "}
                    <code className="rounded bg-muted px-1">
                      /database-schema
                    </code>
                    .
                  </p>
                }
              />
            </TabsContent>
          </Tabs>
        ) : null}
      </FieldSetContent>
    </FieldSet>
    </>
  )
}
