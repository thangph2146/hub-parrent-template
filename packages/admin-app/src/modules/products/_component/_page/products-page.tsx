"use client"

import { useEffect, useMemo, useState } from "react"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import { Package, Plus, AlertCircle } from "lucide-react"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
  AdminReadOnlyHint,
  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import { useAdminApi, useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

import { useAdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { getProductColumns } from "../_table/columns"
import { ProductsTable } from "../_table/products-table"
import { prefetchProductDetail, useProductsListQuery, useProductsTrashQuery, ProductRow } from "../_query/use-products-queries"

export function ProductsPageInner() {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const crudNav = useAdminModuleNavigation("products", {
    prefetchDetail: (id) => prefetchProductDetail(queryClient, api, id),
  })
  const { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.PRODUCTS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.PRODUCTS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.PRODUCTS_UPDATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.PRODUCTS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.PRODUCTS_DELETE)
    : false
  const canRestore = canWrite

  const [mainTab, setMainTab] = useState<"list" | "trash">("list")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [trashPage, setTrashPage] = useState(1)
  const [trashPageSize, setTrashPageSize] = useState(15)
  const [globalFilter, setGlobalFilter] = useState("")
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("")
  const [listSelection, setListSelection] = useState<RowSelectionState>({})
  const debouncedQ = useDebouncedValue(globalFilter, 300)
  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 300)

  const listQuery = useProductsListQuery(api, {
    page,
    limit: pageSize,
    q: debouncedQ.trim() || undefined,
    status: "active",
    enabled: mainTab === "list",
  })

  const trashQuery = useProductsTrashQuery(api, {
    page: trashPage,
    limit: trashPageSize,
    q: debouncedTrashQ.trim() || undefined,
    enabled: mainTab === "trash",
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["products"] })

  const deleteMutation = useAdminMutation({
    mutationFn: (id: string) => api.products.remove(Number(id)),
    onSuccess: invalidate,
  })
  const restoreMutation = useAdminMutation({
    mutationFn: (id: string) => api.products.restore(Number(id)),
    onSuccess: invalidate,
  })

  const rowActions = useAdminCrudRowHandlers<ProductRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "sản phẩm",
    deleteMutation,
    restoreMutation,
  })

  const columns = useMemo<ColumnDef<ProductRow>[]>(
    () =>
      getProductColumns({
        view: "list",
        openDetail: (row) => crudNav.view(row.id),
        openEdit: (row) => crudNav.edit(row.id),
        rowActions,
        canWrite,
        canDelete,
      }),
    [crudNav, rowActions, canWrite, canDelete]
  )

  const trashColumns = useMemo<ColumnDef<ProductRow>[]>(
    () =>
      getProductColumns({
        view: "trash",
        rowActions,
        canWrite,
        canRestore,
      }),
    [rowActions, canWrite, canRestore]
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, pageSize])
  useEffect(() => {
    setTrashPage(1)
  }, [debouncedTrashQ, trashPageSize])

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Sản phẩm"
        subtitle="Catalog storefront — ảnh đơn hàng được snapshot khi checkout."
        icon={Package}
        readOnlyHint={
          user && !canWrite ? (
            <AdminReadOnlyHint>
              Chỉ xem — cần quyền{" "}
              <span className="font-mono">products:manage</span>.
            </AdminReadOnlyHint>
          ) : undefined
        }
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton
              type="button"
              onClick={() => crudNav.new()}
            >
              <Plus className="size-5" aria-hidden /> Thêm sản phẩm
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
            <AdminTabCountBadge count={listQuery.data?.total ?? 0} />
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

        <TabsContent value="list" className="mt-0">
          {listQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <AlertCircle className="mb-2 size-5" />
              {listQuery.error.message}
            </div>
          ) : (
            <ProductsTable
              data={listQuery.data?.items ?? []}
              columns={columns}
              isLoading={listQuery.isLoading}
              total={listQuery.data?.total ?? 0}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              selectedRowIds={listSelection}
              onSelectedRowIdsChange={setListSelection}
              onClearFilters={() => setGlobalFilter("")}
              onRowPrefetch={(row) => crudNav.prefetch(row.id)}
              onBulkDelete={
                canDelete
                  ? async (rows) => {
                      for (const row of rows) {
                        await deleteMutation.mutateAsync(row.id)
                      }
                    }
                  : undefined
              }
            />
          )}
        </TabsContent>

        {canWrite && (
          <TabsContent value="trash" className="mt-0">
            <ProductsTable
              data={trashQuery.data?.items ?? []}
              columns={trashColumns}
              isLoading={trashQuery.isLoading}
              total={trashQuery.data?.total ?? 0}
              page={trashPage}
              pageSize={trashPageSize}
              onPageChange={setTrashPage}
              onPageSizeChange={setTrashPageSize}
              globalFilter={trashGlobalFilter}
              onGlobalFilterChange={setTrashGlobalFilter}
              selectedRowIds={listSelection}
              onSelectedRowIdsChange={setListSelection}
              onClearFilters={() => setTrashGlobalFilter("")}
            />
          </TabsContent>
        )}
      </Tabs>
    </AdminPageSection>
  )
}

export default function ProductsPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <ProductsPageInner />
    </AdminPageGuard>
  )
}
