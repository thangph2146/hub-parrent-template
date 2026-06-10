/** Cấu hình PM2 dùng chung cho các stack production trong monorepo. */

const { PRODUCT_LINES } = require("./script-system/monorepo-apps.cjs")

const PROD_ENV = { NODE_ENV: "production" }

/** @returns {import('pm2').StartOptions} */
function createApiApp(name, cwd) {
  return {
    name,
    cwd: `./${cwd}`,
    script: "pnpm",
    args: "run start:prod",
    env: {
      ...PROD_ENV,
      PORT: "3002",
    },
  }
}

/** @returns {import('pm2').StartOptions} */
function createBackendApp(name, cwd) {
  return {
    name,
    cwd: `./${cwd}`,
    script: "pnpm",
    args: "next start -p 3001",
    env: PROD_ENV,
  }
}

/** @returns {import('pm2').StartOptions} */
function createNextFrontendApp(name, cwd, port = 3000) {
  return {
    name,
    cwd: `./${cwd}`,
    script: "pnpm",
    args: `next start -p ${port}`,
    env: PROD_ENV,
  }
}

/** Site chính: hub-parent API + main admin + hub-parent storefront */
function createParentStack() {
  return [
    createApiApp("hub-parent-api", PRODUCT_LINES["hub-parent"].api.path),
    createBackendApp("hub-parent-backend", PRODUCT_LINES.main.backend.path),
    createNextFrontendApp(
      "hub-parent-frontend",
      PRODUCT_LINES["hub-parent"].frontend.path,
      3000,
    ),
  ]
}

/** Check-in: API + frontend (admin gộp trong check-in frontend) */
function createCheckinStack() {
  return [
    createApiApp("hub-checkin-api", PRODUCT_LINES["hub-event"].api.path),
    createNextFrontendApp(
      "hub-checkin-frontend",
      PRODUCT_LINES["hub-event"].frontend.path,
      3000,
    ),
  ]
}

/** Store sync: API + storefront */
function createStoreStack() {
  return [
    createApiApp("hub-store-api", PRODUCT_LINES["store-sync"].api.path),
    createNextFrontendApp(
      "hub-store-frontend",
      PRODUCT_LINES["store-sync"].frontend.path,
      3000,
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
