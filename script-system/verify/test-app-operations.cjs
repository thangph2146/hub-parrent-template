/**
 * Test/verify thao tác sync @apps/ — đối xứng với sync:* / pull:checkin.
 *
 * Usage:
 *   node script-system/test-app-operations.cjs [target] [--quick]
 *
 * Targets:
 *   all        — mọi product line (mặc định)
 *   main       — @api + @backend
 *   hub-parent — @hub-parent/api + @frontend
 *   hub-checkin — API profile + admin sync state
 *   checkin     — alias hub-checkin
 *   store-sync — @store-sync/api + frontend
 *   api-all    — verify API profile mọi line kế thừa (có profile)
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, PRODUCT_LINES, API_INHERITS_FROM_MAIN } = require("../lib/monorepo-root.cjs");
const { runStep } = require("../lib/run-step.cjs");

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("-")));
const quick = flags.has("--quick");
const target = args[0] ?? "all";

const steps = [];
const stepId = (value) => value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

const addStep = (id, name, cmd) => {
  steps.push({ id, name, cmd });
};

const typecheck = (pkg, label) => {
  if (quick) {
    console.log(`[test:apps] skip typecheck ${pkg} (--quick)`);
    return;
  }
  addStep(
    `typecheck-${stepId(pkg)}`,
    label ?? `Typecheck ${pkg}`,
    `pnpm --filter ${pkg} run typecheck`,
  );
};

/** @param {string} lineKey */
function testHubCheckin() {
  addStep(
    "verify-checkin-api-template",
    "Hub-checkin API template materialize",
    "pnpm --filter @workspace/api-server run verify:checkin-api",
  );
  addStep(
    "verify-checkin-endpoint-parity",
    "Hub-checkin API route parity vs main",
    "pnpm --filter @workspace/api-server run verify:endpoint-parity",
  );
  addStep(
    "verify-checkin-api-profile",
    "Hub-checkin API profile + app.module",
    "node packages/api-server/deploy/cli/verify/verify-api-profile.cjs hub-checkin",
  );
  addStep(
    "verify-checkin-admin-sync",
    "Hub-checkin frontend admin sync state",
    "node script-system/verify/verify-checkin-admin-sync.cjs",
  );
  typecheck("@hub-checkin/api", "typecheck @hub-checkin/api");
  typecheck("@hub-checkin/frontend", "typecheck @hub-checkin/frontend");
}

/** @param {string} lineKey */
function testInheritedApi(lineKey) {
  const apiPath = PRODUCT_LINES[lineKey]?.api?.path;
  if (!apiPath || !fs.existsSync(path.join(ROOT, apiPath, "api.app.config.json"))) {
    console.log(`[test:apps] skip ${lineKey} API profile — app config không tồn tại`);
    return;
  }
  addStep(
    `verify-${stepId(lineKey)}-api-profile`,
    `${lineKey} API profile`,
    `node packages/api-server/deploy/cli/verify/verify-api-profile.cjs ${lineKey}`,
  );
}

/** @param {string} lineKey */
function testProductLine(lineKey) {
  const apps = PRODUCT_LINES[lineKey];
  if (!apps) {
    console.error(`[test:apps] unknown product line: ${lineKey}`);
    process.exit(1);
  }

  if (lineKey === "hub-checkin") {
    testHubCheckin();
    return;
  }

  if (API_INHERITS_FROM_MAIN.includes(lineKey)) {
    testInheritedApi(lineKey);
  }

  if (lineKey === "main") {
    addStep(
      "verify-main-admin-sync",
      "Main backend admin-app generate + lib/hooks host",
      "node script-system/verify/verify-main-admin-sync.cjs",
    );
  }

  for (const [role, { package: pkg }] of Object.entries(apps)) {
    typecheck(pkg, `${lineKey}.${role} — typecheck ${pkg}`);
  }
}

function testAll() {
  addStep(
    "verify-apps-structure",
    "Verify cấu trúc apps/ + registry",
    "node script-system/verify/verify-apps-structure.cjs",
  );
  for (const lineKey of Object.keys(PRODUCT_LINES)) {
    testProductLine(lineKey);
  }
}

function testApiAll() {
  for (const lineKey of API_INHERITS_FROM_MAIN) {
    testInheritedApi(lineKey);
  }
}

console.log(
  `[test:apps] target=${target}${quick ? " (quick — chỉ verify, không typecheck)" : ""}\n`,
);

switch (target) {
  case "all":
    testAll();
    break;
  case "api-all":
    testApiAll();
    break;
  case "checkin":
  case "hub-checkin":
    testHubCheckin();
    break;
  case "main":
  case "hub-parent":
  case "store-sync":
    testProductLine(target);
    break;
  default:
    console.error(
      `[test:apps] target không hợp lệ: ${target}\n` +
        `  Hợp lệ: all | main | hub-parent | hub-checkin | checkin | store-sync | api-all`,
    );
    process.exit(1);
}

console.log(`[test:apps] pipeline: ${steps.map((step) => step.id).join(" → ")}\n`);
for (const [index, step] of steps.entries()) {
  runStep(ROOT, { ...step, index: index + 1, total: steps.length }, "test:apps");
}

console.log(`\n[test:apps] Hoàn tất — ${target}`);
