"use client";

import { useMemo, useState, useCallback } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin";
import { AdminPageHeaderPrimaryButton } from "@ui/components/admin";
import { api } from "@/lib/api";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import {
  useGuidesQuery,
  GuidesConfirmDialog,
  getGuidesColumns,
  GuidesTable,
  PAGE_KEY,
  sortGroupsByOrder,
  type GuideConfirmAction,
  type GuideGroup,
} from "./_component";

function GuidesPageInner() {
  const { user } = useAuth();
  const canWrite = user ? canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_MANAGE) || canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_CREATE) || canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_UPDATE) : false;
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [confirmAction, setConfirmAction] = useState<GuideConfirmAction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const { data, isLoading, refetch } = useGuidesQuery({
    api,
    page: 1,
    limit: 1000,
    search: globalFilter,
  });

  const sortedGroups = useMemo(
    () => sortGroupsByOrder((data?.data ?? []).filter((g) => g.pageKey === PAGE_KEY)),
    [data],
  );

  const columns = useMemo(
    () =>
      getGuidesColumns({
        onView: (row) => router.push(`/guides/${row.id}`),
        onEdit: (row) => router.push(`/guides/${row.id}/edit`),
        onDelete: (row) => setConfirmAction({ kind: "delete", row }),
        onPurge: (row) => setConfirmAction({ kind: "purge", row }),
        canWrite,
      }),
    [router, canWrite],
  );

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.kind === "delete" && confirmAction.row) {
      setIsDeleting(true);
      try {
        await api.guides.remove(confirmAction.row.id);
        await refetch();
      } finally {
        setIsDeleting(false);
      }
    }
    setConfirmAction(null);
  };

  const handlePurgeConfirm = async () => {
    if (!confirmAction || confirmAction.kind !== "purge" || !confirmAction.row) return;
    setIsPurging(true);
    try {
      await api.guides.purge(confirmAction.row.id);
      toast.success("Đã xóa vĩnh viễn nhóm hướng dẫn");
      await refetch();
    } finally {
      setIsPurging(false);
      setConfirmAction(null);
    }
  };

  const handleBulkPurge = useCallback(async (rows: GuideGroup[]) => {
    const ids = rows.map((r) => r.id);
    try {
      await api.guides.bulk({ action: "hard-delete", ids });
      toast.success(`Đã xóa vĩnh viễn ${ids.length} nhóm hướng dẫn`);
      await refetch();
    } catch {
      toast.error("Xóa vĩnh viễn thất bại");
    }
  }, [refetch]);

  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={BookOpen}
        title="Hướng dẫn sử dụng"
        subtitle="Quản lý nhóm hướng dẫn sử dụng hệ thống"
        actions={
          canWrite ? (
            <AdminPageHeaderPrimaryButton onClick={() => router.push("/guides/new")}>
              <Plus className="size-4" />
              Thêm nhóm
            </AdminPageHeaderPrimaryButton>
          ) : undefined
        }
      />

      <GuidesTable
        data={sortedGroups}
        columns={columns}
        isLoading={isLoading}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        total={sortedGroups.length}
        onClearFilters={() => {
          setGlobalFilter("");
          setColumnFilters([]);
        }}
        onBulkPurge={handleBulkPurge}
      />

      <GuidesConfirmDialog
        confirmAction={confirmAction}
        deleteMutation={{ isPending: isDeleting }}
        purgeMutation={{ isPending: isPurging }}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        onConfirm={() => {
          void handleConfirmAction();
        }}
        onPurgeConfirm={() => {
          void handlePurgeConfirm();
        }}
      />
    </AdminPageSection>
  );
}

export default function GuidesPage() {
  return (
    <AdminPageGuard permission="page_contents:view">
      <GuidesPageInner />
    </AdminPageGuard>
  );
}
