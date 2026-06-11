/**
 * Generate thin Next.js pages từ admin.app.config.json + @workspace/admin-app modules.
 * Tùy chọn --prune: xóa source duplicate trước khi generate (check-in).
 *
 * Usage:
 *   node script-system/admin/generate-admin-routes.cjs apps/hub-event/hub-event-checkin-frontend --prune
 *   node script-system/admin/generate-admin-routes.cjs apps/main/backend
 */
const fs = require("node:fs")
const path = require("node:path")
const { execSync } = require("node:child_process")
const { ROOT } = require("../lib/paths.cjs")

const PACKAGE_MODULES = path.join(ROOT, "packages/admin-app/src/modules")
const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm admin:generate */\n`
const ROUTE_FILES = new Set(["page.tsx", "loading.tsx"])

function sleepSync(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    /* Windows: chờ index/antivirus sau prune */
  }
}

function isRetryableFsError(err) {
  return (
    err?.code === "EBUSY" ||
    err?.code === "EPERM" ||
    err?.code === "UNKNOWN" ||
    err?.errno === -4094
  )
}

function withFsRetry(label, fn, { retries = 8, delayMs = 80 } = {}) {
  let lastErr
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return fn()
    } catch (err) {
      lastErr = err
      if (!isRetryableFsError(err) || attempt === retries - 1) throw err
      const wait = delayMs * (attempt + 1)
      console.warn(
        `[admin:generate] ${label} retry ${attempt + 1}/${retries - 1} (${err.code ?? err.errno}) — chờ ${wait}ms`,
      )
      sleepSync(wait)
    }
  }
  throw lastErr
}

function readConfig(appRel) {
  const jsonPath = path.join(ROOT, appRel, "admin.app.config.json")
  const legacyPath = path.join(ROOT, appRel, "admin.sync-modules.json")
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, "utf8"))
  }
  if (fs.existsSync(legacyPath)) {
    const legacy = JSON.parse(fs.readFileSync(legacyPath, "utf8"))
    return {
      id: appRel.includes("checkin") ? "hub-checkin" : "hub-main",
      basePath: appRel.includes("checkin") ? "/admin" : "",
      title: legacy.description ?? "Admin",
      modules: legacy.modules ?? [],
      menu: legacy.menu,
      dashboard: legacy.copyDashboardTo
        ? {
            relativePath: legacy.copyDashboardTo.replace(/\/page\.tsx$/, ""),
            subtitle: legacy.dashboardSubtitleReplace?.to,
          }
        : undefined,
      native: legacy.native,
      nativePreserveInModules: legacy.native?.preserveInModules,
    }
  }
  throw new Error(`Không tìm thấy admin.app.config.json tại ${appRel}`)
}

function routeRootFor(appRel, config) {
  const appRoot = path.join(ROOT, appRel)
  const basePath = config.basePath ?? ""
  if (basePath === "" || basePath === "/") {
    return path.join(appRoot, "src/app")
  }
  return path.join(appRoot, "src/app", basePath.replace(/^\//, ""))
}

/** `page.tsx` (root), `tong-quan/page.tsx` → dir rỗng hoặc `tong-quan`. */
function resolveDashboardRelDir(relativePath) {
  const withoutPage = (relativePath ?? "tong-quan/page.tsx").replace(
    /\/page\.tsx$/,
    "",
  )
  if (!withoutPage || withoutPage === "page.tsx" || withoutPage === ".") {
    return ""
  }
  return withoutPage
}

function dashboardPageDest(routeRoot, relativePath) {
  const relDir = resolveDashboardRelDir(relativePath)
  return relDir
    ? path.join(routeRoot, relDir, "page.tsx")
    : path.join(routeRoot, "page.tsx")
}

function discoverPackageRoutes(moduleId) {
  const modRoot = path.join(PACKAGE_MODULES, moduleId)
  if (!fs.existsSync(modRoot)) return []

  const routes = []
  function walk(relDir) {
    const full = path.join(modRoot, relDir)
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(relDir, entry.name))
        continue
      }
      if (!ROUTE_FILES.has(entry.name)) continue
      const routeRel = path.join(relDir, entry.name).replace(/\\/g, "/")
      routes.push(routeRel)
    }
  }
  walk("")
  return routes
}

function packageExport(moduleId, routeFile) {
  const withoutExt = routeFile.replace(/\.tsx$/, "")
  return `@workspace/admin-app/modules/${moduleId}/${withoutExt}`
}

function writeGeneratedPage(destFile, exportPath) {
  const content = `${GENERATED_BANNER}export { default } from "${exportPath}"\n`
  withFsRetry(`write ${path.basename(destFile)}`, () => {
    fs.mkdirSync(path.dirname(destFile), { recursive: true })
    fs.writeFileSync(destFile, content)
  })
}

function backupPreserveFiles(routeRoot, preserveList) {
  const backups = []
  for (const rel of preserveList ?? []) {
    const filePath = path.join(routeRoot, rel)
    if (fs.existsSync(filePath)) {
      backups.push({ rel, content: fs.readFileSync(filePath) })
    }
  }
  return backups
}

function restorePreserveFiles(routeRoot, backups) {
  for (const { rel, content } of backups) {
    const filePath = path.join(routeRoot, rel)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content)
    console.log(`[admin:generate] preserved: ${rel}`)
  }
}

function pruneModuleDuplicates(routeRoot, config) {
  const preserveInModules = config.nativePreserveInModules ?? config.native?.preserveInModules ?? []
  const backups = backupPreserveFiles(routeRoot, preserveInModules)

  for (const mod of config.modules ?? []) {
    const modDir = path.join(routeRoot, mod)
    if (!fs.existsSync(modDir)) continue

    const preserveUnderMod = new Set(
      preserveInModules
        .filter((rel) => rel.startsWith(`${mod}/`))
        .map((rel) => rel.slice(`${mod}/`.length)),
    )

    for (const entry of fs.readdirSync(modDir, { withFileTypes: true })) {
      const rel = entry.name
      if (preserveUnderMod.has(rel)) continue
      const full = path.join(modDir, rel)
      if (entry.isDirectory()) {
        if (rel === "_component" && preserveUnderMod.size > 0) {
          for (const sub of fs.readdirSync(full)) {
            const subRel = `_component/${sub}`
            if (preserveUnderMod.has(subRel)) continue
            fs.rmSync(path.join(full, sub), { recursive: true, force: true })
          }
          const remaining = fs.readdirSync(full)
          if (remaining.length === 0) fs.rmdirSync(full)
          continue
        }
        fs.rmSync(full, { recursive: true, force: true })
      } else if (entry.isFile()) {
        const content = fs.readFileSync(full, "utf8")
        if (!content.includes("AUTO-GENERATED")) {
          fs.unlinkSync(full)
        }
      }
    }
    console.log(`[admin:generate] pruned duplicate: ${path.relative(ROOT, modDir)}`)
  }

  restorePreserveFiles(routeRoot, backups)

  if (config.dashboard?.relativePath) {
    const relDir = resolveDashboardRelDir(config.dashboard.relativePath)
    const dashPage = dashboardPageDest(routeRoot, config.dashboard.relativePath)
    if (fs.existsSync(dashPage)) {
      const content = fs.readFileSync(dashPage, "utf8")
      if (!content.includes("AUTO-GENERATED")) {
        fs.unlinkSync(dashPage)
      }
    }
    if (relDir) {
      const dashDir = path.join(routeRoot, relDir)
      if (fs.existsSync(dashDir) && fs.readdirSync(dashDir).length === 0) {
        fs.rmdirSync(dashDir)
      }
    }
  }
}

function generateRoutes(appRel, config) {
  const routeRoot = routeRootFor(appRel, config)
  const nativeFiles = new Set(config.native?.files ?? [])
  let count = 0

  for (const mod of config.modules ?? []) {
    for (const routeFile of discoverPackageRoutes(mod)) {
      const relUnderAdmin = `${mod}/${routeFile}`
      if ([...nativeFiles].some((p) => relUnderAdmin === p || relUnderAdmin.startsWith(`${p}/`))) {
        continue
      }
      const dest = path.join(routeRoot, mod, routeFile)
      writeGeneratedPage(dest, packageExport(mod, routeFile))
      count++
    }
  }

  if (config.dashboard?.relativePath) {
    const dashPkg = path.join(PACKAGE_MODULES, "dashboard/page.tsx")
    const dest = dashboardPageDest(routeRoot, config.dashboard.relativePath)
    if (fs.existsSync(dashPkg)) {
      writeGeneratedPage(dest, packageExport("dashboard", "page.tsx"))
      count++
    }
  }

  console.log(
    `[admin:generate] ${appRel}: ${count} route re-exports → ${path.relative(ROOT, routeRoot)}`,
  )
  return count
}

function generateMenuIfCheckin(appRel) {
  if (!appRel.includes("hub-event-checkin-frontend")) return
  execSync("node script-system/sync/sync-checkin-menu-tree.cjs", {
    cwd: ROOT,
    stdio: "inherit",
  })
}

const appRel = process.argv[2]
const shouldPrune = process.argv.includes("--prune")

if (!appRel) {
  console.error(
    "Usage: node generate-admin-routes.cjs <app-relative-path> [--prune]",
  )
  process.exit(1)
}

const config = readConfig(appRel)
const routeRoot = routeRootFor(appRel, config)

if (shouldPrune) {
  pruneModuleDuplicates(routeRoot, config)
  sleepSync(150)
}

generateRoutes(appRel, config)
generateMenuIfCheckin(appRel)
