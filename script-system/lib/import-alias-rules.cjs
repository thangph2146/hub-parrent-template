/**
 * Quy tắc import alias monorepo — dùng chung bởi verify + sync.
 *
 * App Next.js: UI qua @ui/* (tsconfig paths), không @workspace/ui.
 * Package workspace: @workspace/* theo package.json exports.
 */

/** App deployable Next (storefront + admin). */
const REQUIRED_UI_TSCONFIG_PATHS = [
  "@ui/globals.css",
  "@ui/components/*",
  "@ui/*",
]

/**
 * Regex kiểm tra file .ts/.tsx trong app Next.
 * @type {Array<{ pattern: RegExp, hint: string, skipFiles?: string[] }>}
 */
const NEXT_APP_FORBIDDEN_SOURCE_PATTERNS = [
  {
    pattern: /@workspace\/ui\//,
    hint: "dùng @ui/... (alias tsconfig)",
  },
  {
    pattern: /from\s+["']@workspace\/ui["']/,
    hint: "dùng @ui/components/... hoặc @ui/hooks/...",
  },
  {
    pattern: /packages\/ui\/src/,
    hint: "không import đường dẫn file packages/ui — dùng @ui/",
  },
  {
    pattern: /\.\.\/+(?:\.\.\/)*packages\/ui/,
    hint: "không import relative tới packages/ui — dùng @ui/",
  },
]

/** ESLint `no-restricted-imports` group — app Next. */
const forbidWorkspaceUiImports = {
  group: ["@workspace/ui", "@workspace/ui/*"],
  message:
    "App Next dùng alias @ui/... (tsconfig paths), không import npm @workspace/ui.",
}

/**
 * Module `src/lib/*.ts` native check-in — không copy sang `src/lib/admin/`.
 * Sau bước `@/lib/` → `@/lib/admin/` của sync, khôi phục các import này.
 */
const CHECKIN_NATIVE_LIB_MODULES = [
  "portal/event-auth",
  "portal/event-session",
  "portal/event-portal-routes",
  "portal/checkin-session-exclusive",
  "site/api",
  "site/public-events",
  "site/event-detail-content",
  "site/event-registration",
  "site/student-email",
  "site/registration-format",
  "site/events-list-query",
  "site/site-nav",
]

/** @param {string} content */
function restoreCheckinNativeLibImports(content) {
  let out = content
  for (const mod of CHECKIN_NATIVE_LIB_MODULES) {
    out = out.replaceAll(`@/lib/admin/${mod}`, `@/lib/${mod}`)
  }
  return out
}

/**
 * Rewrite `@/app/...` từ main/backend → `@/app/admin/...` trên check-in.
 * Rule cụ thể chạy trước; rule chung bỏ qua path đã là `@/app/admin/`.
 */
const CHECKIN_ADMIN_APP_IMPORT_REWRITES = [
  [/@\/app\/cameras\/_component/g, "@/lib/admin/cameras-query"],
  [/@\/app\/events\/_component/g, "@/components/admin/events"],
  [
    /@\/app\/products\/_component\/product-image-storage/g,
    "@/lib/admin/product-image-storage-stub",
  ],
]

const CHECKIN_PRODUCT_IMAGE_STORAGE_STUB =
  "@/lib/admin/product-image-storage-stub"

/** @param {string} content */
function rewriteCheckinAdminAppImports(content) {
  let out = content
  for (const [pattern, value] of CHECKIN_ADMIN_APP_IMPORT_REWRITES) {
    out = out.replace(pattern, value)
  }
  out = out
    .replace(/@\/app\/(?!admin\/)/g, "@/app/admin/")
    .replace(/@\/app\/admin\/admin\//g, "@/app/admin/")
    .replace(
      /from\s+["']\.\.\/\.\.\/products\/_component\/product-image-storage["']/g,
      `from "${CHECKIN_PRODUCT_IMAGE_STORAGE_STUB}"`,
    )
  return out
}

/**
 * Chuẩn hóa nội dung sau sync / copy (UI).
 * @param {string} content
 */
function normalizeUiImportsInSource(content) {
  let out = content
  out = out.replace(/@workspace\/ui\//g, "@ui/")
  out = out.replace(
    /from\s+["']@workspace\/ui["']/g,
    'from "@ui/components/admin"',
  )
  return out
}

module.exports = {
  REQUIRED_UI_TSCONFIG_PATHS,
  CHECKIN_NATIVE_LIB_MODULES,
  CHECKIN_ADMIN_APP_IMPORT_REWRITES,
  NEXT_APP_FORBIDDEN_SOURCE_PATTERNS,
  forbidWorkspaceUiImports,
  normalizeUiImportsInSource,
  restoreCheckinNativeLibImports,
  rewriteCheckinAdminAppImports,
}
