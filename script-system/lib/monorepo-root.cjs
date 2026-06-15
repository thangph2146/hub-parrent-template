/**
 * Entry lib chuẩn cho mọi script trong script-system (CommonJS .cjs).
 * Tương đương packages/api-server/deploy/cli/lib/monorepo-root.cjs
 */
const path = require("node:path");

const SCRIPT_SYSTEM = path.resolve(__dirname, "..");
const ROOT = path.resolve(SCRIPT_SYSTEM, "..");

const {
  PRODUCT_LINES,
  API_INHERITS_FROM_MAIN,
  NEXT_APP_PATHS,
  MAIN_API_PERMISSIONS,
  MAIN_API_PATH,
} = require("./monorepo-apps.cjs");

module.exports = {
  SCRIPT_SYSTEM,
  ROOT,
  PRODUCT_LINES,
  API_INHERITS_FROM_MAIN,
  NEXT_APP_PATHS,
  MAIN_API_PERMISSIONS,
  MAIN_API_PATH,
};
