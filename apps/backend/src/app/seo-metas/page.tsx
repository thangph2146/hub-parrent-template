"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef, ColumnFiltersState, RowSelectionState } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { useRouter } from "next/navigation";
import { AlertCircle, Search, Plus } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuth } from "@/providers/auth-provider";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell";
import { AdminPageGuard, AdminPageSection, AdminListPageHeader, AdminReadOnlyHint, AdminPageHeaderPrimaryButton } from "@ui/components/admin";
import { api } from "@/lib/api"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib";
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import {
  SeoMetasTable,
  getSeoMetaColumns,
  useSeoMetasListQuery,
  useSeoMetasTrashQuery,
} from "./_component";
import type { SeoMetaRow } from "./_component";

function SeoMetasPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_UPDATE)
    : false;
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_DELETE)
    : false;
  const canRestore = user
    ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_RESTORE)
    : false;
  const canHardDelete = user
    ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_HARD_DELETE)
    : false;

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["seo-metas"] });
  };

  const [mainTab, setMainTab] = useState<"list" | "trash">("list");
  const [globalFilter, setGlobalFilter] = useState("");
  const [trashPage, setTrashPage] = useState(1);
  const [trashPageSize] = useState(15);
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [trashColumnFilters, setTrashColumnFilters] = useState<ColumnFiltersState>([]);
  const [listSelection, setListSelection] = useState<RowSelectionState>({});
  const [trashSelection, setTrashSelection] = useState<RowSelectionState>({});

  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 350);

  const listFilterParams = useMemo(
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.seoMetas),
    [columnFilters]
  );

  const trashFilterParams = useMemo(
    () => buildAdminFilterQuery(trashColumnFilters, COMMON_FILTER_MAPPINGS.seoMetas),
    [trashColumnFilters]
  );

  const listQuery = useSeoMetasListQuery(api, canWrite || true, listFilterParams);

  const trashQuery = useSeoMetasTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.seoMetas.remove(id),
    onSuccess: async () => { await invalidateAll(); },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => api.seoMetas.restore(id),
    onSuccess: async () => { await invalidateAll(); },
  });

  const purgeMutation = useMutation({
    mutationFn: async (id: string) => api.seoMetas.purge(id),
    onSuccess: async () => { await invalidateAll(); },
  });

  const bulkMutation = useMutation({
    mutationFn: async (input: { action: "delete" | "restore" | "hard-delete"; ids: string[] }) =>
      api.seoMetas.bulk(input),
    onSuccess: async () => { await invalidateAll(); },
  });

  useEffect(() => { setTrashPage(1); }, [trashColumnFilters, debouncedTrashQ, trashPageSize]);
  useEffect(() => { setListSelection({}); setTrashSelection({}); }, [mainTab]);
  const rowActions = useAdminCrudRowHandlers<SeoMetaRow>({
    getRecordLabel: (row) => row.page,
    entityLabel: "SEO metadata",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  });
  const columns = useMemo<ColumnDef<SeoMetaRow>[]>(
    () =>
      getSeoMetaColumns({
        view: "list",
        openDetail: (row) => router.push(`/seo-metas/${row.id}`),
        openEdit: (row) => router.push(`/seo-metas/${row.id}/edit`),
        rowActions,
        canWrite,
        canDelete,
        canHardDelete,
      }),
    [rowActions, router, canWrite, canDelete, canHardDelete],
  );



  const trashColumns = useMemo<ColumnDef<SeoMetaRow>[]>(
    () => getSeoMetaColumns({ view: "trash",  rowActions, canWrite, canRestore, canHardDelete }),
    [rowActions, canWrite, canRestore, canHardDelete],
  );

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="SEO Metadata"
        subtitle="Quản lý SEO metadata cho từng trang trong hệ thống"
        icon={Search}
        readOnlyHint={
          user && !canWrite ? (
            <AdminReadOnlyHint>
              Chỉ xem: cần quyền <span className="font-mono">seo_metas:manage</span> để thêm/sửa/xoá.
            </AdminReadOnlyHint>
          ) : undefined
        }
        actions={
          <>{canWrite && (
            <AdminPageHeaderPrimaryButton
              type="button"
              onClick={() => router.push("/seo-metas/new")}
            >
              <Plus className="size-5" aria-hidden /> Thêm SEO
            </AdminPageHeaderPrimaryButton>
          )}</>
        }
      />

      <Tabs value={mainTab} onValueChange={(v) => { if (v === "list" || v === "trash") setMainTab(v); }} className="space-y-6">
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="list" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            Danh sách
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {listQuery.data?.length ?? 0}
            </Badge>
          </TabsTrigger>
          {canWrite && (
            <TabsTrigger value="trash" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
              Thùng rác
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
                {trashQuery.data?.total ?? 0}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-4">
          {listQuery.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold">Không tải được danh sách</p>
                  <p className="mt-1 text-sm opacity-90">{listQuery.error.message}</p>
                </div>
              </div>
            </div>
          ) : null}

          <SeoMetasTable
            data={listQuery.data ?? []}
            columns={columns}
            isLoading={listQuery.isLoading}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listSelection}
            onSelectedRowIdsChange={setListSelection}
            total={listQuery.data?.length ?? 0}
            onClearFilters={() => { setColumnFilters([]); setGlobalFilter(""); }}
            onBulkDelete={async (rows) => {
              const ids = rows.map((r) => r.id);
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "delete", ids });
              toast.success(`Đã đưa ${ids.length} SEO metadata vào thùng rác`);
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => r.id);
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "hard-delete", ids });
              toast.success(`Đã xóa vĩnh viễn ${ids.length} SEO metadata`);
            }}
          />
        </TabsContent>

        {canWrite && (
          <TabsContent value="trash" className="mt-0 space-y-4">
            {trashQuery.error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold">Không tải được thùng rác</p>
                    <p className="mt-1 text-sm opacity-90">{trashQuery.error.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <SeoMetasTable
                data={trashQuery.data?.items ?? []}
                columns={trashColumns}
                isLoading={trashQuery.isLoading}
                columnFilters={trashColumnFilters}
                onColumnFiltersChange={setTrashColumnFilters}
                globalFilter={trashGlobalFilter}
                onGlobalFilterChange={setTrashGlobalFilter}
                selectedRowIds={trashSelection}
                onSelectedRowIdsChange={setTrashSelection}
                total={trashQuery.data?.total ?? 0}
                onClearFilters={() => { setTrashColumnFilters([]); setTrashGlobalFilter(""); }}
                onBulkRestore={async (rows) => {
                  const ids = rows.map((r) => r.id);
                  if (!ids.length) return;
                  await bulkMutation.mutateAsync({ action: "restore", ids });
                  toast.success(`Đã khôi phục ${ids.length} SEO metadata`);
                }}
                onBulkPurge={async (rows) => {
                  const ids = rows.map((r) => r.id);
                  if (!ids.length) return;
                  await bulkMutation.mutateAsync({ action: "hard-delete", ids });
                  toast.success(`Đã xóa vĩnh viễn ${ids.length} SEO metadata`);
                }}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </AdminPageSection>
  );
}

export default function SeoMetasPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <SeoMetasPageInner />
    </AdminPageGuard>
  );
}
