/**
 * Kiểm tra apps/<line>/api khớp api.sync-profile.json và app.module.ts.
 *
 * Usage: node script-system/verify/verify-api-profile.cjs hub-checkin
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  ROOT,
  PRODUCT_LINES,
  API_INHERITS_FROM_MAIN,
} = require("../lib/monorepo-root.cjs");

function norm(rel) {
  return rel.replace(/\\/g, "/");
}

function loadProfile(apiPath) {
  const profilePath = path.join(apiPath, "api.sync-profile.json");
  if (!fs.existsSync(profilePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(profilePath, "utf8"));
}

function isUnderPrefix(relPath, prefix) {
  return relPath === prefix || relPath.startsWith(`${prefix}/`);
}

function shouldExist(relPath, profile) {
  if (!profile?.mode || profile.mode === "full") return true;
  const rel = norm(relPath);
  if (profile.mode === "include") {
    if (!profile.includeDirs?.length) return true;
    return profile.includeDirs.some((p) => isUnderPrefix(rel, norm(p)));
  }
  if (profile.mode === "exclude") {
    return !(profile.excludeDirs ?? []).some((p) => isUnderPrefix(rel, norm(p)));
  }
  return true;
}

function moduleImportPaths(appModuleContent) {
  const paths = new Set();
  const re = /from '\.\/([^']+)'/g;
  let m;
  while ((m = re.exec(appModuleContent)) !== null) {
    paths.add(m[1]);
  }
  return [...paths];
}

function verify(productKey) {
  const entry = PRODUCT_LINES[productKey]?.api;
  if (!entry) {
    console.error(`Unknown product: ${productKey}`);
    process.exit(1);
  }

  const apiPath = path.join(ROOT, entry.path);
  const profile = loadProfile(apiPath);
  const errors = [];

  if (!profile) {
    console.log(`[verify-api-profile] ${productKey}: no api.sync-profile.json — skip`);
    return;
  }

  const appModulePath = path.join(apiPath, "src/app.module.ts");
  if (!fs.existsSync(appModulePath)) {
    errors.push("missing src/app.module.ts");
  } else {
    const content = fs.readFileSync(appModulePath, "utf8");
    for (const importPath of moduleImportPaths(content)) {
      const relDir = norm(`src/${importPath.split("/")[0]}`);
      const abs = path.join(apiPath, "src", importPath.split("/")[0]);
      if (!fs.existsSync(abs)) {
        errors.push(`app.module imports missing dir: ${relDir}`);
      }
      if (!shouldExist(relDir, profile)) {
        errors.push(`app.module imports excluded module: ${relDir}`);
      }
    }
  }

  if (profile.mode === "exclude" && profile.excludeDirs?.length) {
    for (const excluded of profile.excludeDirs) {
      const abs = path.join(apiPath, excluded);
      if (fs.existsSync(abs)) {
        errors.push(`excluded path still on disk: ${norm(excluded)}`);
      }
    }
  }

  if (errors.length) {
    console.error(`[verify-api-profile] FAIL ${productKey}:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`[verify-api-profile] OK — ${productKey} profile + app.module khớp.`);
}

const arg = process.argv[2] ?? "hub-checkin";
if (!API_INHERITS_FROM_MAIN.includes(arg)) {
  console.error(`Usage: node script-system/verify-api-profile.cjs <${API_INHERITS_FROM_MAIN.join("|")}>`);
  process.exit(1);
}
verify(arg);
