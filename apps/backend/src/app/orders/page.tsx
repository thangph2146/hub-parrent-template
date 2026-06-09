"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { AdminDataTable } from "@ui/components/data-table"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { api } from "@/lib/api"
import {
  getOrderColumns,
  ORDER_STATUS_LABELS,
  prefetchOrderDetail,
  useOrderStatusCountsQuery,
  useOrdersListQuery,
  type OrderRow,
} from "./_component"
import type { OrderStatus } from "@workspace/api-client"

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
  const crudNav = useAdminCrudNavigation("/orders", {
    prefetchDetail: (id) => prefetchOrderDetail(queryClient, api, id),
  })
  const [status, setStatus] = useState<OrderStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [globalFilter, setGlobalFilter] = useState("")
  const debouncedSearch = useDebouncedValue(globalFilter, 300)

  const countsQuery = useOrderStatusCountsQuery(api)
  const listQuery = useOrdersListQuery(api, {
    page,
    limit: pageSize,
    status,
    search: debouncedSearch.trim() || undefined,
  })

  const columns = useMemo(
    () => getOrderColumns({ openDetail: (row) => crudNav.view(row.id) }),
    [crudNav]
  )

  useEffect(() => {
    setPage(1)
  }, [status, debouncedSearch, pageSize])

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
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] tabular-nums"
              >
                {countFor(tab.value) ?? "—"}
              </Badge>
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
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              onClearFilters={() => setGlobalFilter("")}
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
