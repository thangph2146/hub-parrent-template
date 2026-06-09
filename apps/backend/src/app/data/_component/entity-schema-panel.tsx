"use client"

import { useMemo, useState } from "react"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import { Badge } from "@ui/components/badge"
import { AdminDataTable } from "@ui/components/data-table"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
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

        {!loading && !error && schema ? (
          <Tabs
            value={schemaTab}
            onValueChange={(v) => setSchemaTab(v as "tables" | "relations")}
          >
            <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
              <TabsTrigger
                value="tables"
                className={ADMIN_LIST_TABS_TRIGGER_CLASS}
              >
                <TableProperties className="size-4" />
                Bảng ({entityRows.length})
              </TabsTrigger>
              <TabsTrigger
                value="relations"
                className={ADMIN_LIST_TABS_TRIGGER_CLASS}
              >
                <GitBranch className="size-4" />
                Quan hệ FK ({relationRows.length})
              </TabsTrigger>
            </TabsList>

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
