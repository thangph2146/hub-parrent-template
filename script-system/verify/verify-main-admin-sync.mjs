/**
 * Kiểm tra main/backend sau admin-app generate.
 *
 * Usage: node script-system/verify/verify-main-admin-sync.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { ROOT } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")
const {
  verifyAdminHostLibDir,
  verifyAdminHostHooksDir,
  MAIN_LIB_SUBSTANTIVE,
} = require("../admin/lib/admin-host-lib-rules.cjs")

const MAIN_BACKEND = path.join(ROOT, PRODUCT_LINES.main.backend.path)
const APP_ROOT = path.join(MAIN_BACKEND, "src/app")
const CONFIG_PATH = path.join(MAIN_BACKEND, "admin.app.config.json")
const PACKAGE_MODULES = path.join(ROOT, "packages/admin-app/src/modules")

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error("thiếu apps/main/backend/admin.app.config.json")
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
}

function resolveDashboardPage(config) {
  const relativePath = config.dashboard?.relativePath ?? "page.tsx"
  const withoutPage = relativePath.replace(/\/page\.tsx$/, "")
  if (!withoutPage || withoutPage === "page.tsx" || withoutPage === ".") {
    return path.join(APP_ROOT, "page.tsx")
  }
  return path.join(APP_ROOT, withoutPage, "page.tsx")
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function verifyGeneratedModules(errors, config) {
  for (const mod of config.modules ?? []) {
    const pkgMod = path.join(PACKAGE_MODULES, mod)
    if (!fs.existsSync(pkgMod)) {
      errors.push(`package thiếu module: packages/admin-app/src/modules/${mod}`)
    }
    const listPage = path.join(APP_ROOT, mod, "page.tsx")
    if (!fs.existsSync(listPage)) {
      errors.push(`main thiếu generated route: src/app/${mod}/page.tsx`)
      continue
    }
    const content = fs.readFileSync(listPage, "utf8")
    if (!content.includes("AUTO-GENERATED")) {
      errors.push(
        `src/app/${mod}/page.tsx chưa re-export package — chạy pnpm admin:generate:main`,
      )
    }
    const dupComponent = path.join(APP_ROOT, mod, "_component")
    if (fs.existsSync(dupComponent)) {
      errors.push(
        `còn duplicate src/app/${mod}/_component — chạy pnpm admin:generate:main`,
      )
    }
  }
}

function verifyCrossImports(errors, modules) {
  const modPattern = modules
    .map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")
  if (!modPattern) return
  const forbidden = new RegExp(`@/app/(${modPattern})/`)
  const scanRoots = [
    path.join(MAIN_BACKEND, "src"),
  ]
  for (const root of scanRoots) {
    for (const file of walk(root)) {
      const rel = path.relative(MAIN_BACKEND, file).replace(/\\/g, "/")
      if (rel.startsWith("src/app/") && modules.some((m) => rel.startsWith(`src/app/${m}/`))) {
        continue
      }
      const content = fs.readFileSync(file, "utf8")
      if (forbidden.test(content)) {
        errors.push(
          `${rel}: import @/app/{module}/ sau prune — chạy pnpm admin:fix-main-imports hoặc admin:generate:main`,
        )
      }
    }
  }
}

function verify() {
  const errors = []
  const config = loadConfig()
  const nativeFiles = config.native?.files ?? []
  const modules = config.modules ?? []

  if (!fs.existsSync(path.join(MAIN_BACKEND, "src/providers/admin-runtime-bridge.tsx"))) {
    errors.push("thiếu AdminRuntimeBridge: src/providers/admin-runtime-bridge.tsx")
  }

  for (const rel of nativeFiles) {
    const p = path.join(APP_ROOT, rel)
    if (!fs.existsSync(p)) {
      errors.push(`thiếu file native: src/app/${rel}`)
      continue
    }
    const thinNativePages = {
      "profile/page.tsx": "@workspace/admin-app/modules/profile",
      "graph/page.tsx": "@workspace/admin-app/modules/graph",
      "database-schema/page.tsx": "@workspace/admin-app/modules/database-schema",
      "login/page.tsx": "@workspace/admin-app/modules/auth/login",
      "register/page.tsx": "@workspace/admin-app/modules/auth/register",
    }
    const pkgPrefix = thinNativePages[rel]
    if (pkgPrefix) {
      const content = fs.readFileSync(p, "utf8")
      if (
        !content.includes(pkgPrefix) &&
        content.split(/\r?\n/).length > 5
      ) {
        errors.push(
          `${rel} nên re-export ${pkgPrefix}`,
        )
      }
    }
  }

  verifyGeneratedModules(errors, config)

  const dashPage = resolveDashboardPage(config)
  if (config.dashboard?.relativePath) {
    if (!fs.existsSync(dashPage)) {
      errors.push(`thiếu dashboard generated: ${path.relative(MAIN_BACKEND, dashPage)}`)
    } else {
      const dashContent = fs.readFileSync(dashPage, "utf8")
      if (!dashContent.includes("AUTO-GENERATED")) {
        errors.push(
          "dashboard chưa re-export package — chạy pnpm admin:generate:main",
        )
      }
    }
  }

  verifyCrossImports(errors, modules)

  verifyAdminHostLibDir(errors, {
    libDir: path.join(MAIN_BACKEND, "src/lib"),
    pathPrefix: "src/lib/",
    substantiveBasenames: MAIN_LIB_SUBSTANTIVE,
  })
  verifyAdminHostHooksDir(errors, {
    hooksDir: path.join(MAIN_BACKEND, "src/hooks"),
    pathPrefix: "src/hooks/",
    substantiveBasenames: new Set(),
  })

  if (errors.length) {
    console.error(
      "[verify:main-admin] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:main-admin] OK — ${modules.length} modules, ${nativeFiles.length} native files`,
  )
}

verify()
