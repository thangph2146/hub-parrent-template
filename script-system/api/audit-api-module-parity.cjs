/**
 * Audit module files + binding parity — wrapper tới @workspace/api-server/deploy/cli.
 *
 * Usage:
 *   pnpm api:audit:modules
 *   node script-system/api/audit-api-module-parity.cjs apps/hub-event/api
 */
const path = require("node:path");
const { execSync } = require("node:child_process");
const { ROOT } = require("../lib/monorepo-root.cjs");
const { DEPLOY_CLI } = require("../lib/api-server-cli.cjs");

const appRel = process.argv[2]?.trim() || "apps/hub-checkin/api";
const appRoot = path.resolve(ROOT, appRel);

console.log(`[api:audit:modules] ${path.relative(ROOT, appRoot)}\n`);

for (const script of ["report-module-files.cjs", "report-module-bindings.cjs"]) {
  execSync(`node dev/${script} "${appRoot}"`, {
    cwd: DEPLOY_CLI,
    stdio: "inherit",
  });
}
