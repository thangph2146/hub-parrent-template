/**
 * Sinh controller contract specs — delegate deploy CLI.
 */
const path = require("node:path");
const { execSync } = require("node:child_process");
const { ROOT } = require("../lib/monorepo-root.cjs");

execSync("node packages/api-server/deploy/cli/apply-main-api-oop.cjs --specs-only --all", {
  cwd: ROOT,
  stdio: "inherit",
});
