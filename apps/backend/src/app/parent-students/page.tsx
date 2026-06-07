"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import { toast } from "@ui/components/sonner";
import { CheckCircle2, Trash2, UserCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_ALERT_DIALOG_CONTENT_CLASS,
} from "@ui/lib/layout-shell";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { useAuth } from "@/providers/auth-provider";
import { AdminConfirmActionDialog, AdminListPageHeader, AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib";
import { api } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ParentStudentTable } from "./_component/_table";
import { useReviewParentStudentMutation } from "./_component/_query";
import { getParentStudentsColumns } from "./_component/columns";
import type { ParentStudent } from "./_component/types";

type ConfirmAction =
  | { kind: "approve"; row: ParentStudent }
  | { kind: "reject"; row: ParentStudent }
  | { kind: "purge"; row: ParentStudent };

function AdminParentStudentsPageInner() {
  const { user } = useAuth();
  const canApprove = user ? canUserAccess(user, PERMISSION_CODES.STUDENTS_UPDATE) || canUserAccess(user, PERMISSION_CODES.STUDENTS_MANAGE) : false;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const debouncedQ = useDebouncedValue(globalFilter, 300);

  const columnFilterQuery = useMemo(
    () =>
      buildAdminFilterQuery(
        columnFilters,
        COMMON_FILTER_MAPPINGS.parentStudents,
      ),
    [columnFilters],
  );

  const listQuery = useMemo(
    () => ({
      search: debouncedQ.trim() || undefined,
      filters: columnFilterQuery,
    }),
    [columnFilterQuery, debouncedQ],
  );

  useEffect(() => {
    setPage(1);
  }, [columnFilters, debouncedQ, pageSize]);

  useEffect(() => {
    setSelectedRowIds({});
  }, [columnFilters]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "parent-students", page, pageSize, debouncedQ, columnFilterQuery],
    queryFn: async () => {
      const result = await api.parentStudents.list({
        page,
        limit: pageSize,
        search: listQuery.search,
        filters: listQuery.filters,
      });
      return result;
    },
    select: (result) => ({
      data: result.items,
      pagination: { page, limit: pageSize, total: result.total, totalPages: Math.ceil(result.total / pageSize) },
    }),

  });

  const queryClient = useQueryClient();
  const reviewMutation = useReviewParentStudentMutation(() => setConfirmAction(null));

  const handleColumnFiltersChange = useCallback<
    (updater: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void
  >(
    (updater) => {
      setColumnFilters((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
  }, []);

  const purgeRows = useCallback(async (rows: ParentStudent[]) => {
    const ids = rows.map((r) => r.id);
    if (!ids.length) return;
    try {
      for (const id of ids) {
        await api.parentStudents.remove(id);
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "parent-students"] });
      toast.success(
        ids.length === 1
          ? "Đã xóa vĩnh viễn yêu cầu liên kết."
          : `Đã xóa vĩnh viễn ${ids.length} yêu cầu`,
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa yêu cầu liên kết.",
      );
      throw err;
    }
  }, [queryClient]);

  const columns = useMemo(
    () =>
      getParentStudentsColumns({
        onApprove: (row) => setConfirmAction({ kind: "approve", row }),
        onReject: (row) => setConfirmAction({ kind: "reject", row }),
        onPurge: (row) => setConfirmAction({ kind: "purge", row }),
        canApprove,
      }),
    [canApprove],
  );

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Duyệt liên kết học sinh"
        subtitle="Xem xét và duyệt yêu cầu liên kết học sinh từ phụ huynh."
        icon={UserCheck}
      />

      <ParentStudentTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        columnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        selectedRowIds={selectedRowIds}
        onSelectedRowIdsChange={setSelectedRowIds}
        page={page}
        pageSize={pageSize}
        total={data?.pagination.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        listQuery={listQuery}
        onClearFilters={clearFilters}
        onBulkApprove={async (rows) => {
          for (const row of rows) {
            await reviewMutation.mutateAsync({
              id: row.id,
              action: "approved",
            });
          }
        }}
        onBulkReject={async (rows) => {
          for (const row of rows) {
            await reviewMutation.mutateAsync({
              id: row.id,
              action: "rejected",
            });
          }
        }}
        onBulkPurge={purgeRows}
        canApprove={canApprove}
      />

      <AdminConfirmActionDialog
        open={confirmAction != null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
        footerClassName="gap-2"
        icon={
          confirmAction?.kind === "approve" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden />
          ) : confirmAction?.kind === "purge" ? (
            <Trash2 className="size-5 shrink-0 text-destructive" aria-hidden />
          ) : (
            <XCircle className="size-5 shrink-0 text-destructive" aria-hidden />
          )
        }
        title={
          confirmAction?.kind === "approve"
            ? "Duyệt yêu cầu liên kết?"
            : confirmAction?.kind === "purge"
              ? "Xóa vĩnh viễn yêu cầu liên kết?"
              : "Từ chối yêu cầu liên kết?"
        }
        description={
          confirmAction?.kind === "approve"
            ? `Duyệt liên kết học sinh «${confirmAction.row.studentCode}». Phụ huynh sẽ được xem bảng điểm sau khi duyệt.`
            : confirmAction?.kind === "purge"
              ? `Xóa vĩnh viễn yêu cầu liên kết học sinh «${confirmAction.row.studentCode}». Hành động này không thể hoàn tác.`
              : confirmAction?.kind === "reject"
                ? `Từ chối liên kết học sinh «${confirmAction.row.studentCode}». Phụ huynh sẽ thấy thông báo bị từ chối.`
                : null
        }
        confirmLabel={
          confirmAction?.kind === "approve"
            ? "Duyệt"
            : confirmAction?.kind === "purge"
              ? "Xóa vĩnh viễn"
              : "Từ chối"
        }
        confirmDestructive={confirmAction?.kind !== "approve"}
        confirmDisabled={reviewMutation.isPending || isPurging}
        confirmLoading={reviewMutation.isPending || isPurging}
        onConfirm={async () => {
          if (!confirmAction) return;
          if (confirmAction.kind === "purge") {
            setIsPurging(true);
            try {
              await purgeRows([confirmAction.row]);
              setConfirmAction(null);
            } finally {
              setIsPurging(false);
            }
            return;
          }
          await reviewMutation.mutateAsync({
            id: confirmAction.row.id,
            action: confirmAction.kind === "approve" ? "approved" : "rejected",
          });
        }}
      />
    </AdminPageSection>
  );
}

export default function AdminParentStudentsPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <AdminParentStudentsPageInner />
    </AdminPageGuard>
  );
}
