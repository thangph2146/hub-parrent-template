/**
 * Verify repo downstream đúng mô hình packages-first template.
 *
 * Usage: node script-system/verify/verify-downstream-template.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../lib/monorepo-root.cjs");
const {
  PRODUCT_LINE_PROFILES,
} = require("../../packages/api-server/deploy/config/product-line-profiles.cjs")
const MANIFEST = path.join(ROOT, "template.manifest.json");
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
      errors.push(`thiếu lớp compose ${pkg} — bắt buộc cho hub-checkin template`)
    }
  }

  if (manifest.productLine === "hub-checkin" || manifest.primary) {
    const adminPkg = path.join(ROOT, "packages/admin-app/package.json")
    const apiPkg = path.join(ROOT, "packages/api-server/package.json")
    if (fs.existsSync(adminPkg) && fs.existsSync(apiPkg)) {
      /* composition OK */
    }
  }

  if (!fs.existsSync(path.join(ROOT, ".template-lock.json"))) {
    errors.push("thiếu .template-lock.json — chạy pnpm pull:template")
  }

  const profile = manifest.productLine
    ? PRODUCT_LINE_PROFILES[manifest.productLine]
    : null
  if (!manifest.productLine) {
    errors.push("template.manifest.json thiếu productLine")
  } else if (!profile) {
    errors.push(`productLine=${manifest.productLine} chưa có feature profile`)
  } else {
    const appRoot = profile.targets?.appRoot ?? profile.appsPath ?? `apps/${manifest.productLine}`
    if (!fs.existsSync(path.join(ROOT, appRoot))) {
      errors.push(`thiếu ${appRoot}/ — apps thuộc downstream, hãy tạo app product local`)
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
    `[verify:template-downstream] OK — feature-template downstream (${manifest.id ?? "unknown"})`,
  )
}

verify()
