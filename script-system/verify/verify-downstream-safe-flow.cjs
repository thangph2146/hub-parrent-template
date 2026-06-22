/**
 * Verify flow an toàn cho downstream (mọi productLine):
 * - Không có apps/main/api
 * - API app giữ src/common/module-bases (không bị prune sai)
 *
 * Usage: node script-system/verify/verify-downstream-safe-flow.cjs
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const {
  PRODUCT_LINE_PROFILES,
} = require("../../packages/api-server/deploy/config/product-line-profiles.cjs")

function readJson(file) {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function main() {
  const errors = []
  const manifest = readJson(path.join(ROOT, "template.manifest.json"))
  const isDownstream = manifest?.role === "downstream"

  if (!isDownstream) {
    console.log("[verify:downstream-safe] skip — repo không phải downstream")
    return
  }

  const mainApiEntry = path.join(ROOT, "apps", "main", "api", "src", "main.ts")
  if (fs.existsSync(mainApiEntry)) {
    errors.push(
      "downstream không được chứa apps/main/api (chỉ tồn tại ở template upstream)",
    )
  }

  const productLine = manifest.productLine
  if (!productLine) {
    errors.push("template.manifest.json thiếu productLine")
  } else if (!PRODUCT_LINE_PROFILES[productLine]) {
    errors.push(`productLine=${productLine} chưa có feature profile`)
  } else {
    const profile = PRODUCT_LINE_PROFILES[productLine]
    const apiAppPath = profile.targets?.api ?? profile.api?.appPath ?? path.join("apps", productLine, "api")
    const moduleBasesRoot = path.join(
      ROOT,
      apiAppPath,
      "src",
      "common",
      "module-bases",
    )
    if (!fs.existsSync(moduleBasesRoot)) {
      errors.push(`thiếu ${apiAppPath}/src/common/module-bases`)
    } else {
      const baseDirs = fs
        .readdirSync(moduleBasesRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
      if (baseDirs.length === 0) {
        errors.push(
          "module-bases đang rỗng — khả năng cao đã chạy api:render/sync sai flow downstream",
        )
      }
    }
  }

  if (errors.length) {
    console.error(
      "[verify:downstream-safe] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    console.error(
      "\n[verify:downstream-safe] Gợi ý:\n" +
        "  1) Sửa mono-repo-template → pnpm check → pnpm push\n" +
        "  2) Downstream: pnpm sync (không chỉ pull:template)\n" +
        "  3) Không chạy api:sync-template / render full --prune trên downstream\n" +
        "  4) Restore module-bases từ git nếu bị prune",
    )
    process.exit(1)
  }

  console.log(
    `[verify:downstream-safe] OK — ${manifest.id ?? "downstream"} · productLine=${productLine}`,
  )
}

main()
