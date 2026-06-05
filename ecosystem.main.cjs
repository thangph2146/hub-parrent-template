/**
 * PM2 — stack site chính
 * @frontend :3000 | @backend :3001 | @api :3002
 *
 * Cả stack:
 *   pm2 start ecosystem.main.cjs
 *
 * Từng app:
 *   pm2 start ecosystem.main.cjs --only hub-main-api
 *   pm2 start ecosystem.main.cjs --only hub-main-backend
 *   pm2 start ecosystem.main.cjs --only hub-main-frontend
 */
const { createMainStack } = require("./ecosystem.shared.cjs")

module.exports = {
  apps: createMainStack(),
}
