"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  ArchiveRestore,
  Plus,
  Shield,
  Trash2,
} from "lucide-react"
import { toast } from "@ui/components/sonner"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/card"
import { AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { Tabs, TabsContent } from "@ui/components/tabs"
import {
  canUserAccess,
  isSuperAdminRoleCode,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { AdminConfirmActionDialog } from "@ui/components/admin"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import { useRbacCatalog } from "@workspace/admin-app/hooks/queries"
import type { RbacPermission } from "@workspace/api-client"
import { permissionLabelVi } from "../shared/permission-labels"
import { buildRolesFilterQuery, mapRoleRow, type RoleRow } from "../shared/utils"
import { getRbacColumns } from "../_table/columns"
import {
  EMPTY_ROLE_FORM,
  resolveAvailableRolePresets,
  roleCodeify,
  type RoleFormState,
} from "../permissions"
import { RbacCreateRoleDialog } from "../_alert-dialog"
import { useAdminAuth as useAuth, useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { ADMIN_ALERT_DIALOG_CONTENT_CLASS } from "@ui/lib/layout-shell"
import { canEditSuperAdminRole } from "@workspace/admin-app/config/protected-admin"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { createBulkOperationToast } from "@ui/lib/admin-operation-toast"
type PagedResult<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export default function RbacPage() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("rbac")
  const queryClient = useQueryClient()
  const { user: session } = useAuth()
  const canReadRbac =
    session != null && canUserAccess(session, PERMISSION_CODES.ROLES_VIEW)
  const canManageRoles =
    session != null &&
    (session.roles.some((role) => isSuperAdminRoleCode(role.name)) ||
      session.permissions.includes(PERMISSION_CODES.ROLES_CREATE) ||
      session.permissions.includes(PERMISSION_CODES.ROLES_UPDATE) ||
      session.permissions.includes(PERMISSION_CODES.ROLES_DELETE) ||
      session.permissions.includes(PERMISSION_CODES.ROLES_MANAGE))
  const canEditProtectedSuperAdmin = canEditSuperAdminRole(session?.email)

  const permissionCatalog = useRbacCatalog({
    enabled: Boolean(session) && canReadRbac,
  })
  const fallbackPermissions = useMemo(() => {
    const result: RbacPermission[] = []
    let idx = 0
    for (const value of Object.values(PERMISSION_CODES)) {
      if (typeof value !== "string") continue
      if (value === PERMISSION_CODES.ALL) continue
      if (value.includes(".")) continue
      idx++
      result.push({
        id: idx,
        code: value,
        name: permissionLabelVi(value),
        description: null,
      })
    }
    return result.sort((a, b) => a.code.localeCompare(b.code))
  }, [])
  const permissions = useMemo(() => {
    const catalogPermissions = permissionCatalog.data?.permissions ?? []
    if (catalogPermissions.length > 0) {
      return catalogPermissions
        .map((permission) => ({
          ...permission,
          name: permission.name || permissionLabelVi(permission.code),
        }))
        .sort((a, b) => a.code.localeCompare(b.code))
    }
    return fallbackPermissions
  }, [fallbackPermissions, permissionCatalog.data?.permissions])
  const availablePermissionCodes = useMemo(
    () => new Set(permissions.map((permission) => permission.code)),
    [permissions]
  )
  const availableRolePresets = useMemo(
    () => resolveAvailableRolePresets(availablePermissionCodes),
    [availablePermissionCodes]
  )

  const [tab, setTab] = useState<"list" | "trash">("list")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [trashPage, setTrashPage] = useState(1)
  const [trashPageSize, setTrashPageSize] = useState(15)
  const [globalFilter, setGlobalFilter] = useState("")
  const [trashGlobalFilter, setTrashGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [trashColumnFilters, setTrashColumnFilters] =
    useState<ColumnFiltersState>([])
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({})
  const [trashSelectedRowIds, setTrashSelectedRowIds] =
    useState<RowSelectionState>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<RoleFormState>(EMPTY_ROLE_FORM)
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<RoleRow | null>(null)
  const [purgeTarget, setPurgeTarget] = useState<RoleRow | null>(null)

  const debouncedQ = useDebouncedValue(globalFilter, 300)
  const debouncedTrashQ = useDebouncedValue(trashGlobalFilter, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, pageSize, columnFilters])

  useEffect(() => {
    setTrashPage(1)
  }, [debouncedTrashQ, trashPageSize, trashColumnFilters])

  const listFilters = useMemo(
    () => buildRolesFilterQuery(columnFilters),
    [columnFilters]
  )
  const trashFilters = useMemo(
    () => buildRolesFilterQuery(trashColumnFilters),
    [trashColumnFilters]
  )

  const fetchRoles = async (params: {
    page: number
    limit: number
    search?: string
    status: string
    filters?: Record<string, string>
  }): Promise<PagedResult<RoleRow>> => {
    const result = await api.roles.list<Record<string, unknown>>({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      filters: params.filters,
    })
    const items = result.items.map((row) => mapRoleRow(row))
    return {
      items,
      total: result.total,
      page: result.page ?? params.page,
      limit: result.limit ?? params.limit,
    }
  }

  const listQuery = useQuery({
    queryKey: [
      "rbac",
      "roles",
      "list",
      page,
      pageSize,
      debouncedQ,
      listFilters,
    ],
    queryFn: (): Promise<PagedResult<RoleRow>> =>
      fetchRoles({
        page,
        limit: pageSize,
        search: debouncedQ.trim() || undefined,
        status: "active",
        filters: listFilters,
      }),
    enabled: Boolean(session) && canReadRbac && tab === "list",
  })

  const trashQuery = useQuery({
    queryKey: [
      "rbac",
      "roles",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      trashFilters,
    ],
    queryFn: (): Promise<PagedResult<RoleRow>> =>
      fetchRoles({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters: trashFilters,
      }),
    enabled: Boolean(session) && canReadRbac && tab === "trash",
  })

  const invalidateRoles = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles", "list"] }),
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles", "trash"] }),
      queryClient.invalidateQueries({ queryKey: ["rbac", "catalog"] }),
    ])
  }, [queryClient])

  const createMutation = useAdminMutation({
    mutationKey: ["rbac", "create"],
    toast: {
      loading: "Đang tạo vai trò…",
      success: "Đã tạo vai trò thành công",
      error: (error) =>
        error instanceof Error ? error.message : "Không lưu được role",
    },
    mutationFn: async (input: RoleFormState) =>
      api.roles.create<RoleRow>({
        name: input.code,
        displayName: input.name,
        description: input.description || null,
        isActive: input.isActive,
        permissions: input.permissions,
      }),
    onSuccess: invalidateRoles,
  })

  const deleteMutation = useAdminMutation({
    mutationKey: ["rbac", "delete"],
    toast: {
      loading: "Đang xóa vai trò…",
      success: "Đã xóa vai trò thành công",
      error: (error) =>
        error instanceof Error ? error.message : "Không xóa được vai trò",
    },
    mutationFn: async (id: string) => api.roles.remove(id),
    onSuccess: invalidateRoles,
  })
  const restoreMutation = useAdminMutation({
    mutationKey: ["rbac", "restore"],
    toast: {
      loading: "Đang khôi phục vai trò…",
      success: "Đã khôi phục vai trò thành công",
      error: (error) =>
        error instanceof Error ? error.message : "Không khôi phục được vai trò",
    },
    mutationFn: async (id: string) => api.roles.restore(id),
    onSuccess: invalidateRoles,
  })
  const purgeMutation = useAdminMutation({
    mutationKey: ["rbac", "purge"],
    toast: {
      loading: "Đang xóa vĩnh viễn vai trò…",
      success: "Đã xóa vĩnh viễn vai trò thành công",
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Không xóa vĩnh viễn được vai trò",
    },
    mutationFn: async (id: string) => api.roles.purge(id),
    onSuccess: invalidateRoles,
  })
  const bulkMutation = useAdminMutation({
    mutationKey: ["rbac", "bulk"],
    toast: createBulkOperationToast("vai trò"),
    mutationFn: async ({ action, ids }: { action: string; ids: string[] }) =>
      api.roles.bulk({ action, ids }),
    onSuccess: invalidateRoles,
  })

  const listItems = useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data?.items]
  )
  const trashItems = useMemo(
    () => trashQuery.data?.items ?? [],
    [trashQuery.data?.items]
  )

  const openCreateDialog = () => {
    setForm(EMPTY_ROLE_FORM)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const code = roleCodeify(form.code || form.name)
    const name = form.name.trim()
    if (!code) {
      toast.error("Mã vai trò không hợp lệ")
      return
    }
    if (!name) {
      toast.error("Tên vai trò là bắt buộc")
      return
    }

    const payload: RoleFormState = {
      ...form,
      code,
      name,
      description: form.description.trim(),
    }
    const created = await createMutation.mutateAsync(payload)
    setDialogOpen(false)
    crudNav.view(String(created.id))
  }

  const columns = useMemo(
    () =>
      getRbacColumns({
        view: "list",
        onView: (role) => crudNav.view(String(role.id)),
        onEdit: (role) => {
          if (isSuperAdminRoleCode(role.code) && !canEditProtectedSuperAdmin) {
            toast.error(
              "Chỉ tài khoản trong NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS mới được chỉnh sửa vai trò Super Admin."
            )
            return
          }
          crudNav.edit(String(role.id))
        },
        onDelete: (role) => {
          if (isSuperAdminRoleCode(role.code)) {
            toast.error(
              "Vai trò Super Admin là vai trò hệ thống, không thể xóa."
            )
            return
          }
          setDeleteTarget(role)
        },
        onPurge: (role) => {
          if (isSuperAdminRoleCode(role.code)) {
            toast.error(
              "Vai trò Super Admin là vai trò hệ thống, không thể xóa."
            )
            return
          }
          setPurgeTarget(role)
        },
        onRestore: () => {},
        canManageRoles,
        canEditSuperAdminRole: canEditProtectedSuperAdmin,
      }),
    [canEditProtectedSuperAdmin, canManageRoles, crudNav]
  )

  const trashColumns = useMemo(
    () =>
      getRbacColumns({
        view: "trash",
        onView: (role) => crudNav.view(String(role.id)),
        onEdit: () => {},
        onDelete: () => {},
        onRestore: (role) => setRestoreTarget(role),
        onPurge: (role) => {
          if (isSuperAdminRoleCode(role.code)) {
            toast.error(
              "Vai trò Super Admin là vai trò hệ thống, không thể xóa."
            )
            return
          }
          setPurgeTarget(role)
        },
        canManageRoles,
        canEditSuperAdminRole: canEditProtectedSuperAdmin,
      }),
    [canEditProtectedSuperAdmin, canManageRoles, crudNav]
  )

  if (!session) return null

  if (!canReadRbac) {
    return (
      <AdminPageGuard roles={["super_admin"]}>
        <AdminPageSection>
          <AdminListPageHeader title="Phân quyền" icon={Shield} />
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <CardTitle className="text-base">
                  Không có quyền truy cập
                </CardTitle>
                <CardDescription className="mt-1">
                  Cần quyền <span className="font-mono text-xs">rbac.read</span>
                  .
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </AdminPageSection>
      </AdminPageGuard>
    )
  }

  return (
    <AdminPageGuard roles={["super_admin"]}>
      <AdminPageSection>
        <AdminListPageHeader
          title="Phân quyền"
          subtitle="Quản lý vai trò bằng bảng dùng chung, đầy đủ luồng tạo/sửa/xóa/khôi phục/Xóa vĩnh viễn."
          icon={Shield}
          actions={
            canManageRoles ? (
              <AdminPageHeaderPrimaryButton onClick={openCreateDialog}>
                <Plus className="size-4" />
                Tạo role
              </AdminPageHeaderPrimaryButton>
            ) : null
          }
        />

        <Tabs
          value={tab}
          onValueChange={(value) =>
            value === "list" || value === "trash" ? setTab(value) : null
          }
        >
          <AdminListTabsList>
            <AdminListTabsTrigger value="list" >
              Danh sách
              <AdminTabCountBadge count={listQuery.data?.total ?? 0} />
            </AdminListTabsTrigger>
            <AdminListTabsTrigger value="trash" >
              Thùng rác
              <AdminTabCountBadge count={trashQuery.data?.total ?? 0} />
            </AdminListTabsTrigger>
          </AdminListTabsList>

          <TabsContent value="list" className="mt-4 space-y-4">
            <AdminDataTable<RoleRow>
              tableScope="rbac"
              data={listItems}
              getRowId={(row) => row.id}
              columns={columns}
              isLoading={listQuery.isLoading || permissionCatalog.isLoading}
              emptyLabel="Chưa có vai trò."
              manualFiltering
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              globalFilterPlaceholder="Tìm theo tên, mã role..."
              onClearFilters={() => {
                setGlobalFilter("")
                setColumnFilters([])
              }}
              {...(canManageRoles
                ? adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)
                : {})}
              canSelectRow={(row) => !isSuperAdminRoleCode(row.original.code)}
              bulkActions={
                canManageRoles
                  ? [
                      {
                        id: "bulk-delete",
                        label: "Xóa tạm đã chọn",
                        variant: "destructive",
                        onAction: async (rows) => {
                          await bulkMutation.mutateAsync({
                            action: "delete",
                            ids: rows.map((row) => row.id),
                          })
                        },
                      },
                      {
                        id: "bulk-purge",
                        label: "Xóa vĩnh viễn đã chọn",
                        variant: "destructive",
                        onAction: async (rows) => {
                          await bulkMutation.mutateAsync({
                            action: "hard-delete",
                            ids: rows.map((row) => row.id),
                          })
                        },
                      },
                    ]
                  : []
              }
              xlsxExport={buildAdminTableXlsxExport("rbac", {
                pageCount: listItems.length,
                total: listQuery.data?.total ?? 0,
              })}
              exportFetchPage={async ({ page: exportPage, limit }) => {
                const result = await fetchRoles({
                  page: exportPage,
                  limit,
                  search: debouncedQ.trim() || undefined,
                  status: "active",
                  filters: listFilters,
                })
                return { items: result.items, total: result.total }
              }}
              pagination={{
                page,
                pageSize,
                total: listQuery.data?.total ?? 0,
                appliedPage: listQuery.data?.page,
                appliedPageSize: listQuery.data?.limit,
                isLoading: listQuery.isLoading,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
                emptySummary: "Không có vai trò",
                itemLabel: "vai trò",
              }}
            />
          </TabsContent>

          <TabsContent value="trash" className="mt-4">
            <AdminDataTable<RoleRow>
              tableScope="rbac-trash"
              data={trashItems}
              getRowId={(row) => row.id}
              columns={trashColumns}
              isLoading={trashQuery.isLoading}
              emptyLabel="Thùng rác trống."
              manualFiltering
              columnFilters={trashColumnFilters}
              onColumnFiltersChange={setTrashColumnFilters}
              globalFilter={trashGlobalFilter}
              onGlobalFilterChange={setTrashGlobalFilter}
              globalFilterPlaceholder="Tìm trong thùng rác..."
              onClearFilters={() => {
                setTrashGlobalFilter("")
                setTrashColumnFilters([])
              }}
              {...(canManageRoles
                ? adminTableRowSelectionProps(
                    trashSelectedRowIds,
                    setTrashSelectedRowIds
                  )
                : {})}
              canSelectRow={(row) => !isSuperAdminRoleCode(row.original.code)}
              bulkActions={
                canManageRoles
                  ? [
                      {
                        id: "bulk-restore",
                        label: "Khôi phục đã chọn",
                        onAction: async (rows) => {
                          await bulkMutation.mutateAsync({
                            action: "restore",
                            ids: rows.map((row) => row.id),
                          })
                        },
                      },
                      {
                        id: "bulk-purge",
                        label: "Xóa vĩnh viễn đã chọn",
                        variant: "destructive",
                        onAction: async (rows) => {
                          await bulkMutation.mutateAsync({
                            action: "hard-delete",
                            ids: rows.map((row) => row.id),
                          })
                        },
                      },
                    ]
                  : []
              }
              xlsxExport={buildAdminTableXlsxExport("rbac-trash", {
                pageCount: trashItems.length,
                total: trashQuery.data?.total ?? 0,
              })}
              exportFetchPage={async ({ page: exportPage, limit }) => {
                const result = await fetchRoles({
                  page: exportPage,
                  limit,
                  search: debouncedTrashQ.trim() || undefined,
                  status: "deleted",
                  filters: trashFilters,
                })
                return { items: result.items, total: result.total }
              }}
              pagination={{
                page: trashPage,
                pageSize: trashPageSize,
                total: trashQuery.data?.total ?? 0,
                appliedPage: trashQuery.data?.page,
                appliedPageSize: trashQuery.data?.limit,
                isLoading: trashQuery.isLoading,
                onPageChange: setTrashPage,
                onPageSizeChange: setTrashPageSize,
                emptySummary: "Không có vai trò trong thùng rác",
                itemLabel: "vai trò",
              }}
            />
          </TabsContent>
        </Tabs>

        <RbacCreateRoleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          form={form}
          onFormChange={setForm}
          permissions={permissions}
          presets={availableRolePresets}
          onSave={handleSave}
          saving={createMutation.isPending}
        />

        <AdminConfirmActionDialog
          open={deleteTarget != null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Xóa role?"
          description={
            deleteTarget
              ? `Role "${deleteTarget.name}" sẽ được xóa tạm và chuyển vào thùng rác.`
              : undefined
          }
          icon={<Trash2 className="size-4 text-destructive" />}
          confirmLabel="Xóa tạm"
          confirmDestructive
          onConfirm={async () => {
            if (!deleteTarget) return
            await deleteMutation.mutateAsync(deleteTarget.id)
          }}
          contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
        />

        <AdminConfirmActionDialog
          open={restoreTarget != null}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          title="Khôi phục role?"
          description={
            restoreTarget
              ? `Role "${restoreTarget.name}" sẽ quay lại danh sách hoạt động.`
              : undefined
          }
          icon={<ArchiveRestore className="size-4 text-primary" />}
          confirmLabel="Khôi phục"
          onConfirm={async () => {
            if (!restoreTarget) return
            await restoreMutation.mutateAsync(restoreTarget.id)
          }}
          contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
        />

        <AdminConfirmActionDialog
          open={purgeTarget != null}
          onOpenChange={(open) => !open && setPurgeTarget(null)}
          title="Xóa vĩnh viễn role?"
          description={
            purgeTarget
              ? `Role "${purgeTarget.name}" sẽ bị xóa vĩnh viễn và không thể hoàn tác.`
              : undefined
          }
          icon={<Trash2 className="size-4 text-destructive" />}
          confirmLabel="Xóa vĩnh viễn"
          confirmDestructive
          onConfirm={async () => {
            if (!purgeTarget) return
            await purgeMutation.mutateAsync(purgeTarget.id)
          }}
          contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
        />
      </AdminPageSection>
    </AdminPageGuard>
  )
}
