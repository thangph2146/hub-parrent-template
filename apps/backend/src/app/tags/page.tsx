"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Hash,
  Plus,
} from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuth } from "@/providers/auth-provider";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell";
import { AdminPageGuard, AdminPageSection, AdminListPageHeader, AdminReadOnlyHint, AdminPageHeaderPrimaryButton } from "@ui/components/admin";
import { api } from "@/lib/api";
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import {
  TagsTable,
  TagsTrashTable,
  getTagColumns,
  buildTagTree,
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  useTagsListQuery,
  useTrashQuery,
  buildTagsFilterQuery,
  toFilterQuery,
} from "./_component";
import type { TagRow, TagTreeRow } from "./_component";

function TagsPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWriteTags = user
    ? canUserAccess(user, PERMISSION_CODES.TAGS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.TAGS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.TAGS_UPDATE)
    : false;
  const canDeleteTags = user
    ? canUserAccess(user, PERMISSION_CODES.TAGS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.TAGS_DELETE)
    : false;
  const canRestoreTags = user
    ? canUserAccess(user, PERMISSION_CODES.TAGS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.TAGS_RESTORE)
    : false;
  const canHardDeleteTags = user
    ? canUserAccess(user, PERMISSION_CODES.TAGS_MANAGE)
    : false;

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "tags"] });
  };

  const [mainTab, setMainTab] = useState<"list" | "trash">("list");
  const [globalFilter, setGlobalFilter] = useState("");
  const [trashPage, setTrashPage] = useState(1);
  const [trashPageSize, setTrashPageSize] = useState(15);
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [trashColumnFilters, setTrashColumnFilters] = useState<ColumnFiltersState>([]);
  const [listTagSelection, setListTagSelection] = useState<RowSelectionState>({});
  const [trashTagSelection, setTrashTagSelection] = useState<RowSelectionState>({});

  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 350);

  const listFilterParams = useMemo(
    () => buildTagsFilterQuery(columnFilters),
    [columnFilters]
  );

  const trashFilterParams = useMemo(
    () => buildTagsFilterQuery(trashColumnFilters),
    [trashColumnFilters]
  );

  const trashExportFilterParams = useMemo(
    () => ({
      ...toFilterQuery(buildTagsFilterQuery(trashColumnFilters)),
      ...trashFilterParams,
    }),
    [trashColumnFilters, trashFilterParams],
  );

  const listQuery = useTagsListQuery(canWriteTags || true, listFilterParams);

  const trashQuery = useTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    trashColumnFilters: trashColumnFilters,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.tags.remove(id),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => api.tags.restore(id),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async (id: string) => api.tags.purge(id),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete";
      ids: string[];
    }) => api.tags.bulk(input),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  useEffect(() => {
    setTrashPage(1);
  }, [trashColumnFilters, debouncedTrashQ, trashPageSize]);

  useEffect(() => {
    setListTagSelection({});
    setTrashTagSelection({});
  }, [mainTab]);

  const handleColumnFiltersChange = useColumnFiltersChange(setColumnFilters);
  const clearListFilters = useClearListFilters(setColumnFilters, setGlobalFilter);
  const clearTrashFilters = useClearTrashFilters(setTrashGlobalFilter, setTrashColumnFilters);
  const handleTrashColumnFiltersChange = useColumnFiltersChange(setTrashColumnFilters);

  const rowActions = useAdminCrudRowHandlers<TagRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "thẻ",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  });

  const treeRows = useMemo<TagTreeRow[]>(
    () => buildTagTree(listQuery.data ?? []),
    [listQuery.data],
  );

  const columns = useMemo<ColumnDef<TagTreeRow>[]>(
    () =>
      getTagColumns({
        view: "list",
        openDetail: (row) => router.push(`/tags/${row.id}`),
        openEdit: (row) => router.push(`/tags/${row.id}/edit`),
        rowActions,
        canWrite: canWriteTags,
        canDelete: canDeleteTags,
        canHardDelete: canHardDeleteTags,
      }),
    [rowActions, router, canWriteTags, canDeleteTags, canHardDeleteTags],
  );

  const trashColumns = useMemo<ColumnDef<TagTreeRow>[]>(
    () =>
      getTagColumns({
        view: "trash",
        openDetail: (row) => router.push(`/tags/${row.id}`),
        openEdit: (row) => router.push(`/tags/${row.id}/edit`),
        rowActions,
        canWrite: canWriteTags,
        canRestore: canRestoreTags,
        canHardDelete: canHardDeleteTags,
      }),
    [rowActions, router, canWriteTags, canRestoreTags, canHardDeleteTags],
  );

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Thẻ"
        subtitle="Quản lý thẻ dùng chung để gắn cho bài viết và nội dung truyền thông"
        icon={Hash}
        readOnlyHint={
          user && !canWriteTags ? (
            <AdminReadOnlyHint>
              Chỉ xem: cần quyền{" "}
              <span className="font-mono">tags:manage</span> để
              thêm/sửa/xoá.
            </AdminReadOnlyHint>
          ) : undefined
        }
        actions={
          <>{canWriteTags && (
            <AdminPageHeaderPrimaryButton
              type="button"
              onClick={() => router.push("/tags/new")}
              className="flex h-12 items-center gap-2 rounded-lg px-6 font-bold shadow-md"
            >
              <Plus className="size-5" aria-hidden /> Thêm thẻ
            </AdminPageHeaderPrimaryButton>
          )}</>
        }
      />

      <Tabs
        value={mainTab}
        onValueChange={(v) => {
          if (v === "list" || v === "trash") setMainTab(v);
        }}
        className="space-y-6"
      >
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger
            value="list"
            className={ADMIN_LIST_TABS_TRIGGER_CLASS}
          >
            Danh sách
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {listQuery.data?.length ?? 0}
            </Badge>
          </TabsTrigger>
          {canWriteTags ? (
            <TabsTrigger
              value="trash"
              className={ADMIN_LIST_TABS_TRIGGER_CLASS}
            >
              Thùng rác
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] tabular-nums"
              >
                {trashQuery.data?.total ?? 0}
              </Badge>
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-4">
          {listQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold">Không tải được danh sách thẻ</p>
                  <p className="mt-1 text-sm opacity-90">
                    {listQuery.error.message}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <TagsTable
            data={treeRows}
            columns={columns}
            isLoading={listQuery.isLoading}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listTagSelection}
            onSelectedRowIdsChange={setListTagSelection}
            total={listQuery.data?.length ?? 0}
            onClearFilters={clearListFilters}
            onBulkDelete={async (rows) => {
              const ids = rows.filter((r) => !r.isGroup).map((r) => String(r.id));
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "delete", ids });
              toast.success(`Đã đưa ${ids.length} thẻ vào thùng rác`);
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.filter((r) => !r.isGroup).map((r) => String(r.id));
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "hard-delete", ids });
              toast.success(`Đã xóa vĩnh viễn ${ids.length} thẻ`);
            }}
          />
        </TabsContent>

        {canWriteTags ? (
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
              <TagsTrashTable
                data={trashQuery.data?.items ?? []}
                columns={trashColumns as import("@tanstack/react-table").ColumnDef<import("./_component").TagTreeRow>[]}
                isLoading={trashQuery.isLoading}
                columnFilters={trashColumnFilters}
                onColumnFiltersChange={handleTrashColumnFiltersChange}
                globalFilter={trashGlobalFilter}
                onGlobalFilterChange={setTrashGlobalFilter}
                selectedRowIds={trashTagSelection}
                onSelectedRowIdsChange={setTrashTagSelection}
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
                  toast.success(`Đã khôi phục ${ids.length} thẻ`);
                }}
                onBulkPurge={async (rows) => {
                  const ids = rows.map((r) => String(r.id));
                  if (!ids.length) return;
                  await bulkMutation.mutateAsync({ action: "hard-delete", ids });
                  toast.success(`Đã xóa vĩnh viễn ${ids.length} thẻ`);
                }}
                trashExportParams={{
                  search: debouncedTrashQ.trim() || undefined,
                  filters: trashExportFilterParams as Record<string, string>,
                }}
              />
            )}
          </TabsContent>
        ) : null}
      </Tabs>
    </AdminPageSection>
  );
}

export default function TagsPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <TagsPageInner />
    </AdminPageGuard>
  );
}
