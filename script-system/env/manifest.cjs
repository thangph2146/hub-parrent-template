/**
 * Registry file .env theo product line / PM2 stack.
 * Mỗi app deployable có đúng một `.env.example` (commit) và `.env` (local, gitignore).
 *
 * @see docs/env/README.md
 */
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

/** @typedef {{ path: string; package: string; template: string; port?: number }} EnvApp */

/** @type {Record<string, { description: string; apps: EnvApp[] }>} */
const ENV_STACKS = {
  main: {
    description: "Source of truth — API + admin (@api + @backend)",
    apps: [
      {
        path: PRODUCT_LINES.main.api.path,
        package: PRODUCT_LINES.main.api.package,
        template: "api-main",
        port: 3002,
      },
      {
        path: PRODUCT_LINES.main.backend.path,
        package: PRODUCT_LINES.main.backend.package,
        template: "next-admin",
        port: 3001,
      },
    ],
  },
  parent: {
    description: "Site chính — hub-parent API + main admin + storefront (ecosystem.main)",
    apps: [
      {
        path: PRODUCT_LINES["hub-parent"].api.path,
        package: PRODUCT_LINES["hub-parent"].api.package,
        template: "api-hub-parent",
        port: 3002,
      },
      {
        path: PRODUCT_LINES.main.backend.path,
        package: PRODUCT_LINES.main.backend.package,
        template: "next-admin",
        port: 3001,
      },
      {
        path: PRODUCT_LINES["hub-parent"].frontend.path,
        package: PRODUCT_LINES["hub-parent"].frontend.package,
        template: "next-storefront-parent",
        port: 3000,
      },
    ],
  },
  checkin: {
    description: "Check-in sự kiện — hub-event API + check-in frontend (ecosystem.checkin)",
    apps: [
      {
        path: PRODUCT_LINES["hub-event"].api.path,
        package: PRODUCT_LINES["hub-event"].api.package,
        template: "api-hub-event",
        port: 3002,
      },
      {
        path: PRODUCT_LINES["hub-event"].frontend.path,
        package: PRODUCT_LINES["hub-event"].frontend.package,
        template: "next-checkin",
        port: 3000,
      },
    ],
  },
  store: {
    description: "Store sync — store-sync API + storefront (ecosystem store)",
    apps: [
      {
        path: PRODUCT_LINES["store-sync"].api.path,
        package: PRODUCT_LINES["store-sync"].api.package,
        template: "api-store-sync",
        port: 3002,
      },
      {
        path: PRODUCT_LINES["store-sync"].frontend.path,
        package: PRODUCT_LINES["store-sync"].frontend.package,
        template: "next-storefront-store",
        port: 3000,
      },
    ],
  },
}

function allEnvApps() {
  const seen = new Set()
  /** @type {EnvApp[]} */
  const out = []
  for (const stack of Object.values(ENV_STACKS)) {
    for (const app of stack.apps) {
      if (seen.has(app.path)) continue
      seen.add(app.path)
      out.push(app)
    }
  }
  return out
}

module.exports = { ENV_STACKS, allEnvApps }
