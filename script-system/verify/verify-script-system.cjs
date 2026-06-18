#!/usr/bin/env node
/**
 * Kiểm tra layout script-system + script package.json trỏ đúng file.
 */
const fs = require("node:fs");
const path = require("node:path");
const { SCRIPT_SYSTEM, ROOT } = require("../lib/monorepo-root.cjs");

const ALLOWED_TOP_DIRS = new Set([
  "lib",
  "dev",
  "sync",
  "git",
  "verify",
  "graphify",
  "db",
  "env",
  "admin",
  "api",
  "template",
]);

const ALLOWED_CJS_DIRS = new Set([
  "lib",
  "lib/layout",
  "dev",
  "sync",
  "sync/lib",
  "sync/deprecated",
  "git",
  "verify",
  "graphify",
  "db",
  "env",
  "admin",
  "admin/lib",
  "api",
]);

const SYNC_ROOT_SCRIPTS = new Set([
  "sync-api-from-main.cjs",
  "sync-checkin-packages.cjs",
  "sync-parent.cjs",
  "pull-template.cjs",
  "post-pull-downstream.cjs",
  "downstream-sync-profile.cjs",
  "apply-sync-to-downstream.cjs",
  "init-downstream.cjs",
  "sync-checkin-menu-tree.cjs",
]);

/** @type {string[]} */
const errors = [];

function fail(msg) {
  errors.push(msg);
}

if (fs.existsSync(path.join(SCRIPT_SYSTEM, "deploy"))) {
  fail(
    "script-system/deploy/ đã bỏ — dùng ecosystem/pm2-stack.cjs (xóa thư mục deploy)",
  );
}

const syncRoot = path.join(SCRIPT_SYSTEM, "sync");
if (fs.existsSync(syncRoot)) {
  for (const entry of fs.readdirSync(syncRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".cjs")) continue;
    if (!SYNC_ROOT_SCRIPTS.has(entry.name)) {
      fail(
        `script-system/sync/${entry.name} — chuyển sang sync/deprecated/ hoặc cập nhật allowlist`,
      );
    }
  }
}

for (const entry of fs.readdirSync(SCRIPT_SYSTEM, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    if (!ALLOWED_TOP_DIRS.has(entry.name)) {
      fail(`Thư mục lạ ở script-system/: ${entry.name}`);
    }
    continue;
  }
  if (entry.name !== "README.md") {
    fail(`File lẻ ở script-system/ root: ${entry.name} — chuyển vào nhóm con`);
  }
}

function walkCjs(dir, relBase = "") {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "template") continue;
      walkCjs(abs, rel);
      continue;
    }
    if (!entry.name.endsWith(".cjs")) continue;
    const parent = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    if (!ALLOWED_CJS_DIRS.has(parent)) {
      fail(`.cjs ngoài thư mục chuẩn: script-system/${rel}`);
    }
  }
}

const VERIFY_DIR = path.join(SCRIPT_SYSTEM, "verify");

for (const entry of fs.readdirSync(VERIFY_DIR)) {
  if (!entry.endsWith(".mjs")) continue;
  fail(
    `verify/ còn file .mjs (chuyển sang .cjs): script-system/verify/${entry}`,
  );
}

walkCjs(SCRIPT_SYSTEM);

const LEGACY_LIB_REQUIRE_RE =
  /require\s*\(\s*['"][^'"]*lib\/(paths|data-paths|storage-layout|pipeline-paths)\.cjs['"]\s*\)/;

function scanLegacyImports(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "template") continue;
      scanLegacyImports(abs);
      continue;
    }
    if (!/\.(cjs|mjs)$/.test(entry.name)) continue;
    const content = fs.readFileSync(abs, "utf8");
    if (LEGACY_LIB_REQUIRE_RE.test(content)) {
      fail(
        `${path.relative(ROOT, abs)} còn require lib shim — dùng monorepo-root.cjs hoặc layout/*`,
      );
    }
  }
}

scanLegacyImports(SCRIPT_SYSTEM);

const pkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
);
const scripts = pkg.scripts ?? {};

for (const [name, cmd] of Object.entries(scripts)) {
  if (typeof cmd !== "string") continue;
  const matches = [...cmd.matchAll(/node\s+(script-system\/[^\s"']+)/g)];
  for (const m of matches) {
    const rel = m[1].replace(/\//g, path.sep);
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      fail(`package.json scripts.${name} → thiếu file ${m[1]}`);
    }
  }
}

if (errors.length) {
  console.error(
    `verify:scripts FAIL — ${errors.length} lỗi:\n` +
      errors.map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  `verify:scripts OK — ${ALLOWED_TOP_DIRS.size} nhóm thư mục; .cjs trong ${ALLOWED_CJS_DIRS.size} vị trí; package.json paths hợp lệ`,
);
