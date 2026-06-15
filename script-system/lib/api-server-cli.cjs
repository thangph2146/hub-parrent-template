/**
 * Đường dẫn CLI @workspace/api-server/deploy — wrapper script-system/api/*.cjs
 */
const path = require("node:path");
const { ROOT } = require("./monorepo-root.cjs");

const API_SERVER_ROOT = path.join(ROOT, "packages", "api-server");
const DEPLOY_CLI = path.join(API_SERVER_ROOT, "deploy", "cli");
const DEPLOY_CONFIG = path.join(API_SERVER_ROOT, "deploy", "config");

module.exports = {
  API_SERVER_ROOT,
  DEPLOY_CLI,
  DEPLOY_CONFIG,
};
