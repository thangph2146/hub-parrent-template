"use client"

import { useEffect, useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"

import { Tabs, TabsContent } from "@ui/components/tabs"
import { AlertCircle, GraduationCap, Plus } from "lucide-react"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import { useAdminApi,useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { AdminPageGuard,
  AdminPageSection,
  AdminListPageHeader,
  AdminReadOnlyHint,
  AdminPageHeaderPrimaryButton,
  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@workspace/admin-app/lib"
import { useAdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import { MajorsTable, MajorsTrashTable } from "../_table"
import { getMajorColumns } from "../_table/columns"
import { useColumnFiltersChange, useClearListFilters, useClearTrashFilters } from "../_hooks"
import { useMajorsListQuery, useMajorsTrashQuery, prefetchMajorDetail } from "../_query"
import type { MajorRow } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { defaultBulkOperationToast } from "@ui/lib/admin-operation-toast"
export function MajorsPageInner() {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const crudNav = useAdminModuleNavigation("majors", {
    prefetchDetail: (id) => prefetchMajorDetail(queryClient, api, id),
  })
  const { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.MAJORS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.MAJORS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.MAJORS_UPDATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.MAJORS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.MAJORS_DELETE)
    : false
  const canRestore = user
    ? canUserAccess(user, PERMISSION_CODES.MAJORS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.MAJORS_RESTORE)
    : false
  const canHardDelete = user
    ? canUserAccess(user, PERMISSION_CODES.MAJORS_MANAGE)
    : false

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["majors"] })
  }

  const [mainTab, setMainTab] = useState<"list" | "trash">("list")
  const [globalFilter, setGlobalFilter] = useState("")
  const [trashPage, setTrashPage] = useState(1)
  const [trashPageSize, setTrashPageSize] = useState(15)
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [trashColumnFilters, setTrashColumnFilters] =
    useState<ColumnFiltersState>([])
  const [listSelection, setListSelection] = useState<RowSelectionState>({})
  const [trashSelection, setTrashSelection] = useState<RowSelectionState>({})

  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 350)

  const listFilterParams = useMemo(
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.majors),
    [columnFilters]
  )

  const trashFilterParams = useMemo(
    () =>
      buildAdminFilterQuery(trashColumnFilters, COMMON_FILTER_MAPPINGS.majors),
    [trashColumnFilters]
  )

  const listQuery = useMajorsListQuery(api, canWrite || true, listFilterParams)

  const trashQuery = useMajorsTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  })

  const deleteMutation = useAdminMutation({
    mutationKey: ["majors", "delete"],
    mutationFn: async (id: string) => api.majors.remove(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  const restoreMutation = useAdminMutation({
    mutationKey: ["majors", "restore"],
    mutationFn: async (id: string) => api.majors.restore(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  const purgeMutation = useAdminMutation({
    mutationKey: ["majors", "purge"],
    mutationFn: async (id: string) => api.majors.purge(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  const bulkMutation = useAdminMutation({
    toast: defaultBulkOperationToast,
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete"
      ids: string[]
    }) => api.majors.bulk(input),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  useEffect(() => {
    setTrashPage(1)
  }, [trashColumnFilters, debouncedTrashQ, trashPageSize])
  useEffect(() => {
    setListSelection({})
    setTrashSelection({})
  }, [mainTab])

  const handleColumnFiltersChange = useColumnFiltersChange(setColumnFilters)
  const clearListFilters = useClearListFilters(
    setColumnFilters,
    setGlobalFilter
  )
  const clearTrashFilters = useClearTrashFilters(
    setTrashGlobalFilter,
    setTrashColumnFilters
  )
  const handleTrashColumnFiltersChange = useColumnFiltersChange(
    setTrashColumnFilters
  )

  const rowActions = useAdminCrudRowHandlers<MajorRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "ngành học",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  })

  const columns = useMemo<ColumnDef<MajorRow>[]>(
    () =>
      getMajorColumns({
        view: "list",
        openDetail: (row) => crudNav.view(String(row.id)),
        openEdit: (row) => crudNav.edit(String(row.id)),
        rowActions,
        canWrite,
        canDelete,
        canHardDelete,
      }),
    [rowActions, crudNav, canWrite, canDelete, canHardDelete]
  )

  const trashColumns = useMemo<ColumnDef<MajorRow>[]>(
    () =>
      getMajorColumns({
        view: "trash",
        rowActions,
        canWrite,
        canRestore,
        canHardDelete,
      }),
    [rowActions, canWrite, canRestore, canHardDelete]
  )

  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={GraduationCap}
        title="Ngành học"
        subtitle="Quản lý các ngành học trong hệ thống"
        readOnlyHint={
          user && !canWrite ? (
            <AdminReadOnlyHint>
              Chỉ xem: cần quyền{" "}
              <span className="font-mono">majors:manage</span> để thêm/sửa/xoá.
            </AdminReadOnlyHint>
          ) : undefined
        }
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton
              type="button"
              onClick={() => crudNav.new()}
            >
              <Plus className="size-5" aria-hidden /> Thêm ngành học
            </AdminPageHeaderPrimaryButton>
          ) : undefined
        }
      />

      <Tabs
        value={mainTab}
        onValueChange={(v) => {
          if (v === "list" || v === "trash") setMainTab(v)
        }}
        className="space-y-6"
      >
        <AdminListTabsList>
          <AdminListTabsTrigger value="list" >
            Danh sách
            <AdminTabCountBadge count={listQuery.data?.length ?? 0} />
          </AdminListTabsTrigger>
          {canWrite && (
            <AdminListTabsTrigger
              value="trash"
              
            >
              Thùng rác
              <AdminTabCountBadge count={trashQuery.data?.total ?? 0} />
            </AdminListTabsTrigger>
          )}
        </AdminListTabsList>

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

          <MajorsTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            data={listQuery.data ?? []}
            columns={columns}
            isLoading={listQuery.isLoading}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listSelection}
            onSelectedRowIdsChange={setListSelection}
            total={listQuery.data?.length ?? 0}
            onClearFilters={clearListFilters}
            onBulkDelete={async (rows) => {
              const ids = rows.map((r) => r.id)
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "delete", ids })
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => r.id)
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "hard-delete", ids })
            }}
          />
        </TabsContent>

        {canWrite && (
          <TabsContent value="trash" className="mt-0 space-y-4">
            {trashQuery.error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold">Không tải được thùng rác</p>
                    <p className="mt-1 text-sm opacity-90">
                      {trashQuery.error.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <MajorsTrashTable
                data={trashQuery.data?.items ?? []}
                columns={trashColumns}
                isLoading={trashQuery.isLoading}
                columnFilters={trashColumnFilters}
                onColumnFiltersChange={handleTrashColumnFiltersChange}
                globalFilter={trashGlobalFilter}
                onGlobalFilterChange={setTrashGlobalFilter}
                selectedRowIds={trashSelection}
                onSelectedRowIdsChange={setTrashSelection}
                page={trashPage}
                pageSize={trashPageSize}
                total={trashQuery.data?.total ?? 0}
                onPageChange={setTrashPage}
                onPageSizeChange={setTrashPageSize}
                onClearFilters={clearTrashFilters}
                onBulkRestore={async (rows) => {
                  const ids = rows.map((r) => r.id)
                  if (!ids.length) return
                  await bulkMutation.mutateAsync({ action: "restore", ids })
                }}
                onBulkPurge={async (rows) => {
                  const ids = rows.map((r) => r.id)
                  if (!ids.length) return
                  await bulkMutation.mutateAsync({ action: "hard-delete", ids })
                }}
                trashExportParams={{
                  search: debouncedTrashQ.trim() || undefined,
                  filters: trashFilterParams,
                }}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </AdminPageSection>
  )
}

export default function MajorsPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <MajorsPageInner />
    </AdminPageGuard>
  )
}
