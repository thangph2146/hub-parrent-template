/** AUTO-GENERATED — pnpm pull:checkin (script-system/sync-checkin-menu-tree.cjs). Không sửa tay. */
import {
  BookOpen,
  Building2,
  CalendarPlus,
  Camera,
  Cog,
  Database,
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
  ShieldCheck,
  Tags,
  UserCircle,
  Users,
} from "lucide-react"
import type { AdminMenuTreeItem } from "@ui/components/admin"

export const CHECKIN_ADMIN_MENU_TREE: AdminMenuTreeItem[] = [
  {
    type: "leaf",
    href: "/admin/tong-quan",
    label: "Tổng quan",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    type: "group",
    label: "HRM",
    icon: Users,
    children: [
      {
        href: "/admin/staff",
        label: "Nhân sự",
        icon: Users,
        permission: null,
        anyPermission: ["users:manage"],
      },
      {
        href: "/admin/rbac",
        label: "Phân quyền",
        icon: ShieldCheck,
        permission: "roles:view",
      },
    ],
  },
  {
    type: "group",
    label: "Danh mục & Tag",
    icon: FolderTree,
    children: [
      {
        href: "/admin/categories",
        label: "Danh mục",
        icon: FolderOpen,
        permission: null,
        anyPermission: ["categories:view","categories:create"],
      },
      {
        href: "/admin/tags",
        label: "Tags",
        icon: Tags,
        permission: null,
        anyPermission: ["tags:view","tags:manage"],
      },
    ],
  },
  {
    type: "group",
    label: "Truyền thông",
    icon: FolderTree,
    children: [
      {
        href: "/admin/guides",
        label: "Hướng dẫn sử dụng",
        icon: BookOpen,
        permission: "page_contents:view",
      },
      {
        href: "/admin/posts",
        label: "Bài viết",
        icon: FileText,
        permission: null,
        anyPermission: ["posts:view"],
      },
    ],
  },
  {
    type: "group",
    label: "Camera & Màn hình",
    icon: Camera,
    children: [
      {
        href: "/admin/cameras",
        label: "Camera",
        icon: Camera,
        permission: null,
        anyPermission: ["cameras:view","cameras:manage"],
      },
      {
        href: "/admin/templates",
        label: "Mẫu hiển thị",
        icon: LayoutTemplate,
        permission: null,
        anyPermission: ["templates:view","templates:manage"],
      },
      {
        href: "/admin/screens",
        label: "Màn hình",
        icon: Monitor,
        permission: null,
        anyPermission: ["screens:view","screens:manage"],
      },
    ],
  },
  {
    type: "group",
    label: "Địa điểm & vị trí",
    icon: MapPin,
    children: [
      {
        href: "/admin/locations",
        label: "Địa điểm",
        icon: MapPin,
        permission: null,
        anyPermission: ["locations:view","locations:manage"],
      },
    ],
  },
  {
    type: "group",
    label: "Sự kiện & Check-in",
    icon: CalendarPlus,
    children: [
      {
        href: "/admin",
        label: "Sự kiện",
        icon: CalendarPlus,
        permission: null,
        anyPermission: ["events:view","events:manage"],
      },
      {
        href: "/admin/speakers",
        label: "Diễn giả",
        icon: Mic,
        permission: null,
        anyPermission: ["speakers:view","speakers:manage"],
      },
    ],
  },
  {
    type: "group",
    label: "Hệ thống",
    icon: Database,
    children: [
      {
        href: "/admin/settings",
        label: "Cài đặt & SEO",
        icon: Cog,
        permission: null,
        anyPermission: ["settings:manage","seo_metas:view","seo_metas:manage"],
      },
      {
        href: "/admin/data",
        label: "Sao lưu dữ liệu",
        icon: Database,
        permission: "settings:manage",
      },
      {
        href: "/admin/file-storage",
        label: "Kho lưu trữ file",
        icon: Image,
        permission: null,
        anyPermission: ["uploads:view","uploads:manage"],
      },
      {
        href: "/admin/profile",
        label: "Hồ sơ tài khoản",
        icon: UserCircle,
        permission: null,
      },
    ],
  },
  {
    type: "group",
    label: "Ký túc xá & Check-in",
    icon: Building2,
    children: [
      {
        href: "/admin/check-in-ky-tuc-xa",
        label: "Check-in ký túc xá",
        icon: Home,
        permission: null,
      },
    ],
  },
]
