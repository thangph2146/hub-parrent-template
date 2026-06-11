import type { AdminMenuTreeItemData } from "../menu/admin-menu-tree.items"

/** Module CRUD chuẩn — map 1:1 thư mục `src/modules/{id}` trong package. */
export type AdminModuleId = string

export type AdminAppMenuConfig = {
  /** Href gốc main backend (vd. `/staff`) — luôn include khi module bật. */
  alwaysIncludeHrefs?: string[]
  excludeHrefs?: string[]
  hrefOverrides?: Record<string, string>
  nativeGroups?: Array<
    AdminMenuTreeItemData & {
      insertAfter?: string
      replaceLabel?: string
    }
  >
  appendToGroup?: Record<string, AdminMenuTreeItemData[]>
}

export type AdminNativeRoutePreserve = {
  /** Đường dẫn tương đối dưới `basePath` — không generate từ package (vd. `check-in-ky-tuc-xa`). */
  paths: string[]
}

export type AdminAppConfig = {
  /** Định danh deploy (vd. `hub-main`, `hub-checkin`). */
  id: string
  /** Prefix route Next (main: `""`, check-in: `/admin`). */
  basePath: "" | `/${string}`
  title: string
  /** Module CRUD bật — render + menu tự lọc. */
  modules: AdminModuleId[]
  /** Route giữ local trong app (sự kiện check-in, dashboard đổi tên, …). */
  nativeRoutes?: Record<string, AdminNativeRoutePreserve>
  menu?: AdminAppMenuConfig
  dashboard?: {
    /** Module id hoặc path tương đối cho trang tổng quan. */
    moduleId?: "dashboard"
    relativePath?: string
    /** Câu mô tả sau “Xin chào, …” trên dashboard. */
    subtitle?: string
  }
  pageGuardPermissionPrefix?: Record<string, string>
  pageGuardRoleModulesSkip?: string[]
}
