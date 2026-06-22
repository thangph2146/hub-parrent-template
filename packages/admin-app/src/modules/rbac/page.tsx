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
  Loader2,
  Plus,
  Shield,
  Trash2,
} from "lucide-react"
import { toast } from "@ui/components/sonner"
import { Button } from "@ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/card"
import { Checkbox } from "@ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
  AdminTabCountBadge, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { ScrollArea } from "@ui/components/scroll-area"
import { Switch } from "@ui/components/switch"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { Textarea } from "@ui/components/textarea"
import { TypographyPSmallMuted } from "@ui/components/typography"
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
import { api, type RbacPermission } from "@workspace/admin-app/lib/api"
import {
  permissionGroupKey,
  permissionGroupLabelVi,
  permissionLabelVi,
} from "@workspace/admin-app/lib/permission-labels"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import {
  ADMIN_ALERT_DIALOG_CONTENT_CLASS,
  ADMIN_DIALOG_CONTENT_LG_CLASS,
} from "@ui/lib/layout-shell"
import { canEditSuperAdminRole } from "@workspace/admin-app/config/protected-admin"
import { getRbacColumns } from "./_component/columns"
import {
  buildRolesFilterQuery,
  mapRoleRow,
  type RoleRow,
} from "./_component/utils"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { defaultBulkOperationToast } from "@ui/lib/admin-operation-toast"
type PagedResult<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

type RoleFormState = {
  id: string | null
  code: string
  name: string
  description: string
  isActive: boolean
  permissions: string[]
}

type RolePreset = {
  label: string
  code: string
  name: string
  description: string
  permissions: string[]
}

const ALL_PERMISSION_CODES: string[] = Object.values(PERMISSION_CODES).filter(
  (code) => code.includes(":")
)

function uniquePermissionCodes(...groups: ReadonlyArray<readonly string[]>): string[] {
  return [...new Set(groups.flat())]
}

function permissionsByResource(...resources: ReadonlyArray<string>): string[] {
  const allowed = new Set(resources)
  return ALL_PERMISSION_CODES.filter((permission) => {
    const [resource] = permission.split(":")
    return resource ? allowed.has(resource) : false
  })
}

function permissionsByCode(...permissions: ReadonlyArray<string>): string[] {
  const allowed = new Set(permissions)
  return ALL_PERMISSION_CODES.filter((permission) => allowed.has(permission))
}

function withoutPermissions(
  permissions: readonly string[],
  ...blocked: ReadonlyArray<string>
): string[] {
  const blockedSet = new Set(blocked)
  return permissions.filter((permission) => !blockedSet.has(permission))
}

const SELF_SERVICE_PRESET_PERMISSIONS = permissionsByCode(
  "dashboard:view",
  "accounts:view",
  "accounts:update"
)

const CONTENT_PRESET_PERMISSIONS = permissionsByResource(
  "posts",
  "categories",
  "tags",
  "comments",
  "page_contents",
  "seo_metas",
  "uploads"
)

const COMMUNICATION_PRESET_PERMISSIONS = permissionsByResource(
  "contact_requests",
  "groups",
  "messages",
  "notifications"
)

const ACADEMIC_PRESET_PERMISSIONS = permissionsByResource(
  "students",
  "parent_students",
  "admission_results",
  "imported_users",
  "training_levels",
  "training_systems",
  "majors",
  "courses",
  "academic_years",
  "departments"
)

const EVENT_PRESET_PERMISSIONS = permissionsByResource(
  "events",
  "event_registrations",
  "event_checkins",
  "event_checkouts",
  "event_speakers",
  "speakers",
  "locations",
  "cameras",
  "templates",
  "screens",
  "face_data"
)

const STORE_PRESET_PERMISSIONS = permissionsByResource(
  "products",
  "orders",
  "promo_codes"
)

const SYSTEM_PRESET_PERMISSIONS = permissionsByResource("settings", "system")

const ADMIN_PRESET_PERMISSIONS = withoutPermissions(
  uniquePermissionCodes(
    SELF_SERVICE_PRESET_PERMISSIONS,
    permissionsByResource("users", "sessions"),
    permissionsByCode("roles:view", "roles:export"),
    CONTENT_PRESET_PERMISSIONS,
    COMMUNICATION_PRESET_PERMISSIONS,
    ACADEMIC_PRESET_PERMISSIONS,
    EVENT_PRESET_PERMISSIONS,
    STORE_PRESET_PERMISSIONS,
    SYSTEM_PRESET_PERMISSIONS
  ),
  "users:hard-delete",
  "roles:delete",
  "roles:manage",
  "roles:restore",
  "system:delete"
)

