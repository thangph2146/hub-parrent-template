import type { AdminModuleId } from "../config/types"

export type AdminModuleRouteFile =
  | "page.tsx"
  | "new/page.tsx"
  | "[id]/page.tsx"
  | "[id]/edit/page.tsx"
  | "new/loading.tsx"
  | "[id]/loading.tsx"
  | "[id]/edit/loading.tsx"

/** Route CRUD chuẩn — mỗi module 1 segment dưới basePath. */
export const STANDARD_ADMIN_MODULE_ROUTES: AdminModuleRouteFile[] = [
  "page.tsx",
  "new/page.tsx",
  "[id]/page.tsx",
  "[id]/edit/page.tsx",
]

export function moduleHref(moduleId: AdminModuleId): string {
  if (moduleId === "dashboard") return "/"
  if (moduleId === "file-storage") return "/file-storage"
  return `/${moduleId}`
}

export function moduleAppPath(
  basePath: string,
  moduleId: AdminModuleId,
  relativeRoute: string,
): string {
  const prefix = basePath.replace(/\/$/, "")
  const mod =
    moduleId === "dashboard"
      ? ""
      : moduleHref(moduleId).replace(/^\//, "")
  const segments = [prefix, mod, relativeRoute.replace(/\/page\.tsx$/, "")]
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/")
  return segments.startsWith("/") ? segments : `/${segments}`
}

export function packageModuleExport(
  moduleId: AdminModuleId,
  routeFile: AdminModuleRouteFile,
): string {
  const withoutExt = routeFile.replace(/\.tsx$/, "")
  return `@workspace/admin-app/modules/${moduleId}/${withoutExt}`
}
