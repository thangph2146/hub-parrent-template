"use client"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"

import type {
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Headset } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { AdminListPageHeader, AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  prefetchContactRequestDetail,
  useContactRequests,
} from "@/hooks/queries"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { useAuth } from "@/providers/auth-provider"
import {
  buildAdminFilterQuery,
  COMMON_FILTER_MAPPINGS,
} from "@/lib/build-admin-filter-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  ContactRequestTable,
  ContactRequestTrashTable,
  ContactConfirmDialog,
  ContactBulkConfirmDialog,
} from "./_component"
import type { ContactRequest } from "./_component/types"
import {
  useDeleteContactRequest,
  useRestoreContactRequest,
  usePurgeContactRequest,
  useBulkDeleteContactRequest,
  useBulkRestoreContactRequest,
  useBulkPurgeContactRequest,
  useUpdateContactRequest,
} from "./_component/_query/use-contact-queries"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"

function ContactRequestsPageInner() {
  const { user } = useAuth();
  const canDelete = user ? canUserAccess(user, PERMISSION_CODES.CONTACT_REQUESTS_DELETE) : false;
  const canRestore = user ? canUserAccess(user, PERMISSION_CODES.CONTACT_REQUESTS_RESTORE) : false;
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.CONTACT_REQUESTS_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.CONTACT_REQUESTS_MANAGE)
    : false;
  const queryClient = useQueryClient()
  const crudNav = useAdminCrudNavigation("/contact-requests", {
    prefetchDetail: (id) => prefetchContactRequestDetail(queryClient, id),
  })

  const [tab, setTab] = useState<"list" | "trash">("list")
  const [listSelection, setListSelection] = useState<RowSelectionState>({})
  const [trashSelection, setTrashSelection] = useState<RowSelectionState>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [trashPage, setTrashPage] = useState(1)
  const [trashPageSize, setTrashPageSize] = useState(20)

  const [globalFilter, setGlobalFilter] = useState("")
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 250)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [trashColumnFilters, setTrashColumnFilters] =
    useState<ColumnFiltersState>([])

  const [restoreTarget, setRestoreTarget] = useState<ContactRequest | null>(
    null
  )
  const [purgeTarget, setPurgeTarget] = useState<ContactRequest | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(
    null
  )
  const [bulkRestoreTarget, setBulkRestoreTarget] = useState<string[] | null>(
    null
  )
  const [bulkPurgeTarget, setBulkPurgeTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteContactRequest()
  const restoreMutation = useRestoreContactRequest()
  const purgeMutation = usePurgeContactRequest()
  const updateMutation = useUpdateContactRequest()
  const bulkDeleteMutation = useBulkDeleteContactRequest()
  const bulkRestoreMutation = useBulkRestoreContactRequest()
  const bulkPurgeMutation = useBulkPurgeContactRequest()

  useEffect(() => {
    setPage(1)
  }, [columnFilters, debouncedGlobalFilter, pageSize])

  useEffect(() => {
    setTrashPage(1)
  }, [tab, trashColumnFilters, trashPageSize])

  useEffect(() => {
    setListSelection({})
    setTrashSelection({})
  }, [tab])

  const listParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedGlobalFilter.trim() || undefined,
      filters: buildAdminFilterQuery(
        columnFilters,
        COMMON_FILTER_MAPPINGS.contactRequests
      ),
    }),
    [columnFilters, debouncedGlobalFilter, page, pageSize]
  )

  const trashParams = useMemo(
    () => ({
      page: trashPage,
      limit: trashPageSize,
      search: debouncedGlobalFilter.trim() || undefined,
      trash: true,
      filters: buildAdminFilterQuery(
        trashColumnFilters,
        COMMON_FILTER_MAPPINGS.contactRequests
      ),
    }),
    [debouncedGlobalFilter, trashColumnFilters, trashPage, trashPageSize]
  )

  const activeQuery = useContactRequests({
    enabled: tab === "list",
    params: listParams,
  })

  const trashQuery = useContactRequests({
    enabled: tab === "trash",
    params: trashParams,
  })

  const activeItems = useMemo(
    () => activeQuery.data?.items ?? [],
    [activeQuery.data?.items]
  )
  const activeTotal = activeQuery.data?.total ?? 0
  const trashItems = useMemo(
    () => trashQuery.data?.items ?? [],
    [trashQuery.data?.items]
  )
  const trashTotal = trashQuery.data?.total ?? 0

  const handleView = useCallback(
    (contact: ContactRequest) => {
      crudNav.view(String(contact.id))
    },
    [crudNav]
  )

  const handleDelete = useCallback(
    async (contact: ContactRequest) => {
      await deleteMutation.mutateAsync(contact.id)
    },
    [deleteMutation],
  )

  const handleRestore = useCallback((contact: ContactRequest) => {
    setRestoreTarget(contact)
  }, [])

  const handlePurge = useCallback((contact: ContactRequest) => {
    setPurgeTarget(contact)
  }, [])

  const handleStatusChange = useCallback(
    (contact: ContactRequest, status: ContactRequest["status"]) => {
      updateMutation.mutate({ id: contact.id, input: { status } })
    },
    [updateMutation],
  )

  const handleSetRead = useCallback(
    (contact: ContactRequest, isRead: boolean) => {
      updateMutation.mutate({ id: contact.id, input: { isRead } })
    },
    [updateMutation],
  )

  const handleSetPriority = useCallback(
    (
      contact: ContactRequest,
      priority: NonNullable<ContactRequest["priority"]>,
    ) => {
      updateMutation.mutate({ id: contact.id, input: { priority } })
    },
    [updateMutation],
  )

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    setBulkDeleteTarget(ids)
  }, [])

  const handleBulkRestore = useCallback(async (ids: string[]) => {
    setBulkRestoreTarget(ids)
  }, [])

  const handleBulkPurge = useCallback(async (ids: string[]) => {
    setBulkPurgeTarget(ids)
  }, [])

  const handleConfirmBulkDelete = useCallback(async () => {
    if (bulkDeleteTarget) {
      await bulkDeleteMutation.mutateAsync(bulkDeleteTarget)
      setBulkDeleteTarget(null)
      setListSelection({})
    }
  }, [bulkDeleteTarget, bulkDeleteMutation])

  const handleConfirmBulkRestore = useCallback(async () => {
    if (bulkRestoreTarget) {
      await bulkRestoreMutation.mutateAsync(bulkRestoreTarget)
      setBulkRestoreTarget(null)
      setTrashSelection({})
    }
  }, [bulkRestoreTarget, bulkRestoreMutation])

  const handleConfirmBulkPurge = useCallback(async () => {
    if (bulkPurgeTarget) {
      await bulkPurgeMutation.mutateAsync(bulkPurgeTarget)
      setBulkPurgeTarget(null)
      setTrashSelection({})
    }
  }, [bulkPurgeTarget, bulkPurgeMutation])

  const handleClearListFilters = useCallback(() => {
    setGlobalFilter("")
    setColumnFilters([])
  }, [])

  const handleClearTrashFilters = useCallback(() => {
    setGlobalFilter("")
    setTrashColumnFilters([])
  }, [])

  const busy =
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    purgeMutation.isPending ||
    updateMutation.isPending ||
    bulkDeleteMutation.isPending ||
    bulkRestoreMutation.isPending ||
    bulkPurgeMutation.isPending

  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={Headset}
        title="Yêu cầu liên hệ"
        subtitle="Quản lý các yêu cầu liên hệ từ người dùng"
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "list" | "trash")}>
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="list" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            Đang hoạt động
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {activeTotal}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="trash" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            Thùng rác
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {trashTotal}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <ContactRequestTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            data={activeItems}
            isLoading={activeQuery.isLoading}
            total={activeTotal}
            page={page}
            pageSize={pageSize}
            appliedPage={activeQuery.data?.page}
            appliedPageSize={activeQuery.data?.limit}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listSelection}
            onSelectedRowIdsChange={setListSelection}
            onView={handleView}
            onDelete={handleDelete}
            onPurge={handlePurge}
            onStatusChange={handleStatusChange}
            onSetRead={handleSetRead}
            onSetPriority={handleSetPriority}
            busy={busy}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onBulkDelete={handleBulkDelete}
            onBulkPurge={handleBulkPurge}
            onClearFilters={handleClearListFilters}
            listParams={{
              search: debouncedGlobalFilter.trim() || undefined,
              filters: buildAdminFilterQuery(
                columnFilters,
                COMMON_FILTER_MAPPINGS.contactRequests,
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="trash" className="mt-0">
          <ContactRequestTrashTable
            data={trashItems}
            isLoading={trashQuery.isLoading}
            total={trashTotal}
            page={trashPage}
            pageSize={trashPageSize}
            appliedPage={trashQuery.data?.page}
            appliedPageSize={trashQuery.data?.limit}
            onPageChange={setTrashPage}
            onPageSizeChange={setTrashPageSize}
            columnFilters={trashColumnFilters}
            onColumnFiltersChange={setTrashColumnFilters}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={trashSelection}
            onSelectedRowIdsChange={setTrashSelection}
            onRestore={handleRestore}
            onPurge={handlePurge}
            busy={busy}
            canRestore={canRestore}
            canDelete={canDelete}
            onBulkRestore={handleBulkRestore}
            onBulkPurge={handleBulkPurge}
            onClearFilters={handleClearTrashFilters}
            listParams={{
              search: trashParams.search,
              filters: trashParams.filters,
            }}
          />
        </TabsContent>
      </Tabs>

      <ContactConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        action="restore"
        target={restoreTarget}
        onConfirm={async () => {
          if (restoreTarget) {
            await restoreMutation.mutateAsync(restoreTarget.id)
            setRestoreTarget(null)
          }
        }}
        loading={restoreMutation.isPending}
      />

      <ContactConfirmDialog
        open={!!purgeTarget}
        onOpenChange={(open) => !open && setPurgeTarget(null)}
        action="purge"
        target={purgeTarget}
        onConfirm={async () => {
          if (purgeTarget) {
            await purgeMutation.mutateAsync(purgeTarget.id)
            setPurgeTarget(null)
          }
        }}
        loading={purgeMutation.isPending}
      />

      <ContactBulkConfirmDialog
        open={!!bulkDeleteTarget}
        onOpenChange={(open) => !open && setBulkDeleteTarget(null)}
        action="delete"
        count={bulkDeleteTarget?.length ?? 0}
        onConfirm={handleConfirmBulkDelete}
        loading={bulkDeleteMutation.isPending}
      />

      <ContactBulkConfirmDialog
        open={!!bulkRestoreTarget}
        onOpenChange={(open) => !open && setBulkRestoreTarget(null)}
        action="restore"
        count={bulkRestoreTarget?.length ?? 0}
        onConfirm={handleConfirmBulkRestore}
        loading={bulkRestoreMutation.isPending}
      />

      <ContactBulkConfirmDialog
        open={!!bulkPurgeTarget}
        onOpenChange={(open) => !open && setBulkPurgeTarget(null)}
        action="purge"
        count={bulkPurgeTarget?.length ?? 0}
        onConfirm={handleConfirmBulkPurge}
        loading={bulkPurgeMutation.isPending}
      />
    </AdminPageSection>
  )
}

export default function ContactRequestsPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <ContactRequestsPageInner />
    </AdminPageGuard>
  )
}
