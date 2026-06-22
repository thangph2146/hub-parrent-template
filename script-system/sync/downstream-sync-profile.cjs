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
  "hub-parent": {
    label: "site chính (hub-parent)",
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
        cmd: "pnpm --filter @workspace/api-server run render -- --line=hub-parent --skip-sync-template --skip-env --skip-typecheck --prune --prune-entities",
      },
      {
        id: "apply-api-overrides",
        name: "Apply hub-parent API overrides",
        cmd: "pnpm --filter @hub-parent/api run apply-overrides",
      },
      {
        id: "ensure-api-env",
        name: "Tạo .env API nếu thiếu",
        cmd: "node -e \"require('./packages/api-server/deploy/cli/ensure-app-env.cjs').ensureAppEnv('apps/hub-parent/api')\"",
      },
      {
        id: "verify-downstream-safe",
        name: "Verify downstream-safe",
        cmd: "node script-system/verify/verify-downstream-safe-flow.cjs",
      },
    ],
  },
  "store-sync": createFeatureTemplateProfile("store-sync", "HUB Store (store-sync)"),
}

function resolveProfile(manifest) {
  const line = manifest?.productLine
  if (!line) return null
  return PROFILES[line] ?? null
}

module.exports = { PROFILES, resolveProfile }
