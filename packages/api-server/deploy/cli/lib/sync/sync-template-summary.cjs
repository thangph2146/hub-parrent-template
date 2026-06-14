/**
 * Tóm tắt cuối pipeline api:sync-template.
 */
function printSyncTemplateSummary(ctx) {
  const {
    copied,
    moduleCount,
    prunedThin,
    prunedCommon,
    contractSpecs,
    moduleSpecs,
    moduleSpecSkipped,
    pkgBind,
    inherit,
    mirror,
    verbose,
    steps = [],
  } = ctx

  const mirrorLine =
    mirror && (mirror.wipedDirs > 0 || mirror.removedOrphans > 0 || mirror.removedRootFiles > 0)
      ? `refresh ${mirror.wipedDirs} dir · orphan ${mirror.removedOrphans} dir · ${mirror.removedRootFiles} root file`
      : 'refresh src/* từ main (không orphan)'

  const lines = [
    '',
    '[sync:template] ── Tóm tắt ──',
    `  Nguồn:       apps/main/api → packages/api-server/deploy/nest`,
    `  Mirror:      ${mirrorLine}`,
    `  Module:      ${moduleCount}`,
    `  Copy main:   ${copied} file`,
    `  Common:      pkg + template-common + crud + module-bases (${pkgBind?.bound ?? '—'} package-base)`,
    `  Contract:    ${contractSpecs?.specs ?? 0} spec/helper · ${contractSpecs?.fixtures ?? 0} fixture`,
    `  Module spec: ${moduleSpecs ?? 0} vend (skip ${moduleSpecSkipped ?? 0})`,
    `  Prune:       thin ${prunedThin} · common ${prunedCommon}`,
    `  Entity graph:${ctx.entityGraph != null ? ` ${ctx.entityGraph} entities → deploy/config/entity-graph.manifest.json` : ' —'}`,
    `  OOP:         ${inherit?.copied ?? 0} mirror · ${inherit?.skipped ?? 0} fallback`,
  ]

  if (!verbose) {
    lines.push('  Chi tiết:    thêm --verbose để xem từng file copy/prune')
  }

  if (steps.length) {
    lines.push('', '  Bước:')
    for (const step of steps) lines.push(`    ✓ ${step}`)
  }

  lines.push('', '  Tiếp theo:')
  lines.push('    pnpm api:render apps/hub-event/api --prune')
  lines.push('    pnpm verify:api-template')
  lines.push('    pnpm verify:entity-closure')
  lines.push('    pnpm --filter @workspace/api-server run test:nest-contract')
  lines.push('')

  const text = lines.join('\n')
  console.log(text)
  return { text, outroLine: `Hoàn tất · ${moduleCount} module → deploy/nest` }
}

module.exports = { printSyncTemplateSummary }
