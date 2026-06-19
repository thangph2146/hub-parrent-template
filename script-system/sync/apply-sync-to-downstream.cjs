/**
 * Áp dụng sync core từ template upstream sang repo downstream local (dev only).
 * Sau khi push template, downstream dùng `pnpm pull:template` thay vì script này.
 *
 * Usage (từ mono-repo-template):
 *   node script-system/sync/apply-sync-to-downstream.cjs hub-checkin ../hub-checkin-monorepo
 *   node script-system/sync/apply-sync-to-downstream.cjs hub-checkin ../hub-checkin-monorepo --with-apps
 *   node script-system/sync/apply-sync-to-downstream.cjs hub-checkin ../hub-checkin-monorepo --with-graphify
 *   node script-system/sync/apply-sync-to-downstream.cjs hub-parent ../hub-parent-monorepo
 *   node script-system/sync/apply-sync-to-downstream.cjs store-sync ../store-sync-monorepo
 */
const fs = require("node:fs")
const path = require("node:path")

const { ROOT } = require("../lib/monorepo-root.cjs")

const TEMPLATE_DIR = path.join(ROOT, "script-system/template")

const SYNC_FILES = [
  ".gitignore",
  "AGENTS.md",
  "apps/README.md",
  "docs/TEMPLATE_MONOREPO.md",
]

const SYNC_DIRS = [
  "packages",
  "script-system/admin",
  "script-system/db",
  "script-system/dev",
  "script-system/env",
  "script-system/git",
  "script-system/lib",
  "script-system/sync/lib",
  "script-system/verify",
  "docs/admin-pattern",
  "docs/api-pattern",
  "docs/api-client-pattern",
  "docs/ui-pattern",
  "docs/env",
  "docs/steps",
]

const GRAPHIFY_DIRS = [
  ".graphify",
]

const SYNC_SCRIPT_FILES = [
  "script-system/README.md",
  "script-system/sync/downstream-sync-profile.cjs",
  "script-system/sync/post-pull-downstream.cjs",
  "script-system/sync/pull-template.cjs",
  "script-system/sync/sync-checkin-menu-tree.cjs",
  "script-system/sync/sync-checkin-packages.cjs",
  "script-system/sync/sync-parent.cjs",
]

const PRUNE_PATHS = [
  "script-system/api",
  "script-system/graphify",
  "script-system/template",
  "script-system/sync/apply-sync-to-downstream.cjs",
  ["script-system", "sync", "deprecated"].join("/"),
  "script-system/sync/init-downstream.cjs",
  "script-system/sync/sync-api-from-main.cjs",
  "script-system/git/push-deploy-branches.cjs",
]

function deployApiScriptPrune(lineKey) {
  return [
    `apps/${lineKey}/api/scripts/test-live-admin-api.ts`,
    `apps/${lineKey}/api/scripts/migrate-entity-ids.mjs`,
    `apps/${lineKey}/api/scripts/migrate-entity-ids-queries.mjs`,
    `apps/${lineKey}/api/scripts/fix-entity-id-imports.mjs`,
    `apps/${lineKey}/api/scripts/lib/mirror-admin-post-form.ts`,
    `apps/${lineKey}/api/src/scripts/mark-migrations-executed.ts`,
  ]
}

