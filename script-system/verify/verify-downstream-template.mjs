/**
 * Verify repo downstream đúng mô hình packages-first template.
 *
 * Usage: node script-system/verify/verify-downstream-template.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { ROOT } = require("../lib/paths.cjs")

const MANIFEST = path.join(ROOT, "template.manifest.json")
const REQUIRED_PACKAGES = [
  "packages/ui",
  "packages/admin-app",
  "packages/api-client",
  "packages/api-server",
  "packages/query-client",
  "packages/eslint-config",
  "packages/typescript-config",
]

const COMPOSITION_PACKAGES = ["packages/admin-app", "packages/api-server"]

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) {
    console.error("[verify:template-downstream] Thiếu template.manifest.json")
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"))
}

function verify() {
  const manifest = loadManifest()
  const errors = []

  if (manifest.role !== "downstream") {
    console.log(
      `[verify:template-downstream] skip — role=${manifest.role ?? "unknown"} (chỉ kiểm downstream)`,
    )
    return
  }

  if (fs.existsSync(path.join(ROOT, "apps/main"))) {
    errors.push("apps/main không được có trên downstream — dev trên template upstream")
  }

  for (const pkg of REQUIRED_PACKAGES) {
    if (!fs.existsSync(path.join(ROOT, pkg, "package.json"))) {
      errors.push(`thiếu ${pkg}/package.json — chạy pnpm pull:template`)
    }
  }

  for (const pkg of COMPOSITION_PACKAGES) {
    if (!fs.existsSync(path.join(ROOT, pkg, "package.json"))) {
      errors.push(`thiếu lớp compose ${pkg} — bắt buộc cho hub-event template`)
    }
  }

  if (manifest.productLine === "hub-event" || manifest.primary) {
    const adminPkg = path.join(ROOT, "packages/admin-app/package.json")
    const apiPkg = path.join(ROOT, "packages/api-server/package.json")
    if (fs.existsSync(adminPkg) && fs.existsSync(apiPkg)) {
      /* composition OK */
    }
  }

  if (!fs.existsSync(path.join(ROOT, ".template-lock.json"))) {
    errors.push("thiếu .template-lock.json — chạy pnpm pull:template")
  }

  const appsDir = path.join(ROOT, "apps")
  if (!fs.existsSync(appsDir)) {
    errors.push("thiếu apps/")
  } else {
    const lines = fs
      .readdirSync(appsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
    if (lines.length === 0) {
      errors.push("apps/ trống — cần ít nhất một product line")
    }
    if (manifest.productLine && !lines.includes(manifest.productLine)) {
      errors.push(`productLine=${manifest.productLine} không có trong apps/`)
    }
  }

  if (errors.length) {
    console.error(
      "[verify:template-downstream] FAILED\n" +
        errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:template-downstream] OK — packages-first downstream (${manifest.id ?? "unknown"})`,
  )
}

verify()