const MANAGER_PRESET_PERMISSIONS = withoutPermissions(
  uniquePermissionCodes(
    SELF_SERVICE_PRESET_PERMISSIONS,
    permissionsByCode("users:view", "users:export"),
    CONTENT_PRESET_PERMISSIONS,
    COMMUNICATION_PRESET_PERMISSIONS,
    ACADEMIC_PRESET_PERMISSIONS,
    EVENT_PRESET_PERMISSIONS,
    STORE_PRESET_PERMISSIONS,
    permissionsByCode("settings:view", "settings:update", "settings:export")
  ),
  "comments:approve",
  "users:delete",
  "users:hard-delete",
  "students:delete",
  "parent_students:delete",
  "system:delete",
  "face_data:hard-delete",
  "event_registrations:hard-delete",
  "event_checkins:hard-delete",
  "seo_metas:hard-delete",
  "categories:hard-delete",
  "groups:hard-delete"
)

const ROLE_PRESETS: RolePreset[] = [
  {
    label: "Super Admin",
    code: "super_admin",
    name: "Super Admin",
    description: "Toàn quyền hệ thống — bao phủ toàn bộ catalog permission hiện tại",
    permissions: ALL_PERMISSION_CODES,
  },
  {
    label: "Admin",
    code: "admin",
    name: "Admin",
    description: "Quản trị vận hành — đủ quyền nghiệp vụ, hạn chế thao tác phá hủy cấp hệ thống/RBAC",
    permissions: ADMIN_PRESET_PERMISSIONS,
  },
  {
    label: "Quản lý",
    code: "manager",
    name: "Quản lý vận hành",
    description: "Quản lý nội dung, học vụ, sự kiện và thương mại; không có quyền RBAC nhạy cảm",
    permissions: MANAGER_PRESET_PERMISSIONS,
  },
  {
    label: "Phụ huynh",
    code: "parent",
    name: "Phụ huynh",
    description: "Tài khoản phụ huynh — liên kết và theo dõi học sinh",
    permissions: permissionsByCode(
      "dashboard:view",
      "students:view_own",
      "parent_students:view",
      "parent_students:create",
      "notifications:view_own",
      "messages:view_own",
      "posts:view",
      "accounts:view",
      "accounts:update"
    ),
  },
  {
    label: "Biên tập viên",
    code: "editor",
    name: "Biên tập viên",
    description: "Biên tập nội dung — bài viết, trang nội dung, SEO, danh mục, media và liên hệ",
    permissions: uniquePermissionCodes(
      SELF_SERVICE_PRESET_PERMISSIONS,
      CONTENT_PRESET_PERMISSIONS,
      permissionsByResource("contact_requests")
    ),
  },
  {
    label: "BTC sự kiện",
    code: "event_staff",
    name: "Ban tổ chức sự kiện",
    description: "Vận hành check-in, đăng ký, camera, màn hình, địa điểm và nội dung sự kiện",
    permissions: uniquePermissionCodes(
      SELF_SERVICE_PRESET_PERMISSIONS,
      EVENT_PRESET_PERMISSIONS,
      permissionsByResource("categories", "tags", "page_contents", "posts", "seo_metas", "uploads"),
      permissionsByCode("settings:view", "settings:manage")
    ),
  },
  {
    label: "Kinh doanh",
    code: "sales",
    name: "Kinh doanh",
    description: "Vận hành sản phẩm, đơn hàng, mã khuyến mãi và liên hệ khách hàng",
    permissions: uniquePermissionCodes(
      SELF_SERVICE_PRESET_PERMISSIONS,
      permissionsByCode("users:view"),
      permissionsByResource("products", "orders", "promo_codes", "contact_requests")
    ),
  },
  {
    label: "Giao vận",
    code: "shipper",
    name: "Giao vận",
    description: "Theo dõi và cập nhật đơn hàng được giao",
    permissions: uniquePermissionCodes(
      SELF_SERVICE_PRESET_PERMISSIONS,
      permissionsByCode(
        "orders:view",
        "orders:update",
        "orders:export",
        "products:view",
        "contact_requests:view"
      )
    ),
  },
  {
    label: "Nhân viên hỗ trợ",
    code: "support_staff",
    name: "Nhân viên hỗ trợ",
    description: "Xem, phân công, cập nhật và xuất yêu cầu liên hệ hỗ trợ",
    permissions: permissionsByCode(
      "contact_requests:view",
      "contact_requests:create",
      "contact_requests:update",
      "contact_requests:assign",
      "contact_requests:manage",
      "contact_requests:export",
      "contact_requests:restore",
      "accounts:view",
      "accounts:update",
      "dashboard:view"
    ),
  },
  {
    label: "Sinh viên",
    code: "student",
    name: "Sinh viên",
    description:
      "Tài khoản sinh viên — xem thông tin cá nhân, thông báo và bài viết",
    permissions: permissionsByCode(
      "dashboard:view",
      "students:view_own",
      "notifications:view_own",
      "messages:view_own",
      "posts:view",
      "accounts:view",
      "accounts:update",
    ),
  },
]

