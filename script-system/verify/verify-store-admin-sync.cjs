/**
 * Kiểm tra admin store-sync sau generate: file native + route re-export.
 *
 * Usage: node script-system/verify/verify-store-admin-sync.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, PRODUCT_LINES } = require("../lib/monorepo-root.cjs");
const {
  verifyAdminHostLibDir,
  verifyAdminHostHooksDir,
  STORE_LIB_ADMIN_SUBSTANTIVE,
} = require("../lib/admin-host-lib-rules.cjs")
const { NEXT_APP_FORBIDDEN_SOURCE_PATTERNS } = require("../lib/import-alias-rules.cjs")

const STORE_FRONT = path.join(ROOT, PRODUCT_LINES["store-sync"].frontend.path)
const ADMIN_ROOT = path.join(STORE_FRONT, "src/app/admin")
const CONFIG_JSON = path.join(STORE_FRONT, "admin.app.config.json")
const PACKAGE_MODULES = path.join(ROOT, "packages/admin-app/src/modules")

function loadAdminConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_JSON, "utf8"))
}

const FORBIDDEN_IMPORTS = [
  ...NEXT_APP_FORBIDDEN_SOURCE_PATTERNS,
  {
    pattern: /@\/hooks\/(?:admin\/)?use-admin-mutation/,
    hint: "dùng @ui/hooks/use-admin-mutation",
    skipFiles: ["src/hooks/admin/use-admin-mutation.ts"],
  },
  {
    pattern: /@\/providers\/auth-provider(?!\.)/,
    hint: "dùng @/providers/admin/auth-provider",
  },
  {
    pattern: /@\/providers\/query-provider(?!\.)/,
    hint: "dùng @/providers/admin/query-provider",
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

function verifyGeneratedModules(errors, config) {
  for (const mod of config.modules ?? []) {
    const pkgMod = path.join(PACKAGE_MODULES, mod)
    if (!fs.existsSync(pkgMod)) {
      errors.push(`package thiếu module: packages/admin-app/src/modules/${mod}`)
    }
    const listPage = path.join(ADMIN_ROOT, mod, "page.tsx")
    if (!fs.existsSync(listPage)) {
      errors.push(`store thiếu generated route: src/app/admin/${mod}/page.tsx`)
      continue
    }
    const content = fs.readFileSync(listPage, "utf8")
    if (!content.includes("AUTO-GENERATED")) {
      errors.push(
        `src/app/admin/${mod}/page.tsx chưa re-export package — chạy pnpm admin:generate:store`,
      )
    }
  }
}

function verify() {
  const errors = []
  const config = loadAdminConfig()
  const nativeFiles = config.native?.files ?? []

  for (const rel of nativeFiles) {
    const p = path.join(ADMIN_ROOT, rel)
    if (!fs.existsSync(p)) {
      errors.push(`thiếu file native: src/app/admin/${rel}`)
    }
  }

  verifyGeneratedModules(errors, config)

  const dashRel = config.dashboard?.relativePath ?? null
  if (dashRel) {
    const dash = path.join(
      ADMIN_ROOT,
      dashRel.replace(/\/page\.tsx$/, ""),
      "page.tsx",
    )
    if (!fs.existsSync(dash)) {
      errors.push(`thiếu dashboard generated: src/app/admin/${dashRel}`)
    }
  }

  const menuPath = path.join(
    STORE_FRONT,
    "src/config/admin/store-admin-menu-tree.tsx",
  )
  if (!fs.existsSync(menuPath)) {
    errors.push("thiếu menu tree: src/config/admin/store-admin-menu-tree.tsx")
  }

  const scanRoots = [
    path.join(STORE_FRONT, "src/app/admin"),
    path.join(STORE_FRONT, "src/lib/admin"),
    path.join(STORE_FRONT, "src/providers/admin"),
    path.join(STORE_FRONT, "src/features/admin-auth"),
  ]

  for (const root of scanRoots) {
    for (const file of walk(root)) {
      const content = fs.readFileSync(file, "utf8")
      const rel = path.relative(STORE_FRONT, file).replace(/\\/g, "/")
      for (const { pattern, hint, skipFiles } of FORBIDDEN_IMPORTS) {
        if (skipFiles?.some((skip) => rel.endsWith(skip.replace(/\\/g, "/")))) {
          continue
        }
        if (pattern.test(content)) {
          errors.push(`${rel}: import chưa transform (${hint})`)
          break
        }
      }
    }
  }

  verifyAdminHostLibDir(errors, {
    libDir: path.join(STORE_FRONT, "src/lib/admin"),
    pathPrefix: "src/lib/admin/",
    substantiveBasenames: STORE_LIB_ADMIN_SUBSTANTIVE,
  })
  verifyAdminHostHooksDir(errors, {
    hooksDir: path.join(STORE_FRONT, "src/hooks/admin"),
    pathPrefix: "src/hooks/admin/",
    substantiveBasenames: new Set(),
  })

  if (errors.length) {
    console.error(
      "[verify:store-admin] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:store-admin] OK — ${config.modules.length} modules, ${nativeFiles.length} native files`,
  )
}

verify()
