/**
 * Sửa import @/ còn sót trong packages/admin-app sau migrate.
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const { MODULE_IDS } = require("./lib/rewrite-package-imports.cjs")

const PKG_SRC = path.join(ROOT, "packages/admin-app/src")

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

/** @param {string} content @param {string} filePath */
function fixContent(content, filePath) {
  let out = content

  out = out.replace(/from ["']@\/lib["']/g, 'from "@workspace/admin-app/lib"')
  out = out.replace(/@\/lib\//g, "@workspace/admin-app/lib/")
  out = out.replace(
    /@\/config\/protected-admin/g,
    "@workspace/admin-app/config/protected-admin",
  )
  out = out.replace(
    /@\/features\/auth\//g,
    "@workspace/admin-app/modules/auth/_lib/",
  )
  out = out.replace(/@\/types\//g, "@workspace/admin-app/types/")
  out = out.replace(
    /@\/providers\/auth-provider/g,
    "@workspace/admin-app/runtime",
  )
  out = out.replace(
    /import\s+\{\s*useAuth\s*\}\s+from\s+["']@workspace\/admin-app\/runtime["']/g,
    'import { useAdminAuth as useAuth } from "@workspace/admin-app/runtime"',
  )

  for (const mod of MODULE_IDS) {
    out = out.replace(
      new RegExp(`useAdminCrudNavigation\\(\`/${mod}\``, "g"),
      `useAdminModuleNavigation("${mod}"`,
    )
    out = out.replace(
      new RegExp(`useAdminCrudNavigation\\("/${mod}"`, "g"),
      `useAdminModuleNavigation("${mod}"`,
    )
  }

  if (
    filePath.includes(`${path.sep}runtime${path.sep}`) ||
    filePath.endsWith(`${path.sep}use-admin-module-navigation.ts`)
  ) {
    return out
  }

  if (
    out.includes("useAdminModuleNavigation(") &&
    !out.includes("useAdminCrudNavigation(")
  ) {
    out = out.replace(
      /import \{ useAdminCrudNavigation \} from ["']@workspace\/admin-app\/lib\/admin-navigation["']\s*\n/g,
      "",
    )
  }

  if (out.includes("useAdminModuleNavigation(") && !out.includes("useAdminModuleNavigation }")) {
    if (/from ["']@workspace\/admin-app\/runtime["']/.test(out)) {
      out = out.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@workspace\/admin-app\/runtime["']/,
        (line, specs) => {
          if (/\buseAdminModuleNavigation\b/.test(specs)) return line
          return `import {${specs.trim()}, useAdminModuleNavigation } from "@workspace/admin-app/runtime"`
        },
      )
    } else if (!out.includes('import { useAdminModuleNavigation }')) {
      out = out.replace(
        /^(["']use client["']\s*\n)/,
        `$1import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"\n`,
      )
    }
  }

  return out
}

let fixed = 0
for (const file of walk(PKG_SRC)) {
  const raw = fs.readFileSync(file, "utf8")
  const next = fixContent(raw, file)
  if (next !== raw) {
    fs.writeFileSync(file, next)
    fixed++
  }
}

console.log(`[fix-admin-package-imports] updated ${fixed} files`)
