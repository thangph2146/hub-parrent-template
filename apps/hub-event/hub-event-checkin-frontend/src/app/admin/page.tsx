"use client"

import { useEffect, useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { CHECKIN_ADMIN_INDEX_PATH } from "@/config/admin/checkin-admin-access"
import { AlertCircle, Calendar, Plus } from "lucide-react"
import { useDebouncedValue } from "@/hooks/admin/use-debounced-value"
import { useAuth } from "@/providers/admin/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
  AdminPageHeaderPrimaryButton,
  AdminTabCountBadge,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib/admin"
import { useAdminCrudRowHandlers } from "@/lib/admin/admin-row-action-handlers"
import {
  EventsTable,
  EventsTrashTable,
  getEventColumns,
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  useEventsListQuery,
  useEventsTrashQuery,
  prefetchEventDetail,
} from "@/components/admin/events"
import type { EventRow } from "@/components/admin/events"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { defaultBulkOperationToast } from "@ui/lib/admin-operation-toast"
function EventsPageInner() {
  const queryClient = useQueryClient()
  const crudNav = useAdminCrudNavigation(CHECKIN_ADMIN_INDEX_PATH as `/${string}`, {
    prefetchDetail: (id) => prefetchEventDetail(queryClient, api, id),
  })
  const { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.EVENTS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.EVENTS_UPDATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.EVENTS_DELETE)
    : false
  const canRestore = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.EVENTS_RESTORE)
    : false
  const canHardDelete = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_MANAGE)
    : false

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["events"] })
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
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.events),
    [columnFilters]
  )

  const trashFilterParams = useMemo(
    () =>
      buildAdminFilterQuery(trashColumnFilters, COMMON_FILTER_MAPPINGS.events),
    [trashColumnFilters]
  )

  const listQuery = useEventsListQuery(api, canWrite || true, listFilterParams)
  const trashQuery = useEventsTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  })

  const deleteMutation = useAdminMutation({
    mutationKey: ["events", "delete"],
    mutationFn: async (id: string) => api.events.remove(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })
  const restoreMutation = useAdminMutation({
    mutationKey: ["events", "restore"],
    mutationFn: async (id: string) => api.events.restore(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })
  const purgeMutation = useAdminMutation({
    mutationKey: ["events", "purge"],
    mutationFn: async (id: string) => api.events.purge(id),
    onSuccess: async () => {
      await invalidateAll()
    },
  })
  const bulkMutation = useAdminMutation({
    toast: defaultBulkOperationToast,
    mutationFn: async (input: { action: string; ids: string[] }) =>
      api.events.bulk(input),
    onSuccess: async () => {
      await invalidateAll()
    },
  })
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null
  )
  const featuredMutation = useAdminMutation({
    toast: {
      loading: "Đang cập nhật nổi bật…",
      success: (_data, variables) =>
        variables.isFeatured
          ? "Đã đánh dấu sự kiện nổi bật"
          : "Đã bỏ đánh dấu nổi bật",
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật nổi bật",
    },
    mutationFn: async ({
      id,
      isFeatured,
    }: {
      id: string
      isFeatured: boolean
    }) => api.events.update(id, { isFeatured }),
    onSuccess: async () => {
      await invalidateAll()
    },
    onSettled: () => setTogglingFeaturedId(null),
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

  const rowActions = useAdminCrudRowHandlers<EventRow>({
    getRecordLabel: (row) => row.title,
    entityLabel: "sự kiện",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  })

  const columns = useMemo<ColumnDef<EventRow>[]>(
    () =>
      getEventColumns({
        view: "list",
        openDetail: (row) => crudNav.view(String(row.id)),
        openEdit: (row) => crudNav.edit(String(row.id)),
        rowActions,
        canWrite,
        canDelete,
        canHardDelete,
        isTogglingFeaturedId: togglingFeaturedId,
        onToggleFeatured: canWrite
          ? (row) => {
              setTogglingFeaturedId(row.id)
              void featuredMutation.mutate({
                id: row.id,
                isFeatured: !row.isFeatured,
              })
            }
          : undefined,
      }),
    [
      rowActions,
      crudNav,
      canWrite,
      canDelete,
      canHardDelete,
      togglingFeaturedId,
      featuredMutation,
    ]
  )

  const trashColumns = useMemo<ColumnDef<EventRow>[]>(
    () =>
      getEventColumns({
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
        icon={Calendar}
        title="Sự kiện"
        subtitle="Quản lý sự kiện check-in."
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton onClick={() => crudNav.new()}>
              <Plus className="size-5" aria-hidden /> Thêm sự kiện
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
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="list" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            Danh sách
            <AdminTabCountBadge count={listQuery.data?.length ?? 0} />
          </TabsTrigger>
          {canWrite && (
            <TabsTrigger
              value="trash"
              className={ADMIN_LIST_TABS_TRIGGER_CLASS}
            >
              Thùng rác
              <AdminTabCountBadge count={trashQuery.data?.total ?? 0} />
            </TabsTrigger>
          )}
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

          <EventsTable
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
            onBulkDelete={async (rows: EventRow[]) => {
              const ids = rows.map((r: EventRow) => r.id)
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "delete", ids })
            }}
            onBulkPurge={async (rows: EventRow[]) => {
              const ids = rows.map((r: EventRow) => r.id)
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
              <EventsTrashTable
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
                onBulkRestore={async (rows: EventRow[]) => {
                  const ids = rows.map((r: EventRow) => r.id)
                  if (!ids.length) return
                  await bulkMutation.mutateAsync({ action: "restore", ids })
                }}
                onBulkPurge={async (rows: EventRow[]) => {
                  const ids = rows.map((r: EventRow) => r.id)
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

export default function EventsPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.EVENTS_VIEW}>
      <EventsPageInner />
    </AdminPageGuard>
  )
}
