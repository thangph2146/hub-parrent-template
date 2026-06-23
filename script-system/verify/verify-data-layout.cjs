#!/usr/bin/env node
/**
 * Kiểm tra layout data/ + không còn full-export trong apps (api/src).
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  DATA_SUBDIRS,
  ROOT,
  dataDir,
  findSeedExportOnDisk,
} = require("../lib/layout/data-paths.cjs");

const LEGACY_EXPORT_RE = /^full-export-.*\.json$/i;
const LEGACY_AUDIT_RE = /^MODULE_.*_AUDIT\.md$/i;
const LEGACY_ENV_SEED_RE = /src\/full-export-/;

/** @type {number} */
let errors = 0;

function fail(message) {
  console.error(`verify:data-layout FAIL — ${message}`);
  errors += 1;
}

for (const sub of DATA_SUBDIRS) {
  const dir = dataDir(sub);
  if (!fs.existsSync(dir)) {
    fail(`Thiếu thư mục ${path.relative(ROOT, dir)}`);
    continue;
  }
  const gitkeep = path.join(dir, ".gitkeep");
  if (!fs.existsSync(gitkeep)) {
    fail(`Thiếu ${path.relative(ROOT, gitkeep)}`);
  }
}

const appsDir = path.join(ROOT, "apps");
if (fs.existsSync(appsDir)) {
  for (const line of fs.readdirSync(appsDir, { withFileTypes: true })) {
    if (!line.isDirectory()) continue;
    const apiSrc = path.join(appsDir, line.name, "api", "src");
    if (!fs.existsSync(apiSrc)) continue;
    const dataPathsTs = path.join(apiSrc, "common", "data-paths.ts");
    if (!fs.existsSync(dataPathsTs)) {
      fail(`Thiếu ${path.relative(ROOT, dataPathsTs)} — copy từ apps/main/api`);
    }
    walkApiSrc(apiSrc, apiSrc);
  }
}

/**
 * @param {string} dir
 * @param {string} apiSrcRoot
 */
function walkApiSrc(dir, apiSrcRoot) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walkApiSrc(abs, apiSrcRoot);
      continue;
    }
    if (LEGACY_EXPORT_RE.test(entry.name)) {
      fail(
        `Export legacy trong source: ${path.relative(ROOT, abs)} — chuyển sang data/seed/`,
      );
    }
    if (
      LEGACY_AUDIT_RE.test(entry.name) &&
      path.dirname(abs) === path.join(apiSrcRoot, "..")
    ) {
      fail(
        `Audit WIP trong API: ${path.relative(ROOT, abs)} — chuyển sang docs/audit/`,
      );
    }
  }
}

const dataRoot = dataDir();
if (fs.existsSync(dataRoot)) {
  for (const entry of fs.readdirSync(dataRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (entry.name === "README.md") continue;
    if (/\.(json|json\.gz|gz)$/i.test(entry.name)) {
      fail(
        `File dữ liệu lẻ tại data/: ${entry.name} — chuyển sang data/seed/ hoặc data/exports/`,
      );
    }
  }
}

const apiEnvExamples = [
  "apps/main/api/.env.example",
  "apps/hub-checkin/api/.env.example",
  "apps/hub-parent/api/.env.example",
  "apps/store-sync/api/.env.example",
];
for (const rel of apiEnvExamples) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const content = fs.readFileSync(abs, "utf8");
  if (LEGACY_ENV_SEED_RE.test(content)) {
    fail(`${rel} còn đường dẫn src/full-export — dùng data/seed/`);
  }
}

const LEGACY_META_AT_API_ROOT = "PACKAGE_MODULE_TEMPLATES.meta.json";
const API_LINES = ["main", "hub-parent", "hub-checkin", "store-sync"];

for (const line of API_LINES) {
  const apiRoot = path.join(ROOT, "apps", line, "api");
  if (!fs.existsSync(apiRoot)) continue;

  const legacyMeta = path.join(apiRoot, LEGACY_META_AT_API_ROOT);
  if (fs.existsSync(legacyMeta)) {
    fail(
      `Meta pipeline ở root API: ${path.relative(ROOT, legacyMeta)} — chuyển sang .pipeline/`,
    );
  }

  const tscErrors = path.join(apiRoot, "tsc-errors.txt");
  if (fs.existsSync(tscErrors)) {
    fail(
      `${path.relative(ROOT, tscErrors)} — file scratch; xóa hoặc gitignore`,
    );
  }
}

if (fs.existsSync(appsDir)) {
  for (const line of fs.readdirSync(appsDir, { withFileTypes: true })) {
    if (!line.isDirectory()) continue;
    const audit = path.join(
      appsDir,
      line.name,
      "api",
      "MODULE_FILES_AUDIT.md",
    );
    if (fs.existsSync(audit)) {
      fail(
        `Audit WIP: ${path.relative(ROOT, audit)} — chuyển sang docs/audit/`,
      );
    }
  }
}

if (errors === 0) {
  const seed = findSeedExportOnDisk();
  if (seed) {
    console.log(
      `verify:data-layout OK — layout data/ hợp lệ; seed export: ${path.relative(ROOT, seed)}`,
    );
  } else {
    console.log(
      "verify:data-layout OK — layout data/ hợp lệ (chưa có file seed — copy export vào data/seed/ khi cần db:demo)",
    );
  }
} else {
  console.error(`verify:data-layout — ${errors} lỗi`);
  process.exit(1);
}