const ROLE_PRESET_REQUIRED_PERMISSIONS: Record<string, string[]> = {
  event_staff: ["events:view", "event_checkins:view", "event_registrations:view"],
  sales: ["products:view", "orders:view", "promo_codes:view"],
  shipper: ["orders:view", "orders:update"],
  parent: ["parent_students:view", "students:view_own"],
  student: ["students:view_own", "students:view"],
}

const EMPTY_FORM: RoleFormState = {
  id: null,
  code: "",
  name: "",
  description: "",
  isActive: true,
  permissions: [],
}

function roleCodeify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export default function RbacPage() {
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
    () =>
      ROLE_PRESETS.map((preset) => ({
        ...preset,
        permissions: preset.permissions.filter((permission) =>
          availablePermissionCodes.has(permission)
        ),
      })).filter(
        (preset) => {
          const required = ROLE_PRESET_REQUIRED_PERMISSIONS[preset.code]
          if (required?.length) {
            return required.some((permission) =>
              availablePermissionCodes.has(permission)
            )
          }
          return (
            preset.permissions.length > 0 ||
            ["super_admin", "admin"].includes(preset.code)
          )
        }
      ),
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
  const [permissionSearch, setPermissionSearch] = useState("")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [form, setForm] = useState<RoleFormState>(EMPTY_FORM)
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
    mutationFn: async (id: string) =>
      api.roles.bulk({ action: "delete", ids: [id] }),
    onSuccess: invalidateRoles,
  })
  const restoreMutation = useAdminMutation({
    mutationKey: ["rbac", "restore"],
    mutationFn: async (id: string) => api.roles.restore(id),
    onSuccess: invalidateRoles,
  })
  const purgeMutation = useAdminMutation({
    mutationKey: ["rbac", "purge"],
    mutationFn: async (id: string) => api.roles.purge(id),
    onSuccess: invalidateRoles,
  })
  const bulkMutation = useAdminMutation({
    mutationKey: ["rbac", "bulk"],
    toast: defaultBulkOperationToast,
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

  const visiblePermissions = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase()
    let filtered = permissions
    if (showSelectedOnly) {
      const selected = new Set(form.permissions)
      filtered = filtered.filter((p) => selected.has(p.code))
    }
    if (q) {
      filtered = filtered.filter((permission) =>
        [
          permission.code,
          permissionLabelVi(permission.code),
          permission.description ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    }
    return filtered
  }, [permissionSearch, permissions, showSelectedOnly, form.permissions])

  const permissionGroups = useMemo(() => {
    const buckets = new Map<string, RbacPermission[]>()
    for (const permission of visiblePermissions) {
      const key = permissionGroupKey(permission.code)
      const arr = buckets.get(key)
      if (arr) arr.push(permission)
      else buckets.set(key, [permission])
    }
    return Array.from(buckets.entries())
      .map(([key, items]) => ({
        key,
        label: permissionGroupLabelVi(key),
        items: [...items].sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [visiblePermissions])

  const openCreateDialog = () => {
    setForm(EMPTY_FORM)
    setPermissionSearch("")
    setShowSelectedOnly(false)
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className={`${ADMIN_DIALOG_CONTENT_LG_CLASS} sm:max-w-7xl`}
          >
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Cập nhật role" : "Tạo role mới"}
              </DialogTitle>
              <DialogDescription>
                Thiết lập thông tin vai trò và chọn permission phù hợp.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mã vai trò</Label>
                  <Input
                    value={form.code}
                    placeholder="content_editor"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        code: roleCodeify(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên hiển thị</Label>
                  <Input
                    value={form.name}
                    placeholder="Biên tập nội dung"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                        code: current.code || roleCodeify(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Mô tả rõ vai trò này phục vụ bộ phận nào..."
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">Kích hoạt ngay</div>
                    <TypographyPSmallMuted>
                      Nếu tắt, role tạo ra ở trạng thái không hoạt động.
                    </TypographyPSmallMuted>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, isActive: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bắt đầu từ mẫu</Label>
                <div className="flex flex-wrap gap-2">
                  {availableRolePresets.map((preset) => (
                    <Button
                      key={preset.code}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      title={
                        preset.permissions.length === 0
                          ? "Role này không cần permission — quyền truy cập dựa trên tên role"
                          : `Chọn ${preset.permissions.length} permission`
                      }
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          code: current.code || preset.code,
                          name: current.name || preset.name,
                          description:
                            current.description || preset.description,
                          permissions: [
                            ...new Set([
                              ...current.permissions,
                              ...preset.permissions,
                            ]),
                          ],
                        }))
                      }
                    >
                      {preset.label}
                      {preset.permissions.length > 0 && (
                        <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] text-primary">
                          {preset.permissions.length}
                        </span>
                      )}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-xs text-muted-foreground"
                    onClick={() =>
                      setForm((current) => ({ ...current, permissions: [] }))
                    }
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="mb-0">
                    Permission ({form.permissions.length}/{permissions.length})
                  </Label>
                  <Button
                    type="button"
                    variant={showSelectedOnly ? "default" : "outline"}
                    size="sm"
                    className="h-7 rounded-lg text-xs"
                    onClick={() => setShowSelectedOnly((prev) => !prev)}
                  >
                    {showSelectedOnly ? "Hiện tất cả" : "Chỉ đã chọn"}
                  </Button>
                </div>
                <Input
                  value={permissionSearch}
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Tìm permission..."
                />
                <ScrollArea className="h-[calc(100vh-600px)] rounded-lg border border-border/60 bg-muted/10">
                  <div className="space-y-3 p-3">
                    {permissionGroups.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        Không có permission khớp tìm kiếm.
                      </p>
                    ) : (
                      permissionGroups.map((group) => {
                        const selectedInGroup = group.items.filter((p) =>
                          form.permissions.includes(p.code)
                        ).length
                        const pct =
                          group.items.length > 0
                            ? Math.round(
                                (selectedInGroup / group.items.length) * 100
                              )
                            : 0
                        return (
                          <section
                            key={group.key}
                            className="overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm"
                            aria-labelledby={`perm-group-${group.key}`}
                          >
                            <header
                              id={`perm-group-${group.key}`}
                              className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-3 py-2"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Checkbox
                                  checked={
                                    selectedInGroup === group.items.length &&
                                    group.items.length > 0
                                  }
                                  onCheckedChange={(checked) => {
                                    const codes = group.items.map((p) => p.code)
                                    setForm((current) => ({
                                      ...current,
                                      permissions:
                                        checked === true
                                          ? [
                                              ...new Set([
                                                ...current.permissions,
                                                ...codes,
                                              ]),
                                            ]
                                          : current.permissions.filter(
                                              (p) => !codes.includes(p)
                                            ),
                                    }))
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    {group.key}
                                  </p>
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {group.label}
                                  </p>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted-foreground/20 sm:block">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="rounded-md border border-border/60 bg-background/90 px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                                  {selectedInGroup}/{group.items.length}
                                </span>
                              </div>
                            </header>
                            <div className="grid gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
                              {group.items.map((permission) => {
                                const isSelected = form.permissions.includes(
                                  permission.code
                                )
                                return (
                                  <label
                                    key={permission.code}
                                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors ${
                                      isSelected
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-border/60 bg-background/90 hover:border-border hover:bg-muted/30"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) =>
                                        setForm((current) => ({
                                          ...current,
                                          permissions:
                                            checked === true
                                              ? [
                                                  ...new Set([
                                                    ...current.permissions,
                                                    permission.code,
                                                  ]),
                                                ]
                                              : current.permissions.filter(
                                                  (item) =>
                                                    item !== permission.code
                                                ),
                                        }))
                                      }
                                    />
                                    <span className="min-w-0 leading-tight">
                                      <span className="block text-sm font-medium">
                                        {permissionLabelVi(permission.code)}
                                      </span>
                                      <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                        {permission.code}
                                      </span>
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </section>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="mr-auto rounded-lg"
                onClick={() => setDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="rounded-lg"
                onClick={() => void handleSave()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Tạo role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          confirmLoading={deleteMutation.isPending}
          onConfirm={async () => {
            if (!deleteTarget) return
            await deleteMutation.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
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
          confirmLoading={restoreMutation.isPending}
          onConfirm={async () => {
            if (!restoreTarget) return
            await restoreMutation.mutateAsync(restoreTarget.id)
            setRestoreTarget(null)
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
          confirmLoading={purgeMutation.isPending}
          onConfirm={async () => {
            if (!purgeTarget) return
            await purgeMutation.mutateAsync(purgeTarget.id)
            setPurgeTarget(null)
          }}
          contentClassName={ADMIN_ALERT_DIALOG_CONTENT_CLASS}
        />
      </AdminPageSection>
    </AdminPageGuard>
  )
}
