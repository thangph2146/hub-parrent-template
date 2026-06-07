"use client"

import { useEffect, useMemo, useState } from "react"
import type { ColumnDef, ColumnFiltersState, RowSelectionState } from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Plus } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { AdminPageHeaderPrimaryButton } from "@ui/components/admin"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { api } from "@/lib/api"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib"
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  getSeoMetaColumns,
  SeoMetasTable,
  useSeoMetasListQuery,
  useSeoMetasTrashQuery,
  prefetchSeoMetaDetail,
} from "@/app/seo-metas/_component"
import type { SeoMetaRow } from "@/app/seo-metas/_component"
import { useAdminMutation, defaultBulkOperationToast } from "@/hooks/use-admin-mutation"
import { SITE_SEO_PAGE_KEY } from "./constants"
import { SettingsSeoPagesQuickPresets } from "./settings-seo-pages-quick-presets"
import { buildSettingsSeoPagesTree } from "./settings-seo-pages-tree"
import type { SeoMetaTreeRow } from "./settings-seo-pages-tree"
import { getSettingsSeoPagesTreeColumns } from "./settings-seo-pages-tree-columns"
import { SettingsSeoPagesTreeTable } from "./settings-seo-pages-tree-table"

export function SettingsSeoPagesSection({
  canWrite,
  canDelete,
  canRestore,
  canHardDelete,
  readOnlyHint,
}: {
  canWrite: boolean
  canDelete: boolean
  canRestore: boolean
  canHardDelete: boolean
  readOnlyHint?: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const crudNav = useAdminCrudNavigation("/seo-metas", {
    prefetchDetail: (id) => prefetchSeoMetaDetail(queryClient, api, id),
  })

  const [mainTab, setMainTab] = useState<"list" | "trash">("list")
  const [globalFilter, setGlobalFilter] = useState("")
  const [trashPage, setTrashPage] = useState(1)
  const [trashPageSize] = useState(15)
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [trashColumnFilters, setTrashColumnFilters] =
    useState<ColumnFiltersState>([])
  const [listSelection, setListSelection] = useState<RowSelectionState>({})
  const [trashSelection, setTrashSelection] = useState<RowSelectionState>({})

  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 350)

  const listFilterParams = useMemo(
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.seoMetas),
    [columnFilters],
  )
  const trashFilterParams = useMemo(
    () =>
      buildAdminFilterQuery(trashColumnFilters, COMMON_FILTER_MAPPINGS.seoMetas),
    [trashColumnFilters],
  )

  const listQuery = useSeoMetasListQuery(api, true, listFilterParams)
  const pageRows = useMemo(
    () =>
      (listQuery.data ?? []).filter((row) => row.page !== SITE_SEO_PAGE_KEY),
    [listQuery.data],
  )
  const treeData = useMemo(
    () => buildSettingsSeoPagesTree(pageRows),
    [pageRows],
  )

  const trashQuery = useSeoMetasTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    enabled: mainTab === "trash" && canWrite,
    filters: trashFilterParams,
  })

  const invalidateAll = async () => {
    await queryClient.refetchQueries({ queryKey: ["seo-metas"] })
  }

  const deleteMutation = useAdminMutation({
    mutationKey: ["seo-metas", "delete"],
    mutationFn: async (id: string) => api.seoMetas.remove(id),
    onSuccess: invalidateAll,
  })
  const restoreMutation = useAdminMutation({
    mutationKey: ["seo-metas", "restore"],
    mutationFn: async (id: string) => api.seoMetas.restore(id),
    onSuccess: invalidateAll,
  })
  const purgeMutation = useAdminMutation({
    mutationKey: ["seo-metas", "purge"],
    mutationFn: async (id: string) => api.seoMetas.purge(id),
    onSuccess: invalidateAll,
  })
  const bulkMutation = useAdminMutation({
    toast: defaultBulkOperationToast,
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete"
      ids: string[]
    }) => api.seoMetas.bulk(input),
    onSuccess: invalidateAll,
  })

  useEffect(() => {
    setTrashPage(1)
  }, [trashColumnFilters, debouncedTrashQ, trashPageSize])
  useEffect(() => {
    setListSelection({})
    setTrashSelection({})
  }, [mainTab])

  const rowActions = useAdminCrudRowHandlers<SeoMetaRow>({
    getRecordLabel: (row) => row.page,
    entityLabel: "SEO metadata",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  })

  const treeColumns = useMemo<ColumnDef<SeoMetaTreeRow>[]>(
    () =>
      getSettingsSeoPagesTreeColumns({
        view: "list",
        openDetail: (row) => crudNav.view(String(row.id)),
        openEdit: (row) => crudNav.edit(String(row.id)),
        rowActions,
        canWrite,
        canDelete,
        canHardDelete,
      }),
    [rowActions, crudNav, canWrite, canDelete, canHardDelete],
  )

  const trashColumns = useMemo<ColumnDef<SeoMetaRow>[]>(
    () =>
      getSeoMetaColumns({
        view: "trash",
        rowActions,
        canWrite,
        canRestore,
        canHardDelete,
      }),
    [rowActions, canWrite, canRestore, canHardDelete],
  )

  return (
    <div className="space-y-4">
      {canWrite ? (
        <SettingsSeoPagesQuickPresets
          disabled={bulkMutation.isPending}
          onApplied={invalidateAll}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Quản lý title, mô tả và Open Graph cho từng đường dẫn trang công
            khai.
          </p>
          {readOnlyHint}
        </div>
        {canWrite ? (
          <AdminPageHeaderPrimaryButton
            type="button"
            onClick={() => crudNav.new()}
          >
            <Plus className="size-5" aria-hidden />
            Thêm SEO trang
          </AdminPageHeaderPrimaryButton>
        ) : null}
      </div>

      <Tabs
        value={mainTab}
        onValueChange={(v) => {
          if (v === "list" || v === "trash") setMainTab(v)
        }}
        className="space-y-4"
      >
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="list" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            Danh sách
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] tabular-nums"
            >
              {pageRows.length}
            </Badge>
          </TabsTrigger>
          {canWrite ? (
            <TabsTrigger value="trash" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
              Thùng rác
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] tabular-nums"
              >
                {trashQuery.data?.total ?? 0}
              </Badge>
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-4">
          {listQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold">Không tải được danh sách</p>
                  <p className="mt-1 text-sm opacity-90">
                    {listQuery.error.message}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <SettingsSeoPagesTreeTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            data={treeData}
            columns={treeColumns}
            isLoading={listQuery.isLoading}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listSelection}
            onSelectedRowIdsChange={setListSelection}
            leafTotal={pageRows.length}
            onClearFilters={() => {
              setColumnFilters([])
              setGlobalFilter("")
            }}
            onBulkDelete={
              canDelete
                ? async (rows) => {
                    const ids = rows.map((r) => r.id)
                    if (!ids.length) return
                    await bulkMutation.mutateAsync({ action: "delete", ids })
                  }
                : undefined
            }
            onBulkPurge={
              canHardDelete
                ? async (rows) => {
                    const ids = rows.map((r) => r.id)
                    if (!ids.length) return
                    await bulkMutation.mutateAsync({
                      action: "hard-delete",
                      ids,
                    })
                  }
                : undefined
            }
          />
        </TabsContent>

        {canWrite ? (
          <TabsContent value="trash" className="mt-0 space-y-4">
            <SeoMetasTable
              data={trashQuery.data?.items ?? []}
              columns={trashColumns}
              isLoading={trashQuery.isLoading}
              columnFilters={trashColumnFilters}
              onColumnFiltersChange={setTrashColumnFilters}
              globalFilter={trashGlobalFilter}
              onGlobalFilterChange={setTrashGlobalFilter}
              selectedRowIds={trashSelection}
              onSelectedRowIdsChange={setTrashSelection}
              total={trashQuery.data?.total ?? 0}
              onClearFilters={() => {
                setTrashColumnFilters([])
                setTrashGlobalFilter("")
              }}
              onBulkRestore={
                canRestore
                  ? async (rows) => {
                      const ids = rows.map((r) => r.id)
                      if (!ids.length) return
                      await bulkMutation.mutateAsync({ action: "restore", ids })
                    }
                  : undefined
              }
              onBulkPurge={
                canHardDelete
                  ? async (rows) => {
                      const ids = rows.map((r) => r.id)
                      if (!ids.length) return
                      await bulkMutation.mutateAsync({
                        action: "hard-delete",
                        ids,
                      })
                    }
                  : undefined
              }
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
