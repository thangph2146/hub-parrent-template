"use client"

import { useMemo, useState } from "react"
import { AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import { Badge } from "@ui/components/badge"
import { AdminDataTable } from "@ui/components/data-table"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { GitBranch, Loader2, TableProperties } from "lucide-react"
import { getEntityRelationColumns, getEntitySchemaColumns } from "./columns"
import { useDatabaseSchema } from "./_hooks"
import {
  buildEntityRelationRows,
  buildEntitySchemaRows,
  formatEntityRowCount,
} from "./utils"

export function EntitySchemaPanel() {
  const { schema, loading, error } = useDatabaseSchema(true)
  const [schemaTab, setSchemaTab] = useState<"tables" | "relations">("tables")
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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

  return (
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
                      (sum, t) =>
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
            <AlertDescription className="text-xs">{error}</AlertDescription>
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
            <AdminListTabsList>
              <AdminListTabsTrigger
                value="tables"
                
              >
                <TableProperties className="size-4" />
                Bảng ({entityRows.length})
              </AdminListTabsTrigger>
              <AdminListTabsTrigger
                value="relations"
                
              >
                <GitBranch className="size-4" />
                Quan hệ FK ({relationRows.length})
              </AdminListTabsTrigger>
            </AdminListTabsList>

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
  )
}
