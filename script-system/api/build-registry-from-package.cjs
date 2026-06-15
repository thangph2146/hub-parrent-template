/**
 * Ghi PACKAGE_MODULE_TEMPLATES.meta.json vào `{api}/.pipeline/`.
 *
 * Usage:
 *   pnpm api:registry:sync              # nest + main/api
 *   node script-system/api/build-registry-from-package.cjs --write-ext  # mọi API line
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, PRODUCT_LINES } = require("../lib/monorepo-root.cjs");
const { DEPLOY_CONFIG } = require("../lib/api-server-cli.cjs");
const {
  packageTemplatesMetaPath,
  COMMITTED_PIPELINE_API_ROOTS,
} = require("../lib/layout/pipeline-paths.cjs");
const {
  writeTemplatesMeta,
} = require(path.join(DEPLOY_CONFIG, "package-module-templates.cjs"));

const writeExt = process.argv.includes("--write-ext");

/** @type {string[]} */
const targets = COMMITTED_PIPELINE_API_ROOTS.map((rel) => path.join(ROOT, rel));

if (writeExt) {
  for (const line of Object.values(PRODUCT_LINES)) {
    if (!line.api?.path) continue;
    const abs = path.join(ROOT, line.api.path);
    if (!targets.includes(abs)) targets.push(abs);
  }
}

for (const dest of targets) {
  if (!fs.existsSync(dest)) {
    console.warn(
      `[api:registry:sync] bỏ qua — không tồn tại: ${path.relative(ROOT, dest)}`,
    );
    continue;
  }
  const legacyRoot = path.join(dest, "PACKAGE_MODULE_TEMPLATES.meta.json");
  if (fs.existsSync(legacyRoot)) {
    fs.rmSync(legacyRoot, { force: true });
  }
  const meta = writeTemplatesMeta(dest);
  console.log(
    `[api:registry:sync] ${path.relative(ROOT, packageTemplatesMetaPath(dest))} (${meta.moduleCount} module)`,
  );
}
