/**
 * Đồng bộ source API từ apps/main/api → product line API (kế thừa).
 *
 * Usage:
 *   node script-system/sync-api-from-main.cjs hub-event
 *   node script-system/sync-api-from-main.cjs all
 *
 * Giữ nguyên app.module.ts đích nếu có file api.sync-keep.json liệt kê "src/app.module.ts".
 */
const fs = require("node:fs");
const path = require("node:path");

const { PRODUCT_LINES, API_INHERITS_FROM_MAIN, MAIN_API_PATH } = require("./monorepo-apps.cjs");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, MAIN_API_PATH);

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".cache",
  ".graphify",
  "coverage",
]);

const SKIP_FILES = new Set([".env", ".env.local"]);

function loadKeepFiles(targetApiPath) {
  const keepPath = path.join(targetApiPath, "api.sync-keep.json");
  if (!fs.existsSync(keepPath)) return new Set(["src/app.module.ts"]);
  try {
    const list = JSON.parse(fs.readFileSync(keepPath, "utf8"));
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set(["src/app.module.ts"]);
  }
}

function copyTree(from, to, keepRel, rel = "") {
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${ent.name}` : ent.name;
    const relNorm = relPath.replace(/\\/g, "/");
    if (SKIP_FILES.has(ent.name)) continue;
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      const destDir = path.join(to, ent.name);
      fs.mkdirSync(destDir, { recursive: true });
      copyTree(path.join(from, ent.name), destDir, keepRel, relPath);
      continue;
    }
    if (keepRel.has(relNorm)) {
      console.log(`  keep ${relNorm}`);
      continue;
    }
    fs.copyFileSync(path.join(from, ent.name), path.join(to, ent.name));
  }
}

function syncProduct(productKey) {
  const entry = PRODUCT_LINES[productKey]?.api;
  if (!entry) {
    console.error(`Unknown product: ${productKey}`);
    process.exit(1);
  }
  const dest = path.join(ROOT, entry.path);
  if (!fs.existsSync(SRC)) {
    console.error(`Missing source: ${MAIN_API_PATH}`);
    process.exit(1);
  }
  console.log(`[sync-api] ${MAIN_API_PATH} → ${entry.path}`);
  const keep = loadKeepFiles(dest);
  copyTree(SRC, dest, keep);
  console.log(`[sync-api] Done: ${productKey}`);
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node script-system/sync-api-from-main.cjs <hub-event|hub-parent|store-sync|all>");
  process.exit(1);
}

if (arg === "all") {
  for (const key of API_INHERITS_FROM_MAIN) syncProduct(key);
} else {
  if (!API_INHERITS_FROM_MAIN.includes(arg)) {
    console.error(`Product must be one of: ${API_INHERITS_FROM_MAIN.join(", ")}, all`);
    process.exit(1);
  }
  syncProduct(arg);
}
