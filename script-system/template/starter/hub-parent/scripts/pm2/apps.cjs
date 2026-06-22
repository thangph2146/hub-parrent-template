/** PM2 apps — hub-parent production (API :3002 + frontend :3000). */
const PROD = { NODE_ENV: "production" }

const API_PATH = "apps/hub-parent/api"
const FE_PATH = "apps/hub-parent/hub-parent-frontend"

function createStack() {
  return [
    {
      name: "hub-parent-api",
      cwd: `./${API_PATH}`,
      script: "pnpm",
      args: "run start:prod",
      env: { ...PROD, PORT: "3002" },
    },
    {
      name: "hub-parent-frontend",
      cwd: `./${FE_PATH}`,
      script: "pnpm",
      args: "exec next start -p 3000",
      env: PROD,
    },
  ]
}

const PROCESS_NAMES = ["hub-parent-api", "hub-parent-frontend"]

/** Tên process cũ — dọn khi delete. */
const LEGACY_DELETE_NAMES = [
  "hub-parent-frontend",
  "hub-parent-api",
]

module.exports = { createStack, PROCESS_NAMES, LEGACY_DELETE_NAMES }
