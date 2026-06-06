"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import {
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
} from "@ui/components/admin";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { PostsTable, PostsTrashTable } from "./_component/_table";
import {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
} from "./_component/_hooks";
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import {
  usePostsQuery,
  useTrashQuery,
  useCategoriesQuery,
  useTagsQuery,
  useDeleteMutation,
  useRestoreMutation,
  usePurgeMutation,
  useBulkMutation,
} from "./_component/_query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell";
import type { PostListRow } from "./_component";
import {
  buildCategoryOptionTree,
  buildPostsFilterQuery,
  getPostColumns,
} from "./_component";
function PostsPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCreate = user ? canUserAccess(user, PERMISSION_CODES.POSTS_CREATE) : false;
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.POSTS_UPDATE) : false;
  const canDelete = user ? canUserAccess(user, PERMISSION_CODES.POSTS_DELETE) : false;
  const canRestore = user ? canUserAccess(user, PERMISSION_CODES.POSTS_RESTORE) : false;
  const canExport = user ? canUserAccess(user, PERMISSION_CODES.POSTS_EXPORT) : false;

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "posts"] });
  };

  const [mainTab, setMainTab] = useState<"list" | "trash">("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [trashPage, setTrashPage] = useState(1);
  const [trashPageSize, setTrashPageSize] = useState(10);
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [trashColumnFilters, setTrashColumnFilters] = useState<ColumnFiltersState>([]);
  const [listPostSelection, setListPostSelection] = useState<RowSelectionState>({});
  const [trashPostSelection, setTrashPostSelection] = useState<RowSelectionState>({});
  const debouncedQ = useDebouncedValue(globalFilter, 300);
  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 300);

  const postColumnFilterQuery = useMemo(
    () => buildPostsFilterQuery(columnFilters),
    [columnFilters],
  );

  const trashColumnFilterQuery = useMemo(
    () => buildPostsFilterQuery(trashColumnFilters),
    [trashColumnFilters],
  );

  const postsQuery = usePostsQuery({
    api,
    page,
    pageSize,
    debouncedQ,
    postColumnFilterQuery,
  });

  const trashQuery = useTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    trashColumnFilterQuery,
    enabled: mainTab === "trash",
  });

  const categoriesQuery = useCategoriesQuery(api);
  const tagsQuery = useTagsQuery(api);

  const deleteMutation = useDeleteMutation({ api, invalidateAll });
  const restoreMutation = useRestoreMutation({ api, invalidateAll });
  const purgeMutation = usePurgeMutation({ api, invalidateAll });
  const bulkMutation = useBulkMutation({ api, invalidateAll });

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  useEffect(() => {
    setPage(1);
  }, [columnFilters, debouncedQ, pageSize]);

  useEffect(() => {
    setTrashPage(1);
  }, [trashColumnFilters, debouncedTrashQ, trashPageSize]);

  useEffect(() => {
    setListPostSelection({});
    setTrashPostSelection({});
  }, [mainTab]);

  const handleColumnFiltersChange = useColumnFiltersChange(setColumnFilters);
  const clearListFilters = useClearListFilters(setColumnFilters, setGlobalFilter);
  const clearTrashFilters = useClearTrashFilters(setTrashGlobalFilter, setTrashColumnFilters);
  const handleTrashColumnFiltersChange = useColumnFiltersChange(setTrashColumnFilters);

  const navigateToView = useCallback(
    (id: string) => router.push(`/posts/${id}`),
    [router],
  );

  const navigateToEdit = useCallback(
    (id: string) => router.push(`/posts/${id}/edit`),
    [router],
  );

  const rowActions = useAdminCrudRowHandlers<PostListRow>({
    getRecordLabel: (row) => row.title,
    entityLabel: "bài viết",
    deleteMutation: canDelete ? deleteMutation : undefined,
    restoreMutation: canRestore ? restoreMutation : undefined,
    purgeMutation: canDelete ? purgeMutation : undefined,
  });

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
    [navigateToEdit, navigateToView, rowActions, tagsQuery.data, categoryTreeOptions, canUpdate, canDelete],
  );

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
    [navigateToEdit, navigateToView, rowActions, categoryTreeOptions, tagsQuery.data, canUpdate, canDelete, canRestore],
  );

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Bài viết"
        subtitle="Quản lý bài viết truyền thông, gắn danh mục và thẻ dùng chung"
        icon={FileText}
        actions={
          <>
            {canCreate && (
              <AdminPageHeaderPrimaryButton
                onClick={() => router.push("/posts/new")}
              >
                <Plus className="size-5" aria-hidden />
                Thêm bài viết
              </AdminPageHeaderPrimaryButton>
            )}
          </>
        }
      />

      <Tabs value={mainTab} onValueChange={(v) => v === "list" || v === "trash" ? setMainTab(v) : null}>
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="list" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            Danh sách
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {postsQuery.data?.total ?? 0}
            </Badge>
          </TabsTrigger>
          {canRestore && (
            <TabsTrigger value="trash" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
              Thùng rác
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
                {trashQuery.data?.total ?? 0}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {postsQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Không tải được bài viết</p>
                  <p className="mt-1 text-sm opacity-90">{postsQuery.error.message}</p>
                </div>
              </div>
            </div>
          ) : null}

          <PostsTable
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
              const ids = rows.map((r) => String(r.id));
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "delete", ids });
              toast.success(`Đã đưa ${ids.length} bài viết vào thùng rác`);
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => String(r.id));
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "hard-delete", ids });
              toast.success(`Đã xóa vĩnh viễn ${ids.length} bài viết`);
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
              const ids = rows.map((r) => String(r.id));
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "restore", ids });
              toast.success(`Đã khôi phục ${ids.length} bài viết`);
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => String(r.id));
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "hard-delete", ids });
              toast.success(`Đã xóa vĩnh viễn ${ids.length} bài viết`);
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
  );
}

export default function PostsPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.POSTS_VIEW}>
      <PostsPageInner />
    </AdminPageGuard>
  );
}
