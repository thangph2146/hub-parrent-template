/**
 * Tóm tắt cuối pipeline api:render.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')

function countModuleBasePackages(appRel) {
  const dir = path.join(ROOT, appRel, 'src/common/module-bases')
  if (!fs.existsSync(dir)) return 0
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).length
}

function formatStep(step) {
  const mark = step.skipped ? '○' : step.ok ? '✓' : '✗'
  const suffix = step.detail ? ` — ${step.detail}` : ''
  return `    ${mark} ${step.label}${suffix}`
}

function nextStepsForApp(appRel, pkgName) {
  const rel = appRel.replace(/\\/g, '/')
  const steps = []
  if (pkgName) {
    steps.push(`pnpm --filter ${pkgName} run dev`)
  }
  if (rel.includes('hub-event/')) {
    steps.push('pnpm dev:checkin          # API + admin check-in (port 3000/3001/3002)')
    steps.push('pnpm pull:checkin         # sau git pull — sync template + admin từ main')
  }
  steps.push('pnpm api:sync-template    # cập nhật deploy/nest từ apps/main/api')
  return steps
}

/**
 * @param {{
 *   appRel: string
 *   pkgName?: string | null
 *   render: { moduleIds: string[], prunedTopLevel: string[], skippedModules: string[], closureAdded?: number }
 *   flags: { skipSync: boolean, prune: boolean, skipEnv: boolean, skipTypecheck: boolean, skipVerify: boolean, skipParity: boolean, scaffold: boolean }
 *   steps: Array<{ label: string, ok?: boolean, skipped?: boolean, detail?: string }>
 * }} ctx
 */
function printApiRenderSummary(ctx) {
  const { appRel, pkgName, render, flags, steps } = ctx
  const moduleBases = countModuleBasePackages(appRel)
  const lines = [
    '',
    '[api:render] ── Tóm tắt ──',
    `  Đích:        ${appRel}${pkgName ? ` (${pkgName})` : ''}`,
    `  Nguồn:       packages/api-server/deploy/nest`,
    `  Module app:  ${render.moduleIds.length}${render.closureAdded ? ` (+${render.closureAdded} closure)` : ''}`,
    `  Module-bases:${moduleBases ? ` ${moduleBases} package (sau prune closure)` : ' —'}`,
  ]

  if (flags.prune) {
    const pruned = render.prunedTopLevel.length
    lines.push(
      `  Prune:       bật${pruned ? ` · đã xóa ${pruned} thư mục src/ thừa` : ' · không có thư mục thừa'}`,
    )
  } else {
    lines.push('  Prune:       tắt (giữ module src/ không thuộc closure)')
  }

  const flagParts = []
  if (flags.skipSync) flagParts.push('--skip-sync-template')
  if (flags.skipTypecheck) flagParts.push('--skip-typecheck')
  if (flags.skipVerify) flagParts.push('--skip-verify')
  if (flags.skipParity) flagParts.push('--skip-parity')
  if (flags.skipEnv) flagParts.push('--skip-env')
  if (flagParts.length) lines.push(`  Flags:       ${flagParts.join(', ')}`)

  lines.push('', '  Pipeline:')
  for (const step of steps) lines.push(formatStep(step))

  if (render.skippedModules.length) {
    lines.push('', `  Cảnh báo: bỏ qua ${render.skippedModules.length} module (thiếu trên template):`)
    for (const id of render.skippedModules) lines.push(`    - ${id}`)
  }

  lines.push('', '  Shell copy: src/common/{crud,module-bases,module-types}, config, entities, mikro-orm')
  lines.push('', '  Tiếp theo:')
  for (const cmd of nextStepsForApp(appRel, pkgName)) lines.push(`    ${cmd}`)
  lines.push('')

  const text = lines.join('\n')
  console.log(text)

  const outroLine = `Hoàn tất · ${render.moduleIds.length} module → ${appRel}`
  return { text, outroLine }
}

module.exports = { printApiRenderSummary, countModuleBasePackages }
