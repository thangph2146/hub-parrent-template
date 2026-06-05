"use client"
import { useEffect, useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Badge } from "@ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { useRouter } from "next/navigation"
import { AlertCircle, Camera, Plus } from "lucide-react"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useAuth } from "@/providers/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import { AdminPageGuard, AdminPageSection, AdminListPageHeader, AdminPageHeaderPrimaryButton } from "@ui/components/admin"
import { api } from "@/lib/api"
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  CamerasTable,
  CamerasTrashTable,
  getCameraColumns,
  getTrashColumns,
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  useCamerasListQuery,
  useCamerasTrashQuery,
} from "./_component"
import type { CameraRow } from "./_component"

function CamerasPageInner() {
  const router = useRouter(),
    queryClient = useQueryClient(),
    { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.CAMERAS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.CAMERAS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.CAMERAS_UPDATE)
    : false
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cameras"] })
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
  const listFilterParams = useMemo(() => {
    const p: Record<string, string> = {}
    for (const f of cF) {
      if (f.id === "status") {
        p.statusFilter = String(f.value)
      }
    }
    return p
  }, [cF])
  const trashFilterParams = useMemo(() => {
    const p: Record<string, string> = {}
    for (const f of tCF) {
      if (f.id === "deletedAt" && typeof f.value === "string") {
        const [a, b] = f.value.split(",")
        if (a) p.deletedAtFrom = a
        if (b) p.deletedAtTo = b
      }
    }
    return p
  }, [tCF])
  const listQ = useCamerasListQuery(api, canWrite || true, listFilterParams)
  const trashQ = useCamerasTrashQuery({
    api: api,
    trashPage: tP,
    trashPageSize: tPS,
    debouncedTrashQ: dQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  })
  const delM = useMutation({
    mutationFn: (id: string) => api.cameras.remove(id),
    onSuccess: invalidateAll,
  })
  const resM = useMutation({
    mutationFn: (id: string) => api.cameras.restore(id),
    onSuccess: invalidateAll,
  })
  const purM = useMutation({
    mutationFn: (id: string) => api.cameras.purge(id),
    onSuccess: invalidateAll,
  })
  const bulM = useMutation({
    mutationFn: (i: { action: string; ids: string[] }) => api.cameras.bulk(i),
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
  const rowActions = useAdminCrudRowHandlers<CameraRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "camera",
    deleteMutation: delM,
    restoreMutation: resM,
    purgeMutation: purM,
  })
  const cols = useMemo<ColumnDef<CameraRow>[]>(
    () =>
      getCameraColumns({
        openDetail: (r) => router.push(`/cameras/${r.id}`),
        openEdit: (r) => router.push(`/cameras/${r.id}/edit`),
        rowActions,
        canWrite,
      }),
    [rowActions, router, canWrite]
  )
  const tCols = useMemo<ColumnDef<CameraRow>[]>(
    () => getTrashColumns({ rowActions, canWrite }),
    [rowActions, canWrite]
  )
  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={Camera}
        title="Camera"
        subtitle="Quản lý camera."
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton onClick={() => router.push("/cameras/new")}>
              <Plus className="size-5" /> Thêm camera
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
          <TabsTrigger
            value="list"
            className={ADMIN_LIST_TABS_TRIGGER_CLASS}
          >
            Danh sách
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] tabular-nums"
            >
              {listQ.data?.length ?? 0}
            </Badge>
          </TabsTrigger>
          {canWrite && (
            <TabsTrigger
              value="trash"
              className={ADMIN_LIST_TABS_TRIGGER_CLASS}
            >
              Thùng rác
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] tabular-nums"
              >
                {trashQ.data?.total ?? 0}
              </Badge>
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
          <CamerasTable
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
            onBulkDelete={async (rows: CameraRow[]) => {
              const ids = rows.map((r: CameraRow) => r.id)
              if (!ids.length) return
              await bulM.mutateAsync({ action: "delete", ids })
              toast.success(`Đã xóa ${ids.length} camera`)
            }}
            onBulkPurge={async (rows: CameraRow[]) => {
              const ids = rows.map((r: CameraRow) => r.id)
              if (!ids.length) return
              await bulM.mutateAsync({ action: "hard-delete", ids })
              toast.success(`Đã xóa vĩnh viễn ${ids.length} camera`)
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
              <CamerasTrashTable
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
                onBulkRestore={async (rows: CameraRow[]) => {
                  const ids = rows.map((r: CameraRow) => r.id)
                  if (!ids.length) return
                  await bulM.mutateAsync({ action: "restore", ids })
                  toast.success(`Đã khôi phục ${ids.length} camera`)
                }}
                onBulkPurge={async (rows: CameraRow[]) => {
                  const ids = rows.map((r: CameraRow) => r.id)
                  if (!ids.length) return
                  await bulM.mutateAsync({ action: "hard-delete", ids })
                  toast.success(`Đã xóa vĩnh viễn ${ids.length} camera`)
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
export default function CamerasPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <CamerasPageInner />
    </AdminPageGuard>
  )
}
