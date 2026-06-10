import {
  BookOpen,
  Building2,
  CalendarPlus,
  Camera,
  Cog,
  FileText,
  FolderOpen,
  FolderTree,
  Home,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  MapPin,
  Mic,
  Monitor,
  Tags,
  UserCircle,
} from "lucide-react"
import type { AdminMenuTreeItem } from "@ui/components/admin"
import { PERMISSION_CODES } from "@workspace/api-client"

const BASE = "/admin"

/** Menu admin check-in — nhóm phục vụ sự kiện, check-in, camera & địa điểm. */
export const CHECKIN_ADMIN_MENU_TREE: AdminMenuTreeItem[] = [
  {
    type: "leaf",
    href: `${BASE}/tong-quan`,
    label: "Tổng quan",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    type: "group",
    label: "Danh mục & Tag",
    icon: FolderTree,
    children: [
      {
        href: `${BASE}/categories`,
        label: "Danh mục",
        icon: FolderOpen,
        permission: null,
        anyPermission: [
          PERMISSION_CODES.CATEGORIES_VIEW,
          PERMISSION_CODES.CATEGORIES_CREATE,
        ],
      },
      {
        href: `${BASE}/tags`,
        label: "Tags",
        icon: Tags,
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
    label: "Truyền thông",
    icon: FileText,
    children: [
      {
        href: `${BASE}/guides`,
        label: "Hướng dẫn sử dụng",
        icon: BookOpen,
        permission: PERMISSION_CODES.PAGE_CONTENTS_VIEW,
      },
      {
        href: `${BASE}/posts`,
        label: "Bài viết",
        icon: FileText,
        permission: null,
        anyPermission: [PERMISSION_CODES.POSTS_VIEW],
      },
    ],
  },
  {
    type: "group",
    label: "Camera & Màn hình",
    icon: Camera,
    children: [
      {
        href: `${BASE}/cameras`,
        label: "Camera",
        icon: Camera,
        permission: null,
        anyPermission: [
          PERMISSION_CODES.CAMERAS_VIEW,
          PERMISSION_CODES.CAMERAS_MANAGE,
        ],
      },
      {
        href: `${BASE}/templates`,
        label: "Mẫu hiển thị",
        icon: LayoutTemplate,
        permission: null,
        anyPermission: [
          PERMISSION_CODES.TEMPLATES_VIEW,
          PERMISSION_CODES.TEMPLATES_MANAGE,
        ],
      },
      {
        href: `${BASE}/screens`,
        label: "Màn hình",
        icon: Monitor,
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
    label: "Địa điểm & vị trí",
    icon: MapPin,
    children: [
      {
        href: `${BASE}/locations`,
        label: "Địa điểm",
        icon: MapPin,
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
    icon: CalendarPlus,
    children: [
      {
        href: BASE,
        label: "Sự kiện",
        icon: CalendarPlus,
        permission: null,
        anyPermission: [
          PERMISSION_CODES.EVENTS_VIEW,
          PERMISSION_CODES.EVENTS_MANAGE,
        ],
      },
      {
        href: `${BASE}/speakers`,
        label: "Diễn giả",
        icon: Mic,
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
    label: "Ký túc xá & Check-in",
    icon: Building2,
    children: [
      {
        href: `${BASE}/check-in-ky-tuc-xa`,
        label: "Check-in ký túc xá",
        icon: Home,
        permission: null,
      },
    ],
  },
  {
    type: "group",
    label: "Hệ thống",
    icon: Cog,
    children: [
      {
        href: `${BASE}/settings`,
        label: "Cài đặt & SEO",
        icon: Cog,
        permission: null,
        anyPermission: [
          PERMISSION_CODES.SETTINGS_MANAGE,
          PERMISSION_CODES.SEO_METAS_VIEW,
          PERMISSION_CODES.SEO_METAS_MANAGE,
        ],
      },
      {
        href: `${BASE}/file-storage`,
        label: "Kho lưu trữ file",
        icon: Image,
        permission: null,
        anyPermission: [
          PERMISSION_CODES.UPLOADS_VIEW,
          PERMISSION_CODES.UPLOADS_MANAGE,
        ],
      },
      {
        href: `${BASE}/profile`,
        label: "Hồ sơ tài khoản",
        icon: UserCircle,
        permission: null,
      },
    ],
  },
]
