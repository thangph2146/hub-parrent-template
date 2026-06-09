/** Cấu hình PM2 dùng chung cho các stack production trong monorepo. */

const PROD_ENV = { NODE_ENV: "production" }

/** @returns {import('pm2').StartOptions} */
function createApiApp(name) {
  return {
    name,
    cwd: "./apps/api",
    script: "pnpm",
    args: "run start:prod",
    env: {
      ...PROD_ENV,
      PORT: "3002",
    },
  }
}

/** @returns {import('pm2').StartOptions} */
function createBackendApp(name) {
  return {
    name,
    cwd: "./apps/backend",
    script: "pnpm",
    args: "next start -p 3001",
    env: PROD_ENV,
  }
}

/** @returns {import('pm2').StartOptions} */
function createNextFrontendApp(name, cwd, port = 3000) {
  return {
    name,
    cwd,
    script: "pnpm",
    args: `next start -p ${port}`,
    env: PROD_ENV,
  }
}

/** Site chính: @frontend (3000) + @backend (3001) + @api (3002) */
function createParentStack() {
  return [
    createApiApp("hub-parent-api"),
    createBackendApp("hub-parent-backend"),
    createNextFrontendApp("hub-parent-frontend", "./apps/frontend", 3000),
  ]
}

/** Check-in event: @hub-event-checkin-frontend (3000) + @backend (3001) + @api (3002) */
function createCheckinStack() {
  return [
    createApiApp("hub-checkin-api"),
    createBackendApp("hub-checkin-backend"),
    createNextFrontendApp(
      "hub-checkin-frontend",
      "./apps/hub-event-checkin-frontend",
      3000
    ),
  ]
}

/** Store sync: @store-sync-frontend (3000) + @backend (3001) + @api (3002) */
function createStoreStack() {
  return [
    createApiApp("hub-store-api"),
    createBackendApp("hub-store-backend"),
    createNextFrontendApp(
      "hub-store-frontend",
      "./apps/store-sync-frontend",
      3000
    ),
  ]
}

/** @deprecated dùng createParentStack */
const createMainStack = createParentStack

module.exports = {
  PROD_ENV,
  createApiApp,
  createBackendApp,
  createNextFrontendApp,
  createParentStack,
  createMainStack,
  createCheckinStack,
  createStoreStack,
}
