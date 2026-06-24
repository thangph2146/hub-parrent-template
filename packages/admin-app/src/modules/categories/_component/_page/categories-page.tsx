"use client"

import { useEffect, useMemo, useState } from "react"

import type {

  ColumnDef,

  ColumnFiltersState,

  RowSelectionState,

} from "@tanstack/react-table"

import { useQueryClient } from "@tanstack/react-query"



import { Tabs, TabsContent } from "@ui/components/tabs"

import { AlertCircle, Tags, Plus } from "lucide-react"

import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"

import { useAdminAuth as useAuth, useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"

import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

import { AdminPageGuard,

  AdminPageSection,

  AdminListPageHeader,

  AdminReadOnlyHint,

  AdminPageHeaderPrimaryButton,

  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"

import { useAdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"

import {

  CategoriesTable,

  CategoriesTrashTable,

} from "../_table"

import { getCategoryColumns } from "../_table/columns"

import {

  buildCategoryOptionTree,

  buildCategoryTree,

  buildCategoriesFilterQuery,

} from "../shared/utils"

import {

  useColumnFiltersChange,

  useClearListFilters,

  useClearTrashFilters,

} from "../_hooks"

import {

  useCategoriesQuery,

  useTrashQuery,

  useCategoriesOptionsQuery,

  prefetchCategoryDetail,

} from "../_query"

import type { CategoryRow } from "../shared/types"



import { useAdminMutation } from "@ui/hooks/use-admin-mutation"

import { defaultBulkOperationToast } from "@ui/lib/admin-operation-toast"

export function CategoriesPageInner() {

  const api = useAdminApi()

  const queryClient = useQueryClient()

  const crudNav = useAdminModuleNavigation("categories", {

    prefetchDetail: (id) => prefetchCategoryDetail(queryClient, api, id),

  })

  const { user } = useAuth()

  const canWriteCategories = user

    ? canUserAccess(user, PERMISSION_CODES.CATEGORIES_MANAGE) ||

      canUserAccess(user, PERMISSION_CODES.CATEGORIES_CREATE) ||

      canUserAccess(user, PERMISSION_CODES.CATEGORIES_UPDATE)

    : false

  const canDeleteCategories = user

    ? canUserAccess(user, PERMISSION_CODES.CATEGORIES_MANAGE) ||

      canUserAccess(user, PERMISSION_CODES.CATEGORIES_DELETE)

    : false

  const canRestoreCategories = user

    ? canUserAccess(user, PERMISSION_CODES.CATEGORIES_MANAGE) ||

      canUserAccess(user, PERMISSION_CODES.CATEGORIES_RESTORE)

    : false

  const canHardDeleteCategories = user

    ? canUserAccess(user, PERMISSION_CODES.CATEGORIES_MANAGE) ||

      canUserAccess(user, PERMISSION_CODES.CATEGORIES_HARD_DELETE)

    : false



  const invalidateAll = async () => {

    await queryClient.invalidateQueries({ queryKey: ["categories"] })

  }



  const [mainTab, setMainTab] = useState<"list" | "trash">("list")

  const [globalFilter, setGlobalFilter] = useState("")

  const [trashGlobalFilter, setTrashGlobalFilter] = useState("")

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [trashColumnFilters, setTrashColumnFilters] =

    useState<ColumnFiltersState>([])

  const [listCategorySelection, setListCategorySelection] =

    useState<RowSelectionState>({})

  const [trashCategorySelection, setTrashCategorySelection] =

    useState<RowSelectionState>({})



  const debouncedQ = useDebouncedValue(globalFilter, 300)

  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 300)



  const listColumnFilterQuery = useMemo(

    () => buildCategoriesFilterQuery(columnFilters),

    [columnFilters]

  )



  const trashColumnFilterQuery = useMemo(

    () => buildCategoriesFilterQuery(trashColumnFilters),

    [trashColumnFilters]

  )



  const categoriesQuery = useCategoriesQuery({

    api,

    debouncedQ,

    columnFilterQuery: listColumnFilterQuery,

  })



  const trashQuery = useTrashQuery({

    api,

    debouncedTrashQ,

    trashColumnFilterQuery,

    enabled: mainTab === "trash",

  })



  const categoriesOptionsQuery = useCategoriesOptionsQuery(api)



  const categoryTreeOptions = useMemo(

    () => buildCategoryOptionTree(categoriesOptionsQuery.data ?? []),

    [categoriesOptionsQuery.data]

  )



  const deleteMutation = useAdminMutation({

    mutationKey: ["categories", "delete"],

    mutationFn: async (id: string) => api.categories.remove(id),

    onSuccess: async () => {

      await invalidateAll()

    },

  })



  const restoreMutation = useAdminMutation({

    mutationKey: ["categories", "restore"],

    mutationFn: async (id: string) => api.categories.restore(id),

    onSuccess: async () => {

      await invalidateAll()

    },

  })



  const purgeMutation = useAdminMutation({

    mutationKey: ["categories", "purge"],

    mutationFn: async (id: string) => api.categories.purgeTrashed(id),

    onSuccess: async () => {

      await invalidateAll()

    },

  })



  const bulkMutation = useAdminMutation({

    toast: defaultBulkOperationToast,

    mutationFn: async (input: {

      action: "delete" | "restore" | "hard-delete"

      ids: string[]

    }) => api.categories.bulk(input),

    onSuccess: async () => {

      await invalidateAll()

    },

  })



  useEffect(() => {

    setListCategorySelection({})

    setTrashCategorySelection({})

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

  const rowActions = useAdminCrudRowHandlers<CategoryRow>({

    getRecordLabel: (row) => row.name,

    entityLabel: "danh mục",

    deleteMutation,

    restoreMutation,

    purgeMutation,

  })

  const columns = useMemo<ColumnDef<CategoryRow>[]>(

    () =>

      getCategoryColumns({

        view: "list",

        openDetail: (row) => crudNav.view(String(row.id)),

        openEdit: (row) => crudNav.edit(String(row.id)),

        rowActions,

        categoryTreeOptions,

        canWriteCategories,

        canDeleteCategories,

        canHardDeleteCategories,

      }),

    [

      rowActions,

      crudNav,

      categoryTreeOptions,

      canWriteCategories,

      canDeleteCategories,

      canHardDeleteCategories,

    ]

  )



  const trashColumns = useMemo<ColumnDef<CategoryRow>[]>(

    () =>

      getCategoryColumns({

        view: "trash",

        openDetail: (row) => crudNav.view(String(row.id)),

        openEdit: (row) => crudNav.edit(String(row.id)),

        rowActions,

        categoryTreeOptions,

        canWriteCategories,

        canRestoreCategories,

        canHardDeleteCategories,

      }),

    [

      rowActions,

      crudNav,

      categoryTreeOptions,

      canWriteCategories,

      canRestoreCategories,

      canHardDeleteCategories,

    ]

  )



  return (

    <AdminPageSection>

      <AdminListPageHeader

        title="Danh mục dùng chung"

        subtitle="Quản lý danh mục dùng chung để gắn cho bài viết, thẻ và các nội dung

            truyền thông"

        icon={Tags}

        readOnlyHint={

          user && !canWriteCategories ? (

            <AdminReadOnlyHint>

              Chỉ xem: cần quyền{" "}

              <span className="font-mono">categories.write</span> để

              thêm/sửa/xoá.

            </AdminReadOnlyHint>

          ) : undefined

        }

        actions={

          <>

            {canWriteCategories && (

              <AdminPageHeaderPrimaryButton

                type="button"

                onClick={() => crudNav.new()}

              >

                <Plus className="size-5" aria-hidden /> Thêm danh mục

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

            <AdminTabCountBadge count={categoriesQuery.data?.total ?? 0} />

          </AdminListTabsTrigger>

          {canWriteCategories ? (

            <AdminListTabsTrigger

              value="trash"

              

            >

              Thùng rác

              <AdminTabCountBadge count={trashQuery.data?.total ?? 0} />

            </AdminListTabsTrigger>

          ) : null}

        </AdminListTabsList>



        <TabsContent value="list" className="mt-0 space-y-4">

          {categoriesQuery.error ? (

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">

              <div className="flex items-start gap-3">

                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />

                <div>

                  <p className="font-semibold">Không tải được danh mục</p>

                  <p className="mt-1 text-sm opacity-90">

                    {categoriesQuery.error.message}

                  </p>

                </div>

              </div>

            </div>

          ) : null}



          <CategoriesTable

            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}

            data={buildCategoryTree(categoriesQuery.data?.items ?? [])}

            columns={columns}

            isLoading={categoriesQuery.isLoading}

            columnFilters={columnFilters}

            onColumnFiltersChange={handleColumnFiltersChange}

            globalFilter={globalFilter}

            onGlobalFilterChange={setGlobalFilter}

            selectedRowIds={listCategorySelection}

            onSelectedRowIdsChange={setListCategorySelection}

            total={categoriesQuery.data?.total ?? 0}

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

            canSelectRow={(row) => {

              const childCount = row.original._count?.children ?? 0

              const linkedPosts = row.original.postCount ?? 0

              return !(childCount > 0 || linkedPosts > 0)

            }}

          />

        </TabsContent>



        {canWriteCategories ? (

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

              <CategoriesTrashTable

                data={buildCategoryTree(trashQuery.data?.items ?? [])}

                columns={trashColumns}

                isLoading={trashQuery.isLoading}

                columnFilters={trashColumnFilters}

                onColumnFiltersChange={handleTrashColumnFiltersChange}

                globalFilter={trashGlobalFilter}

                onGlobalFilterChange={setTrashGlobalFilter}

                selectedRowIds={trashCategorySelection}

                onSelectedRowIdsChange={setTrashCategorySelection}

                total={trashQuery.data?.total ?? 0}

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

                trashExportParams={{

                  search: debouncedTrashQ.trim() || undefined,

                  filters: trashColumnFilterQuery,

                }}

              />

            )}

          </TabsContent>

        ) : null}

      </Tabs>

    </AdminPageSection>

  )

}



export default function CategoriesPage() {

  return (

    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>

      <CategoriesPageInner />

    </AdminPageGuard>

  )

}

