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
const { execSync } = require("node:child_process");
const { ROOT, PRODUCT_LINES, API_INHERITS_FROM_MAIN } = require("../lib/monorepo-root.cjs");

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("-")));
const quick = flags.has("--quick");
const target = args[0] ?? "all";

const run = (cmd, label) => {
  console.log(`\n[test:apps] ${label}\n`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
};

const typecheck = (pkg, label) => {
  if (quick) {
    console.log(`[test:apps] skip typecheck ${pkg} (--quick)`);
    return;
  }
  run(`pnpm --filter ${pkg} run typecheck`, label ?? `typecheck ${pkg}`);
};

/** @param {string} lineKey */
function testHubCheckin() {
  run(
    "pnpm --filter @workspace/api-server run verify:checkin-api",
    "hub-checkin API — template materialize",
  );
  run(
    "pnpm --filter @workspace/api-server run verify:endpoint-parity",
    "hub-checkin API — route parity vs main",
  );
  run(
    "node script-system/verify/verify-api-profile.cjs hub-checkin",
    "hub-checkin API — profile + app.module",
  );
  run(
    "node script-system/verify/verify-checkin-admin-sync.cjs",
    "hub-checkin frontend — admin sync state",
  );
  typecheck("@hub-checkin/api", "typecheck @hub-checkin/api");
  typecheck("@hub-checkin/frontend", "typecheck @hub-checkin/frontend");
}

/** @param {string} lineKey */
function testInheritedApi(lineKey) {
  run(
    `node script-system/verify/verify-api-profile.cjs ${lineKey}`,
    `${lineKey} API — profile (skip nếu không có file)`,
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
    run(
      "node script-system/verify/verify-main-admin-sync.cjs",
      "main backend — admin-app generate + lib/hooks host",
    );
  }

  for (const [role, { package: pkg }] of Object.entries(apps)) {
    typecheck(pkg, `${lineKey}.${role} — typecheck ${pkg}`);
  }
}

function testAll() {
  run("node script-system/verify/verify-apps-structure.cjs", "cấu trúc apps/ + registry");
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

console.log(`\n[test:apps] Hoàn tất — ${target}`);
