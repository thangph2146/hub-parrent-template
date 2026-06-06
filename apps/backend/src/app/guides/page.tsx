"use client";

import { useMemo, useState } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
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
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import {
  useGuidesQuery,
  useGuidesActions,
  getGuidesColumns,
  GuidesTable,
  PAGE_KEY,
  sortGroupsByOrder,
  parseContent,
  prefetchGuideDetail,
  type GuideGroup,
} from "./_component";

function GuidesPageInner() {
  const { user } = useAuth();
  const canWrite = user ? canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_MANAGE) || canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_CREATE) || canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_UPDATE) : false;
  const queryClient = useQueryClient();
  const crudNav = useAdminCrudNavigation("/guides", {
    prefetchDetail: (id) => prefetchGuideDetail(queryClient, api, id),
  });
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

  const { handleReorder, isReordering } = useGuidesActions({
    api,
    groups: sortedGroups,
  });

  const rowActions = useAdminCrudRowHandlers<GuideGroup>({
    getRecordLabel: (row) => parseContent(row.content).title ?? row.sectionKey,
    entityLabel: "nhóm hướng dẫn",
    deleteMutation,
    purgeMutation,
  });

  const columns = useMemo(
    () =>
      getGuidesColumns({
        onView: (row) => crudNav.view(String(row.id)),
        onEdit: (row) => crudNav.edit(String(row.id)),
        rowActions,
        canWrite,
      }),
    [crudNav, canWrite, rowActions],
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
            <AdminPageHeaderPrimaryButton onClick={() => crudNav.new()}>
              <Plus className="size-4" />
              Thêm nhóm
            </AdminPageHeaderPrimaryButton>
          ) : undefined
        }
      />

      <GuidesTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            
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
        onRowReorder={canWrite ? handleReorder : undefined}
        isReordering={isReordering}
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
