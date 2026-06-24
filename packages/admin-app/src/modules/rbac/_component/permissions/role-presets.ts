import { PERMISSION_CODES } from "@workspace/api-client"

export type RoleFormState = {
  id: string | null
  code: string
  name: string
  description: string
  isActive: boolean
  permissions: string[]
}

export type RolePreset = {
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

export const ROLE_PRESETS: RolePreset[] = [
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
      "accounts:update"
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

export const EMPTY_ROLE_FORM: RoleFormState = {
  id: null,
  code: "",
  name: "",
  description: "",
  isActive: true,
  permissions: [],
}

export function roleCodeify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export function resolveAvailableRolePresets(
  availablePermissionCodes: ReadonlySet<string>
): RolePreset[] {
  return ROLE_PRESETS.map((preset) => ({
    ...preset,
    permissions: preset.permissions.filter((permission) =>
      availablePermissionCodes.has(permission)
    ),
  })).filter((preset) => {
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
  })
}
