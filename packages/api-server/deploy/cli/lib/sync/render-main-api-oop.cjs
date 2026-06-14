/**
 * Sinh binding OOP cho apps/main/api — extends Base* local (src/common/module-bases).
 */
const {
  renderPackageService,
  renderPackageController,
  renderAutoPackageController,
} = require('../../../config/package-module-bindings.cjs')

const MAIN_API_BANNER =
  '/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */\n'

function localBaseServiceImport(config) {
  return (
    config.baseServiceImport ??
    `../common/module-bases/${config.baseModuleSubpath}/${config.baseModuleSubpath}.service`
  )
}

function localBaseControllerImport(config) {
  return (
    config.baseControllerImport ??
    `../common/module-bases/${config.baseModuleSubpath}/${config.baseModuleSubpath}.controller`
  )
}

const MAIN_COMMERCE_IMPORT_REWRITES = [
  [/from '\.\.\/common\/product-types'/g, "from '../common/commerce/product-types'"],
  [/from '\.\.\/common\/product-units'/g, "from '../common/commerce/product-units'"],
  [/from '\.\.\/common\/gift-rules'/g, "from '../common/commerce/gift-rules'"],
  [/from '\.\.\/common\/promo-checkout'/g, "from '../common/commerce/promo-checkout'"],
  [/from '\.\.\/common\/cart-types'/g, "from '../common/commerce/cart-types'"],
  [/from '\.\.\/common\/unit-pricing'/g, "from '../common/commerce/unit-pricing'"],
]

function replaceBaseImports(content, moduleId, config) {
  let next = content.replace(
    /\/\*\* (?:AUTO-GENERATED|NestJS OOP)[^*]*\*\/\n?/,
    MAIN_API_BANNER,
  )

  if (config) {
    const pkg = `@workspace/api-server/modules/${moduleId}`
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const servicePath = localBaseServiceImport(config)
    const controllerPath = localBaseControllerImport(config)

    next = next.replace(new RegExp(`from '${esc(pkg)}'`, 'g'), (full, offset) => {
      const tail = next.slice(offset, offset + 400)
      if (/Controller/.test(tail.slice(0, 120))) {
        return `from '${controllerPath}'`
      }
      return `from '${servicePath}'`
    })
  }

  for (const [pattern, replacement] of MAIN_COMMERCE_IMPORT_REWRITES) {
    next = next.replace(pattern, replacement)
  }
  return next
}

function sanitizeMainApiServiceSource(out) {
  return out
    .replace(/, ContactRequestBulkAction/g, '')
    .replace(/export type \{ ContactRequestBulkAction, /, 'export type { ')
    .replace(/export type \{ AuthRoleNamesBinding, /, 'export type { ')
    .replace(/, AuthRoleNamesBinding/g, '')
}

function inferLegacyProtectedHooks(mainServiceSrc) {
  const blocks = []
  let filterImport = null

  const searchMatch = mainServiceSrc.match(/searchFields:\s*\[([^\]]+)\]/)
  if (searchMatch) {
    blocks.push(`  protected getSearchFields(): string[] {
    return [${searchMatch[1].trim()}];
  }`)
  } else {
    const searchOverride = mainServiceSrc.match(
      /protected getSearchFields\(\)[^}]*return \[([^\]]+)\]/,
    )
    if (searchOverride) {
      blocks.push(`  protected getSearchFields(): string[] {
    return [${searchOverride[1].trim()}];
  }`)
    }
  }

  const filterOverride = mainServiceSrc.match(
    /protected getColumnFiltersConfig\(\)[^}]*return (\w+)/,
  )
  if (filterOverride) {
    const name = filterOverride[1]
    const importMatch = mainServiceSrc.match(
      new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '([^']+)'`),
    )
    if (importMatch) {
      filterImport = { name, from: importMatch[1] }
      blocks.push(`  protected getColumnFiltersConfig() {
    return ${name};
  }`)
    }
  }

  const filterMatch = mainServiceSrc.match(/filterConfig:\s*(\w+)/)
  if (filterMatch && !filterOverride) {
    const name = filterMatch[1]
    const importMatch = mainServiceSrc.match(
      new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '([^']+)'`),
    )
    if (importMatch) {
      filterImport = { name, from: importMatch[1] }
      blocks.push(`  protected getColumnFiltersConfig() {
    return ${name};
  }`)
    }
  }

  const bulkMatch = mainServiceSrc.match(
    /applyBulkAction\([^)]+\{[^}]*label:\s*'([^']+)'/,
  )
  if (bulkMatch) {
    blocks.push(`  protected getBulkLabel(): string {
    return '${bulkMatch[1]}';
  }`)
  }

  return { blocks, filterImport }
}

function injectLegacyHooks(serviceSrc, mainServiceSrc) {
  const { blocks, filterImport } = inferLegacyProtectedHooks(mainServiceSrc)
  if (!blocks.length) return serviceSrc

  let next = serviceSrc
  if (filterImport && !next.includes(`import { ${filterImport.name}`)) {
    next = next.replace(
      MAIN_API_BANNER,
      `${MAIN_API_BANNER}import { ${filterImport.name} } from '${filterImport.from}';\n`,
    )
  }

  if (next.includes('protected getSearchFields()') || next.includes('protected getColumnFiltersConfig()')) {
    return next
  }

  return next.replace(/\n}\s*$/, `\n\n${blocks.join('\n\n')}\n}\n`)
}

function renderMainApiService(meta, moduleId) {
  let out = renderPackageService(meta)
  out = replaceBaseImports(out, moduleId, meta.config)
  out = sanitizeMainApiServiceSource(out)
  out = injectLegacyHooks(out, meta.serviceSrc)
  return out
}

function renderMainApiController(meta, moduleId) {
  const { config } = meta
  const useAuto = !config.customController

  if (useAuto && moduleId === 'users') {
    return `${MAIN_API_BANNER}import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common';
import { PERMISSIONS } from '../config/permissions';
import { BaseUsersController } from '${localBaseControllerImport(config)}';
import { UsersService } from './users.service';

@Permissions(PERMISSIONS.USERS_VIEW)
@Controller(ADMIN_ROUTES.USERS)
export class UsersController extends BaseUsersController {
  constructor(service: UsersService) {
    super(service);
  }
}
`
  }

  let out = useAuto ? renderAutoPackageController(meta) : renderPackageController(meta)
  out = replaceBaseImports(out, moduleId, config)
  out = out.replace(/\nimport \{[^}]*\} from '@nestjs\/swagger';\n/g, '\n')
  if (!out.includes('@nestjs/swagger')) {
    out = out.replace(/\n@Api\w+\([^)]*\)\n/g, '\n')
  }
  if (!/\bAPP_HEADERS\b/.test(out.replace(/^import .+;\n?/gm, ''))) {
    out = out.replace(
      /import \{ APP_HEADERS, ADMIN_ROUTES \} from '\.\.\/config\/constants';/,
      "import { ADMIN_ROUTES } from '../config/constants';",
    )
  }
  if (!/\bRESOURCES\b/.test(out.replace(/^import .+;\n?/gm, ''))) {
    out = out.replace(
      /import \{ RESOURCES, ACTIONS, PERMISSIONS \} from '\.\.\/config\/permissions';/,
      "import { PERMISSIONS } from '../config/permissions';",
    )
  }
  return out
}

module.exports = {
  renderMainApiService,
  renderMainApiController,
  localBaseServiceImport,
  localBaseControllerImport,
  inferLegacyProtectedHooks,
}
