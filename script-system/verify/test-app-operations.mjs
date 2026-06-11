/**
 * Test/verify thao tác sync @apps/ — đối xứng với sync:* / pull:checkin.
 *
 * Usage:
 *   node script-system/test-app-operations.mjs [target] [--quick]
 *
 * Targets:
 *   all        — mọi product line (mặc định)
 *   main       — @api + @backend
 *   hub-parent — @hub-parent/api + @frontend
 *   hub-event  — API profile + admin sync state
 *   checkin    — alias hub-event
 *   store-sync — @store-sync/api + frontend
 *   api-all    — verify API profile mọi line kế thừa (có profile)
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ROOT } = require("../lib/paths.cjs");
const { PRODUCT_LINES, API_INHERITS_FROM_MAIN } = require("../lib/monorepo-apps.cjs");

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
function testHubEvent() {
  run(
    "node script-system/verify/verify-api-profile.mjs hub-event",
    "hub-event API — profile + app.module",
  );
  run(
    "node script-system/verify/verify-checkin-admin-sync.mjs",
    "hub-event frontend — admin sync state",
  );
  typecheck("@hub-event/api", "typecheck @hub-event/api");
  typecheck("@hub-event-checkin-frontend", "typecheck @hub-event-checkin-frontend");
}

/** @param {string} lineKey */
function testInheritedApi(lineKey) {
  run(
    `node script-system/verify/verify-api-profile.mjs ${lineKey}`,
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

  if (lineKey === "hub-event") {
    testHubEvent();
    return;
  }

  if (API_INHERITS_FROM_MAIN.includes(lineKey)) {
    testInheritedApi(lineKey);
  }

  if (lineKey === "main") {
    run(
      "node script-system/verify/verify-main-admin-sync.mjs",
      "main backend — admin-app generate + lib/hooks host",
    );
  }

  for (const [role, { package: pkg }] of Object.entries(apps)) {
    typecheck(pkg, `${lineKey}.${role} — typecheck ${pkg}`);
  }
}

function testAll() {
  run("node script-system/verify/verify-apps-structure.mjs", "cấu trúc apps/ + registry");
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
  case "hub-event":
    testHubEvent();
    break;
  case "main":
  case "hub-parent":
  case "store-sync":
    testProductLine(target);
    break;
  default:
    console.error(
      `[test:apps] target không hợp lệ: ${target}\n` +
        `  Hợp lệ: all | main | hub-parent | hub-event | checkin | store-sync | api-all`,
    );
    process.exit(1);
}

console.log(`\n[test:apps] Hoàn tất — ${target}`);
