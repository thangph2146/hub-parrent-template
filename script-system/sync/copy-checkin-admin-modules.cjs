/**
 * Copy admin modules main/backend → hub-event check-in frontend.
 * Manifest: apps/hub-event/hub-event-checkin-frontend/admin.sync-modules.json
 *
 * Usage: node script-system/copy-checkin-admin-modules.cjs
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")
const MAIN_BACKEND = path.join(ROOT, PRODUCT_LINES.main.backend.path)
const CHECKIN_FRONT = path.join(ROOT, PRODUCT_LINES["hub-event"].frontend.path)
const BACKEND_APP = path.join(MAIN_BACKEND, "src/app")
const TARGET_BASE = path.join(CHECKIN_FRONT, "src/app/admin")
const CONFIG_PATH = path.join(CHECKIN_FRONT, "admin.sync-modules.json")

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
const MODULES = config.modules ?? []
const NATIVE_FILES = config.native?.files ?? []
const PRESERVE_IN_MODULES = config.native?.preserveInModules ?? []
const LIB_FROM_MAIN = config.libFromMain ?? []
const CONFIG_FROM_MAIN = config.configFromMain ?? []
const ADMIN_BASE = "/admin"

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-checkin-admin] skip missing: ${src}`)
    return
  }
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
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

const PAGE_GUARD_PREFIX = config.pageGuardPermissionPrefix ?? {}
const PAGE_GUARD_ROLE_SKIP = new Set(config.pageGuardRoleModulesSkip ?? ["settings"])

function resolvePageGuardPermission(adminRelPath) {
  const normalized = adminRelPath.replace(/\\/g, "/")
  const segments = normalized.split("/").filter(Boolean)
  if (segments.length < 2) return null
  const mod = segments[0]
  if (PAGE_GUARD_ROLE_SKIP.has(mod)) return null
  if (mod === "data") return "PERMISSION_CODES.SETTINGS_MANAGE"
  const prefix = PAGE_GUARD_PREFIX[mod]
  if (!prefix) return null

  const file = segments[segments.length - 1]
  const parent = segments[segments.length - 2]
  if (file !== "page.tsx") return null
  if (parent === "new") return `PERMISSION_CODES.${prefix}_CREATE`
  if (parent === "edit") return `PERMISSION_CODES.${prefix}_UPDATE`
  return `PERMISSION_CODES.${prefix}_VIEW`
}

function transformLegacyRolePageGuard(content, adminRelPath) {
  if (!/<AdminPageGuard\s+roles=/.test(content)) return content
  const perm = adminRelPath ? resolvePageGuardPermission(adminRelPath) : null
  if (!perm) return content

  let out = content.replace(
    /<AdminPageGuard\s+roles=\{[^}]+\}>/g,
    `<AdminPageGuard permission={${perm}}>`,
  )

  if (out.includes(perm) && !/\bPERMISSION_CODES\b/.test(out)) {
    if (/from ["']@workspace\/api-client["']/.test(out)) {
      out = out.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@workspace\/api-client["']/,
        (line, imports) => {
          if (/\bPERMISSION_CODES\b/.test(imports)) return line
          return `import {${imports.trim()}, PERMISSION_CODES } from "@workspace/api-client"`
        },
      )
    } else {
      out = out.replace(
        /^(["']use client["']\s*\n)/,
        `$1import { PERMISSION_CODES } from "@workspace/api-client"\n`,
      )
    }
  }

  return out
}

function transformContent(content, adminRelPath) {
  let out = content
  const modulePaths = [...MODULES, "events", "tong-quan"]

  for (const mod of modulePaths) {
    const base = `${ADMIN_BASE}/${mod}`
    out = out
      .replaceAll(`useAdminCrudNavigation("/${mod}"`, `useAdminCrudNavigation("${base}"`)
      .replaceAll(`useAdminCrudNavigation('/${mod}'`, `useAdminCrudNavigation('${base}'`)
  }

  out = out.replaceAll(`${ADMIN_BASE}${ADMIN_BASE}`, ADMIN_BASE)

  const replacements = [
    [/@\/lib\/admin\/admin\/api/g, "@/lib/admin/api"],
    [/@\/lib\/api/g, "@/lib/admin/api"],
    [/@\/lib\//g, "@/lib/admin/"],
    [/@\/hooks\//g, "@/hooks/admin/"],
    [/@\/providers\/auth-provider/g, "@/providers/admin/auth-provider"],
    [/@\/providers\/query-provider/g, "@/providers/admin/query-provider"],
    [
      /@\/providers\/admin-realtime-sync/g,
      "@/providers/admin/admin-realtime-sync",
    ],
    [/@\/features\/auth\//g, "@/features/admin-auth/"],
    [
      /@\/config\/admin-layout-static/g,
      "@/config/admin/checkin-admin-layout-static",
    ],
    [/@\/config\/admin-menu-tree/g, "@/config/admin/checkin-admin-menu-tree"],
    [/@\/config\/protected-admin/g, "@/config/admin/protected-admin"],
    [/@\/app\/cameras\/_component/g, "@/lib/admin/cameras-query"],
    [/@\/app\/events\/_component/g, "@/app/admin/_component"],
    [
      /@\/app\/products\/_component\/product-image-storage/g,
      "@/lib/admin/product-image-storage-stub",
    ],
    [/@\/types\//g, "@/types/admin/"],
  ]

  for (const [pattern, value] of replacements) {
    out = out.replace(pattern, value)
  }

  out = out
    .replace(/@\/lib\/admin\/admin\//g, "@/lib/admin/")
    .replace(/@\/hooks\/admin\/admin\//g, "@/hooks/admin/")
    .replace(/from "@\/lib"/g, 'from "@/lib/admin"')

  if (adminRelPath) {
    out = transformLegacyRolePageGuard(out, adminRelPath)
  }

  return out
}

function backupPreserveFiles(moduleName) {
  const backups = []
  for (const rel of PRESERVE_IN_MODULES) {
    if (!rel.startsWith(`${moduleName}/`)) continue
    const filePath = path.join(TARGET_BASE, rel)
    if (fs.existsSync(filePath)) {
      backups.push({ rel, content: fs.readFileSync(filePath) })
    }
  }
  return backups
}

function restorePreserveFiles(backups) {
  for (const { rel, content } of backups) {
    const filePath = path.join(TARGET_BASE, rel)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content)
    console.log(`[copy-checkin-admin] preserved: admin/${rel}`)
  }
}

function copyConfigFromMain() {
  for (const rel of CONFIG_FROM_MAIN) {
    const src = path.join(MAIN_BACKEND, "src", rel)
    const dest = path.join(CHECKIN_FRONT, "src/config/admin", path.basename(rel))
    if (!fs.existsSync(src)) {
      console.warn(`[copy-checkin-admin] skip missing config: ${src}`)
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    console.log(`[copy-checkin-admin] config: src/config/admin/${path.basename(rel)}`)
  }
}

function copyLibFromMain() {
  for (const item of LIB_FROM_MAIN) {
    const fromRel = item.from.replace(/^src\//, "")
    const src = path.join(MAIN_BACKEND, "src", fromRel)
    const destRel =
      item.to ?? `src/lib/admin/${path.basename(item.from)}`
    const dest = path.join(CHECKIN_FRONT, destRel)
    if (!fs.existsSync(src)) {
      console.warn(`[copy-checkin-admin] skip missing lib: ${src}`)
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    let content = fs.readFileSync(src, "utf8")
    content = transformContent(content)
    fs.writeFileSync(dest, content)
    console.log(`[copy-checkin-admin] lib: ${destRel}`)
  }
}

function verifyNativeFiles() {
  let failed = false
  for (const rel of NATIVE_FILES) {
    const p = path.join(TARGET_BASE, rel)
    if (!fs.existsSync(p)) {
      console.error(
        `[copy-checkin-admin] thiếu file native bắt buộc: src/app/admin/${rel}`,
      )
      failed = true
    }
  }
  if (failed) process.exitCode = 1
}

for (const mod of MODULES) {
  const src = path.join(BACKEND_APP, mod)
  const dest = path.join(TARGET_BASE, mod)
  const backups = backupPreserveFiles(mod)
  if (fs.existsSync(dest)) {
    console.log(`[copy-checkin-admin] exists, merge-copy: ${mod}`)
  }
  copyDir(src, dest)
  restorePreserveFiles(backups)
  console.log(`[copy-checkin-admin] copied: ${mod}`)
}

const dashDestRel = config.copyDashboardTo ?? "tong-quan/page.tsx"
const dashSrc = path.join(BACKEND_APP, "page.tsx")
const dashDest = path.join(TARGET_BASE, dashDestRel)
fs.mkdirSync(path.dirname(dashDest), { recursive: true })
let dash = fs.readFileSync(dashSrc, "utf8")
const sub = config.dashboardSubtitleReplace
if (sub?.from && sub?.to) {
  dash = dash.replace(sub.from, sub.to)
}
fs.writeFileSync(
  dashDest,
  transformContent(dash, config.copyDashboardTo ?? "tong-quan/page.tsx"),
)
console.log(`[copy-checkin-admin] copied: ${dashDestRel}`)

const typesSrc = path.join(MAIN_BACKEND, "src/types/dashboard.ts")
const typesDest = path.join(CHECKIN_FRONT, "src/types/admin/dashboard.ts")
fs.mkdirSync(path.dirname(typesDest), { recursive: true })
fs.copyFileSync(typesSrc, typesDest)
console.log("[copy-checkin-admin] copied: types/admin/dashboard.ts")

copyConfigFromMain()
copyLibFromMain()

const scanRoots = [
  path.join(CHECKIN_FRONT, "src/app/admin"),
  path.join(CHECKIN_FRONT, "src/lib/admin"),
  path.join(CHECKIN_FRONT, "src/hooks/admin"),
  path.join(CHECKIN_FRONT, "src/providers/admin"),
  path.join(CHECKIN_FRONT, "src/features/admin-auth"),
  path.join(CHECKIN_FRONT, "src/config/admin"),
  path.join(CHECKIN_FRONT, "src/types/admin"),
]

let updated = 0
for (const root of scanRoots) {
  for (const file of walk(root)) {
    if (file.endsWith("product-image-storage-stub.ts")) continue
    const original = fs.readFileSync(file, "utf8")
    const adminRel = file.startsWith(TARGET_BASE)
      ? path.relative(TARGET_BASE, file)
      : null
    const next = transformContent(original, adminRel ?? undefined)
    if (next !== original) {
      fs.writeFileSync(file, next)
      updated++
    }
  }
}

console.log(`[copy-checkin-admin] transformed ${updated} files`)

verifyNativeFiles()

require("./sync-checkin-menu-tree.cjs")

if (!process.exitCode) {
  require("node:child_process").execSync(
    "node script-system/verify/verify-checkin-admin-sync.mjs",
    { cwd: ROOT, stdio: "inherit" },
  )
}

