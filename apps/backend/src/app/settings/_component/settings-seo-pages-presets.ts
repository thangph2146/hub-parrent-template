import type { TreeOption } from "@ui/components/pickers"
import { DEFAULT_STOREFRONT_OG_IMAGE } from "./settings-presets"

export type SettingsSeoPagePreset = {
  page: string
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string
}

export type SettingsSeoPagesPresetGroup = {
  id: string
  label: string
  hint: string
  tree: TreeOption[]
  pages: Record<string, SettingsSeoPagePreset>
}

function pagePreset(
  page: string,
  title: string,
  description: string,
  keywords: string,
  ogTitle?: string,
  ogDescription?: string,
): SettingsSeoPagePreset {
  return {
    page,
    title,
    description,
    keywords,
    ogTitle: ogTitle ?? title,
    ogDescription: ogDescription ?? description,
    ogImage: DEFAULT_STOREFRONT_OG_IMAGE,
  }
}

const HUB_PARENT_PAGES: Record<string, SettingsSeoPagePreset> = {
  "/": pagePreset(
    "/",
    "HUB Parent - Kết nối phụ huynh và nhà trường",
    "Cổng thông tin chính thức kết nối phụ huynh với Trường Đại học Ngân hàng TP.HCM.",
    "hub parent, trang chủ, phụ huynh, nhà trường",
  ),
  "/bai-viet": pagePreset(
    "/bai-viet",
    "Tin tức & thông báo - HUB Parent",
    "Cập nhật tin tức, thông báo và hoạt động mới nhất từ nhà trường.",
    "tin tức, thông báo, bài viết, hub parent",
  ),
  "/bai-viet/[slug]": pagePreset(
    "/bai-viet/[slug]",
    "Chi tiết bài viết - HUB Parent",
    "Nội dung bài viết, thông báo và tin tức từ Trường Đại học Ngân hàng TP.HCM.",
    "bài viết, chi tiết, hub parent",
  ),
  "/ve-chung-toi": pagePreset(
    "/ve-chung-toi",
    "Về chúng tôi - HUB Parent",
    "Giới thiệu sứ mệnh HUB Parent trong việc kết nối phụ huynh và nhà trường.",
    "về chúng tôi, hub parent, đại học ngân hàng",
  ),
  "/huong-dan-su-dung": pagePreset(
    "/huong-dan-su-dung",
    "Hướng dẫn sử dụng - HUB Parent",
    "Hướng dẫn đăng ký, đăng nhập và sử dụng các tính năng trên HUB Parent.",
    "hướng dẫn, sử dụng, hub parent",
  ),
  "/lien-he": pagePreset(
    "/lien-he",
    "Liên hệ - HUB Parent",
    "Gửi yêu cầu hỗ trợ và liên hệ với nhà trường qua HUB Parent.",
    "liên hệ, hỗ trợ, hub parent",
  ),
  "/login": pagePreset(
    "/login",
    "Đăng nhập - HUB Parent",
    "Đăng nhập tài khoản phụ huynh để theo dõi thông tin học tập của con.",
    "đăng nhập, phụ huynh, hub parent",
  ),
  "/register": pagePreset(
    "/register",
    "Đăng ký tài khoản - HUB Parent",
    "Tạo tài khoản phụ huynh mới trên hệ thống HUB Parent.",
    "đăng ký, tài khoản, hub parent",
  ),
}

const HUB_CHECKIN_PAGES: Record<string, SettingsSeoPagePreset> = {
  "/": pagePreset(
    "/",
    "Hệ thống Sự kiện HUB",
    "Khám phá sự kiện, đăng ký tham dự và check-in nhanh tại Trường Đại học Ngân hàng TP.HCM.",
    "hub sự kiện, check-in, trang chủ",
  ),
  "/su-kien": pagePreset(
    "/su-kien",
    "Danh sách sự kiện - HUB",
    "Xem và đăng ký các sự kiện sắp diễn ra của nhà trường.",
    "sự kiện, danh sách, đăng ký",
  ),
  "/su-kien/[slug]": pagePreset(
    "/su-kien/[slug]",
    "Chi tiết sự kiện - HUB",
    "Thông tin chi tiết, lịch trình và đăng ký tham dự sự kiện.",
    "chi tiết sự kiện, đăng ký, check-in",
  ),
  "/su-kien-cua-toi": pagePreset(
    "/su-kien-cua-toi",
    "Sự kiện của tôi - HUB",
    "Theo dõi các sự kiện bạn đã đăng ký và trạng thái tham dự.",
    "sự kiện của tôi, đăng ký, qr",
  ),
  "/dang-nhap": pagePreset(
    "/dang-nhap",
    "Đăng nhập - Hệ thống Sự kiện HUB",
    "Đăng nhập để quản lý đăng ký và check-in sự kiện.",
    "đăng nhập, sinh viên, sự kiện",
  ),
  "/student": pagePreset(
    "/student",
    "Khu vực sinh viên - HUB Sự kiện",
    "Trang tổng quan dành cho sinh viên sau khi đăng nhập.",
    "sinh viên, khu vực cá nhân",
  ),
  "/student/events": pagePreset(
    "/student/events",
    "Sự kiện đã đăng ký - HUB",
    "Danh sách sự kiện bạn đã đăng ký và mã QR check-in.",
    "sự kiện đã đăng ký, qr check-in",
  ),
  "/student/profile": pagePreset(
    "/student/profile",
    "Hồ sơ sinh viên - HUB Sự kiện",
    "Cập nhật thông tin cá nhân phục vụ đăng ký và check-in sự kiện.",
    "hồ sơ, sinh viên, tài khoản",
  ),
}

