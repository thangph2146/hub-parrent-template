const fs = require("node:fs")
const path = require("node:path")

const ADMIN_APP_CONFIG_CANDIDATES = [
  "config/admin.app.config.json",
  "admin.app.config.json",
]

function resolveAdminAppConfigFile(appRoot) {
  for (const rel of ADMIN_APP_CONFIG_CANDIDATES) {
    const full = path.join(appRoot, rel)
    if (fs.existsSync(full)) return full
  }
  const legacy = path.join(appRoot, "admin.sync-modules.json")
  if (fs.existsSync(legacy)) return legacy
  return null
}

module.exports = { resolveAdminAppConfigFile }
