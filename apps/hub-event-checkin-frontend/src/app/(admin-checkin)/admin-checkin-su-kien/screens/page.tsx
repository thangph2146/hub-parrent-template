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
import { AlertCircle, Monitor, Plus } from "lucide-react"
import { useDebouncedValue } from "@/hooks/admin/use-debounced-value"
import { useAuth } from "@/providers/admin/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminListPageHeader,
  AdminPageHeaderPrimaryButton,
  AdminTabCountBadge,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib/admin"
import { useAdminCrudRowHandlers } from "@/lib/admin/admin-row-action-handlers"
import {
  ScreensTable,
  ScreensTrashTable,
  getScreenColumns,
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  useScreensListQuery,
  useScreensTrashQuery,
  prefetchScreenDetail,
} from "./_component"
import type { ScreenRow } from "./_component"

import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
function ScreensPageInner() {
  const queryClient = useQueryClient()
  const crudNav = useAdminCrudNavigation(`/screens`, {
      prefetchDetail: (id) => prefetchScreenDetail(queryClient, api, id),
    }),
    { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.SCREENS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SCREENS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.SCREENS_UPDATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.SCREENS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SCREENS_DELETE)
    : false
  const canRestore = user
    ? canUserAccess(user, PERMISSION_CODES.SCREENS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SCREENS_RESTORE)
    : false
  const canHardDelete = user
    ? canUserAccess(user, PERMISSION_CODES.SCREENS_MANAGE)
    : false
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["screens"] })
  }
  const [mainTab, setMainTab] = useState<"list" | "trash">("list")
  const [gF, setGF] = useState("")
  const [tP, setTP] = useState(1)
  const [tPS, setTPS] = useState(15)
  const [tGF, setTGF] = useState("")
  const [cF, setCF] = useState<ColumnFiltersState>([])
  const [tCF, setTCF] = useState<ColumnFiltersState>([])
  const [lS, setLS] = useState<RowSelectionState>({})
  const [tS, setTS] = useState<RowSelectionState>({})
  const dQ = useDebouncedValue(tGF, 350)
  const listFilterParams = useMemo(
    () => buildAdminFilterQuery(cF, COMMON_FILTER_MAPPINGS.screens),
    [cF]
  )
  const trashFilterParams = useMemo(
    () => buildAdminFilterQuery(tCF, COMMON_FILTER_MAPPINGS.screens),
    [tCF]
  )
  const listQ = useScreensListQuery(api, canWrite || true, listFilterParams)
  const trashQ = useScreensTrashQuery({
    api: api,
    trashPage: tP,
    trashPageSize: tPS,
    debouncedTrashQ: dQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  })
  const delM = useAdminMutation({
    mutationFn: (id: string) => api.screens.remove(id),
    onSuccess: invalidateAll,
  })
  const resM = useAdminMutation({
    mutationFn: (id: string) => api.screens.restore(id),
    onSuccess: invalidateAll,
  })
  const purM = useAdminMutation({
    mutationFn: (id: string) => api.screens.purge(id),
    onSuccess: invalidateAll,
  })
  const bulM = useAdminMutation({
    mutationFn: (i: { action: string; ids: string[] }) => api.screens.bulk(i),
    onSuccess: invalidateAll,
  })
  useEffect(() => {
    setTP(1)
  }, [tCF, dQ, tPS])
  useEffect(() => {
    setLS({})
    setTS({})
  }, [mainTab])
  const hCFC = useColumnFiltersChange(setCF)
  const cLF = useClearListFilters(setCF, setGF)
  const cTF = useClearTrashFilters(setTGF, setTCF)
  const hTCFC = useColumnFiltersChange(setTCF)
  const rowActions = useAdminCrudRowHandlers<ScreenRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "màn hình",
    deleteMutation: delM,
    restoreMutation: resM,
    purgeMutation: purM,
  })
  const cols = useMemo<ColumnDef<ScreenRow>[]>(
    () =>
      getScreenColumns({
        view: "list",
        openDetail: (r) => crudNav.view(String(r.id)),
        openEdit: (r) => crudNav.edit(String(r.id)),
        rowActions,
        canWrite,
        canDelete,
        canHardDelete,
      }),
    [rowActions, crudNav, canWrite, canDelete, canHardDelete]
  )
  const tCols = useMemo<ColumnDef<ScreenRow>[]>(
    () =>
      getScreenColumns({
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
        icon={Monitor}
        title="Màn hình"
        subtitle="Quản lý màn hình."
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton onClick={() => crudNav.new()}>
              <Plus className="size-5" /> Thêm màn hình
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
            <AdminTabCountBadge count={listQ.data?.length ?? 0} />
          </TabsTrigger>
          {canWrite && (
            <TabsTrigger
              value="trash"
              className={ADMIN_LIST_TABS_TRIGGER_CLASS}
            >
              Thùng rác
              <AdminTabCountBadge count={trashQ.data?.total ?? 0} />
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="list" className="mt-0 space-y-4">
          {listQ.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Lỗi</p>
                  <p className="mt-1 text-sm opacity-90">
                    {listQ.error.message}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <ScreensTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            data={listQ.data ?? []}
            columns={cols}
            isLoading={listQ.isLoading}
            columnFilters={cF}
            onColumnFiltersChange={hCFC}
            globalFilter={gF}
            onGlobalFilterChange={setGF}
            selectedRowIds={lS}
            onSelectedRowIdsChange={setLS}
            total={listQ.data?.length ?? 0}
            onClearFilters={cLF}
            onBulkDelete={async (rows) => {
              const ids = rows.map((r) => r.id)
              if (!ids.length) return
              await bulM.mutateAsync({ action: "delete", ids })
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => r.id)
              if (!ids.length) return
              await bulM.mutateAsync({ action: "hard-delete", ids })
            }}
          />
        </TabsContent>
        {canWrite && (
          <TabsContent value="trash" className="mt-0 space-y-4">
            {trashQ.error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Lỗi</p>
                  </div>
                </div>
              </div>
            ) : (
              <ScreensTrashTable
                data={trashQ.data?.items ?? []}
                columns={tCols}
                isLoading={trashQ.isLoading}
                columnFilters={tCF}
                onColumnFiltersChange={hTCFC}
                globalFilter={tGF}
                onGlobalFilterChange={setTGF}
                selectedRowIds={tS}
                onSelectedRowIdsChange={setTS}
                page={tP}
                pageSize={tPS}
                total={trashQ.data?.total ?? 0}
                onPageChange={setTP}
                onPageSizeChange={setTPS}
                onClearFilters={cTF}
                onBulkRestore={async (rows) => {
                  const ids = rows.map((r) => r.id)
                  if (!ids.length) return
                  await bulM.mutateAsync({ action: "restore", ids })
                }}
                onBulkPurge={async (rows) => {
                  const ids = rows.map((r) => r.id)
                  if (!ids.length) return
                  await bulM.mutateAsync({ action: "hard-delete", ids })
                }}
                trashExportParams={{
                  search: dQ.trim() || undefined,
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
export default function ScreensPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <ScreensPageInner />
    </AdminPageGuard>
  )
}
