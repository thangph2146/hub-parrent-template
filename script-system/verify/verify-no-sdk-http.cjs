/**
 * Next apps không gọi StoreSyncSdk.http trực tiếp — chỉ resource API trong @workspace/api-client.
 *
 * Chạy: pnpm verify:sdk-http
 */
const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { join, relative } = require("node:path");
const { ROOT: root, NEXT_APP_PATHS } = require("../lib/monorepo-root.cjs");

const RAW_SDK_HTTP = /\b(api|apiClient|sdk)\.http\b/;

/** @param {string} dir @param {string[]} out */
function walkTs(dir, out) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walkTs(p, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(ent.name)) out.push(p);
  }
}

function main() {
  const errors = [];

  for (const appRel of NEXT_APP_PATHS) {
    const src = join(root, appRel, "src");
    const files = [];
    walkTs(src, files);

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      if (!RAW_SDK_HTTP.test(content)) continue;
      const rel = relative(root, file).replace(/\\/g, "/");
      errors.push(`${rel}: gọi sdk.http trực tiếp — dùng resource API (@workspace/api-client).`);
    }
  }

  if (errors.length) {
    console.error("[verify-no-sdk-http] Vi phạm:\n");
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }
  console.log("[verify-no-sdk-http] OK — không có sdk.http trong Next apps.");
}

main();