const APP_SYNC = {
  "hub-checkin": {
    files: [
      "apps/hub-checkin/api/package.json",
      "apps/hub-checkin/api/api.app.config.json",
      "apps/hub-checkin/README.md",
    ],
    dirs: [
      "apps/hub-checkin/hub-checkin-frontend",
    ],
    pruneDirs: [
      "apps/hub-checkin/api/.graphify",
      "apps/hub-checkin/hub-checkin-frontend/.graphify",
    ],
    pruneFiles: [
      ...deployApiScriptPrune("hub-checkin"),
      "apps/hub-checkin/api/scripts/ensure-face-data-hanet-columns.ts",
    ],
  },
  "hub-parent": {
    files: [
      "apps/hub-parent/api/package.json",
      "apps/hub-parent/hub-parent-frontend/package.json",
      "apps/hub-parent/hub-parent-frontend/admin.app.config.json",
      "apps/hub-parent/hub-parent-frontend/src/components/shared/header.tsx",
      "apps/hub-parent/hub-parent-frontend/src/features/auth/admin-bridge.ts",
    ],
    dirs: [
      "apps/hub-parent/hub-parent-frontend/src/app/admin/dashboard",
      "apps/hub-parent/hub-parent-frontend/src/app/admin/login",
      "apps/hub-parent/hub-parent-frontend/src/app/admin/register",
    ],
    pruneDirs: [
      "apps/hub-parent/api/.graphify",
      "apps/hub-parent/hub-parent-frontend/.graphify",
      "apps/hub-parent/hub-parent-frontend/src/app/admin/tong-quan",
      "apps/hub-parent/hub-parent-frontend/src/app/admin/dang-nhap",
      "apps/hub-parent/hub-parent-frontend/src/app/admin/dang-ky",
    ],
    pruneFiles: [
      ...deployApiScriptPrune("hub-parent"),
      "apps/hub-parent/hub-parent-frontend/pnpm-lock.yaml",
    ],
  },
  "store-sync": {
    files: [
      "apps/store-sync/api/package.json",
      "apps/store-sync/store-sync-frontend/package.json",
      "apps/store-sync/store-sync-frontend/admin.app.config.json",
    ],
    dirs: [
      "apps/store-sync/store-sync-frontend/src/app/admin/dashboard",
      "apps/store-sync/store-sync-frontend/src/app/admin/login",
      "apps/store-sync/store-sync-frontend/src/app/admin/register",
    ],
    pruneDirs: [
      "apps/store-sync/api/.graphify",
      "apps/store-sync/store-sync-frontend/.graphify",
      "apps/store-sync/store-sync-frontend/src/app/admin/tong-quan",
      "apps/store-sync/store-sync-frontend/src/app/admin/dang-nhap",
      "apps/store-sync/store-sync-frontend/src/app/admin/dang-ky",
    ],
    pruneFiles: [
      ...deployApiScriptPrune("store-sync"),
      "apps/store-sync/store-sync-frontend/pnpm-lock.yaml",
    ],
  },
}

const lineKey = process.argv[2]
const destArg = process.argv[3]
const flags = new Set(process.argv.slice(4))
const shouldSyncApps = flags.has("--with-apps")
const shouldSyncGraphify = flags.has("--with-graphify")

if (!lineKey || !destArg) {
  console.error(
    "Usage: node apply-sync-to-downstream.cjs <hub-checkin|hub-parent|store-sync> <dest-dir> [--with-apps] [--with-graphify]",
  )
  process.exit(1)
}

const destRoot = path.resolve(destArg)
if (!fs.existsSync(destRoot)) {
  console.error(`[apply-sync] Không tìm thấy: ${destRoot}`)
  process.exit(1)
}

const packageTpl = path.join(TEMPLATE_DIR, `package.${lineKey}.json`)
const readmeTpl = path.join(TEMPLATE_DIR, `README.${lineKey}.json`)
const readmeMdTpl = path.join(TEMPLATE_DIR, `README.${lineKey}.md`)

console.log(`[apply-sync] ${lineKey} → ${destRoot}\n`)
if (!shouldSyncApps) {
  console.log("[apply-sync] apps/* giữ local — thêm --with-apps nếu đang migration/bootstrap app")
}
if (!shouldSyncGraphify) {
  console.log("[apply-sync] .graphify là generated cache — thêm --with-graphify nếu cần copy artifact\n")
}

function sleepSync(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    /* Windows: chờ Next/dev/indexer nhả handle khi prune app migration */
  }
}

