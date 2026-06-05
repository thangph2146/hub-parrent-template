"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef, ColumnFiltersState, RowSelectionState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { useRouter } from "next/navigation";
import { AlertCircle, BookOpen, Plus } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuth } from "@/providers/auth-provider";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { PageSection } from "@ui/components/layout";
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell";
import { cn } from "@ui/lib/utils";
import { AdminPageGuard, AdminPageSection, AdminListPageHeader, AdminReadOnlyHint, AdminPageHeaderPrimaryButton } from "@ui/components/admin";
import { api } from "@/lib/api"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib";
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import {
  CoursesTable,
  CoursesTrashTable,
  getCourseColumns,  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  useCoursesListQuery,
  useCoursesTrashQuery,
} from "./_component";
import type { CourseRow } from "./_component";

function CoursesPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.COURSES_MANAGE) ||
      canUserAccess(user, PERMISSION_CODES.COURSES_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.COURSES_UPDATE)
    : false;

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const [mainTab, setMainTab] = useState<"list" | "trash">("list");
  const [globalFilter, setGlobalFilter] = useState("");
  const [trashPage, setTrashPage] = useState(1);
  const [trashPageSize, setTrashPageSize] = useState(15);
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [trashColumnFilters, setTrashColumnFilters] = useState<ColumnFiltersState>([]);
  const [listSelection, setListSelection] = useState<RowSelectionState>({});
  const [trashSelection, setTrashSelection] = useState<RowSelectionState>({});

  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 350);

  const listFilterParams = useMemo(
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.courses),
    [columnFilters]
  );

  const trashFilterParams = useMemo(
    () => buildAdminFilterQuery(trashColumnFilters, COMMON_FILTER_MAPPINGS.courses),
    [trashColumnFilters]
  );

  const listQuery = useCoursesListQuery(api, canWrite || true, listFilterParams);

  const trashQuery = useCoursesTrashQuery({
    api,
    trashPage,
    trashPageSize,
    debouncedTrashQ,
    enabled: mainTab === "trash",
    filters: trashFilterParams,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.courses.remove(id),
    onSuccess: async () => { await invalidateAll(); },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => api.courses.restore(id),
    onSuccess: async () => { await invalidateAll(); },
  });

  const purgeMutation = useMutation({
    mutationFn: async (id: string) => api.courses.purge(id),
    onSuccess: async () => { await invalidateAll(); },
  });

  const bulkMutation = useMutation({
    mutationFn: async (input: { action: "delete" | "restore" | "hard-delete"; ids: string[] }) =>
      api.courses.bulk(input),
    onSuccess: async () => { await invalidateAll(); },
  });

  useEffect(() => { setTrashPage(1); }, [trashColumnFilters, debouncedTrashQ, trashPageSize]);
  useEffect(() => { setListSelection({}); setTrashSelection({}); }, [mainTab]);

  const handleColumnFiltersChange = useColumnFiltersChange(setColumnFilters);
  const clearListFilters = useClearListFilters(setColumnFilters, setGlobalFilter);
  const clearTrashFilters = useClearTrashFilters(setTrashGlobalFilter, setTrashColumnFilters);
  const handleTrashColumnFiltersChange = useColumnFiltersChange(setTrashColumnFilters);

  const rowActions = useAdminCrudRowHandlers<CourseRow>({
    getRecordLabel: (row) => row.name,
    entityLabel: "khóa học",
    deleteMutation,
    restoreMutation,
    purgeMutation,
  });

  const columns = useMemo<ColumnDef<CourseRow>[]>(
    () => getCourseColumns({
        view: "list",
      openDetail: (row) => router.push(`/courses/${row.id}`),
      openEdit: (row) => router.push(`/courses/${row.id}/edit`),
      rowActions,
      canWrite,
    }),
    [rowActions, router, canWrite],
  );

  const trashColumns = useMemo<ColumnDef<CourseRow>[]>(
    () => getCourseColumns({ view: "trash",  rowActions, canWrite }),
    [rowActions, canWrite],
  );

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Khóa học"
        subtitle="Quản lý các khóa học trong hệ thống"
        icon={BookOpen}
        readOnlyHint={
          user && !canWrite ? (
            <AdminReadOnlyHint>
              Chỉ xem: cần quyền <span className="font-mono">courses:manage</span> để thêm/sửa/xoá.
            </AdminReadOnlyHint>
          ) : undefined
        }
        actions={
          <>{canWrite && (
            <AdminPageHeaderPrimaryButton
              type="button"
              onClick={() => router.push("/courses/new")}
              className="flex h-12 items-center gap-2 rounded-lg px-6 font-bold shadow-md"
            >
              <Plus className="size-5" aria-hidden /> Thêm khóa học
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

          <CoursesTable
            data={listQuery.data ?? []}
            columns={columns}
            isLoading={listQuery.isLoading}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            selectedRowIds={listSelection}
            onSelectedRowIdsChange={setListSelection}
            total={listQuery.data?.length ?? 0}
            onClearFilters={clearListFilters}
            onBulkDelete={async (rows) => {
              const ids = rows.map((r) => r.id);
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "delete", ids });
              toast.success(`Đã đưa ${ids.length} khóa học vào thùng rác`);
            }}
            onBulkPurge={async (rows) => {
              const ids = rows.map((r) => r.id);
              if (!ids.length) return;
              await bulkMutation.mutateAsync({ action: "hard-delete", ids });
              toast.success(`Đã xóa vĩnh viễn ${ids.length} khóa học`);
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
              <CoursesTrashTable
                data={trashQuery.data?.items ?? []}
                columns={trashColumns}
                isLoading={trashQuery.isLoading}
                columnFilters={trashColumnFilters}
                onColumnFiltersChange={handleTrashColumnFiltersChange}
                globalFilter={trashGlobalFilter}
                onGlobalFilterChange={setTrashGlobalFilter}
                selectedRowIds={trashSelection}
                onSelectedRowIdsChange={setTrashSelection}
                page={trashPage}
                pageSize={trashPageSize}
                total={trashQuery.data?.total ?? 0}
                onPageChange={setTrashPage}
                onPageSizeChange={setTrashPageSize}
                onClearFilters={clearTrashFilters}
                onBulkRestore={async (rows) => {
                  const ids = rows.map((r) => r.id);
                  if (!ids.length) return;
                  await bulkMutation.mutateAsync({ action: "restore", ids });
                  toast.success(`Đã khôi phục ${ids.length} khóa học`);
                }}
                onBulkPurge={async (rows) => {
                  const ids = rows.map((r) => r.id);
                  if (!ids.length) return;
                  await bulkMutation.mutateAsync({ action: "hard-delete", ids });
                  toast.success(`Đã xóa vĩnh viễn ${ids.length} khóa học`);
                }}
                trashExportParams={{
                  search: debouncedTrashQ.trim() || undefined,
                  filters: trashFilterParams,
                }}
              />
            )}
          </TabsContent>
        )}
      </Tabs>

    </AdminPageSection>
  );
}

export default function CoursesPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <CoursesPageInner />
    </AdminPageGuard>
  );
}
