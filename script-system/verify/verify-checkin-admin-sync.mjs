/**
 * Kiểm tra admin check-in sau sync: file native + import path chuẩn.
 *
 * Usage: node script-system/verify-checkin-admin-sync.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const {
  buildCheckinMenu,
  verifyMenuOrderAgainstMain,
} = require("../sync/lib/build-checkin-menu.cjs")
const { ROOT } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

const CHECKIN_FRONT = path.join(ROOT, PRODUCT_LINES["hub-event"].frontend.path)
const MAIN_BACKEND = path.join(ROOT, PRODUCT_LINES.main.backend.path)
const ADMIN_ROOT = path.join(CHECKIN_FRONT, "src/app/admin")
const CONFIG_PATH = path.join(CHECKIN_FRONT, "admin.sync-modules.json")
const MENU_TREE_PATH = path.join(
  CHECKIN_FRONT,
  "src/config/admin/checkin-admin-menu-tree.tsx",
)

const MODULE_HREF_OVERRIDES = { "file-storage": "/file-storage" }

function moduleToHref(mod) {
  return MODULE_HREF_OVERRIDES[mod] ?? `/${mod}`
}

function loadMainMenuItems() {
  const exportScript = path.join(
    MAIN_BACKEND,
    "scripts/export-menu-items.mts",
  )
  const apiDir = path.join(ROOT, PRODUCT_LINES.main.api.path)
  const raw = execSync(`npx tsx "${exportScript}"`, {
    cwd: apiDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  })
  return JSON.parse(raw)
}

const FORBIDDEN_IMPORTS = [
  { pattern: /@\/app\/events\//, hint: "dùng @/app/admin/_component" },
  { pattern: /@\/app\/products\//, hint: "dùng @/lib/admin/product-image-storage-stub" },
  {
    pattern: /@\/providers\/auth-provider(?!\.)/,
    hint: "dùng @/providers/admin/auth-provider",
  },
  {
    pattern: /@\/providers\/query-provider(?!\.)/,
    hint: "dùng @/providers/admin/query-provider",
  },
  { pattern: /@\/config\/admin-menu-tree/, hint: "dùng @/config/admin/checkin-admin-menu-tree" },
  {
    pattern: /@\/config\/admin-layout-static/,
    hint: "dùng @/config/admin/checkin-admin-layout-static",
  },
  {
    pattern: /@\/lib\/admin\/checkin-session-exclusive/,
    hint: "dùng @/lib/checkin-session-exclusive (lib native check-in)",
  },
]

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function verify() {
  const errors = []
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
  const nativeFiles = config.native?.files ?? []
  const syncedModules = config.modules ?? []

  for (const rel of nativeFiles) {
    const p = path.join(ADMIN_ROOT, rel)
    if (!fs.existsSync(p)) {
      errors.push(`thiếu file native: src/app/admin/${rel}`)
    }
  }

  const libRequired = config.libFromMain ?? []
  for (const item of libRequired) {
    const destRel =
      item.to ?? `src/lib/admin/${path.basename(item.from)}`
    const p = path.join(CHECKIN_FRONT, destRel)
    if (!fs.existsSync(p)) {
      errors.push(`thiếu lib sync: ${destRel}`)
    }
  }

  const stubPath = path.join(
    CHECKIN_FRONT,
    "src/lib/admin/product-image-storage-stub.ts",
  )
  if (!fs.existsSync(stubPath)) {
    errors.push("thiếu stub: src/lib/admin/product-image-storage-stub.ts")
  }

  for (const mod of syncedModules) {
    const mainMod = path.join(MAIN_BACKEND, "src/app", mod)
    if (!fs.existsSync(mainMod)) {
      errors.push(`main/backend thiếu module nguồn: src/app/${mod}`)
    }
    const checkinMod = path.join(ADMIN_ROOT, mod)
    if (!fs.existsSync(checkinMod)) {
      errors.push(`check-in thiếu module đã sync: src/app/admin/${mod}`)
    }
  }

  if (config.copyDashboardTo) {
    const dash = path.join(ADMIN_ROOT, config.copyDashboardTo)
    if (!fs.existsSync(dash)) {
      errors.push(`thiếu dashboard sync: src/app/admin/${config.copyDashboardTo}`)
    }
  }

  for (const rel of config.configFromMain ?? []) {
    const dest = path.join(
      CHECKIN_FRONT,
      "src/config/admin",
      path.basename(rel),
    )
    if (!fs.existsSync(dest)) {
      errors.push(`thiếu config sync: src/config/admin/${path.basename(rel)}`)
    }
  }

  if (!fs.existsSync(MENU_TREE_PATH)) {
    errors.push("thiếu menu tree: src/config/admin/checkin-admin-menu-tree.tsx")
  } else {
    const menuContent = fs.readFileSync(MENU_TREE_PATH, "utf8")
    if (!menuContent.includes("AUTO-GENERATED")) {
      errors.push(
        "checkin-admin-menu-tree.tsx chưa auto-generated — chạy pnpm pull:checkin",
      )
    } else {
      try {
        const mainMenu = loadMainMenuItems()
        const builtMenu = buildCheckinMenu(mainMenu, config, moduleToHref)
        errors.push(
          ...verifyMenuOrderAgainstMain(mainMenu, builtMenu, config).map(
            (e) => `menu order: ${e}`,
          ),
        )
        for (const item of builtMenu) {
          const needle = `label: ${JSON.stringify(item.label)}`
          if (!menuContent.includes(needle)) {
            errors.push(
              `menu tree thiếu hoặc lệch nhãn so với sync: ${item.label}`,
            )
          }
        }
      } catch (e) {
        errors.push(`menu order verify lỗi: ${e.message}`)
      }
    }
  }

  const scanRoots = [
    path.join(CHECKIN_FRONT, "src/app/admin"),
    path.join(CHECKIN_FRONT, "src/lib/admin"),
    path.join(CHECKIN_FRONT, "src/providers/admin"),
    path.join(CHECKIN_FRONT, "src/features/admin-auth"),
  ]

  const roleSkip = new Set(config.pageGuardRoleModulesSkip ?? ["settings"])

  for (const root of scanRoots) {
    for (const file of walk(root)) {
      if (file.includes("product-image-storage-stub.ts")) continue
      const content = fs.readFileSync(file, "utf8")
      const rel = path.relative(CHECKIN_FRONT, file).replace(/\\/g, "/")
      for (const { pattern, hint } of FORBIDDEN_IMPORTS) {
        if (pattern.test(content)) {
          errors.push(`${rel}: import chưa transform (${hint})`)
          break
        }
      }
      if (!/<AdminPageGuard\s+roles=/.test(content)) continue
      const mod = rel.replace(/^src\/app\/admin\//, "").split("/")[0]
      if (syncedModules.includes(mod) && !roleSkip.has(mod)) {
        errors.push(
          `${rel}: còn AdminPageGuard roles — cần permission (chạy lại sync)`,
        )
      }
    }
  }

  if (errors.length) {
    console.error(
      "[verify:checkin-admin] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:checkin-admin] OK — ${syncedModules.length} modules, ${nativeFiles.length} native files, imports sạch`,
  )
}

verify()
