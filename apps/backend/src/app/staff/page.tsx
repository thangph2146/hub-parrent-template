"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnFiltersState, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import {
  AlertCircle,
  ArchiveRestore,
  Info,
  Layers,
  UserPlus,
  Users,
} from "lucide-react";
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@ui/components/sonner";
import { Badge } from "@ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { TypographyH3 } from "@ui/components/typography";
import { ADMIN_LIST_TABS_LIST_CLASS, ADMIN_LIST_TABS_TRIGGER_CLASS } from "@ui/lib/layout-shell";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { AdminListPageHeader, AdminPageGuard, AdminPageHeaderPrimaryButton, AdminPageSection } from "@ui/components/admin";
import {
  prefetchStaffProfile,
  queryKeys,
  useRbacCatalog,
  useStaffUserList,
  useTrashedStaffUsers,
} from "@/hooks/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import {
  canEditProtectedAdminUser,
  isProtectedAdminEmail,
} from "@/config/protected-admin";
import {
  buildUsersFilterQuery,
  StaffBulkConfirmDialog,
  StaffConfirmDialog,
  StaffTable,
  StaffTrashTable,
  type StaffRow,
} from "./_component";

function StaffPageInner() {
  const queryClient = useQueryClient();
  const crudNav = useAdminCrudNavigation("/staff", {
    prefetchDetail: (id) => prefetchStaffProfile(queryClient, id),
  });
  const { user: session } = useAuth();
  const canManageUsers =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE);
  const canCreate = session != null && canUserAccess(session, PERMISSION_CODES.USERS_CREATE);
  const canUpdate = session != null && canUserAccess(session, PERMISSION_CODES.USERS_UPDATE);
  const canDelete = session != null && canUserAccess(session, PERMISSION_CODES.USERS_DELETE);
  const canRestore = session != null && canUserAccess(session, PERMISSION_CODES.USERS_RESTORE);
  const canHardDelete = session != null && canUserAccess(session, PERMISSION_CODES.USERS_HARD_DELETE);

  const rbacQuery = useRbacCatalog({
    enabled: Boolean(session) && canManageUsers,
  });

  const [staffSubTab, setStaffSubTab] = useState<"list" | "trash">("list");
  const [listStaffSelection, setListStaffSelection] =
    useState<RowSelectionState>({});
  const [trashStaffSelection, setTrashStaffSelection] =
    useState<RowSelectionState>({});
  const [staffPage, setStaffPage] = useState(1);
  const [staffPageSize, setStaffPageSize] = useState(25);
  const [trashPage, setTrashPage] = useState(1);
  const [trashPageSize, setTrashPageSize] = useState(25);
  const [trashSearch, setTrashSearch] = useState("");
  const debouncedTrashSearch = useDebouncedValue(trashSearch, 250);

  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 250);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [trashColumnFilters, setTrashColumnFilters] = useState<ColumnFiltersState>([]);

  const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<StaffRow | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<StaffRow | null>(null);
  const [toggleTarget, setToggleTarget] = useState<StaffRow | null>(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null);
  const [bulkRestoreTarget, setBulkRestoreTarget] = useState<string[] | null>(null);
  const [bulkPurgeTarget, setBulkPurgeTarget] = useState<string[] | null>(null);
  const [bulkActiveTarget, setBulkActiveTarget] = useState<string[] | null>(null);
  const [bulkUnactiveTarget, setBulkUnactiveTarget] = useState<string[] | null>(null);

  useEffect(() => {
    setStaffPage(1);
  }, [debouncedGlobalFilter, staffPageSize]);

  useEffect(() => {
    setTrashPage(1);
  }, [debouncedTrashSearch, staffSubTab, trashPageSize]);

  useEffect(() => {
    setListStaffSelection({});
    setTrashStaffSelection({});
  }, [staffSubTab]);

  const staffListParams = useMemo(
    () => ({
      q: debouncedGlobalFilter.trim() || undefined,
      page: staffPage,
      limit: staffPageSize,
      filters: buildUsersFilterQuery(columnFilters),
    }),
    [columnFilters, debouncedGlobalFilter, staffPage, staffPageSize]
  );

  const trashListParams = useMemo(
    () => ({
      page: trashPage,
      limit: trashPageSize,
      q: debouncedTrashSearch.trim() || undefined,
      filters: buildUsersFilterQuery(trashColumnFilters),
    }),
    [trashPage, trashPageSize, debouncedTrashSearch, trashColumnFilters]
  );

  const usersQuery = useStaffUserList({
    enabled: Boolean(session) && canManageUsers && staffSubTab === "list",
    listParams: staffListParams,
  });

  const trashedStaffQuery = useTrashedStaffUsers({
    enabled: Boolean(session) && canManageUsers && staffSubTab === "trash",
    listParams: trashListParams,
  });

  const bulkStaffMutation = useMutation({
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete" | "active" | "unactive";
      ids: string[];
    }) => api.users.bulk(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usersTrashed() }),
      ]);
    },
  });

  const roles = rbacQuery.data?.roles ?? [];
  const roleFilter = useMemo(() => {
    const value = columnFilters.find((filter) => filter.id === "roles")?.value;
    const normalized = String(value ?? "").trim();
    return normalized || "all";
  }, [columnFilters]);
  const staffListItems = useMemo(
    () => usersQuery.data?.items ?? [],
    [usersQuery.data?.items]
  );
  const staffTotal = usersQuery.data?.total ?? 0;

  const roleFilteredUsers = useMemo(() => {
    return staffListItems.filter((u) => {
      if (roleFilter === "all") return true;
      if (roleFilter === "none") return u.roles.length === 0;
      return u.roles.some((r) => r.code === roleFilter);
    });
  }, [staffListItems, roleFilter]);

  const trashedUsers = useMemo(
    () => trashedStaffQuery.data?.items ?? [],
    [trashedStaffQuery.data?.items],
  );
  const trashStaffTotal = trashedStaffQuery.data?.total ?? 0;

  const busy = bulkStaffMutation.isPending || rbacQuery.isFetching;

  const clearTrashStaffFilters = useCallback((): void => {
    setTrashSearch("");
    setTrashColumnFilters([]);
    setTrashPage(1);
  }, []);

  const handleStaffColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      setColumnFilters((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

  const clearStaffFilters = useCallback((): void => {
    setGlobalFilter("");
    setColumnFilters([]);
    setStaffPage(1);
  }, []);

  const handleView = useCallback((user: StaffRow) => {
    crudNav.view(String(user.id));
  }, [crudNav]);

  const handleEdit = useCallback(
    (user: StaffRow) => {
      if (!canEditProtectedAdminUser(session?.email, user.email)) {
        toast.error(
          `Tài khoản ${user.email} là tài khoản hệ thống. Chỉ chính tài khoản đó mới được chỉnh sửa.`,
        );
        return;
      }
      crudNav.edit(String(user.id));
    },
    [crudNav, session?.email],
  );

  const handleDelete = useCallback((user: StaffRow) => {
    if (isProtectedAdminEmail(user.email)) {
      toast.error(`Tài khoản ${user.email} là tài khoản hệ thống, không thể xóa.`);
      return;
    }
    setDeleteTarget(user);
  }, []);

  const handleRestore = useCallback((user: StaffRow) => {
    if (isProtectedAdminEmail(user.email)) {
      toast.error(`Tài khoản ${user.email} là tài khoản hệ thống.`);
      return;
    }
    setRestoreTarget(user);
  }, []);

  const handlePurge = useCallback((user: StaffRow) => {
    if (isProtectedAdminEmail(user.email)) {
      toast.error(`Tài khoản ${user.email} là tài khoản hệ thống, không thể xóa.`);
      return;
    }
    setPurgeTarget(user);
  }, []);

  const handleToggleActive = useCallback((user: StaffRow) => {
    if (String(user.id) === String(session?.id ?? "")) {
      toast.error("Không thể khoá chính tài khoản đang đăng nhập");
      return;
    }
    if (isProtectedAdminEmail(user.email)) {
      toast.error(
        `Tài khoản ${user.email} là tài khoản hệ thống, không thể thay đổi trạng thái.`,
      );
      return;
    }
    setToggleTarget(user);
  }, [session?.id]);

  const handleBulkDelete = useCallback((ids: string[]) => {
    const protectedIds = roleFilteredUsers
      .filter((u) => ids.includes(String(u.id)) && isProtectedAdminEmail(u.email))
      .map((u) => u.email);
    if (protectedIds.length > 0) {
      toast.error(`Không thể xóa tài khoản hệ thống: ${protectedIds.join(", ")}`);
      return;
    }
    setBulkDeleteTarget(ids);
  }, [roleFilteredUsers]);

  const handleBulkRestore = useCallback((ids: string[]) => {
    const protectedIds = trashedUsers
      .filter((u) => ids.includes(String(u.id)) && isProtectedAdminEmail(u.email))
      .map((u) => u.email);
    if (protectedIds.length > 0) {
      toast.error(`Không thể khôi phục tài khoản hệ thống: ${protectedIds.join(", ")}`);
      return;
    }
    setBulkRestoreTarget(ids);
  }, [trashedUsers]);

  const handleBulkPurge = useCallback((ids: string[]) => {
    const allUsers = [...roleFilteredUsers, ...trashedUsers];
    const protectedIds = allUsers
      .filter((u) => ids.includes(String(u.id)) && isProtectedAdminEmail(u.email))
      .map((u) => u.email);
    if (protectedIds.length > 0) {
      toast.error(`Không thể xóa vĩnh viễn tài khoản hệ thống: ${protectedIds.join(", ")}`);
      return;
    }
    setBulkPurgeTarget(ids);
  }, [roleFilteredUsers, trashedUsers]);

  const handleBulkActive = useCallback((ids: string[]) => {
    const allUsers = roleFilteredUsers;
    const protectedIds = allUsers
      .filter((u) => ids.includes(String(u.id)) && isProtectedAdminEmail(u.email))
      .map((u) => u.email);
    if (protectedIds.length > 0) {
      toast.error(
        `Không thể kích hoạt tài khoản hệ thống: ${protectedIds.join(", ")}`,
      );
      return;
    }
    setBulkActiveTarget(ids);
  }, [roleFilteredUsers]);

  const handleBulkUnactive = useCallback((ids: string[]) => {
    const allUsers = roleFilteredUsers;
    const protectedIds = allUsers
      .filter((u) => ids.includes(String(u.id)) && isProtectedAdminEmail(u.email))
      .map((u) => u.email);
    if (protectedIds.length > 0) {
      toast.error(
        `Không thể khoá tài khoản hệ thống: ${protectedIds.join(", ")}`,
      );
      return;
    }
    setBulkUnactiveTarget(ids);
  }, [roleFilteredUsers]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    if (String(deleteTarget.id) === String(session?.id ?? "")) {
      toast.error("Không thể xoá chính tài khoản đang đăng nhập");
      setDeleteTarget(null);
      return;
    }
    await bulkStaffMutation.mutateAsync({ action: "delete", ids: [String(deleteTarget.id)] });
    toast.success("Đã đưa tài khoản vào thùng rác");
    setDeleteTarget(null);
  }, [deleteTarget, session?.id, bulkStaffMutation]);

  const handleRestoreConfirm = useCallback(async () => {
    if (!restoreTarget) return;
    await bulkStaffMutation.mutateAsync({ action: "restore", ids: [String(restoreTarget.id)] });
    toast.success(`Đã khôi phục ${restoreTarget.email}`);
    setRestoreTarget(null);
  }, [restoreTarget, bulkStaffMutation]);

  const handlePurgeConfirm = useCallback(async () => {
    if (!purgeTarget) return;
    if (String(purgeTarget.id) === String(session?.id ?? "")) {
      toast.error("Không thể xoá vĩnh viễn chính tài khoản đang đăng nhập");
      setPurgeTarget(null);
      return;
    }
    await bulkStaffMutation.mutateAsync({ action: "hard-delete", ids: [String(purgeTarget.id)] });
    toast.success(`Đã xóa vĩnh viễn ${purgeTarget.email}`);
    setPurgeTarget(null);
  }, [purgeTarget, session?.id, bulkStaffMutation]);

  const handleToggleActiveConfirm = useCallback(async () => {
    if (!toggleTarget) return;
    const nextActive = !toggleTarget.isActive;
    await bulkStaffMutation.mutateAsync({
      action: nextActive ? "active" : "unactive",
      ids: [String(toggleTarget.id)],
    });
    toast.success(
      nextActive
        ? `Đã kích hoạt ${toggleTarget.email}`
        : `Đã khoá ${toggleTarget.email}`,
    );
    setToggleTarget(null);
  }, [toggleTarget, bulkStaffMutation]);

  const handleBulkActiveConfirm = useCallback(async () => {
    if (!bulkActiveTarget || bulkActiveTarget.length === 0) return;
    await bulkStaffMutation.mutateAsync({ action: "active", ids: bulkActiveTarget });
    toast.success(`Đã kích hoạt ${bulkActiveTarget.length} tài khoản`);
    setBulkActiveTarget(null);
    setListStaffSelection({});
  }, [bulkActiveTarget, bulkStaffMutation]);

  const handleBulkUnactiveConfirm = useCallback(async () => {
    if (!bulkUnactiveTarget || bulkUnactiveTarget.length === 0) return;
    if (bulkUnactiveTarget.includes(String(session?.id ?? ""))) {
      toast.error("Không thể khoá chính tài khoản đang đăng nhập");
      setBulkUnactiveTarget(null);
      return;
    }
    await bulkStaffMutation.mutateAsync({ action: "unactive", ids: bulkUnactiveTarget });
    toast.success(`Đã khoá ${bulkUnactiveTarget.length} tài khoản`);
    setBulkUnactiveTarget(null);
    setListStaffSelection({});
  }, [bulkUnactiveTarget, session?.id, bulkStaffMutation]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    await bulkStaffMutation.mutateAsync({ action: "delete", ids: bulkDeleteTarget });
    toast.success(`Đã đưa ${bulkDeleteTarget.length} tài khoản vào thùng rác`);
    setBulkDeleteTarget(null);
    setListStaffSelection({});
  }, [bulkDeleteTarget, bulkStaffMutation]);

  const handleBulkRestoreConfirm = useCallback(async () => {
    if (!bulkRestoreTarget || bulkRestoreTarget.length === 0) return;
    await bulkStaffMutation.mutateAsync({ action: "restore", ids: bulkRestoreTarget });
    toast.success(`Đã khôi phục ${bulkRestoreTarget.length} tài khoản`);
    setBulkRestoreTarget(null);
    setTrashStaffSelection({});
  }, [bulkRestoreTarget, bulkStaffMutation]);

  const handleBulkPurgeConfirm = useCallback(async () => {
    if (!bulkPurgeTarget || bulkPurgeTarget.length === 0) return;
    if (bulkPurgeTarget.includes(String(session?.id ?? ""))) {
      toast.error("Không thể xoá vĩnh viễn chính tài khoản đang đăng nhập");
      setBulkPurgeTarget(null);
      return;
    }
    await bulkStaffMutation.mutateAsync({ action: "hard-delete", ids: bulkPurgeTarget });
    toast.success(`Đã xóa vĩnh viễn ${bulkPurgeTarget.length} tài khoản`);
    setBulkPurgeTarget(null);
    setListStaffSelection({});
    setTrashStaffSelection({});
  }, [bulkPurgeTarget, session?.id, bulkStaffMutation]);

  if (!session) {
    return null;
  }

  if (!canManageUsers) {
    return (
      <AdminPageSection>
        <AdminListPageHeader icon={Users} title="Nhân sự" />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5">
          <div className="flex flex-row items-start gap-3 p-6">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <TypographyH3 className="text-base font-bold">Không có quyền truy cập</TypographyH3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cần quyền <span className="font-mono text-xs">users.manage</span>. Liên hệ quản trị để được gán vai trò phù hợp.
              </p>
            </div>
          </div>
        </div>
      </AdminPageSection>
    );
  }

  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={Users}
        title="Nhân sự"
        subtitle="Quản lý tài khoản nội bộ, gán vai trò và theo dõi trạng thái hoạt động của từng nhân sự trong hệ thống."
        actions={
          <AdminPageHeaderPrimaryButton
            type="button"
            onClick={() => crudNav.new()}
            disabled={!canCreate || busy || roles.length === 0}
          >
            <UserPlus className="size-4" aria-hidden />
            Thêm nhân sự
          </AdminPageHeaderPrimaryButton>
        }
      />

      <Tabs
        value={staffSubTab}
        onValueChange={(v) => {
          if (v === "list" || v === "trash") setStaffSubTab(v);
        }}
        className="space-y-4"
      >
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="list" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            <Layers className="size-4 shrink-0" aria-hidden />
            Danh sách
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {staffTotal}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="trash" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            <ArchiveRestore className="size-4 shrink-0" aria-hidden />
            Thùng rác
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] tabular-nums">
              {trashStaffTotal}
            </Badge>
          </TabsTrigger>
        </TabsList>

          <TabsContent value="list" className="mt-0 space-y-4">
            <p className="flex gap-2 text-sm text-muted-foreground">
              <Info
                className="mt-0.5 size-4 shrink-0 text-primary/80"
                aria-hidden
              />
              <span>
                Tìm nhanh gọi API phân trang. Chọn vai trò trong thanh công cụ
                bảng để lọc nhanh trên{" "}
                <span className="font-semibold">trang hiện tại</span>; lọc theo
                cột áp dụng thêm trên các dòng đã tải. Chọn số tài khoản/trang ở
                cuối bảng.
              </span>
            </p>

            {usersQuery.isError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 py-12 text-center">
                <AlertCircle className="mx-auto mb-2 size-10 text-destructive" />
                <p className="text-lg font-bold text-destructive">
                  Không tải được danh sách nhân sự
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {usersQuery.error instanceof Error
                    ? usersQuery.error.message
                    : "Lỗi không xác định"}
                </p>
              </div>
            ) : null}

            {!usersQuery.isError ? (
              <StaffTable
            onRowPrefetch={(row) => crudNav.prefetch(String(row.id))}
            
                data={roleFilteredUsers}
                isLoading={usersQuery.isLoading}
                total={staffTotal}
                page={staffPage}
                pageSize={staffPageSize}
                appliedPage={usersQuery.data?.page}
                appliedPageSize={usersQuery.data?.limit}
                onPageChange={setStaffPage}
                onPageSizeChange={setStaffPageSize}
                columnFilters={columnFilters}
                onColumnFiltersChange={handleStaffColumnFiltersChange}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                selectedRowIds={listStaffSelection}
                onSelectedRowIdsChange={setListStaffSelection}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPurge={handlePurge}
                onToggleActive={handleToggleActive}
                busy={busy}
                currentUserId={session?.id}
                actorEmail={session?.email}
                isProtected={(u) => isProtectedAdminEmail(u.email)}
                canUpdate={canUpdate}
                canDelete={canDelete}
                canRestore={canRestore}
                canHardDelete={canHardDelete}
                onBulkDelete={handleBulkDelete}
                onBulkPurge={handleBulkPurge}
                onBulkActive={handleBulkActive}
                onBulkUnactive={handleBulkUnactive}
                onClearFilters={clearStaffFilters}
                listParams={{
                  q: debouncedGlobalFilter.trim() || undefined,
                  filters: buildUsersFilterQuery(columnFilters),
                }}
                roleOptions={[
                  { value: "none", label: "Chưa gán vai trò" },
                  ...roles.map((r) => ({ value: r.code, label: r.name })),
                ]}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="trash" className="mt-0 space-y-4">
            {trashedStaffQuery.isError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 py-12 text-center">
                <AlertCircle className="mx-auto mb-2 size-10 text-destructive" />
                <p className="text-lg font-bold text-destructive">
                  Không tải được thùng rác
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {trashedStaffQuery.error instanceof Error
                    ? trashedStaffQuery.error.message
                    : "Lỗi tải thùng rác"}
                </p>
              </div>
            ) : (
              <>
                <p className="flex gap-2 text-sm text-muted-foreground">
                  <ArchiveRestore
                    className="mt-0.5 size-4 shrink-0 text-primary/80"
                    aria-hidden
                  />
                  <span>Tài khoản trong thùng rác không đăng nhập được.</span>
                </p>
                <StaffTrashTable
                  data={trashedUsers}
                  isLoading={trashedStaffQuery.isLoading}
                  total={trashStaffTotal}
                  page={trashPage}
                  pageSize={trashPageSize}
                  appliedPage={trashedStaffQuery.data?.page}
                  appliedPageSize={trashedStaffQuery.data?.limit}
                  onPageChange={setTrashPage}
                  onPageSizeChange={setTrashPageSize}
                  columnFilters={trashColumnFilters}
                  onColumnFiltersChange={setTrashColumnFilters}
                  globalFilter={trashSearch}
                  onGlobalFilterChange={setTrashSearch}
                  selectedRowIds={trashStaffSelection}
                  onSelectedRowIdsChange={setTrashStaffSelection}
                  onRestore={handleRestore}
                  onPurge={handlePurge}
                  busy={busy}
                  canRestore={canRestore}
                  canHardDelete={canHardDelete}
                  onBulkRestore={handleBulkRestore}
                  onBulkPurge={handleBulkPurge}
                  onClearFilters={clearTrashStaffFilters}
                  listParams={{
                    q: debouncedTrashSearch.trim() || undefined,
                    filters: buildUsersFilterQuery(trashColumnFilters),
                  }}
                />
              </>
            )}
          </TabsContent>
        </Tabs>

      <StaffConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        action="delete"
        target={deleteTarget}
        onConfirm={handleDeleteConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffConfirmDialog
        open={purgeTarget != null}
        onOpenChange={(open) => {
          if (!open) setPurgeTarget(null);
        }}
        action="purge"
        target={purgeTarget}
        onConfirm={handlePurgeConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffConfirmDialog
        open={restoreTarget != null}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        action="restore"
        target={restoreTarget}
        onConfirm={handleRestoreConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffConfirmDialog
        open={toggleTarget != null}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
        action={toggleTarget?.isActive ? "unactive" : "active"}
        target={toggleTarget}
        onConfirm={handleToggleActiveConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffBulkConfirmDialog
        open={bulkDeleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setBulkDeleteTarget(null);
        }}
        action="delete"
        count={bulkDeleteTarget?.length ?? 0}
        onConfirm={handleBulkDeleteConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffBulkConfirmDialog
        open={bulkRestoreTarget != null}
        onOpenChange={(open) => {
          if (!open) setBulkRestoreTarget(null);
        }}
        action="restore"
        count={bulkRestoreTarget?.length ?? 0}
        onConfirm={handleBulkRestoreConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffBulkConfirmDialog
        open={bulkActiveTarget != null}
        onOpenChange={(open) => {
          if (!open) setBulkActiveTarget(null);
        }}
        action="active"
        count={bulkActiveTarget?.length ?? 0}
        onConfirm={handleBulkActiveConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffBulkConfirmDialog
        open={bulkUnactiveTarget != null}
        onOpenChange={(open) => {
          if (!open) setBulkUnactiveTarget(null);
        }}
        action="unactive"
        count={bulkUnactiveTarget?.length ?? 0}
        onConfirm={handleBulkUnactiveConfirm}
        loading={bulkStaffMutation.isPending}
      />

      <StaffBulkConfirmDialog
        open={bulkPurgeTarget != null}
        onOpenChange={(open) => {
          if (!open) setBulkPurgeTarget(null);
        }}
        action="purge"
        count={bulkPurgeTarget?.length ?? 0}
        onConfirm={handleBulkPurgeConfirm}
        loading={bulkStaffMutation.isPending}
      />
    </AdminPageSection>
  );
}

export default function StaffPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <StaffPageInner />
    </AdminPageGuard>
  );
}
