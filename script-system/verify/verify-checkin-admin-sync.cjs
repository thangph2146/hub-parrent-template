/**
 * Kiểm tra admin check-in sau sync: file native + import path chuẩn.
 *
 * Usage: node script-system/verify-checkin-admin-sync.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  buildCheckinMenu,
  verifyMenuOrderAgainstMain,
} = require("../sync/lib/build-checkin-menu.cjs")
const { loadAdminMenuItems } = require("../sync/lib/load-admin-menu-items.cjs")
const { ROOT, PRODUCT_LINES } = require("../lib/monorepo-root.cjs");
const { resolveAdminAppConfigFile } = require("../lib/admin-app-config-path.cjs")

const CHECKIN_FRONT = path.join(ROOT, PRODUCT_LINES["hub-checkin"].frontend.path)
const ADMIN_ROOT = path.join(CHECKIN_FRONT, "src/app/admin")
const CONFIG_JSON = resolveAdminAppConfigFile(CHECKIN_FRONT)
const CONFIG_LEGACY = path.join(CHECKIN_FRONT, "admin.sync-modules.json")
const PACKAGE_MODULES = path.join(ROOT, "packages/admin-app/src/modules")

function loadAdminConfig() {
  const pathToRead = CONFIG_JSON ?? (fs.existsSync(CONFIG_LEGACY) ? CONFIG_LEGACY : null)
  if (!pathToRead) {
    throw new Error("thiếu config/admin.app.config.json (check-in frontend)")
  }
  return JSON.parse(fs.readFileSync(pathToRead, "utf8"))
}
const MENU_TREE_PATH = path.join(
  CHECKIN_FRONT,
  "src/config/admin/checkin-admin-menu-tree.tsx",
)

const MODULE_HREF_OVERRIDES = { "file-storage": "/file-storage" }

function moduleToHref(mod) {
  return MODULE_HREF_OVERRIDES[mod] ?? `/${mod}`
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFC")
}

function jsonString(value) {
  return JSON.stringify(normalizeText(value))
}


const {
  CHECKIN_NATIVE_LIB_MODULES,
  NEXT_APP_FORBIDDEN_SOURCE_PATTERNS,
} = require("../lib/import-alias-rules.cjs")
const {
  verifyAdminHostLibDir,
  verifyAdminHostHooksDir,
  CHECKIN_LIB_ADMIN_SUBSTANTIVE,
} = require("../admin/lib/admin-host-lib-rules.cjs")

const FORBIDDEN_IMPORTS = [
  ...NEXT_APP_FORBIDDEN_SOURCE_PATTERNS,
  {
    pattern: /@\/hooks\/(?:admin\/)?use-admin-mutation/,
    hint: "dùng @ui/hooks/use-admin-mutation hoặc @ui/lib/admin-operation-toast",
    skipFiles: ["src/hooks/admin/use-admin-mutation.ts"],
  },
  {
    pattern: /@\/app\/(?!admin\/)/,
    hint: "dùng @/app/admin/... (path sau sync admin check-in)",
  },
  {
    pattern: /\.\.\/\.\.\/products\/_component\//,
    hint: "dùng @/lib/admin/product-image-storage-stub",
  },
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
    pattern: /@\/lib\/admin\/(?:portal|site)\//,
    hint: "dùng @/lib/portal/... hoặc @/lib/site/... (lib native check-in)",
  },
  {
    pattern: /@\/config\/event-portal-/,
    hint: "dùng @/config/portal/...",
  },
  {
    pattern: /@\/providers\/event-portal-/,
    hint: "dùng @/providers/portal/...",
  },
  {
    pattern: /@\/types\/admin\/admin\//,
    hint: "dùng @/types/admin/... (tránh double admin sau sync)",
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

function resolveTsModule(baseDir, subpath) {
  const candidates = [
    `${subpath}.ts`,
    `${subpath}.tsx`,
    path.join(subpath, "index.ts"),
    path.join(subpath, "index.tsx"),
  ]
  for (const candidate of candidates) {
    const full = path.join(baseDir, candidate)
    if (fs.existsSync(full)) return full
  }
  return null
}

function verifyCheckinLibAdminImports(errors) {
  const libAdmin = path.join(CHECKIN_FRONT, "src/lib/admin")
  const libRoot = path.join(CHECKIN_FRONT, "src/lib")
  const nativeSet = new Set(CHECKIN_NATIVE_LIB_MODULES)
  const importRe = /from\s+["']@\/lib\/admin\/([^"']+)["']/g
  const scanRoots = [
    path.join(CHECKIN_FRONT, "src/app/admin"),
    path.join(CHECKIN_FRONT, "src/lib/admin"),
    path.join(CHECKIN_FRONT, "src/providers/admin"),
    path.join(CHECKIN_FRONT, "src/features/admin-auth"),
  ]

  for (const root of scanRoots) {
    for (const file of walk(root)) {
      const content = fs.readFileSync(file, "utf8")
      const rel = path.relative(CHECKIN_FRONT, file).replace(/\\/g, "/")
      let match
      while ((match = importRe.exec(content))) {
        const sub = match[1]
        const top = sub.split("/")[0]
        if (sub === "admin") {
          errors.push(
            `${rel}: @/lib/admin/admin sai — dùng @/lib/admin (barrel index)`,
          )
          continue
        }
        const nativeOnly =
          (nativeSet.has(sub) && resolveTsModule(libRoot, sub)) ||
          (nativeSet.has(top) &&
            resolveTsModule(libRoot, top) &&
            !resolveTsModule(libAdmin, sub))
        if (nativeOnly) {
          errors.push(
            `${rel}: @/lib/admin/${sub} sai — dùng @/lib/${nativeSet.has(sub) ? sub : top} (lib native check-in)`,
          )
          continue
        }
        if (!resolveTsModule(libAdmin, sub)) {
          errors.push(
            `${rel}: không tồn tại module @/lib/admin/${sub}`,
          )
        }
      }
    }
  }
}

function verifyGeneratedModules(errors, config) {
  const modules = config.modules ?? []
  for (const mod of modules) {
    const pkgMod = path.join(PACKAGE_MODULES, mod)
    if (!fs.existsSync(pkgMod)) {
      errors.push(`package thiếu module: packages/admin-app/src/modules/${mod}`)
    }
    const listPage = path.join(ADMIN_ROOT, mod, "page.tsx")
    if (!fs.existsSync(listPage)) {
      errors.push(`check-in thiếu generated route: src/app/admin/${mod}/page.tsx`)
      continue
    }
    const content = fs.readFileSync(listPage, "utf8")
    if (!content.includes("AUTO-GENERATED")) {
      errors.push(
        `src/app/admin/${mod}/page.tsx chưa re-export package — chạy pnpm admin:generate:checkin`,
      )
    }
    const dupComponent = path.join(ADMIN_ROOT, mod, "_component")
    if (fs.existsSync(dupComponent)) {
      const preserveUnder = (
        config.nativePreserveInModules ??
        config.native?.preserveInModules ??
        []
      ).filter((rel) => rel.startsWith(`${mod}/_component/`))
      const extras = fs
        .readdirSync(dupComponent)
        .filter((name) => !preserveUnder.some((p) => p === `${mod}/_component/${name}`))
      if (extras.length > 0) {
        errors.push(
          `còn duplicate src/app/admin/${mod}/_component — chạy pnpm admin:generate:checkin --prune`,
        )
      }
    }
  }
}

function verify() {
  const errors = []
  const config = loadAdminConfig()
  const nativeFiles = config.native?.files ?? []
  const syncedModules = config.modules ?? []

  for (const rel of nativeFiles) {
    const p = path.join(ADMIN_ROOT, rel)
    if (!fs.existsSync(p)) {
      errors.push(`thiếu file native: src/app/admin/${rel}`)
    }
  }

  verifyGeneratedModules(errors, config)

  const dashRel =
    config.dashboard?.relativePath ?? config.copyDashboardTo ?? null
  if (dashRel) {
    const dash = path.join(ADMIN_ROOT, dashRel.replace(/\/page\.tsx$/, ""), "page.tsx")
    if (!fs.existsSync(dash)) {
      errors.push(`thiếu dashboard generated: src/app/admin/${dashRel}`)
    }
  }

  for (const rel of config.nativePreserveInModules ?? config.native?.preserveInModules ?? []) {
    const p = path.join(ADMIN_ROOT, rel)
    if (!fs.existsSync(p)) {
      errors.push(`thiếu file native preserve: src/app/admin/${rel}`)
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
        const mainMenu = loadAdminMenuItems()
        const builtMenu = buildCheckinMenu(mainMenu, config, moduleToHref)
        errors.push(
          ...verifyMenuOrderAgainstMain(mainMenu, builtMenu, config).map(
            (e) => `menu order: ${e}`,
          ),
        )
        for (const item of builtMenu) {
          const needle = `label: ${jsonString(item.label)}`
          if (!menuContent.includes(needle)) {
            errors.push(
              `menu tree thiếu hoặc lệch nhãn so với sync: ${normalizeText(item.label)}`,
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
      for (const { pattern, hint, skipFiles } of FORBIDDEN_IMPORTS) {
        if (skipFiles?.some((skip) => rel.endsWith(skip.replace(/\\/g, "/")))) {
          continue
        }
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

  verifyCheckinLibAdminImports(errors)

  verifyAdminHostLibDir(errors, {
    libDir: path.join(CHECKIN_FRONT, "src/lib/admin"),
    pathPrefix: "src/lib/admin/",
    substantiveBasenames: CHECKIN_LIB_ADMIN_SUBSTANTIVE,
  })
  verifyAdminHostHooksDir(errors, {
    hooksDir: path.join(CHECKIN_FRONT, "src/hooks/admin"),
    pathPrefix: "src/hooks/admin/",
    substantiveBasenames: new Set(),
  })

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
