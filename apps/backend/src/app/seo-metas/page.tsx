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
  ADMIN_ALERT_DIALOG_CONTENT_CLASS,
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell";
import { AdminPageGuard, AdminPageSection, AdminListPageHeader, AdminReadOnlyHint, AdminPageHeaderPrimaryButton } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  SeoMetasTable,
  SeoMetasConfirmDialog,
  getSeoMetaColumns,
  getTrashColumns,
  useSeoMetasListQuery,
  useSeoMetasTrashQuery,
} from "./_component";
import type { SeoMetaRow, SeoMetaConfirmAction } from "./_component";

function SeoMetasPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.SEO_METAS_UPDATE)
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

  const listFilterParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const f of columnFilters) {
      if (f.id === "status") {
        params.statusFilter = String(f.value);
      }
    }
    return params;
  }, [columnFilters]);

  const trashFilterParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const f of trashColumnFilters) {
      if (f.id === "deletedAt" && typeof f.value === "string") {
        const [fromStr, toStr] = f.value.split(",");
        if (fromStr) params.deletedAtFrom = fromStr;
        if (toStr) params.deletedAtTo = toStr;
      }
    }
    return params;
  }, [trashColumnFilters]);

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

  const { confirmAction, setConfirmAction } = useConfirmAction();

  const handleConfirmAction = useHandleConfirmAction(
    deleteMutation, restoreMutation, purgeMutation, setConfirmAction,
  );

  const columns = useMemo<ColumnDef<SeoMetaRow>[]>(
    () => getSeoMetaColumns({
      openDetail: (row) => router.push(`/seo-metas/${row.id}`),
      openEdit: (row) => router.push(`/seo-metas/${row.id}/edit`),
      setConfirmAction,
      canWrite,
    }),
    [setConfirmAction, router, canWrite],
  );

  const trashColumns = useMemo<ColumnDef<SeoMetaRow>[]>(
    () => getTrashColumns({ setConfirmAction, canWrite }),
    [setConfirmAction, canWrite],
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
            )}
          </TabsContent>
        )}
      </Tabs>

      <SeoMetasConfirmDialog
        confirmAction={confirmAction}
        deleteMutation={deleteMutation}
        restoreMutation={restoreMutation}
        purgeMutation={purgeMutation}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        onConfirm={() => { if (confirmAction) void handleConfirmAction(confirmAction); }}
        contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
      />
    </AdminPageSection>
  );
}

function useConfirmAction() {
  const [confirmAction, setConfirmAction] = useState<SeoMetaConfirmAction | null>(null);
  return { confirmAction, setConfirmAction };
}

import { useCallback } from "react";

function useHandleConfirmAction(
  deleteMutation: UseMutationResult<unknown, Error, string>,
  restoreMutation: UseMutationResult<unknown, Error, string>,
  purgeMutation: UseMutationResult<unknown, Error, string>,
  setConfirmAction: React.Dispatch<React.SetStateAction<SeoMetaConfirmAction | null>>,
) {
  return useCallback(
    async ({ kind, row }: SeoMetaConfirmAction) => {
      try {
        const id = row.id;
        if (kind === "delete") {
          await deleteMutation.mutateAsync(id);
          toast.success("Đã xóa tạm SEO metadata");
        } else if (kind === "restore") {
          await restoreMutation.mutateAsync(id);
          toast.success("Đã khôi phục SEO metadata");
        } else if (kind === "purge") {
          await purgeMutation.mutateAsync(id);
          toast.success("Đã xóa vĩnh viễn SEO metadata");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Thao tác thất bại";
        toast.error(message);
      } finally {
        setConfirmAction(null);
      }
    },
    [deleteMutation, restoreMutation, purgeMutation, setConfirmAction],
  );
}

export default function SeoMetasPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <SeoMetasPageInner />
    </AdminPageGuard>
  );
}
