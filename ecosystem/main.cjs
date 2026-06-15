/**
 * PM2 compo 1 — site chính
 * hub-parent API (:3002) + main admin (:3001) + hub-parent frontend (:3000)
 *
 * Cả stack:
 *   pnpm pm2:start
 *   pm2 start ecosystem/config.cjs
 *
 * Từng app:
 *   pm2 start ecosystem/main.cjs --only hub-parent-api
 */
const { createParentStack } = require("./shared.cjs");

module.exports = {
  apps: createParentStack(),
};
