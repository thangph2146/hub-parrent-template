/**
 * Kiểm tra alias import chuẩn trên mọi app Next (UI → @ui/, không bypass packages/).
 *
 * Usage: node script-system/verify/verify-import-aliases.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { ROOT } = require("../lib/paths.cjs")
const { NEXT_APP_PATHS } = require("../lib/monorepo-apps.cjs")
const {
  REQUIRED_UI_TSCONFIG_PATHS,
  NEXT_APP_FORBIDDEN_SOURCE_PATTERNS,
} = require("../lib/import-alias-rules.cjs")

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue
      walk(full, acc)
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      acc.push(full)
    }
  }
  return acc
}

function verifyTsconfigUiPaths(appRel) {
  const errors = []
  const tsconfigPath = path.join(ROOT, appRel, "tsconfig.json")
  if (!fs.existsSync(tsconfigPath)) {
    errors.push(`${appRel}: thiếu tsconfig.json`)
    return errors
  }

  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"))
  const paths = tsconfig.compilerOptions?.paths ?? {}

  for (const key of REQUIRED_UI_TSCONFIG_PATHS) {
    if (!paths[key]) {
      errors.push(
        `${appRel}/tsconfig.json thiếu paths["${key}"] → packages/ui`,
      )
    }
  }

  return errors
}

function verifySourceImports(appRel) {
  const errors = []
  const srcRoot = path.join(ROOT, appRel, "src")
  if (!fs.existsSync(srcRoot)) return errors

  for (const file of walk(srcRoot)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/")
    const content = fs.readFileSync(file, "utf8")

    for (const { pattern, hint, skipFiles } of NEXT_APP_FORBIDDEN_SOURCE_PATTERNS) {
      if (skipFiles?.some((skip) => rel.endsWith(skip.replace(/\\/g, "/")))) {
        continue
      }
      if (pattern.test(content)) {
        errors.push(`${rel}: import không chuẩn (${hint})`)
        break
      }
    }
  }

  return errors
}

function verify() {
  const errors = []

  for (const appRel of NEXT_APP_PATHS) {
    const abs = path.join(ROOT, appRel)
    if (!fs.existsSync(abs)) {
      errors.push(`thiếu app Next: ${appRel}`)
      continue
    }
    errors.push(...verifyTsconfigUiPaths(appRel))
    errors.push(...verifySourceImports(appRel))
  }

  if (errors.length) {
    console.error(
      "[verify:imports] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:imports] OK — ${NEXT_APP_PATHS.length} app Next, alias @ui/* + workspace packages`,
  )
}

verify()