export const SETTINGS_SEO_PAGES_PRESET_GROUPS: SettingsSeoPagesPresetGroup[] = [
  {
    id: "hub-parent",
    label: "HUB Parent",
    hint: "Storefront site chính (ecosystem.main)",
    tree: [
      {
        value: "__hub-parent-root__",
        label: "Site chính — HUB Parent",
        children: [
          {
            value: "__hub-parent-public__",
            label: "Trang công khai",
            children: [
              { value: "/", label: "Trang chủ (/)" },
              { value: "/bai-viet", label: "Danh sách bài viết" },
              { value: "/bai-viet/[slug]", label: "Chi tiết bài viết (động)" },
              { value: "/ve-chung-toi", label: "Về chúng tôi" },
              { value: "/huong-dan-su-dung", label: "Hướng dẫn sử dụng" },
              { value: "/lien-he", label: "Liên hệ" },
            ],
          },
          {
            value: "__hub-parent-auth__",
            label: "Xác thực",
            children: [
              { value: "/login", label: "Đăng nhập" },
              { value: "/register", label: "Đăng ký" },
            ],
          },
        ],
      },
    ],
    pages: HUB_PARENT_PAGES,
  },
  {
    id: "hub-checkin",
    label: "HUB Check-in",
    hint: "Cổng sự kiện (ecosystem.checkin)",
    tree: [
      {
        value: "__hub-checkin-root__",
        label: "Site check-in — HUB Sự kiện",
        children: [
          {
            value: "__hub-checkin-public__",
            label: "Trang công khai",
            children: [
              { value: "/", label: "Trang chủ (/)" },
              { value: "/su-kien", label: "Danh sách sự kiện" },
              { value: "/su-kien/[slug]", label: "Chi tiết sự kiện (động)" },
              { value: "/su-kien-cua-toi", label: "Sự kiện của tôi" },
              { value: "/dang-nhap", label: "Đăng nhập" },
            ],
          },
          {
            value: "__hub-checkin-student__",
            label: "Khu vực sinh viên",
            children: [
              { value: "/student", label: "Tổng quan sinh viên" },
              { value: "/student/events", label: "Sự kiện đã đăng ký" },
              { value: "/student/profile", label: "Hồ sơ sinh viên" },
            ],
          },
        ],
      },
    ],
    pages: HUB_CHECKIN_PAGES,
  },
]

export function getSettingsSeoPagesPresetGroup(
  id: string,
): SettingsSeoPagesPresetGroup | undefined {
  return SETTINGS_SEO_PAGES_PRESET_GROUPS.find((group) => group.id === id)
}

function findTreeNode(nodes: TreeOption[], value: string): TreeOption | null {
  for (const node of nodes) {
    if (node.value === value) return node
    if (node.children?.length) {
      const found = findTreeNode(node.children, value)
      if (found) return found
    }
  }
  return null
}

function collectLeafPagePaths(
  node: TreeOption,
  pageMap: Record<string, SettingsSeoPagePreset>,
): string[] {
  if (!node.children?.length) {
    return node.value in pageMap ? [node.value] : []
  }
  return node.children.flatMap((child) => collectLeafPagePaths(child, pageMap))
}

/** Đổ selection tree (gồm cả nhóm cha) thành danh sách `page` thực tế. */
export function resolveSettingsSeoPagesSelection(
  selected: string[],
  group: SettingsSeoPagesPresetGroup,
): string[] {
  const pages = new Set<string>()
  for (const value of selected) {
    if (value in group.pages) {
      pages.add(value)
      continue
    }
    const node = findTreeNode(group.tree, value)
    if (!node) continue
    for (const page of collectLeafPagePaths(node, group.pages)) {
      pages.add(page)
    }
  }
  return [...pages]
}

export function listAllPresetPagePaths(
  group: SettingsSeoPagesPresetGroup,
): string[] {
  return Object.keys(group.pages)
}
