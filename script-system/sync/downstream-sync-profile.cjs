/**
 * Profile đồng bộ sau pull:template — theo productLine downstream.
 *
 * Quy tắc: sửa upstream (mono-repo-template) → push main → downstream `pnpm sync`.
 */
function createFeatureTemplateProfile(line, label) {
  return {
    label,
    steps: [
      { id: "install", name: "Cài đặt workspace", cmd: "pnpm install" },
      {
        id: "build-api-server",
        name: "Build @workspace/api-server",
        cmd: "pnpm --filter @workspace/api-server run build",
      },
      {
        id: "render-api-profile",
        name: "Render API theo feature profile",
        cmd: `pnpm --filter @workspace/api-server run render -- --line=${line} --skip-sync-template --skip-env --skip-typecheck --prune --prune-entities`,
      },
      {
        id: "verify-downstream-safe",
        name: "Verify downstream-safe",
        cmd: "node script-system/verify/verify-downstream-safe-flow.cjs",
      },
    ],
  }
}

const PROFILES = {
  "hub-checkin": createFeatureTemplateProfile("hub-checkin", "check-in (hub-checkin)"),
  "hub-parent": createFeatureTemplateProfile("hub-parent", "site chính (hub-parent)"),
  "store-sync": createFeatureTemplateProfile("store-sync", "HUB Store (store-sync)"),
}

function resolveProfile(manifest) {
  const line = manifest?.productLine
  if (!line) return null
  return PROFILES[line] ?? null
}

module.exports = { PROFILES, resolveProfile }
