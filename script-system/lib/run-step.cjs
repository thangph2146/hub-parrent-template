/**
 * Chạy lệnh shell có log bước — dùng bởi orchestrator sync/db.
 */
const { execSync } = require("node:child_process");

/**
 * @param {string} cwd
 * @param {string} cmd
 * @param {string} label
 * @param {string} [prefix]
 */
function runStep(cwd, cmd, label, prefix = "run") {
  console.log(`\n[${prefix}] ${label}\n`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

module.exports = { runStep };
