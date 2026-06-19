/**
 * Kiểm tra ranh giới microservice ở tầng khai báo: package.json không được phụ thuộc
 * trực tiếp vào service khác (bổ sung cho ESLint service-boundaries trên import).
 *
 * API Nest: không kiểm tra devDependencies (vd. @workspace/api-client cho script test:live —
 * ESLint service-boundaries vẫn cấm import trong src/).
 *
 * Chạy: pnpm verify:bounds
 */
const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { join, relative } = require("node:path");
const { ROOT: root } = require("../lib/monorepo-root.cjs");

const API_PACKAGES = new Set([
  "@api",
  "@hub-checkin/api",
  "@hub-parent/api",
  "@store-sync/api",
]);

const API_FORBIDDEN = [
  "@frontend",
  "@backend",
  "@workspace/ui",
  "@workspace/api-client",
];

/** @type {Record<string, readonly string[]>} */
const FORBIDDEN_DEPS = {
  "@api": API_FORBIDDEN,
  "@hub-checkin/api": API_FORBIDDEN,
  "@hub-parent/api": API_FORBIDDEN,
  "@store-sync/api": API_FORBIDDEN,
  "@frontend": [
    "@backend",
    "@api",
    ...[...API_PACKAGES].filter((p) => p !== "@api"),
    "@store-sync-frontend",
  ],
  "@store-sync-frontend": [
    "@backend",
    ...API_PACKAGES,
    "@frontend",
  ],
  "@backend": ["@frontend", ...API_PACKAGES, "@store-sync-frontend"],
  "@hub-checkin/frontend": [
    "@backend",
    "@frontend",
    ...API_PACKAGES,
  ],
  "@workspace/api-client": [
    ...API_PACKAGES,
    "@frontend",
    "@backend",
    "@workspace/ui",
  ],
  "@workspace/site-config": [
    ...API_PACKAGES,
    "@frontend",
    "@backend",
    "@workspace/ui",
    "@workspace/api-client",
  ],
};

const DEP_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

const API_SERVER_RUNTIME_DIR = join(root, "packages", "api-server", "src");
const API_SERVER_RUNTIME_FORBIDDEN_RE =
  /\b(hub-checkin|hub-parent|store-sync|PRODUCT_LINES|productLine)\b|apps[\\/](hub|store)-/;

/** @returns {string[]} */
function readWorkspacePackageJsonPaths() {
  const out = [];

  const packagesDir = join(root, "packages");
  if (existsSync(packagesDir)) {
    for (const ent of readdirSync(packagesDir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const p = join(packagesDir, ent.name, "package.json");
      if (existsSync(p)) out.push(p);
    }
  }

  const appsDir = join(root, "apps");
  if (existsSync(appsDir)) {
    for (const product of readdirSync(appsDir, { withFileTypes: true })) {
      if (!product.isDirectory()) continue;
      const productPath = join(appsDir, product.name);
      for (const app of readdirSync(productPath, { withFileTypes: true })) {
        if (!app.isDirectory()) continue;
        const p = join(productPath, app.name, "package.json");
        if (existsSync(p)) out.push(p);
      }
    }
  }

  return out;
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist") continue;
      walkFiles(abs, out);
      continue;
    }
    if (/\.(ts|tsx|js|cjs|mjs)$/.test(ent.name)) out.push(abs);
  }
  return out;
}

function verifyApiServerRuntimeBoundary(errors) {
  for (const file of walkFiles(API_SERVER_RUNTIME_DIR)) {
    const content = readFileSync(file, "utf8");
    if (API_SERVER_RUNTIME_FORBIDDEN_RE.test(content)) {
      const rel = relative(root, file).replace(/\\/g, "/");
      errors.push(
        `${rel}: api-server runtime không được hard-code product line; đưa vào api.app.config.json hoặc deploy tooling.`,
      );
    }
  }
}

function main() {
  const errors = [];
  for (const pjPath of readWorkspacePackageJsonPaths()) {
    const pkg = JSON.parse(readFileSync(pjPath, "utf8"));
    const name = pkg.name;
    if (!name || !FORBIDDEN_DEPS[name]) continue;
    const forbidden = FORBIDDEN_DEPS[name];
    const depFields =
      API_PACKAGES.has(name)
        ? DEP_FIELDS.filter((f) => f !== "devDependencies")
        : DEP_FIELDS;
    for (const field of depFields) {
      const block = pkg[field];
      if (!block || typeof block !== "object") continue;
      for (const dep of Object.keys(block)) {
        if (forbidden.includes(dep)) {
          errors.push(
            `${name}: ${field} → "${dep}" (không được phụ thuộc trực tiếp service này).`,
          );
        }
      }
    }
  }

  verifyApiServerRuntimeBoundary(errors);

  if (errors.length) {
    console.error("[verify-service-boundaries] Vi phạm ranh giới package.json:\n");
    for (const e of errors) console.error(`  • ${e}`);
    console.error(
      "\nGiao tiếp giữa service: HTTP/SDK (@workspace/api-client) hoặc package trung lập trong workspace.",
    );
    process.exit(1);
  }
  console.log("[verify-service-boundaries] OK — không có phụ thuộc workspace cấm.");
}

main();
