"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { AlertCircle, FileText, Plus } from "lucide-react"
import { useAdminAuth as useAuth, useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { useAdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import {
  PostsTable,
  PostsTrashTable,
} from "../_table"
import { getPostColumns } from "../_table/columns"
import { buildCategoryOptionTree, buildPostsFilterQuery } from "../shared/utils"
import {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
} from "../_hooks"
import {
  usePostsQuery,
  useTrashQuery,
  useCategoriesQuery,
  useTagsQuery,
  useDeleteMutation,
  useRestoreMutation,
  usePurgeMutation,
  useBulkMutation,
  prefetchPostDetail,
} from "../_query"
import type { PostListRow } from "../shared/types"
export function PostsPageInner() {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const crudNav = useAdminModuleNavigation("posts", {
    prefetchDetail: (id) => prefetchPostDetail(queryClient, api, id),
  })
  const { user } = useAuth()
  const canCreate = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_CREATE)
    : false
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_UPDATE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_DELETE)
    : false
  const canRestore = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_RESTORE)
    : false
  const canExport = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_EXPORT)
    : false

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "posts"] })
  }

  const [mainTab, setMainTab] = useState<"list" | "trash">("list")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState("")
  const [trashPage, setTrashPage] = useState(1)
  const [trashPageSize, setTrashPageSize] = useState(10)
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [trashColumnFilters, setTrashColumnFilters] =
    useState<ColumnFiltersState>([])
  const [listPostSelection, setListPostSelection] = useState<RowSelectionState>(
    {}
  )
  const [trashPostSelection, setTrashPostSelection] =
    useState<RowSelectionState>({})
  const debouncedQ = useDebouncedValue(globalFilter, 300)
  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 300)

  const postColumnFilterQuery = useMemo(
    () => buildPostsFilterQuery(columnFilters),
    [columnFilters]
  )

  const trashColumnFilterQuery = useMemo(
    () => buildPostsFilterQuery(trashColumnFilters),
    [trashColumnFilters]
  )

  const postsQuery = usePostsQuery({
    api,
    page,
    pageSize,
    debouncedQ,
    postColumnFilterQuery,
  })

  const trashQuery = useTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    trashColumnFilterQuery,
    enabled: mainTab === "trash",
  })

  const categoriesQuery = useCategoriesQuery(api)
  const tagsQuery = useTagsQuery(api)

  const deleteMutation = useDeleteMutation({ api, invalidateAll })
  const restoreMutation = useRestoreMutation({ api, invalidateAll })
  const purgeMutation = usePurgeMutation({ api, invalidateAll })
  const bulkMutation = useBulkMutation({ api, invalidateAll })

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  )

  useEffect(() => {
    setPage(1)
  }, [columnFilters, debouncedQ, pageSize])

  useEffect(() => {
    setTrashPage(1)
  }, [trashColumnFilters, debouncedTrashQ, trashPageSize])

  useEffect(() => {
    setListPostSelection({})
    setTrashPostSelection({})
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

  const navigateToView = useCallback(
    (id: string) => crudNav.view(String(id)),
    [crudNav]
  )

  const navigateToEdit = useCallback(
    (id: string) => crudNav.edit(String(id)),
    [crudNav]
  )

  const rowActions = useAdminCrudRowHandlers<PostListRow>({
    getRecordLabel: (row) => row.title,
    entityLabel: "bài viết",
    deleteMutation: canDelete ? deleteMutation : undefined,
    restoreMutation: canRestore ? restoreMutation : undefined,
    purgeMutation: canDelete ? purgeMutation : undefined,
  })

  const columns = useMemo<ColumnDef<PostListRow>[]>(
    () =>
      getPostColumns({
        view: "list",
        navigateToEdit,
        navigateToView,
        rowActions,
        categoryTreeOptions,
        tagsOptions: tagsQuery.data ?? [],
        canUpdate,
        canDelete,
      }),
    [
      navigateToEdit,
      navigateToView,
      rowActions,
      tagsQuery.data,
      categoryTreeOptions,
      canUpdate,
      canDelete,
    ]
  )

  const trashColumns = useMemo<ColumnDef<PostListRow>[]>(
    () =>
      getPostColumns({
        view: "trash",
        navigateToEdit,
        navigateToView,
        rowActions,
        categoryTreeOptions,
        tagsOptions: tagsQuery.data ?? [],
        canUpdate,
        canDelete,
        canRestore,
      }),
    [
      navigateToEdit,
      navigateToView,
      rowActions,
      categoryTreeOptions,
      tagsQuery.data,
      canUpdate,
      canDelete,
      canRestore,
    ]
  )

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Bài viết"
        subtitle="Quản lý bài viết truyền thông, gắn danh mục và thẻ dùng chung"
        icon={FileText}
        actions={
          <>
            {canCreate && (
              <AdminPageHeaderPrimaryButton onClick={() => crudNav.new()}>
                <Plus className="size-5" aria-hidden />
                Thêm bài viết
              </AdminPageHeaderPrimaryButton>
            )}
          </>
        }
      />

      <Tabs
        value={mainTab}
        onValueChange={(v) =>
          v === "list" || v === "trash" ? setMainTab(v) : null
        }
      >
        <AdminListTabsList>
          <AdminListTabsTrigger value="list" >
            Danh sách
            <AdminTabCountBadge count={postsQuery.data?.total ?? 0} />
          </AdminListTabsTrigger>
          {canRestore && (
            <AdminListTabsTrigger
              value="trash"
              
            >
              Thùng rác
              <AdminTabCountBadge count={trashQuery.data?.total ?? 0} />
            </AdminListTabsTrigger>
          )}
        </AdminListTabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {postsQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Không tải được bài viết</p>
                  <p className="mt-1 text-sm opacity-90">
                    {postsQuery.error.message}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <PostsTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            data={postsQuery.data?.items ?? []}
            columns={columns}
            isLoading={postsQuery.isLoading}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listPostSelection}
            onSelectedRowIdsChange={setListPostSelection}
            page={page}
            pageSize={pageSize}
            total={postsQuery.data?.total ?? 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onClearFilters={clearListFilters}
            onBulkDelete={async (rows) => {
              const ids = rows.map((r) => String(r.id))
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "delete", ids })
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => String(r.id))
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "hard-delete", ids })
            }}
            canExport={canExport}
            canDelete={canDelete}
            listQuery={{
              search: debouncedQ.trim() || undefined,
              filters: postColumnFilterQuery,
            }}
          />
        </TabsContent>

        <TabsContent value="trash" className="mt-4 space-y-4">
          <PostsTrashTable
            data={trashQuery.data?.items ?? []}
            columns={trashColumns}
            isLoading={trashQuery.isLoading}
            columnFilters={trashColumnFilters}
            onColumnFiltersChange={handleTrashColumnFiltersChange}
            globalFilter={trashGlobalFilter}
            onGlobalFilterChange={setTrashGlobalFilter}
            selectedRowIds={trashPostSelection}
            onSelectedRowIdsChange={setTrashPostSelection}
            page={trashPage}
            pageSize={trashPageSize}
            total={trashQuery.data?.total ?? 0}
            onPageChange={setTrashPage}
            onPageSizeChange={setTrashPageSize}
            onClearFilters={clearTrashFilters}
            onBulkRestore={async (rows) => {
              const ids = rows.map((r) => String(r.id))
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "restore", ids })
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => String(r.id))
              if (!ids.length) return
              await bulkMutation.mutateAsync({ action: "hard-delete", ids })
            }}
            canExport={canExport}
            canRestore={canRestore}
            canDelete={canDelete}
            listQuery={{
              search: debouncedTrashQ.trim() || undefined,
              filters: trashColumnFilterQuery,
            }}
          />
        </TabsContent>
      </Tabs>
    </AdminPageSection>
  )
}

export default function PostsPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.POSTS_VIEW}>
      <PostsPageInner />
    </AdminPageGuard>
  )
}
