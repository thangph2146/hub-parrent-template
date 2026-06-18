/**
 * Profile đồng bộ sau pull:template — theo productLine downstream.
 *
 * Quy tắc: sửa upstream (mono-repo-template) → push main → downstream `pnpm sync`.
 */
const PROFILES = {
  "hub-checkin": {
    label: "check-in (hub-checkin)",
    steps: [
      { cmd: "pnpm install", label: "1/N install workspace" },
      {
        cmd: "pnpm --filter @workspace/api-server run build",
        label: "2/N build @workspace/api-server",
      },
      {
        cmd: "node script-system/sync/sync-checkin-packages.cjs",
        label: "3/N pull:checkin (verify + admin)",
      },
      {
        cmd: "node script-system/verify/verify-downstream-safe-flow.cjs",
        label: "4/N verify downstream-safe",
      },
    ],
  },
  /** @deprecated alias hub-checkin */
  "hub-event": {
    label: "check-in (hub-checkin)",
    steps: [
      { cmd: "pnpm install", label: "1/N install workspace" },
      {
        cmd: "pnpm --filter @workspace/api-server run build",
        label: "2/N build @workspace/api-server",
      },
      {
        cmd: "node script-system/sync/sync-checkin-packages.cjs",
        label: "3/N pull:checkin (verify + admin)",
      },
      {
        cmd: "node script-system/verify/verify-downstream-safe-flow.cjs",
        label: "4/N verify downstream-safe",
      },
    ],
  },
  "hub-parent": {
    label: "site chính (hub-parent)",
    steps: [
      { cmd: "pnpm install", label: "1/N install workspace" },
      {
        cmd: "pnpm --filter @workspace/api-server run build",
        label: "2/N build @workspace/api-server",
      },
      {
        cmd: "node script-system/verify/verify-api-profile.cjs hub-parent",
        label: "3/N verify API profile",
      },
      {
        cmd: "node script-system/verify/verify-downstream-safe-flow.cjs",
        label: "4/N verify downstream-safe",
      },
    ],
  },
  "store-sync": {
    label: "HUB Store (store-sync)",
    steps: [
      { cmd: "pnpm install", label: "1/N install workspace" },
      {
        cmd: "pnpm --filter @workspace/api-server run build",
        label: "2/N build @workspace/api-server",
      },
      {
        cmd: "pnpm admin:generate:store",
        label: "3/N admin generate store",
      },
      {
        cmd: "node script-system/verify/verify-api-profile.cjs store-sync",
        label: "4/N verify API profile",
      },
      {
        cmd: "node script-system/verify/verify-downstream-safe-flow.cjs",
        label: "5/N verify downstream-safe",
      },
    ],
  },
}

function resolveProfile(manifest) {
  const line = manifest?.productLine
  if (!line) return null
  return PROFILES[line] ?? null
}

module.exports = { PROFILES, resolveProfile }
