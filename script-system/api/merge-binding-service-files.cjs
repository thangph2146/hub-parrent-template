/**
 * Materialize module-bases binding — delegate deploy CLI.
 *
 * Usage: pnpm api:merge:binding-services
 */
const path = require("node:path");
const { execSync } = require("node:child_process");
const { ROOT } = require("../lib/monorepo-root.cjs");

console.log("[api:merge:binding-services] materialize main API module-bases\n");

execSync("node deploy/cli/materialize-main-api-bases.cjs", {
  cwd: path.join(ROOT, "packages", "api-server"),
  stdio: "inherit",
});
