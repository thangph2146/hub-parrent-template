const clack = require('@clack/prompts')
const { MAIN_API_PATH } = require('../config/product-lines.cjs')
const { discoverApiAppTargets } = require('./lib/render/discover-api-apps.cjs')
const { listAllModulesForRender, canRenderModule } = require('./lib/render/list-template-modules.cjs')
const { ensureApiAppConfig } = require('./scaffold-api-app-config.cjs')
const { getApiRenderHelpShort } = require('./lib/render/render-help.cjs')

function assertTty() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('[api:render] Cần TTY. Dùng: pnpm api:render apps/hub-checkin/api')
  }
}

function exitOnCancel(value) {
  if (clack.isCancel(value)) {
    clack.cancel('Đã hủy api:render')
    process.exit(0)
  }
  return value
}

async function pickApiAppTarget() {
  assertTty()
  const allTargets = discoverApiAppTargets()
  const targets = allTargets.filter((t) => !t.isSourceOfTruth)
  if (!targets.length) {
    throw new Error('[api:render] Không tìm thấy app API deploy (ngoài SOT apps/main/api)')
  }

  clack.intro('api:render — @workspace/api-server')
  clack.note(
    `${getApiRenderHelpShort()}\n\napps/main/api là SOT — không render (dùng pnpm api:sync-template).`,
    'Phím tắt',
  )

  const appRel = exitOnCancel(
    await clack.select({
      message: 'Chọn repo API deploy',
      options: targets.map((t) => ({
        value: t.appRel,
        label: `${t.renderReady ? '[✓]' : '[—]'} ${t.appRel}`,
        hint: t.configId
          ? `${t.configId} · ${t.packageName ?? t.line}`
          : t.packageName ?? t.line,
      })),
    }),
  )

  if (appRel.replace(/\\/g, '/') === MAIN_API_PATH.replace(/\\/g, '/')) {
    clack.cancel('apps/main/api là source of truth — không render vào đây.')
    process.exit(1)
  }

  const target = targets.find((t) => t.appRel === appRel)
  if (!target?.renderReady) {
    await ensureApiAppConfig(appRel, { interactive: true })
  }

  clack.log.step(`Repo: ${appRel}`)
  return appRel
}

async function pickPackageModules({ appModules }) {
  assertTty()
  const candidates = (appModules ?? []).length ? [...appModules] : listAllModulesForRender()
  if (!candidates.length) throw new Error('[api:render] Template rỗng — chạy pnpm api:sync-template')

  const appSet = new Set(appModules ?? [])
  const initialValues = []
  const options = candidates.filter(canRenderModule).map((id) => {
    const inConfig = appSet.has(id)
    if (inConfig) initialValues.push(id)
    return { value: id, label: `[${inConfig ? '✓' : '·'}] ${id}` }
  })

  return exitOnCancel(
    await clack.multiselect({
      message: 'Chọn module render',
      options,
      initialValues,
      required: true,
    }),
  )
}

module.exports = { pickApiAppTarget, pickPackageModules, assertTty }
