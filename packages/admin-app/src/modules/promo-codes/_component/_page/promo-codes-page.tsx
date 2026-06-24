"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Ticket } from "lucide-react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"
import { toast } from "@ui/components/sonner"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
} from "@ui/components/admin"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@workspace/admin-app/lib/build-admin-filter-query"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import { useAdminApi, useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

import { useAdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { buildPromoBulkActions, buildPromoBulkActiveActionMap } from "../_table/promo-bulk-actions"
import { getPromoColumns } from "../_table/columns"
import { PromoBulkActiveMenu } from "../_table/promo-bulk-active-menu"
import { prefetchPromoDetail, usePromoListQuery, PromoRow } from "../_query/use-promo-queries"

export function PromoCodesPageInner() {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.PROMO_CODES_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.PROMO_CODES_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.PROMO_CODES_CREATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.PROMO_CODES_DELETE) ||
      canUserAccess(user, PERMISSION_CODES.PROMO_CODES_MANAGE)
    : false

  const crudNav = useAdminModuleNavigation("promo-codes", {
    prefetchDetail: (id) => prefetchPromoDetail(queryClient, api, id),
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({})
  const debouncedQ = useDebouncedValue(globalFilter, 300)
  const debouncedColumnFilters = useDebouncedValue(columnFilters, 300)

  const listFilterParams = useMemo(
    () =>
      buildAdminFilterQuery(
        debouncedColumnFilters,
        COMMON_FILTER_MAPPINGS.promoCodes
      ),
    [debouncedColumnFilters]
  )

  const listQuery = usePromoListQuery(api, {
    page,
    limit: pageSize,
    q: debouncedQ.trim() || undefined,
    filters: listFilterParams,
  })

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["promo-codes"] }),
    [queryClient]
  )

  const deleteMutation = useAdminMutation({
    mutationFn: (id: string) => api.promoCodes.remove(Number(id)),
    onSuccess: invalidate,
  })

  const toggleMutation = useAdminMutation({
    mutationFn: async (row: PromoRow) => {
      await api.promoCodes.update(Number(row.id), { isActive: !row.isActive })
    },
    onSuccess: invalidate,
  })

  const rowActions = useAdminCrudRowHandlers<PromoRow>({
    getRecordLabel: (row) => row.code,
    entityLabel: "mã KM",
    deleteMutation,
  })

  const handleToggleActive = useCallback(
    async (row: PromoRow) => {
      await toggleMutation.mutateAsync(row)
    },
    [toggleMutation]
  )

  const handleBulkSetActive = useCallback(
    async (rows: PromoRow[], active: boolean) => {
      const targets = rows.filter((row) => row.isActive !== active)
      if (!targets.length) {
        toast.message(
          active ? "Các mã đã chọn đang bật" : "Các mã đã chọn đang tắt"
        )
        return
      }
      await Promise.all(
        targets.map((row) =>
          api.promoCodes.update(Number(row.id), { isActive: active })
        )
      )
      await invalidate()
      toast.success(
        active ? `Đã bật ${targets.length} mã` : `Đã tắt ${targets.length} mã`
      )
    },
    [invalidate, api.promoCodes]
  )

  const handleBulkDelete = useCallback(
    async (rows: PromoRow[]) => {
      await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row.id)))
      toast.success(`Đã xóa ${rows.length} mã KM`)
    },
    [deleteMutation]
  )

  const bulkActiveActions = useMemo(
    () => buildPromoBulkActiveActionMap({ onBulkSetActive: handleBulkSetActive }),
    [handleBulkSetActive]
  )

  const bulkActions = useMemo(
    () => buildPromoBulkActions({ canDelete, onBulkDelete: handleBulkDelete }),
    [canDelete, handleBulkDelete]
  )

  const hasBulkToolbar = canWrite || canDelete

  useEffect(() => {
    setPage(1)
    setSelectedRowIds({})
  }, [debouncedQ, debouncedColumnFilters, pageSize])

  const columns = useMemo<ColumnDef<PromoRow>[]>(
    () =>
      getPromoColumns({
        openDetail: (row) => crudNav.view(row.id),
        openEdit: (row) => crudNav.edit(row.id),
        rowActions,
        onToggleActive: handleToggleActive,
        canWrite,
        canDelete,
      }),
    [canDelete, canWrite, crudNav, handleToggleActive, rowActions]
  )

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Mã khuyến mãi"
        subtitle="Checkout gửi couponCode — server tính discountAmount."
        icon={Ticket}
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton
              type="button"
              onClick={() => crudNav.new()}
            >
              <Plus className="size-5" aria-hidden /> Thêm mã
            </AdminPageHeaderPrimaryButton>
          ) : undefined
        }
      />
      <AdminDataTable<PromoRow>
        tableScope="promo-codes"
        data={listQuery.data?.items ?? []}
        getRowId={(row) => row.id}
        columns={columns}
        isLoading={listQuery.isLoading}
        emptyLabel="Chưa có mã KM."
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
          ? adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)
          : {})}
        bulkActions={bulkActions}
        renderBulkToolbarExtra={
          canWrite
            ? ({ runBulkAction, runningBulkActionId }) => (
                <PromoBulkActiveMenu
                  disabled={runningBulkActionId != null}
                  onActivate={() =>
                    runBulkAction(bulkActiveActions.activate)
                  }
                  onDeactivate={() =>
                    runBulkAction(bulkActiveActions.deactivate)
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
    </AdminPageSection>
  )
}

export default function PromoCodesPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <PromoCodesPageInner />
    </AdminPageGuard>
  )
}
