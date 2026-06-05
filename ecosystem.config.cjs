/**
 * PM2 mặc định — alias compo 1 (ecosystem.main.cjs).
 *
 * Compo 1: apps/api + apps/backend + apps/frontend
 *   pnpm pm2:start
 *   pm2 start ecosystem.config.cjs
 *
 * Compo 2: apps/api + apps/backend + apps/hub-event-checkin-frontend
 *   pnpm pm2:start:checkin
 *   pm2 start ecosystem.checkin.cjs
 */
module.exports = require("./ecosystem.main.cjs")
