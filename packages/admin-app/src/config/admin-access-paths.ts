import type { AdminAppConfig } from "./types"

const DEFAULT_LOGIN_SEGMENT = "dang-nhap"
const DEFAULT_REGISTER_SEGMENT = "dang-ky"
const DEFAULT_PROFILE_SEGMENT = "profile"

/** Chuẩn hóa `basePath` từ config (bỏ slash thừa). */
export function normalizeAdminBasePath(basePath: string | undefined): string {
  return String(basePath ?? "").replace(/^\/+|\/+$/g, "")
}

/** Thư mục dashboard dưới basePath (bỏ hậu tố `/page.tsx`). */
export function resolveAdminDashboardDir(relativePath?: string): string {
  return (relativePath ?? "tong-quan/page.tsx").replace(/\/page\.tsx$/, "")
}

function joinAdminSegments(...segments: Array<string | undefined>): string {
  const parts = segments
    .flatMap((segment) =>
      String(segment ?? "")
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .filter(Boolean),
    )
    .filter(Boolean)
  return parts.length ? `/${parts.join("/")}` : "/"
}

export type AdminShellPaths = {
  /** Prefix deploy — `""` hoặc `"/manage"`, `"/admin"`, … */
  basePath: string
  /** Route index admin — thường trùng `basePath` */
  indexPath: string
  homePath: string
  loginPath: string
  registerPath: string
  profilePath: string
}

/** Path shell admin derive từ `admin.app.config.json` — nguồn sự thật duy nhất. */
export function buildAdminShellPaths(config: AdminAppConfig): AdminShellPaths {
  const base = normalizeAdminBasePath(config.basePath)
  const dashDir = resolveAdminDashboardDir(config.dashboard?.relativePath)

  return {
    basePath: base ? `/${base}` : "",
    indexPath: base ? `/${base}` : "/",
    homePath: joinAdminSegments(base, dashDir),
    loginPath: joinAdminSegments(base, DEFAULT_LOGIN_SEGMENT),
    registerPath: joinAdminSegments(base, DEFAULT_REGISTER_SEGMENT),
    profilePath: joinAdminSegments(base, DEFAULT_PROFILE_SEGMENT),
  }
}

/** Kiểm tra pathname có nằm dưới prefix admin của app không. */
export function isPathUnderAdminBase(
  pathname: string | null | undefined,
  basePath: string | undefined,
): boolean {
  if (!pathname) return false
  const base = normalizeAdminBasePath(basePath)
  const normalized = pathname.replace(/\/+$/, "") || "/"
  if (!base) return true
  const prefix = `/${base}`
  return normalized === prefix || normalized.startsWith(`${prefix}/`)
}

/** Đổi prefix menu legacy (vd. `/admin/staff`) sang `config.basePath` hiện tại. */
export function rebaseAdminMenuHref(
  href: string,
  config: AdminAppConfig,
  legacyPrefix = "/admin",
): string {
  const from = legacyPrefix.replace(/\/+$/, "") || ""
  const to = normalizeAdminBasePath(config.basePath)
  const fromP = from ? `/${from}` : ""
  const toP = to ? `/${to}` : ""

  if (fromP && href === fromP) return toP || "/"
  if (fromP && href.startsWith(`${fromP}/`)) {
    const rest = href.slice(fromP.length)
    return joinAdminSegments(to, rest.replace(/^\//, ""))
  }
  return href
}
