/**
 * Vend service specs vào deploy/nest — qua api:sync-template.
 */
const { execSync } = require("node:child_process");
const { ROOT } = require("../lib/monorepo-root.cjs");

execSync("pnpm api:sync-template", { cwd: ROOT, stdio: "inherit" });
