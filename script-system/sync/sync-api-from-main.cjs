/**
 * Đồng bộ source API từ apps/main/api → product line API (kế thừa).
 *
 * Usage:
 *   node script-system/sync-api-from-main.cjs hub-event
 *   node script-system/sync-api-from-main.cjs all
 *
 * Profile (tùy chọn): apps/<line>/api/api.sync-profile.json
 *   - mode: "exclude" | "include" (mặc định: copy toàn bộ như cũ)
 *   - excludeDirs / includeDirs: đường dẫn tương đối API đích, vd "src/products"
 *   - keepFiles: không ghi đè (vd src/app.module.ts)
 *   - prune: true → xóa thư mục/file ở đích không còn trong profile sau sync
 *
 * Legacy: api.sync-keep.json (mảng path) được merge vào keepFiles.
 */
const fs = require("node:fs");
const path = require("node:path");

const { ROOT } = require("../lib/paths.cjs");
const { PRODUCT_LINES, API_INHERITS_FROM_MAIN, MAIN_API_PATH } = require("../lib/monorepo-apps.cjs");
const SRC = path.join(ROOT, MAIN_API_PATH);

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".cache",
  ".graphify",
  "coverage",
]);

const SKIP_FILES = new Set([".env", ".env.local", "api.sync-keep.json"]);

/** Script một lần — chỉ giữ trên apps/main/api, không copy sang line kế thừa. */
const INHERITED_API_EXCLUDE_FILES = [
  "scripts/migrate-entity-ids.mjs",
  "scripts/migrate-entity-ids-queries.mjs",
  "scripts/fix-entity-id-imports.mjs",
];

function norm(rel) {
  return rel.replace(/\\/g, "/");
}

function loadProfile(targetApiPath) {
  const profilePath = path.join(targetApiPath, "api.sync-profile.json");
  const keepLegacyPath = path.join(targetApiPath, "api.sync-keep.json");

  /** @type {{ mode?: string, includeDirs?: string[], excludeDirs?: string[], keepFiles?: string[], prune?: boolean }} */
  const profile = { keepFiles: ["src/app.module.ts"] };

  if (fs.existsSync(profilePath)) {
    try {
      Object.assign(profile, JSON.parse(fs.readFileSync(profilePath, "utf8")));
    } catch (e) {
      console.warn(`[sync-api] Invalid api.sync-profile.json: ${e.message}`);
    }
  }

  if (fs.existsSync(keepLegacyPath)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(keepLegacyPath, "utf8"));
      if (Array.isArray(legacy)) {
        profile.keepFiles = [...new Set([...(profile.keepFiles ?? []), ...legacy])];
      }
    } catch {
      /* ignore */
    }
  }

  profile.keepFiles = new Set((profile.keepFiles ?? []).map(norm));
  profile.includeDirs = (profile.includeDirs ?? []).map(norm);
  profile.excludeDirs = (profile.excludeDirs ?? []).map(norm);
  profile.excludeFiles = new Set((profile.excludeFiles ?? []).map(norm));

  return profile;
}

function isUnderPrefix(relPath, prefix) {
  return relPath === prefix || relPath.startsWith(`${prefix}/`);
}

function shouldCopyRel(relPath, profile) {
  const rel = norm(relPath);
  if (!profile.mode || profile.mode === "full") return true;

  if (profile.mode === "include") {
    if (profile.includeDirs.length === 0) return true;
    return profile.includeDirs.some((p) => isUnderPrefix(rel, p));
  }

  if (profile.mode === "exclude") {
    return !profile.excludeDirs.some((p) => isUnderPrefix(rel, p));
  }

  return true;
}

function copyTree(from, to, profile, rel = "", stats = { copied: 0, kept: 0, skipped: 0 }) {
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${ent.name}` : ent.name;
    const relNorm = norm(relPath);

    if (SKIP_FILES.has(ent.name)) continue;

    if (!shouldCopyRel(relNorm, profile)) {
      stats.skipped++;
      continue;
    }

    if (!ent.isDirectory() && profile.excludeFiles?.has(relNorm)) {
      stats.skipped++;
      continue;
    }

    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      const destDir = path.join(to, ent.name);
      fs.mkdirSync(destDir, { recursive: true });
      copyTree(path.join(from, ent.name), destDir, profile, relPath, stats);
      continue;
    }

    if (profile.keepFiles.has(relNorm)) {
      console.log(`  keep ${relNorm}`);
      stats.kept++;
      continue;
    }

    fs.copyFileSync(path.join(from, ent.name), path.join(to, ent.name));
    stats.copied++;
  }
  return stats;
}

function collectPaths(dir, rel = "", acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      acc.push(norm(relPath));
      collectPaths(full, relPath, acc);
    } else {
      acc.push(norm(relPath));
    }
  }
  return acc;
}

function pruneDest(dest, profile) {
  if (!profile.prune || !profile.mode || profile.mode === "full") return 0;

  let removed = 0;
  const srcRoot = path.join(dest, "src");
  if (!fs.existsSync(srcRoot)) return 0;

  for (const ent of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const relDir = norm(`src/${ent.name}`);
    if (!shouldCopyRel(relDir, profile)) {
      const target = path.join(srcRoot, ent.name);
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`  prune ${relDir}`);
      removed++;
    }
  }

  return removed;
}

function pruneExcludedFiles(dest, profile) {
  if (!profile.prune || !profile.excludeFiles?.size) return 0;
  let removed = 0;
  for (const rel of profile.excludeFiles) {
    const abs = path.join(dest, rel);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs, { force: true });
      console.log(`  prune file ${rel}`);
      removed++;
    }
  }
  return removed;
}

function removeInheritedOnlyScripts(dest) {
  let removed = 0;
  for (const rel of INHERITED_API_EXCLUDE_FILES) {
    const abs = path.join(dest, rel);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs, { force: true });
      console.log(`  removed inherited-only ${rel}`);
      removed++;
    }
  }
  return removed;
}

function preserveProductPackageName(productKey, dest) {
  const pkgName = PRODUCT_LINES[productKey]?.api?.package;
  if (!pkgName) return;
  const pkgPath = path.join(dest, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.name === pkgName) return;
  pkg.name = pkgName;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`  set package name → ${pkgName}`);
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

  const profile = loadProfile(dest);
  for (const rel of INHERITED_API_EXCLUDE_FILES) {
    profile.excludeFiles.add(rel);
  }
  const modeLabel = profile.mode ?? "full";
  console.log(`[sync-api] ${MAIN_API_PATH} → ${entry.path} (mode: ${modeLabel})`);

  const stats = copyTree(SRC, dest, profile);
  const prunedDirs = pruneDest(dest, profile);
  const prunedFiles = pruneExcludedFiles(dest, profile);
  removeInheritedOnlyScripts(dest);
  preserveProductPackageName(productKey, dest);

  console.log(
    `[sync-api] Done: ${productKey} — copied ${stats.copied}, kept ${stats.kept}, skipped ${stats.skipped}, pruned ${prunedDirs} dirs, ${prunedFiles} files`,
  );
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
