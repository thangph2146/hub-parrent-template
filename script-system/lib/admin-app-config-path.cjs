/**
 * Resolve `admin.app.config.json` / `portal.app.config.json` trên app Next.
 * Check-in: `config/*.app.config.json` · main/store: root `admin.app.config.json`.
 */
const fs = require("node:fs")
const path = require("node:path")

const ADMIN_APP_CONFIG_CANDIDATES = [
  "config/admin.app.config.json",
  "admin.app.config.json",
]

const PORTAL_APP_CONFIG_CANDIDATES = [
  "config/portal.app.config.json",
  "portal.app.config.json",
]

/** @param {string} appRoot absolute or relative to cwd */
function resolveAdminAppConfigFile(appRoot) {
  for (const rel of ADMIN_APP_CONFIG_CANDIDATES) {
    const full = path.join(appRoot, rel)
    if (fs.existsSync(full)) return full
  }
  const legacy = path.join(appRoot, "admin.sync-modules.json")
  if (fs.existsSync(legacy)) return legacy
  return null
}

/** @param {string} appRoot */
function resolvePortalAppConfigFile(appRoot) {
  for (const rel of PORTAL_APP_CONFIG_CANDIDATES) {
    const full = path.join(appRoot, rel)
    if (fs.existsSync(full)) return full
  }
  return null
}

/** @param {string} appRoot */
function readAdminAppConfig(appRoot) {
  const file = resolveAdminAppConfigFile(appRoot)
  if (!file) return null
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

/** @param {string} appRoot */
function readPortalAppConfig(appRoot) {
  const file = resolvePortalAppConfigFile(appRoot)
  if (!file) return null
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

module.exports = {
  ADMIN_APP_CONFIG_CANDIDATES,
  PORTAL_APP_CONFIG_CANDIDATES,
  resolveAdminAppConfigFile,
  resolvePortalAppConfigFile,
  readAdminAppConfig,
  readPortalAppConfig,
}
