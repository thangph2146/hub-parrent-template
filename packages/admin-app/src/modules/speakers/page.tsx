"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useEffect, useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"

import { Tabs, TabsContent } from "@ui/components/tabs"
import { AlertCircle, User, Plus } from "lucide-react"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

import { AdminPageGuard,
  AdminPageSection,
  AdminListPageHeader,
  AdminReadOnlyHint,
  AdminPageHeaderPrimaryButton,
  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@workspace/admin-app/lib"
import { useAdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import {
  SpeakersTable,
  SpeakersTrashTable,
  getSpeakerColumns,
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  useSpeakersListQuery,
  useSpeakersTrashQuery,
  prefetchSpeakerDetail,
} from "./_component"
import type { SpeakerRow } from "./_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { defaultBulkOperationToast } from "@ui/lib/admin-operation-toast"
function SpeakersPageInner() {
  const queryClient = useQueryClient()
  const crudNav = useAdminModuleNavigation("speakers", {
    prefetchDetail: (id) => prefetchSpeakerDetail(queryClient, api, id),
  })
  const { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.SPEAKERS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SPEAKERS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.SPEAKERS_UPDATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.SPEAKERS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SPEAKERS_DELETE)
    : false
  const canRestore = user
    ? canUserAccess(user, PERMISSION_CODES.SPEAKERS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SPEAKERS_RESTORE)
    : false
  const canHardDelete = user
    ? canUserAccess(user, PERMISSION_CODES.SPEAKERS_MANAGE)
    : false

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["speakers"] })
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
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.speakers),
    [columnFilters]
  )

  const trashFilterParams = useMemo(
    () =>
      buildAdminFilterQuery(
        trashColumnFilters,
        COMMON_FILTER_MAPPINGS.speakers
      ),
    [trashColumnFilters]
  )

  const listQuery = useSpeakersListQuery(
    api,
    canWrite || true,
    listFilterParams
  )

  const trashQuery = useSpeakersTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  })

  const deleteMutation = useAdminMutation({
    mutationKey: ["speakers", "delete"],
    mutationFn: async (id: string) => api.speakers.remove(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  const restoreMutation = useAdminMutation({
    mutationKey: ["speakers", "restore"],
    mutationFn: async (id: string) => api.speakers.restore(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  const purgeMutation = useAdminMutation({
    mutationKey: ["speakers", "purge"],
    mutationFn: async (id: string) => api.speakers.purge(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })

  const bulkMutation = useAdminMutation({
    toast: defaultBulkOperationToast,
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete"
      ids: string[]
    }) => api.speakers.bulk(input),
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

  const rowActions = useAdminCrudRowHandlers<SpeakerRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "diễn giả",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  })

  const columns = useMemo<ColumnDef<SpeakerRow>[]>(
    () =>
      getSpeakerColumns({
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

  const trashColumns = useMemo<ColumnDef<SpeakerRow>[]>(
    () =>
      getSpeakerColumns({
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
        title="Diễn giả"
        subtitle="Quản lý diễn giả trong hệ thống"
        icon={User}
        readOnlyHint={
          user && !canWrite ? (
            <AdminReadOnlyHint>
              Chỉ xem: cần quyền{" "}
              <span className="font-mono">speakers:manage</span> để
              thêm/sửa/xoá.
            </AdminReadOnlyHint>
          ) : undefined
        }
        actions={
          <>
            {canWrite && (
              <AdminPageHeaderPrimaryButton
                type="button"
                onClick={() => crudNav.new()}
              >
                <Plus className="size-5" aria-hidden /> Thêm diễn giả
              </AdminPageHeaderPrimaryButton>
            )}
          </>
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

          <SpeakersTable
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
            manualFiltering
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
              <SpeakersTrashTable
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
                manualFiltering
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

export default function SpeakersPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <SpeakersPageInner />
    </AdminPageGuard>
  )
}
