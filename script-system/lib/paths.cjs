/**
 * Đường dẫn chuẩn: script-system/ ↔ monorepo root.
 */
const path = require("node:path");

const SCRIPT_SYSTEM = path.resolve(__dirname, "..");
const ROOT = path.resolve(SCRIPT_SYSTEM, "..");

module.exports = { SCRIPT_SYSTEM, ROOT };
