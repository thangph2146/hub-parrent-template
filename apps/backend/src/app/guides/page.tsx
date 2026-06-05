"use client";

import { useMemo, useState } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, BookOpen } from "lucide-react";
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin";
import { AdminPageHeaderPrimaryButton } from "@ui/components/admin";
import { api } from "@/lib/api";
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib";
import { useAdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import {
  useGuidesQuery,
  getGuidesColumns,
  GuidesTable,
  PAGE_KEY,
  sortGroupsByOrder,
  parseContent,
  type GuideGroup,
} from "./_component";

function GuidesPageInner() {
  const { user } = useAuth();
  const canWrite = user ? canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_MANAGE) || canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_CREATE) || canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_UPDATE) : false;
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const listFilterParams = useMemo(
    () => buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.guides),
    [columnFilters],
  );

  const { data, isLoading, refetch } = useGuidesQuery({
    api,
    page: 1,
    limit: 1000,
    search: globalFilter,
    filters: listFilterParams,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.guides.remove(id),
    onSuccess: async () => { await refetch(); },
  });

  const purgeMutation = useMutation({
    mutationFn: async (id: string) => api.guides.purge(id),
    onSuccess: async () => { await refetch(); },
  });

  const sortedGroups = useMemo(
    () => sortGroupsByOrder((data?.data ?? []).filter((g) => g.pageKey === PAGE_KEY)),
    [data],
  );

  const rowActions = useAdminCrudRowHandlers<GuideGroup>({
    getRecordLabel: (row) => parseContent(row.content).title ?? row.sectionKey,
    entityLabel: "nhóm hướng dẫn",
    deleteMutation,
    purgeMutation,
  });

  const columns = useMemo(
    () =>
      getGuidesColumns({
        onView: (row) => router.push(`/guides/${row.id}`),
        onEdit: (row) => router.push(`/guides/${row.id}/edit`),
        rowActions,
        canWrite,
      }),
    [router, canWrite, rowActions],
  );

  const handleBulkPurge = async (rows: GuideGroup[]) => {
    const ids = rows.map((r) => r.id);
    try {
      await api.guides.bulk({ action: "hard-delete", ids });
      toast.success(`Đã xóa vĩnh viễn ${ids.length} nhóm hướng dẫn`);
      await refetch();
    } catch {
      toast.error("Xóa vĩnh viễn thất bại");
    }
  };

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
