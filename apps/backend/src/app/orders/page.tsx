"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColumnFiltersState, RowSelectionState } from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"
import { toast } from "@ui/components/sonner"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
  AdminTabCountBadge,
} from "@ui/components/admin"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib/build-admin-filter-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useAuth } from "@/providers/auth-provider"
import {
  canUserAccess,
  PERMISSION_CODES,
  type OrderStatus,
} from "@workspace/api-client"
import { api } from "@/lib/api"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
import {
  buildOrderBulkActions,
  buildOrderBulkStatusActionMap,
  getOrderColumns,
  OrderBulkStatusMenu,
  ORDER_STATUS_LABELS,
  prefetchOrderDetail,
  useOrderStatusCountsQuery,
  useOrdersListQuery,
  type OrderRow,
} from "./_component"

const STATUS_TABS: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: ORDER_STATUS_LABELS.pending },
  { value: "confirmed", label: ORDER_STATUS_LABELS.confirmed },
  { value: "shipped", label: ORDER_STATUS_LABELS.shipped },
  { value: "delivered", label: ORDER_STATUS_LABELS.delivered },
  { value: "cancelled", label: ORDER_STATUS_LABELS.cancelled },
]

function OrdersPageInner() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.ORDERS_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.ORDERS_MANAGE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.ORDERS_DELETE) ||
      canUserAccess(user, PERMISSION_CODES.ORDERS_MANAGE)
    : false

  const crudNav = useAdminCrudNavigation("/orders", {
    prefetchDetail: (id) => prefetchOrderDetail(queryClient, api, id),
  })
  const [status, setStatus] = useState<OrderStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({})
  const debouncedSearch = useDebouncedValue(globalFilter, 300)
  const debouncedColumnFilters = useDebouncedValue(columnFilters, 300)

  const listFilterParams = useMemo(
    () =>
      buildAdminFilterQuery(
        debouncedColumnFilters,
        COMMON_FILTER_MAPPINGS.orders
      ),
    [debouncedColumnFilters]
  )

  const tabStatus =
    listFilterParams.status != null ? ("all" as const) : status

  const countsQuery = useOrderStatusCountsQuery(api)
  const listQuery = useOrdersListQuery(api, {
    page,
    limit: pageSize,
    status: tabStatus,
    search: debouncedSearch.trim() || undefined,
    filters: listFilterParams,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["orders"] })

  const statusMutation = useAdminMutation({
    mutationFn: ({ id, next }: { id: string; next: OrderStatus }) =>
      api.orders.updateStatus(Number(id), next),
    onSuccess: invalidate,
  })

  const deleteMutation = useAdminMutation({
    mutationFn: (id: string) => api.orders.remove(Number(id)),
    onSuccess: invalidate,
  })

  const handleStatusChange = useCallback(
    async (row: OrderRow, next: OrderStatus) => {
      if (next === row.status) return
      setStatusBusyId(row.id)
      try {
        await statusMutation.mutateAsync({ id: row.id, next })
      } finally {
        setStatusBusyId(null)
      }
    },
    [statusMutation]
  )

  const handleDelete = useCallback(
    async (row: OrderRow) => {
      setStatusBusyId(row.id)
      try {
        await deleteMutation.mutateAsync(row.id)
      } finally {
        setStatusBusyId(null)
      }
    },
    [deleteMutation]
  )

  const handleBulkStatusChange = useCallback(
    async (rows: OrderRow[], next: OrderStatus) => {
      const targets = rows.filter((row) => row.status !== next)
      if (!targets.length) {
        toast.message("Các đơn đã chọn đang ở trạng thái này")
        return
      }
      await Promise.all(
        targets.map((row) =>
          statusMutation.mutateAsync({ id: row.id, next })
        )
      )
      toast.success(`Đã cập nhật ${targets.length} đơn`)
    },
    [statusMutation]
  )

  const handleBulkDelete = useCallback(
    async (rows: OrderRow[]) => {
      await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row.id)))
      toast.success(`Đã xóa ${rows.length} đơn`)
    },
    [deleteMutation]
  )

  const bulkStatusActions = useMemo(
    () => buildOrderBulkStatusActionMap({ onBulkStatusChange: handleBulkStatusChange }),
    [handleBulkStatusChange]
  )

  const bulkActions = useMemo(
    () => buildOrderBulkActions({ canDelete, onBulkDelete: handleBulkDelete }),
    [canDelete, handleBulkDelete]
  )

  const hasBulkToolbar = canUpdate || canDelete

  const columns = useMemo(
    () =>
      getOrderColumns({
        openDetail: (row) => crudNav.view(row.id),
        openEdit: (row) => crudNav.edit(row.id),
        canUpdate,
        canDelete,
        statusBusyId,
        onStatusChange: canUpdate ? handleStatusChange : undefined,
        onDelete: canDelete ? handleDelete : undefined,
      }),
    [
      canDelete,
      canUpdate,
      crudNav,
      handleDelete,
      handleStatusChange,
      statusBusyId,
    ]
  )

  useEffect(() => {
    setPage(1)
    setSelectedRowIds({})
  }, [status, debouncedSearch, debouncedColumnFilters, pageSize])

  const countFor = (key: OrderStatus | "all") => {
    const c = countsQuery.data
    if (!c) return undefined
    if (key === "all") return c.ALL
    return c[key]
  }

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Đơn hàng"
        subtitle="Ảnh từng dòng được snapshot lúc checkout — không phụ thuộc catalog sau này."
        icon={ShoppingCart}
      />

      <Tabs
        value={status}
        onValueChange={(v) => {
          if (STATUS_TABS.some((t) => t.value === v)) {
            setStatus(v as OrderStatus | "all")
          }
        }}
        className="space-y-6"
      >
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={ADMIN_LIST_TABS_TRIGGER_CLASS}
            >
              {tab.label}
              <AdminTabCountBadge count={countFor(tab.value) ?? "—"} />
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status} className="mt-0">
          {listQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <AlertCircle className="mb-2 size-5" />
              {listQuery.error.message}
            </div>
          ) : (
            <AdminDataTable<OrderRow>
              tableScope="orders"
              data={listQuery.data?.items ?? []}
              getRowId={(row) => row.id}
              columns={columns}
              isLoading={listQuery.isLoading}
              emptyLabel="Chưa có đơn hàng."
              manualFiltering
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              onClearFilters={() => {
                setGlobalFilter("")
                setColumnFilters([])
              }}
              {...(hasBulkToolbar
                ? adminTableRowSelectionProps(
                    selectedRowIds,
                    setSelectedRowIds
                  )
                : {})}
              bulkActions={bulkActions}
              renderBulkToolbarExtra={
                canUpdate
                  ? ({ runBulkAction, runningBulkActionId }) => (
                      <OrderBulkStatusMenu
                        disabled={runningBulkActionId != null}
                        onPickStatus={(next) =>
                          runBulkAction(bulkStatusActions[next])
                        }
                      />
                    )
                  : undefined
              }
              pagination={{
                mode: "server",
                page,
                pageSize,
                total: listQuery.data?.total ?? 0,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
              }}
              onRowPointerEnter={(row) => crudNav.prefetch(row.original.id)}
            />
          )}
        </TabsContent>
      </Tabs>
    </AdminPageSection>
  )
}

export default function OrdersPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <OrdersPageInner />
    </AdminPageGuard>
  )
}
