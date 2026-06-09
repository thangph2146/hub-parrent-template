/**
 * PM2 compo 1 — site chính
 * apps/api (:3002) + apps/backend (:3001) + apps/frontend (:3000)
 *
 * Cả stack:
 *   pnpm pm2:start
 *   pnpm pm2:reload
 *   pnpm pm2:restart
 *   pm2 start ecosystem.main.cjs
 *
 * Từng app:
 *   pm2 start ecosystem.main.cjs --only hub-parent-api
 *   pm2 start ecosystem.main.cjs --only hub-parent-backend
 *   pm2 start ecosystem.main.cjs --only hub-parent-frontend
 */
const { createParentStack } = require("./ecosystem.shared.cjs")

module.exports = {
  apps: createParentStack(),
}
