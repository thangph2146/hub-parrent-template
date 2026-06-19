/**
 * Kiểm tra cấu trúc apps/ khớp product line registry — không legacy layout phẳng.
 *
 * Usage: node script-system/verify-apps-structure.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  ROOT,
  PRODUCT_LINES,
  API_INHERITS_FROM_MAIN,
  MAIN_API_PATH,
} = require("../lib/monorepo-root.cjs");
const APPS = path.join(ROOT, "apps");

/** Script migration một lần — chỉ được ở main API (thư mục archive). */
const MAIN_ONLY_API_SCRIPTS = [
  "scripts/archive/migrate-entity-ids.mjs",
  "scripts/archive/migrate-entity-ids-queries.mjs",
  "scripts/archive/fix-entity-id-imports.mjs",
];

/** Deploy line không được có archive migration. */
const MAIN_ONLY_API_SCRIPT_DIRS = ["scripts/archive"];
const DEPLOY_API_ALLOWED_SCRIPT_FILES = new Set(["ensure-dist.mjs"]);

/** Monorepo sync scripts thuộc script-system/, không apps/.../scripts/. */
const FORBIDDEN_APP_SCRIPT_DIRS = [
  "apps/hub-checkin/hub-checkin-frontend/scripts",
];

const LEGACY_TOP_LEVEL = ["api", "backend", "frontend"];
const ALLOWED_LINES = new Set(Object.keys(PRODUCT_LINES));
/** File tài liệu được phép ngay dưới apps/ (không phải product line). */
const APPS_ROOT_FILES = new Set(["README.md"]);

function readPackageName(appDir) {
  const pkgPath = path.join(appDir, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  return JSON.parse(fs.readFileSync(pkgPath, "utf8")).name ?? null;
}

function listFilesRecursive(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(abs, rel));
      continue;
    }
    files.push(rel);
  }
  return files;
}

function listFilesByName(dir, filename) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesByName(abs, filename));
      continue;
    }
    if (entry.name === filename) {
      files.push(path.relative(ROOT, abs).replace(/\\/g, "/"));
    }
  }
  return files;
}

function verify() {
  const errors = [];
  const names = new Map();

  if (!fs.existsSync(APPS)) {
    console.error("[verify:apps] missing apps/");
    process.exit(1);
  }

  for (const legacy of LEGACY_TOP_LEVEL) {
    const legacyPath = path.join(APPS, legacy);
    if (fs.existsSync(legacyPath)) {
      errors.push(`legacy path must not exist: apps/${legacy}`);
    }
  }

  for (const entry of fs.readdirSync(APPS, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (!APPS_ROOT_FILES.has(entry.name)) {
        errors.push(`apps/${entry.name}: only product-line directories allowed`);
      }
      continue;
    }
    if (!ALLOWED_LINES.has(entry.name)) {
      errors.push(`apps/${entry.name}: unknown product line (update script-system/lib/monorepo-apps.cjs)`);
    }
  }

  for (const rel of FORBIDDEN_APP_SCRIPT_DIRS) {
    if (fs.existsSync(path.join(ROOT, rel))) {
      errors.push(`remove ${rel} — dùng script-system/ thay vì scripts/ trong app`);
    }
  }

  for (const rel of listFilesByName(APPS, "pnpm-lock.yaml")) {
    errors.push(`${rel}: không dùng lockfile cục bộ trong apps/ — chỉ giữ root pnpm-lock.yaml`);
  }

  for (const lineKey of API_INHERITS_FROM_MAIN) {
    const apiPath = PRODUCT_LINES[lineKey]?.api?.path;
    if (!apiPath) continue;
    for (const scriptRel of MAIN_ONLY_API_SCRIPTS) {
      if (fs.existsSync(path.join(ROOT, apiPath, scriptRel))) {
        errors.push(`${apiPath}/${scriptRel}: chỉ giữ trên ${MAIN_API_PATH}`);
      }
    }
    for (const dirRel of MAIN_ONLY_API_SCRIPT_DIRS) {
      if (fs.existsSync(path.join(ROOT, apiPath, dirRel))) {
        errors.push(`${apiPath}/${dirRel}: chỉ giữ trên ${MAIN_API_PATH}`);
      }
    }
    for (const scriptRel of listFilesRecursive(path.join(ROOT, apiPath, "scripts"))) {
      if (!DEPLOY_API_ALLOWED_SCRIPT_FILES.has(scriptRel)) {
        errors.push(`${apiPath}/scripts/${scriptRel}: deploy line chỉ giữ scripts/ensure-dist.mjs`);
      }
    }
  }

  for (const [lineKey, apps] of Object.entries(PRODUCT_LINES)) {
    const lineDir = path.join(APPS, lineKey);
    if (!fs.existsSync(lineDir)) {
      continue;
    }
    const allowedAppDirs = new Set(
        Object.values(apps).map(({ path: relPath }) => path.basename(relPath)),
    );
    for (const entry of fs.readdirSync(lineDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!allowedAppDirs.has(entry.name)) {
        errors.push(
          `apps/${lineKey}/${entry.name}: thư mục lạ — line chỉ gồm ${[...allowedAppDirs].join(", ")} (xóa hoặc đổi tên package tránh trùng workspace)`,
        );
      }
    }

    for (const [role, { path: relPath, package: pkgName }] of Object.entries(apps)) {
      const abs = path.join(ROOT, relPath);
      if (!fs.existsSync(abs)) {
        errors.push(`missing ${relPath} (${lineKey}.${role})`);
        continue;
      }
      const actual = readPackageName(abs);
      if (!actual) {
        errors.push(`missing package.json: ${relPath}`);
      } else if (actual !== pkgName) {
        errors.push(`${relPath}: package name "${actual}" !== "${pkgName}"`);
      } else if (names.has(actual)) {
        errors.push(`duplicate workspace package "${actual}" (${names.get(actual)} and ${relPath})`);
      } else {
        names.set(actual, relPath);
      }
    }
  }

  if (errors.length) {
    console.error("[verify:apps] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }

  console.log(
    `[verify:apps] OK — ${[...ALLOWED_LINES].filter((k) => fs.existsSync(path.join(APPS, k))).length} product line(s) present, ${names.size} workspace packages`,
  );
}

verify();
