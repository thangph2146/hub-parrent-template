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
function createMainStack() {
  return [
    createApiApp("hub-main-api"),
    createBackendApp("hub-main-backend"),
    createNextFrontendApp("hub-main-frontend", "./apps/frontend", 3000),
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

module.exports = {
  PROD_ENV,
  createApiApp,
  createBackendApp,
  createNextFrontendApp,
  createMainStack,
  createCheckinStack,
}
