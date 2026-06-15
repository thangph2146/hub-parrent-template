import { PERMISSION_CODES } from "@workspace/api-client"
import type { PermissionCode } from "@workspace/api-client"

/** Menu metadata (icon = tên Lucide) — dùng cho sync check-in menu. */
export type AdminMenuLeafData = {
  href: string
  label: string
  icon: string
  permission: PermissionCode | null
  anyPermission?: PermissionCode[]
  roleGuard?: string
  adminOnly?: boolean
}

export type AdminMenuTreeItemData =
  | ({ type: "leaf" } & AdminMenuLeafData)
  | {
      type: "group"
      label: string
      icon: string
      children: AdminMenuLeafData[]
    }

export const BACKEND_ADMIN_MENU_ITEMS: AdminMenuTreeItemData[] = [
  {
    type: "leaf",
    href: "/",
    label: "Tổng quan",
    icon: "LayoutDashboard",
    permission: null,
  },
  {
    type: "group",
    label: "HRM",
    icon: "Users",
    children: [
      {
        href: "/staff",
        label: "Nhân sự",
        icon: "Users",
        permission: null,
        anyPermission: [PERMISSION_CODES.USERS_MANAGE],
      },
      {
        href: "/rbac",
        label: "Phân quyền",
        icon: "ShieldCheck",
        permission: PERMISSION_CODES.ROLES_VIEW,
      },
    ],
  },
  {
    type: "group",
    label: "Sinh viên",
    icon: "FolderTree",
    children: [
      {
        href: "/my-students",
        label: "Sinh viên",
        icon: "GraduationCap",
        permission: null,
        anyPermission: [PERMISSION_CODES.STUDENTS_VIEW_OWN],
        roleGuard: "parent",
      },
      {
        href: "/parent-students",
        label: "Duyệt sinh viên",
        icon: "UserCheck",
        permission: null,
        anyPermission: [PERMISSION_CODES.USERS_MANAGE],
      },
      {
        href: "/contact-requests",
        label: "Liên hệ hỗ trợ",
        icon: "Headset",
        anyPermission: [
          PERMISSION_CODES.CONTACT_REQUESTS_VIEW,
          PERMISSION_CODES.CONTACT_REQUESTS_MANAGE,
          PERMISSION_CODES.CONTACT_REQUESTS_UPDATE,
          PERMISSION_CODES.CONTACT_REQUESTS_ASSIGN,
        ],
        permission: null,
      },
    ],
  },
  {
    type: "group",
    label: "Danh mục & Tag",
    icon: "FolderTree",
    children: [
      {
        href: "/categories",
        label: "Danh mục",
        icon: "FolderOpen",
        anyPermission: [
          PERMISSION_CODES.CATEGORIES_VIEW,
          PERMISSION_CODES.CATEGORIES_CREATE,
        ],
        permission: null,
      },
      {
        href: "/tags",
        label: "Tags",
        icon: "Tags",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.TAGS_VIEW,
          PERMISSION_CODES.TAGS_MANAGE,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "Kho hàng",
    icon: "ShoppingCart",
    children: [
      {
        href: "/products",
        label: "Sản phẩm",
        icon: "Package",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.PRODUCTS_VIEW,
          PERMISSION_CODES.PRODUCTS_MANAGE,
        ],
      },
      {
        href: "/orders",
        label: "Đơn hàng",
        icon: "ShoppingCart",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.ORDERS_VIEW,
          PERMISSION_CODES.ORDERS_MANAGE,
        ],
      },
      {
        href: "/promo-codes",
        label: "Mã khuyến mãi",
        icon: "Tags",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.PROMO_CODES_VIEW,
          PERMISSION_CODES.PROMO_CODES_MANAGE,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "Truyền thông",
    icon: "FolderTree",
    children: [
      {
        href: "/guides",
        label: "Hướng dẫn sử dụng",
        icon: "BookOpen",
        permission: PERMISSION_CODES.PAGE_CONTENTS_VIEW,
      },
      {
        href: "/posts",
        label: "Bài viết",
        icon: "FileText",
        anyPermission: [PERMISSION_CODES.POSTS_VIEW],
        permission: null,
      },
    ],
  },
  {
    type: "group",
    label: "Camera & Màn hình",
    icon: "Camera",
    children: [
      {
        href: "/cameras",
        label: "Camera",
        icon: "Camera",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.CAMERAS_VIEW,
          PERMISSION_CODES.CAMERAS_MANAGE,
        ],
      },
      {
        href: "/templates",
        label: "Mẫu hiển thị",
        icon: "LayoutTemplate",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.TEMPLATES_VIEW,
          PERMISSION_CODES.TEMPLATES_MANAGE,
        ],
      },
      {
        href: "/screens",
        label: "Màn hình",
        icon: "Monitor",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.SCREENS_VIEW,
          PERMISSION_CODES.SCREENS_MANAGE,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "Địa điểm & vị trí",
    icon: "MapPin",
    children: [
      {
        href: "/locations",
        label: "Địa điểm",
        icon: "MapPin",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.LOCATIONS_VIEW,
          PERMISSION_CODES.LOCATIONS_MANAGE,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "Sự kiện & Check-in",
    icon: "CalendarPlus",
    children: [
      {
        href: "/events",
        label: "Sự kiện",
        icon: "CalendarPlus",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: "/speakers",
        label: "Diễn giả",
        icon: "Mic",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.SPEAKERS_VIEW,
          PERMISSION_CODES.SPEAKERS_MANAGE,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "HANET",
    icon: "PlugZap",
    children: [
      {
        href: "/hanet/ket-noi",
        label: "Kết nối",
        icon: "PlugZap",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: "/hanet/dia-diem",
        label: "Địa điểm",
        icon: "MapPin",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: "/hanet/thiet-bi",
        label: "Thiết bị",
        icon: "Camera",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: "/hanet/nguoi",
        label: "Người đăng ký",
        icon: "Users",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: "/hanet/checkin",
        label: "Check-in ngày",
        icon: "CalendarCheck",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: "/hanet/avatar",
        label: "Avatar Hub",
        icon: "ScanFace",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
          PERMISSION_CODES.FACE_DATA_VIEW,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "Ký túc xá & Check-in",
    icon: "CalendarPlus",
    children: [
      {
        href: "/tu-tuc-xa",
        label: "Ký túc xá",
        icon: "CalendarPlus",
        permission: null,
        anyPermission: [],
      },
    ],
  },
  {
    type: "group",
    label: "Đào tạo",
    icon: "Database",
    children: [
      {
        href: "/training-levels",
        label: "Bậc học",
        icon: "Layers",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.TRAINING_LEVELS_VIEW,
          PERMISSION_CODES.TRAINING_LEVELS_MANAGE,
        ],
      },
      {
        href: "/training-systems",
        label: "Hệ đào tạo",
        icon: "Building2",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.TRAINING_SYSTEMS_VIEW,
          PERMISSION_CODES.TRAINING_SYSTEMS_MANAGE,
        ],
      },
      {
        href: "/majors",
        label: "Ngành học",
        icon: "BookOpen",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.MAJORS_VIEW,
          PERMISSION_CODES.MAJORS_MANAGE,
        ],
      },
      {
        href: "/courses",
        label: "Khóa học",
        icon: "Library",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.COURSES_VIEW,
          PERMISSION_CODES.COURSES_MANAGE,
        ],
      },
      {
        href: "/academic-years",
        label: "Niên khóa",
        icon: "CalendarDays",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.ACADEMIC_YEARS_VIEW,
          PERMISSION_CODES.ACADEMIC_YEARS_MANAGE,
        ],
      },
    ],
  },
  {
    type: "group",
    label: "Hệ thống",
    icon: "Database",
    children: [
      {
        href: "/settings",
        label: "Cài đặt & SEO",
        icon: "Cog",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.SETTINGS_MANAGE,
          PERMISSION_CODES.SEO_METAS_VIEW,
          PERMISSION_CODES.SEO_METAS_MANAGE,
        ],
      },
      {
        href: "/data",
        label: "Sao lưu dữ liệu",
        icon: "Database",
        permission: PERMISSION_CODES.SETTINGS_MANAGE,
      },
      {
        href: "/database-schema",
        label: "Quan hệ CSDL",
        icon: "TableProperties",
        permission: null,
        adminOnly: true,
      },
      {
        href: "/graph",
        label: "Kiến trúc hệ thống",
        icon: "Network",
        permission: null,
        adminOnly: true,
      },
      {
        href: "/file-storage",
        label: "Kho lưu trữ file",
        icon: "Image",
        permission: null,
        anyPermission: [
          PERMISSION_CODES.UPLOADS_VIEW,
          PERMISSION_CODES.UPLOADS_MANAGE,
        ],
      },
    ],
  },
]
