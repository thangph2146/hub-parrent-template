/**
 * Rewrite import `@/` từ main/backend → `@workspace/admin-app/...`
 * Dùng khi migrate module/lib vào package.
 */

const MODULE_IDS = [
  "staff",
  "rbac",
  "categories",
  "tags",
  "guides",
  "posts",
  "cameras",
  "templates",
  "screens",
  "locations",
  "speakers",
  "settings",
  "file-storage",
  "data",
  "events",
  "products",
  "departments",
  "courses",
  "majors",
  "training-levels",
  "training-systems",
  "academic-years",
  "orders",
  "promo-codes",
  "seo-metas",
  "contact-requests",
  "parent-students",
  "my-students",
]

/** @param {string} content */
function rewritePackageImports(content) {
  let out = content

  out = out.replace(/@workspace\/ui\//g, "@ui/")
  out = out.replace(
    /from\s+["']@workspace\/ui["']/g,
    'from "@ui/components/admin"',
  )
  out = out.replace(
    /from\s+["']@\/hooks\/use-admin-mutation["']/g,
    'from "@ui/hooks/use-admin-mutation"',
  )

  out = out.replace(/from ["']@\/lib["']/g, 'from "@workspace/admin-app/lib"')
  out = out.replace(/@\/lib\//g, "@workspace/admin-app/lib/")
  out = out.replace(/@\/hooks\//g, "@workspace/admin-app/hooks/")
  out = out.replace(
    /@\/providers\/auth-provider/g,
    "@workspace/admin-app/runtime",
  )
  out = out.replace(/@\/providers\/query-provider/g, "@workspace/admin-app/runtime")

  for (const mod of MODULE_IDS) {
    const re = new RegExp(
      `useAdminCrudNavigation\\(["']/${mod}["']`,
      "g",
    )
    out = out.replace(re, `useAdminModuleNavigation("${mod}"`)
    out = out.replace(
      new RegExp(`from ["']@/app/${mod}/`, "g"),
      `from "@workspace/admin-app/modules/${mod}/`,
    )
    out = out.replace(
      new RegExp(`from ["']\\.\\./\\.\\./${mod}/`, "g"),
      `from "@workspace/admin-app/modules/${mod}/`,
    )
  }

  out = out.replace(
    /from ["']@\/app\/events\/_component/g,
    'from "@workspace/admin-app/modules/events/_component',
  )
  out = out.replace(
    /from ["']\.\.\/\.\.\/products\/_component\/product-image-storage["']/g,
    'from "@workspace/admin-app/lib/product-image-storage-stub"',
  )
  out = out.replace(
    /from ["']@\/app\/products\/_component\/product-image-storage["']/g,
    'from "@workspace/admin-app/lib/product-image-storage-stub"',
  )
  out = out.replace(
    /import\s+\{\s*useAuth\s*\}\s+from\s+["']@workspace\/admin-app\/runtime["']/g,
    'import { useAdminAuth as useAuth } from "@workspace/admin-app/runtime"',
  )

  return out
}

module.exports = { rewritePackageImports, MODULE_IDS }