function rmDirForce(target, label, options = {}) {
  let lastErr
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.rmSync(target, { recursive: true, force: true })
      return true
    } catch (err) {
      lastErr = err
      const retryable = ["EBUSY", "EPERM", "ENOTEMPTY"].includes(err?.code)
      if (!retryable || attempt === 7) break
      sleepSync(120 * (attempt + 1))
    }
  }
  if (!options.quiet) {
    console.warn(`[apply-sync] skip prune locked ${label}: ${lastErr?.code ?? lastErr}`)
  }
  return false
}

const files = [...SYNC_FILES]
files.push(...SYNC_SCRIPT_FILES)
if (shouldSyncApps) {
  files.push(...(APP_SYNC[lineKey]?.files ?? []))
}

function copyPath(rel) {
  const from = path.join(ROOT, rel)
  const to = path.join(destRoot, rel)
  if (!fs.existsSync(from)) {
    console.warn(`[apply-sync] skip missing: ${rel}`)
    return
  }
  const stat = fs.statSync(from)
  if (stat.isDirectory()) {
    const appDirs = APP_SYNC[lineKey]?.dirs ?? []
    const allowLockedMerge = shouldSyncApps && appDirs.includes(rel)
    const removed = fs.existsSync(to) ? rmDirForce(to, rel, { quiet: allowLockedMerge }) : true
    if (!removed && !allowLockedMerge) {
      return
    }
    fs.cpSync(from, to, {
      recursive: true,
      filter(source) {
        const name = path.basename(source)
        if (["node_modules", ".next", "dist", ".turbo"].includes(name)) return false
        return shouldSyncGraphify || name !== ".graphify"
      },
    })
    if (!removed && allowLockedMerge) {
      console.log(`[apply-sync] merged locked app dir ${rel}/`)
      return
    }
    console.log(`[apply-sync] copied ${rel}/`)
    return
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  console.log(`[apply-sync] copied ${rel}`)
}

const dirs = [
  ...SYNC_DIRS,
  ...(shouldSyncGraphify ? GRAPHIFY_DIRS : []),
  ...(shouldSyncApps ? APP_SYNC[lineKey]?.dirs ?? [] : []),
]

for (const rel of [...files, ...dirs]) {
  copyPath(rel)
}

for (const rel of PRUNE_PATHS) {
  const target = path.join(destRoot, rel)
  if (fs.existsSync(target)) {
    if (fs.statSync(target).isDirectory()) {
      if (rmDirForce(target, rel)) {
        console.log(`[apply-sync] pruned ${rel}`)
      }
    } else {
      fs.rmSync(target, { force: true })
      console.log(`[apply-sync] pruned ${rel}`)
    }
  }
}

if (shouldSyncApps) {
  for (const rel of APP_SYNC[lineKey]?.pruneDirs ?? []) {
    const target = path.join(destRoot, rel)
    if (fs.existsSync(target)) {
      if (rmDirForce(target, rel)) {
        console.log(`[apply-sync] pruned ${rel}`)
      }
    }
  }
  for (const rel of APP_SYNC[lineKey]?.pruneFiles ?? []) {
    const target = path.join(destRoot, rel)
    if (fs.existsSync(target)) {
      fs.rmSync(target, { force: true })
      console.log(`[apply-sync] pruned ${rel}`)
    }
  }
}

if (fs.existsSync(packageTpl)) {
  fs.copyFileSync(packageTpl, path.join(destRoot, "package.json"))
  console.log("[apply-sync] copied package.json")
}

const readmeSrc = fs.existsSync(readmeMdTpl)
  ? readmeMdTpl
  : fs.existsSync(readmeTpl)
    ? readmeTpl
    : null
if (readmeSrc) {
  fs.copyFileSync(readmeSrc, path.join(destRoot, "README.md"))
  console.log("[apply-sync] copied README.md")
}

console.log("\n[apply-sync] xong — trên downstream chạy: pnpm post-pull:downstream")
