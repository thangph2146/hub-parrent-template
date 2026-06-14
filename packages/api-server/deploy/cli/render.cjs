/**
 * Render API — deploy/nest → apps (product line API)
 */
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { ROOT, PACKAGE_ROOT } = require('./lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('../config/product-lines.cjs')
const {
  templateHasSource,
  listTemplateModuleIds,
  resolveTemplateRoot,
} = require('../config/template.config.cjs')
const { resolveApiModules } = require('../config/render.config.cjs')
const { prepareInteractiveStdin } = require('./lib/render/prepare-interactive-stdin.cjs')
const { ensureApiAppConfig, hasApiAppConfig } = require('./scaffold-api-app-config.cjs')
const { pickApiAppTarget, pickPackageModules, assertTty } = require('./render-prompts.cjs')
const { printApiRenderHelp } = require('./lib/render/render-help.cjs')
const { renderApiFromTemplate } = require('./lib/render/render-from-template.cjs')
const { printApiRenderSummary } = require('./lib/render/render-summary.cjs')
const { syncApiTemplate } = require('./sync-template.cjs')
const { ensureAppEnv } = require('./ensure-app-env.cjs')

const args = process.argv.slice(2).filter((a) => a !== '--')

if (args.includes('--help') || args.includes('-h')) {
  printApiRenderHelp()
  process.exit(0)
}

function readPackageName(appRel) {
  const pkgPath = path.join(ROOT, appRel, 'package.json')
  if (!fs.existsSync(pkgPath)) return null
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name ?? null
}

function runNode(scriptRel, label) {
  console.log(`\n[api:render] ${label}\n`)
  execSync(`node ${path.join(PACKAGE_ROOT, scriptRel)}`, { cwd: ROOT, stdio: 'inherit' })
}

function run(cmd, label) {
  console.log(`\n[api:render] ${label}\n`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
}

function hasFlag(name) {
  return args.includes(name)
}

function getArgValue(prefix) {
  return args.find((a) => a.startsWith(prefix))?.slice(prefix.length)
}

function parseModulesArg() {
  const raw = getArgValue('--modules=')
  if (!raw?.trim()) return null
  return raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
}

async function resolveTargetApp() {
  const positional = args.find((a) => !a.startsWith('--') && a.includes('/'))
  if (positional) return positional.replace(/\\/g, '/')
  const fromFlag = getArgValue('--app=')
  if (fromFlag) return fromFlag.replace(/\\/g, '/')
  if (args.length === 0 || hasFlag('--pick') || !positional) {
    assertTty()
    return pickApiAppTarget()
  }
  throw new Error('[api:render] Thiếu repo. VD: pnpm api:render apps/hub-event/api')
}

async function resolveModuleList(appRel, wantAll = false) {
  const explicit = parseModulesArg()
  if (explicit?.length) return explicit

  const wantsPick =
    process.stdin.isTTY &&
    !explicit &&
    !wantAll &&
    (args.length === 0 || hasFlag('--pick'))

  if (wantAll) return listTemplateModuleIds(resolveTemplateRoot())
  if (wantsPick) {
    const { modules: appModules } = resolveApiModules(appRel)
    return [...(await pickPackageModules({ appModules }))]
  }
  return resolveApiModules(appRel).modules
}

function runTypecheck(appRel, pkgName) {
  const scripts = JSON.parse(fs.readFileSync(path.join(ROOT, appRel, 'package.json'), 'utf8')).scripts ?? {}
  if (!scripts.typecheck) return 'skip-no-script'
  run(`pnpm --filter ${pkgName} run typecheck`, 'typecheck')
  return 'ok'
}

async function main() {
  prepareInteractiveStdin()

  const appRel = await resolveTargetApp()
  if (appRel.replace(/\\/g, '/').includes('apps/main/api')) {
    throw new Error('[api:render] apps/main/api là SOT — không render vào chính nó.')
  }

  if (!hasApiAppConfig(appRel)) {
    await ensureApiAppConfig(appRel, {
      interactive: !hasFlag('--init-config') && process.stdin.isTTY,
      force: hasFlag('--init-config'),
    })
  }

  const skipSync = hasFlag('--skip-sync-template')
  const skipEnv = hasFlag('--skip-env')
  const skipTypecheck = hasFlag('--skip-typecheck')
  const skipVerify = hasFlag('--skip-verify')
  const skipParity = hasFlag('--skip-parity')
  const heal = hasFlag('--heal')
  const wantFull = hasFlag('--full')
  const prune = hasFlag('--prune') || wantFull
  const pruneEntities = hasFlag('--prune-entities')
  const pipelineSteps = []

  if (!skipSync && fs.existsSync(path.join(ROOT, MAIN_API_PATH, 'src', 'main.ts'))) {
    const verbose = hasFlag('--verbose')
    console.log(
      `\n[api:render] sync template ← main/api${verbose ? '' : ' (compact — thêm --verbose để xem từng file)'}\n`,
    )
    syncApiTemplate({ verbose, printSummary: false })
    pipelineSteps.push({ label: 'sync template ← apps/main/api', ok: true })
  } else if (!templateHasSource()) {
    throw new Error('[api:render] Thiếu template. Chạy pnpm api:sync-template')
  } else if (skipSync) {
    pipelineSteps.push({
      label: 'sync template',
      skipped: true,
      detail: 'bỏ qua (--skip-sync-template)',
    })
  } else {
    pipelineSteps.push({ label: 'sync template', skipped: true, detail: 'dùng deploy/nest hiện có' })
  }

  const explicitModules = parseModulesArg()
  let wantAll = hasFlag('--all-modules') || wantFull
  if (hasApiAppConfig(appRel)) {
    try {
      const { renderAllModules } = resolveApiModules(appRel)
      if (renderAllModules) wantAll = true
    } catch {
      /* config chưa hợp lệ — render sẽ báo lỗi sau */
    }
  }
  if (args.length === 0 && process.stdin.isTTY) {
    wantAll = false
  }
  if (
    (appRel.includes('hub-event/') || appRel.includes('hub-parent/')) &&
    !explicitModules?.length &&
    !hasFlag('--pick') &&
    args.length > 0
  ) {
    wantAll = true
  }

  const renderOpts = {
    modules: await resolveModuleList(appRel, wantAll),
    allModules: wantAll,
    prune,
    pruneEntities,
    scaffold: wantFull || !fs.existsSync(path.join(ROOT, appRel, 'package.json')),
  }

  let renderResult = renderApiFromTemplate(appRel, renderOpts)
  pipelineSteps.push({
    label: 'materialize deploy/nest → app',
    ok: true,
    detail: `${renderResult.moduleIds.length} module`,
  })

  if (!skipEnv) {
    ensureAppEnv(appRel, { force: hasFlag('--force-env') })
    pipelineSteps.push({ label: 'chuẩn bị .env', ok: true })
  } else {
    pipelineSteps.push({ label: 'chuẩn bị .env', skipped: true, detail: '--skip-env' })
  }

  const pkgName = readPackageName(appRel)
  if (!skipTypecheck && pkgName) {
    try {
      const tc = runTypecheck(appRel, pkgName)
      if (tc === 'ok') pipelineSteps.push({ label: 'typecheck', ok: true })
      else pipelineSteps.push({ label: 'typecheck', skipped: true, detail: 'package không có script' })
    } catch (err) {
      if (heal && fs.existsSync(path.join(ROOT, MAIN_API_PATH, 'src', 'main.ts'))) {
        console.warn('\n[api:render] typecheck fail — --heal: sync template + render lại\n')
        syncApiTemplate({ verbose: hasFlag('--verbose'), printSummary: false })
        pipelineSteps.push({ label: 'heal: sync template', ok: true })
        renderResult = renderApiFromTemplate(appRel, renderOpts)
        pipelineSteps.push({
          label: 'heal: materialize lại',
          ok: true,
          detail: `${renderResult.moduleIds.length} module`,
        })
        runTypecheck(appRel, pkgName)
        pipelineSteps.push({ label: 'typecheck (heal)', ok: true })
      } else {
        throw err
      }
    }
  } else {
    pipelineSteps.push({
      label: 'typecheck',
      skipped: true,
      detail: skipTypecheck ? '--skip-typecheck' : 'không có package.json',
    })
  }

  if (!skipVerify && hasApiAppConfig(appRel) && !renderResult.partialRender) {
    run(
      `node ${path.join(PACKAGE_ROOT, 'deploy/cli/verify/verify-render-api.mjs')} ${appRel}`,
      `verify ${appRel}`,
    )
    pipelineSteps.push({ label: 'verify:render-api', ok: true })
    if (!skipParity && appRel.includes('hub-event')) {
      runNode('deploy/cli/verify/endpoint-parity.mjs', 'verify endpoint parity')
      pipelineSteps.push({ label: 'endpoint parity (13 module)', ok: true })
    } else {
      pipelineSteps.push({ label: 'endpoint parity', skipped: true, detail: '--skip-parity' })
    }
  } else if (renderResult.partialRender) {
    pipelineSteps.push({
      label: 'verify hub-event',
      skipped: true,
      detail: 'partial render (--modules)',
    })
  } else if (skipVerify) {
    pipelineSteps.push({ label: 'verify hub-event', skipped: true, detail: '--skip-verify' })
  }

  const { outroLine } = printApiRenderSummary({
    appRel,
    pkgName,
    render: renderResult,
    flags: { skipSync, prune, skipEnv, skipTypecheck, skipVerify, skipParity, scaffold: wantFull },
    steps: pipelineSteps,
  })
  try {
    require('@clack/prompts').outro(outroLine)
  } catch {
    /* ignore */
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
