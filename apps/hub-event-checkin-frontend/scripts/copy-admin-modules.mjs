import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, "..")
const backendApp = path.resolve(appRoot, "../../apps/backend/src/app")
const targetBase = path.resolve(
  appRoot,
  "src/app/(admin-checkin)/admin-checkin-su-kien",
)

const ADMIN_BASE = "/admin-checkin-su-kien"

const MODULES = [
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
]

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`skip missing: ${src}`)
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

function transformContent(content) {
  let out = content

  const modulePaths = [
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
    "events",
    "tong-quan",
  ]

  for (const mod of modulePaths) {
    const base = `${ADMIN_BASE}/${mod}`
    out = out
      .replaceAll(`useAdminCrudNavigation("/${mod}"`, `useAdminCrudNavigation("${base}"`)
      .replaceAll(`useAdminCrudNavigation('/${mod}'`, `useAdminCrudNavigation('${base}'`)
  }

  // Avoid double-prefix
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
    [/@\/app\/cameras\/_component/g, "@/lib/admin/cameras-query"],
    [/@\/types\//g, "@/types/admin/"],
  ]

  for (const [pattern, value] of replacements) {
    out = out.replace(pattern, value)
  }

  out = out
    .replace(/@\/lib\/admin\/admin\//g, "@/lib/admin/")
    .replace(/@\/hooks\/admin\/admin\//g, "@/hooks/admin/")
    .replace(/from "@\/lib"/g, 'from "@/lib/admin"')

  return out
}

// Copy modules
for (const mod of MODULES) {
  const src = path.join(backendApp, mod)
  const dest = path.join(targetBase, mod)
  if (fs.existsSync(dest)) {
    console.log(`exists, merge-copy: ${mod}`)
  }
  copyDir(src, dest)
  console.log(`copied: ${mod}`)
}

// Dashboard
const dashSrc = path.join(backendApp, "page.tsx")
const dashDest = path.join(targetBase, "tong-quan", "page.tsx")
fs.mkdirSync(path.dirname(dashDest), { recursive: true })
let dash = fs.readFileSync(dashSrc, "utf8")
dash = dash.replace(
  "bảng điều khiển quản trị HUB Parent",
  "bảng điều khiển quản trị HUB Check-in",
)
fs.writeFileSync(dashDest, dash)
console.log("copied: tong-quan/page.tsx")

// Types
const typesSrc = path.resolve(appRoot, "../../apps/backend/src/types/dashboard.ts")
const typesDest = path.resolve(appRoot, "src/types/admin/dashboard.ts")
fs.mkdirSync(path.dirname(typesDest), { recursive: true })
fs.copyFileSync(typesSrc, typesDest)
console.log("copied: types/admin/dashboard.ts")

// Transform all admin-checkin ts/tsx
const scanRoots = [
  path.join(appRoot, "src/app/(admin-checkin)"),
  path.join(appRoot, "src/lib/admin"),
  path.join(appRoot, "src/hooks/admin"),
  path.join(appRoot, "src/providers/admin"),
  path.join(appRoot, "src/features/admin-auth"),
  path.join(appRoot, "src/config/admin"),
  path.join(appRoot, "src/types/admin"),
]

let updated = 0
for (const root of scanRoots) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, "utf8")
    const next = transformContent(original)
    if (next !== original) {
      fs.writeFileSync(file, next)
      updated++
    }
  }
}

console.log(`transformed ${updated} files`)
